import type { Env, ChatRequest } from './types';
import { processChat } from './chat';
import { generateEmbedding } from './rag';

interface SeedRequest {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    source: string;
  }>;
}

/**
 * Handle CORS preflight requests
 */
function handleOptions(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin') || '*';
  const allowedOrigin = env.CORS_ORIGIN === '*' ? origin : env.CORS_ORIGIN;

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: Response, request: Request, env: Env): Response {
  const origin = request.headers.get('Origin') || '*';
  const allowedOrigin = env.CORS_ORIGIN === '*' ? origin : env.CORS_ORIGIN;

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', allowedOrigin);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Handle chat API request
 */
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { response, sessionId } = await processChat(
      env,
      body.message.trim(),
      body.sessionId
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
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle document seeding for RAG
 */
async function handleSeed(request: Request, env: Env): Promise<Response> {
  if (!env.VECTORIZE) {
    return new Response(
      JSON.stringify({ error: 'Vectorize not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = (await request.json()) as SeedRequest;

    if (!body.documents || !Array.isArray(body.documents)) {
      return new Response(
        JSON.stringify({ error: 'Documents array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
    return new Response(
      JSON.stringify({
        message: `Seeded ${successCount}/${body.documents.length} documents`,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to seed documents' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle health check
 */
function handleHealth(): Response {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    let response: Response;

    // Route handling
    if (pathname === '/api/chat' && request.method === 'POST') {
      response = await handleChat(request, env);
    } else if (pathname === '/api/seed' && request.method === 'POST') {
      response = await handleSeed(request, env);
    } else if (pathname === '/api/health' || pathname === '/') {
      response = handleHealth();
    } else {
      response = new Response(
        JSON.stringify({ error: 'Not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Add CORS headers
    return addCorsHeaders(response, request, env);
  },
};
