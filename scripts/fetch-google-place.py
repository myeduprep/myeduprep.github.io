#!/usr/bin/env python3
"""Fetch the public Google Maps place payload referenced by its HTML shell."""

import html
import re
from pathlib import Path
from urllib.request import Request, urlopen


source = Path("/tmp/google-mep.html").read_text(encoding="utf-8", errors="ignore")
match = re.search(r'<link href="([^"]*?/maps/preview/place\?[^"]+)" as="fetch"', source)
if not match:
    raise SystemExit("Google Maps place payload URL was not found")
url = "https://www.google.com" + html.unescape(match.group(1))
request = Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7"})
with urlopen(request, timeout=30) as response:
    payload = response.read()
Path("/tmp/google-place-payload.txt").write_bytes(payload)
print(len(payload))
