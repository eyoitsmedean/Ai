# PR triage — open pull requests against the native book

Recorded 2026-11-17 from the GitHub API (`pullRequests` state OPEN) and from `git apply --check` of each PR’s own three-dot diff onto `cursor/red-words-native-c2d6` at `6a049e6`. Nothing here was merged or closed.

**Count.** 35 open pull requests, numbers 29 through 93 with gaps. The campaign note said about 38. This file covers every pull request GitHub returned as open. It does not invent entries for numbers that are not open.

**#93 is not a superset of the others.** It is the iPhone and Android book (`lib/red_words/`, `0.1.0+7`). Its web files are an older snapshot: there is no `public/data/crisis.js`, no `public/night.html`, no `red_words/` tree, and no `red-words-app/` tree. Every other open PR’s patch failed `git apply --check` on this branch. None are marked superseded. No fold-in was made.

**Two conflict columns.** “GitHub vs base” is GitHub’s `mergeable` against that PR’s declared base, queried 2026-11-17. “Onto #93” is the local apply check. A PR can be mergeable against its base and still not apply here.

**CI.** `SUCCESS` is `statusCheckRollup.state` from that same query. Checks pages are `https://github.com/eyoitsmedean/Ai/pull/<number>/checks`. #93’s green run on `6a049e6` is [the workflow](https://github.com/eyoitsmedean/Ai/actions/runs/43806332391), [flutter](https://github.com/eyoitsmedean/Ai/actions/runs/43806332391/job/133097856302), and [node](https://github.com/eyoitsmedean/Ai/actions/runs/43806332391/job/133097856590). An earlier run on `2554dfa` failed analyze and is not the head.

**Labels.** `keep separate` means do not absorb the PR into #93; it is not a decision to abandon it. `needs Dean` means the base is not current trunk, the parent PR is closed or merged, GitHub reports a conflict with the base, or the change would turn a store or payment on. No row is `superseded` or `fold-in`.

**Assumption.** Several trunk PRs edit `public/sw.js`. GitHub only says each is mergeable against trunk today. After one of them merges, the others that touch the same file will need a restack. That collision is predicted, not reported by GitHub.

## Every open PR

