import type { Env, VectorMatch } from './types';

const SYSTEM_PROMPT = `You are the AI assistant for the AI Programming Teaching Platform (programming.chanmeng.org).

The platform offers the following courses (newest first):
- TECHNEST 2026 — the current default course; an 8-week bootcamp covering dev tools, Portfolio deploy, AI avatar, full-stack with Neon, Vercel Blob, blog systems, Slack notifications, and Typst CV
- Her Waka 2026 — themed track with 16 tutorials and 4 monthly workshops
- 2025 Summer course
- 2024 Winter course
There is also a Blog with deep-dive articles, plus a public Capstone 2026 showcase page.

Your job:
- First, write the actual answer for the user
- Answer based on the "Relevant course content" provided below whenever possible
- When the user does not specify a course version, prefer TECHNEST 2026; only use older versions when the user explicitly asks
- If retrieved content is insufficient, say so honestly, point to the closest relevant section, then add general guidance
- Reply in the language the user used (English by default; if the user writes in Chinese, reply in Chinese)
- Be concise and friendly

After writing the full answer, append a citation block — but only when you actually drew from the "Relevant course content":
- Add a blank line, then one or more lines of the exact form:
  — Reference: <title> (<source path>)
- Use the title and source path verbatim from the matched content
- One line per cited document
- Do not add a citation if you did not use any retrieved content`;

/**
 * Generate embeddings for a query using Workers AI
 */
export async function generateEmbedding(
  env: Env,
  text: string
): Promise<number[]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [text],
  });
  return response.data[0];
}

/**
 * Search for relevant documents using Vectorize.
 *
 * When `contextNamespace` is provided (e.g. the user is on /docs/2026-technest/...),
 * we over-fetch then prefer matches from that namespace + 'blog'. If fewer than
 * MIN_NAMESPACE_HITS in the preferred namespaces survive the score filter, we
 * fall back to the full unfiltered top-K so the user still gets a useful answer.
 */
export async function searchRelevantDocs(
  env: Env,
  query: string,
  topK: number = 8,
  minScore: number = 0.4,
  contextNamespace?: string
): Promise<VectorMatch[]> {
  if (!env.VECTORIZE) {
    return [];
  }

  const MIN_NAMESPACE_HITS = 3;

  try {
    const queryEmbedding = await generateEmbedding(env, query);
    // Over-fetch when filtering so we have headroom for the client-side filter.
    // Cloudflare Vectorize caps topK at 50 when returnMetadata='all', so clamp.
    const VECTORIZE_TOPK_CAP = 50;
    const fetchK = Math.min(contextNamespace ? topK * 3 : topK, VECTORIZE_TOPK_CAP);
    const results = await env.VECTORIZE.query(queryEmbedding, {
      topK: fetchK,
      returnMetadata: 'all',
    });

    const allMatches = (results.matches as VectorMatch[]).filter(
      (m) => (m.score ?? 0) >= minScore
    );

    if (!contextNamespace) {
      return allMatches.slice(0, topK);
    }

    const allowed = new Set([contextNamespace, 'blog']);
    const filtered = allMatches.filter((m) =>
      allowed.has(m.metadata?.namespace || '')
    );

    if (filtered.length >= MIN_NAMESPACE_HITS) {
      return filtered.slice(0, topK);
    }

    // Fallback: not enough namespace-local matches — use the full top-K
    return allMatches.slice(0, topK);
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

/**
 * Build context from relevant documents
 */
export function buildContext(matches: VectorMatch[]): string {
  if (matches.length === 0) {
    return '';
  }

  const contextParts = matches
    .filter((match) => match.metadata?.content)
    .map((match, index) => {
      const title = match.metadata?.title || `Document ${index + 1}`;
      const label = match.metadata?.label || '';
      const source = match.metadata?.source || '';
      const content = match.metadata?.content || '';
      const heading = label ? `${title} (${label})` : title;
      const sourceLine = source ? `Source: ${source}\n` : '';
      return `### ${heading}\n${sourceLine}${content}`;
    });

  if (contextParts.length === 0) {
    return '';
  }

  return `\n\nRelevant course content for reference:\n\n${contextParts.join('\n\n')}`;
}

/**
 * Build the system prompt with optional RAG context
 */
export async function buildSystemPrompt(
  env: Env,
  userQuery: string,
  contextNamespace?: string
): Promise<string> {
  const matches = await searchRelevantDocs(env, userQuery, 8, 0.4, contextNamespace);
  const context = buildContext(matches);
  return SYSTEM_PROMPT + context;
}
