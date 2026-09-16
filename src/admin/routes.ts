// Paths served by CustomRoutes rather than by a Resource. They are shared
// between the route declarations in AdminApp and the places that navigate to
// them, so that a path never has to be spelled out twice.

/** The ticket list - the moderator's landing page. Owned by the `tickets` Resource. */
export const TICKETS_ROUTE = "/tickets";

/** Where a signed-in user who is not a moderator is sent (see authProvider.checkAuth). */
export const NOT_MODERATOR_ROUTE = "/not-moderator";

/** Confirmation shown after the public flag form is submitted. */
export const THANKS_ROUTE = "/thanks";

/** The public flag form, one route per kind of thing being flagged. */
export const FLAG_PRODUCT_ROUTE = "/flag/product";
export const FLAG_IMAGE_ROUTE = "/flag/image";

/** Explains how flagging works, and how to reach the form from Open Food Facts. */
export const FLAG_INFOS_ROUTE = "/flag";

/** Walkthrough of the moderation screens. */
export const TUTORIAL_ROUTE = "/tutorial";
