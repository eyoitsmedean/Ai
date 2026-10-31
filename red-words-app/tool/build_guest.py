#!/usr/bin/env python3
"""Copy the WEB seed pack into guest/pack.js. Never invent a saying."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "sayings.json"
DST = ROOT / "guest" / "pack.js"


def main() -> None:
    pack = json.loads(SRC.read_text(encoding="utf-8"))
    if pack.get("count") != 100:
        raise SystemExit(f"expected 100 sayings, got {pack.get('count')}")
    if pack["sayings"][0]["id"] != "anxiety-mt-6-34":
        raise SystemExit("first saying must be anxiety-mt-6-34")
    DST.write_text(
        "window.RED_WORDS_PACK = "
        + json.dumps(pack, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {DST} ({DST.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
