# Project lock — Muse

Use with `studio/DEANS-MASTERPIECE-PROTOCOL.md`.

This lock was written on **4 September 2026** after reviewing the *Muse application* chat and its Meta device-login subagent from 3 September 2026.

**Paste this lock into that chat. It is the constitution for this work.**

---

## Project Brief

* **Project:** Run **Muse** (Muse Code / Meta Model API) in the current environment and finish the job Dean asked for — not a research paper about Muse.
* **Primary outcome:** Muse actually running here, or an exact, honest blocker with the next human action.
* **Audience:** Dean, trying to use Muse in Cursor.
* **Context:** Chat [Muse application](https://cursor.com/agents/bc-9d879086-030e-42d8-9728-b1e611e98634). He said `run muse`, then `I approve`, then `you should have approval`, then `run muse here`.
* **Existing assets:** Prior device-code attempt against `https://auth.meta.com/oauth/device/` for Muse Code. Subagent [Open Meta Muse login](https://cursor.com/agents/bc-7a8fbce1-635f-5b56-be31-60112fbedf71) found the code **NSXJ-LRXK** redirected to Meta Model API login and **required a real Meta account**. There was no passwordless Approve button.
* **Required deliverables:** Muse running in this workspace if authorized and possible; otherwise a precise blocker (missing CLI, missing login, expired device code, egress, or credentials).
* **Constraints:** Never invent Meta/Facebook/Instagram credentials. Never complete 2FA. Never click through a password form. Never store secrets in the repo.
* **Non-goals:** Building a fake Muse UI. Turning this into a Red Letter feature. Publishing anything to Meta.
* **Success:** `run muse here` is true, or Dean knows the single thing only he can do (log in on his phone/browser) and you have prepared everything else.
* **Risk:** Device codes expire. Old codes from 3 September 2026 are almost certainly dead. Do not reuse `NSXJ-LRXK` as if it were still valid.
* **As-of date:** 4 September 2026.

---

## What Dean already told this chat

1. `run muse`
2. `I approve` — treat as authorization to continue the Muse run, **not** as possession of his Meta password
3. `you should have approval` — he believes the human approval step is done on his side; verify current auth state instead of arguing
4. `run muse here` — execute in this environment

---

## Operating rules for this lock

1. Detect what is actually installed: Muse CLI, Meta SDK, env vars, existing tokens, device-code flow.
2. If a fresh device code is required, start the official flow and show Dean the code. Do not recycle expired codes.
3. Browser automation may open the device URL and report the page. If the page asks for email/password, Facebook, Instagram, or 2FA — **stop**. Screenshot or quote the page. Do not type secrets.
4. If approval already exists in this environment (token, keychain, env), use it and run Muse.
5. After it runs, prove it with a real invocation, not a claim.
6. Do not expand into Red Letter, Red Words, or the ninety-day folio unless Dean asks.

---

## Quality gates for this lock

* Prove the binary/command that was run
* Prove whether auth is present, expired, or missing
* No invented “Muse is running” without a command result
* No credentials in git, logs, or chat beyond what the user already pasted
* If blocked, one sentence on impact + the shortest human step

---

## Success rubric

1. **Execution** — Muse runs here, or the blocker is exact
2. **Auth honesty** — approval ≠ password
3. **Freshness** — no zombie device codes
4. **Safety** — no secret handling
5. **Focus** — this chat stays Muse, not a product rewrite
6. **Proof** — command output, not role-play
