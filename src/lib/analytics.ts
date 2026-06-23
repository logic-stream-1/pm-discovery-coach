// Retrieve configuration from env, defaulting to empty strings
const POSTHOG_KEY = (import.meta as any).env?.VITE_POSTHOG_KEY || (import.meta as any).env?.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = (import.meta as any).env?.VITE_POSTHOG_HOST || (import.meta as any).env?.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

// Initialize Analytics (No-op after retraction)
export function initAnalytics() {
  console.log("ℹ️ Analytics system has been retracted. No external trackers are running.");
}

// Track an event with custom properties (No-op/console diagnostic only for dev simulation after retraction)
export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  // Silent or console development mode feedback only
  console.log(`[DE-ACTIVATED ANALYTICS EVENT]: ${eventName}`, properties);
}
