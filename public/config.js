// ── Backend Configuration ────────────────────────────────────────────────────
// This file tells the browser where to send chat requests.
//
// LOCAL DEVELOPMENT (default):
//   Leave BACKEND_URL unset (empty string). The app will call /api/chat on the
//   same server (served by `npm start` / server.js).
//
// GITHUB PAGES + CLOUDFLARE WORKER:
//   After deploying your Cloudflare Worker, replace the empty string below with
//   your worker URL (without a trailing slash).
//
//   Example:
//     window.BACKEND_URL = 'https://red-letter-advisor.yourname.workers.dev';
//
// ─────────────────────────────────────────────────────────────────────────────
window.BACKEND_URL = '';