| # | Title | Base | What it changes | In #93 | Conflicts | CI | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 29 | Red Letter: trust harness, /ask, and household desk | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Trust harness, `/ask`, household desk. 48 files, +2826/−700. Latest commits set the asked saying, record the desk sitting, and match desk QA to the rendered steps. | No | GitHub: CONFLICTING. Onto #93: README.md patch fails. | SUCCESS | needs Dean. Restack before it can land on trunk. Do not fold into #93. |
| 45 | LODESTAR Cycle 1: charter, wipe, inspectable cites | `cursor/sprint-safety-modules-4ba9` | Draft. Charter and cite labels (KJV or WEB) across docs and the web room. 53 files. | No | GitHub: mergeable against its base. Onto #93: `CLAUDE.md` is absent. | SUCCESS | needs Dean. Base branch belongs to closed PR #37, not trunk. |
| 53 | ATELIER: one room namer, generated atlas, Leave, named-map colophon | `cursor/lodestar-cycle-one-c7c8` | Draft. Room namer, atlas, Leave, colophon. 27 files. | No | GitHub: mergeable against its base. Onto #93: `CLAUDE.md` is absent. | SUCCESS | needs Dean. Base branch belongs to closed PR #47. |
| 60 | Crisis: close the gaps a second blind set found in trunk's detector | `claude/jesus-teachings-chatbot-bSBhF` | Ready. One commit. Widens `public/data/crisis.js`, the corpus fixture, and a small `lib/scripture.js` hook. 6 files, +680/−15. | No | GitHub: mergeable. Onto #93: `public/data/crisis.js` does not exist; `lib/scripture.js` and `public/index.html` fail. | SUCCESS | keep separate. Land on trunk if the web room is the product. Do not port it into #93 by hand. |
| 61 | Forty: a preview date that doesn't exist no longer blanks Today | `claude/jesus-teachings-chatbot-bSBhF` | Ready. `public/data/forty.js`, cache bump, test. +8/−2. | No | GitHub: CONFLICTING. Onto #93: `public/data/forty.js` is absent. | SUCCESS | needs Dean. Restack onto trunk. Not a #93 change. |
| 64 | Crisis help you can see and tap on every screen | `claude/jesus-teachings-chatbot-bSBhF` | Ready. Web advisor and shell show a tappable 988. 5 files. | No | GitHub: CONFLICTING. Onto #93: `public/data/advisor.js` fails. | SUCCESS | needs Dean. Restack the web change. #93’s 988-on-every-leaf is the Flutter book, not this patch. |
| 65 | Christmas and Eastertide stay readable with the Lamp on | `claude/jesus-teachings-chatbot-bSBhF` | Ready. Web Lamp contrast for two seasons. `index.html`, `sw.js`, `test/seasons.test.js`. | No | GitHub: CONFLICTING. Onto #93: `public/sw.js` fails. | SUCCESS | needs Dean. Restack the web change. |
| 66 | Letters written offline are kept with the day | `claude/jesus-teachings-chatbot-bSBhF` | Ready. Web letters stay with the civil day. `index.html`, `sw.js`, `test/letters.test.js`. | No | GitHub: CONFLICTING. Onto #93: `public/index.html` fails. | SUCCESS | needs Dean. Restack the web change. |
| 67 | Keyboard readers stay on the page they can see | `claude/jesus-teachings-chatbot-bSBhF` | Ready. Web keyboard paging. `index.html`, `sw.js`, `test/keyboard.test.js`. | No | GitHub: CONFLICTING. Onto #93: `public/index.html` fails. | SUCCESS | needs Dean. Restack the web change. |
| 68 | Every quote names its translation | `claude/jesus-teachings-chatbot-bSBhF` | Ready. Labels quotes in the web shell and QA script. 3 files, +15/−6. | No | GitHub: mergeable. Onto #93: `public/sw.js` and `scripts/qa-browser.js` fail. | SUCCESS | keep separate. Trunk-sized. Do not fold into #93. |
| 69 | Household quire: one-sheet leaf after an ask | `cursor/trust-harness-rebuild-28bf` | Draft. One printed leaf after an ask. 16 files. Stacked on #29. | No | GitHub: mergeable against #29’s branch. Onto #93: `docs/CANONICAL-BRIEF.md` fails. | SUCCESS | needs Dean. Parent #29 conflicts with trunk, so this cannot reach trunk by itself. |
| 70 | Amen: send the word you sat with | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web Amen shares the word just sat with, not the typed reply. 4 files. | No | GitHub: mergeable. Onto #93: `public/sw.js` fails; `test/shell.test.js` is absent. | SUCCESS | keep separate. #93’s Bless Send is a different screen in the Flutter book. |
| 71 | First Night host kit (`/tonight`) | `cursor/red-letter-market-research-bca4` | Draft. Adds `/tonight`. 5 files, +181/−3. | No | GitHub: mergeable against that base, not against trunk. Onto #93: `DEMO.md` fails. | none reported (`gh pr checks` on `cursor/first-night-kit-bca4`) | needs Dean. PRs #3, #5, and #9 on that head are merged. Merging #71 would not, by itself, update trunk. |
| 72 | Store screenshot pack from the running Red Words UI | `cursor/atelier-ship-close-d607` | Draft. Screenshots and a Flutter UI under `red_words/` (Ask, Saved, Settings). 40 files. | No | GitHub: mergeable against its base. Onto #93: `red_words/README.md` is absent. | SUCCESS | needs Dean. Base branch belongs to closed PR #50. This is not #93’s `lib/red_words/` book. |
| 73 | Guest Leaf: sit with Red Words tonight (no store account) | `cursor/production-ready-mobile-bca4` | Draft. `red-words-app/guest/` plus store frames. 21 files, +1047/−0. | No | GitHub: mergeable against its base. Onto #93: `public/privacy.html` already exists and the patch does not apply. | SUCCESS | needs Dean. Base branch belongs to closed PR #11. Third tree, not #93. |
| 74 | Night office lights the Lamp | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web Lamp for the night office. `public/data/lamp.js` and the shell. 5 files. | No | GitHub: mergeable. Onto #93: `public/sw.js` fails. | SUCCESS | keep separate. |
| 75 | The evening you kept is waiting in the morning | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web morning still shows the kept evening. 4 files. | No | GitHub: mergeable. Onto #93: `public/sw.js` fails. | SUCCESS | keep separate. |
| 76 | October close: device clock, Yellow held until the window | `cursor/lodestar-ninety-8754` | Draft. Folio clock under `folio/`. 13 files. | No | GitHub: mergeable against its base. Onto #93: `folio/BRIEF.md` is absent. | SUCCESS | needs Dean. Base branch belongs to closed PR #44. |
| 77 | Night leaf: Compline for the hour a new parent is already awake | `claude/jesus-teachings-chatbot-bSBhF` | Draft. `/night`, Amen keeps one sentence on the device. 9 files, +420/−2. | No | GitHub: mergeable. Onto #93: README, `public/sw.js`, and `server.js` fail. | SUCCESS | keep separate. #93 has no `night.html`. |
| 78 | Night card: seven sealed leaves you can print once | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Printable week of night cards. 6 files. | No | GitHub: mergeable. Onto #93: README fails. | SUCCESS | keep separate. |
| 79 | Hear this hour’s saying, His words only | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web hour saying and the office script. 6 files. | No | GitHub: mergeable. Onto #93: `public/index.html` fails. | SUCCESS | keep separate. |
| 80 | All Hallows: one name through the night | `claude/jesus-teachings-chatbot-bSBhF` | Draft. One name carried from the night onto All Saints morning. 5 files. | No | GitHub: mergeable. Onto #93: `public/index.html` fails. | SUCCESS | keep separate. |
| 81 | The page rests while the office is read | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web page rests during the reading. 4 files. | No | GitHub: mergeable. Onto #93: `public/index.html` fails. | SUCCESS | keep separate. |
| 82 | November opens — the September Lamp letter stays HOLD | `cursor/tonight-cockpit-4efd` | Draft. Folio November page; September letter stays HOLD. 7 files. | No | GitHub: mergeable against its base. Onto #93: `folio/BRIEF.md` is absent. | SUCCESS | needs Dean. Base branch belongs to closed PR #54. |
| 83 | The screen stays lit while you sit | `cursor/night-watch-lamp-4ba9` | Draft. Wake lock while sitting or listening. Stacked on #74. 6 files. | No | GitHub: mergeable against #74. Onto #93: `public/index.html` fails. | SUCCESS | keep separate. Land only after #74, and not into #93. |
| 84 | Compline keeps the word they already received | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Night office stays on the word already received. 6 files. | No | GitHub: mergeable. Onto #93: `public/index.html` fails. | SUCCESS | keep separate. |
| 85 | One file: open Red Words on a phone with no server | `cursor/guest-leaf-tonight-bca4` | Draft. Single `red-words-app/guest/RedWords.html`. Stacked on #73. 8 files. | No | GitHub: mergeable against #73. Onto #93: that guest tree is absent. | SUCCESS | needs Dean. #73’s base is closed PR #11, so this stack does not reach trunk. |
| 86 | Store screenshots at the sizes Apple and Play accept | `cursor/store-screenshot-pack-d607` | Draft. Replaces #72’s screenshot sizes. 56 files under `red_words/store/`. | No | GitHub: mergeable against #72. Onto #93: `red_words/store/` is absent. | SUCCESS | needs Dean. Not #93’s `docs/store/` frames (1290×2796, 1080×1920, 1024×500). |
| 87 | Advent: a waiting path from First Sunday to Christmas Eve | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web Advent path and candle. 8 files. | No | GitHub: mergeable. Onto #93: README fails. | SUCCESS | keep separate. |
| 88 | The morning does not erase the evening | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web morning keeps last night after the morning sit. 4 files. | No | GitHub: mergeable. Onto #93: `public/sw.js` fails. | SUCCESS | keep separate. |
| 89 | The night office does not keep score | `claude/jesus-teachings-chatbot-bSBhF` | Draft. Web night office drops the score. 6 files. | No | GitHub: mergeable. Onto #93: `public/sw.js` fails. | SUCCESS | keep separate. |
| 90 | Seal the First Night table slip to the catalog | `cursor/first-night-kit-bca4` | Draft. Locks #71’s table slip to the catalog. 3 files. | No | GitHub: mergeable against #71. Onto #93: `DEMO.md` fails. | none reported (`gh pr checks` on `cursor/first-night-keep-bca4`) | needs Dean. Parent #71 is not aimed at trunk, and this branch has no checks. |
| 91 | Crisis: su1cide, sh00t, full-width letters, and a gun turned on oneself reach 988 | `claude/jesus-teachings-chatbot-bSBhF` | Ready. Two commits on `public/data/crisis.js`, cache bump, tests. +48/−1. | No | GitHub: mergeable. Onto #93: `public/data/crisis.js` and `test/crisis.test.js` are absent; `public/sw.js` fails. | SUCCESS | keep separate. Trunk crisis recall. Do not fold into #93. |
| 92 | Storefront: one fix by Friday, ready for Dean to turn on | `claude/jesus-teachings-chatbot-bSBhF` | Draft. `plans/` storefront. Commit message says payment is still off. 34 files, +3755/−1. | No | GitHub: CONFLICTING. Onto #93: README and `package.json` fail. | SUCCESS | needs Dean. Do not turn a storefront on from #93. |
| 93 | Red Words 0.1.0+7: store-ready book, still unsigned | `claude/jesus-teachings-chatbot-bSBhF` | Draft. This branch. Flutter book `0.1.0+7`, portrait, API 36, privacy manifests, EB Garamond, store drafts, `SHIP-READINESS.md`. 144 files. | This PR | GitHub: CONFLICTING against current trunk. | SUCCESS on `6a049e6` | needs Dean. Signing and submission. Do not merge it to absorb the other 34. |

