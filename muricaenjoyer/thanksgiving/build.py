# The Thanksgiving Group Chat: the Founders' Group Chat engine with a new cast.
# Reads ../founders/build/video.src.html (unchanged) and script.json, swaps in the
# cast, items and titles with checked substitutions, and writes video.html.
# Quotes come from script.json verbatim; sources.md lists every one.
# usage: python3 build.py <fontsrc dir>
import base64, json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
fonts = sys.argv[1]
src = open(f"{here}/../founders/build/video.src.html", encoding="utf-8").read()
S = json.load(open(f"{here}/script.json", encoding="utf-8"))


def sub(old, new, count=1):
    global src
    assert src.count(old) == count, (old, src.count(old))
    src = src.replace(old, new)


def resub(pat, new):
    global src
    src, n = re.subn(pat, lambda m: new, src, flags=re.S)
    assert n == 1, pat


# titles and page copy
sub("<title>Founders' Group Chat</title>", f"<title>{S['title']}</title>")
sub('<p class="kicker">1776 – 1826</p>', f'<p class="kicker">{S["years"]}</p>')
sub("<h1>The Founders' Group Chat</h1>", f"<h1>{S['title']}</h1>")
resub(r'<p class="lede">.*?</p>', f'<p class="lede">{S["lede"]}</p>')
resub(r'aria-label="Animated group chat between .*?"', f'aria-label="{S["aria"]}"')
sub("// ===== The Founders' Group Chat:", f"// ===== {S['title']}:")

# cast, phone owner, items
people = ",\n".join(f'  {k}: {json.dumps(v, ensure_ascii=False)}' for k, v in S["people"].items())
resub(r"const P = \{\n.*?\n\};\nconst ORDER = \[.*?\];",
      f"const P = {{\n{people},\n}};\nconst ORDER = {json.dumps(S['order'])};\n"
      f"const ME = {json.dumps(S['me'])}, GROUP0 = {json.dumps(S['group'], ensure_ascii=False)}, OPEN = {S['open']};")
sub('"JA"', "ME", count=7)
items = ",\n".join("  " + json.dumps(it, ensure_ascii=False) for it in S["items"])
resub(r"const ITEMS = \[\n.*?\n\];", f"const ITEMS = [\n{items},\n];")

# the first OPEN items are on screen at frame 0 (the thumbnail)
sub("ITEMS[0].tIn = ITEMS[1].tIn = ITEMS[2].tIn = ITEMS[3].tIn = -10;   // first frame = thumbnail\n  ITEMS[3].receiptAt = 2.0;",
    "for (let i = 0; i < OPEN; i++) ITEMS[i].tIn = -10;          // first frame = thumbnail")
sub("for (let i = 4; i < ITEMS.length; i++) {", "for (let i = OPEN; i < ITEMS.length; i++) {")

# the group can be renamed more than once
sub("let T_END = 0, T_RENAME = 1e9;", "let T_END = 0; const RENAMES = [];")
sub("if (it.rename) T_RENAME = it.tIn + 0.35;", "if (it.rename) RENAMES.push({ t: it.tIn + 0.35, name: it.rename });")
resub(r"  // group name \(renamed on July 4, 1776\)\n.*?  ctx\.globalAlpha = 1;\n(?=  // member count)",
      """  // group name, cross-faded at each rename
  font(700, 40);
  let k = -1; RENAMES.forEach((rn, i) => { if (t >= rn.t) k = i; });
  if (k < 0) text(GROUP0, W / 2, 442, C.fg, "center");
  else {
    const rn = RENAMES[k], before = k === 0 ? GROUP0 : RENAMES[k - 1].name;
    const r1 = eInOut(prog(t, rn.t, rn.t + 0.3)), r2 = eOut(prog(t, rn.t + 0.3, rn.t + 0.75));
    if (r1 < 1) { ctx.globalAlpha = 1 - r1; text(before, W / 2, 442 - r1 * 16, C.fg, "center"); }
    if (r2 > 0) { ctx.globalAlpha = r2; text(rn.name, W / 2, 442 + (1 - r2) * 16, C.fg, "center"); }
  }
  ctx.globalAlpha = 1;
""")

# avatar rows and member count follow the cast size
sub("const r = 35, step = 66, x0 = W / 2 - step * 2.5, cy = 352;",
    "const r = 33, step = 62, x0 = W / 2 - step * (ORDER.length - 1) / 2, cy = 352;")
sub("const r = 40, step = 62, x0 = W / 2 - step * 2.5;",
    "const r = 38, step = 60, x0 = W / 2 - step * (ORDER.length - 1) / 2;")
sub("let n = 6; for", "let n = ORDER.length; for")
# a read receipt under the owner's own bubble sits on the right
sub("text(it.receipt, BL + 4, bb + SRC_GAP + 23 + it.srcLines.length * SRC_LH + 2, C.dim);",
    "text(it.receipt, out ? BR - 4 : BL + 4, bb + SRC_GAP + 23 + it.srcLines.length * SRC_LH + 2, C.dim, out ? \"right\" : \"left\");")

# 9:16 frame and end card
sub('text("1776 – 1826", W / 2, 122, C.parchDim, "center");', f'text({json.dumps(S["years"])}, W / 2, 122, C.parchDim, "center");')
sub('text("1776 – 1826", W / 2, 1222, C.parchDim, "center");', f'text({json.dumps(S["years"])}, W / 2, 1222, C.parchDim, "center");')
sub("The Founders’ Group Chat", S["title_curly"], count=2)

# pacing from the Founders short (~0.75s + 0.05s per character)
sub("const readTime = s => 0.9 + 0.055 * len(s);",
    "const readTime = s => 0.75 + 0.05 * len(s);\nconst slowRead = s => 0.9 + 0.055 * len(s);")
sub("T = it.tIn + readTime(it.text);",
    "T = it.tIn + ((it.slow || it.final) ? slowRead(it.text) : readTime(it.text));")
sub("typ = Math.min(1.5, 0.5 + 0.011 * len(it.text));", "typ = Math.min(1.1, 0.4 + 0.008 * len(it.text));")
sub("typ = it.slow ? 2.2 : (same ? 0.5 : 0.7);", "typ = it.slow ? 2.2 : (same ? 0.3 : 0.45);")
sub("let T = 4.9;", f"let T = {S['hold']};")
sub("T = it.tIn + (it.big ? 2.5 : 1.1);", "T = it.tIn + (it.big ? 2.6 : 0.85);")
sub("0.9 + 0.035 * len(it.text);", "0.6 + 0.03 * len(it.text);")
sub("if (it.final) T += 2.7;", "if (it.final) T += 1.6;")
sub("const TOTAL = +(T_END + 4.8).toFixed(2);", "const TOTAL = +(T_END + 4.2).toFixed(2);")

b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
src = src.replace("__FELL_ITALIC__", b64(f"{fonts}/fell-italic.woff2")).replace("__FELL_REGULAR__", b64(f"{fonts}/fell-regular.woff2"))
src = re.sub(r"<script>.*?</script>", lambda m: "".join(c if ord(c) < 128 else "\\u%04x" % ord(c) for c in m.group(0)), src, flags=re.S)
src = "".join(c if ord(c) < 128 else "&#x%x;" % ord(c) for c in src)
open(f"{here}/video.html", "w", encoding="ascii").write(src)
print("ok", len(src), "items", len(S["items"]))
