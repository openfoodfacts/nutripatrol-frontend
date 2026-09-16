// The flavor sites share one domain pattern, so the environment's base URL
// (world.openfoodfacts.net in dev, .org in prod) also fixes the environment
// of its siblings. `off_pro` is missing on purpose: the pro platform lives
// on a differently-shaped host, so those tickets fall back to plain OFF.
const FLAVOR_DOMAINS: Record<string, string> = {
  off: "openfoodfacts",
  obf: "openbeautyfacts",
  opff: "openpetfoodfacts",
  opf: "openproductsfacts",
};

/** Base URL of the site a ticket's flavor belongs to. */
export function flavorSiteUrl(flavor: string) {
  const base: string = import.meta.env.VITE_PO_URL;
  const domain = FLAVOR_DOMAINS[flavor];
  return domain ? base.replace("openfoodfacts", domain) : base;
}

export function productEditUrl(flavor: string, barcode: string) {
  return `${flavorSiteUrl(flavor)}/cgi/product.pl?type=edit&code=${encodeURIComponent(barcode)}`;
}

/** The product's public page - where a moderator checks what was flagged. */
export function productUrl(flavor: string, barcode: string) {
  return `${flavorSiteUrl(flavor)}/product/${encodeURIComponent(barcode)}`;
}

export function userUrl(flavor: string, userId: string) {
  return `${flavorSiteUrl(flavor)}/facets/editors/${userId}`;
}
