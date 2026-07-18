import "server-only";

import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ChatConfigurationError } from "@/lib/chat/server/provider-factory";

export type RateLimitDecision = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let rateLimiter: Ratelimit | null = null;

function getClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "anonymous"
  );
}

function getRateLimiter(environment: NodeJS.ProcessEnv): Ratelimit {
  if (rateLimiter) return rateLimiter;

  const url = environment.UPSTASH_REDIS_REST_URL?.trim();
  const token = environment.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    throw new ChatConfigurationError("Upstash rate limiting is not configured.");
  }

  rateLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    analytics: false,
    prefix: "portfolio:chat",
  });
  return rateLimiter;
}

export async function checkChatRateLimit(
  request: Request,
  environment: NodeJS.ProcessEnv = process.env
): Promise<RateLimitDecision> {
  const addressHash = createHash("sha256")
    .update(getClientAddress(request))
    .digest("hex");
  const result = await getRateLimiter(environment).limit(`ip:${addressHash}`);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
