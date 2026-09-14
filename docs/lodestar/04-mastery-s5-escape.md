# Mastery Brief — S5 Quiet leave (escape navigation)
**Bearing:** C6 · **This is also the Director’s Cut**

## Who is world-class
The Hotline: “Click the red X … or Escape … twice … to leave TheHotline.org immediately.” Security alert: usage can be monitored; call if it might be; clear history. **VERIFIED** on thehotline.org 2026-09-14. Destination URL **UNRESOLVED** (not in the extract).

## What world-class looks like
After a disclosure, a watched-phone control does not return the user to a chapel full of crimson. It **leaves**. Wikipedia is a DESIGN CHOICE bland page — high-traffic, not faith-themed, not personalized.

## Difference that makes the difference
Good: clear the textarea. World-class: wipe the transcript **and** change what is on the screen if someone walks in.

## Process
Wipe session keys → `location.replace(ESCAPE_URL)`. Settings Begin again stays in-app (demo). Escape key still Close.

## Rubric
1. Named “Leave quickly” — **pass**.
2. Navigates off-origin — **pass** (code).
3. Journal not wiped — **pass**.
4. Distinct from Begin again — **pass**.
5. Hotline numbers still first in the card — **pass**.
6. Would the Hotline change anything? — Yes: they also say **clear browser history**. We cannot clear Safari history. Stated in About / Ship limits.

## Practice loop
`qa-fresh` opens the modal and asserts the button. Full navigation not asserted (would leave the app under test).

## Traps
Using a faith URL as the escape hatch. Auto-firing leave on Escape. Wiping the journal.

## Sources
thehotline.org 2026-09-14. No video.
