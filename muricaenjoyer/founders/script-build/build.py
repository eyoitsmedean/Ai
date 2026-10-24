import json, re, sys
OUT = "/tmp/claude-0/-home-user-Ai/4f57403e-e6b4-5a71-86f2-3d74a2cd5eb2/scratchpad/swarm/founders"
FA = "https://founders.archives.gov/documents/"
# Verified quotes: key -> (speaker, exact text, document, date label, url, note)
Q = {
 "ladies":   ("Abigail Adams", "I desire you would Remember the Ladies, and be more generous and favourable to them than your ancestors.", "Abigail Adams to John Adams, Braintree", "31 March 1776", FA+"Adams/04-01-02-0241", ""),
 "tyrants":  ("Abigail Adams", "Remember all Men would be tyrants if they could.", "Abigail Adams to John Adams, Braintree", "31 March 1776", FA+"Adams/04-01-02-0241", ""),
 "rebelion": ("Abigail Adams", "If perticuliar care and attention is not paid to the Laidies we are determined to foment a Rebelion", "Abigail Adams to John Adams, Braintree", "31 March 1776", FA+"Adams/04-01-02-0241", "Original spelling kept ('perticuliar', 'Laidies', 'Rebelion')."),
 "laugh":    ("John Adams", "As to your extraordinary Code of Laws, I cannot but laugh.", "John Adams to Abigail Adams, Philadelphia (reply to 'Remember the Ladies')", "14 April 1776", FA+"Adams/04-01-02-0248", ""),
 "masculine":("John Adams", "Depend upon it, We know better than to repeal our Masculine systems.", "John Adams to Abigail Adams, Philadelphia", "14 April 1776", FA+"Adams/04-01-02-0248", ""),
 "wives":    ("Abigail Adams", "for whilst you are proclaiming peace and good will to Men, Emancipating all Nations, you insist upon retaining an absolute power over Wives.", "Abigail Adams to John Adams, Braintree", "7 May 1776", FA+"Adams/04-01-02-0259", ""),
 "liquor":   ("George Washington", "The benefits arising from moderate use of strong Liquor, have been experienced in All Armies, and are not to be disputed.", "George Washington to John Hancock, Neshaminy Camp (proposing public distilleries)", "16 August 1777", FA+"Washington/03-10-02-0622", ""),
 "wine":     ("Benjamin Franklin", "a constant proof that God loves us, and loves to see us happy.", "Benjamin Franklin to the Abbé André Morellet (on wine)", "1779", "https://barrypopik.com/blog/beer_is_proof_that_god_loves_us_and_wants_us_to_be_happy", "About WINE. The 'beer is proof that God loves us' version is a 1990s internet fake."),
 "wind":     ("Benjamin Franklin", "It is universally well known, That in digesting our common Food, there is created or produced in the Bowels of human Creatures, a great Quantity of Wind.", "Benjamin Franklin, 'To the Royal Academy of Brussels' (satirical essay)", "after 19 May 1780 (often misdated 1781)", FA+"Franklin/01-32-02-0281", "'Fart Proudly' is a 1990 anthology title, not Franklin's phrase."),
 "bullets":  ("George Washington", "I heard Bulletts whistle and believe me there was something charming in the sound.", "George Washington to John Augustine Washington, Great Meadows camp", "31 May 1754", "https://encyclopediavirginia.org/primary-documents/letter-from-george-washington-to-john-augustine-washington-may-31-1754/", "Shown as a 'forwarded' message: it predates the chat. It is about his first battle, not about Franklin's essay; the pairing is a joke made by placement."),
 "eagle":    ("Benjamin Franklin", "He is a Bird of bad moral Character.", "Benjamin Franklin to Sarah Bache (on the Society of the Cincinnati and the bald eagle)", "26 January 1784", "https://annotation.blogs.archives.gov/2020/11/25/talking-turkey", ""),
 "vine":     ("George Washington", "I am become a private citizen on the banks of the Potomac, & under the shadow of my own Vine & my own Fig-tree", "George Washington to the Marquis de Lafayette, Mount Vernon", "1 February 1784", FA+"Washington/04-01-02-0064", ""),
 "fish":     ("Benjamin Franklin", "Fish and Visitors stink in 3 days.", "Poor Richard, 1736 (Poor Richard's Almanack)", "1735 (almanac for the year 1736)", FA+"Franklin/01-02-02-0019", "Shown as a 'forwarded' message from the almanac; placement after Washington's retirement is the joke."),
 "vain":     ("Thomas Jefferson", "He is vain, irritable and a bad calculator of the force and probable effect of the motives which govern men. This is all the ill which can possibly be said of him.", "Thomas Jefferson to James Madison, Paris (about John Adams)", "30 January 1787", FA+"Madison/01-09-02-0126", ""),
 "secret":   ("Benjamin Franklin", "Three may keep a Secret, if two of them are dead.", "Poor Richard, 1735 (Poor Richard's Almanack)", "July 1734 (almanac for the year 1735)", FA+"Franklin/01-02-02-0001", "Shown as a 'forwarded' message from the almanac; placement after Jefferson's private letter is the joke."),
 "angels":   ("James Madison", "If men were angels, no government would be necessary.", "The Federalist No. 51 (Madison writing as Publius)", "6 February 1788", "https://teachingamericanhistory.org/document/federalist-no-51/", ""),
 "ambition": ("James Madison", "Ambition must be made to counteract ambition.", "The Federalist No. 51 (Madison writing as Publius)", "6 February 1788", "https://billofrightsinstitute.org/founding-documents/primary-source-documents/the-federalist-papers/federalist-papers-no-51/", ""),
 "ned":      ("Alexander Hamilton", "Ned, my Ambition is prevalent that I contemn the grov'ling and condition of a Clerk or the like, to which my Fortune &c. condemns me", "Alexander Hamilton to Edward Stevens, St. Croix (Hamilton was in his early teens)", "11 November 1769", FA+"Hamilton/01-01-02-0002", "Shown as a 'forwarded' message: it predates the chat."),
 "culprit":  ("George Washington", "my movements to the chair of Government will be accompanied with feelings not unlike those of a culprit who is going to the place of his execution", "George Washington to Henry Knox, Mount Vernon (before taking office as President)", "1 April 1789", FA+"Washington/05-02-02-0003", ""),
 "taxes":    ("Benjamin Franklin", "Our new Constitution is now established, and has an appearance that promises permanency; but in this world nothing can be said to be certain, except death and taxes.", "Benjamin Franklin to Jean-Baptiste Le Roy", "13 November 1789", "https://www.politifact.com/factchecks/2011/jan/21/jay-hottinger/rep-jay-hottingers-assessment-founding-father-unfo", ""),
 "caesar":   ("Alexander Hamilton", "In a word, if we have an embryo-Cæsar in the United States 'tis Burr.", "Alexander Hamilton to an unidentified correspondent", "26 September 1792", FA+"Hamilton/01-12-02-0334", ""),
 "reynolds": ("Alexander Hamilton", "My real crime is an amorous connection with his wife, for a considerable time with his privity and connivance", "Observations on Certain Documents... (the 'Reynolds Pamphlet'), Philadelphia, p. 9", "late August 1797", "https://en.wikipedia.org/wiki/Hamilton%E2%80%93Reynolds_affair", "Published by Hamilton himself to refute a charge of financial corruption."),
 "defects":  ("Alexander Hamilton", "there are great and intrinsic defects in his character", "Letter from Alexander Hamilton, Concerning the Public Conduct and Character of John Adams, Esq. President of the United States", "[24 October 1800]", FA+"Hamilton/01-25-02-0110-0002", ""),
 "unfit":    ("Alexander Hamilton", "the most unfit and most dangerous man of the Community", "Alexander Hamilton to John Rutledge, Jr. (about Aaron Burr)", "4 January 1801", FA+"Hamilton/01-25-02-0156-0001", ""),
 "unkind":   ("Thomas Jefferson", "I can say with truth that one act of Mr. Adams's life, and one only, ever gave me a moment's personal displeasure. I did consider his last appointments to office as personally unkind.", "Thomas Jefferson to Abigail Adams", "13 June 1804", FA+"Adams/04-15-02-0219", "Refers to Adams's last-minute ('midnight') appointments of 1801."),
 "dream":    ("John Adams", "A DREAM AGAIN! ... I have no other objection to your dream but that it is not history. It may be prophecy.", "John Adams to Benjamin Rush (reply to Rush's dream of an Adams-Jefferson reconciliation)", "October 1809 (likely 25 Oct 1809)", FA+"Adams/99-02-02-5450", "Rush, not Jefferson, was the recipient."),
 "theatrical":("John Adams", "The Declaration of Independence I always considered as a Theatrical Show. Jefferson ran away with all the Stage Effect of that; i.e. all the Glory of it.", "John Adams to Benjamin Rush", "21 June 1811", FA+"Adams/99-02-02-5649", "Written to Rush, not Jefferson."),
 "love":     ("John Adams", "I always loved Jefferson, and still love him.", "Remark made aloud to Edward and John Coles at Quincy; relayed in Jefferson to Rush (5 Dec 1811) and copied by Rush to Adams (16 Dec 1811)", "summer 1811", FA+"Adams/99-02-02-5725", "REPORTED SPEECH: said aloud to the Coles brothers, reached Jefferson secondhand. Labeled 'as reported'."),
 "enough":   ("Thomas Jefferson", "\"I always loved Jefferson, and still love him.\"—this is enough for me.", "Thomas Jefferson to Benjamin Rush", "5 December 1811", FA+"Jefferson/03-04-02-0248", ""),
 "homespun": ("John Adams", "I take the Liberty of sending you by the Post a Packett containing two Pieces of Homespun lately produced in this quarter", "John Adams to Thomas Jefferson (first letter of the reconciliation)", "1 January 1812", FA+"Adams/99-02-02-5735", "The 'Homespun' was John Quincy Adams's two-volume Lectures on Rhetoric and Oratory, not cloth."),
 "politics": ("Thomas Jefferson", "I think little of them and say less. I have given up newspapers in exchange for Tacitus and Thucydides, for Newton and Euclid, and I find myself much the happier.", "Thomas Jefferson to John Adams", "21 January 1812", "https://tjrs.monticello.org/node/280", "'them' = politics."),
 "explain":  ("John Adams", "You and I ought not to die, before We have explained ourselves to each other.", "John Adams to Thomas Jefferson", "15 July 1813", FA+"Adams/99-03-02-2334", "Adams to Jefferson, 15 July 1813; often misdated to 1812 or credited to Jefferson."),
 "machines": ("Thomas Jefferson", "our machines have now been running for 70. or 80. years, and we must expect that, worn as they are, here a pivot, there a wheel, now a pinion, next a spring, will be giving way", "Thomas Jefferson to John Adams", "5 July 1814", "https://tjrs.monticello.org/node/1591", "Often misdated to 1 June 1822."),
 "fourth":   ("Thomas Jefferson", "Is it the Fourth?", "Deathbed account recorded by Dr. Robley Dunglison (variants by Nicholas Trist and Thomas Jefferson Randolph)", "night of 3 July 1826", "https://www.monticello.org/encyclopedia/jeffersons-last-words", "REPORTED: recorded by his physician. Monticello says his true last words cannot be determined."),
 "survives": ("John Adams", "Thomas Jefferson survives.", "Reported deathbed words at Quincy (family accounts and contemporary reports; discussed around John Quincy Adams's July 1826 diary)", "4 July 1826", "https://www.historynewsnetwork.org/article/jefferson-still-survives", "REPORTED: rests on family reports of indistinct speech. 'Jefferson still lives' / 'still survives' are later polished variants. Adams did not know Jefferson had died hours earlier; the news traveled by post days later."),
}

