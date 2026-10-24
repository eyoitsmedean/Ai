#!/usr/bin/env python3
"""Build the web cut of The Founders' Group Chat from script.json + sources.md."""
import html
import json
import re
import sys

ROOT = sys.argv[1]
TEMPLATE = sys.argv[2]
OUT = sys.argv[3]

web = json.load(open(f"{ROOT}/script.json"))["web"]
src = open(f"{ROOT}/sources.md").read()

# ---------- members ----------
MEMBERS = {
    "Abigail Adams": dict(key="aa", ini="AA", first="Abigail", years="1744–1818"),
    "John Adams": dict(key="ja", ini="JA", first="John", years="1735–1826"),
    "Thomas Jefferson": dict(key="tj", ini="TJ", first="Thomas", years="1743–1826"),
    "George Washington": dict(key="gw", ini="GW", first="George", years="1732–1799"),
    "Benjamin Franklin": dict(key="bf", ini="BF", first="Benjamin", years="1706–1790"),
    "James Madison": dict(key="jm", ini="JM", first="James", years="1751–1836"),
    "Alexander Hamilton": dict(key="ah", ini="AH", first="Alexander", years="1755/57–1804"),
}
ME = "John Adams"

# ---------- parse sources.md ----------
entries = []
quotes_part = src.split("## Interface lines")[0]
for block in re.split(r"\n### \d+\. ", quotes_part)[1:]:
    lines = block.split("\n")
    def field(name, block=block):
        m = re.search(r"- \*\*" + name + r":\*\* (.+)", block)
        return m.group(1).strip() if m else ""
    entries.append(dict(
        speaker=lines[0].strip(),
        quote=next(l[2:].strip() for l in lines if l.startswith("> ")),
        document=field("Document"), date=field("Date"), url=field("URL"), note=field("Note"),
    ))


def norm(s):
    s = s.replace("...", "…").replace("\u201c", '"').replace("\u201d", '"').replace("\u2019", "'")
    s = re.sub(r"\s+", " ", s)
    return s.strip(" …").lower()


def match(msg):
    t = norm(msg["text"])
    cands = [e for e in entries if e["speaker"] == msg["speaker"]]
    for e in cands:
        if norm(e["quote"]) == t:
            return e
    for e in cands:
        q = norm(e["quote"])
        parts = [p.strip() for p in t.split("…") if p.strip()]
        if parts and all(p in q for p in parts) and e["url"] == msg["url"]:
            return e
    raise SystemExit(f"no source match for: {msg['text']}")


# ---------- typography helpers ----------
def smart_quote_text(s):
    """For quotations: straight double quotes -> curly, every apostrophe -> right single quote."""
    s = re.sub(r'(^|[\s(\[—])"', "\\1\u201c", s)
    s = s.replace('"', "\u201d")
    return s.replace("'", "\u2019")


def smart_prose(s):
    """For documents, notes, captions: 'quoted phrase' -> ‘…’ and apostrophes -> ’."""
    s = re.sub(r'(^|[\s(\[—])"', "\\1\u201c", s)
    s = s.replace('"', "\u201d")
    s = re.sub(r"(^|[\s(\[—])'(?=\w)", "\\1\u2018", s)
    return s.replace("'", "\u2019")


def esc(s):
    return html.escape(s, quote=True)


def copy_document(speaker, document):
    if document.startswith(speaker + " to "):
        return "letter to " + document[len(speaker) + 4:]
    if document.startswith(speaker + ", "):
        return document[len(speaker) + 2:]
    if re.match(r"(Remark|Reported|Deathbed)\b", document):
        return document[0].lower() + document[1:]
    return document


def nest_quotes(s):
    # inside “…”, inner double quotes become single
    return s.replace("\u201c", "\u2018").replace("\u201d", "\u2019")


def pretty_url(u):
    return re.sub(r"^https?://(www\.)?", "", u).rstrip("/")


FWD_SVG = ('<svg class="fwd__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">'
           '<path d="M9.5 3.5 13 7l-3.5 3.5M13 7H6.5A3.5 3.5 0 0 0 3 10.5V13" fill="none" '
           'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')
LINK_SVG = ('<svg class="ext" viewBox="0 0 16 16" aria-hidden="true" focusable="false">'
            '<path d="M6 3.5H3.5v9h9V10M9 3.5h3.5V7M12.5 3.5 7 9" fill="none" stroke="currentColor" '
            'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')


def link(url):
    return (f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer">'
            f'{esc(pretty_url(url))}{LINK_SVG}<span class="sr">(opens in a new tab)</span></a>')


# ---------- build thread ----------
out = []
counts = {k: 0 for k in MEMBERS}
qn = 0
sn = 0
run = None  # current open run: dict(speaker, side)


def close_run():
    global run
    if run is not None:
        out.append("</div></div>")
        run = None


def open_run(speaker):
    global run
    m = MEMBERS[speaker]
    side = "right" if speaker == ME else "left"
    avatar = "" if side == "right" else f'<div class="run__av"><span class="av av--{m["key"]}" aria-hidden="true">{m["ini"]}</span></div>'
    out.append(f'<div class="run run--{side}" style="--m: var(--m-{m["key"]})">{avatar}'
               f'<div class="run__body"><p class="run__name">{esc(speaker)}</p>')
    run = dict(speaker=speaker, side=side, first=True)


