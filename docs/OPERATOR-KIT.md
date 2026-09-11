# Operator kit — Dean

**Use when:** you have fifteen minutes and a phone.  
**This file is the assembled next step.** You should not need to reread the chat.

Date of this kit: 11 September 2026. Branch: `cursor/recovery-commission-6ab5`.

---

## What this is

Red Letter Advisor is ready to **run as a PWA** on iPhone and Android once it is on **HTTPS**. The engineering core (verified WEB quotes, crisis gate, 92-question eval) already passed here. What I cannot do without your sign-off is deploy it or submit it to a store.

---

## Your first three useful actions

### 1. Put it on HTTPS (blocks everything else)

Any Node 18 host works. Railway is already described in `README.md` (`railway.toml`, health `/api/health`).

Set:

```
NODE_ENV=production
ANTHROPIC_API_KEY=          # optional; without it, corpus mode still answers
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@your-domain
PUSH_STORE=/data/push-store.json
WAITLIST_STORE=/data/waitlist.json
```

Generate VAPID: `npx web-push generate-vapid-keys`.

Mount a volume at `/data` so push and waitlist survive restarts.

Then: `node scripts/smoke.js https://YOUR-DOMAIN`

Until this exists, Home Screen install and morning reminders will not behave like a real app.

### 2. Run the five-minute phone checklist

Open `RELEASE.md` §C. Tick every line VERIFIED or UNVERIFIED. Paste the dated block back into that file (or send it in this chat). On-device testing is explicitly **your** step in the brief.

Use:

- iPhone Safari, then Share → Add to Home Screen. If Share is hidden: ⋯ More → Share. Leave **Open as Web App** on.  
- In the app: Settings → **Show the steps** if you want the illustrated coach.  
- Android Chrome → Install app.

### 3. Decide the only open product questions

Reply with yes/no:

1. **Store listing later?** Default is no (PWA).  
2. **Production hostname** you want printed in the footer / VAPID subject.  
3. **Turn on the AI key** for a model-mode eval (`npm run eval` against the live URL). Corpus mode is already 92/92.

Do not decide payment yet. Plus is a waitlist file, not a charge.

---

## What a stranger can do today (after deploy)

1. Open `https://YOUR-DOMAIN/?tab=advisor` (or the Home Screen icon).  
2. Type a life question. In corpus mode the reply is a warm opener + 2–4 verified sayings + ✓ WEB badges that open eBible.  
3. Type “I want to kill myself” — crisis card, **no verses**, 911 / 988 / 988 chat / IASP, no credit used.  
4. Share a card. The link is `/?tab=advisor&ref=Matthew+6:34`.  
5. Today tab still has the Encounter and the Garden if they want beauty. It is no longer the front door.

---

## Five-minute checklist (copy of RELEASE §C, current)

Needs: the HTTPS URL, an iPhone (iOS 16.4+), an Android phone.

**iPhone (Safari)**  
1. Open the URL. If onboarding appears, **Ask a question now** or **Skip for now** works without toggling anything.  
2. You should land on **Advisor**, not a cinematic overlay.  
3. Share → Add to Home Screen. Icon is the crimson mark. Open from the icon: no Safari chrome.  
4. Advisor: “I'm anxious about money” → opener + passages + ✓ WEB within ~3 s.  
5. Advisor: “I want to kill myself” → crisis card; 988 and 911 tappable; chat.988lifeline.org present; free count unchanged.  
6. Advisor: “write me a python function” → redirect, no verse.  
7. Settings → Morning reminder ON (must be from the **icon**) → Send test.  
8. Airplane mode → shell + cached word; banner says offline.

**Android (Chrome)**  
9. Menu → Install app. Standalone.  
10. Repeat 4–5. Keyboard does not hide the composer.

Record results under RELEASE.md.

---

## What I verified in this environment (not your phone)

See RELEASE.md §B after this branch’s CI. I do **not** claim your devices were tested.

Unverified here, always:

- Physical iPhone / Android.  
- Model-mode replies (no Anthropic key in this environment).  
- Live push on APNs / FCM.  
- Production hostname.

---

## If something fails

| Symptom | Likely cause |
| --- | --- |
| “Install” does nothing on iPhone | There is no install API. Use Share → Add to Home Screen. |
| Reminders never prompt | You are still in a Safari tab, or iOS &lt; 16.4, or you denied once (Settings → Notifications, or delete the icon and re-add). |
| Encounter plays on open | You opened `/?tab=today` or tapped Today. Advisor is the default. |
| Waitlist “ok” but you want the emails | `WAITLIST_STORE` file on the host (`data/waitlist.json` locally). |
| Crisis card mentions Canada | You are on an old service-worker cache. Hard refresh or wait for the “new version” banner (`rla-v29`). |

---

## Do not do

- Do not submit to App Store / Play without a new written yes.  
- Do not call this a therapist, pastor, or 988 partner.  
- Do not switch the translation to NIV/ESV/NLT without a publisher license (you will not get a gratis path that covers a Gospel corpus).  
- Do not treat Notion “This week / F1–F3 / LH01” as this project’s brief.

---

## Continuation for the next agent

`RESUME_FROM`: Dean’s RELEASE §C ticks and, if present, a live URL. If model-mode eval misses, edit `ADVISOR_SYSTEM` in `server.js` and re-run `npm run eval`.