def norm(s):
    return re.sub(r"\s+", " ", s.replace("...", "…")).strip()

def M(key, text=None, date="", tag=None):
    sp, full, doc, dlabel, url, note = Q[key]
    t = text if text is not None else full
    d = {"type": "msg", "speaker": sp, "text": t, "date": date, "source": f"{doc}, {dlabel}", "url": url, "qid": key}
    if tag: d["tag"] = tag
    return d

def DIV(text): return {"type": "divider", "speaker": "", "text": text, "date": "", "source": "", "url": ""}
def SYS(text, date="", source="", url="", tag=None):
    d = {"type": "system", "speaker": "", "text": text, "date": date, "source": source, "url": url}
    if tag: d["tag"] = tag
    return d
def TYP(sp, date=""): return {"type": "typing", "speaker": sp, "text": "", "date": date, "source": "", "url": ""}

DECL = "https://www.archives.gov/founding-docs/declaration-transcript"
RENAME = SYS("Thomas Jefferson named the conversation “The United States of America”", "Jul 4, 1776",
             "Interface gag for the Declaration of Independence, adopted by Congress 4 July 1776 (Jefferson drafted it)", DECL)
TJ_LEFT = SYS("Thomas Jefferson left the chat", "Jul 4, 1826 · around noon", "Jefferson died at Monticello around noon, 4 July 1826", "https://www.monticello.org/encyclopedia/jeffersons-last-words")
END = {"type": "system", "speaker": "@Muricaenjoyer", "text": "Every message is a real quote. Sources in the replies.", "date": "", "source": "", "url": "", "tag": "endcard"}

