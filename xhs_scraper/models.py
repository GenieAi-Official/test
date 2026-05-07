from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Note:
    note_id: str
    url: str
    title: str = ""
    desc: str = ""
    author_name: str = ""
    author_id: str = ""
    publish_time: str = ""
    images: List[str] = field(default_factory=list)
    video: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    stats: Dict[str, Any] = field(default_factory=dict)
    raw: Dict[str, Any] = field(default_factory=dict)
