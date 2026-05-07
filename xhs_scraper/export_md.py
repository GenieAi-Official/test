from __future__ import annotations

import re
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Optional
from urllib.parse import urlparse

from playwright.async_api import APIRequestContext

from .models import Note


def _safe_filename(s: str) -> str:
    s = s.strip()
    s = re.sub(r"[\\/:*?\"<>|]+", "_", s)
    s = re.sub(r"\s+", " ", s)
    return s[:120] if len(s) > 120 else s


class MarkdownExporter:
    def __init__(self, out_dir: Path, download_media: bool = False) -> None:
        self.out_dir = out_dir
        self.download_media = download_media
        self.notes_dir = self.out_dir / "notes"
        self.media_dir = self.out_dir / "media"
        self.notes_dir.mkdir(parents=True, exist_ok=True)
        self.media_dir.mkdir(parents=True, exist_ok=True)

    async def export_notes(self, notes: List[Note], request: APIRequestContext) -> None:
        index_lines: List[str] = []
        index_lines.append("# 抓取结果")
        index_lines.append("")
        index_lines.append(f"- 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        index_lines.append(f"- 条目数量：{len(notes)}")
        index_lines.append("")

        for n in notes:
            note_path = await self._write_note(n, request)
            rel = note_path.relative_to(self.out_dir)
            title = n.title.strip() or n.note_id
            index_lines.append(f"- [{_safe_filename(title)}]({rel.as_posix()})")

        (self.out_dir / "index.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")

    async def _write_note(self, note: Note, request: APIRequestContext) -> Path:
        slug = _safe_filename(note.title) or note.note_id
        filename = f"{note.note_id}_{slug}.md"
        out_path = self.notes_dir / filename

        lines: List[str] = []
        lines.append(f"# {note.title.strip() or note.note_id}")
        lines.append("")
        lines.append(f"- url: {note.url}")
        if note.author_name or note.author_id:
            lines.append(f"- 作者: {note.author_name} ({note.author_id})".strip())
        if note.publish_time:
            lines.append(f"- 时间: {note.publish_time}")
        if note.stats:
            lines.append(f"- 数据: {note.stats}")
        if note.tags:
            lines.append(f"- 话题: {', '.join(note.tags)}")
        lines.append("")

        if note.desc:
            lines.append("## 正文")
            lines.append("")
            lines.append(note.desc.strip())
            lines.append("")

        if note.images:
            lines.append("## 图片")
            lines.append("")
            if self.download_media:
                local_paths = await self._download_images(note, request)
                for p in local_paths:
                    rel = p.relative_to(self.out_dir)
                    lines.append(f"![]({rel.as_posix()})")
            else:
                for u in note.images:
                    lines.append(f"- {u}")
            lines.append("")

        if note.video:
            lines.append("## 视频")
            lines.append("")
            lines.append(note.video)
            lines.append("")

        raw_path = out_path.with_suffix(".json")
        raw_path.write_text(
            _json_dumps(asdict(note), indent=2),
            encoding="utf-8",
        )

        out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        return out_path

    async def _download_images(self, note: Note, request: APIRequestContext) -> List[Path]:
        note_media_dir = self.media_dir / note.note_id
        note_media_dir.mkdir(parents=True, exist_ok=True)
        out: List[Path] = []
        for idx, url in enumerate(note.images, start=1):
            ext = _guess_ext(url) or "jpg"
            fp = note_media_dir / f"{idx:03d}.{ext}"
            if fp.exists():
                out.append(fp)
                continue
            try:
                resp = await request.get(url)
                if not resp.ok:
                    continue
                fp.write_bytes(await resp.body())
                out.append(fp)
            except Exception:
                continue
        return out


def _guess_ext(url: str) -> Optional[str]:
    try:
        p = urlparse(url)
        suffix = Path(p.path).suffix.lower().lstrip(".")
        if suffix in {"jpg", "jpeg", "png", "webp", "gif"}:
            return "jpg" if suffix == "jpeg" else suffix
    except Exception:
        return None
    return None


def _json_dumps(obj, indent: int = 2) -> str:
    import json

    return json.dumps(obj, ensure_ascii=False, indent=indent, sort_keys=True)

