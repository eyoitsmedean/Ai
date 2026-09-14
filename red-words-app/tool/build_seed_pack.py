#!/usr/bin/env python3
"""Build the 100-saying WEB seed pack from public-domain World English Bible text.

Word fields are copied from TehShrike/world-english-bible (WEB). Citations are
accepted only if they appear in data/red-letter-source.json (words Jesus spoke).
Reflections and steps are editorial and must never be treated as Scripture.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
WEB_DIR = pathlib.Path("/tmp/web-bible")
RED_LETTER = ROOT / "data" / "red-letter-source.json"
OUT = pathlib.Path(__file__).resolve().parents[1] / "assets" / "sayings.json"

GOSPELS = ("Matthew", "Mark", "Luke", "John")
FIRST_ID = "anxiety-mt-6-34"

# id, book, start, end, tags, chips, reflection, step
# Reflections/steps are editorial. Words come only from WEB.
SPECS: list[tuple] = [
    ("anxiety-mt-6-34", "Matthew", 6, 34, 34, ["anxiety", "worry", "tomorrow"], ["anxiety", "tomorrow"],
     "Tomorrow is not in your hands. This day is enough.",
     "Name one thing that is actually yours to do before nightfall."),
    ("beatitudes-poor", "Matthew", 5, 3, 3, ["blessed", "poor", "spirit"], ["blessed"],
     "Emptiness is not a failure here.",
     "Sit with being poor in spirit instead of covering it."),
    ("beatitudes-mourn", "Matthew", 5, 4, 4, ["grief", "mourn", "comfort"], ["grief"],
     "Tears are not a detour from Him.",
     "Let one grief be named without fixing it."),
    ("beatitudes-meek", "Matthew", 5, 5, 5, ["meek", "humble"], ["meek"],
     "Strength that does not grab is still strength.",
     "Yield one argument you were rehearsing."),
    ("beatitudes-hunger", "Matthew", 5, 6, 6, ["hunger", "righteousness"], ["hunger"],
     "The ache for what is right is itself a kind of prayer.",
     "Do one just thing you have been postponing."),
    ("beatitudes-mercy", "Matthew", 5, 7, 7, ["mercy", "forgive"], ["mercy"],
     "Mercy received becomes mercy given.",
     "Offer one small mercy where you wanted a score."),
    ("beatitudes-pure", "Matthew", 5, 8, 8, ["pure", "heart", "see"], ["heart"],
     "A clear heart sees farther than a crowded one.",
     "Put down one secret you have been polishing."),
    ("beatitudes-peacemakers", "Matthew", 5, 9, 9, ["peace", "peacemaker"], ["peace"],
     "Peace is made, not announced.",
     "Take one quiet step toward a rift."),
    ("salt-earth", "Matthew", 5, 13, 13, ["salt", "earth"], ["salt"],
     "Presence can season a room without a speech.",
     "Be present in one place you usually disappear."),
    ("light-world", "Matthew", 5, 14, 16, ["light", "world", "shine"], ["light"],
     "Light is for houses, not hiding places.",
     "Do one good work without announcing it."),
    ("love-enemies", "Matthew", 5, 44, 44, ["love", "enemies", "pray"], ["enemies"],
     "Prayer for an enemy is not agreement. It is obedience.",
     "Pray one honest sentence for someone who wounded you."),
    ("secret-prayer", "Matthew", 6, 6, 6, ["prayer", "secret", "father"], ["prayer"],
     "The closed door is enough of a chapel.",
     "Pray once today where no one can see."),
    ("lords-prayer", "Matthew", 6, 9, 13, ["prayer", "father", "daily"], ["prayer"],
     "He gave words when we had none.",
     "Pray this slowly, once, without adding to it."),
    ("treasures-heaven", "Matthew", 6, 19, 21, ["treasure", "heart", "heaven"], ["treasure"],
     "The heart follows what it stores.",
     "Release one held thing that is owning you."),
    ("seek-first", "Matthew", 6, 33, 33, ["seek", "kingdom", "first"], ["kingdom"],
     "First things stay first only if you put them first.",
     "Give the first quiet minutes to His kingdom, not your list."),
    ("ask-seek-knock", "Matthew", 7, 7, 8, ["ask", "seek", "knock"], ["ask"],
     "Asking is not a performance.",
     "Ask for one thing you actually need."),
    ("golden-rule", "Matthew", 7, 12, 12, ["golden", "others", "law"], ["others"],
     "The measure you want is the measure you give.",
     "Treat one person as you would hope to be treated."),
    ("narrow-gate", "Matthew", 7, 13, 14, ["narrow", "gate", "life"], ["narrow"],
     "The wide road is crowded because it is easy.",
     "Choose the harder honest path in one decision."),
    ("come-rest", "Matthew", 11, 28, 30, ["rest", "weary", "yoke"], ["rest"],
     "The invitation is to come, not to impress.",
     "Lay down one burden you were never asked to carry."),
    ("little-children", "Matthew", 18, 3, 3, ["children", "humble", "kingdom"], ["children"],
     "Greatness here looks like a child's open hands.",
     "Ask instead of assuming you already know."),
    ("two-or-three", "Matthew", 18, 20, 20, ["together", "name", "present"], ["together"],
     "He does not wait for a crowd.",
     "Sit with one other person in His name."),
    ("forgive-seventy", "Matthew", 18, 22, 22, ["forgive", "seventy"], ["forgive"],
     "Forgiveness is a practice, not a trophy.",
     "Forgive one repeated offense without a speech."),
    ("camel-needle", "Matthew", 19, 24, 24, ["rich", "camel", "needle"], ["rich"],
     "What we clutch can close the way.",
     "Loosen one grip on money or status."),
    ("great-command", "Matthew", 22, 37, 39, ["love", "god", "neighbor"], ["love"],
     "Love of God and neighbor is one movement.",
     "Love God by serving one neighbor in reach."),
    ("whatever-you-did", "Matthew", 25, 40, 40, ["least", "brother", "serve"], ["least"],
     "The hidden ones are not hidden to Him.",
     "Help one person who cannot repay you."),
    ("great-commission", "Matthew", 28, 18, 20, ["go", "nations", "with you"], ["go"],
     "The last word is presence, not performance.",
     "Speak one true word of His, then stay near."),
    ("follow-me-fishers", "Matthew", 4, 19, 19, ["follow", "fishers"], ["follow"],
     "The first call is still follow.",
     "Leave one net that keeps you from walking after Him."),
    ("blessed-persecuted", "Matthew", 5, 10, 12, ["persecuted", "blessed", "reward"], ["persecuted"],
     "Faithfulness can cost, and He still calls it blessed.",
     "Endure one slight without returning it."),
    ("do-not-judge", "Matthew", 7, 1, 2, ["judge", "measure"], ["judge"],
     "The measure you use comes back to you.",
     "Drop one verdict you have no right to settle."),
    ("house-on-rock", "Matthew", 7, 24, 25, ["rock", "hear", "do"], ["rock"],
     "Hearing without doing is sand.",
     "Practice one word you already know."),
    ("take-heart", "Matthew", 14, 27, 27, ["courage", "afraid", "it is i"], ["courage"],
     "He speaks before the wind dies.",
     "Take heart in the storm you are actually in."),
    ("harvest-plentiful", "Matthew", 9, 37, 38, ["harvest", "laborers", "pray"], ["harvest"],
     "The field is not empty. The workers are few.",
     "Pray for laborers, then be one in a small way."),
    ("lost-sheep", "Matthew", 18, 12, 14, ["lost", "sheep", "find"], ["lost"],
     "He leaves the ninety-nine. That is the news.",
     "Go toward one person who drifted, without a lecture."),
    ("let-children", "Matthew", 19, 14, 14, ["children", "kingdom"], ["children"],
     "The kingdom is not too busy for the small.",
     "Make room for a child, or the childlike, today."),
    ("render-caesar", "Matthew", 22, 21, 21, ["caesar", "god", "render"], ["caesar"],
     "Some things are Caesar's. Not everything is.",
     "Give God what you have been giving to lesser lords."),
    ("watch-pray", "Matthew", 26, 41, 41, ["watch", "pray", "flesh"], ["watch"],
     "Willingness is not the same as staying awake.",
     "Watch with Him for a few undistracted minutes."),
    ("i-am-with-you", "Matthew", 28, 20, 20, ["with you", "always", "end"], ["with you"],
     "The ending of Matthew is companionship.",
     "Walk into one hard place as if He is already there."),
    ("follow-me-mk", "Mark", 1, 17, 17, ["follow", "fishers"], ["follow"],
     "The lake can wait. The call cannot.",
     "Follow in one concrete step, not a mood."),
    ("sabbath-man", "Mark", 2, 27, 27, ["sabbath", "man"], ["sabbath"],
     "Rest was made for people, not people for a rule.",
     "Keep one stretch of the day unproductive on purpose."),
    ("peace-be-still", "Mark", 4, 39, 39, ["peace", "still", "storm"], ["peace"],
     "He speaks to weather as if it can hear.",
     "Ask for stillness in the one storm you cannot manage."),
    ("only-believe", "Mark", 5, 36, 36, ["believe", "fear", "afraid"], ["believe"],
     "Fear is loud. He still says only believe.",
     "Believe one word of His against one fear."),
    ("what-profit", "Mark", 8, 36, 36, ["soul", "world", "profit"], ["soul"],
     "The whole world is a poor trade for a soul.",
     "Refuse one gain that would cost who you are."),
    ("take-up-cross", "Mark", 8, 34, 34, ["cross", "follow", "deny"], ["cross"],
     "Following includes a cross, not a brand.",
     "Deny one self-saving move."),
    ("all-things-possible", "Mark", 9, 23, 23, ["possible", "believe"], ["believe"],
     "Belief is not a trick. It is trust in Him.",
     "Bring one impossible thing to Him without a script."),
    ("first-last", "Mark", 9, 35, 35, ["first", "last", "servant"], ["servant"],
     "The front of the line is the basin.",
     "Take the last place in one room."),
    ("let-children-mk", "Mark", 10, 14, 14, ["children", "kingdom"], ["children"],
     "Do not become a wall between Him and the small.",
     "Welcome one person the room overlooks."),
    ("servant-all", "Mark", 10, 43, 45, ["servant", "ransom"], ["servant"],
     "He did not come to be served.",
     "Serve one person who expects nothing."),
    ("have-faith-god", "Mark", 11, 22, 24, ["faith", "pray", "believe"], ["faith"],
     "Prayer is not a lever. It is trust spoken.",
     "Pray one request and leave it with Him."),
    ("love-god-neighbor", "Mark", 12, 30, 31, ["love", "god", "neighbor"], ["love"],
     "All the law leans on these two loves.",
     "Love God with one undivided hour; love a neighbor in it."),
    ("watch-mk", "Mark", 13, 37, 37, ["watch", "all"], ["watch"],
     "The word is to all: watch.",
     "Stay awake to one duty you have been sleeping through."),
    ("go-all-world", "Mark", 16, 15, 15, ["go", "gospel", "world"], ["go"],
     "The news is for every creature, not a club.",
     "Tell one person what He actually said, not a slogan."),
    ("spirit-upon-me", "Luke", 4, 18, 19, ["spirit", "poor", "liberty"], ["poor"],
     "The first sermon is good news to the poor.",
     "Bring liberty, not advice, to one burdened person."),
    ("love-enemies-lk", "Luke", 6, 27, 28, ["love", "enemies", "bless"], ["enemies"],
     "Blessing an enemy is a different kind of power.",
     "Bless, do not curse, one person in your mouth today."),
    ("give-good-measure", "Luke", 6, 38, 38, ["give", "measure"], ["give"],
     "Open hands are how the measure returns.",
     "Give one thing generously and quietly."),
    ("forgive-forgiven", "Luke", 6, 37, 37, ["forgive", "judge", "condemn"], ["forgive"],
     "Forgiveness and judgment cannot share a throne.",
     "Release one person from a private court."),
    ("golden-rule-lk", "Luke", 6, 31, 31, ["others", "do"], ["others"],
     "The simple rule is still the hard one.",
     "Do for one person what you keep wishing someone would do for you."),
    ("go-and-do", "Luke", 10, 36, 37, ["neighbor", "mercy", "do"], ["neighbor"],
     "The neighbor is the one who showed mercy.",
     "Go and do likewise in one ordinary street."),
    ("mary-better", "Luke", 10, 41, 42, ["mary", "martha", "needful"], ["sit"],
     "The better part is sitting, not proving.",
     "Sit with His words before you serve them."),
    ("ask-holy-spirit", "Luke", 11, 13, 13, ["spirit", "ask", "father"], ["spirit"],
     "The Father knows how to give what is good.",
     "Ask for the Holy Spirit more than for ease."),
    ("consider-lilies", "Luke", 12, 27, 28, ["lilies", "anxious", "clothe"], ["lilies"],
     "The field is already dressed.",
     "Look at one ordinary created thing and stop racing."),
    ("fear-not-flock", "Luke", 12, 32, 32, ["fear", "flock", "kingdom"], ["fear"],
     "Little flock is a tender name, not an insult.",
     "Receive the kingdom as gift, not wage."),
    ("where-treasure", "Luke", 12, 34, 34, ["treasure", "heart"], ["treasure"],
     "Follow the treasure and you will find the heart.",
     "Move one treasure toward what lasts."),
    ("repent-perish", "Luke", 13, 3, 3, ["repent", "perish"], ["repent"],
     "Tragedy is not a ranking of sinners.",
     "Repent of one real thing, not a vague mood."),
    ("invite-poor", "Luke", 14, 13, 14, ["poor", "invite", "repay"], ["poor"],
     "The guest list that cannot repay is the honest one.",
     "Invite or help someone who cannot return the favor."),
    ("count-cost", "Luke", 14, 27, 28, ["cross", "cost", "disciple"], ["cost"],
     "Discipleship has a price. He said so.",
     "Count the cost of one obedience you already know."),
    ("lost-found", "Luke", 15, 7, 7, ["lost", "repent", "heaven"], ["lost"],
     "Heaven notices one who turns.",
     "Turn from one wandering without advertising it."),
    ("faithful-little", "Luke", 16, 10, 10, ["faithful", "little", "much"], ["faithful"],
     "The small trust is the real one.",
     "Be faithful in one unnoticed task."),
    ("kingdom-within", "Luke", 17, 20, 21, ["kingdom", "within", "midst"], ["kingdom"],
     "The kingdom is not a spectacle you can point at.",
     "Look for His reign in the midst of this day."),
    ("always-pray", "Luke", 18, 7, 8, ["pray", "justice", "faith"], ["pray"],
     "He hears the ones who cry day and night.",
     "Pray again for the justice you almost gave up on."),
    ("tax-collector", "Luke", 18, 13, 14, ["mercy", "humble", "justified"], ["mercy"],
     "The lowered eyes went home justified.",
     "Pray for mercy instead of comparing yourself."),
    ("son-of-man-seek", "Luke", 19, 10, 10, ["seek", "save", "lost"], ["seek"],
     "He is the seeker. You are not the hunt.",
     "Let yourself be found in one hiding place."),
    ("father-forgive", "Luke", 23, 34, 34, ["forgive", "cross", "know"], ["forgive"],
     "Forgiveness from the cross is the measure.",
     "Forgive one person who does not know what they do."),
    ("today-paradise", "Luke", 23, 43, 43, ["paradise", "today", "remember"], ["today"],
     "Today is not too late for mercy.",
     "Ask to be remembered, not ranked."),
    ("peace-to-you", "Luke", 24, 36, 36, ["peace", "risen"], ["peace"],
     "The first word of the risen one is peace.",
     "Receive peace before you explain the day."),
    ("you-are-witnesses", "Luke", 24, 48, 48, ["witnesses"], ["witness"],
     "A witness tells what happened, not a theory.",
     "Tell one true thing you have actually seen Him do."),
    ("born-anew", "John", 3, 3, 3, ["born", "anew", "kingdom"], ["born"],
     "Seeing the kingdom begins with new birth, not new effort.",
     "Admit one place you cannot remake yourself."),
    ("god-so-loved", "John", 3, 16, 16, ["loved", "gave", "believe"], ["loved"],
     "Love gave. That is the whole sentence.",
     "Believe this gift instead of bargaining for it."),
    ("living-water", "John", 4, 13, 14, ["water", "thirst", "life"], ["thirst"],
     "Some thirsts are not solved by another well.",
     "Bring one thirst to Him instead of another cistern."),
    ("worship-spirit", "John", 4, 23, 24, ["worship", "spirit", "truth"], ["worship"],
     "Worship is spirit and truth, not a ZIP code.",
     "Worship once without an audience."),
    ("i-am-bread", "John", 6, 35, 35, ["bread", "hunger", "life"], ["bread"],
     "He offers Himself, not a technique.",
     "Come to Him with hunger, not a performance."),
    ("i-am-light", "John", 8, 12, 12, ["light", "darkness", "follow"], ["light"],
     "Following Him is how darkness thins.",
     "Walk one step in the light you already have."),
    ("truth-free", "John", 8, 31, 32, ["truth", "free", "word"], ["truth"],
     "Freedom is the fruit of abiding, not a slogan.",
     "Continue in one word of His you already know."),
    ("before-abraham", "John", 8, 58, 58, ["i am", "abraham"], ["i am"],
     "He does not begin where we begin.",
     "Let His I AM be larger than your timeline."),
    ("i-am-door", "John", 10, 9, 9, ["door", "saved", "pasture"], ["door"],
     "The door has a name.",
     "Enter by Him, not by a side bargain."),
    ("i-am-good-shepherd", "John", 10, 11, 11, ["shepherd", "life", "sheep"], ["shepherd"],
     "The good shepherd spends His life. He does not spend yours first.",
     "Trust His care in one place you have been self-shepherding."),
    ("i-am-resurrection", "John", 11, 25, 26, ["resurrection", "life", "believe"], ["life"],
     "Resurrection is a person before it is an event.",
     "Believe Him in one grief that feels final."),
    ("i-am-way", "John", 14, 6, 6, ["way", "truth", "life"], ["way"],
     "The way is not a map. It is Him.",
     "Follow the Way in one confused decision."),
    ("peace-leave", "John", 14, 27, 27, ["peace", "heart", "afraid"], ["peace"],
     "His peace is not the world's version.",
     "Let your heart unclench for one hour."),
    ("abide-vine", "John", 15, 4, 5, ["abide", "vine", "fruit"], ["abide"],
     "Fruit is the vine's work in the branch.",
     "Abide: stay, do not strain for fruit."),
    ("love-one-another", "John", 15, 12, 12, ["love", "command"], ["love"],
     "The command is as simple as it is costly.",
     "Love one person as you have been loved."),
    ("greater-love", "John", 15, 13, 13, ["love", "friends", "life"], ["friends"],
     "The greater love spends itself.",
     "Lay down one convenience for a friend."),
    ("i-have-overcome", "John", 16, 33, 33, ["overcome", "tribulation", "peace"], ["overcome"],
     "Trouble is told the truth: He has overcome.",
     "Take heart in one tribulation without denying it."),
    ("i-am-king", "John", 18, 36, 37, ["king", "truth", "world"], ["king"],
     "His kingdom is not from here, and still He is King.",
     "Listen to truth more than to the world's volume."),
    ("feed-my-sheep", "John", 21, 17, 17, ["feed", "sheep", "love"], ["feed"],
     "Love of Him becomes care for His.",
     "Feed one of His sheep in a practical way."),
    ("come-follow", "John", 21, 22, 22, ["follow", "you"], ["follow"],
     "The last word to Peter is still follow.",
     "Stop comparing your road. Follow."),
    ("new-commandment", "John", 13, 34, 34, ["love", "commandment", "another"], ["love"],
     "The new command has an old source: as I have loved you.",
     "Love one person with the patience you have received."),
    ("let-not-heart", "John", 14, 1, 1, ["heart", "troubled", "believe"], ["heart"],
     "A troubled heart is spoken to, not scolded.",
     "Believe in Him with the trouble still in the room."),
    ("i-am-true-vine", "John", 15, 1, 1, ["vine", "father", "vinedresser"], ["vine"],
     "The vine is true. The dressing is the Father's.",
     "Accept one pruning without calling it rejection."),
    ("come-to-me", "Matthew", 11, 28, 28, ["come", "weary", "rest"], ["come"],
     "The weary are the invited.",
     "Come as you are tired, not as you are impressive."),
    ("my-peace", "John", 14, 27, 27, ["peace", "give"], ["peace"],
     "He leaves peace the way a friend leaves a key.",
     "Refuse the world's panic for one decision."),
]


def load_web() -> dict[tuple[str, int, int], str]:
    verses: dict[tuple[str, int, int], str] = {}
    for book in GOSPELS:
        raw = json.loads((WEB_DIR / f"{book.lower()}.json").read_text())
        buckets: dict[tuple[int, int], list[str]] = {}
        for item in raw:
            if item.get("type") not in {"paragraph text", "line text"}:
                continue
            ch, vs = item.get("chapterNumber"), item.get("verseNumber")
            if not ch or not vs:
                continue
            val = str(item.get("value") or "")
            buckets.setdefault((int(ch), int(vs)), []).append(val)
        for (ch, vs), parts in buckets.items():
            text = re.sub(r"\s+", " ", "".join(parts)).strip()
            verses[(book, ch, vs)] = text
    return verses


def load_red() -> set[str]:
    data = json.loads(RED_LETTER.read_text())
    return set(data["verses"].keys())


def cite(book: str, ch: int, start: int, end: int) -> str:
    if start == end:
        return f"{book} {ch}:{start}"
    return f"{book} {ch}:{start}-{end}"


def main() -> int:
    web = load_web()
    red = load_red()
    sayings = []
    seen_ids: set[str] = set()
    for spec in SPECS:
        sid, book, ch, start, end, tags, chips, reflection, step = spec
        if sid in seen_ids:
            print(f"duplicate id {sid}", file=sys.stderr)
            return 1
        seen_ids.add(sid)
        if book not in GOSPELS:
            print(f"non-gospel {sid}", file=sys.stderr)
            return 1
        words = []
        for vs in range(start, end + 1):
            key = f"{book} {ch}:{vs}"
            if key not in red:
                print(f"not red-letter: {key} ({sid})", file=sys.stderr)
                return 1
            if (book, ch, vs) not in web:
                print(f"missing WEB: {key} ({sid})", file=sys.stderr)
                return 1
            words.append(web[(book, ch, vs)])
        word = " ".join(words).strip()
        if not word:
            print(f"empty word {sid}", file=sys.stderr)
            return 1
        sayings.append({
            "id": sid,
            "book": book,
            "chapter": ch,
            "start": start,
            "end": end,
            "citation": cite(book, ch, start, end),
            "translation": "WEB",
            "word": word,
            "reflection": reflection,
            "step": step,
            "tags": tags,
            "chips": chips,
        })

    if len(sayings) != 100:
        print(f"expected 100, got {len(sayings)}", file=sys.stderr)
        return 1
    if sayings[0]["id"] != FIRST_ID:
        print("first saying must be anxiety-mt-6-34", file=sys.stderr)
        return 1
    if "don’t be anxious for tomorrow" not in sayings[0]["word"] and "don't be anxious for tomorrow" not in sayings[0]["word"]:
        print("Mt 6:34 WEB text mismatch", sayings[0]["word"], file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "translation": "World English Bible",
        "abbreviation": "WEB",
        "license": "Public domain",
        "scope": "Gospels only — words Jesus spoke",
        "count": len(sayings),
        "firstId": FIRST_ID,
        "sayings": sayings,
    }, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {OUT} ({len(sayings)} sayings)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
