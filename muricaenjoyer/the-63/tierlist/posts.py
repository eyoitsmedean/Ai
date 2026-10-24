"""Write post-text.md: 3 main-post options, a 5-post S-tier reveal thread, a method reply and alt text.
Counts use X's weighting (code points up to U+10FF count 1, others 2; URLs count 23)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HERE, "..", "parks.json")))
parks = sorted(d["parks"], key=lambda p: p["rank"])
R = {p["rank"]: p for p in parks}

# sanity checks on every number quoted below
assert R[1]["name"].startswith("Grand Canyon") and R[1]["score"] == 92.5
assert max(p["score"] for p in parks if p["rank"] != 1) < 90
assert R[2]["name"].startswith("Yellowstone") and R[2]["baseRank"] == 4 and R[2]["established"] == 1872
assert R[3]["name"].startswith("Bryce")
assert R[4]["name"].startswith("Hawaii Volcanoes")
assert R[5]["name"].startswith("White Sands") and R[5]["baseRank"] == 2 and R[5]["score"] == 88.5
assert R[6]["name"].startswith("Crater Lake")
def rk(prefix):
    return next(p["rank"] for p in parks if p["name"].startswith(prefix))
assert (rk("Yosemite"), rk("Zion"), rk("Great Smoky"), rk("Acadia"), rk("Rocky Mountain"), rk("Cuyahoga"), rk("Glacier National")) == (24, 34, 51, 47, 40, 63, 20)
assert d["method"]["overridesUsed"] == 12

def xlen(s):
    import re
    s2 = re.sub(r"https?://\S+", "x" * 23, s)
    return sum(1 if ord(c) <= 0x10FF else 2 for c in s2)

MAIN = [
    ("Fight bait",
     "I ranked all 63 U.S. national parks.\n\n"
     "Yosemite is #24. Zion is #34. The Smokies, America's most-visited national park, are #51.\n\n"
     "I stand by every single one of these. Fight me."),
    ("Receipts first",
     "The 63: every U.S. national park, ranked.\n\n"
     "Scored on scenery (40%), uniqueness (30%), crowd-to-wow (15%) and access (15%). "
     "Then I let myself move 12 parks, max 3 spots each, with a written reason for every move.\n\n"
     "Method + data in the replies."),
    ("Most American",
     "America invented the national park in 1872. Then we made 62 more.\n\n"
     "Here are all 63, ranked. There are no bad ones, but there is a #63, and Ohio is not going to like it."),
]

THREAD = [
    "S tier, counted down.\n\n"
    "#6 Crater Lake (OR): 1,943 ft deep, the deepest lake in the U.S., filled almost entirely by rain and snow.\n\n"
    "#5 White Sands (NM): the world's largest gypsum dunefield, 275 square miles of white sand that stays cool enough to sled on in July.",

    "#4 Hawaiʻi Volcanoes (HI): the only park that keeps making more America. "
    "Kīlauea's lava flows have added brand-new land to the island, and Mauna Loa, in the same park, "
    "is the largest active volcano on Earth.",

    "#3 Bryce Canyon (UT): fun fact, it isn't a canyon. It's a chain of giant natural amphitheaters "
    "holding the largest concentration of hoodoos on Earth, and the mostly flat Rim Trail lets you "
    "see them without breaking a sweat.",

    "#2 Yellowstone (WY/MT/ID): in 1872 the U.S. invented the national park, and more than 100 countries copied the idea. "
    "It still holds roughly half of the world's active geysers.\n\n"
    "The formula had it #4. I moved it up 2 and will defend that in court.",

    "#1 Grand Canyon (AZ): a mile deep, 277 river miles long, and the only park to score above 90 (92.5 out of 100).\n\n"
    "It's still the only view in America that makes a busload of strangers go quiet at the same moment.",
]

METHOD = ("How the list works: every park scored 1-10 on scenery (40%), uniqueness (30%), crowd-to-wow (15%) "
          "and access (15%), for a score out of 100. Ties go to better scenery. "
          "Then 12 editor's moves, max 3 spots each, all with written reasons. "
          "Full data: [LINK]")

def short(name):
    special = {"National Park of American Samoa": "American Samoa", "Redwood National and State Parks": "Redwood",
               "Haleakala National Park": "Haleakalā", "Hawaii Volcanoes National Park": "Hawaiʻi Volcanoes"}
    if name in special: return special[name]
    for suf in (" National Park and Preserve", " National Park"):
        if name.endswith(suf): return name[: -len(suf)]
ALT = ("Tier list: THE 63, National Parks Power Rankings, ranked #1 to #63. " +
       " ".join(f"{t}: " + ", ".join(short(p['name']) for p in parks if p["tier"] == t) + "."
                for t in "SABCD"))

for i, (_, t) in enumerate(MAIN, 1):
    assert xlen(t) <= 280, (i, xlen(t))
for i, t in enumerate(THREAD, 1):
    assert xlen(t) <= 280, (i, xlen(t))
assert xlen(METHOD) <= 280, xlen(METHOD)
assert len(ALT) <= 1000, len(ALT)

def block(t):
    return "\n".join("> " + line if line else ">" for line in t.split("\n"))

out = ["# The 63: post copy for X", "",
       "Image: `the-63-tierlist.png` (1600x2000, 4:5) on the main post. "
       "`the-63-tierlist-16x9.png` (1600x900) is the link-preview/OG image. "
       "Character counts use X's weighting; every post fits the free 280 limit.", "",
       "## Main post: pick one", ""]
for i, (label, t) in enumerate(MAIN, 1):
    out += [f"### Option {i}: {label} ({xlen(t)} chars)", "", block(t), ""]
out += ["## Reply thread: the S tier, one by one", "",
        "Post these as replies under the main post, in order. The S tier has six parks and the thread has five posts, "
        "so #6 and #5 share the opener and #1 gets its own post at the end.", ""]
for i, t in enumerate(THREAD, 1):
    out += [f"### {i}/5 ({xlen(t)} chars)", "", block(t), ""]
out += ["## Method + data reply (post last)", "",
        "The image footer promises \"method + data in the replies\", so close the thread with this. "
        "Swap `[LINK]` for the data page; any URL counts as 23 characters.", "",
        f"({xlen(METHOD)} chars with a link)", "", block(METHOD), "",
        "## Image alt text", "",
        f"Paste into the image description on the main post ({len(ALT)} of 1,000 characters).", "",
        block(ALT), "",
        "## Fact sources", "",
        "Every number above comes from `parks.json` (scores, ranks, formula rank, establishment year, the 92.5 top score, "
        "Crater Lake's 1,943 ft depth, White Sands' 275 square miles, Grand Canyon's 277 river miles, the half-of-the-world's-geysers figure). "
        "Two lines are general NPS park facts rather than dataset fields: "
        "Bryce is a series of amphitheaters rather than a true canyon with the largest concentration of hoodoos on Earth, "
        "and Mauna Loa is the largest active volcano on Earth.", ""]
open(os.path.join(HERE, "..", "post-text.md"), "w").write("\n".join(out))
print(json.dumps({"main": [xlen(t) for _, t in MAIN], "thread": [xlen(t) for t in THREAD],
                  "method": xlen(METHOD), "alt": len(ALT)}))
