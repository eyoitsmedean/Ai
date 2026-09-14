# Guest demo — eight minutes

The chapel is ready for a real person on a shared phone or laptop.

Bearing: C4, C7.

## Before the first guest

1. Start the server: `npm start`
2. Open **`http://localhost:3000/?fresh=1`**
3. You should see onboarding — *Enter* — not the last guest’s Advisor chat.

Between guests: Settings → **Begin again**, or hit `/?fresh=1` again. Journal entries stay (DESIGN CHOICE). Chat, the welcome flag, and the daily ask-count wipe.

`/welcome` is the marketing leaf (same type stack as the app, no Google Fonts CDN). The product itself is `/`.

## What to let them do (do not tour features)

| Minute | Let them… | You stay quiet |
| --- | --- | --- |
| 0–1 | Arrive from `/welcome` or `/?fresh=1`. Enter. Pick a need, or just begin. | Do not explain the pipeline. |
| 1–4 | Today’s word, or Seek a theme. | If they freeze, point at Advisor. |
| 4–6 | Advisor: whatever they are actually carrying. | If they type crisis language, 988 must appear. That is the test, not a failure. |
| 6–8 | Settings → About. Helplines. Begin again if the next guest is waiting. | Leave quickly is for a watched phone, not for your demo wipe — it leaves the page. |

## Do not

- Call it an AI Jesus. The page says it is software, not a person.
- Skip the wipe between guests. The last person’s shame must not greet the next.
- Use Leave quickly to reset a demo. It navigates to a weather page on purpose.

## After the room

`npm test` and `npm run qa-fresh` (first session + wipe). `npm run qa` is the archived folio script.
