#!/usr/bin/env node
/**
 * render-scene.mjs — write a code-drawn scene to SVG (and PNG beside the original, for review).
 *   node scripts/illustrations/render-scene.mjs hero [outDir]
 * Needs resvg on PATH for the PNG.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [id, outDir = join(ROOT, 'build', 'scenes')] = process.argv.slice(2);
const scene = (await import(pathToFileURL(join(ROOT, 'src/components/PaperCut/scenes', `${id}.mjs`)).href)).default;
mkdirSync(outDir, { recursive: true });
const svgPath = join(outDir, `${id}.svg`);
writeFileSync(svgPath, scene());
const w = +scene().match(/viewBox="0 0 (\d+)/)[1];
execFileSync('resvg', ['--width', String(w), '--background', '#f5f1e4', svgPath, join(outDir, `${id}.png`)]);
console.log(svgPath);
