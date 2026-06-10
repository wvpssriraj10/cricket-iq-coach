/**
 * AI enhancement feature flags.
 * All AI layers are off by default. Set NEXT_PUBLIC_AI_* env vars to "true" to enable.
 * Rollback: set to "false" or remove; no core app logic depends on these.
 */

function get(key: string): boolean {
  if (typeof window === "undefined") return false;
  return process.env[key] === "true";
}

export function isBehavioralEnabled(): boolean {
  return get("NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED");
}

export function isChatEnabled(): boolean {
  return get("NEXT_PUBLIC_AI_CHAT_ENABLED");
}

export function isPersonalizationEnabled(): boolean {
  return get("NEXT_PUBLIC_AI_PERSONALIZATION_ENABLED");
}

export function isAISearchFallbackEnabled(): boolean {
  return get("NEXT_PUBLIC_AI_SEARCH_FALLBACK_ENABLED");
}

export function isInsightsEnabled(): boolean {
  return get("NEXT_PUBLIC_AI_INSIGHTS_ENABLED");
}
