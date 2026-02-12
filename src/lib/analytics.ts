/**
 * Analytics tracking utilities
 * Placeholder for future analytics integration (e.g., Google Analytics, Plausible)
 */

import { logger } from "@/lib/logger";

export function trackPageView(path: string) {
  if (typeof window !== "undefined") {
    // Placeholder for analytics tracking
    logger.debug("Page view:", path);
    // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_path: path });
  }
}

export function trackEvent(eventName: string, eventData?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    // Placeholder for event tracking
    logger.debug("Event:", eventName, eventData);
    // Example: gtag('event', eventName, eventData);
  }
}

export function trackAffiliateClick(affiliateId: string, episodeId?: string) {
  trackEvent("affiliate_click", {
    affiliate_id: affiliateId,
    episode_id: episodeId,
  });
}

export function trackCommentSubmit(episodeId: string) {
  trackEvent("comment_submit", {
    episode_id: episodeId,
  });
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent("search", {
    query,
    result_count: resultCount,
  });
}
