# Capability Census — LODESTAR Cycle 1

**Written:** 2026-09-14 · Navigator · this cloud run `bc-01a04f4f-3db7-7cb2-aa15-dc300a204ba9`

| Power | Here? | Notes |
|---|---|---|
| Conversation history | Yes | `batch-fetch-details` → transcript at `/tmp/cursor/cloud-agent-transcripts/2026-09-14T04-03-14Z-e2b2/bc-01a04f4f-3db7-7cb2-aa15-dc300a204ba9/transcript.json`. Prior cycle’s copy at `2026-09-11T21-30-39Z-2d94` is **gone**. Read via extractors / subagents, not loaded whole. |
| Project files / repo | Yes | `github.com/eyoitsmedean/Ai`. Working tree: `cursor/lodestar-cycle-1-4ba9` from `8385505` (sprint safety pack). |
| Web search / fetch | Yes | WebSearch, WebFetch. Some operator sites (rainn.org, CUP HTML) were Cloudflare-blocked last cycle. |
| YouTube | Unproven this cycle | No YouTube MCP. Transcript-first only if a fetch returns a transcript. If not: no video citations; Research Orders instead. |
| Run code | Yes | Node 22, `npm test`, Chrome at `/usr/local/bin/google-chrome`, puppeteer-core. |
| Write files | Yes | Repo + `/opt/cursor/artifacts`. |
| Persistent memory | Repo only | Knowledge base = `docs/lodestar/`. Project = code + `public/`. |
| Spawn agents | Yes | Task tool. Roles announced before work. |
| Notion / Granola | Available as MCP | Notion is **out of product scope**. Granola not queried (no meeting referenced). |
| Irreversible | No | No deploy, no email, no paid CUP application. Queue under Authorization Requests. |

**Two homes**

- **Project:** the PWA + API (`public/`, `lib/`, `server.js`, `eval/`).
- **Knowledge base:** `docs/lodestar/` (this cycle) plus `docs/CANONICAL-BRIEF.md`, `docs/RESEARCH.md`, `docs/research/`.

**Crew:** Navigator (this session). Archaeologist, Surveyor, two Scholars, later Skeptic — spawned as Task agents. If an agent fails to start, the Navigator runs that role as a sequential pass.
