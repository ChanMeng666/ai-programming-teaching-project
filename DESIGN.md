# DESIGN.md — the MindMarket design system

This is the canonical, in-repo reference for the visual design of the site. The
original spec lived outside the repo; **this file is now the source of truth.**
Read it before changing any frontend styling, and extend it (rather than
re-deriving decisions) when the system grows.

The runtime tokens live in `src/css/tokens.css`; this document explains what they
mean and the rules that govern their use.

---

## Character

MindMarket is a **warm, storybook-cream editorial** look: oversized Inter set on
a cream-paper canvas, sticker-soft rounded corners, and flat paper-cut character
illustrations that sit directly on the page. It is deliberately unslick — no
shadows, no gradients, no glassmorphism, no 3D, no photography. Elevation is
communicated by putting a pure-white surface on the cream background and drawing
a single hairline border around it. The system is **single-theme (light only)**.

It replaced a space/galaxy homepage (deep blue-purple gradient, glass panel,
orbiting planets, star field) on a teal/coral Infima theme with dark mode. All of
that is retired; any older screenshot or doc showing it is stale.

---

## Tokens

### Colors

| Token | Hex | Role |
|---|---|---|
| `--color-cream-paper` / `--surface-cream-paper` | `#f5f1e4` | Page canvas (body background) |
| `--color-pure-white` / `--surface-pure-white` | `#ffffff` | Elevated surfaces — cards, panels, navbar pill |
| `--color-sandstone` / `--surface-sandstone` | `#e0dbce` | Recessed fills: inputs, segmented controls |
| `--color-ink-black` | `#2c2e2a` | Text, icons, borders — the primary "dark" |
| `--color-ink-muted` | `#5d5f5b` | Muted text **under 24px** (5.4:1 on cream — passes AA) |
| `--color-stone-gray` | `#80827f` | Muted text **≥24px only** (3.2:1 — fails AA at body sizes) |
| `--color-hairline-mist` | `#d5d5d4` | Hairline borders / dividers |
| `--color-fresh-grass` | `#8ed462` | **Structural accent only** — borders, focus rings, active edges |
| `--color-coral-pop` | `#ff705d` | Action-button fills — **always paired with ink text** |
| `--color-sunshine-pop` | `#f5e211` | Footer band |
| `--color-sky-pop` | `#2ba0ff` | Decorative dots only |

**Accent colors are decorative, never semantic.** Green does not mean "success",
coral does not mean "error". They are visual punctuation, not state signaling.

### Type scale

Font: **Inter** only (weights 400 / 500 / 700), loaded via `headTags` preconnect
in `docusaurus.config.js` — never a CSS `@import` (a blocking import delays first
paint). Headings are weight **500**. Body base is 16px / 1.6.

The marketing pages use a **fluid** scale (letter-spacing in `em` so it tracks
font size); docs/chrome use the fixed scale.

| Token | Value | Use |
|---|---|---|
| `--text-display-fluid` | `clamp(48px, 10.5vw, 140px)` | Hero / display headline |
| `--text-heading-lg-fluid` | `clamp(38px, 6.5vw, 81px)` | Section headline |
| `--text-heading-fluid` | `clamp(30px, 4vw, 53px)` | Sub-headline |
| `--tracking-display-fluid` / `-lg` | `-0.06em` | Display + large-heading tracking |
| `--tracking-heading-fluid` | `-0.04em` | Heading tracking |
| `--text-subheading` | `20px` | Lead paragraphs |
| `--text-body-lg` / `--text-body-sm` | `18px` / `15px` | Body copy |

Docs `h1` renders at roughly 44px caps. Display line-height is `0.95`.

### Radii

| Token | Value | Use |
|---|---|---|
| `--radius-full` / `--radius-nav` / `--radius-cards` / `--radius-buttons` | `50px` | Pills, marketing cards, navbar, buttons |
| `--radius-illustration-containers` | `63.75px` | Illustration frames |
| `--radius-2xl` / `--radius-3xl` | `20px` / `25.5px` | Dense cards, panels |
| `--radius-lg` / `--radius-small` | `10px` | Chips |

Docs surfaces use **smaller** radii than marketing (16px code blocks, ~20px
cards) — the storybook softness is dialed down where reading density matters.

### Surfaces & elevation

There is no shadow token — elevation is `white surface on cream canvas + 1px
hairline-mist border`. `--ifm-global-shadow-*` and `--ifm-navbar-shadow` are all
forced to `none`. `--ifm-navbar-height: 84px` (pill height + top float) drives the
sticky offsets of the doc sidebar and TOC — changing it shifts both.

---

## Hard rules

**Do**

