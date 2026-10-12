# worker/ — `ai-chat-worker`

The API behind the chat widget, the message board and the capstone showcase. Routes are the router in `src/index.ts`; bindings are in `wrangler.toml`.

## Deploy

```bash
cd worker && npx wrangler deploy
```

- Manual only. Pushing to `main` does not ship this directory.
- Always run wrangler from `worker/`. From the repo root it finds no config and publishes an empty Worker named `ai-programming-teaching-project`.
- The only entrypoint is `https://programming-api.chanmeng.org`. `workers_dev` stays `false`: Cloudflare never evaluates WAF rules for `*.workers.dev`, so turning it on would bypass the edge rate limit.

## Verify

```bash
node scripts/smoke-test.mjs       # 6 RAG questions; checks for "— Reference:" lines
node scripts/namespace-test.mjs   # same query across namespaces; citations should differ
```

Both hit production and spend the `/api/chat` budget (30 per hour per IP), so run them after a deploy, not before.

`npx tsc --noEmit` reports **10 known errors** that do not affect runtime: 1 in `src/rag.ts` (embedding output union) and 9 in `scripts/seed-vectors.ts` (no `@types/node`). Compare against that baseline rather than fixing them in passing.

## Rate limiting

Two independent layers.

**Edge (WAF).** Rule `api-agent-flood-guard`: 20 POST per 10s per IP on `/api/chat`, block for 10s. The zone is on the Free plan, which allows one rate limiting rule, and that slot is shared with `archcanvas.chanmeng.org/api/agent`. The threshold cannot be tuned for chat alone. A blocked request returns `error code: 1015` as plain text with no CORS headers, so a browser reports it as a CORS failure.

**In-Worker.** Per-IP counters in the edge cache, not KV (`src/cache.ts` explains why). Chat 30/hour, messages 5/hour, votes 30/hour.

- `/api/chat` charges the counter **before** calling the model. A request that times out has still spent Workers AI. Keep that order.
- Messages and votes charge only after a successful write.

CORS is a browser control, not abuse protection. `curl` ignores it; the rate limits are what stop abuse.

## Data

- Notion is the datastore for messages and capstone projects. A message is created as `待审核` and appears only after someone sets it to `已通过` in Notion.
- Vote counts and voter dedup live only in KV (`CAPSTONE_VOTES`).
- KV free tier allows 1,000 writes a day. Caches and rate counters use the Cache API for that reason. Do not move them back to KV.
- Six secrets are set with `wrangler secret put` and survive deploys: `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `NOTION_CAPSTONE_DATABASE_ID`, `CAPSTONE_ADMIN_TOKEN`, `SEED_TOKEN`, `SETUP_SECRET`. Seed routes take the token in the `X-Seed-Token` header; setup and admin routes take it in the JSON body.

## Retrieval

- Embeddings are 768-dimensional (`@cf/baai/bge-base-en-v1.5`) and must match the `docs-index` Vectorize index.
- Namespaces are `blog` and one per entry in the repo's `versions.json`. `scripts/seed-vectors.ts` writes them from its own `DOCS_SOURCES` table, so a new course version needs a row there too.
- Seeding is incremental: chunk IDs are content hashes, tracked in `scripts/.seeded-ids.json` (gitignored, so it exists only on the machine that last seeded). Without it the script re-embeds everything and cannot delete what it no longer produces; clear leftovers with `wrangler vectorize list-vectors` / `delete-vectors docs-index`.
- `npx tsx scripts/seed-vectors.ts --dry-run` prints chunk counts per namespace and sends nothing. `SEED_TOKEN` is read from the environment; the local copy is in `.dev.vars`.

## When it breaks

- `/api/chat` returns 500 with a 5xxx `AiError`: suspect a model deprecation first. Cloudflare retired the non-fp8 llama build on 2026-05-30 and chat was down until the model ID in `src/chat.ts` changed.
- `error code: 1042`: something is calling the retired `workers.dev` URL.
- `npx wrangler tail` shows live logs. A request blocked by the WAF never appears there.
- Chat loses its history between turns: check that `Access-Control-Expose-Headers: X-Session-Id` is still sent. The smoke test cannot catch this, because Node does not filter CORS headers.
