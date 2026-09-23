#!/usr/bin/env python3
"""Build the public review archive from downloaded source-page HTML.

The source pages are fetched separately so this script stays deterministic and
can be rerun after refreshing the files in /tmp.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LEGACY_SOURCE = "https://myeduprep.com/testimonials-en/"


def clean_markup(value: str) -> str:
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def category_for(value: str) -> str:
    lowered = value.lower()
    if re.search(r"interview|인터뷰|면접", lowered):
        return "인터뷰"
    if re.search(r"ielts|academic english|아이엘츠|토플|영어|speaking|pronunciation", lowered):
        return "Academic English"
    if re.search(r"international school|국제학교|school evaluation", lowered):
        return "국제학교"
    if re.search(r"parent|학부모|자녀|아이의", lowered):
        return "학부모 컨설팅"
    if re.search(r"edit|essay|personal statement|sop|cv|자소서|첨삭|에세이|서류", lowered):
        return "첨삭"
    return "대학 · 대학원"


def legacy_reviews() -> list[dict]:
    files = [Path("/tmp/mep-testimonials.html")] + [Path(f"/tmp/mep-page{i}.html") for i in range(2, 12)]
    reviews: list[dict] = []
    seen: set[str] = set()
    pattern = re.compile(
        r'<div class="sp-testimonial-pro-item[^>]*post-(?P<id>\d+)[^>]*>(?P<body>.*?)(?=<div class="sp-testimonial-pro-item|<div class="filter-pagination|<div class="sp-testimonial-ajax-pagination|\Z)',
        re.S,
    )
    for path in files:
        if not path.exists():
            continue
        source = path.read_text(encoding="utf-8", errors="ignore")
        for match in pattern.finditer(source):
            review_id = match.group("id")
            if review_id in seen:
                continue
            body = match.group("body")
            title_match = re.search(r'class="sp-tpro-testimonial-title[^>]*>(.*?)</h3>', body, re.S)
            text_match = re.search(r'class="tpro-testimonial-text">(.*?)</div>', body, re.S)
            name_match = re.search(r'class="tpro-client-name">(.*?)</h4>', body, re.S)
            institution_match = re.search(r'class="tpro-client-designation-company">(.*?)</div>', body, re.S)
            title = clean_markup(title_match.group(1) if title_match else "My EDU Prep 후기")
            text = clean_markup(text_match.group(1) if text_match else "")
            name = clean_markup(name_match.group(1) if name_match else "수강생")
            institution = clean_markup(institution_match.group(1) if institution_match else "")
            if not text:
                continue
            if len(text) > 420:
                text = text[:417].rstrip() + "…"
            reviews.append({
                "id": f"legacy-{review_id}",
                "title": title,
                "text": text,
                "displayName": name,
                "institution": institution,
                "category": category_for(f"{title} {text} {institution}"),
                "source": "My EDU Prep",
                "rating": None,
                "date": "",
                "featured": False,
                "anonymous": True,
                "url": LEGACY_SOURCE,
            })
            seen.add(review_id)
    return reviews


def decode_js_string(value: str) -> str:
    try:
        return json.loads(f'"{value}"')
    except json.JSONDecodeError:
        return value


def naver_reviews() -> list[dict]:
    reviews: list[dict] = []
    seen: set[str] = set()
    pattern = re.compile(
        r'servicename\s*:\s*"블로그",\s*title\s*:\s*"(?P<title>(?:\\.|[^"\\])*)",\s*source\s*:\s*"(?P<url>[^"]+)"',
        re.S,
    )
    for page in range(1, 5):
        path = Path(f"/tmp/naver{page}.html")
        if not path.exists():
            continue
        source = path.read_text(encoding="utf-8", errors="ignore")
        for match in pattern.finditer(source):
            url = html.unescape(match.group("url"))
            log_match = re.search(r"/(\d+)$", url)
            if not log_match:
                continue
            log_no = log_match.group(1)
            if log_no in seen:
                continue
            title = decode_js_string(match.group("title"))
            title = re.sub(r"^\[공유\]\s*", "", title).strip()
            reviews.append({
                "id": f"naver-{log_no}",
                "title": title,
                "text": "네이버 블로그에 공개된 학생·학부모 후기입니다. 자세한 경험은 원문에서 확인하실 수 있습니다.",
                "displayName": "My EDU Prep 후기",
                "institution": "네이버 블로그",
                "category": category_for(title),
                "source": "Naver Blog",
                "rating": None,
                "date": "",
                "featured": False,
                "anonymous": True,
                "url": url,
            })
            seen.add(log_no)
    return reviews


def main() -> None:
    reviews = legacy_reviews() + naver_reviews()
    payload = "// Generated from the public My EDU Prep and Naver review archives.\n"
    payload += "window.MEP_IMPORTED_REVIEWS_KO = "
    payload += json.dumps(reviews, ensure_ascii=False, separators=(",", ":"))
    payload += ";\n"
    output = ROOT / "reviews-imported.js"
    output.write_text(payload, encoding="utf-8")
    print(json.dumps({"output": str(output), "legacy": len(legacy_reviews()), "naver": len(naver_reviews()), "total": len(reviews)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