- Use white-on-cream + a hairline border for elevation.
- Use `--color-ink-muted` (`#5d5f5b`) for any muted text under 24px.
- Put **ink** text on coral buttons.
- Use green only structurally (borders, focus rings, active edges).
- Give every image explicit `width`/`height` (CLS is at 0.001 — keep it there).
- Reuse the `.mm-*` utilities and tokens instead of inventing new values.

**Don't**

- No `box-shadow` (the *only* exception: the decorative green music-pulse ring
  keyframe in `animations.css`). No gradients anywhere.
- Don't use green as a text color, ever. Don't put white text on coral.
- Don't use stone gray (`#80827f`) for text under 24px — it fails AA on cream.
- Don't treat accent colors as semantic states.
- **Don't add dark mode.** `[data-theme='dark']` CSS in `src/` is a maintained
  grep-zero baseline; `colorMode` is locked to light in `docusaurus.config.js`.
- Don't `@import` the webfont in CSS — it's a `headTags` preconnect.

Focus style: a 2px `#8ed462` outline (via `:focus-visible` in `base.css`).

---

## Component vocabulary

The `.mm-*` utilities live in `src/css/pages.css` and are consumed by page
components (`Home/*`, message-board, capstone, feeds) **by exact class name** —
renaming one silently breaks the page that uses it.

| Class | Renders |
|---|---|
| `.mm-display` | Fluid display headline (zh-Hans gets a smaller clamp — see below) |
| `.mm-heading-lg` / `.mm-heading` | Section / sub-section headline |
| `.mm-eyebrow` | Small uppercase label above a heading |
| `.mm-card` / `.mm-card--sm` | White card, hairline border, 50px radius (sm = tighter padding) |
| `.mm-btn` | Base pill button |
| `.mm-btn-coral` | Coral fill, **ink text** — primary action |
| `.mm-btn-ghost` | Transparent, ink border — secondary action |
| `.mm-btn-dot--blue` / `--green` / `--coral` | Button with a leading decorative dot |
| `.mm-chip` | 10px-radius label chip |
| `.mm-section` / `.mm-band` | Section wrapper / full-width color band |
| `.mm-reveal` / `.mm-reveal-stagger` | Scroll-reveal targets (see hook below) |

**Scroll reveal** — `src/hooks/useScrollReveal.js`, default export
`useScrollReveal(deps=[])`. Reveals `.mm-reveal`/`.mm-reveal-stagger` via
IntersectionObserver (threshold `.15`, rootMargin `0px 0px -10% 0px`). SSR-safe;
reduced-motion reveals immediately; re-scans when `deps` change (pass async data,
e.g. `useScrollReveal([messages])`); a 4s failsafe force-reveals anything missed.
The hidden pre-reveal state is gated inside `@media (prefers-reduced-motion:
no-preference)` in `animations.css`.

---

## CSS architecture

`src/css/custom.css` is a **pure `@import` manifest** — webpack resolves the
imports at build time, so **import order is cascade order**. Keep `tokens.css`
first (everything reads its custom properties) and `pages.css` last (marketing
utilities may legitimately override chrome defaults).

| File | Role |
|---|---|
| `tokens.css` | MindMarket custom props + Infima bridge + DocSearch vars + fluid clamps |
| `base.css` | body / headings / links (underlined, ink), selection, scrollbar, `:focus-visible` |
| `animations.css` | keyframes, `.mm-reveal*`, global reduced-motion kill-switch |
| `navbar.css` | floating white pill navbar (pure CSS on the **stock** navbar, no swizzle) |
| `footer.css` | full-width sunshine-yellow band, ink text |
| `docs.css` | sidebar, TOC rail, breadcrumbs, pagination, admonitions, tabs, code blocks |
| `blog.css` | list cards, tag chips |
| `pages.css` | `.mm-*` utilities + search page + 404 + back-to-top |

---

## Per-surface notes

**Navbar** — a floating white pill: `min(1320px, calc(100% - 24px))` wide, 20px
top float. Built with pure CSS on the stock Docusaurus navbar (no swizzle).
Desktop shows a logo-only brand and an **icon-only** DocSearch; github / discord /
rss / music are 36px icon circles drawn with `::before` mask icons. Items carry
`white-space: nowrap` — **critical for CJK**: without it, zh labels stack
vertically. `hideOnScroll` uses `.navbar--hidden{transform:translate3d(0,calc(-100% - 24px),0)}`.
The mobile drawer is cream and re-clones the icon buttons as `.menu__link`.

**Footer** — a full-width sunshine-yellow (`#f5e211`) band with ink text. The
copyright line keeps the legacy `chan_logo.svg`.

