# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Standard community-health documentation (`CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, `GOVERNANCE.md`, this changelog).
- Served the Worker API from the custom domain `programming-api.chanmeng.org`.
- Added per-IP rate limiting to `POST /api/chat` (30 requests per hour); the counter is charged before the model runs, so timed-out requests still count against the cap.

### Changed
- Restricted `CORS_ORIGIN` from `*` to an explicit allow-list, with suffix matching for Cloudflare Pages preview origins; responses now send `Vary: Origin`.

### Removed
- Retired the `*.workers.dev` entrypoint, because Cloudflare WAF rules are never evaluated for `*.workers.dev` traffic and it let callers bypass every rate limiting rule.
- Deleted an empty placeholder Worker script named `ai-programming-teaching-project`, created accidentally by running wrangler from the repository root.

### Fixed
- Restored the AI chat assistant, which returned HTTP 500 from 2026-05-30 to 2026-07-10 after Cloudflare deprecated the `@cf/meta/llama-3.1-8b-instruct` model; swapped to `@cf/meta/llama-3.1-8b-instruct-fp8`.

### Security
- Added a Cloudflare WAF rate limiting rule that blocks bursts to `POST /api/chat` at the edge (20 requests per 10 seconds per IP).

## [2026-07-20] — MindMarket redesign

A complete visual rebuild of every public surface. **No behavior changed** — all
API calls, the SSE chat stream, message-board pagination, capstone polling /
optimistic voting, and lazy YouTube embeds are byte-identical; `worker/` was not
touched.

### Added
- The **MindMarket** design system: warm cream-paper canvas, oversized Inter,
  sticker-soft 50px radii, flat paper-cut illustrations, single light theme. See
  the new `DESIGN.md`.
- New brand assets under `static/img/brand/` (logo, footer logo, favicons,
  apple-touch-icon, 1200×630 social card) and 10 AI-generated paper-cut
  illustrations under `static/img/illustrations/` (`.webp` + `.png`), plus the
  `scripts/generate-illustrations.mjs` pipeline (gpt-image-1 + sharp).
- New `NotFound/Content` swizzle: a display-scale 404 page with illustration and a
  coral home CTA.
- 57 new `zh-Hans` translations for the redesigned UI.

### Changed
- Rebuilt all public pages on the MindMarket look: homepage (now composed from
  `Home/{Hero,Programs,HowItWorks,Community}`), message board, capstone showcase
  (typographic Top-3 — huge ink rank numerals, green border on #1, coral vote
  pills — replacing the old medal/metallic treatment), feeds, docs, and blog.
- Re-architected the CSS: `src/css/custom.css` is now a pure `@import` manifest
  over 8 role-scoped files (`tokens`, `base`, `animations`, `navbar`, `footer`,
  `docs`, `blog`, `pages`).
- Reskinned the chat widget, music player, and docs component layer (MintlifyShim,
  TechNest, Mermaid, toolbar buttons) with CSS only.
- Lighthouse on the production homepage: Performance 94 / Accessibility 96 / Best
  Practices 100 / SEO 100 (LCP 1.5s, CLS 0.001).

### Removed
- **Dark mode**, site-wide and intentionally (`colorMode` locked to light);
  `[data-theme='dark']` is now a maintained grep-zero baseline.
- The old space/galaxy homepage theme — `SpaceBackground`, `SpaceHero`,
  `StarField`, `OrbitingPlanet`, `GlassPanel` components and `static/img/space/`.
- The legacy teal/coral Infima tokens and dead default assets (undraw SVGs, old
  Docusaurus logo/social card, old favicon).

## [0.0.0]

### Added
- Initial documented release of AI Programming Teaching Project.
