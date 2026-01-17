/**
 * Script to seed Vectorize with document embeddings
 *
 * Usage:
 * 1. First create the Vectorize index:
 *    npx wrangler vectorize create docs-index --dimensions=768 --metric=cosine
 *
 * 2. Update wrangler.toml with the Vectorize binding
 *
 * 3. Run this script:
 *    npm run seed
 *
 * Note: This script requires the Cloudflare API and cannot be run directly.
 * It's provided as a reference for the seeding process.
 */

import * as fs from 'fs';
import * as path from 'path';

interface DocumentChunk {
  id: string;
  title: string;
  content: string;
  source: string;
}

const DOCS_PATHS = [
  '../docs',
  '../versioned_docs/version-2024-winter',
  '../versioned_docs/version-2025-summer',
];

const CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 100; // overlap between chunks

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
      const lastPeriod = chunk.lastIndexOf('。');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
      }
    }

    chunks.push(chunk.trim());
    start += chunk.length - overlap;

    // Prevent infinite loop
    if (start <= chunks.length * (chunkSize - overlap) - (chunkSize - overlap)) {
      start = chunks.length * (chunkSize - overlap);
    }
  }

  return chunks.filter((c) => c.length > 50);
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
        const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);

        const contentChunks = chunkContent(body, CHUNK_SIZE, CHUNK_OVERLAP);

        for (const chunkContent of contentChunks) {
          chunks.push({
            id: `doc-${chunkId++}`,
            title: title || path.basename(filePath, path.extname(filePath)),
            content: chunkContent,
            source: relativePath,
          });
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }
  }

  return chunks;
}

/**
 * Main function to run the seeding process
 */
async function main() {
  console.log('Processing documents...');
  const chunks = processDocuments();
  console.log(`Generated ${chunks.length} chunks from documents`);

  // Output chunks for manual insertion or API call
  console.log('\nTo seed these documents, you need to:');
  console.log('1. Deploy the worker first: npm run deploy');
  console.log('2. Create a seed endpoint or use the Wrangler API');
  console.log('\nChunk sample:');
  console.log(JSON.stringify(chunks.slice(0, 2), null, 2));

  // Save chunks to a JSON file for later use
  const outputPath = path.resolve(__dirname, '../chunks.json');
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
  console.log(`\nChunks saved to: ${outputPath}`);
}

main().catch(console.error);
