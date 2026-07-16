const buckets = globalThis.__hempAuraRateLimits || new Map();
globalThis.__hempAuraRateLimits = buckets;

export function rateLimit(key, { max, windowSeconds }) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, max - 1) };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    allowed: existing.count <= max,
    remaining: Math.max(0, max - existing.count),
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}
