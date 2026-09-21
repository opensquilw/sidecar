# Sidecar AI worker

A tiny Cloudflare Worker that holds your Anthropic API key so the app never
ships one. The browser sends the conversation; the worker builds the system
prompt from the app's own guides (`reference.txt`, published with the app),
calls Claude, and streams the answer back.

Without this worker the in-app assistant still works — it answers from the
built-in guides in **offline mode**. Deploying the worker upgrades the same
chatbox to real Claude.

## Deploy (about 10 minutes)

1. **Cloudflare dashboard** → Workers & Pages → Create → Worker → name it `sidecar-ai`.
2. Replace the starter code with the contents of `worker.js`. Deploy.
3. **Settings → Variables and Secrets**:
   - `ANTHROPIC_API_KEY` — **Secret** — your key from console.anthropic.com
   - `ALLOWED_ORIGINS` — `https://opensquilw.github.io`
   - `REFERENCE_URL` — `https://opensquilw.github.io/sidecar/reference.txt`
   - `MODEL` — `claude-opus-5`
   - `EFFORT` — `medium`
4. Copy the worker URL (looks like `https://sidecar-ai.<you>.workers.dev`).
5. In the app repo, open `config.js` and set `AI_ENDPOINT` to that URL. Commit and push.

Open the app → the assistant's status line changes from 離線指引 to AI.

### Optional: per-IP daily cap
The worker URL is public, so anyone who finds it and spoofs the Origin header
could spend your credits. To cap that: Workers → KV → create a namespace called
`QUOTA`, then in the worker's Settings → Bindings add a KV binding named `QUOTA`
pointing at it. `DAILY_LIMIT` (default 60) then applies per IP per day.

### With wrangler instead
```
npm i -g wrangler
wrangler login
wrangler secret put ANTHROPIC_API_KEY
wrangler deploy
```
(`wrangler.toml` has the vars. Uncomment the KV block after `wrangler kv namespace create QUOTA`.)

## Cost
Opus 5 is $5 / $25 per million tokens. The ~15k-token reference is prompt-cached
for an hour, so after the first message in any hour each reply costs roughly a
third of a cent plus the answer. A heavy day of use is well under a dollar.
Set `MODEL = "claude-haiku-4-5"` to cut that ~5×, at a quality cost you would
notice on nuanced questions.

## Local test
Add `http://localhost:8913` to `ALLOWED_ORIGINS`, run `wrangler dev`, and set
`AI_ENDPOINT` in `config.js` to `http://localhost:8787`.
