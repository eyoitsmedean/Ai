# Capability Census — 2026-09-14

**ROLE:** Navigator  
**METHOD ACTUALLY USED:** Inspected available tools, MCP namespaces, and this run’s identity via `cursor-cloud` `run-info`. Did not invent access.

1. **Conversation history.** This run’s full transcript was written to `/tmp/cursor/cloud-agent-transcripts/2026-09-14T04-03-19Z-e8e9/bc-9d879086-030e-42d8-9728-b1e611e98634/transcript.json` via `batch-fetch-details`. I do not read that file directly; a subagent does. Earlier CANON recovery (2026-09-11) quoted twelve human prompts from a prior dump of the same run.
2. **Project files / repo.** Full read-write on `/workspace` (`eyoitsmedean/Ai`, branch `cursor/press-atelier-review-8634`). Git commit/push allowed. PR updates via `ManagePullRequest` only.
3. **Web search and fetch.** Available (`WebSearch`, `WebFetch`). Cambridge University Press was Cloudflare-blocked on 2026-09-11.
4. **YouTube.** No dedicated transcript tool. I will not cite videos I have not opened. Research Orders if a summit needs a talk.
5. **Run code.** Node, `npm test`, `npm run eval`, `npm run qa`, puppeteer against localhost. No `ANTHROPIC_API_KEY`.
6. **Write files / Notion.** Repo write. Notion create/update under pages I already used. Do not overwrite Grok F1–F3.
7. **Persistent memory.** Repo docs + git. No separate agent memory store.
8. **Spawn agents.** `Task` with `generalPurpose`, `explore`, `computerUse` (last cycle: computerUse failed on model quota).
9. **Output limits.** Long transcripts must be read by subagents. Session can summarize.
10. **Two homes.** Project = `/ask` + sealed corpus + folio atelier. Knowledge base = `docs/lodestar/` (this cycle) plus `docs/CANON.md` / `docs/RESEARCH.md` (prior recovery, evidence).

**Crew:** Navigator (this session). Archaeologist, Surveyor, Scholars, Skeptic as spawned subagents. If a spawn fails, I run that role as a sequential pass and say so.

**Not available:** Granola (needsAuth, 2026-09-11). Live store submit. Phone on Dean’s desk.
