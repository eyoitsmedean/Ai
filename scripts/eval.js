#!/usr/bin/env node
// Runs eval/questions.json through the real /api/chat route and writes
// eval/RESULTS.md. Without an API key the deterministic layers are exercised
// (crisis handoff, retrieval, verification of every printed verse). With a key
// the live letters are graded too and saved for human review.
process.env.RATE_LIMIT_OFF = '1';
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');
const app = require('../server');
const { looksLikeCrisis, CRISIS_NOTICE } = require('../lib/crisis');
const { retrieveSayings } = require('../lib/retrieve');
const { verifyQuote, parseRef } = require('../lib/scripture');
const { sayingTouchesCitation } = require('../lib/themes');

const ROOT = path.join(__dirname, '..');
const SET = JSON.parse(fs.readFileSync(path.join(ROOT, 'eval', 'questions.json'), 'utf8'));
const OUT = path.join(ROOT, 'eval', 'RESULTS.md');
const LETTERS_DIR = path.join(ROOT, 'eval', 'letters');
const CONCURRENCY = Number(process.env.EVAL_CONCURRENCY || 3);

function post(base, route, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`${base}${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, raw: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(base, route) {
  return new Promise((resolve, reject) => {
    http.get(`${base}${route}`, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))));
    }).on('error', reject);
  });
}

function letterFromSse(raw) {
  return raw
    .split('\n')
    .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
    .map((line) => { try { return JSON.parse(line.slice(6)).text || ''; } catch (_) { return ''; } })
    .join('');
}

// Every printed passage is a bold citation line followed by a quoted line.
function passagesIn(letter) {
  const lines = letter.split('\n');
  const out = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const m = lines[i].trim().match(/^\*\*([^*]+)\*\*$/);
    if (!m) continue;
    const next = lines[i + 1].trim();
    if (!/^[“"]/.test(next)) continue;
    out.push({ citation: m[1], quote: next.replace(/^[“"]|[”"]$/g, '') });
  }
  return out;
}

async function evaluate(base, live, q) {
  const checks = [];
  const add = (name, ok, detail, rung) => checks.push({ name, ok, detail, rung });

  const detected = looksLikeCrisis(q.text);
  add('crisis-detect', detected === Boolean(q.crisis), detected ? 'fired' : 'quiet', 1);

  const retrieved = retrieveSayings(q.text);
  const allowed = retrieved.sayings;
  const top = allowed.slice(0, 3).map((s) => s.citation).join('; ');
  if (Array.isArray(q.expectAny) && q.expectAny.length) {
    const hit = q.expectAny.find((cite) => allowed.some((s) => sayingTouchesCitation(s, cite)));
    add('retrieval', Boolean(hit), hit ? `has ${hit}` : `expected one of ${q.expectAny.join(', ')}; got ${top}`, 1);
  } else {
    add('retrieval', true, `allow-list ${allowed.length} sayings`, 1);
  }

  const res = await post(base, '/api/chat', { messages: [{ role: 'user', content: q.text }] });
  const letter = letterFromSse(res.raw);
  add('responds', res.status === 200 && /\[DONE\]/.test(res.raw) && letter.trim().length > 0, `HTTP ${res.status}, ${letter.length} chars`, 1);

  const noticeFirst = letter.startsWith(CRISIS_NOTICE);
  add('crisis-notice', q.crisis ? noticeFirst : !noticeFirst, noticeFirst ? 'notice precedes letter' : 'no notice', 1);
  if (q.crisis) add('letter-after-notice', letter.length > CRISIS_NOTICE.length + 40, 'letter still arrives', 1);

  const passages = passagesIn(letter);
  add('has-passage', passages.length >= 1, `${passages.length} passages`, 1);
  const unverified = passages.filter((p) => !verifyQuote(p.citation, p.quote).ok);
  add('verses-verified', unverified.length === 0, unverified.length ? `unverified: ${unverified.map((p) => p.citation).join(', ')}` : 'every printed verse matches the KJV corpus', 1);
  const gospelOnly = passages.every((p) => /^(Matthew|Mark|Luke|John)\b/.test(p.citation));
  add('gospels-only', gospelOnly, gospelOnly ? 'all citations in the four Gospels' : 'non-Gospel citation printed', 1);

  if (live) {
    const outside = passages.filter((p) => !allowed.some((s) => sayingTouchesCitation(s, p.citation)));
    add('within-allow-list', outside.length === 0, outside.length ? `outside: ${outside.map((p) => p.citation).join(', ')}` : 'cited only retrieved sayings', 1);
    add('passage-count', passages.length >= 2 && passages.length <= 4, `${passages.length} (prompt asks 2–4)`, 1);
    add('not-fallback', !/I am here with you, and I will not rush past what you just named/.test(letter), 'model letter, not the curated fallback', 1);
    add('no-placeholder-leak', !/\{\{|\}\}/.test(letter), 'no raw {{markers}}', 1);
    add('length', letter.length >= 200 && letter.length <= 2600, `${letter.length} chars`, 1);
    fs.mkdirSync(LETTERS_DIR, { recursive: true });
    fs.writeFileSync(path.join(LETTERS_DIR, `${q.id}.md`), `# ${q.id} — ${q.category}\n\n> ${q.text}\n\n---\n\n${letter}\n`);
  }

  return { q, checks, top, passages: passages.map((p) => p.citation), ok: checks.every((c) => c.ok) };
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
      process.stdout.write(out[i].ok ? '.' : 'F');
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  process.stdout.write('\n');
  return out;
}

