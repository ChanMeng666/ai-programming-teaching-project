#!/usr/bin/env node
// Render one certificate PNG + one og:image card per TECHNEST 2026 capstone award.
//
// Usage:
//   node scripts/render-certificates.mjs [--force] [--only <slug>]
//
// Everything that must be exactly right — student names, project titles,
// credential IDs, the brand logo, the verification QR — is real DOM here, not
// pixels from an image model. The generated plate from
// scripts/generate-certificate-plates.mjs is only the decorative border behind
// it, and the render works without it (the template falls back to a CSS
// paper-cut ornament, body[data-plate="off"]).
//
// Output, per award, into static/img/certificates/:
//   <slug>.png         3168x2240  print/download master (~271 dpi on A4 landscape)
//   <slug>.webp        1584 wide  what the verification page displays
//   <slug>-social.png  1200x630   og:image for LinkedIn / X link previews
//
// Playwright is NOT a package.json dependency on purpose: `npm i playwright`
// pulls ~150 MB of browsers that Cloudflare Pages would re-download on every
// production build, and the rendered PNGs are committed so nobody but the
// operator ever runs this. Install it globally: `npm i -g playwright`.
//
// Zero-dependency fallback if Playwright is unavailable:
//   chrome --headless --screenshot=out.png --window-size=1584,1120 \
//          --force-device-scale-factor=2 --virtual-time-budget=5000 \
//          file:///.../scripts/certificate-template.html

import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// Read the frozen awards straight from JSON — the exact same file the site
// imports via src/data/awards.js. A certificate PNG that disagreed with its own
// verification page would be worse than no certificate at all.
const DATA = JSON.parse(readFileSync(join(REPO_ROOT, 'src', 'data', 'awards.json'), 'utf8'));
const AWARDS = DATA.awards;
const TIERS = DATA.tiers;
const COHORT = DATA.cohort;
const INSTRUCTOR = DATA.instructor;
const INSTRUCTOR_TITLE = DATA.instructorTitle;
const ISSUED_ON_LABEL = DATA.issuedOnLabel;
const SITE_URL = DATA.siteUrl;
const certificatePath = (award) => `/certificate/${award.slug}`;

const OUT_DIR = join(REPO_ROOT, 'static', 'img', 'certificates');
const PLATE_DIR = join(OUT_DIR, 'plates');
const CERT_HTML = join(__dirname, 'certificate-template.html');
const SOCIAL_HTML = join(__dirname, 'certificate-social.html');

const CERT_W = 1584;
const CERT_H = 1120;
const SOCIAL_W = 1200;
const SOCIAL_H = 630;

// ---- module loading -------------------------------------------------------

let globalRoot = null;
function npmGlobalRoot() {
  if (globalRoot === null) {
    try {
      globalRoot = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      globalRoot = '';
    }
  }
  return globalRoot;
}

/**
 * Flatten CommonJS/ESM interop. Both playwright and qrcode are CommonJS, and
 * when imported by absolute file URL (the global-install path below) Node
 * cannot always statically detect their named exports — everything lands on
 * `.default` instead. Merging the two shapes makes the call sites identical
 * whichever way the module resolved.
 */
function interop(mod) {
  const d = mod && mod.default;
  return d && typeof d === 'object' ? { ...d, ...mod } : mod;
}

/**
 * Import a module from the local tree, falling back to the global npm root.
 * Lets this script use a globally installed Playwright without adding it (and
 * its browser downloads) to package.json.
 */
async function loadModule(name, installHint) {
  try {
    return interop(await import(name));
  } catch (localErr) {
    const root = npmGlobalRoot();
    if (root) {
      try {
        const req = createRequire(import.meta.url);
        const entry = req.resolve(name, { paths: [root] });
        return interop(await import(pathToFileURL(entry).href));
      } catch {
        /* fall through to the error below */
      }
    }
    throw new Error(
      `Cannot load "${name}". ${installHint}\n  (original error: ${localErr.message})`
    );
  }
}

// ---- CLI args -------------------------------------------------------------

