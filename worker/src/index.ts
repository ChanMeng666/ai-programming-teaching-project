import type { Env, ChatRequest } from './types';
import { processChat } from './chat';
import { generateEmbedding } from './rag';
import { handleGetMessages, handlePostMessage, handleSetupDatabase } from './messages';
import { handleListCapstones, handleVote, handleSetupCapstoneDB, handleCreateCapstone } from './capstones';
import { cacheKey, readCounter, writeCounter } from './cache';
import { jsonResponse, clientIp } from './http';
import docsVersions from '../../versions.json';

interface SeedRequest {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    source: string;
    namespace?: string;
    label?: string;
  }>;
}

interface SeedDeleteRequest {
  ids: string[];
}

// One retrieval namespace per docs version (the site's versions.json), plus the
// blog. scripts/seed-vectors.ts writes the same names.
const ALLOWED_NAMESPACES = new Set(['blog', ...docsVersions]);

const CHAT_RATE_LIMIT_MAX = 30;
const CHAT_RATE_LIMIT_WINDOW = 3600;

// Every Pages production build also publishes an immutable <hash>.<project>.pages.dev
// URL, so preview origins can only be matched by suffix, never by an exact list.
const PAGES_PREVIEW_SUFFIX = '.ai-programming-teaching-project.pages.dev';

/**
 * Resolve the Access-Control-Allow-Origin value for a request,
 * or null when the origin is not allowed to read the response.
 */
function resolveAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');

  if (env.CORS_ORIGIN === '*') {
    return origin || '*';
  }
  if (!origin) {
    return null;
  }
  const allowList = env.CORS_ORIGIN.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (allowList.includes(origin)) {
    return origin;
  }
  if (origin.startsWith('https://') && origin.endsWith(PAGES_PREVIEW_SUFFIX)) {
    return origin;
  }
  return null;
}

/**
 * Handle CORS preflight requests
 */
function handleOptions(request: Request, env: Env): Response {
  const allowedOrigin = resolveAllowedOrigin(request, env);

  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });
  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin', allowedOrigin);
  }

  return new Response(null, { status: 204, headers });
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: Response, request: Request, env: Env): Response {
  const allowedOrigin = resolveAllowedOrigin(request, env);

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  // Not a CORS-safelisted header: without this the browser hides it from the
  // chat widget, which then starts a fresh session on every turn.
  newHeaders.set('Access-Control-Expose-Headers', 'X-Session-Id');
  newHeaders.append('Vary', 'Origin');
  if (allowedOrigin) {
    newHeaders.set('Access-Control-Allow-Origin', allowedOrigin);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Handle chat API request
 */
async function handleChat(
  request: Request,
  env: Env,
  ctx: ExecutionContext | null = null
): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message || typeof body.message !== 'string') {
      return jsonResponse({ error: 'Message is required' }, 400);
    }

    // Validate the optional contextNamespace from the client against an allow-list
    const contextNamespace =
      body.contextNamespace && ALLOWED_NAMESPACES.has(body.contextNamespace)
        ? body.contextNamespace
        : undefined;

    const ip = clientIp(request);
    // Throttling counter lives in the edge cache, not KV — see src/cache.ts.
    const rateKey = cacheKey(request, `chat/rate/${encodeURIComponent(ip)}`);
    const currentCount = await readCounter(rateKey);

    if (currentCount >= CHAT_RATE_LIMIT_MAX) {
      return jsonResponse(
        { error: `Too many requests. Limit is ${CHAT_RATE_LIMIT_MAX} messages per hour.` },
        429
      );
    }

    // Charge the quota before invoking the model: a request that times out or
    // throws still consumed Workers AI, so it must still count against the cap.
    await writeCounter(rateKey, currentCount + 1, CHAT_RATE_LIMIT_WINDOW);

    const { response, sessionId } = await processChat(
      env,
      body.message.trim(),
      body.sessionId,
      contextNamespace
    );

    // Return streaming response
    return new Response(response, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Session-Id': sessionId,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * Handle document seeding for RAG
 */
async function handleSeed(request: Request, env: Env): Promise<Response> {
  if (!env.SEED_TOKEN || request.headers.get('X-Seed-Token') !== env.SEED_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!env.VECTORIZE) {
    return jsonResponse({ error: 'Vectorize not configured' }, 500);
  }

  try {
    const body = (await request.json()) as SeedRequest;

    if (!body.documents || !Array.isArray(body.documents)) {
      return jsonResponse({ error: 'Documents array is required' }, 400);
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const doc of body.documents) {
      try {
        // Generate embedding for the document content
        const embedding = await generateEmbedding(env, doc.content);

        // Insert into Vectorize
        await env.VECTORIZE.upsert([
          {
            id: doc.id,
            values: embedding,
            metadata: {
              title: doc.title,
              content: doc.content.substring(0, 1000), // Limit metadata size
              source: doc.source,
              ...(doc.namespace ? { namespace: doc.namespace } : {}),
              ...(doc.label ? { label: doc.label } : {}),
            },
          },
        ]);

        results.push({ id: doc.id, success: true });
      } catch (error) {
        results.push({
          id: doc.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return jsonResponse({
      message: `Seeded ${successCount}/${body.documents.length} documents`,
      results,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return jsonResponse({ error: 'Failed to seed documents' }, 500);
  }
}

/**
 * Delete a list of vectors from Vectorize. Used by the seed script for
 * diff-based cleanup of obsolete chunks. Token-gated.
 */
async function handleSeedDelete(request: Request, env: Env): Promise<Response> {
  if (!env.SEED_TOKEN || request.headers.get('X-Seed-Token') !== env.SEED_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!env.VECTORIZE) {
    return jsonResponse({ error: 'Vectorize not configured' }, 500);
  }

  try {
    const body = (await request.json()) as SeedDeleteRequest;
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return jsonResponse({ deleted: 0 });
    }

    await env.VECTORIZE.deleteByIds(body.ids);

    return jsonResponse({ deleted: body.ids.length });
  } catch (error) {
    console.error('Seed delete error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
}

/**
 * Handle health check
 */
function handleHealth(): Response {
  return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    let response: Response;

    // Route handling
    if (pathname === '/api/chat' && request.method === 'POST') {
      response = await handleChat(request, env, ctx);
    } else if (pathname === '/api/seed' && request.method === 'POST') {
      response = await handleSeed(request, env);
    } else if (pathname === '/api/seed/delete' && request.method === 'POST') {
      response = await handleSeedDelete(request, env);
    } else if (pathname === '/api/messages' && request.method === 'GET') {
      response = await handleGetMessages(request, env, ctx);
    } else if (pathname === '/api/messages' && request.method === 'POST') {
      response = await handlePostMessage(request, env, ctx);
    } else if (pathname === '/api/messages/setup' && request.method === 'POST') {
      response = await handleSetupDatabase(request, env);
    } else if (pathname === '/api/capstones' && request.method === 'GET') {
      response = await handleListCapstones(request, env, ctx);
    } else if (pathname === '/api/capstones/vote' && request.method === 'POST') {
      response = await handleVote(request, env, ctx);
    } else if (pathname === '/api/capstones/setup' && request.method === 'POST') {
      response = await handleSetupCapstoneDB(request, env);
    } else if (pathname === '/api/capstones/admin' && request.method === 'POST') {
      response = await handleCreateCapstone(request, env);
    } else if (pathname === '/api/health' || pathname === '/') {
      response = handleHealth();
    } else {
      response = jsonResponse({ error: 'Not found' }, 404);
    }

    // Add CORS headers
    return addCorsHeaders(response, request, env);
  },
};
