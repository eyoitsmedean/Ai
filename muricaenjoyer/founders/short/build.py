# Short (~1 min) cut of The Founders' Group Chat for X.
# Reads ../build/video.src.html (unchanged), keeps only the ITEMS listed in KEEP
# (quotes are copied verbatim, never edited), tightens the pacing everywhere except
# the ending, and writes short/video.html.
# usage: python3 build.py <fontsrc dir>
import base64, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
fonts = sys.argv[1]
src = open(f"{here}/../build/video.src.html", encoding="utf-8").read()

# Items kept, matched by a unique substring of each line in the ITEMS array.
KEEP = [
    'k: "card"',                                   # pinned intro card (thumbnail)
    'text: "March 31, 1776"',
    'Remember the Ladies',
    'foment a Rebelion',
    'I cannot but laugh',
    'text: "July 4, 1776"',
    'named the conversation',
    'vain, irritable',
    'death and taxes',
    'who: "JA", text: "I always loved Jefferson',
    'this is enough for me',
    'You and I ought not to die',
    'Is it the Fourth?',
    'text: "July 4, 1826"',
    'Thomas Jefferson left the chat',
    'Thomas Jefferson survives.',
    'John Adams left the chat',
]

m = re.search(r"const ITEMS = \[\n(.*?)\n\];", src, flags=re.S)
lines = m.group(1).split("\n")
kept = []
for key in KEEP:
    hits = [l for l in lines if key in l]
    assert len(hits) == 1, (key, hits)
    kept.append(hits[0])
assert [lines.index(l) for l in kept] == sorted(lines.index(l) for l in kept), "order changed"
src = src[:m.start(1)] + "\n".join(kept) + src[m.end(1):]

def sub(old, new):
    global src
    assert src.count(old) == 1, old
    src = src.replace(old, new)

# fact-check fixes for the short (the long cut's source is left as is)
sub('text: "…we are determined to foment a Rebelion"',
    'text: "…not paid to the Laidies we are determined to foment a Rebelion"')  # keep her "If ... not paid" condition (exact excerpt)
sub('src: "Letter to Jean-Baptiste Le Roy · 13 Nov 1789"',
    'src: "Letter to Jean-Baptiste Le Roy, in French · 13 Nov 1789"')  # the letter was in French; the line is a translation
sub("as recorded by his doctor · night of 3 Jul 1826", "as recorded by his doctor · evening of 3 Jul 1826")
sub('text: "Thomas Jefferson left the chat", sub: "around noon"',
    'text: "Thomas Jefferson left the chat", sub: "early afternoon"')

# pacing: ~0.75s + 0.05s per character (ending keeps the original slow read)
sub("const readTime = s => 0.9 + 0.055 * len(s);",
    "const readTime = s => 0.75 + 0.05 * len(s);\nconst slowRead = s => 0.9 + 0.055 * len(s);")
sub("T = it.tIn + readTime(it.text);",
    "T = it.tIn + ((it.slow || it.final) ? slowRead(it.text) : readTime(it.text));")
# shorter typing indicators (the slow "Is it the Fourth?" and the final reply are untouched)
sub("typ = Math.min(1.5, 0.5 + 0.011 * len(it.text));",
    "typ = Math.min(0.95, 0.4 + 0.008 * len(it.text));")
sub("typ = it.slow ? 2.2 : (same ? 0.5 : 0.7);",
    "typ = it.slow ? 2.2 : (same ? 0.3 : 0.45);")
# opening hold (thumbnail), dividers and the rename line, a little tighter
sub("let T = 4.9;", "let T = 4.0;")
sub("T = it.tIn + (it.big ? 2.5 : 1.1);", "T = it.tIn + (it.big ? 2.3 : 0.85);")
sub("0.9 + 0.035 * len(it.text);", "0.5 + 0.028 * len(it.text);")

# the ending keeps its order, words and slow beat; its pauses are only shaved
sub("if (it.slow) T += 0.9;", "if (it.slow) T += 0.75;")
sub("if (it.slow) T += 1.3;", "if (it.slow) T += 1.1;")
sub("if (it.final) T += 2.7;", "if (it.final) T += 2.1;")
sub("(it.quiet ? 2.7 : 3.0)", "(it.quiet ? 2.4 : 2.7)")
sub("const TOTAL = +(T_END + 4.8).toFixed(2);", "const TOTAL = +(T_END + 3.6).toFixed(2);")

b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
src = src.replace("__FELL_ITALIC__", b64(f"{fonts}/fell-italic.woff2")).replace("__FELL_REGULAR__", b64(f"{fonts}/fell-regular.woff2"))
def js(m):
    return "".join(c if ord(c) < 128 else "\\u%04x" % ord(c) for c in m.group(0))
src = re.sub(r"<script>.*?</script>", js, src, flags=re.S)
src = "".join(c if ord(c) < 128 else "&#x%x;" % ord(c) for c in src)
open(f"{here}/video.html", "w", encoding="ascii").write(src)
print("ok", len(src), "items", len(kept))