function parseArgs(argv) {
  const args = { force: false, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') args.force = true;
    else if (a === '--only') args.only = argv[++i];
    else if (a.startsWith('--only=')) args.only = a.slice('--only='.length);
  }
  return args;
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** Plate for a tier, or null when it has not been generated yet. */
function plateFor(tier) {
  const id = tier === 'excellence' ? 'plate-excellence' : 'plate-podium';
  for (const ext of ['webp', 'png']) {
    const p = join(PLATE_DIR, `${id}.${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

/** Wait for webfonts and every image/background referenced by the page. */
async function settle(page, extraUrls = []) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    (urls) =>
      Promise.all([
        // <img> elements
        ...Array.from(document.images).map((img) =>
          img.complete
            ? null
            : new Promise((r) => {
                img.onload = r;
                img.onerror = r;
              })
        ),
        // CSS background-images have no load event, so preload them by hand
        ...urls.map(
          (u) =>
            new Promise((r) => {
              const i = new Image();
              i.onload = r;
              i.onerror = r;
              i.src = u;
            })
        ),
      ]),
    extraUrls
  );
}

// ---- main -----------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let awards = AWARDS;
  if (args.only) {
    awards = AWARDS.filter((a) => a.slug === args.only);
    if (awards.length === 0) {
      console.error(`ERROR: --only "${args.only}" matched no award slug.`);
      console.error(`Known slugs: ${AWARDS.map((a) => a.slug).join(', ')}`);
      process.exit(1);
    }
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const QRCode = await loadModule(
    'qrcode',
    'Install it with `npm install` (it is a devDependency) or `npm i -g qrcode`.'
  );
  const { chromium } = await loadModule(
    'playwright',
    'Install it globally with `npm i -g playwright`. It is deliberately not a ' +
      'package.json dependency — see the header of this file.'
  );

  if (!plateFor('first')) {
    console.log(
      'NOTE: no generated plate found in static/img/certificates/plates/.\n' +
        '      Rendering with the CSS paper-cut ornament fallback. Run\n' +
        '      `npm run certificates:plates -- --env-file <path>` first for the\n' +
        '      illustrated border.\n'
    );
  }

  // channel:'chrome' reuses the installed Chrome so a global Playwright without
  // downloaded browsers still works. Fall back to bundled Chromium if absent.
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch (err) {
    console.log(
      `NOTE: Chrome channel unavailable (${err.message.split('\n')[0]}),\n` +
        '      falling back to bundled Chromium.'
    );
    browser = await chromium.launch();
  }

  const certCtx = await browser.newContext({
    viewport: { width: CERT_W, height: CERT_H },
    deviceScaleFactor: 2, // 1584x1120 CSS -> 3168x2240 device pixels
  });
  const socialCtx = await browser.newContext({
    viewport: { width: SOCIAL_W, height: SOCIAL_H },
    deviceScaleFactor: 1,
  });

  const results = [];

  for (const award of awards) {
    const certPng = join(OUT_DIR, `${award.slug}.png`);
    const certWebp = join(OUT_DIR, `${award.slug}.webp`);
    const socialPng = join(OUT_DIR, `${award.slug}-social.png`);

    if (!args.force && existsSync(certPng) && existsSync(certWebp) && existsSync(socialPng)) {
      console.log(`SKIP  ${award.slug} (exists)`);
      results.push({
        slug: award.slug,
        status: 'skipped',
        certBytes: statSync(certPng).size,
        webpBytes: statSync(certWebp).size,
        socialBytes: statSync(socialPng).size,
      });
      continue;
    }

    const tier = TIERS[award.tier];
    const verifyUrl = `${SITE_URL}${certificatePath(award)}`;
    const platePath = plateFor(award.tier);
    const plateUrl = platePath ? pathToFileURL(platePath).href : null;

    const qrSvg = await QRCode.toString(verifyUrl, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#2c2e2a', light: '#0000' },
    });

    const data = {
      cohort: COHORT,
      tierLabel: tier.label,
      accent: tier.accent,
      team: award.team,
      title: award.title,
      citation: award.citation,
      certId: award.certId,
      instructor: INSTRUCTOR,
      instructorTitle: INSTRUCTOR_TITLE,
      issuedOn: ISSUED_ON_LABEL,
      // Shown on the certificate without the scheme — the QR carries the real URL.
      verifyUrl: verifyUrl.replace(/^https:\/\//, ''),
      qrSvg,
      plateUrl,
    };

    console.log(`GEN   ${award.slug}  (${tier.label}${plateUrl ? '' : ', CSS ornament'})`);

    // ---- certificate ----
    const page = await certCtx.newPage();
    await page.addInitScript((d) => {
      window.__AWARD__ = d;
    }, data);
    await page.goto(pathToFileURL(CERT_HTML).href, { waitUntil: 'load' });
    await settle(page, plateUrl ? [plateUrl] : []);
    await page.screenshot({ path: certPng, type: 'png' });
    await page.close();

    await sharp(certPng)
      .resize({ width: CERT_W, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(certWebp);

    // ---- social card (embeds the certificate just rendered) ----
    const sPage = await socialCtx.newPage();
    await sPage.addInitScript((d) => {
      window.__AWARD__ = d;
    }, { ...data, certImageUrl: pathToFileURL(certPng).href });
    await sPage.goto(pathToFileURL(SOCIAL_HTML).href, { waitUntil: 'load' });
    await settle(sPage);
    await sPage.screenshot({ path: socialPng, type: 'png' });
    await sPage.close();

    const info = {
      slug: award.slug,
      status: 'rendered',
      certBytes: statSync(certPng).size,
      webpBytes: statSync(certWebp).size,
      socialBytes: statSync(socialPng).size,
    };
    console.log(
      `  OK  png ${fmtBytes(info.certBytes)}  webp ${fmtBytes(info.webpBytes)}  social ${fmtBytes(
        info.socialBytes
      )}`
    );
    results.push(info);
  }

  await browser.close();

  console.log('\n=== Summary ===');
  const col = (s, w) => String(s).padEnd(w);
  console.log(col('slug', 22) + col('status', 11) + col('png', 12) + col('webp', 12) + col('social', 12));
  console.log('-'.repeat(69));
  for (const r of results) {
    console.log(
      col(r.slug, 22) + col(r.status, 11) + col(fmtBytes(r.certBytes), 12) +
      col(fmtBytes(r.webpBytes), 12) + col(fmtBytes(r.socialBytes), 12)
    );
  }
  console.log(
    '\nNext: open each PNG and check the name spelling, tier, credential ID and QR\n' +
    'before publishing — these go on real people\'s professional profiles.'
  );
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
