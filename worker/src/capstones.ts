import type { Env } from './types';
import { notionFetch, type NotionRichText, richText, readRichText, readTitle } from './notion';
import { jsonResponse } from './http';

const LIST_CACHE_KEY = 'cap:list:published';
const LIST_CACHE_TTL = 60; // 1 minute — newly published rows surface within ~60s
const VOTE_TTL = 60 * 60 * 24 * 90; // 90 days — covers full Demo Day window + buffer
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 3600;
const COHORT = 'TECHNEST 2026';

const TRACKS = ['Campus Life', 'Personal Growth', 'Creative Tools'] as const;
type Track = (typeof TRACKS)[number];

interface NotionCapstonePage {
  id: string;
  properties: {
    Title: { title: NotionRichText[] };
    Slug: { rich_text: NotionRichText[] };
    Team: { rich_text: NotionRichText[] };
    Track: { select: { name: string } | null };
    Cohort: { select: { name: string } | null };
    Pitch: { rich_text: NotionRichText[] };
    LiveURL: { url: string | null };
    RepoURL: { url: string | null };
    YouTubeURL: { url: string | null };
    HeroImage: { url: string | null };
    Avatar: { url: string | null };
    PostMortemURL: { url: string | null };
    Status: { select: { name: string } | null };
    SubmittedAt: { date: { start: string } | null };
  };
}

interface CapstoneProject {
  id: string;
  slug: string;
  title: string;
  team: string;
  track: Track | string;
  cohort: string;
  pitch: string;
  liveURL: string;
  repoURL: string;
  youTubeId: string | null;
  /** Raw demo-video URL. Non-YouTube hosts (Loom, Vimeo…) can't be embedded, so the frontend links out instead. */
  demoURL: string;
  heroImage: string;
  avatar: string;
  postMortemURL: string | null;
  submittedAt: string;
}

/**
 * Extract a YouTube video id from common URL shapes:
 *   https://youtu.be/{id}
 *   https://www.youtube.com/watch?v={id}
 *   https://www.youtube.com/embed/{id}
 *   https://www.youtube.com/shorts/{id}
 * Returns null for non-YouTube URLs (e.g. Vimeo) — the frontend then renders
 * a generic "Watch demo" link instead of an embedded player.
 */
function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function mapPageToProject(page: NotionCapstonePage): CapstoneProject {
  return {
    id: page.id,
    slug: readRichText(page.properties.Slug).trim(),
    title: readTitle(page.properties.Title),
    team: readRichText(page.properties.Team),
    track: page.properties.Track?.select?.name ?? '',
    cohort: page.properties.Cohort?.select?.name ?? '',
    pitch: readRichText(page.properties.Pitch),
    liveURL: page.properties.LiveURL?.url ?? '',
    repoURL: page.properties.RepoURL?.url ?? '',
    youTubeId: extractYouTubeId(page.properties.YouTubeURL?.url),
    demoURL: page.properties.YouTubeURL?.url ?? '',
    heroImage: page.properties.HeroImage?.url ?? '',
    avatar: page.properties.Avatar?.url ?? '',
    postMortemURL: page.properties.PostMortemURL?.url ?? null,
    submittedAt: page.properties.SubmittedAt?.date?.start ?? '',
  };
}

/**
 * SHA-256 hex digest of the input string (uses Web Crypto, available in Workers).
 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function voterHash(
  ip: string,
  ua: string,
  clientId: string
): Promise<string> {
  return sha256Hex(`${ip}|${ua}|${clientId}`);
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown'
  );
}

/**
 * GET /api/capstones
 * Returns published capstone projects with live vote counts.
 * Project metadata is cached in KV for 60s; vote counts always read live.
 */
