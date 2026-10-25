"""Checks every scheduled post and asset against X's limits before scheduling.

Reads posts.json and publish.json (both written by build.py).
Run: python3 launch/build.py && python3 launch/preflight.py
"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
FFPROBE = "ffprobe"

# twitter-text v3: these code point ranges weigh 1, everything else 2; a URL is 23.
LIGHT = [(0, 4351), (8192, 8205), (8208, 8223), (8242, 8247)]
URL = re.compile(r"https?://\S+")


def weighted(text):
    text = unicodedata.normalize("NFC", text)
    n = 0
    for m in URL.finditer(text):
        n += 23
    text = URL.sub("", text)
    for ch in text:
        cp = ord(ch)
        if cp in (0xFE0F, 0x200D):        # emoji variation selector / joiner
            continue
        n += 1 if any(a <= cp <= b for a, b in LIGHT) else 2
    return n


def probe(path):
    out = subprocess.run([FFPROBE, "-v", "error", "-show_entries",
                          "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt",
                          "-of", "json", str(path)], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


posts = json.loads((HERE / "posts.json").read_text())
assets = json.loads((HERE / "publish.json").read_text())
problems, notes = [], []

for p in posts["posts"]:
    w = weighted(p["text"])
    where = f'{p["date"]} · {p["title"]} · {p["part"]}'
    if w > 280:
        problems.append(f"{where}: {w} weighted chars (over 280; needs Premium and shows 'Show more')")
    if "[" in p["text"] and "]" in p["text"]:
        notes.append(f"{where}: placeholder left in text: {re.findall(r'\[[^\]]+\]', p['text'])}")
    for name in p["assets"]:
        if "a/" + name not in assets:
            problems.append(f"{where}: asset {name} missing from publish.json")
    imgs = [a for a in p["assets"] if a.endswith(".png") or a.endswith(".jpg")]
    vids = [a for a in p["assets"] if a.endswith(".mp4")]
    if len(imgs) > 4 or (vids and (imgs or len(vids) > 1)):
        problems.append(f"{where}: {len(imgs)} images + {len(vids)} videos in one post (X allows 4 images or 1 video)")

for name, alt in posts["alt"].items():
    if len(alt) > 1000:
        problems.append(f"alt text for {name}: {len(alt)} chars (X caps alt text at 1,000)")

rows = []
for key, src in sorted(assets.items()):
    path = Path(src)
    if not path.exists():
        problems.append(f"{key}: file missing at {src}")
        continue
    size = path.stat().st_size
    if path.suffix == ".png":
        from PIL import Image
        with Image.open(path) as im:
            wh = im.size
        if size > 5 * 1024 * 1024:
            problems.append(f"{path.name}: {size / 1e6:.1f} MB (X caps images at 5 MB)")
        if path.name.replace(".png", "") not in posts["alt"] and path.name not in posts["alt"]:
            notes.append(f"{path.name}: no alt text drafted")
        rows.append(f"  {path.name:38s} {wh[0]}x{wh[1]:<6} {size / 1e6:5.2f} MB")
    elif path.suffix == ".mp4":
        info = probe(path)
        dur = float(info["format"]["duration"])
        v = next(s for s in info["streams"] if s["codec_type"] == "video")
        a = [s for s in info["streams"] if s["codec_type"] == "audio"]
        num, den = map(int, v["r_frame_rate"].split("/"))
        fps = num / den
        if dur > 140:
            problems.append(f"{path.name}: {dur:.1f}s (X caps uploads at 2:20)")
        if v["codec_name"] != "h264" or v.get("pix_fmt") != "yuv420p":
            problems.append(f"{path.name}: {v['codec_name']}/{v.get('pix_fmt')} (use H.264, yuv420p)")
        if fps > 60:
            problems.append(f"{path.name}: {fps:.0f} fps (X caps at 60)")
        if not a or a[0]["codec_name"] != "aac":
            problems.append(f"{path.name}: audio is {a[0]['codec_name'] if a else 'missing'} (use AAC)")
        if size > 512 * 1024 * 1024:
            problems.append(f"{path.name}: {size / 1e6:.0f} MB (X caps at 512 MB)")
        rows.append(f"  {path.name:38s} {v['width']}x{v['height']:<6} {size / 1e6:5.2f} MB  {dur:5.1f}s {fps:.0f}fps {v['codec_name']}+{a[0]['codec_name'] if a else '-'}")

longest = max(posts["posts"], key=lambda p: weighted(p["text"]))
print(f"{len(posts['posts'])} post texts, {len(assets)} assets")
print(f"longest post: {weighted(longest['text'])} weighted chars ({longest['date']} · {longest['part']})")
print("\n".join(rows))
for n in notes:
    print("note:", n)
for p in problems:
    print("PROBLEM:", p)
print("OK" if not problems else f"{len(problems)} problem(s)")
sys.exit(1 if problems else 0)
