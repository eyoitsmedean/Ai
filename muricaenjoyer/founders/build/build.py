import base64, re, sys
root = sys.argv[1]
src = open(f"{root}/build/video.src.html", encoding="utf-8").read()
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
src = src.replace("__FELL_ITALIC__", b64(f"{root}/fontsrc/fell-italic.woff2")).replace("__FELL_REGULAR__", b64(f"{root}/fontsrc/fell-regular.woff2"))
def js(m):
    return "".join(c if ord(c) < 128 else "\\u%04x" % ord(c) for c in m.group(0))
src = re.sub(r"<script>.*?</script>", js, src, flags=re.S)
src = "".join(c if ord(c) < 128 else "&#x%x;" % ord(c) for c in src)
open(f"{root}/video.html", "w", encoding="ascii").write(src)
print("ok", len(src))
