import json, re
SRC = "input.json"; OUT = "parks.json"
d = json.load(open(SRC))
assert len(d) == 63, len(d)
by = {p["name"]: p for p in d}

# ---- (1) data fixes -------------------------------------------------------
FIXES = [
 ("Katmai National Park and Preserve", "acres", 4093077, 3674530,
  "Input used park + preserve (about 4.09M acres). Changed to the national park portion (about 3.67M acres) to match how Denali, Gates of the Arctic, Glacier Bay, Wrangell-St. Elias and Great Sand Dunes are listed."),
 ("Lake Clark National Park and Preserve", "acres", 4030006, 2619816,
  "Input used park + preserve (about 4.03M acres). Changed to the national park portion (about 2.62M acres) for consistency with the other park-and-preserve units."),
 ("New River Gorge National Park and Preserve", "acres", 72808, 7021,
  "Input used park + preserve (about 72,800 acres). The national park portion is only about 7,021 acres; the rest is preserve. Changed for consistency."),
]
for name, field, old, new, why in FIXES:
    p = by[name]; assert p[field] == old, (name, p[field]); p[field] = new; p["dataFix"] = why
    p["visitsNote"] = p["visitsNote"].replace(" Acreage is park plus preserve.", "")

# ---- (2) formula ---------------------------------------------------------
W = {"scenery": 4.0, "uniqueness": 3.0, "crowdToWow": 1.5, "access": 1.5}   # x10 of 40/30/15/15 -> 0-100
for p in d:
    p["score"] = round(sum(W[k] * p["scores"][k] for k in W), 1)
d.sort(key=lambda p: (-p["score"], -p["scores"]["scenery"], -p["scores"]["uniqueness"], -p["scores"]["crowdToWow"], p["name"]))
for i, p in enumerate(d, 1):
    p["baseRank"] = i

OV = {
 "Yellowstone National Park": (2, "No other park does as many things at a world-class level: geysers, Grand Prismatic, the Grand Canyon of the Yellowstone, and the best wildlife watching in the Lower 48. Its 2.2 million acres also spread crowds out better than the crowd score assumes."),
 "White Sands National Park": (-3, "It really is one of a kind, but most visits are a half-day of sledding and a scenic drive. It doesn't have the depth of the parks it would otherwise outrank, though it stays in S tier."),
 "Gates of the Arctic National Park and Preserve": (-3, "Spectacular, but with no roads, trails or facilities it is realistically a park for expedition backpackers and fly-in trips. The 15% access weight doesn't fully capture that."),
 "National Park of American Samoa": (-3, "Gorgeous and singular, but it takes a long trip through Honolulu on a few flights a week, and visitor services are minimal, so most readers will never get there."),
 "Glacier National Park": (3, "Going-to-the-Sun Road is arguably the finest drive in the country. The park's glaciers are also shrinking fast, from about 150 in 1850 to 26 in the most recent USGS count, so seeing them is a now-or-never trip."),
 "Yosemite National Park": (3, "The formula hits Yosemite twice for crowds (low crowd-to-wow, middling access). Yosemite Valley is still the most iconic single landscape in the system, and the Tuolumne high country absorbs plenty of people."),
 "Petrified Forest National Park": (-2, "A great road-trip stop with easy access, but most visits last two to three hours, and its high access and uniqueness scores overstate it as a destination."),
 "Zion National Park": (3, "The Narrows and Angels Landing are bucket-list hikes, and the canyon shuttle keeps the crowds orderly. The crowd penalty is real but overstated."),
 "Big Bend National Park": (2, "Its low access score reflects distance, not difficulty. Once you arrive the roads are paved, and the hot springs on the Rio Grande and some of the darkest skies in the Lower 48 repay the drive."),
 "Rocky Mountain National Park": (3, "Elk in the meadows and alpine tundra you can drive to make it one of the best wildlife-and-summit days in the country. A uniqueness score of 6 sells that short."),
 "Acadia National Park": (3, "Ocean cliffs, granite summits and 45 miles of carriage roads fit into one compact island park. Few places pack more variety into a single day."),
 "Gateway Arch National Park": (-3, "A superb monument, but at 193 acres it is a memorial with a museum and a tram, not a park you spend a day exploring."),
}
for n in OV: assert n in by, n
N = len(d); slots = [None] * (N + 1)
for p in d:
    o, why = OV.get(p["name"], (0, None)); p["override"] = o; p["overrideReason"] = why
    if o:
        t = p["baseRank"] - o; assert 1 <= t <= N and slots[t] is None, (p["name"], t); slots[t] = p
