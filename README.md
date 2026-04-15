# The Red Letter Advisor ✝️

A web-based chatbot that answers life questions and moral dilemmas with guidance drawn **exclusively from the direct words of Jesus Christ** as recorded in the four Gospels (Matthew, Mark, Luke, John) — the passages traditionally printed in red letters in many Bible editions.

Every response cites the specific verse it draws from. Responses are warm, humble, non-judgmental, and accessible to anyone, regardless of background.

---

## How It Works

- **Frontend** – A static HTML page hosted on GitHub Pages (no server needed for the UI).
- **Backend** – A [Cloudflare Worker](https://workers.cloudflare.com/) serverless function that calls the Anthropic Claude API and returns guidance.
- **AI** – Powered by Anthropic's Claude, instructed to respond only from the red-letter teachings of Jesus.

---

## Setup Guide (Step-by-Step for Non-Coders)

### Step 1 — Get an Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/) and create a free account.
2. Click **API Keys** in the left sidebar, then click **Create Key**.
3. Copy the key — it starts with `sk-ant-…`. **Keep this private — never share it or commit it to code.**

---

### Step 2 — Deploy the Backend (Cloudflare Worker)

The backend is a Cloudflare Worker. You need a free Cloudflare account.

#### Option A: One-Click Deploy via Cloudflare Dashboard

1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/) and sign up / log in (free).
2. Click **Workers & Pages** → **Create** → **Create Worker**.
3. Give it a name like `red-letter-advisor`.
4. Click **Edit code**, delete all existing code, and paste the contents of [`worker/index.js`](./worker/index.js) from this repo.
5. Click **Deploy**.
6. After deploying, go to the **Settings** tab → **Variables** → **Secrets**.
7. Click **Add secret**:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** the API key you copied in Step 1
8. Click **Save**.
9. Your worker URL looks like: `https://red-letter-advisor.YOUR-SUBDOMAIN.workers.dev`  
   Copy this URL — you'll need it in Step 4.

#### Option B: Deploy via Command Line (Wrangler)

Requires [Node.js](https://nodejs.org/) installed.

```bash
# Install Wrangler CLI
npm install -g wrangler

# Log in to your Cloudflare account
npx wrangler login

# Add your Anthropic API key as a secret (you'll be prompted to enter it)
npx wrangler secret put ANTHROPIC_API_KEY

# Deploy the worker
npx wrangler deploy
```

Your worker URL will be shown after deployment. Copy it.

---

### Step 3 — Configure the Frontend

1. Open the file `public/config.js` in this repo.
2. Find this line:
   ```javascript
   window.BACKEND_URL = '';
   ```
3. Replace it with your worker URL:
   ```javascript
   window.BACKEND_URL = 'https://red-letter-advisor.YOUR-SUBDOMAIN.workers.dev';
   ```
4. Save the file and commit/push it to GitHub.

---

### Step 4 — Enable GitHub Pages

1. Go to your GitHub repo → **Settings** → **Pages** (in the left sidebar).
2. Under **Source**, choose **GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` will automatically deploy the site whenever you push to `main` (or the configured branch).
4. After the workflow runs, your site will be live at:
   ```
   https://YOUR-GITHUB-USERNAME.github.io/Ai/
   ```
   *(Replace `YOUR-GITHUB-USERNAME` with your GitHub username. The path `/Ai/` matches this repository's name.)*

---

### Step 5 — Verify Everything Works

1. Open your GitHub Pages URL.
2. Type a question (e.g. *"How should I treat my enemies?"*).
3. The advisor should respond with guidance from the Gospels, with verse citations.

---

## Local Development

To run the app on your own computer:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your API key:
   ```bash
   cp .env.example .env
   # Edit .env and set ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The local server serves `public/index.html` and handles `/api/chat` directly — no Cloudflare Worker needed for local use.

---

## Security Notes

- **Never** commit your `ANTHROPIC_API_KEY` to this repository.
- The API key is stored as a Cloudflare Worker secret (server-side only).
- The frontend `public/config.js` only contains the *public* Worker URL — this is safe to commit.
- The Worker uses CORS headers to allow requests from any origin (needed for GitHub Pages). The API key is never exposed to the browser.

---

## File Overview

| File | Purpose |
|------|---------|
| `public/index.html` | The chat UI (GitHub Pages frontend) |
| `public/config.js` | Frontend config — set your Worker URL here |
| `worker/index.js` | Cloudflare Worker backend — handles `/api/chat` |
| `wrangler.toml` | Cloudflare Worker deployment config |
| `server.js` | Local development Express server |
| `.github/workflows/pages.yml` | GitHub Actions workflow that deploys to Pages |

---

## Behavior & Disclaimer

This app is designed to offer **reflective guidance** based on the red-letter words of Jesus in the four Gospels. It is:

- ✅ Rooted exclusively in the direct speech of Jesus (Matthew, Mark, Luke, John)
- ✅ Warm, humble, and accessible to all backgrounds
- ✅ Citing specific verse references in every response
- ✅ Acknowledging theological complexity when relevant

It is **not** a substitute for personal faith, pastoral counsel, or professional advice.
