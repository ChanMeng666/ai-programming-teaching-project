#!/usr/bin/env node
// Generate MindMarket paper-cut storybook illustrations via OpenAI Images API.
//
// Usage:
//   node scripts/generate-illustrations.mjs [--force] [--only <id>] [--env-file <path>]
//
// Reads the OpenAI key from process.env.OPENAI_API_KEY. A --env-file <path>
// fallback parses a dotenv-style file for OPENAI_API_KEY. The key is never
// printed, hardcoded, or written into the repo.
//
// Output: static/img/illustrations/<id>.webp (quality 80) + <id>.png fallback,
// trimmed of transparent borders and resized to each asset's final width.

import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_DIR = join(REPO_ROOT, 'static', 'img', 'illustrations');

const STYLE_PREFIX =
  'Flat paper-cut storybook illustration, matte flat color fills only, no gradients, ' +
  'no shadows, no outlines, no photorealism, no 3D, no text. Palette strictly: ' +
  'fresh grass green #8ed462, sky blue #2ba0ff, coral red #ff705d, sunshine yellow #f5e211, ' +
  'soft purple, warm white, dark ink #2c2e2a for details. Playful human characters with ' +
  'exaggerated proportions, small heads, long limbs, dynamic overlapping poses. Isolated ' +
  'subject on a fully transparent background, editorial, warm, confident.';

