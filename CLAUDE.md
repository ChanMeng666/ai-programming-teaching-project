# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An AI Programming Education Platform. Two independently deployed pieces:

1. **Pages site** (repo root) — a Docusaurus 3.8.1 static site: tutorials, versioned curriculum, blog.
2. **Worker backend** (`worker/`) — a Cloudflare Worker named `ai-chat-worker` serving the chat widget, message board, and capstone showcase.

The site is *not* purely static. Three frontend surfaces call the Worker at runtime: `src/components/ChatWidget/`, `src/pages/message-board.js`, `src/pages/capstone-showcase.js`.

### Core Architecture

- **Framework**: Docusaurus 3.8.1 with React 18
- **Content**: MDX-based documentation with versioning support (2024-winter, 2025-summer)
- **Frontend deployment**: Cloudflare Pages project `ai-programming-teaching-project`, auto-deploys on push to `main`. Domains: `programming.chanmeng.org`, `ai-programming-teaching-project.pages.dev`
- **Backend deployment**: Cloudflare Worker `ai-chat-worker`, **manual deploy only** (see below)
- **Localization**: Chinese (zh-Hans) language support
- **Search**: Algolia integration
- **Analytics**: Custom `AITracker` component in `src/components/AITracker/` — detects AI-platform referrers (claude.ai, chat.openai.com, gemini.google.com, etc.) and is wired to send events to `window.va` / `window.gtag` / a custom `/api/analytics/ai-traffic` endpoint **if any of those are present at runtime**. None are currently configured, so the tracker is effectively dormant in production.

## Deployment model — read this before shipping anything

There is **no CI**. No `.github/workflows/` exists. The two halves ship by different mechanisms:

| What changed | How it ships |
|---|---|
| Anything outside `worker/` | `git push origin main` → Cloudflare Pages rebuilds |
| Anything inside `worker/` | `cd worker && npx wrangler deploy` — **manual** |

**Editing `worker/src/*.ts` and pushing to `main` ships nothing.** The Pages build ignores `worker/`.

```bash
# Deploy the Worker
cd worker && npx wrangler deploy
```

Two traps:

- **Always `cd worker` first.** There is no `wrangler.toml` at the repo root, so wrangler infers the Worker name from the directory and creates a junk Worker called `ai-programming-teaching-project`. One such placeholder stub was deleted on 2026-07-10; running wrangler from the root recreates it.
- **`npm run deploy` is not the deploy path.** `package.json` maps it to `docusaurus deploy` (a gh-pages command). It is vestigial. Do not run it, do not document it.

## Backend: `ai-chat-worker`

Source lives in `worker/`. Config: `worker/wrangler.toml`.

### Entrypoint

- **Only** entrypoint: `https://programming-api.chanmeng.org` (Workers Custom Domain).
- `workers_dev = false`. The old `ai-chat-worker.chanmeng-dev.workers.dev` URL returns 404 / `error code 1042`.
- **Why workers.dev is off:** Cloudflare WAF rules are never evaluated for `*.workers.dev` traffic. Leaving it on would let anyone reach `/api/chat` while bypassing every rate limiting rule on the zone. Do not re-enable it.

### Bindings

| Binding | Type | Value |
|---|---|---|
| `AI` | Workers AI | — |
| `VECTORIZE` | Vectorize | index `docs-index`, 768 dims, cosine |
| `CHAT_SESSIONS` | KV | `5c20418b4b924a6dabe67c75610b4c08` |
| `MESSAGE_BOARD` | KV | `4b5e9ccd69394e74b92ea90ba05618ec` |
| `CAPSTONE_VOTES` | KV | `e99e0367303240209038a2a16b2f1415` |
| `CORS_ORIGIN` | plain var | comma-separated allow-list |