export async function handleListCapstones(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!env.NOTION_CAPSTONE_DATABASE_ID) {
      return jsonResponse(
        { error: 'Capstone database is not configured yet.', projects: [], updatedAt: new Date().toISOString() },
        200
      );
    }

    let projects: CapstoneProject[] | null = null;

    // Try cache first
    const cached = await env.CAPSTONE_VOTES.get(LIST_CACHE_KEY);
    if (cached) {
      try {
        projects = JSON.parse(cached) as CapstoneProject[];
      } catch {
        projects = null;
      }
    }

    // Cache miss — fetch from Notion
    if (!projects) {
      const res = await notionFetch(
        env,
        `/databases/${env.NOTION_CAPSTONE_DATABASE_ID}/query`,
        {
          method: 'POST',
          body: JSON.stringify({
            filter: {
              and: [
                { property: 'Status', select: { equals: 'Published' } },
                { property: 'Cohort', select: { equals: COHORT } },
              ],
            },
            sorts: [{ property: 'SubmittedAt', direction: 'ascending' }],
            page_size: 100,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error('Notion capstones query error:', err);
        return jsonResponse({ error: 'Failed to fetch capstones' }, 502);
      }

      const data = (await res.json()) as { results: NotionCapstonePage[] };
      projects = data.results
        .map(mapPageToProject)
        .filter((p) => p.slug && p.title);

      await env.CAPSTONE_VOTES.put(LIST_CACHE_KEY, JSON.stringify(projects), {
        expirationTtl: LIST_CACHE_TTL,
      });
    }

    // Merge live vote counts (always read live, never cached)
    const withVotes = await Promise.all(
      projects.map(async (p) => ({
        ...p,
        votes: parseInt(
          (await env.CAPSTONE_VOTES.get(`cap:count:${p.slug}`)) || '0',
          10
        ),
      }))
    );

    return jsonResponse({
      projects: withVotes,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ListCapstones error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * POST /api/capstones/vote
 * Body: { slug: string, clientId: string, action: 'add' | 'remove' }
 * Toggles a single vote per (visitor, project). Idempotent.
 */
export async function handleVote(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body = (await request.json()) as {
      slug?: string;
      clientId?: string;
      action?: string;
    };

    const slug = (body.slug || '').trim();
    const clientId = (body.clientId || '').trim();
    const action = body.action === 'remove' ? 'remove' : 'add';

    if (!slug || slug.length > 64 || !/^[A-Za-z0-9_-]+$/.test(slug)) {
      return jsonResponse({ error: 'Invalid slug' }, 400);
    }
    if (!clientId || clientId.length > 64) {
      return jsonResponse({ error: 'Invalid clientId' }, 400);
    }

    if (!env.NOTION_CAPSTONE_DATABASE_ID) {
      return jsonResponse({ error: 'Capstone showcase is not configured.' }, 503);
    }

    // Validate slug against the current published list. Refresh cache from Notion
    // if needed so cold-start vote attempts can't hit unknown slugs.
    let cached = await env.CAPSTONE_VOTES.get(LIST_CACHE_KEY);
    if (!cached) {
      // Trigger a list fetch + cache populate by reusing the GET handler's path.
      await handleListCapstones(request, env);
      cached = await env.CAPSTONE_VOTES.get(LIST_CACHE_KEY);
    }
    if (cached) {
      const list = JSON.parse(cached) as CapstoneProject[];
      if (!list.some((p) => p.slug === slug)) {
        return jsonResponse({ error: 'Unknown project' }, 404);
      }
    } else {
      return jsonResponse({ error: 'Unable to validate project right now.' }, 503);
    }

    const ip = clientIp(request);
    const ua = request.headers.get('User-Agent') || 'unknown';

    // IP rate limit
    const rateKey = `cap:rate:${ip}`;
    const rateCount = parseInt(
      (await env.CAPSTONE_VOTES.get(rateKey)) || '0',
      10
    );
    if (rateCount >= RATE_LIMIT_MAX) {
      return jsonResponse(
        { error: 'Too many votes from your IP, please try again later.' },
        429
      );
    }

    const hash = await voterHash(ip, ua, clientId);
    const votedKey = `cap:voted:${hash}:${slug}`;
    const countKey = `cap:count:${slug}`;

    const alreadyVoted = !!(await env.CAPSTONE_VOTES.get(votedKey));
    let count = parseInt((await env.CAPSTONE_VOTES.get(countKey)) || '0', 10);

    if (action === 'add' && !alreadyVoted) {
      count += 1;
      await env.CAPSTONE_VOTES.put(countKey, String(count));
      await env.CAPSTONE_VOTES.put(votedKey, '1', { expirationTtl: VOTE_TTL });
    } else if (action === 'remove' && alreadyVoted) {
      count = Math.max(0, count - 1);
      await env.CAPSTONE_VOTES.put(countKey, String(count));
      await env.CAPSTONE_VOTES.delete(votedKey);
    }

    // Increment IP rate limit counter even on no-op to discourage probing
    await env.CAPSTONE_VOTES.put(rateKey, String(rateCount + 1), {
      expirationTtl: RATE_LIMIT_WINDOW,
    });

    return jsonResponse({
      slug,
      votes: count,
      voted: action === 'add' ? true : false,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * POST /api/capstones/setup
 * One-time provisioning. Gated by SETUP_SECRET. Creates the capstone Notion DB.
 * Body: { parentPageId: string, setupSecret: string }
 */
export async function handleSetupCapstoneDB(
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
        title: richText('TECHNEST 2026 Capstone Showcase'),
        properties: {
          Title: { title: {} },
          Slug: { rich_text: {} },
          Team: { rich_text: {} },
          Track: {
            select: {
              options: TRACKS.map((name) => ({ name })),
            },
          },
          Cohort: {
            select: {
              options: [{ name: COHORT, color: 'blue' }],
            },
          },
          Pitch: { rich_text: {} },
          LiveURL: { url: {} },
          RepoURL: { url: {} },
          YouTubeURL: { url: {} },
          HeroImage: { url: {} },
          PostMortemURL: { url: {} },
          Status: {
            select: {
              options: [
                { name: 'Draft', color: 'gray' },
                { name: 'Published', color: 'green' },
                { name: 'Hidden', color: 'red' },
              ],
            },
          },
          SubmittedAt: { date: {} },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return jsonResponse({ error: 'Notion API error', details: err }, 502);
    }

    const data = (await res.json()) as { id: string };
    return jsonResponse({
      message: 'Capstone database created successfully',
      databaseId: data.id,
      nextStep:
        "Run: cd worker && npx wrangler secret put NOTION_CAPSTONE_DATABASE_ID — then paste this databaseId.",
    });
  } catch (error) {
    console.error('Capstone setup error:', error);
    return jsonResponse({ error: 'Failed to create database' }, 500);
  }
}

/** Notion `url` properties reject empty strings — use null when blank. */
function urlProp(value: string | null | undefined): { url: string | null } {
  const v = (value || '').trim();
  return { url: v ? v : null };
}

/**
 * POST /api/capstones/admin
 * Creates (publishes) a capstone project row in the Notion database.
 * Gated by CAPSTONE_ADMIN_TOKEN. Reusable for every student submission.
 * Body: {
 *   adminToken, title, slug, team, track, pitch,
 *   liveURL?, repoURL?, youTubeURL?, heroImage?, avatar?, postMortemURL?,
 *   cohort?='TECHNEST 2026', status?='Published', submittedAt?=today
 * }
 */
export async function handleCreateCapstone(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, string | undefined>;

    if (!env.CAPSTONE_ADMIN_TOKEN || body.adminToken !== env.CAPSTONE_ADMIN_TOKEN) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    if (!env.NOTION_CAPSTONE_DATABASE_ID) {
      return jsonResponse({ error: 'Capstone database is not configured.' }, 503);
    }

    const title = (body.title || '').trim();
    const slug = (body.slug || '').trim();
    const team = (body.team || '').trim();
    const track = (body.track || '').trim();
    const pitch = (body.pitch || '').trim();

    if (!title) return jsonResponse({ error: 'title is required' }, 400);
    if (!slug || slug.length > 64 || !/^[A-Za-z0-9_-]+$/.test(slug)) {
      return jsonResponse({ error: 'Invalid slug (^[A-Za-z0-9_-]+$, ≤64)' }, 400);
    }
    if (track && !TRACKS.includes(track as Track)) {
      return jsonResponse(
        { error: `Invalid track. Expected one of: ${TRACKS.join(', ')}` },
        400
      );
    }

    const cohort = (body.cohort || COHORT).trim();
    const status = (body.status || 'Published').trim();
    const submittedAt = (body.submittedAt || new Date().toISOString().slice(0, 10)).trim();

    // Ensure the Avatar url property exists on the (already-created) DB. Idempotent.
    const patchRes = await notionFetch(
      env,
      `/databases/${env.NOTION_CAPSTONE_DATABASE_ID}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ properties: { Avatar: { url: {} } } }),
      }
    );
    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error('Ensure Avatar property error:', err);
      return jsonResponse({ error: 'Failed to ensure schema', details: err }, 502);
    }

    // Create the project page.
    const createRes = await notionFetch(env, '/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: env.NOTION_CAPSTONE_DATABASE_ID },
        properties: {
          Title: { title: richText(title) },
          Slug: { rich_text: richText(slug) },
          Team: { rich_text: richText(team) },
          Track: track ? { select: { name: track } } : { select: null },
          Cohort: { select: { name: cohort } },
          Pitch: { rich_text: richText(pitch) },
          LiveURL: urlProp(body.liveURL),
          RepoURL: urlProp(body.repoURL),
          YouTubeURL: urlProp(body.youTubeURL),
          HeroImage: urlProp(body.heroImage),
          Avatar: urlProp(body.avatar),
          PostMortemURL: urlProp(body.postMortemURL),
          Status: { select: { name: status } },
          SubmittedAt: { date: { start: submittedAt } },
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('Create capstone error:', err);
      return jsonResponse({ error: 'Notion API error', details: err }, 502);
    }

    const created = (await createRes.json()) as { id: string };

    // Bust the 60s list cache so the new project surfaces immediately.
    await env.CAPSTONE_VOTES.delete(LIST_CACHE_KEY);

    return jsonResponse({
      message: 'Capstone project created',
      pageId: created.id,
      slug,
      status,
      cohort,
    });
  } catch (error) {
    console.error('Create capstone error:', error);
    return jsonResponse({ error: 'Failed to create capstone' }, 500);
  }
}
