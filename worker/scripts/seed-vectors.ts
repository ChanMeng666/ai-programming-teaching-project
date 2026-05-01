/**
 * Script to seed Vectorize with document embeddings
 *
 * Usage:
 * 1. Deploy the worker first: npm run deploy
 * 2. Set the SEED_TOKEN env var to the value configured via `wrangler secret put SEED_TOKEN`
 * 3. Run this script: npm run seed
 *
 *   PowerShell: $env:SEED_TOKEN="..."; npm run seed
 *   Bash:       SEED_TOKEN=... npm run seed
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local state file. Records the IDs of every chunk written by the most recent
// successful seed. The next seed compares the new ID set to this and deletes
// any IDs that disappeared (i.e. content was edited or removed).
const STATE_FILE = path.resolve(__dirname, '.seeded-ids.json');

interface DocumentChunk {
  id: string;
  title: string;
  content: string;
  source: string;
  namespace: string;
  label: string;
}

interface DocSource {
  path: string;
  namespace: string;
  label: string;
}

const WORKER_URL = 'https://ai-chat-worker.chanmeng-dev.workers.dev';

const DOCS_SOURCES: DocSource[] = [
  { path: '../../docs',                                 namespace: 'docs-current',  label: 'Current docs' },
  { path: '../../versioned_docs/version-2024-winter',   namespace: '2024-winter',   label: '2024 Winter Course' },
  { path: '../../versioned_docs/version-2025-summer',   namespace: '2025-summer',   label: '2025 Summer Course' },
  { path: '../../versioned_docs/version-2026-her-waka', namespace: '2026-her-waka', label: 'HER WAKA 2026' },
  { path: '../../versioned_docs/version-2026-technest', namespace: '2026-technest', label: 'TECHNEST 2026 (default)' },
  { path: '../../blog',                                 namespace: 'blog',          label: 'Blog' },
];

const CHUNK_SIZE = 800; // characters per chunk
const CHUNK_OVERLAP = 150; // overlap between chunks

/**
 * Extract frontmatter and content from MDX file
 */
function parseMdx(content: string): { title: string; body: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let title = '';
  let body = content;

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }
    body = content.slice(frontmatterMatch[0].length).trim();
  }

  // Strip MDX imports, JSX component tags (keeping inner text), code blocks, comments.
  body = body
    .replace(/^\s*import\s+.*?from\s+['"].*?['"];?\s*$/gm, '') // imports + optional trailing ;
    .replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, '')        // Self-closing JSX components: drop entirely
    .replace(/<\/?[A-Z][a-zA-Z0-9]*[^>]*>/g, '')       // Paired JSX tags: keep inner text, drop tags
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')              // MDX comments {/* ... */}
    .replace(/<!--[\s\S]*?-->/g, '')                   // HTML/MDX <!-- ... --> comments (e.g. <!--truncate-->)
    .replace(/```[\s\S]*?```/g, '[code block]')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, body };
}

/**
 * Split content into overlapping chunks
 */
function chunkContent(content: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    let chunk = content.slice(start, end);

    // Try to end at a sentence boundary
    if (end < content.length) {
      const lastPeriod = Math.max(
        chunk.lastIndexOf('。'),
        chunk.lastIndexOf('！'),
        chunk.lastIndexOf('？'),
        chunk.lastIndexOf('.')
      );
      const lastNewline = chunk.lastIndexOf('\n\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
      }
    }

    if (chunk.trim().length > 50) {
      chunks.push(chunk.trim());
    }

    // We've already consumed the rest of the content this iteration; stop.
    if (end >= content.length) {
      break;
    }

    // Advance by chunk size minus overlap. Floor keeps us from infinite-looping
    // if a clipped chunk happens to be shorter than the overlap.
    start += Math.max(chunk.length - overlap, 1);
  }

  return chunks;
}

/**
 * Find all MDX files recursively
 */
function findMdxFiles(dir: string): string[] {
  const files: string[] = [];
  const resolvedDir = path.resolve(__dirname, dir);

  if (!fs.existsSync(resolvedDir)) {
    console.log(`Directory not found: ${resolvedDir}`);
    return files;
  }

  const entries = fs.readdirSync(resolvedDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(resolvedDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Build a human-readable fallback title from a filename like
 * "2026-03-01-her-waka-programme-intro.mdx" -> "her waka programme intro"
 */
function fallbackTitleFromPath(filePath: string): string {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/-/g, ' ');
}

/**
 * Build a content-addressed chunk ID. Stable across seed runs as long as the
 * source path, position, and chunk text are unchanged — so unchanged docs
 * upsert in place rather than accumulating duplicates.
 *
 * Vectorize allows IDs up to 64 chars. We use 40-hex-char SHA-1 prefixed with
 * "c-" to make IDs greppable in logs.
 */
function chunkId(relativePath: string, chunkIndex: number, chunkText: string): string {
  const hash = crypto
    .createHash('sha1')
    .update(`${relativePath}|${chunkIndex}|${chunkText}`)
    .digest('hex');
  return `c-${hash}`;
}

/**
 * Process all documents and generate chunks
 */
function processDocuments(): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const seenIds = new Set<string>();

  for (const source of DOCS_SOURCES) {
    const files = findMdxFiles(source.path);
    console.log(`Found ${files.length} files in ${source.path}`);

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { title, body } = parseMdx(content);
        const relativePath = path.relative(path.resolve(__dirname, '../..'), filePath);

        if (body.length < 50) {
          console.log(`Skipping ${relativePath} (too short)`);
          continue;
        }

        const contentChunks = chunkContent(body, CHUNK_SIZE, CHUNK_OVERLAP);

        for (let i = 0; i < contentChunks.length; i++) {
          const chunkText = contentChunks[i];
          let id = chunkId(relativePath, i, chunkText);
          // Extremely unlikely collision guard; bump suffix if so.
          while (seenIds.has(id)) id = `${id}-dup`;
          seenIds.add(id);

          chunks.push({
            id,
            title: title || fallbackTitleFromPath(filePath),
            content: chunkText,
            source: relativePath,
            namespace: source.namespace,
            label: source.label,
          });
        }

        console.log(`Processed ${relativePath}: ${contentChunks.length} chunks`);
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }
  }

  return chunks;
}

