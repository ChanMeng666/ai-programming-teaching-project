# `ai-chat-worker`

The backend API for [programming.chanmeng.org](https://programming.chanmeng.org). A single Cloudflare Worker that serves a RAG-backed chat assistant, a moderated message board, and the capstone showcase.

- **Production entrypoint:** `https://programming-api.chanmeng.org` (Workers Custom Domain)
- **Worker name:** `ai-chat-worker`
- **Deploys:** manually, from this directory. It does **not** ship on `git push`.

There is no `*.workers.dev` entrypoint. `workers_dev = false` in `wrangler.toml`, because Cloudflare WAF rules are never evaluated for `*.workers.dev` traffic — leaving it enabled would let any client reach `/api/chat` while bypassing every rate limiting rule on the zone.

---

## Frontend surfaces

Three pages on the Docusaurus site call this Worker. Each **hardcodes the base URL** — there is no environment variable and no shared config module, so changing the API hostname means editing all three files (plus the three scripts in `scripts/`).

| Surface | Frontend file | Endpoints used |
|---|---|---|
| Chat widget | `src/components/ChatWidget/index.js:8` (`API_URL`) | `POST /api/chat` |
| Message board | `src/pages/message-board.js:6` (`API_BASE`) | `GET`/`POST /api/messages` |
| Capstone showcase | `src/pages/capstone-showcase.js:7` (`API_BASE`) | `GET /api/capstones`, `POST /api/capstones/vote` |

The same URL is hardcoded in `scripts/smoke-test.mjs:7`, `scripts/namespace-test.mjs:8`, and `scripts/seed-vectors.ts:41`.

---

## Architecture

### Request flow

`src/index.ts` is the only entrypoint. Its `fetch` handler is a flat `if`/`else if` router:

1. `OPTIONS` short-circuits to `handleOptions()` for CORS preflight.
2. The path and method are matched against the route table below.
3. Anything unmatched returns `404` with a JSON body.
4. Every response — including 404s and errors — is passed through `addCorsHeaders()` on the way out.

`src/http.ts` provides the one shared helper, `jsonResponse(data, status)`. `src/types.ts` declares the `Env` binding interface.

### The RAG path

A chat request builds its system prompt before it ever reaches the model (`src/rag.ts:127`, `buildSystemPrompt`):

1. The user's message is embedded with `@cf/baai/bge-base-en-v1.5` (`src/rag.ts:34`), producing a 768-dimensional vector — matching the `docs-index` Vectorize index.
2. `searchRelevantDocs()` queries Vectorize with `topK: 8`, `minScore: 0.4`, `returnMetadata: 'all'`.
3. Matches are formatted into a `### <title>` / `Source: <path>` block and appended to the static system prompt.
4. The prompt instructs the model to emit `— Reference: <title> (<source path>)` lines when it draws on retrieved content. The smoke test greps for exactly that string.

**Namespace biasing.** The chat widget passes a `contextNamespace` derived from the reader's current URL (e.g. `2026-technest` when reading `/docs/2026-technest/…`). When present, `searchRelevantDocs` over-fetches `topK * 3` (clamped to Vectorize's cap of 50 when `returnMetadata: 'all'`), then keeps only matches whose metadata namespace is the requested one or `blog`. If fewer than `MIN_NAMESPACE_HITS` (3) survive, it falls back to the unfiltered top-K rather than returning a thin context (`src/rag.ts:85-90`).

The client cannot inject an arbitrary namespace. `src/index.ts:22` holds an `ALLOWED_NAMESPACES` allow-list; anything else is silently dropped to `undefined`:

```
docs-current  2024-winter  2025-summer  2026-peyvand-academy
2026-her-waka  2026-technest  blog
```

These mirror the `DOCS_SOURCES` table in `scripts/seed-vectors.ts:43`.

### The streaming chat response

`processChat()` (`src/chat.ts:57`) calls Workers AI with `stream: true` against `@cf/meta/llama-3.1-8b-instruct-fp8` (`src/chat.ts:82`) and pipes the resulting stream through a `TransformStream`. The transform passes every chunk through untouched while accumulating the decoded text; its `flush()` appends the assembled assistant turn to the session and writes it to KV.