video = [
 DIV("March 31, 1776"),
 M("ladies", "I desire you would Remember the Ladies…", "Mar 31, 1776"),
 M("rebelion", "…we are determined to foment a Rebelion", "Mar 31, 1776", "Read"),
 M("laugh", date="Apr 14, 1776"),
 DIV("July 4, 1776"),
 RENAME,
 M("liquor", "The benefits arising from moderate use of strong Liquor … are not to be disputed.", "Aug 16, 1777"),
 M("wine", "…a constant proof that God loves us, and loves to see us happy.", "1779", "on wine"),
 M("vain", "He is vain, irritable … This is all the ill which can possibly be said of him.", "Jan 30, 1787", "about John Adams"),
 M("culprit", "…feelings not unlike those of a culprit who is going to the place of his execution", "Apr 1, 1789", "on becoming President"),
 M("taxes", "…in this world nothing can be said to be certain, except death and taxes.", "Nov 13, 1789"),
 M("reynolds", "My real crime is an amorous connection with his wife…", "Aug 1797"),
 M("unkind", "…I did consider his last appointments to office as personally unkind.", "Jun 13, 1804", "to Abigail, about John"),
 M("theatrical", "The Declaration of Independence I always considered as a Theatrical Show. Jefferson ran away with … all the Glory of it.", "Jun 21, 1811"),
 M("love", date="Summer 1811", tag="as reported"),
 M("enough", date="Dec 5, 1811"),
 M("explain", date="Jul 15, 1813"),
 M("fourth", date="Jul 3, 1826 · night", tag="as recorded by his doctor"),
 DIV("July 4, 1826 · 50 years to the day"),
 TJ_LEFT,
 TYP("John Adams", "Jul 4, 1826"),
 M("survives", date="Jul 4, 1826", tag="as reported"),
 END,
]