## Proposed order

This order was not executed.

1. Leave #93 a draft. It conflicts with current trunk and it is the phone book, not the web room. Signing is the list below.
2. Do not merge #45, #53, #71, #72, #73, #76, #82, #85, #86, or #90 until their bases are retargeted. Their bases are closed, merged, or another open PR. Merging them updates that base, not trunk.
3. On trunk, if the web room is still the product to patch, restack the CONFLICTING ready PRs first (#61, #64, #65, #66, #67) and only then consider landing them. #29 and #92 also conflict and are larger; they wait on Dean.
4. Trunk PRs GitHub currently calls mergeable, in an order that respects the crisis file: #60, then #91, then #68. After #60, #91 will likely need a restack because both edit `public/data/crisis.js` and `public/sw.js` (assumption, see above).
5. The other trunk web drafts (#70, #74, #75, #77, #78, #79, #80, #81, #84, #87, #88, #89) stay separate from #93. Land them one at a time on trunk only after Dean picks which night-office behavior he wants. #83 waits on #74. #69 waits on #29.

## What Dean still does

Copied from `SHIP-READINESS.md`. This triage did not do any of it.

1. Apple Developer team, App ID `com.redwords.redWords`, widget App ID `com.redwords.redWords.RedWordsWidget`, App Group `group.com.redwords.redWords`.
2. Xcode 26 on a Mac. Open `ios/Runner.xcworkspace`. Archive `0.1.0+7`. Confirm Embed Foundation Extensions sits above Thin Binary.
3. TestFlight Internal only.
4. Play Console account, then an upload keystore that is not committed. Release in this repo is still debug-signed.
5. Android SDK 36 and `flutter build appbundle`. Internal testing track only.
6. Public HTTPS privacy URL, United Kingdom excluded or a Cambridge letter, and a real home-screen photo of the Word widget before a public listing. The full wording is in `SHIP-READINESS.md`.

## Spot checks

Five recommendations, checked by diffing the PR against its base and applying that patch to this branch. Histories were deepened with `git fetch --depth=80` so the merge base existed. A shallow fetch had reported “no merge base”; that was a fetch limit, not a fact about the PRs, and it was not used below.

| # | Recommendation | Command result |
| --- | --- | --- |
| 91 | keep separate | `git diff origin/claude/jesus-teachings-chatbot-bSBhF...origin/claude/crisis-spellings-slip` is 3 files (`public/data/crisis.js`, `public/sw.js`, `test/crisis.test.js`). `git apply --check` failed: `public/data/crisis.js: No such file or directory`. `git grep su1cide` on this branch found nothing. |
| 77 | keep separate | Same three-dot diff is 9 files, including new `public/night.html`. Apply failed: `README.md`, `public/sw.js`, `server.js`. `git ls-tree` on this branch has no `night.html`. |
| 68 | keep separate | Diff is `public/index.html`, `public/sw.js`, `scripts/qa-browser.js` (+15/−6). Apply failed on `public/sw.js` and `scripts/qa-browser.js`. |
| 86 | needs Dean | Diff against `origin/cursor/store-screenshot-pack-d607` is 56 files under `red_words/`. Apply failed: `red_words/docs/FOUNDER_SHIP_KIT.md: No such file or directory`. |
| 60 | keep separate | Diff adds to `public/data/crisis.js` and patches `lib/scripture.js`. Apply failed: `lib/scripture.js` hunk, and `public/data/crisis.js` missing. |

`git apply --check --reverse` did not succeed for any of these five, so none of the patches are already sitting on this branch.
