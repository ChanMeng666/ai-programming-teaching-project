import type { Env } from './types';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const CACHE_TTL = 300; // 5 minutes
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 3600; // 1 hour

const CATEGORIES = ['心得体会', '经验分享', '教程讨论', '其他'] as const;

interface NotionRichText {
  type: 'text';
  text: { content: string };
}

interface NotionPage {
  id: string;
  properties: {
    Nickname: { title: NotionRichText[] };
    Content: { rich_text: NotionRichText[] };
    Category: { select: { name: string } | null };
    Status: { select: { name: string } | null };
    SubmittedAt: { date: { start: string } | null };
    IP: { rich_text: NotionRichText[] };
  };
}

interface MessageResponse {
  id: string;
  nickname: string;
  content: string;
  category: string;
  submittedAt: string;
}

/**
 * Helper to call the Notion REST API
 */
async function notionFetch(
  env: Env,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${env.NOTION_TOKEN}`);
  headers.set('Notion-Version', NOTION_VERSION);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${NOTION_API}${endpoint}`, { ...options, headers });
}

/**
 * Map a Notion page to a frontend-safe message object (excludes IP)
 */
function mapPageToMessage(page: NotionPage): MessageResponse {
  return {
    id: page.id,
    nickname:
      page.properties.Nickname?.title?.[0]?.text?.content ?? '匿名',
    content:
      page.properties.Content?.rich_text?.[0]?.text?.content ?? '',
    category: page.properties.Category?.select?.name ?? '其他',
    submittedAt:
      page.properties.SubmittedAt?.date?.start ?? '',
  };
}

/**
 * POST /api/messages/setup
 * One-time endpoint that creates the Notion database under a parent page.
 */
export async function handleSetupDatabase(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      parentPageId?: string;
      setupSecret?: string;
    };

    if (!env.SETUP_SECRET || body.setupSecret !== env.SETUP_SECRET) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    if (!body.parentPageId) {
      return jsonResponse({ error: 'parentPageId is required' }, 400);
    }

    const res = await notionFetch(env, '/databases', {
      method: 'POST',
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: body.parentPageId },
        title: [{ type: 'text', text: { content: '留言板' } }],
        properties: {
          Nickname: { title: {} },
          Content: { rich_text: {} },
          Category: {
            select: {
              options: CATEGORIES.map((name) => ({ name })),
            },
          },
          Status: {
            select: {
              options: [
                { name: '待审核', color: 'yellow' },
                { name: '已通过', color: 'green' },
                { name: '已拒绝', color: 'red' },
              ],
            },
          },
          SubmittedAt: { date: {} },
          IP: { rich_text: {} },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return jsonResponse({ error: 'Notion API error', details: err }, 502);
    }

    const data = (await res.json()) as { id: string };
    return jsonResponse({
      message: 'Database created successfully',
      databaseId: data.id,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return jsonResponse({ error: 'Failed to create database' }, 500);
  }
}

/**
 * GET /api/messages
 * Returns approved messages with KV caching.
 */
export async function handleGetMessages(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || undefined;
    const pageSize = Math.min(
      Math.max(parseInt(url.searchParams.get('pageSize') || '20', 10) || 20, 1),
      50
    );

    const cacheKey = `messages:${pageSize}:${cursor || 'first'}`;

    // Check KV cache
    const cached = await env.MESSAGE_BOARD.get(cacheKey);
    if (cached) {
      return jsonResponse(JSON.parse(cached));
    }

    // Query Notion for approved messages
    const body: Record<string, unknown> = {
      filter: {
        property: 'Status',
        select: { equals: '已通过' },
      },
      sorts: [{ property: 'SubmittedAt', direction: 'descending' }],
      page_size: pageSize,
    };
    if (cursor) {
      body.start_cursor = cursor;
    }

    const res = await notionFetch(
      env,
      `/databases/${env.NOTION_DATABASE_ID}/query`,
      { method: 'POST', body: JSON.stringify(body) }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Notion query error:', err);
      return jsonResponse({ error: 'Failed to fetch messages' }, 502);
    }

    const data = (await res.json()) as {
      results: NotionPage[];
      has_more: boolean;
      next_cursor: string | null;
    };

    const result = {
      messages: data.results.map(mapPageToMessage),
      hasMore: data.has_more,
      nextCursor: data.next_cursor,
    };

    // Cache the result
    await env.MESSAGE_BOARD.put(cacheKey, JSON.stringify(result), {
      expirationTtl: CACHE_TTL,
    });

    return jsonResponse(result);
  } catch (error) {
    console.error('GetMessages error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * POST /api/messages
 * Creates a new message in Notion with Status="待审核".
 */
export async function handlePostMessage(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      nickname?: string;
      content?: string;
      category?: string;
    };

    // Validate input
    const nickname = (body.nickname || '').trim();
    const content = (body.content || '').trim();
    const category = (body.category || '').trim();

    if (!nickname || nickname.length > 30) {
      return jsonResponse(
        { error: '昵称不能为空且不超过30个字符' },
        400
      );
    }
    if (!content || content.length > 500) {
      return jsonResponse(
        { error: '留言内容不能为空且不超过500个字符' },
        400
      );
    }
    if (category && !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      return jsonResponse({ error: '无效的分类' }, 400);
    }

    // Rate limiting by IP
    const ip =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';
    const rateKey = `rate:msg:${ip}`;
    const currentCount = parseInt(
      (await env.MESSAGE_BOARD.get(rateKey)) || '0',
      10
    );

    if (currentCount >= RATE_LIMIT_MAX) {
      return jsonResponse(
        { error: '提交过于频繁，请稍后再试（每小时最多5条）' },
        429
      );
    }

    // Create Notion page
    const now = new Date().toISOString();
    const res = await notionFetch(env, '/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: env.NOTION_DATABASE_ID },
        properties: {
          Nickname: {
            title: [{ text: { content: nickname } }],
          },
          Content: {
            rich_text: [{ text: { content } }],
          },
          Category: {
            select: { name: category || '其他' },
          },
          Status: {
            select: { name: '待审核' },
          },
          SubmittedAt: {
            date: { start: now },
          },
          IP: {
            rich_text: [{ text: { content: ip } }],
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Notion create error:', err);
      return jsonResponse({ error: 'Failed to submit message' }, 502);
    }

    // Increment rate limit counter
    await env.MESSAGE_BOARD.put(rateKey, String(currentCount + 1), {
      expirationTtl: RATE_LIMIT_WINDOW,
    });

    return jsonResponse({
      message: '留言已提交，等待审核后将会显示',
    });
  } catch (error) {
    console.error('PostMessage error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