web = [
 DIV("March 31, 1776"),
 M("ladies", date="Mar 31, 1776"),
 M("tyrants", date="Mar 31, 1776"),
 M("rebelion", date="Mar 31, 1776", tag="Read"),
 TYP("John Adams", "Apr 14, 1776"),
 M("laugh", date="Apr 14, 1776"),
 M("masculine", date="Apr 14, 1776"),
 M("wives", date="May 7, 1776"),
 DIV("July 4, 1776"),
 RENAME,
 M("liquor", date="Aug 16, 1777", tag="proposing public distilleries"),
 M("wine", "…a constant proof that God loves us, and loves to see us happy.", "1779", "on wine"),
 M("wind", date="1780", tag="to the Royal Academy of Brussels"),
 M("bullets", date="May 31, 1754", tag="Forwarded · 1754"),
 M("eagle", date="Jan 26, 1784", tag="on the bald eagle"),
 M("vine", date="Feb 1, 1784", tag="retiring after the war"),
 M("fish", date="1736", tag="Forwarded · Poor Richard, 1736"),
 M("vain", date="Jan 30, 1787", tag="about John Adams"),
 M("secret", date="1735", tag="Forwarded · Poor Richard, 1735"),
 M("angels", date="Feb 6, 1788", tag="as Publius"),
 M("ambition", date="Feb 6, 1788", tag="as Publius"),
 M("ned", date="Nov 11, 1769", tag="Forwarded · 1769, age ~14"),
 M("culprit", date="Apr 1, 1789", tag="on becoming President"),
 M("taxes", date="Nov 13, 1789"),
 SYS("Benjamin Franklin left the chat", "Apr 17, 1790", "Franklin died in Philadelphia, 17 April 1790"),
 M("caesar", date="Sep 26, 1792", tag="about Aaron Burr"),
 M("reynolds", date="Aug 1797"),
 SYS("George Washington left the chat", "Dec 14, 1799", "Washington died at Mount Vernon, 14 December 1799"),
 M("defects", date="Oct 24, 1800", tag="about John Adams"),
 M("unfit", date="Jan 4, 1801", tag="about Aaron Burr"),
 M("unkind", date="Jun 13, 1804", tag="to Abigail, about John"),
 SYS("Alexander Hamilton left the chat", "Jul 12, 1804", "Hamilton died 12 July 1804, the day after his duel with Aaron Burr"),
 M("dream", "A DREAM AGAIN! … I have no other objection to your dream but that it is not history. It may be prophecy.", "Oct 1809", "to Benjamin Rush, who dreamed they would reconcile"),
 M("theatrical", date="Jun 21, 1811"),
 M("love", date="Summer 1811", tag="as reported by Edward Coles"),
 M("enough", date="Dec 5, 1811"),
 DIV("January 1, 1812"),
 M("homespun", date="Jan 1, 1812", tag="it was his son's 2-volume book"),
 M("politics", date="Jan 21, 1812", tag="on politics"),
 M("explain", date="Jul 15, 1813"),
 TYP("Thomas Jefferson", "Jul 5, 1814"),
 M("machines", date="Jul 5, 1814"),
 DIV("July 3, 1826"),
 M("fourth", date="Jul 3, 1826 · night", tag="as recorded by his doctor"),
 DIV("July 4, 1826 · 50 years to the day"),
 TJ_LEFT,
 TYP("John Adams", "Jul 4, 1826"),
 M("survives", date="Jul 4, 1826", tag="as reported"),
 SYS("John Adams left the chat", "Jul 4, 1826 · evening", "Adams died at Quincy later the same day, 4 July 1826", "https://www.historynewsnetwork.org/article/jefferson-still-survives"),
 END,
]

