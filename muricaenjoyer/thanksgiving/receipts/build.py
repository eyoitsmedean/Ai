# Fills template.src.html with the Thanksgiving receipt cards -> template.html.
# Render: node ../../founders/receipts/render.js template.html . tg-receipt- 3
import json, os
here = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(f"{here}/../script.json", encoding="utf-8"))
P = {k: {"name": v["name"], "ini": v["ini"], "col": v["col"]} for k, v in S["people"].items() if k in ("SH", "BF", "CG")}
R = [
    dict(who="SH", date="September 28, 1863", fs=64,
         q="This subject is to have the day of our annual Thanksgiving made a National and fixed Union Festival.",
         note="Lincoln proclaimed a national Thanksgiving five days later.",
         doc="Sarah Josepha Hale, editor of Godey’s Lady’s Book, to Abraham Lincoln", ddate="28 September 1863",
         urlLab="Library of Congress", url="https://www.loc.gov/resource/mal.2669900/"),
    dict(who="BF", date="January 26, 1784", fs=80, ctx="on the bald eagle",
         q="He is a Bird of bad moral Character.",
         note="He liked the turkey better. He never proposed it as the national bird.",
         doc="Benjamin Franklin to his daughter Sarah Bache, Passy", ddate="26 January 1784",
         urlLab="Founders Online", url="https://founders.archives.gov/documents/Franklin/01-41-02-0327"),
    dict(who="CG", date="December 26, 1941", fs=58,
         q="…the fourth Thursday of November in each year after the year 1941 be known as Thanksgiving Day…",
         note="Roosevelt had moved the holiday up a week in 1939. Congress fixed the date for good.",
         doc="Joint resolution H.J. Res. 41 (Public Law 77-379), approved by Franklin D. Roosevelt", ddate="26 December 1941",
         urlLab="GovInfo", url="https://www.govinfo.gov/content/pkg/STATUTE-55/pdf/STATUTE-55-Pg862.pdf"),
]
s = open(f"{here}/template.src.html", encoding="utf-8").read()
s = s.replace("__P__", json.dumps(P, ensure_ascii=False)).replace("__R__", json.dumps(R, ensure_ascii=False))
open(f"{here}/template.html", "w", encoding="utf-8").write(s)
print("cards", len(R))