rest = iter([p for p in d if not p["override"]])
for i in range(1, N + 1):
    if slots[i] is None: slots[i] = next(rest)
final = slots[1:]
for i, p in enumerate(final, 1):
    p["rank"] = i
    assert abs(p["rank"] - p["baseRank"]) <= 3, (p["name"], p["baseRank"], p["rank"])
    if p["override"]: assert p["rank"] == p["baseRank"] - p["override"]

# ---- (3) tiers -----------------------------------------------------------
TIERS = [("S", 1, 6, "Pilgrimage parks. Rearrange your life to see these."),
         ("A", 7, 24, "Plan the trip. Worth a dedicated vacation."),
         ("B", 25, 40, "Absolutely worth it. Build a road trip around these."),
         ("C", 41, 53, "Great if you're in the neighborhood, and some are better than the number says."),
         ("D", 54, 63, "Lovable underdogs. America doesn't make a bad national park; these just show off less.")]
for p in final:
    p["tier"] = next(t for t, a, b, _ in TIERS if a <= p["rank"] <= b)

# ---- (4) takes -----------------------------------------------------------
TAKES = {
 "Grand Canyon National Park": "It is a mile deep and 277 river miles long, and it's still the only view in America that makes a busload of strangers go quiet at the same moment.",
 "Yellowstone National Park": "The world's first national park still out-performs everyone, with half the planet's active geysers, bison traffic jams and a hot spring the colors of a rainbow.",
 "Bryce Canyon National Park": "Thousands of orange hoodoos stand at attention like a stone color guard, and the mostly flat Rim Trail lets you review the troops without breaking a sweat.",
 "Hawaii Volcanoes National Park": "It's the only park that keeps making more America, as Kīlauea has added brand-new land at no cost to the taxpayer.",
 "White Sands National Park": "It protects most of the world's largest gypsum dunefield (275 square miles in all), and its white gypsum stays cool enough to sled on in July, which is the closest any American gets to landing on another planet without NASA.",
 "Crater Lake National Park": "At 1,943 feet it's the deepest lake in the country, it's so blue it looks photoshopped, and it fills itself almost entirely with rain and snow.",
 "North Cascades National Park": "More than 300 glaciers, jagged peaks and a lake the color of a sports drink, and almost nobody shows up, which makes it the best-kept secret in the Lower 48.",
 "Redwood National and State Parks": "These are the tallest trees on Earth, led by Hyperion, whose location is kept secret like a tree in witness protection.",
 "Wrangell-St. Elias National Park and Preserve": "Park and preserve together cover about 13.2 million acres, roughly Yellowstone, Yosemite and Switzerland combined, and the road in is 60 miles of gravel, so pack a spare tire and a sense of destiny.",
 "Death Valley National Park": "It sits 282 feet below sea level and holds the 134°F world heat record, so the hottest place on Earth is, naturally, American.",
 "Haleakala National Park": "Drive to 10,023 feet, watch the sun come up over a sea of clouds, and your alarm clock finally earns its keep.",
 "Olympic National Park": "Rainforest, glaciers and wild Pacific beaches share one park: America ordered the sampler platter and got the whole buffet.",
 "Gates of the Arctic National Park and Preserve": "No roads, no trails and no gift shop, just you, a bush plane and more elbow room per American than anywhere else in the Union.",
 "National Park of American Samoa": "It's the only national park south of the equator, with the same Constitution, the seasons flipped and fruit bats that have three-foot wingspans.",
 "Arches National Park": "More than 2,000 natural stone arches prove that in America even the rocks know how to make a grand entrance.",
 "Kenai Fjords National Park": "Calving glaciers, humpbacks and puffins, and you can drive to the front door from Anchorage: Alaska's starter pack, deluxe edition.",
 "Lake Clark National Park and Preserve": "Volcanoes, turquoise lakes, bears on the beach and Dick Proenneke's handmade cabin, all reachable only by small plane: the VIP section of the American frontier.",
 "Denali National Park and Preserve": "A 20,310-foot mountain so big it makes its own weather, plus the Park Service's only sled-dog kennel, because America does not do subtle.",
 "Grand Teton National Park": "These mountains skipped the foothills and went straight to poster, and the Tetons have never had a bad angle.",
 "Glacier National Park": "Going-to-the-Sun Road is a 50-mile argument that the best things in America are worth the reservation, so go while the namesake glaciers are still there.",
 "Mount Rainier National Park": "A 14,410-foot glacier-wrapped volcano hogs the whole horizon above the wildflower meadows: the national anthem in mountain form.",
 "Black Canyon of the Gunnison National Park": "The walls are so steep and narrow that parts of the gorge get about 33 minutes of sun a day, and the Painted Wall dwarfs the Empire State Building.",
 "Canyonlands National Park": "The Colorado and Green Rivers carved a whole country inside the country, and there's barely a line at the entrance.",
 "Yosemite National Park": "El Capitan is a 3,000-foot granite wall that people climb for fun, and the rest of us salute it from a meadow with a sandwich and a few thousand new friends.",
 "Great Sand Dunes National Park and Preserve": "Sahara-grade dunes parked in front of 13,000-foot peaks, plus a pop-up beach creek every spring: Colorado had extra and shared.",
 "Petrified Forest National Park": "Logs turned to rainbow quartz over 200 million years, plus a stretch of Route 66, so you get your kicks and a geology lesson in one afternoon.",
 "Katmai National Park and Preserve": "Salmon jump straight into a bear's mouth at Brooks Falls, the most efficient drive-thru in America, reachable mainly by floatplane.",
 "Mesa Verde National Park": "Ancestral Puebloans built apartment complexes into cliffs some 800 years ago, with better views than most modern penthouses.",
 "Dry Tortugas National Park": "Somebody looked at open sea 70 miles past Key West and decided it needed 16 million bricks, and that was the correct call.",
 "Joshua Tree National Park": "Trees drawn by Dr. Seuss, boulders stacked by a giant with free time, and a night sky that makes you want to salute the Milky Way.",
 "Lassen Volcanic National Park": "It has all four types of volcano plus boiling mud pots, as Yellowstone's understudy nailed the audition and kept the crowds away.",
 "Sequoia National Park": "General Sherman is the largest tree on Earth by volume and has been standing at attention for about 2,200 years, so it outranks everybody.",
 "Saguaro National Park": "Saguaros usually don't grow their first arm until around age 50, so every cactus waving at you is a distinguished senior citizen, and you should wave back.",
 "Zion National Park": "In Utah's first national park the trail is literally a river, so bring water shoes, patriotic resolve and patience for the shuttle line.",
 "Channel Islands National Park": "The Galapagos of North America is an hour's boat ride from Ventura, with a fox the size of a house cat and no resort fee.",
 "Carlsbad Caverns National Park": "An elevator drops you 750 feet into a room the size of six football fields, because America doesn't just go big, it goes big in the basement.",
 "Glacier Bay National Park and Preserve": "Skyscraper-sized ice falls into the sea on a loose schedule while you watch from a deck with coffee: freedom, served chilled.",
 "Kings Canyon National Park": "It's deeper than the Grand Canyon in spots and home to the official Nation's Christmas Tree, because of course America has one, and it stands 267 feet tall.",
 "Big Bend National Park": "It's so far from everything that the stars outnumber the traffic lights about infinity to zero: Texas-sized, taken literally.",
 "Rocky Mountain National Park": "Trail Ridge Road crests at 12,183 feet, so you can summit the continent without leaving the driver's seat, which is peak American efficiency.",
 "Mammoth Cave National Park": "It's the longest known cave system on Earth, at 400-plus miles and counting, so America doesn't just win, it wins underground.",
 "Isle Royale National Park": "It's an island in a lake so big it has its own islands, where the moose outnumber you and the wolves keep the books.",
 "Virgin Islands National Park": "About 60 percent of St. John is national park, and the Trunk Bay snorkel trail has signs on the seafloor, making it America's most hydrated interpretive program.",
 "Everglades National Park": "It's the only place on Earth where alligators and crocodiles share a zip code, and they have agreed to keep it civil.",
 "Kobuk Valley National Park": "Sahara-style sand dunes sit above the Arctic Circle with caribou strolling through, because America simply refused to pick one climate.",
 "Capitol Reef National Park": "Hike past 270-million-year-old rock, then finish with a fresh pie from the Gifford Homestead: life, liberty and the pursuit of cherry.",
 "Acadia National Park": "Cadillac Mountain gets the nation's first sunrise for half the year, so Maine clocks in early for all 50 states.",
 "Badlands National Park": "Settlers on foot called them bad lands, but with a paved loop road and air conditioning they're a layer cake of freedom, and the prairie dogs are the welcome committee.",
 "Wind Cave National Park": "The cave breathes with the barometric pressure while bison mow the prairie upstairs, which makes it a two-story national treasure.",
 "New River Gorge National Park and Preserve": "The 'New' River is one of the oldest on the continent, a very American way to name things, and once a year you can legally parachute off the bridge.",
 "Great Smoky Mountains National Park": "There's no entrance fee (just a parking tag), there are misty ridges and it's the most biodiverse park in the system, so 12 million people a year can't be wrong, though they can all be at Cades Cove at once.",
 "Congaree National Park": "Champion trees outgrow the Statue of Liberty minus her pedestal, and the fireflies blink in unison like they rehearsed for the Fourth.",
 "Great Basin National Park": "The bristlecone pines were already ancient when the Founders were born, and the skies are dark enough to read the Milky Way's full resume.",
 "Theodore Roosevelt National Park": "These are the badlands Teddy credited with making him President, with bison and wild horses at no extra charge: a D on our scale and an A-plus in spirit.",
 "Gateway Arch National Park": "It's a really nice arch: 630 feet of stainless-steel 1960s confidence with a tiny egg-pod tram to the top, just more monument than park.",
 "Voyageurs National Park": "The main road is a lake and you bring the boat, which is wonderful if you own a canoe and a mystery if you don't.",
 "Pinnacles National Park": "A volcano slid about 195 miles up the San Andreas Fault and is now patrolled by condors, a great story told in a park you can see in a day.",
 "Indiana Dunes National Park": "Sand dunes, Lake Michigan surf and a cameo from the Chicago skyline: America put a beach in Indiana and dared the oceans to complain.",
 "Shenandoah National Park": "105 miles of Skyline Drive at a stately 35 mph make it the most relaxing traffic jam in America, best enjoyed in October.",
 "Biscayne National Park": "The park is 95 percent water with a view of the Miami skyline, glorious if you have a boat and a snorkel and mostly a visitor center if you don't.",
 "Guadalupe Mountains National Park": "The rooftop of Texas is a 260-million-year-old fossil reef, and the climb up Guadalupe Peak is the best leg day in the Lone Star State.",
 "Hot Springs National Park": "Protected in 1832, forty years before Yellowstone, it's a historic spa street with a national park attached, and its bathhouses were doing self-care before anyone called it that.",
 "Cuyahoga Valley National Park": "A waterfall, a scenic railroad and a towpath half an hour from Cleveland: dead last on our board, but the most pleasant last place in the country.",
}
assert set(TAKES) == set(by), set(by) ^ set(TAKES)
for p in final:
    t = TAKES[p["name"]]
    assert len(re.findall(r"[.!?](\s|$)", re.sub(r"\b(Dr|St)\. ", "X ", t))) == 1 and t.endswith("."), p["name"]
    p["take"] = t

