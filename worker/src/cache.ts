/**
 * Edge-cache helpers built on the Workers Cache API.
 *
 * Why this exists: Workers KV on the free plan allows 1,000 writes/day, and
 * caching a fetched payload back into KV costs one of those writes every time
 * the entry expires. A single browser tab polling an endpoint on a timer was
 * enough to spend ~70% of the daily quota on nothing but cache refills. The
 * Cache API has no per-operation quota, so caching here is free.
 *
 * Cache keys are built from the incoming request's own origin: the Cache API
 * shares the zone's cache namespace, and keys are only reliable within the
 * Worker's own zone. The `/__cache/...` paths are never routed and never
 * fetched — they exist purely as stable keys.
 *
 * Note: the Cache API is a no-op on *.workers.dev and in Playground previews.
 * This Worker is served from the programming-api.chanmeng.org custom domain,
 * where it is fully active; elsewhere these helpers degrade to always-miss,
 * which is correct but uncached.
 */

/** Build a stable, same-origin cache key for an arbitrary logical name. */
export function cacheKey(request: Request, name: string): Request {
  const { origin } = new URL(request.url);
  return new Request(`${origin}/__cache/${name}`);
}

/**
 * Store `response` under `key`, without blocking the reply when a context is
 * available. Pass the response you are NOT returning (i.e. a `.clone()`).
 */
export function cachePut(
  key: Request,
  response: Response,
  ctx: ExecutionContext | null
): Promise<void> {
  const put = caches.default.put(key, response);
  if (ctx) {
    ctx.waitUntil(put);
    return Promise.resolve();
  }
  return put;
}

/** Read a JSON value previously stored with `cacheJson`. Null on miss or corruption. */
export async function cacheGetJson<T>(key: Request): Promise<T | null> {
  const hit = await caches.default.match(key);
  if (!hit) return null;
  try {
    return (await hit.json()) as T;
  } catch {
    return null;
  }
}

/** Store a JSON value under `key` for `ttlSeconds`. */
export function cacheJson(
  key: Request,
  value: unknown,
  ttlSeconds: number,
  ctx: ExecutionContext | null
): Promise<void> {
  const body = new Response(JSON.stringify(value), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttlSeconds}`,
    },
  });
  return cachePut(key, body, ctx);
}

/**
 * A counter that lives in the edge cache instead of KV — used for abuse
 * throttling, where spending a KV write per attempt is exactly what an attacker
 * would target. Counting is per-colo rather than global, which is the standard
 * trade-off for edge rate limiting: an abuser's traffic from one source lands
 * in one colo anyway, and the cap still holds there.
 */
export async function readCounter(key: Request): Promise<number> {
  const n = await cacheGetJson<number>(key);
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

/**
 * Deliberately awaited rather than deferred via waitUntil: a counter that is
 * still in flight when the next request reads it does not throttle anything.
 */
export function writeCounter(
  key: Request,
  value: number,
  ttlSeconds: number
): Promise<void> {
  return cacheJson(key, value, ttlSeconds, null);
}
