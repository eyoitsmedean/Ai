import json
D = json.load(open("/home/user/Ai/muricaenjoyer/the-63/parks.json"))
SPECIAL = {
    "National Park of American Samoa": "American Samoa",
    "Redwood National and State Parks": "Redwood",
    "Haleakala National Park": "Haleakalā",
    "Hawaii Volcanoes National Park": "Hawaiʻi Volcanoes",
}
def short(name):
    if name in SPECIAL: return SPECIAL[name]
    for suf in (" National Park and Preserve", " National Park"):
        if name.endswith(suf): return name[: -len(suf)]
    raise ValueError(name)
parks = [{"rank": p["rank"], "tier": p["tier"], "name": p["name"], "short": short(p["name"]), "states": p["states"],
          "visits2024": p.get("visits2024"), "signature": p["signature"], "take": p["take"]} for p in D["parks"]]
assert len(parks) == 63
tpl = open("/tmp/claude-0/-home-user-Ai/4f57403e-e6b4-5a71-86f2-3d74a2cd5eb2/scratchpad/cd/tpl.html").read()
out = tpl.replace("/*DATA*/", json.dumps(parks, ensure_ascii=False))
import os; os.makedirs("/home/user/Ai/muricaenjoyer/the-63/video", exist_ok=True)
open("/home/user/Ai/muricaenjoyer/the-63/video/countdown.html", "w").write(out)
print("ok")
