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

## [0.0.0]

### Added
- Initial documented release of AI Programming Teaching Project.
