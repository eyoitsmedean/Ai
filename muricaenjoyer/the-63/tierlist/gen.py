"""Generate the two tier-list HTML pages (portrait 1600x2000, wide 1600x900) from parks.json."""
import json, html, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "parks.json")
d = json.load(open(DATA))
parks = sorted(d["parks"], key=lambda p: p["rank"])
assert len(parks) == 63 and [p["rank"] for p in parks] == list(range(1, 64))

SPECIAL = {
    "National Park of American Samoa": "American Samoa",
    "Redwood National and State Parks": "Redwood",
    "Haleakala National Park": "Haleakalā",
    "Hawaii Volcanoes National Park": "Hawaiʻi Volcanoes",
}
def short(name):
    if name in SPECIAL:
        return SPECIAL[name]
    for suf in (" National Park and Preserve", " National Park"):
        if name.endswith(suf):
            return name[: -len(suf)]
    raise ValueError(name)

TIERS = [
    ("S", "#FF7F7F", "Pilgrimage"),
    ("A", "#FFBF7F", "Plan the trip"),
    ("B", "#FFDF7F", "Road-trip it"),
    ("C", "#FFFF7F", "If nearby"),
    ("D", "#BFFF7F", "Underdogs"),
]
by_tier = {t: [p for p in parks if p["tier"] == t] for t, _, _ in TIERS}
assert [len(by_tier[t]) for t, _, _ in TIERS] == [6, 18, 16, 13, 10]