The Worker responds with `Content-Type: text/event-stream` and an `X-Session-Id` header. Sessions live in the `CHAT_SESSIONS` KV namespace for 24 hours and are trimmed to the last 10 messages (`MAX_HISTORY_MESSAGES`) on every save, to keep the prompt from overflowing.

> See [Known issues](#known-issues) — `X-Session-Id` is not currently readable by the browser.

### Notion as the datastore

There is no database. `src/notion.ts` is a thin `fetch` wrapper (`notionFetch`) that attaches the bearer token and pins `Notion-Version: 2022-06-28`. Two Notion databases back the API:

| Data | Notion DB | KV cache | Cache TTL |
|---|---|---|---|
| Message board | `NOTION_DATABASE_ID` | `MESSAGE_BOARD` | 300s (`src/messages.ts:5`) |
| Capstone projects | `NOTION_CAPSTONE_DATABASE_ID` | `CAPSTONE_VOTES` | 60s (`src/capstones.ts:6`) |

Messages are created with `Status = 待审核` (pending) and only surface on `GET /api/messages` once a human flips them to `已通过` (approved) in Notion. The submitter's IP is stored on the Notion row but stripped from the API response by `mapPageToMessage()`.

Capstone vote counts live **only** in KV, never in Notion. `GET /api/capstones` serves cached project metadata but always reads vote counters live. Votes are deduplicated by a SHA-256 hash of `ip|user-agent|clientId` (`src/capstones.ts:106`), so a single visitor toggles at most one vote per project; the dedup key expires after 90 days.

`POST /api/capstones/admin` PATCHes an `Avatar` URL property onto the database before inserting a row (`src/capstones.ts:436`) — the property is absent from the schema originally created by `/api/capstones/setup`, and the PATCH is idempotent. It also busts the 60s list cache so a newly published project appears immediately.

---

## Routes

All routes are on `https://programming-api.chanmeng.org`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/chat` | none (rate limited) | Streaming SSE chat with RAG |
| `POST` | `/api/seed` | `X-Seed-Token` = `SEED_TOKEN` | Embed + upsert documents into Vectorize |
| `POST` | `/api/seed/delete` | `X-Seed-Token` = `SEED_TOKEN` | Delete vectors by ID |
| `GET` | `/api/messages` | none | List approved messages (paginated, cached) |
| `POST` | `/api/messages` | none (rate limited) | Submit a message for moderation |
| `POST` | `/api/messages/setup` | `setupSecret` in body = `SETUP_SECRET` | One-time: create the Notion message DB |
| `GET` | `/api/capstones` | none | List published capstones with live vote counts |
| `POST` | `/api/capstones/vote` | none (rate limited) | Toggle a vote |
| `POST` | `/api/capstones/setup` | `setupSecret` in body = `SETUP_SECRET` | One-time: create the Notion capstone DB |
| `POST` | `/api/capstones/admin` | `adminToken` in body = `CAPSTONE_ADMIN_TOKEN` | Publish a capstone project |
| `GET` | `/api/health`, `/` | none | Health check |

Seed routes authenticate via an **HTTP header**; setup and admin routes authenticate via a **field in the JSON body**. All four fail closed: if the corresponding secret is unset on the Worker, the route returns `401` rather than allowing the request through.

The health route matches on path only — no method check — so any non-`OPTIONS` method reaches it.

### Request shapes

```jsonc
// POST /api/chat
{ "message": "How do I install the dev tools?",
  "sessionId": "…",            // optional; from a previous X-Session-Id
  "contextNamespace": "2026-technest" }  // optional; must be in ALLOWED_NAMESPACES

// POST /api/messages   (nickname ≤30 chars, content ≤500 chars)
{ "nickname": "…", "content": "…", "category": "心得体会" }

// POST /api/capstones/vote
{ "slug": "…", "clientId": "…", "action": "add" }  // action: "add" | "remove"

// POST /api/capstones/admin
{ "adminToken": "…", "title": "…", "slug": "…", "team": "…",
  "track": "Campus Life", "pitch": "…",
  "liveURL": "…", "repoURL": "…", "youTubeURL": "…",
  "heroImage": "…", "avatar": "…", "postMortemURL": "…" }
```

`category` must be one of `心得体会`, `经验分享`, `教程讨论`, `其他`. `track` must be one of `Campus Life`, `Personal Growth`, `Creative Tools`. `slug` must match `^[A-Za-z0-9_-]+$` and be ≤64 characters.

---

## Bindings and secrets

Declared in `wrangler.toml`:

| Binding | Type | Value |
|---|---|---|
| `AI` | Workers AI | — |
| `VECTORIZE` | Vectorize | index `docs-index`, 768 dims, cosine |
| `CHAT_SESSIONS` | KV | sessions + chat rate counters |
| `MESSAGE_BOARD` | KV | message cache + message rate counters |
| `CAPSTONE_VOTES` | KV | vote counts, voter dedup, vote rate counters |
| `CORS_ORIGIN` | plain var | comma-separated origin allow-list |

Six secrets are **not** in the repo and are set out-of-band. `wrangler deploy` does not clobber them.

| Secret | Used by |
|---|---|
| `NOTION_TOKEN` | every Notion call (`src/notion.ts`) |
| `NOTION_DATABASE_ID` | message board |
| `NOTION_CAPSTONE_DATABASE_ID` | capstone showcase |
| `CAPSTONE_ADMIN_TOKEN` | `POST /api/capstones/admin` |
| `SEED_TOKEN` | `POST /api/seed`, `POST /api/seed/delete` |
| `SETUP_SECRET` | both `/setup` routes |

Set one:

```bash
cd worker
npx wrangler secret put NOTION_TOKEN
# paste the value at the prompt — do not pass it as an argument
```

List the names currently set (values are never retrievable):

```bash
npx wrangler secret list
```

---

## Local development

```bash
cd worker
npm install
npm run dev          # wrangler dev
```

`wrangler dev` uses the `preview_id` KV namespaces from `wrangler.toml`, so local runs never touch production session, message, or vote data. Workers AI and Vectorize calls are proxied to the real Cloudflare account.

Secrets are not available locally. Create a `.dev.vars` file in this directory (it is not committed) with `KEY=value` lines for whichever secrets the route you are exercising needs. `/api/chat` needs none of them; the message board and capstone routes need `NOTION_TOKEN` plus the relevant database ID.

To point the frontend at a local Worker, temporarily edit the three hardcoded URLs listed above.

---

## Verification

This project has no test framework, but there are three runnable checks. All of them hit the **deployed production Worker** and consume real rate limit quota, so run them deliberately.

```bash
cd worker

# 6 real RAG questions against /api/chat. Prints each answer, its latency,
# and whether a "— Reference:" citation line appeared.
node scripts/smoke-test.mjs

# Sends the same query with 5 different contextNamespace values and diffs
# the citations. If namespace filtering works, the references differ.
node scripts/namespace-test.mjs
```

Note that `/api/chat` allows 30 requests per IP per hour. Two full smoke-test runs plus a namespace test will consume more than a third of that budget.

Typechecking:

```bash
npx tsc --noEmit    # see "Known issues" — this does not currently pass clean
```

---

## Seeding the vector index

`scripts/seed-vectors.ts` walks `docs/`, `versioned_docs/*`, and `blog/`, strips frontmatter and JSX, splits each file into 800-character chunks with 150 characters of overlap, and POSTs them to `/api/seed`.

Chunk IDs are content-addressed — `c-<sha1(path|index|text)>` — which makes seeding incremental. The script keeps the ID set of the last successful run in `scripts/.seeded-ids.json`, then on the next run:

- chunks whose ID already exists are **skipped** (byte-identical content ⇒ identical embedding),
- IDs that vanished are **deleted** via `/api/seed/delete`,
- only new or changed chunks are embedded and upserted.

Run it after editing any course content, otherwise the assistant keeps citing the old text:

```bash
cd worker

# PowerShell
$env:SEED_TOKEN="…"; npm run seed

# Bash
SEED_TOKEN=… npm run seed
```

Deleting `scripts/.seeded-ids.json` forces a full re-embed of every chunk.

---

## Deployment

The Worker is deployed **manually**. There is no `.github/workflows/`, and pushing to `main` rebuilds only the Cloudflare Pages site. Editing `worker/src/*.ts` and pushing ships nothing.

```bash
cd worker
npx wrangler deploy
```

> **Always `cd worker` first.** `wrangler.toml` lives in this directory, not at the repo root. Run `wrangler deploy` from the root and wrangler finds no config, infers the Worker name from the directory name, and publishes an empty placeholder Worker called `ai-programming-teaching-project` — which collides confusingly with the Pages project of the same name. If you find a stub Worker by that name in the dashboard, this is where it came from; delete it.

---

## Security model

### Layer 1 — Cloudflare WAF (edge)

A zone-level rate limiting rule blocks the request before it ever reaches the Worker, so it costs nothing and burns no quota.

| | |
|---|---|
| Rule name | `api-agent-flood-guard` |
| Threshold | 20 `POST` per 10 seconds, per IP |
| Action | Block, 10s duration |
| Covers | `POST programming-api.chanmeng.org/api/chat` |

A blocked request returns `error code: 1015` as `text/plain`, with **no CORS headers** — so in the browser it surfaces as an opaque network/CORS failure rather than a clean `429`.

Two constraints worth internalising:

- The zone `chanmeng.org` is on Cloudflare's **Free plan**, which permits exactly **one** rate limiting rule. That single slot is shared with an unrelated project (`archcanvas.chanmeng.org/api/agent`), which is why the rule name says "agent". **The threshold cannot be tuned for `/api/chat` independently** without upgrading the zone to Pro.
- WAF rules apply only to custom domains. This is the entire reason `workers_dev = false`.

### Layer 2 — in-Worker per-IP counters (KV)

Counters keyed on `CF-Connecting-IP`, with a one-hour TTL.

| Route | Limit | KV key | Namespace | Source |
|---|---|---|---|---|
| `POST /api/chat` | 30 / hour | `rate:chat:<ip>` | `CHAT_SESSIONS` | `src/index.ts:132` |
| `POST /api/messages` | 5 / hour | `rate:msg:<ip>` | `MESSAGE_BOARD` | `src/messages.ts:227` |
| `POST /api/capstones/vote` | 30 / hour | `cap:rate:<ip>` | `CAPSTONE_VOTES` | `src/capstones.ts:260` |

These return a clean `429` with a JSON body and CORS headers intact.

`/api/chat` charges its counter **before** invoking the model (`src/index.ts:150-154`). The other two increment only after a successful write. The asymmetry is deliberate: a chat request that times out or throws has still consumed Workers AI, so it must still count against the cap. The vote endpoint likewise increments even on a no-op toggle, to discourage probing.

Because KV writes are eventually consistent, a burst of concurrent requests from one IP can slip a few over the limit. The WAF rule is what stops the sharp end of a flood; these counters are what stop a slow, sustained drain of the Workers AI budget.

### CORS

`CORS_ORIGIN` is a comma-separated allow-list:

```
https://programming.chanmeng.org
https://ai-programming-teaching-project.pages.dev
http://localhost:3000
```

In addition, `resolveAllowedOrigin()` (`src/index.ts:43`) matches any origin ending in `.ai-programming-teaching-project.pages.dev` **by suffix**, because Cloudflare Pages mints a new immutable `<hash>.<project>.pages.dev` origin on every production build and those cannot be enumerated in advance.

Responses carry `Vary: Origin`. A disallowed origin simply receives no `Access-Control-Allow-Origin` header — the request still executes; the browser just refuses to hand the response to the calling script. Setting `CORS_ORIGIN = "*"` restores permissive echo-any-origin behaviour.

> **CORS is not abuse protection.** It stops *other websites* from reading this API in a *browser*. It does nothing about `curl`, a script, or a scraper — none of which send an `Origin` header or honour the response if they do. The rate limits above are the abuse protection. Do not reason about the two as if they were the same control.

---

## Troubleshooting

**Read live logs first.** This streams every request the deployed Worker handles, including `console.error` output:

```bash
cd worker
npx wrangler tail ai-chat-worker
```

| Symptom | Cause | Fix |
|---|---|---|
| `error code: 1015`, plain text, no CORS headers | Blocked at the edge by the WAF rate limiting rule (>20 POST/10s from your IP) | Back off. It clears in 10 seconds. Nothing reached the Worker, so `wrangler tail` shows nothing. |
| `error code: 1042` | You are calling `ai-chat-worker.chanmeng-dev.workers.dev`. That entrypoint is retired (`workers_dev = false`). | Use `https://programming-api.chanmeng.org`. |
| `500` from `/api/chat`, `AiError: 5028` in the tail | Cloudflare has deprecated the chat model | Update the model ID in `src/chat.ts:82` to a current Workers AI model, then redeploy. |
| Chat returns `429` with a JSON body | In-Worker per-IP limit (30/hour) | Wait for the hour-long TTL, or clear `rate:chat:<ip>` from the `CHAT_SESSIONS` KV namespace. |
| Answers cite stale or missing course content | The Vectorize index is behind `docs/` | Re-run the seed script. |
| Answers never include a `— Reference:` line | Retrieval returned nothing above `minScore: 0.4`, or `VECTORIZE` is unbound | Run `node scripts/namespace-test.mjs`; check the index has vectors. |
| `/api/messages` returns a message that isn't visible on the site | The Notion row is still `待审核` | Approve it in Notion. Allow up to 300s for the KV cache to expire. |
| A newly published capstone doesn't appear | 60s list cache | Wait, or re-POST to `/api/capstones/admin`, which busts the cache. |
| `401 Unauthorized` from `/api/seed` or a `/setup` route | The secret is unset on the Worker, or you sent it in the wrong place | Seed routes want the `X-Seed-Token` **header**; setup/admin routes want the token in the **JSON body**. Confirm with `npx wrangler secret list`. |
| Browser console shows a CORS error, but `curl` works | Your origin is not in `CORS_ORIGIN` and does not match the Pages preview suffix | Add it to `[vars]` in `wrangler.toml` and redeploy. |

---

## Known issues

These are pre-existing and unrelated to any change you are about to make. They are recorded so nobody spends an afternoon concluding they broke something.

**`npx tsc --noEmit` does not pass.** Eight errors, none of which affect runtime:

- `src/rag.ts:37` — `Property 'data' does not exist on type 'Ai_Cf_Baai_Bge_Base_En_V1_5_Output'`. The generated Workers AI types model the embedding output as a union that includes an async-response variant; the code reads `.data[0]` off it unconditionally. Correct at runtime, unprovable to the compiler as written.
- `scripts/seed-vectors.ts` — seven errors from missing `@types/node`: `fs`, `path`, `crypto`, `url`, `import.meta.url`, and two `process` references. The script runs fine under `tsx`; only the typecheck, which includes `scripts/**/*` via `tsconfig.json`, complains.

**`X-Session-Id` is not readable by the browser.** `/api/chat` returns the session ID as a response header, and `ChatWidget` reads it at `src/components/ChatWidget/index.js:123` to persist the session. But the Worker never sets `Access-Control-Expose-Headers`, and `X-Session-Id` is not a CORS-safelisted response header — so on a cross-origin request (the site and the API are on different subdomains) `response.headers.get('X-Session-Id')` returns `null`. The widget therefore never stores a session ID, and every chat turn opens a fresh server-side session with no history.

The bug is invisible from the terminal: `scripts/smoke-test.mjs` reads the same header successfully, because Node's `fetch` does not enforce CORS header filtering. The widget also *looks* like it remembers the conversation, because it renders its own transcript from `localStorage` — only the model's context is lost. Fixing it means adding `Access-Control-Expose-Headers: X-Session-Id` in `addCorsHeaders()` (`src/index.ts:87`).
