#!/usr/bin/env node
// Generate the decorative paper-cut base plates for TECHNEST capstone
// certificates via the OpenAI Images API (gpt-image-2).
//
// Usage:
//   node scripts/generate-certificate-plates.mjs [--force] [--only <id>] [--env-file <path>]
//
// The plate is ORNAMENT ONLY — an empty cream centre panel inside a paper-cut
// border. Every piece of exact information (student name, project, credential
// ID, logo, QR) is composited on top as DOM by scripts/render-certificates.mjs.
// No image model reliably spells a specific person's name or reproduces a
// specific logo, so nothing that must be correct is ever left to the model.
//
// Note: gpt-image-2 does NOT support transparent backgrounds, so unlike
// generate-illustrations.mjs there is no `background` parameter — the plate is
// opaque cream and the content layers over it.
//
// Reads the OpenAI key from process.env.OPENAI_API_KEY, or --env-file <path>.
// The key is never printed, hardcoded, or written into the repo.
//
// Output: static/img/certificates/plates/<id>.webp (+ .png fallback).

import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_DIR = join(REPO_ROOT, 'static', 'img', 'certificates', 'plates');

// 3168x2240: both edges are multiples of 16, the ratio is 1.4143 (≈ √2, so it
// prints on A4 landscape at ~271 dpi), and 7.10 Mpx sits inside gpt-image-2's
// 8,294,400 pixel ceiling. Matches the 1584x1120 CSS template at 2x.
const PLATE_SIZE = '3168x2240';

const STYLE_PREFIX =
  'Flat paper-cut storybook illustration, matte flat color fills only, no gradients, ' +
  'no shadows, no outlines, no photorealism, no 3D. Palette strictly: ' +
  'fresh grass green #8ed462, sky blue #2ba0ff, coral red #ff705d, sunshine yellow #f5e211, ' +
  'warm white, dark ink #2c2e2a for details, on a warm cream #f5f1e4 paper background. ' +
  'Editorial, warm, confident, precise.';

// Repeated hard because image models love to fill an empty panel with
// decorative lettering. If a plate still comes back with text, regenerate with
// --force; if it keeps happening, the HTML template's CSS ornament fallback
// (body[data-plate="off"]) ships instead.
const EMPTY_CENTRE =
  'CRITICAL: the entire middle 70 percent of the image must be a completely ' +
  'empty, flat, unbroken cream #f5f1e4 panel with absolutely nothing drawn in it. ' +
  'The artwork exists only in the outer margin as a border. ' +
  'There must be NO text, NO letters, NO numbers, NO words, NO calligraphy, ' +
  'NO signatures, NO seals, NO ribbons, NO logos and NO symbols anywhere in the image.';

/** @type {{id:string, scene:string}[]} */
const PLATES = [
  {
    id: 'plate-podium',
    scene:
      'An ornamental certificate border framing an empty cream centre. The border is built ' +
      'from flat paper-cut laurel leaves in fresh grass green sweeping along the left and ' +
      'right edges, with small scattered confetti shapes — circles, rounded squares and thin ' +
      'triangles in sky blue, coral red and sunshine yellow — drifting across the top and ' +
      'bottom margins. Denser and more celebratory at the four corners, sparse along the middle ' +
      'of each edge',
  },
  {
    id: 'plate-excellence',
    scene:
      'An ornamental certificate border framing an empty cream centre. The border is a quiet, ' +
      'restrained arrangement of flat paper-cut leaves and simple geometric shapes in warm ' +
      'sandstone beige and dark ink, with only a few small accents of fresh grass green and ' +
      'sky blue at the corners. Calmer and more minimal than a celebratory border, thin and ' +
      'even along all four edges',
  },
];

// ---- CLI args -------------------------------------------------------------

function parseArgs(argv) {
  const args = { force: false, only: null, envFile: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') args.force = true;
    else if (a === '--only') args.only = argv[++i];
    else if (a === '--env-file') args.envFile = argv[++i];
    else if (a.startsWith('--only=')) args.only = a.slice('--only='.length);
    else if (a.startsWith('--env-file=')) args.envFile = a.slice('--env-file='.length);
  }
  return args;
}

// ---- env file parsing -----------------------------------------------------

