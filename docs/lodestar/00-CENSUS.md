# Capability Census — LODESTAR Cycle 1

Date: 2026-09-14. Navigator: this agent. No prior LODESTAR artifacts existed.

- **History:** Can fetch this run’s transcript via cursor-cloud `batch-fetch-details` and have a sub-agent read it. Cannot hold the whole JSON in one pass. User messages have `role` + `text`; no per-prompt timestamp field.
- **Files / repo:** Full read/write on `/workspace` (`github.com/eyoitsmedean/Ai`), branch `cursor/trust-harness-rebuild-28bf`. Git commit/push. PR 29 via ManagePullRequest. `gh` is read-only.
- **Notion:** Fetch, search, create/update pages under existing Red Letter parent. Dispatch: no sixth hub.
- **Web:** Search and fetch. Primary pages can be opened this session.
- **YouTube:** No video, no transcript tools. **Cite no videos.** Research Orders only.
- **Code:** Node, `npm test`, smoke, Puppeteer QA, local server. No Anthropic key in this environment (not re-checked this cycle unless a test needs it).
- **Memory:** Durable only via git + Notion. Session memory is this conversation.
- **Agents:** Task sub-agents available. computerUse failed last cycle (third-party quota). Roles that need a browser will use Puppeteer or Recruitment Orders.
- **Limits:** Do not publish, store-submit, spend, or email. WATCH. Work on this branch; do not commit to `main`.

**Two homes**

- **Project:** the Red Letter app (`public/`, `lib/`, `server.js`, `data/`).
- **Knowledge base:** `docs/lodestar/` (this cycle) plus `docs/CANONICAL-BRIEF.md` and `docs/RESEARCH-AND-GATE.md`.

**Crew:** Navigator (this process). Archaeologist, Surveyor, Scholar spawned. Skeptic and Editor as later passes. If a spawn fails, the Navigator runs that role sequentially and says so.
