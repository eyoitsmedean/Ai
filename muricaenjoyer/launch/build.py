"""Builds launch-desk.html: every scheduled post with copy buttons and its assets.

Post text is read from each project's own post files, so the desk never drifts
from them. Assets are referenced as a/<name>; publish.json maps each to its file.
Run: python3 launch/build.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent

ARTICLE = "https://claude.ai/artifact/E6nnge8UAMGReGFRixKkqb"
THE63 = "https://claude.ai/artifact/Js5RFzV6pZZ1xuC5Gasrfe"
GAME = "https://claude.ai/artifact/MuZPaW1jvs49jagrUYfUAm"
CHAT = "https://claude.ai/artifact/QNebUAYTf8zPBpwhrmjBSD"


def quoted(md, heading):
    """Text of the > block right under a heading in a post file."""
    i = md.index(heading)
    block = md[i:].split("\n\n", 1)[1]
    lines = []
    for ln in block.splitlines():
        if ln.startswith(">"):
            lines.append(ln[1:].lstrip() if len(ln) > 1 else "")
        elif lines:
            break
    return "\n".join(lines).strip()


p63 = (ROOT / "the-63/post-text.md").read_text()
pfu = (ROOT / "freedom-units/post-text.md").read_text()
teasers_md = (ROOT / "freedom-units/teasers/posts.md").read_text()
TEASERS = {}
for m in re.finditer(r"## Day (\d+):.*?with `(q\d+)-question.png`\n\n> (.*?)\n\n.*?with `q\d+-answer.png`\n\n> (.*?)\n", teasers_md, re.S):
    TEASERS[m.group(2)] = (m.group(3).strip(), m.group(4).strip())

game_launch = pfu.split("## Option 1: launch", 1)[1].split("## Option 2", 1)[0].strip()
s_thread = [quoted(p63, f"### {k}/5") for k in range(1, 6)]
method_reply = quoted(p63, "(252 chars with a link)")
alt_text = quoted(p63, "## Image alt text")

assets = {}


def asset(rel, kind="img"):
    path = ROOT / rel
    if not path.exists():
        return None
    name = path.name
    assets["a/" + name] = str(path)
    return {"src": "a/" + name, "kind": kind, "name": name}


receipts = [asset(f"founders/receipts/receipt-{k}.png") for k in range(1, 5)]
receipts = [r for r in receipts if r]
receipt_texts = []
thread_md = ROOT / "founders/receipts/thread.md"
if thread_md.exists():
    lines = thread_md.read_text().splitlines()
    receipt_texts = [lines[k + 1].lstrip("> ").strip() for k, ln in enumerate(lines)
                     if re.match(r"## \d+/\d+", ln) and k + 1 < len(lines) and lines[k + 1].strip()]
s_cards = [asset(f"the-63/s-tier/s{k}.png") for k in range(6, 0, -1)]
s_cards = [c for c in s_cards if c]

DAYS = [
    dict(date="Mon Oct 26", title="The 63 tier list", pin=True,
         post=quoted(p63, "### Option 1: Fight bait (176 chars)"),
         assets=[asset("the-63/the-63-tierlist.png")],
         alt=alt_text,
         reply=method_reply.replace("[LINK]", THE63), reply_note="Evening, optional. Share The 63 page publicly first."),
    dict(date="Tue Oct 27", title="Freedom Units teaser 1",
         post=TEASERS["q1"][0], assets=[asset("freedom-units/teasers/q1-question.png")],
         reply=TEASERS["q1"][1], reply_assets=[asset("freedom-units/teasers/q1-answer.png")], reply_note="Evening."),
    dict(date="Wed Oct 28", title="The article: Testosterone Isn't a Personality", pin=True,
         post="The Pentagon's own doctors put this in writing: testosterone \"is not a performance enhancer.\"\n\nAlmost nobody noticed. I read the guidance, the trials and the death data.\n\nTestosterone isn't a personality. Here's what's actually true.",
         assets=[asset("testosterone/img/header-personality-1500x600.png")],
         note=f"Paste the article from the publish desk ({ARTICLE}) with its Copy article button, upload the six charts at their marked slots, and use this header as the cover. Re-read Joey Swoll's latest post first."),
    dict(date="Thu Oct 29", title="The 63 countdown video",
         post="47 seconds. All 63 national parks, worst to best.\n\nSomebody is going to be mad about #34.",
         assets=[asset("the-63/video/the-63-countdown-4x5.mp4", "video")],
         note="Quote-post Monday's tier list with this video."),
    dict(date="Fri Oct 30", title="Freedom Units teaser 2",
         post=TEASERS["q2"][0], assets=[asset("freedom-units/teasers/q2-question.png")],
         reply=TEASERS["q2"][1], reply_assets=[asset("freedom-units/teasers/q2-answer.png")], reply_note="Evening."),
    dict(date="Sat Oct 31 – Sun Nov 1", off=True),
    dict(date="Mon Nov 2", title="The testosterone video",
         post="The \"High-T Department of War\" put this in writing: testosterone \"is not a performance enhancer.\"\n\n52 seconds of receipts. Full article on my profile.",
         assets=[asset("testosterone/video/testosterone-video-4x5.mp4", "video")],
         reply="Full article, with every source: [link to your article]", reply_note="Right after posting, then phone down."),
    dict(date="Tue Nov 3", title="The Founders' Group Chat (Election Day)",
         post="Whoever you vote for today, remember they couldn't agree either.\n\nEvery message in this group chat is a real quote from a real letter. Receipts in the replies.",
         assets=[asset("founders/short/founders-short-4x5.mp4", "video")],
         thread=receipt_texts, thread_assets=receipts,
         note=f"The full chat with a receipt behind every bubble: {CHAT}"),
    dict(date="Wed Nov 4", title="Freedom Units teaser 3",
         post=TEASERS["q3"][0], assets=[asset("freedom-units/teasers/q3-question.png")],
         reply=TEASERS["q3"][1], reply_assets=[asset("freedom-units/teasers/q3-answer.png")], reply_note="Evening."),
    dict(date="Thu Nov 5", title="The 63: the S tier, one at a time",
         post="Monday I ranked all 63 national parks. A lot of you had opinions.\n\nHere's the S tier, counted down. Six parks worth rearranging your life for.",
         assets=[], thread=s_thread,
         thread_assets=[s_cards[0:2], s_cards[2:3], s_cards[3:4], s_cards[4:5], s_cards[5:6]] if len(s_cards) == 6 else []),
    dict(date="Fri Nov 6", title="Freedom Units goes public",
         post=game_launch, assets=[],
         note=f"Share the game publicly from its Share menu ({GAME}) and paste that link in place of [link]. Play once and post your real score from Copy result as the first reply."),
    dict(date="Sat Nov 7 – Sun Nov 8", off=True),
]
BENCH = [dict(title=f"Teaser {q[1:]}", post=TEASERS[q][0], reply=TEASERS[q][1],
              assets=[asset(f"freedom-units/teasers/{q}-question.png")],
              reply_assets=[asset(f"freedom-units/teasers/{q}-answer.png")]) for q in ["q4", "q5", "q6", "q7", "q8", "q9", "q10"]]

E = html.escape


def media(a):
    if not a:
        return ""
    if a["kind"] == "video":
        return f'<figure class="m"><video src="{a["src"]}" controls playsinline preload="metadata"></video><figcaption>{E(a["name"])}</figcaption></figure>'
    return f'<figure class="m"><img src="{a["src"]}" alt="{E(a["name"])}" loading="lazy"><figcaption>{E(a["name"])}</figcaption></figure>'


def textblock(label, text, cls=""):
    return (f'<div class="tb {cls}"><div class="tbh"><span>{E(label)}</span>'
            f'<button class="copy" type="button">Copy</button></div><pre>{E(text)}</pre></div>')


def day_html(d, i):
    if d.get("off"):
        return f'<li class="off"><div class="when"><b>{E(d["date"])}</b></div><div class="body"><p>Off. Phone in the bowl.</p></div></li>'
    parts = [f'<h3>{E(d["title"])}{" <span class=pin>Pin it</span>" if d.get("pin") else ""}</h3>']
    parts.append(textblock("Post · 9:00 a.m. ET", d["post"]))
    ms = [media(a) for a in d.get("assets", []) if a]
    if ms:
        parts.append(f'<div class="media">{"".join(ms)}</div>')
    if d.get("alt"):
        parts.append(textblock("Image alt text", d["alt"], "small"))
    if d.get("reply"):
        parts.append(textblock("Reply · " + d.get("reply_note", ""), d["reply"]))
        rm = [media(a) for a in d.get("reply_assets", []) if a]
        if rm:
            parts.append(f'<div class="media">{"".join(rm)}</div>')
    if d.get("thread"):
        for k, t in enumerate(d["thread"], 1):
            parts.append(textblock(f"Reply {k}/{len(d['thread'])}", t))
            ta = d.get("thread_assets") or []
            if k - 1 < len(ta) and ta[k - 1]:
                group = ta[k - 1] if isinstance(ta[k - 1], list) else [ta[k - 1]]
                parts.append(f'<div class="media">{"".join(media(a) for a in group if a)}</div>')
    if d.get("note"):
        parts.append(f'<p class="note">{E(d["note"])}</p>')
    num = f"{i:02d}" if i else "Bench"
    return f'<li><div class="when"><span class="n">{num}</span><b>{E(d["date"])}</b></div><div class="body">{"".join(parts)}</div></li>'


n = 0
items = []
for d in DAYS:
    if not d.get("off"):
        n += 1
    items.append(day_html(d, n))
bench = "".join(
    f'<div class="bench">{day_html(dict(b, date="Any day"), 0).replace("<li>", "<div>").replace("</li>", "</div>")}</div>'
    for b in BENCH)

PAGE = (OUT / "template.html").read_text()
PAGE = PAGE.replace("{{DAYS}}", "".join(items)).replace("{{BENCH}}", bench).replace("{{COUNT}}", str(n))
(OUT / "launch-desk.html").write_text(PAGE)
(OUT / "publish.json").write_text(json.dumps(assets, indent=1))
print("posts", n, "assets", len(assets), "receipts", len(receipts), "s-cards", len(s_cards))
