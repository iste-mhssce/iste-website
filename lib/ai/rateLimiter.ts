const BUCKET_SIZE = parseFloat(process.env.AI_RATE_LIMIT_PER_MIN ?? "20");

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

function refill(bucket: Bucket, now: number) {
  const elapsed = now - bucket.lastRefill;
  const add = (elapsed / 60_000) * BUCKET_SIZE;
  bucket.tokens = Math.min(BUCKET_SIZE, bucket.tokens + add);
  bucket.lastRefill = now;
}

/**
 * Token-bucket rate limiter keyed by scope (session id / IP / email).
 * Returns true if the call is allowed, false if it exceeds the limit.
 */
export function rateLimit(scope: string, limitPerMin = BUCKET_SIZE): boolean {
  const now = Date.now();
  const key = `${scope}`;
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: limitPerMin, lastRefill: now };
    buckets.set(key, bucket);
  } else {
    refill(bucket, now);
  }

  if (bucket.tokens < 1) {
    return false;
  }

  bucket.tokens -= 1;
  return true;
}