**Docs** — active sidebar item is white with a 3px green left edge; the TOC is a
hairline rail; breadcrumbs and pagination are chips/cards. Admonitions (`.alert`)
are white with a **2px colored outline, not a fill**: tip = green, info = blue,
warning + danger = coral. Code blocks are white + hairline, 16px radius. Infima
`.tabs` render as a sandstone segmented control. Radii are smaller here than on
marketing pages.

**zh-Hans typography** — Inter has no CJK glyphs, and `-0.06em` tracking is
harmful for Chinese. `:lang(zh-Hans) .mm-display` / `.mm-heading-lg` therefore get
a smaller clamp (display `clamp(36px, 7.5vw, 96px)`), `letter-spacing: -0.01em`,
`text-wrap: balance`, and `word-break: keep-all` (CJK otherwise breaks mid-word at
display scale). Capstone ranks localize as 冠军 / 亚军 / 季军; brand and program
names stay English.

**Component layer (CSS modules only, zero logic change)** — MintlifyShim (Steps =
green circle numerals; Accordion/Card/Frame = white + hairline), TechNest
(PromptStep blue / VerifyStep green / ManualStep ink / RecoverStep coral
outlines; AxisBadge dot chips; PdfDownload coral pill), Mermaid (white card +
segmented tabs), CopyMarkdown / OpenInChatGPT buttons (ghost buttons in a white
pill toolbar), LoadingBar (solid green).

**Capstone Top-3** — typographic, not medals: huge ink rank numerals, no
metallics; `#1` gets a 3px green border; the vote control is a coral pill with the
count in a white dot; a voted card becomes a green-border ghost.

---

## Imagery

Flat **paper-cut character illustrations** on transparent background, sitting
directly on the cream canvas (no frames, no clipping). No photography, no 3D.

- **Source:** `static/img/illustrations/` — 10 assets, each `.webp` (used in
  pages) + `.png`: `hero` (1200w), `home-learn` / `home-build` / `home-community`
  (640w), `message-board` (560w), `capstone` (560w), `feeds` (480w),
  `blog-header` (900w), `not-found` (560w), `footer-accent` (320w).
- **Brand:** `static/img/brand/` — `logo.svg` (green rounded square + ink
  double-chevron "sprout" mark), `logo-footer.svg`, `favicon.ico`, `favicon-32.png`,
  `apple-touch-icon.png`, `social-card.png` (1200×630, regenerated from
  `scripts/social-card.html`).

### Regenerating illustrations

`scripts/generate-illustrations.mjs` — OpenAI `gpt-image-1`,
`background:"transparent"`, quality high, then sharp post-process (trim → resize →
webp q80 + png). `sharp` is a devDependency.

```bash
node scripts/generate-illustrations.mjs --only hero --force --env-file .env.local
```

- `--only <id>` regenerates one asset; `--force` overwrites; `--env-file <path>`
  points at a dotenv file.
- Reads `OPENAI_API_KEY` from env or the `--env-file`. **Never hardcode or commit
  an API key.**
- Per-asset webp overrides exist — `hero` uses `alphaQuality:70` because its alpha
  channel dominates the file size.

---

## Known traps

- **Algolia CSS order.** The DocSearch stylesheet loads *after* `custom.css` and
  wins equal-specificity battles. DocSearch theming must out-specify it:
  `:root:root { --docsearch-muted-color: #5d5f5b }` and
  `.navbar .DocSearch-Button …`. Plain `.DocSearch-Button` rules silently lose.
- **Search result selector.** Target `[class*='searchResultItem_']` — the
  **trailing underscore is required**; a plain substring over-matches CSS-module
  child classes.
- **`.header-music-link` coupling.** MusicPlayer JS
  (`src/components/MusicPlayer/index.js`) does event delegation on
  `.header-music-link` and toggles `--activated` / `--expanded` modifier classes.
  Those class names *and* the raw-HTML navbar item in `docusaurus.config.js` are
  load-bearing — don't rename either.
- **MusicPlayer geometry.** `iframeManager` pins the YouTube iframe at fixed
  offsets (popup header 47px tall → iframe top 117px). Any CSS change to the popup
  header/footer heights breaks iframe alignment; the paddings were tuned to
  preserve those exact heights.
- **Build race.** A transient `ENOENT ... __server/server.bundle.js` during build
  is an SSG worker/filesystem race, not a code error — `npm run clear`, then
  rebuild. Never run two builds concurrently (`build/` is wiped at start).
- **Grep-zero baselines.** After any frontend change these must stay zero in
  `src/`: `data-theme='dark'`, `--space-`, `#0f7173`, `#1ab0b2`, `#f05d5e`,
  `#25c2a0`, `homepage-wrapper`, and any non-`none` `box-shadow` except the green
  music-pulse ring in `animations.css`.