Six **secrets** are set via `wrangler secret put` and are not in the repo: `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `NOTION_CAPSTONE_DATABASE_ID`, `CAPSTONE_ADMIN_TOKEN`, `SEED_TOKEN`, `SETUP_SECRET`. `wrangler deploy` does not clobber them.

### Routes (`worker/src/index.ts`)

| Method | Path | Handler |
|---|---|---|
| POST | `/api/chat` | streaming SSE chat with RAG |
| POST | `/api/seed` | index documents into Vectorize (needs `SEED_TOKEN`) |
| POST | `/api/seed/delete` | remove documents |
| GET | `/api/messages` | list message board (Notion-backed, 300s KV cache) |
| POST | `/api/messages` | post a message |
| POST | `/api/messages/setup` | one-time Notion DB setup (needs `SETUP_SECRET`) |
| GET | `/api/capstones` | list published capstones |
| POST | `/api/capstones/vote` | vote |
| POST | `/api/capstones/setup` | one-time Notion DB setup |
| POST | `/api/capstones/admin` | publish a capstone (needs `CAPSTONE_ADMIN_TOKEN`) |
| GET | `/api/health`, `/` | health check |

### Models

- Chat: `@cf/meta/llama-3.1-8b-instruct-fp8` (`worker/src/chat.ts:82`)
- Embeddings: `@cf/baai/bge-base-en-v1.5` (`worker/src/rag.ts`), 768 dims — must match the `docs-index` dimensions

The non-fp8 build `@cf/meta/llama-3.1-8b-instruct` was **deprecated by Cloudflare on 2026-05-30**; while it was still referenced, `/api/chat` returned HTTP 500 with `AiError: 5028`. If chat starts 500ing with a 5xxx `AiError`, suspect a model deprecation first.

### Rate limiting — two independent layers

**Layer 1 — Cloudflare WAF (edge; the request never reaches the Worker).**
Zone `chanmeng.org` is on the **Free plan**, which allows exactly **one** rate limiting rule. That single slot is shared across projects. The rule is named `api-agent-flood-guard` and covers two hosts:

```
(http.host eq "archcanvas.chanmeng.org" and http.request.uri.path eq "/api/agent" and http.request.method eq "POST")
or
(http.host eq "programming-api.chanmeng.org" and http.request.uri.path eq "/api/chat" and http.request.method eq "POST")
```

Threshold **20 POST / 10s per IP**, action Block, duration 10s. Because the slot is shared with the unrelated `archcanvas.chanmeng.org` project, the threshold **cannot be tuned for `/api/chat` alone** without upgrading the zone to Pro. The rule name is misleading — it is no longer agent-only. A blocked request returns `error code: 1015`, `content-type: text/plain`, and **no CORS headers**.

**Layer 2 — in-Worker per-IP counters (KV).**

| Route | Limit | KV key | Source |
|---|---|---|---|
| `POST /api/chat` | 30 / hour | `rate:chat:<ip>` in `CHAT_SESSIONS` | `worker/src/index.ts` |
| `POST /api/messages` | 5 / hour | `rate:msg:<ip>` in `MESSAGE_BOARD` | `worker/src/messages.ts` |
| `POST /api/capstones/vote` | 30 / hour | `cap:rate:<ip>` in `CAPSTONE_VOTES` | `worker/src/capstones.ts` |

`/api/chat` charges its counter **before** invoking the model; the other two increment after success. This is deliberate: a request that times out or throws has still consumed Workers AI, so it must still count against the cap. Preserve that ordering.

### CORS

`CORS_ORIGIN` in `worker/wrangler.toml` is a comma-separated allow-list: `https://programming.chanmeng.org`, `https://ai-programming-teaching-project.pages.dev`, `http://localhost:3000`. In addition, `worker/src/index.ts` matches any `https://<hash>.ai-programming-teaching-project.pages.dev` origin **by suffix**, because Pages mints a new immutable preview origin on every production build. Responses carry `Vary: Origin`; disallowed origins get no `Access-Control-Allow-Origin` header. Setting `CORS_ORIGIN = "*"` restores echo-any-origin behaviour.

**CORS is a browser-only control.** It stops other websites from reading the API from a browser. It does nothing against `curl` or scripts — that is what the rate limits are for. Never describe CORS as abuse protection.

### Frontend ↔ backend coupling

The API base URL is **hardcoded in six files** — no env var, no config. Changing the API domain means editing all six:

- `src/components/ChatWidget/index.js:8` (`API_URL`)
- `src/pages/message-board.js:6` (`API_BASE`)
- `src/pages/capstone-showcase.js:7` (`API_BASE`)
- `worker/scripts/smoke-test.mjs:7`
- `worker/scripts/seed-vectors.ts:41`
- `worker/scripts/namespace-test.mjs:8`

## Essential Commands

```bash
# Frontend (repo root)
npm start          # Dev server on localhost:3000
npm run build      # Production build → ./build
npm run serve      # Serve the production build locally
npm run clear      # Clear Docusaurus cache (first thing to try on weird build errors)

# Content
npm run write-translations  # Extract translatable strings
npm run write-heading-ids   # Generate heading IDs for documentation

# Worker (must run from worker/)
cd worker
npx wrangler dev      # Local Worker
npx wrangler deploy   # Ship the Worker
npx wrangler tail     # Live logs
npx tsx scripts/seed-vectors.ts   # (Re)index docs into Vectorize
```

## Project Structure

### Content Organization

