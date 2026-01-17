/**
 * Script to seed Vectorize with document embeddings
 *
 * Usage:
 * 1. Deploy the worker first: npm run deploy
 * 2. Run this script: npm run seed
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DocumentChunk {
  id: string;
  title: string;
  content: string;
  source: string;
}

const WORKER_URL = 'https://ai-chat-worker.chanmeng-dev.workers.dev';

const DOCS_PATHS = [
  '../../docs',
  '../../versioned_docs/version-2024-winter',
  '../../versioned_docs/version-2025-summer',
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

  // Remove MDX imports and components
  body = body
    .replace(/import\s+.*?from\s+['"].*?['"]/g, '')
    .replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '')
    .replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '')
    .replace(/```[\s\S]*?```/g, '[代码块]')
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
 * Process all documents and generate chunks
 */
function processDocuments(): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkId = 0;

  for (const docsPath of DOCS_PATHS) {
    const files = findMdxFiles(docsPath);
    console.log(`Found ${files.length} files in ${docsPath}`);

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

        for (const chunkContent of contentChunks) {
          chunks.push({
            id: `doc-${chunkId++}`,
            title: title || path.basename(filePath, path.extname(filePath)),
            content: chunkContent,
            source: relativePath,
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
 * Send documents to the seed endpoint in batches
 */
async function seedDocuments(chunks: DocumentChunk[]): Promise<void> {
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
  console.log('Processing documents...\n');
  const chunks = processDocuments();
  console.log(`\nGenerated ${chunks.length} chunks from documents`);

  if (chunks.length === 0) {
    console.log('No documents to seed.');
    return;
  }

  await seedDocuments(chunks);
}

main().catch(console.error);
