import json, sys
d = json.load(open(sys.argv[1]))
W = {"scenery":4,"uniqueness":3,"crowdToWow":1.5,"access":1.5}
for p in d:
    s = p["scores"]; p["score"] = sum(W[k]*s[k] for k in W)
d.sort(key=lambda p:(-p["score"],-p["scores"]["scenery"],-p["scores"]["uniqueness"],-p["scores"]["crowdToWow"],p["name"]))
OV = {"Yosemite National Park":3,"Zion National Park":3,"Acadia National Park":3,"Glacier National Park":3,
"Yellowstone National Park":2,"Big Bend National Park":2,
"National Park of American Samoa":-3,"Gates of the Arctic National Park and Preserve":-3,"White Sands National Park":-3,
"Petrified Forest National Park":-2,"Gateway Arch National Park":-3,"Kobuk Valley National Park":-2}
for i,p in enumerate(d,1):
    p["base"]=i; o=OV.get(p["name"],0); p["ov"]=o
    p["key"]= i - o - (0.5 if o>0 else -0.5 if o<0 else 0)
f = sorted(d,key=lambda p:p["key"])
for i,p in enumerate(f,1):
    flag = "" if abs(i-p["base"])<=3 else "  <-- >3"
    print(f'{i:2d} b{p["base"]:2d} ov{p["ov"]:+d} {p["score"]:5.1f} {p["name"]}{flag}')