- `/docs/` - Current version documentation
- `/versioned_docs/` - Versioned documentation archives
  - `version-2024-winter/` - Complete winter 2024 curriculum
  - `version-2025-summer/` - Summer 2025 curriculum
- `/blog/` - Blog posts with MDX support
- `/src/components/` - React components (ChatWidget, AITracker, MintlifyShim, SpaceHero, MusicPlayer, …)
- `/src/pages/` - Custom pages: `index.js`, `message-board.js`, `capstone-showcase.js`, `feeds.js`
- `/src/theme/` - Theme customizations
- `/worker/` - Cloudflare Worker backend (`src/`, `scripts/`, `wrangler.toml`)

### Key Configuration Files

- `docusaurus.config.js` - Main Docusaurus configuration
- `sidebars.js` - Documentation sidebar structure
- `versions.json` - Version management
- `package.json` - Frontend dependencies and scripts
- `worker/wrangler.toml` - Worker name, bindings, routes, `workers_dev`, `CORS_ORIGIN`

## Development Workflow

### Adding New Documentation

1. Create new MDX file in appropriate directory:
   ```bash
   # For current version
   touch docs/category/new-topic.mdx

   # For versioned content
   touch versioned_docs/version-2025-summer/category/new-topic.mdx
   ```

2. Add frontmatter:
   ```markdown
   ---
   title: Your Title
   sidebar_position: 1
   ---
   ```

New or edited docs are not searchable by the chat widget until they are re-indexed: `cd worker && npx tsx scripts/seed-vectors.ts`.

### Adding Blog Posts

1. Create new blog post:
   ```bash
   touch blog/YYYY-MM-DD-post-title.mdx
   ```

2. Include author information (defined in `blog/authors.yml`)

### Component Development

- Components use standard React patterns
- No component library - custom CSS in `/src/css/custom.css`
- Responsive design is critical for educational content
- Dark/light theme support via Docusaurus theming

## Verification

There is **no test framework**, but there are real runnable checks. Run them against the deployed Worker after any `worker/` change:

```bash
cd worker
node scripts/smoke-test.mjs      # 6 real RAG questions against /api/chat; prints
                                 # latency and whether a "— Reference:" line appeared
node scripts/namespace-test.mjs  # namespace-scoped retrieval
```

Both hit the live `https://programming-api.chanmeng.org`, so run them *after* `wrangler deploy`, and expect them to consume rate limit budget.

### Known pre-existing breakage — you did not cause this

`cd worker && npx tsc --noEmit` **does not pass**, and has not for a long time. Baseline is **8 errors across 2 files**, none of which affect runtime:

- `worker/src/rag.ts:37` (1 error) — `Property 'data' does not exist` on the Workers AI embedding output union type.
- `worker/scripts/seed-vectors.ts` (7 errors) — needs `@types/node` (`fs`, `path`, `crypto`, `url`, `process`, `import.meta.url` all unresolved).

Do not "fix" unrelated code because typecheck is red. Compare against this baseline first.

## Important Notes

- **No Linting/Formatting**: No ESLint, Prettier, or other code quality tools configured
- **No CI**: nothing runs on push except the Cloudflare Pages build
- **Mermaid Support**: Use mermaid code blocks for diagrams
- **Video Embedding**: react-player is available for video content

## Common Tasks

### Clearing Cache Issues
```bash
npm run clear  # Clears Docusaurus cache
rm -rf node_modules/.cache  # Clear all build caches
```

### Algolia Search Configuration
- Search is configured with Algolia DocSearch
- If search returns no results, check:
  1. CORS settings in Algolia dashboard
  2. Allowed referrers include deployment URL
  3. API keys are correctly configured
- See `ALGOLIA_SETUP_GUIDE.md` for detailed troubleshooting

## Architecture Decisions

1. **Docusaurus Choice**: Selected for excellent documentation features, versioning, and educational content management
2. **MDX Usage**: Enables interactive components within documentation
3. **Cloudflare Pages Deployment**: Fast global CDN, automatic deploys on `git push origin main`, generous free tier. Production URL: `https://programming.chanmeng.org`
4. **Separate Worker, manual deploy**: The backend is deployed on its own cadence so a content push can never break the API, and an API rollback never rebuilds the site. The cost is that `worker/` changes are easy to forget to ship.
5. **Custom domain only for the Worker**: WAF rate limiting rules do not apply to `*.workers.dev`, so the only way to protect `/api/chat` at the edge is to force all traffic through `programming-api.chanmeng.org`
6. **No Testing**: Focus on content creation over code quality automation; smoke tests cover the API surface instead
7. **Experimental Features**: Using @docusaurus/faster and Rspack for improved build performance