# ---- validation ----
errs = []
def check(cut, items, maxw=None):
    for i, it in enumerate(items):
        if it["type"] != "msg": continue
        full = norm(Q[it["qid"]][1]); txt = norm(it["text"])
        frags = [f.strip() for f in txt.split("…") if f.strip()]
        for f in frags:
            if f not in full: errs.append(f"{cut}[{i}] fragment not in quote: {f!r}")
        # fragments must appear in order
        pos = 0
        for f in frags:
            j = full.find(f, pos)
            if j < 0: errs.append(f"{cut}[{i}] out of order: {f!r}"); break
            pos = j + len(f)
        # untrimmed text must equal full exactly
        if "…" not in txt and "..." not in it["text"] and txt != full:
            errs.append(f"{cut}[{i}] not exact: {txt!r}")
        w = len(txt.replace("…", " ").split())
        it["_words"] = w
        if maxw and w > maxw: errs.append(f"{cut}[{i}] {w} words > {maxw}")
check("video", video, 25)
check("web", web)
assert 18 <= len(video) <= 24, len(video)
assert 35 <= len(web) <= 50, len(web)
if errs:
    print("\n".join(errs)); sys.exit(1)

def est(items):
    t = 0
    for it in items:
        if it["type"] == "msg": t += 0.9 + 0.18 * it["_words"]
        elif it["type"] == "typing": t += 1.0
        elif it.get("tag") == "endcard": t += 2.5
        else: t += 0.8
    return t
