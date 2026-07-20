#!/usr/bin/env python3
"""Run the AI landscape automations from GitHub Actions."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parent
SHANGHAI = ZoneInfo("Asia/Shanghai")
NOTION_API_VERSION = "2026-03-11"
URL_RE = re.compile(r"https?://[^\s)>\]]+")
OPAQUE_CITATION_RE = re.compile(r"\bcite\s+turn\w+|turn\d+(?:search|view|fetch)\d+", re.I)


class ValidationError(RuntimeError):
    pass


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def env_or_default(name: str, default: str) -> str:
    return os.getenv(name, "").strip() or default


def read_prompt(name: str) -> str:
    return (ROOT / "prompts" / f"{name}.md").read_text(encoding="utf-8").strip()


def cjk_count(text: str) -> int:
    return sum("\u4e00" <= char <= "\u9fff" for char in text)


def validate_daily(text: str) -> list[str]:
    errors: list[str] = []
    stripped = text.strip()
    lines = [line.strip() for line in stripped.splitlines() if line.strip()]
    bullet_lines = [line for line in lines if re.match(r"^(?:[-*•]|\d+[.)])\s*", line)]
    count = cjk_count(stripped)

    if not lines or not lines[-1].startswith("【行动建议】"):
        errors.append("最后一个非空行必须以【行动建议】开头")
    if sum(line.startswith("【行动建议】") for line in lines) != 1:
        errors.append("必须且只能有一条【行动建议】")
    if not 1 <= len(bullet_lines) <= 5:
        errors.append("正文必须包含1到5条项目符号")
    for index, line in enumerate(bullet_lines, start=1):
        for field in ("【发生了什么】", "【为什么重要】", "【来源】"):
            if field not in line:
                errors.append(f"第{index}条缺少{field}")
    if not 300 <= count <= 600:
        errors.append(f"中文字符数必须为300到600，当前为{count}")
    if not URL_RE.search(stripped):
        errors.append("至少需要一个可点击来源URL")
    if OPAQUE_CITATION_RE.search(stripped):
        errors.append("不得包含内部引用标记")
    return errors


def validate_weekly(text: str) -> list[str]:
    errors: list[str] = []
    stripped = text.strip()
    if stripped.count("对比上周：") < 7:
        errors.append("至少七个主章节需要包含“对比上周：”")
    focus_pos = stripped.find("本周最值得关注的方向")
    refs_pos = stripped.rfind("引用链接汇总（去重）")
    if focus_pos < 0:
        errors.append("缺少“本周最值得关注的方向”")
    if refs_pos < 0:
        errors.append("缺少“引用链接汇总（去重）”")
    if focus_pos >= 0 and refs_pos >= 0 and focus_pos > refs_pos:
        errors.append("重点方向章节必须位于引用汇总之前")
    if len(set(URL_RE.findall(stripped))) < 10:
        errors.append("周报来源URL不足10个")
    if OPAQUE_CITATION_RE.search(stripped):
        errors.append("不得包含内部引用标记")
    return errors


def generate_with_search(prompt: str, *, model: str, effort: str) -> str:
    from openai import OpenAI

    response = OpenAI().responses.create(
        model=model,
        reasoning={"effort": effort},
        tools=[
            {
                "type": "web_search",
                "user_location": {
                    "type": "approximate",
                    "country": "CN",
                    "city": "Shanghai",
                    "region": "Shanghai",
                },
            }
        ],
        include=["web_search_call.action.sources"],
        input=prompt,
    )
    text = response.output_text.strip()
    if not text:
        raise RuntimeError("OpenAI returned an empty response")
    return text


def generate_validated(
    prompt: str,
    *,
    model: str,
    effort: str,
    validator: Any,
) -> str:
    text = generate_with_search(prompt, model=model, effort=effort)
    errors = validator(text)
    if not errors:
        return text

    correction = (
        "\n\n上一次输出未通过机器校验。请完整重写，而不是解释。必须修复：\n- "
        + "\n- ".join(errors)
        + "\n\n上一次输出：\n"
        + text
    )
    text = generate_with_search(prompt + correction, model=model, effort=effort)
    errors = validator(text)
    if errors:
        raise ValidationError("; ".join(errors))
    return text


def notion_request(
    method: str,
    path: str,
    *,
    token: str,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload else None
    request = urllib.request.Request(
        f"https://api.notion.com/v1{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Notion-Version": NOTION_API_VERSION,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Notion API {exc.code} for {path}: {body}") from exc


def list_child_pages(parent_page_id: str, *, token: str) -> list[tuple[str, str]]:
    pages: list[tuple[str, str]] = []
    cursor: str | None = None
    while True:
        suffix = "?page_size=100"
        if cursor:
            suffix += f"&start_cursor={cursor}"
        result = notion_request(
            "GET", f"/blocks/{parent_page_id}/children{suffix}", token=token
        )
        for block in result.get("results", []):
            if block.get("type") == "child_page":
                pages.append((block["child_page"].get("title", ""), block["id"]))
        if not result.get("has_more"):
            return pages
        cursor = result.get("next_cursor")


def choose_previous_report(
    pages: list[tuple[str, str]], *, before_date: str
) -> tuple[str, str] | None:
    candidates: list[tuple[str, str, str]] = []
    for title, page_id in pages:
        match = re.fullmatch(r"AI Landscape Report - (\d{4}-\d{2}-\d{2})", title.strip())
        if match and match.group(1) < before_date:
            candidates.append((match.group(1), title, page_id))
    if not candidates:
        return None
    _, title, page_id = max(candidates)
    return title, page_id


def fetch_previous_report(parent_page_id: str, *, token: str, before_date: str) -> str:
    selected = choose_previous_report(
        list_child_pages(parent_page_id, token=token), before_date=before_date
    )
    if not selected:
        raise RuntimeError("No previous AI Landscape Report page found under the parent")
    title, page_id = selected
    result = notion_request("GET", f"/pages/{page_id}/markdown", token=token)
    markdown = result.get("markdown", "").strip()
    if not markdown:
        raise RuntimeError(f"Previous report is empty: {title}")
    return markdown


def create_notion_report(
    *, parent_page_id: str, token: str, title: str, markdown: str
) -> str:
    result = notion_request(
        "POST",
        "/pages",
        token=token,
        payload={
            "parent": {"page_id": parent_page_id},
            "properties": {
                "title": {
                    "title": [
                        {"type": "text", "text": {"content": title}}
                    ]
                }
            },
            "markdown": markdown,
        },
    )
    url = result.get("url", "")
    if not url:
        raise RuntimeError("Notion page was created without a returned URL")
    return url


def append_step_summary(markdown: str) -> None:
    path = os.getenv("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as summary:
            summary.write(markdown.rstrip() + "\n")


def set_github_output(name: str, value: str) -> None:
    path = os.getenv("GITHUB_OUTPUT")
    if path:
        with open(path, "a", encoding="utf-8") as output:
            output.write(f"{name}={value}\n")


def send_daily_webhook(text: str) -> None:
    url = os.getenv("DAILY_WEBHOOK_URL", "").strip()
    if not url:
        return
    kind = os.getenv("DAILY_WEBHOOK_KIND", "generic").strip().lower()
    if kind == "feishu":
        payload: dict[str, Any] = {"msg_type": "text", "content": {"text": text}}
    else:
        payload = {"text": text}
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            if response.status >= 300:
                raise RuntimeError(f"Webhook returned HTTP {response.status}")
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Webhook returned HTTP {exc.code}") from exc


def run_daily(now: datetime) -> None:
    prompt = read_prompt("daily").replace("{{NOW}}", now.isoformat())
    model = env_or_default("DAILY_OPENAI_MODEL", "gpt-5.4")
    text = generate_validated(
        prompt,
        model=model,
        effort=env_or_default("DAILY_REASONING_EFFORT", "medium"),
        validator=validate_daily,
    )
    print(text)
    append_step_summary(text)
    send_daily_webhook(text)


def run_weekly(now: datetime) -> None:
    token = require_env("NOTION_API_KEY")
    parent_page_id = require_env("NOTION_PARENT_PAGE_ID")
    report_date = now.date().isoformat()
    previous = fetch_previous_report(
        parent_page_id, token=token, before_date=report_date
    )
    prompt = (
        read_prompt("weekly")
        .replace("{{REPORT_DATE}}", report_date)
        .replace("{{NOW}}", now.isoformat())
        .replace("{{PREVIOUS_REPORT}}", previous[:80000])
    )
    text = generate_validated(
        prompt,
        model=env_or_default("WEEKLY_OPENAI_MODEL", "gpt-5.5"),
        effort=env_or_default("WEEKLY_REASONING_EFFORT", "high"),
        validator=validate_weekly,
    )
    title = f"AI Landscape Report - {report_date}"
    url = create_notion_report(
        parent_page_id=parent_page_id,
        token=token,
        title=title,
        markdown=text,
    )
    print(url)
    append_step_summary(f"## {title}\n\nNotion page: {url}")
    set_github_output("notion_url", url)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("task", choices=("daily", "weekly"))
    args = parser.parse_args()
    require_env("OPENAI_API_KEY")
    now = datetime.now(SHANGHAI)
    if args.task == "daily":
        run_daily(now)
    else:
        run_weekly(now)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