/**
 * Read the IDs we wrote on the previous successful seed, if any.
 */
function readPreviousIds(): string[] {
  if (!fs.existsSync(STATE_FILE)) return [];
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.ids)) return parsed.ids as string[];
    return [];
  } catch (error) {
    console.warn(`Could not read ${STATE_FILE}; treating as empty.`);
    return [];
  }
}

/**
 * Persist the IDs of the successful seed for future diffs.
 */
function writeStateFile(ids: string[]): void {
  const payload = { writtenAt: new Date().toISOString(), count: ids.length, ids };
  fs.writeFileSync(STATE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`Wrote ${ids.length} IDs to ${path.basename(STATE_FILE)}`);
}

/**
 * Tell the worker to delete the given vector IDs. Batched to keep request
 * sizes reasonable.
 */
async function deleteObsoleteIds(ids: string[], seedToken: string): Promise<void> {
  if (ids.length === 0) {
    console.log('\nNo obsolete IDs to delete.');
    return;
  }

  const BATCH = 100;
  console.log(`\nDeleting ${ids.length} obsolete IDs...`);

  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    try {
      const response = await fetch(`${WORKER_URL}/api/seed/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Seed-Token': seedToken,
        },
        body: JSON.stringify({ ids: slice }),
      });
      const result = await response.json();
      console.log(
        `  Delete batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(ids.length / BATCH)}: ${JSON.stringify(result)}`
      );
    } catch (error) {
      console.error(`  Error deleting batch:`, error);
    }
  }
}

/**
 * Send documents to the seed endpoint in batches
 */
async function seedDocuments(chunks: DocumentChunk[], seedToken: string): Promise<void> {
  const BATCH_SIZE = 5; // Process 5 documents at a time to avoid timeouts

  console.log(`\nSeeding ${chunks.length} chunks to ${WORKER_URL}/api/seed...`);

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);

    try {
      const response = await fetch(`${WORKER_URL}/api/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Seed-Token': seedToken,
        },
        body: JSON.stringify({ documents: batch }),
      });

      const result = await response.json();
      console.log(`  Result: ${JSON.stringify(result)}`);

      // Add a small delay between batches
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  Error seeding batch:`, error);
    }
  }

  console.log('\nSeeding complete!');
}

/**
 * Main function
 */
async function main() {
  const seedToken = process.env.SEED_TOKEN;
  if (!seedToken) {
    console.error('Missing SEED_TOKEN env var. Set it with the value you stored via `wrangler secret put SEED_TOKEN`.');
    console.error('  PowerShell: $env:SEED_TOKEN="..."; npm run seed');
    console.error('  Bash:       SEED_TOKEN=... npm run seed');
    process.exit(1);
  }

  console.log('Processing documents...\n');
  const chunks = processDocuments();
  console.log(`\nGenerated ${chunks.length} chunks from documents`);

  if (chunks.length === 0) {
    console.log('No documents to seed.');
    return;
  }

  const previousIds = readPreviousIds();
  const previousSet = new Set(previousIds);
  const newIds = chunks.map((c) => c.id);
  const newIdSet = new Set(newIds);
  const obsoleteIds = previousIds.filter((id) => !newIdSet.has(id));
  // Hash IDs are deterministic over (path, chunk index, content). If the ID is
  // already in the index from a prior seed, the embedding is byte-identical, so
  // we can skip the embed+upsert entirely for those chunks.
  const changedChunks = chunks.filter((c) => !previousSet.has(c.id));

  console.log(
    `Previous seed had ${previousIds.length} IDs; ` +
      `${changedChunks.length} new/changed will be (re-)embedded, ` +
      `${chunks.length - changedChunks.length} unchanged will be skipped, ` +
      `${obsoleteIds.length} obsolete will be deleted.`
  );

  if (changedChunks.length > 0) {
    await seedDocuments(changedChunks, seedToken);
  } else {
    console.log('\nNothing to (re-)embed.');
  }
  await deleteObsoleteIds(obsoleteIds, seedToken);
  writeStateFile(newIds);
}

main().catch(console.error);