# ---- (5) awards ----------------------------------------------------------
R = {p["name"]: p for p in final}
vis = sorted([p for p in final if isinstance(p["visits2024"], int)], key=lambda p: -p["visits2024"])
vrank = {p["name"]: i for i, p in enumerate(vis, 1)}
gap = sorted(vis, key=lambda p: -(p["rank"] - vrank[p["name"]]))
assert gap[0]["name"] == "Great Smoky Mountains National Park", [(g["name"], g["rank"] - vrank[g["name"]]) for g in gap[:3]]
c10 = sorted([p for p in final if p["scores"]["crowdToWow"] == 10], key=lambda p: p["rank"])
assert c10[0]["name"] == "North Cascades National Park"
smoky, zion = R["Great Smoky Mountains National Park"], R["Zion National Park"]
ratio = smoky["visits2024"] / zion["visits2024"]
AW = [
 {"award": "Best for little kids", "park": "White Sands National Park", "rank": R["White Sands National Park"]["rank"],
  "reason": "Sledding down soft white gypsum dunes (the park store sells saucers and wax), sand that stays cool in summer, a short Interdune Boardwalk and a paved scenic drive. It's an S-tier park that a five-year-old enjoys as much as you do.",
  "runnerUp": "Great Sand Dunes National Park and Preserve (Medano Creek turns into a pop-up beach in late spring)"},
 {"award": "Best crowd-to-wow", "park": "North Cascades National Park", "rank": R["North Cascades National Park"]["rank"],
  "reason": f"It's the highest-ranked park with a perfect 10 crowd-to-wow: more than 300 glaciers and turquoise Diablo Lake, with just {R['North Cascades National Park']['visits2024']:,} recorded visits in 2024, one of the lowest counts of any national park. State Route 20 through the surrounding park complex puts the Diablo Lake overlook steps from your car, so you don't even need a bush plane.",
  "runnerUp": "Wrangell-St. Elias National Park and Preserve"},
 {"award": "Most underrated", "park": "Black Canyon of the Gunnison National Park", "rank": R["Black Canyon of the Gunnison National Park"]["rank"],
  "reason": "Its raw score (81.0) beats Glacier, Yosemite and Zion. The 2,000-foot-plus walls and the Painted Wall are a top-tier sight, yet it typically draws only around 300,000 visits a year (approximate), while Rocky Mountain, a few hours east, logged about 4.15 million in 2024.",
  "runnerUp": f"Lassen Volcanic National Park (Yellowstone-style mud pots and fumaroles with about {R['Lassen Volcanic National Park']['visits2024']:,} visits in 2024)"},
 {"award": "Most overrated (with love)", "park": "Great Smoky Mountains National Park", "rank": smoky["rank"],
  "reason": f"It was #1 in 2024 visits (about {smoky['visits2024']/1e6:.2f} million, roughly {ratio:.1f} times second-place Zion) but is #{smoky['rank']} on our board, the widest gap between popularity and score of any park with 2024 data. To be fair, it's free to enter (you just need a parking tag), it's the most biodiverse park in the system and it's within a day's drive of a huge share of Americans. Its fame comes from where it is and what it costs more than from views you can't find anywhere else.",
  "runnerUp": "Hot Springs National Park (roughly 2.46 million visits, #62 on our board)"},
 {"award": "Most American", "park": "Yellowstone National Park", "rank": R["Yellowstone National Park"]["rank"],
  "reason": "In 1872 the United States set aside Yellowstone and invented the national park, an idea more than 100 countries have since copied. It has bison, cowboys and geysers that go off on schedule, and Old Faithful is the receipt.",
  "runnerUp": "Theodore Roosevelt National Park (named for the conservation president, in the badlands he said made him President)"},
]