function loadEnvFile(path) {
  if (!existsSync(path)) {
    throw new Error(`--env-file not found: ${path}`);
  }
  const text = readFileSync(path, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

// ---- OpenAI image call ----------------------------------------------------

const API_URL = 'https://api.openai.com/v1/images/generations';

async function callImageApi({ prompt, size, apiKey }) {
  const body = {
    model: 'gpt-image-2',
    prompt,
    size,
    n: 1,
    output_format: 'png',
    quality: 'high',
    // No `background` key: gpt-image-2 has no transparent-background support.
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }

  if (!res.ok) {
    const err = json?.error || {};
    const code = err.code || err.type || res.status;
    const msg = err.message || text.slice(0, 300);
    const e = new Error(`OpenAI API error [${code}]: ${msg}`);
    e.status = res.status;
    e.apiCode = code;
    throw e;
  }

  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error('No b64_json in API response');
  return Buffer.from(b64, 'base64');
}

async function withRetry(fn, label) {
  try {
    return await fn();
  } catch (err) {
    const nonTransient =
      err.status === 400 ||
      err.status === 401 ||
      err.status === 403 ||
      /organization must be verified|not have access|billing|quota|content_policy/i.test(
        err.message || ''
      );
    if (nonTransient) throw err;
    console.warn(`  retry after transient failure (${label}): ${err.message}`);
    await new Promise((r) => setTimeout(r, 2000));
    return await fn();
  }
}

// ---- post-processing ------------------------------------------------------

async function postProcess(pngBuffer, id) {
  const webpPath = join(OUT_DIR, `${id}.webp`);
  const pngPath = join(OUT_DIR, `${id}.png`);

  // No .trim() here (unlike the illustrations): the plate is a full-bleed
  // opaque background and its edges are load-bearing.
  const base = sharp(pngBuffer);

  await base.clone().webp({ quality: 82, effort: 6 }).toFile(webpPath);
  await base.clone().png({ compressionLevel: 9 }).toFile(pngPath);

  const meta = await sharp(webpPath).metadata();
  return {
    webpPath,
    pngPath,
    width: meta.width,
    height: meta.height,
    webpBytes: statSync(webpPath).size,
    pngBytes: statSync(pngPath).size,
  };
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

// ---- main -----------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.envFile) loadEnvFile(args.envFile);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      'ERROR: OPENAI_API_KEY not set. Provide it via the environment or --env-file <path>.'
    );
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  let plates = PLATES;
  if (args.only) {
    plates = PLATES.filter((p) => p.id === args.only);
    if (plates.length === 0) {
      console.error(`ERROR: --only "${args.only}" matched no plate id.`);
      console.error(`Known ids: ${PLATES.map((p) => p.id).join(', ')}`);
      process.exit(1);
    }
  }

  const results = [];

  for (const plate of plates) {
    const webpPath = join(OUT_DIR, `${plate.id}.webp`);
    const pngPath = join(OUT_DIR, `${plate.id}.png`);
    const exists = existsSync(webpPath) && existsSync(pngPath);

    if (exists && !args.force) {
      const meta = await sharp(webpPath).metadata();
      console.log(`SKIP  ${plate.id} (exists)`);
      results.push({
        id: plate.id,
        status: 'skipped',
        width: meta.width,
        height: meta.height,
        webpBytes: statSync(webpPath).size,
        pngBytes: statSync(pngPath).size,
      });
      continue;
    }

    const prompt = `${STYLE_PREFIX} ${plate.scene}. ${EMPTY_CENTRE}`;
    console.log(`GEN   ${plate.id} (${PLATE_SIZE})`);

    try {
      const pngBuffer = await withRetry(
        () => callImageApi({ prompt, size: PLATE_SIZE, apiKey }),
        plate.id
      );
      const info = await postProcess(pngBuffer, plate.id);
      console.log(
        `  OK  ${info.width}x${info.height}  webp ${fmtBytes(info.webpBytes)}  png ${fmtBytes(
          info.pngBytes
        )}`
      );
      results.push({ id: plate.id, status: 'generated', ...info });
    } catch (err) {
      console.error(`  FAIL ${plate.id}: ${err.message}`);
      results.push({ id: plate.id, status: 'failed', error: err.message });
    }
  }

  // ---- summary table ----
  console.log('\n=== Summary ===');
  const col = (s, w) => String(s).padEnd(w);
  console.log(col('id', 20) + col('status', 11) + col('dims', 13) + col('webp', 11) + col('png', 11));
  console.log('-'.repeat(66));
  for (const r of results) {
    const dims = r.status === 'failed' ? '-' : `${r.width}x${r.height}`;
    const webp = r.status === 'failed' ? '-' : fmtBytes(r.webpBytes);
    const png = r.status === 'failed' ? '-' : fmtBytes(r.pngBytes);
    console.log(
      col(r.id, 20) + col(r.status === 'failed' ? 'FAILED' : r.status, 11) + col(dims, 13) +
      col(webp, 11) + col(png, 11)
    );
  }

  console.log(
    '\nNext: inspect both plates and confirm the centre panel is genuinely empty and\n' +
    'free of any lettering, then run `npm run certificates:render`.'
  );

  const failed = results.filter((r) => r.status === 'failed');
  if (failed.length) {
    console.log(`\n${failed.length} plate(s) failed.`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