/** @type {{id:string, scene:string, size:string, finalWidth:number}[]} */
const ASSETS = [
  {
    id: 'hero',
    scene:
      'three diverse young people joyfully stacking oversized glowing geometric blocks that ' +
      'suggest code and building a website together, one climbing a ladder',
    size: '1536x1024',
    finalWidth: 1200,
  },
  {
    id: 'home-learn',
    scene:
      'one character sitting cross-legged reading a giant open book with sparks and small ' +
      'geometric shapes flying out',
    size: '1024x1024',
    finalWidth: 640,
  },
  {
    id: 'home-build',
    scene:
      'one character assembling large colorful interface blocks like a construction toy, ' +
      'wearing a tool belt',
    size: '1024x1024',
    finalWidth: 640,
  },
  {
    id: 'home-community',
    scene: 'two characters high-fiving mid-air surrounded by floating chat bubbles',
    size: '1024x1024',
    finalWidth: 640,
  },
  {
    id: 'message-board',
    scene: 'one cheerful character pushing an oversized envelope into a giant mailbox',
    size: '1024x1024',
    finalWidth: 560,
  },
  {
    id: 'capstone',
    scene:
      'one proud character standing on a podium holding up a trophy, confetti shapes around',
    size: '1024x1024',
    finalWidth: 560,
  },
  {
    id: 'feeds',
    scene:
      'one character holding a megaphone with stylized radio waves and paper planes flying out',
    size: '1024x1024',
    finalWidth: 480,
  },
  {
    id: 'blog-header',
    scene:
      'one focused character typing at an oversized keyboard with pages flying upward like birds',
    size: '1536x1024',
    finalWidth: 900,
  },
  {
    id: 'not-found',
    scene:
      'one puzzled character with a giant magnifying glass looking at an unfolded confusing map',
    size: '1024x1024',
    finalWidth: 560,
  },
  {
    id: 'footer-accent',
    scene:
      'one small friendly character peeking over an edge and waving, visible from chest up',
    size: '1024x1024',
    finalWidth: 320,
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

async function callImageApi({ model, prompt, size, apiKey, transparent }) {
  const body = {
    model,
    prompt,
    size,
    n: 1,
  };
  if (model === 'gpt-image-1') {
    body.output_format = 'png';
    body.quality = 'high';
    if (transparent) body.background = 'transparent';
  } else {
    // dall-e-3 diagnostic path — no transparency support
    body.response_format = 'b64_json';
    body.quality = 'hd';
  }

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
    // Do not retry on clearly non-transient errors.
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

async function postProcess(pngBuffer, id, finalWidth) {
  const base = sharp(pngBuffer).trim();
  const webpPath = join(OUT_DIR, `${id}.webp`);
  const pngPath = join(OUT_DIR, `${id}.png`);

  await base
    .clone()
    .resize({ width: finalWidth, withoutEnlargement: false })
    .webp({ quality: 80 })
    .toFile(webpPath);

  await base
    .clone()
    .resize({ width: finalWidth, withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);

  const webpMeta = await sharp(webpPath).metadata();
  return {
    webpPath,
    pngPath,
    width: webpMeta.width,
    height: webpMeta.height,
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

  let assets = ASSETS;
  if (args.only) {
    assets = ASSETS.filter((a) => a.id === args.only);
    if (assets.length === 0) {
      console.error(`ERROR: --only "${args.only}" matched no asset id.`);
      console.error(`Known ids: ${ASSETS.map((a) => a.id).join(', ')}`);
      process.exit(1);
    }
  }

  const results = [];
  let dalleFallbackNoted = false;

  for (const asset of assets) {
    const webpPath = join(OUT_DIR, `${asset.id}.webp`);
    const pngPath = join(OUT_DIR, `${asset.id}.png`);
    const exists = existsSync(webpPath) && existsSync(pngPath);

    if (exists && !args.force) {
      const meta = await sharp(webpPath).metadata();
      console.log(`SKIP  ${asset.id} (exists)`);
      results.push({
        id: asset.id,
        status: 'skipped',
        width: meta.width,
        height: meta.height,
        webpBytes: statSync(webpPath).size,
        pngBytes: statSync(pngPath).size,
      });
      continue;
    }

    const prompt = `${STYLE_PREFIX} ${asset.scene}.`;
    console.log(`GEN   ${asset.id} (${asset.size} -> ${asset.finalWidth}px wide)`);

    try {
      const pngBuffer = await withRetry(
        () =>
          callImageApi({
            model: 'gpt-image-1',
            prompt,
            size: asset.size,
            apiKey,
            transparent: true,
          }),
        asset.id
      );
      const info = await postProcess(pngBuffer, asset.id, asset.finalWidth);
      console.log(
        `  OK  ${info.width}x${info.height}  webp ${fmtBytes(info.webpBytes)}  png ${fmtBytes(
          info.pngBytes
        )}`
      );
      results.push({ id: asset.id, status: 'generated', ...info });
    } catch (err) {
      console.error(`  FAIL ${asset.id}: ${err.message}`);

      // If gpt-image-1 is unavailable, run ONE dall-e-3 diagnostic (no transparency)
      // to confirm the key works, but do not mass-generate with it.
      const unavailable =
        /organization must be verified|must be verified|not have access|model_not_found|does not exist/i.test(
          err.message || ''
        );
      if (unavailable && !dalleFallbackNoted) {
        dalleFallbackNoted = true;
        console.error(
          '  NOTE: gpt-image-1 appears unavailable on this key. Running a single dall-e-3 ' +
            'diagnostic (no transparency) to verify the key, NOT mass-generating.'
        );
        try {
          await callImageApi({
            model: 'dall-e-3',
            prompt,
            size: '1024x1024',
            apiKey,
            transparent: false,
          });
          console.error(
            '  DIAGNOSTIC: dall-e-3 succeeded. Key is valid but lacks gpt-image-1 access ' +
              '(likely needs organization verification for gpt-image-1).'
          );
        } catch (dErr) {
          console.error(`  DIAGNOSTIC: dall-e-3 also failed: ${dErr.message}`);
        }
      }
      results.push({ id: asset.id, status: 'failed', error: err.message });
    }
  }

  // ---- summary table ----
  console.log('\n=== Summary ===');
  const rows = results.map((r) => {
    if (r.status === 'failed') {
      return { id: r.id, status: 'FAILED', dims: '-', webp: '-', png: '-' };
    }
    return {
      id: r.id,
      status: r.status,
      dims: `${r.width}x${r.height}`,
      webp: fmtBytes(r.webpBytes),
      png: fmtBytes(r.pngBytes),
    };
  });
  const col = (s, w) => String(s).padEnd(w);
  console.log(col('id', 16) + col('status', 11) + col('dims', 12) + col('webp', 11) + col('png', 11));
  console.log('-'.repeat(61));
  for (const r of rows) {
    console.log(col(r.id, 16) + col(r.status, 11) + col(r.dims, 12) + col(r.webp, 11) + col(r.png, 11));
  }

  const failed = results.filter((r) => r.status === 'failed');
  if (failed.length) {
    console.log(`\n${failed.length} asset(s) failed.`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
