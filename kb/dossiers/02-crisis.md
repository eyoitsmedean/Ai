# Dossier — Crisis handling in consumer chat

**Bearing:** C6 · Depth: D4 · Opened 14 Sep 2026 by Scholar · Not clinical advice.

## Why
A chat that looks like a listener and is not one. Two architectures: helpline-first vs classifier-first.

## Foundations
988 is the US Suicide & Crisis Lifeline: call, text, or chat; 24/7; network of 200+ centers; Vibrant / SAMHSA; people need not be suicidal to use it. **VERIFIED** 988lifeline.org + SAMHSA FAQs 14 Sep 2026. 988 ≠ 911. IASP does **not** answer phones; it points to ThroughLine / Find A Helpline (175+ countries on their homepage — **SOURCE-REPORTED**).

## Strongest case against detection-as-safety
Spittal et al., *PLOS Medicine* 11 Sep 2025: 53 studies, 35M records; authors: accuracy **too low for screening or treatment allocation**. Low-prevalence PPV collapses. **SOURCE-REPORTED** (PMC opened by Scholar). Broadbent 2023: lexical model FNR 60% on crisis-line texts; neural still 38%. Shakeri 2023: the same tokens (`kill`, `die`) are hits *and* jokes.

## This product
`looksLikeCrisis` is a short regex with a negation patch. `/ask` already shows 988 **before** a question and returns `words: null` on a hit. Residual: “end it all” misses — chrome covers it. **PRODUCT / VERIFIED** by tests.

## What changed
Ask honesty now also refuses off-scope and unmatched **without** stuffing a comfort verse. Crisis path unchanged (still stop). Dossier confirms: do not make 988 conditional; do not ship on a classifier.

## Top 1%
Safety is routing, not recognition. Naming 988 is not iatrogenic (IASP + Dazzi 2014 abstract-level). Stop-counsel is the only unique act this screen has.
