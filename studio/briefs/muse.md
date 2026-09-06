# PROJECT BRIEF — Muse

*Written 6 September 2026 from `../locks/muse.md` (4 September 2026, from Dean's Muse chat and its Meta device-login subagent). Longer operating rules live in that lock.*

```
# PROJECT BRIEF — Muse

Mission: Get Muse (Muse Code / Meta Model API) actually running in the current environment, or hand Dean the single exact step only he can take.

The finished thing: a real invocation of Muse in the workspace with its command output; or a blocker note naming precisely what is missing (CLI, login, expired device code, egress, credentials), with everything else already prepared.

Audience and use moment: Dean, in Cursor, wanting to use Muse now; he has said "run muse", "I approve", "you should have approval", "run muse here".

Definition of done:
  1. The binary or command that was run is shown with its output — or the absence of an installable Muse CLI is shown with the command that failed.
  2. Auth state is proven: token present, expired, or missing — by inspecting the environment, not by asserting.
  3. If a device-code flow is needed, a fresh code is started from the official flow and shown to Dean; the stale code NSXJ-LRXK (3 September 2026) is never reused.
  4. No Meta, Facebook, or Instagram credential or 2FA is ever typed by the agent; no secret lands in the repo, logs, or chat.
  5. If blocked: one sentence on impact and the shortest human step.

Mode: QUICK to STANDARD
Team: solo
Capabilities this bot has: code execution, web fetch, browser automation (may open a device URL and report the page; must stop at any password, Facebook/Instagram login, or 2FA wall), file output.
Budget and size: QUICK budget; one session.

Hard constraints: never invent credentials; never complete 2FA; never click through a password form; never store secrets in the repo; do not build a fake Muse UI; do not turn this into a Red Letter feature; publish nothing to Meta.

Decisions already made (do not re-litigate): "I approve" authorizes continuing the run, not possession of Dean's password. The chat stays Muse — no product rewrites.

Facts only I have: my Meta account login — I will do it myself on my phone or browser when you show me the code.

Assets, repos, and system of record: prior device-code attempt against auth.meta.com/oauth/device/ (redirected to Meta Model API login; required a real account; no passwordless Approve). Decisions recorded in CLAUDE.md under "Muse".

Known risks / what went wrong before: device codes expire; the agent argued about approval instead of checking auth state; "Muse is running" was at risk of being claimed without a command result.

Authority: install CLIs, start official auth flows, run Muse; anything requiring Dean's credentials is his step.

Quality reference: a good SRE runbook — the command, its output, the next step, nothing else.
```
