/**
 * Validates if the given URL belongs to the same root domain as the current origin.
 * For example, allows "world.openfoodfacts.net" if the origin is "nutripatrol.openfoodfacts.net".
 */
function isValidReturnUrl(url: string | null): boolean {
  if (!url) return false;
  
  if (url.startsWith('/')) return true; // Relative paths are always safe

  try {
    const targetUrl = new URL(url);
    const currentUrl = new URL(window.location.origin);
    
    // Extract root domain (e.g., "openfoodfacts.net" from "nutripatrol.openfoodfacts.net")
    const parts = currentUrl.hostname.split('.');
    const rootDomain = parts.length > 1 ? parts.slice(-2).join('.') : currentUrl.hostname;

    return targetUrl.hostname === rootDomain || targetUrl.hostname.endsWith(`.${rootDomain}`);
  } catch {
    return false;
  }
}

/**
 * Saves the best available return URL into sessionStorage when entering the application flow.
 */
export function saveReturnUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const returnToParam = params.get("return_to");
  
  // 1. Check if we have a valid return_to parameter
  if (isValidReturnUrl(returnToParam)) {
    sessionStorage.setItem("returnTo", returnToParam as string);
    return;
  }

  // 2. Fallback to document.referrer (incoming url)
  if (isValidReturnUrl(document.referrer) && !sessionStorage.getItem("returnTo")) {
    sessionStorage.setItem("returnTo", document.referrer);
    return;
  }
}

/**
 * Returns a robust fallback redirect URL, prioritizing session storage.
 * If all else fails, rewrites "nutripatrol" to "world" based on environment.
 */
export function getSafeReturnUrl(): string {
  const origin = window.location.origin;
  
  // Get stored URL if it exists
  const storedUrl = sessionStorage.getItem("returnTo");
  if (storedUrl && isValidReturnUrl(storedUrl)) {
    return storedUrl;
  }

  // Final fallback strategy per issue #238
  return origin.replace('nutripatrol', 'world');
}
