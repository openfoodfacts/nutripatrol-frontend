/**
 * Matomo analytics utility functions.
 *
 * Uses the global `_paq` command queue injected by the Matomo tracking script
 * in index.html.  All helpers are safe to call even when the tracker has not
 * loaded yet (e.g. in development) – they simply push commands onto the queue.
 */

// Extend the Window interface so TypeScript knows about _paq
declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

function pushCommand(command: unknown[]) {
  window._paq = window._paq || [];
  window._paq.push(command);
}

/**
 * Track a virtual page view (useful for SPA route changes).
 */
export function trackPageView(url: string) {
  pushCommand(["setCustomUrl", url]);
  pushCommand(["trackPageView"]);
}

/**
 * Track a custom event.
 *
 * @param category – e.g. "Moderation", "Flag"
 * @param action   – e.g. "click_edit", "submit_flag"
 * @param name     – optional label, e.g. a barcode
 * @param value    – optional numeric value
 */
export function trackEvent(
  category: string,
  action: string,
  name?: string,
  value?: number,
) {
  const command: unknown[] = ["trackEvent", category, action];
  if (name !== undefined) command.push(name);
  if (value !== undefined) command.push(value);
  pushCommand(command);
}