vw = sum(it.get("_words", 0) for it in video)
print("video items", len(video), "quote words", vw, "est secs", round(est(video), 1))
print("web items", len(web), "quote words", sum(it.get("_words", 0) for it in web), "est secs", round(est(web), 1))
print("max video words", max(it.get("_words", 0) for it in video))

def clean(items):
    out = []
    for it in items:
        d = {k: v for k, v in it.items() if not k.startswith("_") and k != "qid"}
        out.append(d)
    return out
json.dump({"video": clean(video), "web": clean(web)}, open(f"{OUT}/script.json", "w"), ensure_ascii=False, indent=2)

# ---- sources.md ----
used_v = {it["qid"] for it in video if it["type"] == "msg"}
used_w = {it["qid"] for it in web if it["type"] == "msg"}
order = [k for k in Q if k in used_v or k in used_w]
shown = {}
for cut, items in (("Video", video), ("Web", web)):
    for it in items:
        if it["type"] == "msg":
            shown.setdefault(it["qid"], {})[cut] = it["text"]
L = ["# The Founders' Group Chat: sources", "",
     "Every chat bubble is a verbatim quote (original spelling and capitalization kept). '…' marks a trim: words were removed, never changed or added. Bubbles tagged *as reported* or *as recorded* are documented reports of things said aloud, not writings.", "",
     "Labels under bubbles (e.g. 'on wine', 'about John Adams', 'Forwarded · 1736', 'Read') and lines like 'X left the chat' or the renamed conversation are interface captions, not quotes. 'Forwarded' marks a quote older than the chat, placed out of order for a juxtaposition joke; its real date is shown.", "",
     "## Quotes", ""]
for n, k in enumerate(order, 1):
    sp, full, doc, dlabel, url, note = Q[k]
    cuts = " + ".join(c for c in ("Video", "Web") if c in shown.get(k, {}))
    L.append(f"### {n}. {sp}")
    L.append(f"> {full}")
    L.append("")
    L.append(f"- **Document:** {doc}")
    L.append(f"- **Date:** {dlabel}")
    L.append(f"- **URL:** {url}")
    L.append(f"- **Used in:** {cuts}")
    for c, t in shown[k].items():
        if norm(t) != norm(full):
            L.append(f"- **{c} cut shows (trimmed):** {t}")
    if note: L.append(f"- **Note:** {note}")
    L.append("")
L += ["## Interface lines (not quotes)", "",
      "- *Thomas Jefferson named the conversation “The United States of America”* (Jul 4, 1776): gag for the Declaration of Independence, adopted 4 July 1776; Jefferson wrote the draft. https://www.archives.gov/founding-docs/declaration-transcript",
      "- *Benjamin Franklin left the chat* (web): Franklin died 17 April 1790.",
      "- *George Washington left the chat* (web): Washington died 14 December 1799.",
      "- *Alexander Hamilton left the chat* (web): Hamilton died 12 July 1804, after his duel with Burr on 11 July.",
      "- *Thomas Jefferson left the chat* (Jul 4, 1826, around noon): Jefferson died at Monticello around midday on 4 July 1826. https://www.monticello.org/encyclopedia/jeffersons-last-words",
      "- *John Adams left the chat* (web, Jul 4, 1826, evening): Adams died at Quincy later the same day.",
      "- Typing indicators and the 'Read' receipt are interface beats only.", "",
      "## Deliberately avoided", "",
      "- 'Jefferson still lives' / 'Thomas Jefferson still survives' (later polished variants of Adams's reported words).",
      "- Any suggestion that Adams knew Jefferson was dying: neither man knew; the news went by post days later. The chat shows Jefferson leaving before Adams's line only so the viewer, not Adams, sees the irony.",
      "- Jefferson's 'I resign my spirit to God, my daughter to my country' (poorly documented).",
      "- Lines from the musicals *1776* and *Hamilton*, HBO's *John Adams*, 'beer is proof that God loves us', 'hang together or hang separately', the cherry tree, and 'Well-behaved women seldom make history'.",
      "- The 1755 'essential Liberty' line is real but is left out: it was about taxing the Penn family's lands and is usually misread.",
      ""]
open(f"{OUT}/sources.md", "w").write("\n".join(L))
print("ok")