for idx, item in enumerate(web):
    t = item["type"]
    nxt = web[idx + 1] if idx + 1 < len(web) else {}
    tag = item.get("tag") or ""
    if t == "divider":
        close_run()
        finale = " divider--finale" if "50 years" in item["text"] else ""
        parts = item["text"].split(" · ")
        inner = esc(parts[0]) + (f' <span class="divider__sub">{esc(parts[1])}</span>' if len(parts) > 1 else "")
        out.append(f'<h2 class="divider{finale}"><span>{inner}</span></h2>')
    elif t == "system" and tag == "endcard":
        close_run()
    elif t == "system":
        close_run()
        sn += 1
        sid = f"s{sn}"
        text = item["text"]
        label = esc(text)
        for name in MEMBERS:
            if text.startswith(name):
                label = f"<strong>{esc(name)}</strong>{esc(smart_prose(text[len(name):]))}"
        kind = "Interface line, not a quote"
        fact = smart_prose(item["source"])
        rows = [("Date", esc(item["date"])), ("Fact", esc(fact))]
        if item["url"]:
            rows.append(("Source", link(item["url"])))
        dl = "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in rows)
        leave = " sys--leave" if "left the chat" in text else ""
        out.append(
            f'<div class="sys{leave}" id="{sid}">'
            f'<button class="sys__btn" type="button" aria-expanded="false" aria-controls="r-{sid}">'
            f'<span class="sys__text">{label}</span> <span class="sys__date">{esc(item["date"])}</span></button>'
            f'<div class="receipt receipt--sys" id="r-{sid}" hidden>'
            f'<p class="receipt__head"><span>Receipt</span><span>{kind}</span></p>'
            f'<dl>{dl}</dl></div></div>')
    elif t == "typing":
        if run is None or run["speaker"] != item["speaker"]:
            close_run()
            open_run(item["speaker"])
        out.append(f'<div class="msg msg--typing"><span class="bubble bubble--typing'
                   f'{" is-first" if run["first"] else ""}">'
                   f'<span class="dot"></span><span class="dot"></span><span class="dot"></span>'
                   f'<span class="sr">{esc(item["speaker"])} is typing</span></span></div>')
        run["first"] = False
    elif t == "msg":
        if run is None or run["speaker"] != item["speaker"]:
            close_run()
            open_run(item["speaker"])
        e = match(item)
        qn += 1
        counts[item["speaker"]] += 1
        qid = f"q{qn}"
        quote = smart_quote_text(item["text"])
        document = smart_prose(e["document"])
        date = e["date"]
        note = smart_prose(e["note"]) if e["note"] else ""
        url = item["url"] or e["url"]
        full_quote = nest_quotes(smart_quote_text(item["text"]))
        copy = f"\u201c{full_quote}\u201d \u2014 {item['speaker']}, {copy_document(item['speaker'], document)}, {date}"
        fwd = ""
        caption = ""
        read = ""
        if tag.startswith("Forwarded"):
            fwd = f'<span class="fwd">{FWD_SVG}{esc(smart_prose(tag))}</span>'
        elif tag == "Read":
            read = '<p class="read">Read</p>'
        elif tag and not (nxt.get("type") == "msg" and nxt.get("speaker") == item["speaker"] and nxt.get("tag") == tag):
            caption = f'<p class="caption">{esc(smart_prose(tag))}</p>'
        rows = [("Document", f'<span class="doc">{esc(document)}</span>'), ("Date", esc(date)),
                ("Source", link(url))]
        if note:
            rows.append(("Note", esc(note)))
        dl = "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in rows)
        first = " is-first" if run["first"] else ""
        out.append(
            f'<div class="msg" id="{qid}">'
            f'<button class="bubble{first}" type="button" aria-expanded="false" aria-controls="r-{qid}">'
            f'{fwd}<span class="bubble__text">{esc(quote)}</span>'
            f'<span class="bubble__time">{esc(item["date"])}</span></button>'
            f'{caption}{read}'
            f'<div class="receipt" id="r-{qid}" hidden>'
            f'<p class="receipt__head"><span>Receipt</span><span class="receipt__no">No. {qn} of %%TOTAL%%</span></p>'
            f'<dl>{dl}</dl>'
            f'<div class="receipt__actions"><button class="copy" type="button" data-copy="{esc(copy)}">'
            f'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>'
            f'<path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
            f'<span class="copy__label">Copy quote</span></button>'
            f'<span class="copy__status" role="status"></span></div>'
            f'<textarea class="copy__fallback" aria-label="Quote with citation" readonly hidden></textarea>'
            f'</div></div>')
        run["first"] = False
close_run()

thread = "\n".join(out).replace("%%TOTAL%%", str(qn))

# ---------- header avatars, aside ----------
order = list(MEMBERS)
avatars = "".join(f'<span class="av av--{MEMBERS[n]["key"]}" title="{esc(n)}">{MEMBERS[n]["ini"]}</span>' for n in order)
subtitle = ", ".join(MEMBERS[n]["first"] for n in order)
aside_rows = "".join(
    f'<li><span class="av av--{MEMBERS[n]["key"]}" aria-hidden="true">{MEMBERS[n]["ini"]}</span>'
    f'<span class="member__txt"><span class="member__name">{esc(n)}</span>'
    f'<span class="member__meta">{MEMBERS[n]["years"]} · {counts[n]} message{"s" if counts[n] != 1 else ""}</span></span></li>'
    for n in order)

page = open(TEMPLATE).read()
for k, v in {
    "%%THREAD%%": thread, "%%AVATARS%%": avatars, "%%SUBTITLE%%": esc(subtitle),
    "%%ASIDE%%": aside_rows, "%%TOTAL%%": str(qn), "%%MEMBERS%%": str(len(MEMBERS)),
}.items():
    page = page.replace(k, v)
assert "%%" not in page, re.findall(r"%%\w+%%", page)
open(OUT, "w").write(page)
print("quotes", qn, "system", sn, counts)
