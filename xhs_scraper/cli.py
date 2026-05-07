import argparse
import asyncio
import os
from pathlib import Path

from .export_md import MarkdownExporter
from .scraper import XhsScraper


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="xhs_scraper", description="小红书网页端抓取工具（Playwright）")
    p.add_argument("--user-data-dir", default=str(Path(".xhs_profile")), help="Playwright 持久化用户目录")
    p.add_argument("--headed", action="store_true", help="显示浏览器窗口（默认无头）")
    p.add_argument("--timeout-ms", type=int, default=60000, help="页面加载超时（毫秒）")
    p.add_argument("--delay", type=float, default=0.8, help="抓取节流延迟（秒）")

    sub = p.add_subparsers(dest="cmd", required=True)

    login = sub.add_parser("login", help="打开浏览器进行手动登录并保存会话")
    login.add_argument("--url", default="https://www.xiaohongshu.com", help="登录页 URL")

    search = sub.add_parser("search", help="关键词搜索抓取")
    search.add_argument("keyword", help="搜索关键词")
    search.add_argument("--limit", type=int, default=30, help="最多抓取多少条笔记链接")
    search.add_argument("--out", default="./out", help="输出目录")
    search.add_argument("--download-media", action="store_true", help="下载图片到本地并在 Markdown 中引用")

    note = sub.add_parser("note", help="抓取单条笔记")
    note.add_argument("url", help="笔记分享链接")
    note.add_argument("--out", default="./out", help="输出目录")
    note.add_argument("--download-media", action="store_true", help="下载图片到本地并在 Markdown 中引用")

    user = sub.add_parser("user", help="抓取用户主页的笔记列表并批量抓取详情")
    user.add_argument("url", help="用户主页链接")
    user.add_argument("--limit", type=int, default=30, help="最多抓取多少条笔记详情")
    user.add_argument("--out", default="./out", help="输出目录")
    user.add_argument("--download-media", action="store_true", help="下载图片到本地并在 Markdown 中引用")

    return p


async def _cmd_login(args: argparse.Namespace) -> int:
    scraper = XhsScraper(
        user_data_dir=Path(args.user_data_dir),
        headless=False,
        timeout_ms=args.timeout_ms,
        delay=args.delay,
    )
    async with scraper:
        await scraper.open_login(url=args.url)
        input("完成登录后按回车键退出...")
    return 0


def _ensure_out(out_dir: str) -> Path:
    p = Path(out_dir)
    p.mkdir(parents=True, exist_ok=True)
    return p


async def _cmd_search(args: argparse.Namespace) -> int:
    out_dir = _ensure_out(args.out)
    exporter = MarkdownExporter(out_dir=out_dir, download_media=args.download_media)
    scraper = XhsScraper(
        user_data_dir=Path(args.user_data_dir),
        headless=not args.headed,
        timeout_ms=args.timeout_ms,
        delay=args.delay,
    )
    async with scraper:
        note_urls = await scraper.search_note_urls(keyword=args.keyword, limit=args.limit)
        notes = await scraper.fetch_notes(note_urls)
        await exporter.export_notes(notes, scraper.request)
    return 0


async def _cmd_note(args: argparse.Namespace) -> int:
    out_dir = _ensure_out(args.out)
    exporter = MarkdownExporter(out_dir=out_dir, download_media=args.download_media)
    scraper = XhsScraper(
        user_data_dir=Path(args.user_data_dir),
        headless=not args.headed,
        timeout_ms=args.timeout_ms,
        delay=args.delay,
    )
    async with scraper:
        note = await scraper.fetch_note(args.url)
        await exporter.export_notes([note], scraper.request)
    return 0


async def _cmd_user(args: argparse.Namespace) -> int:
    out_dir = _ensure_out(args.out)
    exporter = MarkdownExporter(out_dir=out_dir, download_media=args.download_media)
    scraper = XhsScraper(
        user_data_dir=Path(args.user_data_dir),
        headless=not args.headed,
        timeout_ms=args.timeout_ms,
        delay=args.delay,
    )
    async with scraper:
        note_urls = await scraper.user_note_urls(profile_url=args.url, limit=args.limit)
        notes = await scraper.fetch_notes(note_urls[: args.limit])
        await exporter.export_notes(notes, scraper.request)
    return 0


def main(argv: list[str] | None = None) -> int:
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    p = _build_parser()
    args = p.parse_args(argv)
    if args.cmd == "login":
        return asyncio.run(_cmd_login(args))
    if args.cmd == "search":
        return asyncio.run(_cmd_search(args))
    if args.cmd == "note":
        return asyncio.run(_cmd_note(args))
    if args.cmd == "user":
        return asyncio.run(_cmd_user(args))
    raise SystemExit(f"unknown cmd: {args.cmd}")
