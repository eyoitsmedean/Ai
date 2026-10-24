import base64, re, sys
root = sys.argv[1]
src = open(f"{root}/build/video.src.html", encoding="utf-8").read()
fonts = sys.argv[2] if len(sys.argv) > 2 else f"{root}/fontsrc"

def sub(old, new):
    global src
    assert src.count(old) == 1, old
    src = src.replace(old, new)

# checked substitutions (fact-check fixes, same as short/build.py; the source is left as is)
sub('text: "…we are determined to foment a Rebelion"',
    'text: "…not paid to the Laidies we are determined to foment a Rebelion"')  # keep her "If ... not paid" condition (exact excerpt)
sub('src: "Letter to Jean-Baptiste Le Roy · 13 Nov 1789"',
    'src: "Letter to Jean-Baptiste Le Roy, in French · 13 Nov 1789"')  # the letter was in French; the line is a translation
sub("as recorded by his doctor · night of 3 Jul 1826", "as recorded by his doctor · evening of 3 Jul 1826")
sub('text: "Thomas Jefferson left the chat", sub: "around noon"',
    'text: "Thomas Jefferson left the chat", sub: "early afternoon"')
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
src = src.replace("__FELL_ITALIC__", b64(f"{fonts}/fell-italic.woff2")).replace("__FELL_REGULAR__", b64(f"{fonts}/fell-regular.woff2"))
def js(m):
    return "".join(c if ord(c) < 128 else "\\u%04x" % ord(c) for c in m.group(0))
src = re.sub(r"<script>.*?</script>", js, src, flags=re.S)
src = "".join(c if ord(c) < 128 else "&#x%x;" % ord(c) for c in src)
open(f"{root}/video.html", "w", encoding="ascii").write(src)
print("ok", len(src))
