// Simple per-IP rate limiter to protect the OpenAI key from abuse / runaway cost.
//
// NOTE: This keeps its counters in memory, which lives inside one running server
// instance. On a single always-on server it works perfectly. On serverless
// hosting (e.g. Vercel), traffic can be spread across instances, so this blunts
// casual hammering but is not a hard global guarantee. For strict public-scale
// protection, back this with a shared store such as Upstash Redis (drop-in swap).

type Entry = { count: number; resetAt: number };

/** Time window for the limit. */
export const WINDOW_MS = 60 * 60 * 1000; // 1 hour
/** Max allowed generations per IP within the window. */
export const MAX_REQUESTS = 20;

const hits = new Map<string, Entry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/** Record a hit for `key` (an IP) and report whether it's allowed. */
export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  // Opportunistically drop expired entries so the map can't grow forever.
  if (hits.size > 5000) {
    for (const [k, e] of hits) if (now >= e.resetAt) hits.delete(k);
  }

  const existing = hits.get(key);

  if (!existing || now >= existing.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: now + WINDOW_MS,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}
