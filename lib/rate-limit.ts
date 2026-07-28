interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export const SENSITIVE_ENDPOINT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 10_000,
  maxRequests: 5,
};

const buckets = new Map<string, RateLimitBucket>();

const SWEEP_PROBABILITY = 0.01;

function sweepExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  { windowMs, maxRequests }: RateLimitConfig,
): boolean {
  const now = Date.now();

  if (Math.random() < SWEEP_PROBABILITY) {
    sweepExpiredBuckets(now);
  }

  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxRequests) {
    return false;
  }

  bucket.count += 1;
  return true;
}
