/**
 * Error handling utilities for graceful degradation
 */

import { logger } from "@/lib/logger";

export class SupabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseError";
  }
}

export async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  cacheKey?: string
): Promise<T> {
  try {
    const result = await fn();
    // Cache successful result
    if (cacheKey) {
      const { setCache } = await import("./cache");
      setCache(cacheKey, result, 3600000); // 1 hour cache
    }
    return result;
  } catch (error) {
    logger.error("Error in withFallback:", error);

    // Try to get from cache
    if (cacheKey) {
      const { getCache } = await import("./cache");
      const cached = getCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return fallback;
  }
}