FONT_DIR = "file:///usr/share/fonts/opentype/inter/"
faces = []
for fam, prefix, weights in (
    ("Inter", "Inter-", {500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold"}),
    ("Inter Display", "InterDisplay-", {600: "SemiBold", 800: "ExtraBold", 900: "Black"}),
):
    for w, n in weights.items():
        faces.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;"
                     f"src:url('{FONT_DIR}{prefix}{n}.otf') format('opentype');}}")
FACES = "\n".join(faces)

def rows_html():
    out = []
    for t, color, cap in TIERS:
        chips = "".join(
            f'<span class="chip"><span class="rk">{p["rank"]}</span>'
            f'<span class="nm">{html.escape(short(p["name"]))}</span></span>'
            for p in by_tier[t]
        )
        out.append(
            f'<div class="row tier-{t}" style="--tc:{color}">'
            f'<div class="lab"><div class="L">{t}</div><div class="cap">{html.escape(cap)}</div></div>'
            f'<div class="chips">{chips}</div></div>'
        )
    return "\n".join(out)

BASE_CSS = FACES + """
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#121211;--row:#1d1d1b;--chip:#2c2c29;--chipb:#3a3a36;--ink:#f4f3ee;--mute:#a9a89f;--red:#E0303F;--blue:#3C5BD6}
html,body{width:var(--W);height:var(--H);overflow:hidden;background:var(--bg)}
body{font-family:'Inter',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;font-feature-settings:'tnum' 0}
.stripe{position:absolute;left:0;right:0;top:0;height:var(--stripe);display:flex}
.stripe i{flex:1}
.stripe i:nth-child(1){background:var(--red)}.stripe i:nth-child(2){background:#f4f3ee}.stripe i:nth-child(3){background:var(--blue)}
.title{font-family:'Inter Display',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-0.012em;line-height:.92}
.title .n{color:var(--red)}
.sub{font-weight:500;color:#d6d5cd;letter-spacing:-0.005em}
.foot{font-weight:600;color:var(--mute);letter-spacing:-0.003em}
.foot b{color:var(--ink);font-weight:800}
.board{display:flex;flex-direction:column;gap:var(--rowgap);overflow:hidden;min-height:0}
.row{flex:1 0 auto;display:flex;background:var(--row);border-radius:var(--rr);overflow:hidden}
.lab{flex:0 0 var(--labw);background:var(--tc);color:#161614;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 4px}
.lab .L{font-family:'Inter Display',sans-serif;font-weight:900;font-size:var(--labfs);line-height:1;letter-spacing:-0.02em}
.lab .cap{font-weight:800;font-size:var(--capfs);line-height:1.05;text-align:center;margin-top:calc(var(--labfs)*0.06);letter-spacing:-0.01em;text-transform:uppercase}
.chips{flex:1;min-width:0;display:flex;flex-wrap:wrap;align-content:center;align-items:center;gap:var(--cgap);padding:var(--cpad)}
.chip{display:inline-flex;align-items:baseline;white-space:nowrap;font-size:var(--fs);line-height:1.12;font-weight:600;
  background:var(--chip);border:1px solid var(--chipb);border-radius:.28em;padding:.28em .48em .30em .40em;letter-spacing:-0.012em}
.tier-S .chip{font-size:calc(var(--fs) * var(--sboost));font-weight:700}
.chip .rk{font-weight:800;color:var(--tc);font-size:.72em;margin-right:.38em;font-variant-numeric:tabular-nums;letter-spacing:0}
"""

PORTRAIT = """
:root{--W:1600px;--H:2000px;--stripe:12px;--rowgap:8px;--rr:10px;--labw:150px;--labfs:96px;--capfs:18px;--cgap:10px;--cpad:12px;--fs:40px;--sboost:1.22}
.page{position:absolute;inset:0;padding:58px 44px 34px;display:flex;flex-direction:column}
.head{margin-bottom:22px}
.title .l1{font-size:136px;display:block}
.title .l2{font-size:84px;display:block;margin-top:8px;white-space:nowrap}
.sub{font-size:42px;margin-top:18px}
.board{flex:1}
.foot{font-size:32px;margin-top:22px;display:flex;justify-content:space-between;align-items:baseline}
.foot .r{font-weight:600;color:#7d7c74;font-size:26px}
"""

WIDE = """
:root{--W:1600px;--H:900px;--stripe:10px;--rowgap:6px;--rr:8px;--labw:118px;--labfs:62px;--capfs:13px;--cgap:7px;--cpad:8px;--fs:26px;--sboost:1.16}
.page{position:absolute;inset:0;padding:44px 40px 36px;display:flex;flex-direction:column}
.title{white-space:nowrap;font-size:64px;line-height:1}
.sub{font-size:28px;margin-top:10px;margin-bottom:18px}
.board{flex:1}
.foot{font-size:21px;margin-top:14px;display:flex;justify-content:space-between;align-items:baseline}
.foot .r{color:#7d7c74;font-size:18px}
"""

def page(css, body, W, H):
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>The 63 tier list</title>
<style>{BASE_CSS}{css}</style></head><body>{body}</body></html>"""

STRIPE = '<div class="stripe"><i></i><i></i><i></i></div>'
FOOT_L = '<b>@Muricaenjoyer</b> · method + data in the replies'
COUNTS = "63 parks · S 6 · A 18 · B 16 · C 13 · D 10"

portrait_body = f"""{STRIPE}<div class="page">
<div class="head"><h1 class="title"><span class="l1">The <span class="n">63</span>:</span><span class="l2" data-fitw="1">National Parks Power Rankings</span></h1>
<p class="sub">The 63 parks before Chiricahua joined. Ranked. Fight me.</p></div>
<div class="board" id="board">{rows_html()}</div>
<div class="foot"><span>{FOOT_L}</span><span class="r">{COUNTS}</span></div>
</div>"""

wide_body = f"""{STRIPE}<div class="page">
<h1 class="title" data-fitw="1">The <span class="n">63</span>: National Parks Power Rankings</h1>
<p class="sub">The 63 parks before Chiricahua joined. Ranked. Fight me.</p>
<div class="board" id="board">{rows_html()}</div>
<div class="foot"><span>{FOOT_L}</span><span class="r">{COUNTS}</span></div>
</div>"""

open(os.path.join(HERE, "portrait.html"), "w").write(page(PORTRAIT, portrait_body, 1600, 2000))
open(os.path.join(HERE, "wide.html"), "w").write(page(WIDE, wide_body, 1600, 900))
print("names:", [short(p["name"]) for p in parks])
