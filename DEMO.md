# Guest demo — eight minutes

The Quiet Page is ready for a real person on a shared phone or laptop.

**Host room:** open **`/tonight`** first. That page is the hour: timer, 988 slip, clean-page button, and the three lines you write after they leave. This file is the same script in prose.

## Before the first guest

1. Start the server: `npm start`
2. Open **`http://localhost:3000/tonight`**, then **Open a clean page** (`/?fresh=1`)
3. You should see the paper onboarding (Matthew 11:28), not last night’s chat.

Between guests: Settings → **New reader**, or hit `/?fresh=1` again.

## What to let them do (do not tour features)

| Minute | Let them… | You stay quiet |
| --- | --- | --- |
| 0–1 | Arrive from `/welcome` or `/?fresh=1`. Pick why they came. Tap **Open the page**. | Do not lecture. |
| 1–4 | Sit through Read. They may close. They may tap **I’ve sat with it** instead of waiting twenty seconds. | If they freeze, point at Close. |
| 4–6 | Today: the sentence, seven beads, **Hear this**, or **Bless someone**. | The card downloads if the phone will not share. |
| 6–8 | Advisor: “I feel so much shame” or whatever they are actually carrying. | If they type crisis language, 988 must appear. That is the test, not a failure. |

## Do not

- Apologize for the twenty seconds. Offer **I’ve sat with it**.
- Call it an AI Jesus. The page says it is a guide.
- Skip Settings reset between guests. The last person’s shame must not greet the next.

## After the room

On `/tonight`, write the three lines (what they asked, which saying landed, what you would change). They stay in this browser only. A Gospel citation in “which saying” is checked against the catalog; if it seals, the table slip becomes that exact wording. If it does not, the slip stays Matthew 11:28 and says so.

Then, if you want machine checks: `npm test` (API) and `npm run qa` (first session) and `npm run demo` (twenty guests, headless).
