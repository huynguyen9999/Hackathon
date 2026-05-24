import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

let readLimiter: Ratelimit | null = null;
let writeLimiter: Ratelimit | null = null;
let warnedMissingEnv = false;

function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Missing Upstash Redis credentials");
  }
  return new Redis({ url, token });
}

function getReadLimiter(): Ratelimit {
  if (!readLimiter) {
    readLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(120, "60 s"),
      prefix: "rl:roadmaps:read",
      analytics: true,
    });
  }
  return readLimiter;
}

function getWriteLimiter(): Ratelimit {
  if (!writeLimiter) {
    writeLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "rl:roadmaps:write",
      analytics: true,
    });
  }
  return writeLimiter;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number };

export async function checkRoadmapRateLimit(
  request: Request,
): Promise<RateLimitResult> {
  if (!isRateLimitConfigured()) {
    if (!warnedMissingEnv && process.env.NODE_ENV !== "test") {
      warnedMissingEnv = true;
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — skipping API rate limits",
      );
    }
    return { limited: false };
  }

  const ip = getClientIp(request);
  const method = request.method.toUpperCase();
  const isWrite = method === "POST" || method === "PATCH" || method === "PUT";
  const limiter = isWrite ? getWriteLimiter() : getReadLimiter();
  const result = await limiter.limit(ip);

  if (result.success) {
    return { limited: false };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  return { limited: true, retryAfterSeconds };
}
