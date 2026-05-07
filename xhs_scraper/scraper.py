from __future__ import annotations

import asyncio
from dataclasses import asdict
from pathlib import Path
from typing import Any, Iterable, List, Optional, Sequence
from urllib.parse import quote

from playwright.async_api import APIRequestContext, BrowserContext, Page, async_playwright

from .models import Note
from .utils import (
    collect_str_list,
    extract_note_id,
    extract_user_id,
    find_best_note_payload,
    first_str,
    join_xhs,
    normalize_url,
)


class XhsScraper:
    def __init__(
        self,
        user_data_dir: Path,
        headless: bool = True,
        timeout_ms: int = 60000,
        delay: float = 0.8,
    ) -> None:
        self.user_data_dir = user_data_dir
        self.headless = headless
        self.timeout_ms = timeout_ms
        self.delay = delay
        self._playwright = None
        self._context: BrowserContext | None = None
        self._request: APIRequestContext | None = None

    @property
    def request(self) -> APIRequestContext:
        if not self._request:
            raise RuntimeError("request context not initialized")
        return self._request

    async def __aenter__(self) -> "XhsScraper":
        self.user_data_dir.mkdir(parents=True, exist_ok=True)
        self._playwright = await async_playwright().start()
        self._context = await self._playwright.chromium.launch_persistent_context(
            user_data_dir=str(self.user_data_dir),
            headless=self.headless,
            viewport={"width": 1280, "height": 800},
        )
        self._context.set_default_timeout(self.timeout_ms)
        self._request = self._context.request
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        if self._context:
            await self._context.close()
        if self._playwright:
            await self._playwright.stop()
        self._context = None
        self._playwright = None
        self._request = None

    async def _new_page(self) -> Page:
        if not self._context:
            raise RuntimeError("browser context not initialized")
        page = await self._context.new_page()
        page.set_default_timeout(self.timeout_ms)
        return page

    async def open_login(self, url: str = "https://www.xiaohongshu.com") -> None:
        page = await self._new_page()
        await page.goto(normalize_url(url), wait_until="domcontentloaded")
        await page.bring_to_front()

    async def search_note_urls(self, keyword: str, limit: int = 30) -> List[str]:
        kw = keyword.strip()
        if not kw:
            return []

        url = f"https://www.xiaohongshu.com/search_result?keyword={quote(kw)}"
        page = await self._new_page()
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(int(self.delay * 1000))

        seen: set[str] = set()
        last_count = 0
        stable_rounds = 0

        while len(seen) < limit and stable_rounds < 6:
            urls = await self._extract_note_urls_from_page(page)
            for u in urls:
                if len(seen) >= limit:
                    break
                seen.add(u)

            if len(seen) == last_count:
                stable_rounds += 1
            else:
                stable_rounds = 0
                last_count = len(seen)

            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(int(max(0.8, self.delay) * 1000))

        return list(seen)[:limit]

    async def user_note_urls(self, profile_url: str, limit: int = 30) -> List[str]:
        url = normalize_url(profile_url)
        page = await self._new_page()
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(int(self.delay * 1000))

        seen: set[str] = set()
        last_count = 0
        stable_rounds = 0
        while len(seen) < limit and stable_rounds < 6:
            urls = await self._extract_note_urls_from_page(page)
            for u in urls:
                if len(seen) >= limit:
                    break
                seen.add(u)

            if len(seen) == last_count:
                stable_rounds += 1
            else:
                stable_rounds = 0
                last_count = len(seen)

            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(int(max(0.8, self.delay) * 1000))

        return list(seen)[:limit]

    async def _extract_note_urls_from_page(self, page: Page) -> List[str]:
        hrefs: List[str] = await page.evaluate(
            """() => {
            const anchors = Array.from(document.querySelectorAll('a[href]'));
            const hrefs = [];
            for (const a of anchors) {
              const href = a.getAttribute('href') || '';
              if (href.includes('/explore/')) hrefs.push(href);
            }
            return hrefs;
          }"""
        )
        out: List[str] = []
        for h in hrefs:
            try:
                u = join_xhs(h)
            except Exception:
                continue
            out.append(u.split("?")[0])
        return out

    async def fetch_notes(self, urls: Sequence[str], concurrency: int = 3) -> List[Note]:
        sem = asyncio.Semaphore(max(1, concurrency))

        async def run(u: str) -> Note:
            async with sem:
                note = await self.fetch_note(u)
                await asyncio.sleep(self.delay)
                return note

        tasks = [asyncio.create_task(run(u)) for u in urls]
        return await asyncio.gather(*tasks)

    async def fetch_note(self, url: str) -> Note:
        note_url = normalize_url(url)
        note_id = extract_note_id(note_url)
        page = await self._new_page()
        await page.goto(note_url, wait_until="domcontentloaded")
        await page.wait_for_timeout(int(self.delay * 1000))

        state = await self._try_get_page_state(page)
        note = Note(note_id=note_id, url=note_url, raw={"state": state} if state else {})
        payload = find_best_note_payload(state, note_id) if state else None
        if payload:
            self._fill_note_from_payload(note, payload)
        else:
            await self._fill_note_from_dom(note, page)
        return note

    async def _try_get_page_state(self, page: Page) -> Any:
        return await page.evaluate(
            """() => {
            const direct = globalThis.__INITIAL_STATE__ || globalThis.__NUXT__ || globalThis.__NEXT_DATA__ || null;
            if (direct) return direct;
            const el = document.getElementById('__NEXT_DATA__');
            if (el && el.textContent) {
              try { return JSON.parse(el.textContent); } catch (e) { return null; }
            }
            return null;
          }"""
        )

    def _fill_note_from_payload(self, note: Note, payload: dict) -> None:
        note.title = first_str(payload.get("title"), payload.get("name"))
        note.desc = first_str(payload.get("desc"), payload.get("content"), payload.get("noteText"))

        user = payload.get("user") or payload.get("author") or {}
        if isinstance(user, dict):
            note.author_name = first_str(user.get("nickname"), user.get("name"))
            note.author_id = first_str(user.get("userId"), user.get("user_id"), user.get("id"))

        note.publish_time = first_str(payload.get("time"), payload.get("timestamp"), payload.get("publishTime"))

        images = []
        for k in ("imageList", "images", "image_list", "pics"):
            images.extend(collect_str_list(payload.get(k)))
        if not images:
            image_list = payload.get("imageList") or payload.get("image_list") or []
            if isinstance(image_list, list):
                for item in image_list:
                    if isinstance(item, dict):
                        images.extend(collect_str_list(item.get("url")))
                        images.extend(collect_str_list(item.get("urlDefault")))
                        images.extend(collect_str_list(item.get("url_default")))
        note.images = [normalize_url(u) for u in images if isinstance(u, str)]

        video = payload.get("video") or payload.get("videoUrl") or payload.get("video_url")
        if isinstance(video, dict):
            note.video = first_str(video.get("url"), video.get("h264Url"), video.get("h265Url"))
        elif isinstance(video, str):
            note.video = video

        tags: List[str] = []
        for k in ("tags", "tagList", "tag_list", "topics"):
            v = payload.get(k)
            if isinstance(v, list):
                for t in v:
                    if isinstance(t, str) and t:
                        tags.append(t)
                    elif isinstance(t, dict):
                        name = first_str(t.get("name"), t.get("title"))
                        if name:
                            tags.append(name)
        note.tags = list(dict.fromkeys(tags))

        for k in ("likedCount", "collectedCount", "commentCount", "shareCount", "viewCount"):
            if k in payload:
                note.stats[k] = payload.get(k)
        interact = payload.get("interactInfo") or payload.get("interact_info") or {}
        if isinstance(interact, dict):
            for k in ("likedCount", "collectedCount", "commentCount", "shareCount", "viewCount"):
                if k in interact and k not in note.stats:
                    note.stats[k] = interact.get(k)

    async def _fill_note_from_dom(self, note: Note, page: Page) -> None:
        title = await self._safe_text(page, "h1")
        note.title = title
        desc = await self._safe_text(page, "main")
        note.desc = desc

    async def _safe_text(self, page: Page, selector: str) -> str:
        try:
            el = await page.query_selector(selector)
            if not el:
                return ""
            text = (await el.inner_text()) or ""
            return text.strip()
        except Exception:
            return ""

