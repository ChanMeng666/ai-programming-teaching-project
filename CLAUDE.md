# CLAUDE.md

A course site with a small API behind it. The two halves deploy separately:

| Half | Where | Ships by |
|---|---|---|
| Docusaurus site | repo root | `git push origin main` → Cloudflare Pages rebuilds `programming.chanmeng.org` |
| Worker `ai-chat-worker` | `worker/` | `cd worker && npx wrangler deploy` — manual. See `worker/CLAUDE.md` |

There is no CI and no test framework. A push to `main` is a production deploy of the site, and ships nothing in `worker/`.

Only what the code cannot tell you is written here. Routes, bindings, scripts, components and tokens are in the files that define them.

## Verify

- **Frontend:** `npm run build` builds both locales and is the only gate. Never run two builds at once (`build/` is wiped at the start). A transient `ENOENT … __server/server.bundle.js` is an SSG race: `npm run clear`, then rebuild.
- **Grep-zero in `src/`:** `data-theme='dark'`, `--space-`, `#0f7173`, `#1ab0b2`, `#f05d5e`, `#25c2a0`, `homepage-wrapper`, and any non-`none` `box-shadow` except the music-pulse ring keyframe in `src/css/animations.css`.
- **Worker:** see `worker/CLAUDE.md`.

## Edge configuration outside the repo

The `chanmeng.org` zone has Cloudflare Speed Brain on, which answers any `Sec-Purpose: prefetch` request for an uncached file with a 503. Docusaurus prefetches route chunks that way, so every deploy produced a burst of console 503s. A request header transform rule on the zone removes `Sec-Purpose` for `programming.chanmeng.org` only. If prefetch 503s come back, check that rule still exists before looking at the site.

## Single sources of truth

| Fact | Lives in |
|---|---|
| Course versions | `versions.json`. The chat widget and the Worker's namespace allow-list both import it |
| API base URL | `src/config/api.js` (site), `worker/scripts/config.mjs` (Worker scripts) |
| Capstone awards and credentials | `src/data/awards.json`, read through `src/data/awards.js` |
| Design tokens and rules | `src/css/tokens.css`, explained in `DESIGN.md` |
| Components available in every MDX file | `src/theme/MDXComponents.js` |
| Global mounts (chat widget, music player) | `src/theme/Layout/index.js` |

Adding a course version also needs: a label in `docusaurus.config.js`, a `DOCS_SOURCES` row in `worker/scripts/seed-vectors.ts`, a Worker deploy, and a re-seed.

## Content

- `versioned_docs/version-<slug>/` is what the site publishes. `2026-technest` is served at `/docs/`, the others at `/docs/<slug>/`.
- There is no unversioned course content (`includeCurrentVersion: false`). `docs/` holds only showcase media.
- English is the default locale. Chinese lives in `i18n/zh-Hans/`.
- The chat assistant only knows what has been seeded. After editing course content: `cd worker && npx tsx scripts/seed-vectors.ts`.

## Frontend rules

Read `DESIGN.md` before touching any styling. The rules that get broken most:

- Light theme only. Dark mode was removed on purpose.
- No shadows, no gradients. Elevation is a white surface on cream with a hairline border.
- Green (`#8ed462`) is structural only, never text. Coral buttons take ink text, never white.
- Accent colours never signal state.
- `.mm-*` class names in `src/css/pages.css` are consumed by exact name. So are `.header-music-link` and its modifiers, which `MusicPlayer` binds to.

## i18n

- New UI string: `translate({ id, message })`, then `npm run write-translations -- --locale zh-Hans`, then translate the new entry in `i18n/zh-Hans/` by hand.
- `write-translations` reports some IDs as unused (`homepage.hero.welcome`, `feeds.table.content`, `theme.NotFound.p1`/`p2`). They are kept on purpose.
- Brand and programme names stay English. Capstone ranks are 冠军 / 亚军 / 季军.
- `/certificate/*` is English-only and does not use `translate()`: the credentials are issued in English.

## Capstone certificates

Runbook: `CAPSTONE_SHOWCASE.md`.

- The TECHNEST 2026 awards were frozen on 2026-08-06. Never derive rank from the API, and never edit `rank`, `tier`, `votes` or `certId`: each backs a public credential page that students link from LinkedIn.
- Never delete `/certificate/*`, `src/data/awards.*` or `static/img/certificates/`, even when the showcase itself is retired.
- Playwright is deliberately not in `package.json` (its browser download would run on every Pages build). `scripts/render-certificates.mjs` resolves a global install.
- No image model writes a name, an ID or a QR code. Models draw only the decorative plate; every fact is DOM composited on top.

## Secrets

`OPENAI_API_KEY` goes in `.env.local` for the image scripts. Worker secrets are set with `wrangler secret put`; local copies live in `worker/.dev.vars`. Neither file is committed.