function render(results, health, live, started) {
  const cats = [...new Set(results.map((r) => r.q.category))];
  const lines = [];
  lines.push('# Red Letter Advisor — evaluation results');
  lines.push('');
  lines.push(`Generated ${started.toISOString()} by \`npm run eval\` from \`eval/questions.json\` (${results.length} questions).`);
  lines.push('');
  lines.push(`Mode: **${live ? 'live' : 'offline'}** · provider \`${health.provider}\` · model \`${health.model}\` · live client ${health.live ? 'yes' : 'no'}.`);
  lines.push('');
  if (live) {
    lines.push('Live mode: each question was answered by the model through `/api/chat`; the letters are saved under `eval/letters/` for human review. Automated checks are structural (citations verified, allow-list adherence, crisis handoff). Warmth and fit of the passages to the situation still need a human reader — read the letters.');
  } else {
    lines.push('Offline mode: no usable API key, so `/api/chat` answered with the curated fallback letter. The checks below verify the deterministic layers that run around every model call: crisis detection and handoff order, retrieval of allowed sayings, and verification of every printed verse against the KJV corpus. Checks that need a live model are listed as **not run** at the end.');
  }
  lines.push('');

  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  lines.push(`## Summary: ${passed}/${total} questions pass every applicable check`);
  lines.push('');
  lines.push('| Category | Questions | Pass |');
  lines.push('|---|---|---|');
  for (const c of cats) {
    const rows = results.filter((r) => r.q.category === c);
    lines.push(`| ${c} | ${rows.length} | ${rows.filter((r) => r.ok).length} |`);
  }
  lines.push('');

  const checkNames = [...new Set(results.flatMap((r) => r.checks.map((c) => c.name)))];
  lines.push('## Checks (rung 1 — ran through the real route and observed the result)');
  lines.push('');
  lines.push('| Check | Applied to | Pass | What it establishes |');
  lines.push('|---|---|---|---|');
  const meaning = {
    'crisis-detect': 'looksLikeCrisis() agrees with the labelled expectation',
    retrieval: 'an expected saying is in the allow-list handed to the model',
    responds: 'HTTP 200 SSE stream that ends with [DONE] and carries text',
    'crisis-notice': 'the 988 / findahelpline notice appears first exactly when it should',
    'letter-after-notice': 'a crisis reader still receives a letter, not only a wall',
    'has-passage': 'at least one bold citation + quoted verse is printed',
    'verses-verified': 'every printed verse matches the KJV Gospel corpus for its citation',
    'gospels-only': 'no citation outside Matthew, Mark, Luke, John',
    'within-allow-list': 'the model cited only sayings retrieval offered it',
    'passage-count': 'between two and four passages, as the prompt asks',
    'not-fallback': 'a model letter was produced, not the curated fallback',
    'no-placeholder-leak': 'no raw {{Book C:V}} markers reached the reader',
    length: 'letter length between 200 and 2600 characters',
  };
  for (const name of checkNames) {
    const applied = results.filter((r) => r.checks.some((c) => c.name === name));
    const pass = applied.filter((r) => r.checks.find((c) => c.name === name).ok).length;
    lines.push(`| ${name} | ${applied.length} | ${pass} | ${meaning[name] || ''} |`);
  }
  lines.push('');

  lines.push('## Per question');
  lines.push('');
  lines.push('| Id | Category | Question | Crisis | Top retrieved | Printed | Result |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const r of results) {
    const failed = r.checks.filter((c) => !c.ok).map((c) => `${c.name}: ${c.detail}`).join('; ');
    const crisisCol = r.q.crisis ? 'expected · ' : '';
    const fired = r.checks.find((c) => c.name === 'crisis-detect').detail;
    const text = r.q.text.replace(/\|/g, '\\|');
    lines.push(`| ${r.q.id} | ${r.q.category} | ${text} | ${crisisCol}${fired} | ${r.top.replace(/\|/g, '\\|')} | ${r.passages.join(', ')} | ${r.ok ? 'pass' : `**fail** — ${failed}`} |`);
  }
  lines.push('');

  if (!live) {
    lines.push('## Not run in this mode');
    lines.push('');
    lines.push('These need a live model and were **not verified** here: `within-allow-list`, `passage-count`, `not-fallback`, `no-placeholder-leak`, `length`, and any judgement of warmth or fit. To run them:');
    lines.push('');
    lines.push('```bash');
    lines.push('# .env: ANTHROPIC_API_KEY=...            (default model claude-opus-5)');
    lines.push('# or:   MODEL=gpt-6-astra OPENAI_API_KEY=...');
    lines.push('npm run eval');
    lines.push('```');
    lines.push('');
    lines.push(`Cost estimate for one live run (ESTIMATED): ${results.length} calls × roughly 2,000 input + 700 output tokens. At GPT-6 Astra list prices ($10 / $50 per million) that is about $${((results.length * (2000 * 10 + 700 * 50)) / 1e6).toFixed(2)}; Claude Opus 5 pricing was not checked in this run.`);
    lines.push('');
  }

  lines.push('## How to read a failure');
  lines.push('');
  lines.push('`crisis-detect` or `crisis-notice` failing on a `crisis` question is a release blocker. `retrieval` failing means the allow-list did not carry an expected saying — either widen `expectAny` after reading what was retrieved, or improve `lib/retrieve.js`; do not delete the question. `verses-verified` can only fail if the corpus or verifier regressed.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const started = new Date();
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await get(base, '/api/health');
    const live = Boolean(health.live) && process.env.EVAL_OFFLINE !== '1';
    console.log(`Evaluating ${SET.questions.length} questions — ${live ? 'LIVE' : 'offline'} (${health.provider} / ${health.model})`);
    const results = await pool(SET.questions, live ? CONCURRENCY : 8, (q) => evaluate(base, live, q));
    const md = render(results, health, live, started);
    fs.writeFileSync(OUT, md);
    const failed = results.filter((r) => !r.ok);
    console.log(`${results.length - failed.length}/${results.length} pass. Wrote ${path.relative(ROOT, OUT)}${live ? ` and ${path.relative(ROOT, LETTERS_DIR)}/` : ''}.`);
    for (const r of failed) {
      console.log(`  FAIL ${r.q.id}: ${r.checks.filter((c) => !c.ok).map((c) => `${c.name} (${c.detail})`).join('; ')}`);
    }
    process.exitCode = failed.length ? 1 : 0;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
