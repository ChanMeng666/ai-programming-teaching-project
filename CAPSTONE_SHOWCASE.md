# Capstone Showcase — publishing runbook

Everything needed to put a student project on `/capstone-showcase`, and to tear
the whole thing down when the cohort is over.

**This page is temporary.** It exists for the TECHNEST 2026 Demo Day window.
Nothing else on the site depends on it, so when it stops being useful, delete it
(see [Retiring the showcase](#retiring-the-showcase)). This document is kept out
of `CLAUDE.md` for that reason.

---

## Where the data lives

There is **no project data in the repo**. A card is assembled from three places:

| Piece | Lives in | Notes |
|---|---|---|
| Project metadata | **Notion database** (worker secret `NOTION_CAPSTONE_DATABASE_ID`) | Only rows with `Status = Published` **and** `Cohort = TECHNEST 2026` are served |
| Vote counts | KV namespace `CAPSTONE_VOTES` | `cap:count:<slug>`; one vote per (ip, ua, clientId) |
| Images | **This repo**, `static/img/capstone/` | Served by Cloudflare Pages, referenced as absolute `https://programming.chanmeng.org/...` URLs |

Code: `worker/src/capstones.ts` (backend), `src/pages/capstone-showcase.js` +
`.module.css` (frontend).

The list endpoint caches the Notion query in KV for 60s (`cap:list:published`).
The admin endpoint busts that cache, so a publish shows up immediately.

## The admin token

`CAPSTONE_ADMIN_TOKEN` is a Worker secret. It is **not** readable from
Cloudflare after it's set, so the local copy is the only copy:

```
worker/.dev.vars      →  CAPSTONE_ADMIN_TOKEN=…
```

`.dev.vars*` is gitignored, and `wrangler dev` picks the file up automatically.
If the token is ever lost, rotate it — nothing else depends on the old value:

```bash
cd worker
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
npx wrangler secret put CAPSTONE_ADMIN_TOKEN   # paste it, then update .dev.vars
```

## Publishing a project

### 1. Prepare the images

Both go in the repo (Pages serves them; the Worker only stores the URL).
Convert to WebP — a 1.4 MB PNG banner lands around 100 KB with no visible loss.
`sharp` is already a transitive dependency, so no install is needed.

```bash
# Hero / promo banner → static/img/capstone/<slug>.webp
node -e "require('sharp')('<source>.png').resize({width:1600,withoutEnlargement:true}).webp({quality:88}).toFile('static/img/capstone/<slug>.webp').then(console.log)"

# Headshot → static/img/capstone/avatars/<student-name>.webp
node -e "require('sharp')('<source>.png').resize({width:256,height:256,fit:'cover'}).webp({quality:88}).toFile('static/img/capstone/avatars/<student-name>.webp').then(console.log)"
```

### 2. Commit and push

```bash
git add static/img/capstone && git commit -m "feat(capstone): <project> images" && git push origin main
```

The Pages build takes **3–6 minutes**. The image URLs 404 until it finishes —
post the row anyway if you like, the card just shows a broken image until the
deploy lands. Verify with:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://programming.chanmeng.org/img/capstone/<slug>.webp
```

### 3. Post the record

`POST https://programming-api.chanmeng.org/api/capstones/admin`

The endpoint is an **upsert keyed on `slug`**: the first post creates the row,
every later post with the same slug patches it. That's how you fix a typo or add
an avatar after the fact — there is no separate update endpoint, and no way to
delete a row except through the Notion UI.

> **Always send the complete record.** A url field you omit is written as `null`,
> i.e. it is *cleared*, not left alone.

```bash
cd worker && node -e "
const fs = require('fs');
const token = fs.readFileSync('.dev.vars','utf8').match(/CAPSTONE_ADMIN_TOKEN=(.+)/)[1].trim();
fetch('https://programming-api.chanmeng.org/api/capstones/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminToken: token,
    title:      'iCare',
    slug:       'icare',
    team:       'Ikenna Anasieze',
    track:      'Personal Growth',
    pitch:      'A healthcare management system that turns complex medical documents into plain English…',
    liveURL:    'https://technest-project-psi.vercel.app/',
    repoURL:    'https://github.com/Donaldnaz/technest-project',
    youTubeURL: 'https://www.loom.com/share/a400b4fd1e064c71b5ca1489e748327a',
    heroImage:  'https://programming.chanmeng.org/img/capstone/icare.webp',
    avatar:     'https://programming.chanmeng.org/img/capstone/avatars/ikenna-anasieze.webp',
    profileURL: 'https://www.linkedin.com/in/ikenna-anasieze/',
    submittedAt:'2026-07-12'
  })
}).then(r => r.json()).then(d => console.log(d));
"
```

Response is `{ message: 'Capstone project created' | 'Capstone project updated', pageId, slug, … }`.
`updated` with the same `pageId` you saw before means the upsert matched — no duplicate card.

### Field reference

| Field | Required | Notes |
|---|---|---|
| `adminToken` | ✅ | From `worker/.dev.vars`. Wrong value → 401. |
| `title` | ✅ | Card heading. |
| `slug` | ✅ | `^[A-Za-z0-9_-]+$`, ≤64. **The upsert key** and the vote key. Never change it after votes come in — the count lives at `cap:count:<slug>` and would reset. |
| `team` | | Student name(s). Shown as "Team: …". |
| `track` | | Exactly one of `Campus Life`, `Personal Growth`, `Creative Tools` — anything else is a 400. Empty is allowed (no pill, hidden from every track filter). |
| `pitch` | | 2–4 sentences. Clamped to ~3 lines on the card. |
| `liveURL` | | "Visit site →" button. |
| `repoURL` | | "GitHub" button. Strip any `/tree/main` suffix. |
| `youTubeURL` | | Misnamed — it's the **demo video URL**, any host. YouTube (`youtu.be/…`, `watch?v=…`, `/embed/`, `/shorts/`) is parsed to an id and embedded as a click-to-play player. Anything else (Loom, Vimeo…) renders a plain "Watch demo" link instead. |
| `heroImage` | | Shown when there's no embeddable YouTube video, and as the video thumbnail when there is. Absolute URL. |
| `avatar` | | Circular headshot next to the team name. |
| `profileURL` | | LinkedIn/GitHub/personal site. Makes the avatar + team name a link to it. |
| `postMortemURL` | | "Post-mortem" button. Use only for an actual write-up. |
| `cohort` | | Defaults to `TECHNEST 2026`. **Any other value and the card will not appear** — the list query filters on it. |
| `status` | | Defaults to `Published`. Set `Hidden` to pull a card without deleting the row. |
| `submittedAt` | | `YYYY-MM-DD`. Defaults to today. Only used as the tiebreak when votes are equal (earlier = higher). |

The `Avatar` and `ProfileURL` Notion properties are created by the endpoint on
demand (idempotent `PATCH` on every call), so adding a field to the DB does not
require touching the Notion UI.

### 4. Verify

```bash
node -e "fetch('https://programming-api.chanmeng.org/api/capstones').then(r=>r.json()).then(d=>console.log(JSON.stringify(d.projects,null,2)))"
```

Then load https://programming.chanmeng.org/capstone-showcase and confirm the
card renders: image, track pill, avatar, buttons, vote count.

## How the page behaves

- Sorted by votes desc, then `submittedAt` asc.
- The 🏆 **Top 3** spotlight section only appears once there are **≥3 published
  projects**. Below that, everything renders in the plain grid.
- The page polls `/api/capstones` every 30s.
- A visitor's votes live in `localStorage` (`capstoneShowcase.voted`), the
  authoritative count in KV. Votes are rate limited to 30/hour per IP.

## Pulling a card down

Set `status: 'Hidden'` and re-post the full record. The row stays in Notion and
the votes stay in KV, so re-publishing later restores everything.

## Retiring the showcase

When the cohort is done and the page should go away:

1. Delete `src/pages/capstone-showcase.js` and `capstone-showcase.module.css`,
   the navbar/footer links to `/capstone-showcase` in `docusaurus.config.js`,
   the `capstoneShowcase.*` keys in `i18n/zh-Hans/code.json`, and
   `static/img/capstone/`.
2. Delete `worker/src/capstones.ts` and its four routes in `worker/src/index.ts`,
   then `cd worker && npx wrangler deploy`.
3. Optionally delete the `CAPSTONE_VOTES` KV namespace, the
   `CAPSTONE_ADMIN_TOKEN` / `NOTION_CAPSTONE_DATABASE_ID` secrets, and the
   Notion database.
4. Delete this file.

Archiving instead? Keep the Notion DB (it's the only record of the projects) and
just remove the page.