# ---- method + intro ------------------------------------------------------
INTRO = ("Sixty-three national parks, one honest list. We scored every park from 1 to 10 on four things: scenery (does it stop you cold), "
         "uniqueness (could you see this anywhere else), crowd-to-wow (how much awe you get per elbow) and access (how easy it is to actually get there). "
         "Scenery counts 40 percent, uniqueness 30, crowd-to-wow 15 and access 15, for a score out of 100, and ties go to the better scenery. "
         "Then the editor got a short leash: a park can move at most three spots, every move comes with a written reason, and twelve parks moved. "
         "The tiers are bands on the final order. The bottom ten aren't bad parks, because America doesn't make a bad one. They just show off less.")
wc = len(INTRO.split()); assert 105 <= wc <= 135, wc

METHOD = {
 "formula": "score = 10 x (0.40*scenery + 0.30*uniqueness + 0.15*crowdToWow + 0.15*access), on a 0-100 scale; each input is scored 1-10",
 "weights": {"scenery": 0.40, "uniqueness": 0.30, "crowdToWow": 0.15, "access": 0.15},
 "whyTheseWeights": "Scenery and uniqueness decide whether a park is worth the trip. Crowd-to-wow and access get equal, smaller weights because they pull in opposite directions (remote parks are quiet, easy parks are busy), so neither one dominates.",
 "tieBreakers": ["higher scenery", "higher uniqueness", "higher crowdToWow", "alphabetical"],
 "editorsOverride": "Up to +/-3 positions per park (positive = moved up), each with a stated reason. An overridden park is placed exactly at baseRank - override, and every other park keeps its order and fills the remaining slots. No park ends up more than 3 positions from its formula rank.",
 "overridesUsed": sum(1 for p in final if p["override"]),
 "tiers": [{"tier": t, "ranks": f"{a}-{b}", "count": b - a + 1, "meaning": m} for t, a, b, m in TIERS],
 "dataFixes": [{"park": n, "field": f, "from": o, "to": v, "why": w} for n, f, o, v, w in FIXES],
 "dataChecksPassed": "All 63 establishment years and the remaining acreages were checked against known NPS and Wikipedia values. Everything else is within rounding (for example, Yosemite's 761,748 is NPS gross acreage). Establishment years mean national park status, so Everglades (authorized 1934), Guadalupe Mountains (authorized 1966) and Isle Royale (authorized 1931) use their formal establishment dates. That rule is applied consistently and left as is.",
 "visitsCaveat": "visits2024 is null where no reliable calendar-2024 figure was found. Some values are rounded, fiscal-year, or from secondary lists (see each park's visitsNote). Gateway Arch's 2.56M conflicts with a lower Wikipedia figure, so treat it with caution. Visit counts are not part of the score; they are used only for the Most overrated award.",
 "scoresSource": "Scenery, uniqueness, crowd-to-wow and access scores come from the research pass and were not changed. All judgment calls go through the visible overrides.",
}

KEYS = ["rank", "tier", "name", "states", "established", "acres", "visits2024", "signature", "bestMonths", "take",
        "kidFriendly", "scores", "score", "override", "overrideReason", "baseRank", "visitsNote"]
parks = []
for p in final:
    o = {k: p[k] for k in KEYS}
    if "dataFix" in p: o["dataFix"] = p["dataFix"]
    parks.append(o)
out = {"title": "The 63: National Parks Power Rankings", "byline": "@Muricaenjoyer", "method": METHOD, "intro": INTRO, "awards": AW, "parks": parks}
json.dump(out, open(OUT, "w"), indent=2, ensure_ascii=False)
print("intro words", wc)
for p in parks: print(p["rank"], p["tier"], p["baseRank"], f'{p["override"]:+d}', p["score"], p["name"])
