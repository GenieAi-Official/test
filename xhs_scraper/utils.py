from __future__ import annotations

import re
from collections import deque
from typing import Any, Dict, Iterable, Iterator, List, Optional, Tuple
from urllib.parse import urljoin, urlparse


_NOTE_ID_RE = re.compile(r"/explore/([^/?#]+)")
_USER_ID_RE = re.compile(r"/user/profile/([^/?#]+)")


def normalize_url(url: str) -> str:
    u = url.strip()
    if u.startswith("//"):
        u = "https:" + u
    if not u.startswith("http"):
        u = "https://" + u
    return u


def join_xhs(href: str) -> str:
    return normalize_url(urljoin("https://www.xiaohongshu.com", href))


def extract_note_id(url: str) -> str:
    m = _NOTE_ID_RE.search(url)
    if m:
        return m.group(1)
    p = urlparse(url)
    return (p.path.strip("/").split("/")[-1] or "unknown").split("?")[0]


def extract_user_id(url: str) -> str:
    m = _USER_ID_RE.search(url)
    if m:
        return m.group(1)
    p = urlparse(url)
    return (p.path.strip("/").split("/")[-1] or "unknown").split("?")[0]


def iter_dict_like(obj: Any) -> Iterator[Dict[str, Any]]:
    q: deque[Tuple[Any, int]] = deque([(obj, 0)])
    visited = 0
    while q and visited < 15000:
        cur, depth = q.popleft()
        visited += 1
        if depth > 8:
            continue
        if isinstance(cur, dict):
            yield cur
            for v in cur.values():
                if isinstance(v, (dict, list)):
                    q.append((v, depth + 1))
        elif isinstance(cur, list):
            for v in cur[:200]:
                if isinstance(v, (dict, list)):
                    q.append((v, depth + 1))


def find_best_note_payload(state: Any, note_id: str) -> Optional[Dict[str, Any]]:
    candidates: List[Dict[str, Any]] = []
    for d in iter_dict_like(state):
        keys = set(d.keys())
        if {"title", "desc"} & keys and ({"user", "author"} & keys or {"userId", "user_id"} & keys):
            candidates.append(d)
        if "noteId" in d and isinstance(d.get("noteId"), str):
            candidates.append(d)
        if "note_id" in d and isinstance(d.get("note_id"), str):
            candidates.append(d)

    def score(d: Dict[str, Any]) -> int:
        s = 0
        if str(d.get("noteId") or d.get("note_id") or d.get("id") or "") == note_id:
            s += 5
        if isinstance(d.get("title"), str) and d.get("title"):
            s += 2
        if isinstance(d.get("desc"), str) and d.get("desc"):
            s += 2
        if "imageList" in d or "images" in d:
            s += 1
        if "video" in d or "videoUrl" in d:
            s += 1
        return s

    if not candidates:
        return None
    candidates.sort(key=score, reverse=True)
    best = candidates[0]
    if score(best) == 0:
        return None
    return best


def first_str(*vals: Any) -> str:
    for v in vals:
        if isinstance(v, str) and v.strip():
            return v.strip()
    return ""


def collect_str_list(val: Any) -> List[str]:
    if not val:
        return []
    if isinstance(val, list):
        out: List[str] = []
        for x in val:
            if isinstance(x, str) and x:
                out.append(x)
            elif isinstance(x, dict):
                for k in ("url", "link", "src"):
                    if isinstance(x.get(k), str) and x.get(k):
                        out.append(x[k])
                        break
        return out
    if isinstance(val, str):
        return [val]
    return []

