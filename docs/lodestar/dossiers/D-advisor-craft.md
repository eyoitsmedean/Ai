# Dossier — Advisor conversation craft

**Topic:** One-shot Q&A vs a thread that remembers the last word  
**Bearing:** C4, C6  
**Why it matters:** A real question has a second sentence. “What about my kids?” after Matthew 6:34 is still anxiety, not a new Hope default.

## Foundations
Pastoral conversation (not therapy): hear, stay with the text, refuse the expert pose. The product already forbids pastor/therapist/Jesus persona (`ADVISOR_SYSTEM`, D3).

Hallow’s bar is time-to-useful. YouVersion’s bar is the verse as an object. Bible Chat’s anti-pattern is uncited warmth. **ASSUMED** quality refs (Dean never named two apps).

## Frontier
Retrieval-augmented chat that stays inside a closed corpus. Follow-up classification is a hard NLP problem; this cycle uses an honest, small rule: short continuations inherit the last assistant’s Gospel refs.

## Live controversies
Memory vs privacy. Threads stay on-device. Server sees only the last 20 turns of the current request.

## Methods and limits
`looksLikeFollowUp` will misfire on a first message that starts with “What about.” Empty prior refs → ordinary `guessTheme`. Crisis/abuse still classify the *latest* user turn only.

## What the top 1% know
The second question is where cheap bots drop the citation. World-class keeps the *same saying in play* until the person changes the subject with a full new story.

## Hardest objections
1. Inherit theme forever — *answer:* only when the new line looks like a follow-up.  
2. Model mode will ignore this — *answer:* system prompt still requires Gospel quotes; corpus path is now thread-aware; model-mode unevaluated.  
3. This is therapy — *answer:* we still refuse the role; we only keep the text.

## Implications (changed)
`guessThemeFromThread` + eval f01/f02/c21 + after-answer chips + sitting-with strip.

## Depth
D4 on the product method. D2 on clinical pastoral education literature (out of weight).

**YouTube:** none cited. Research Order: YouVersion “verse of the day” engineering talks; Hallow Lent campaign postmortems.
