// Mirrors the enums declared in nutripatrol's app/api.py (TicketStatus,
// IssueType) and the openfoodfacts.Flavor enum used for `flavor`.
//
// Not reusing src/const/flagsConst.ts's `flavors` array: it lists
// 'off-pro' with a hyphen, but the backend enum and every API response use
// 'off_pro' with an underscore.

export const statusChoices = [
  { id: "open", name: "Open" },
  { id: "closed", name: "Closed" },
  { id: "closed-no-issue", name: "No issue" },
  { id: "closed-fixed", name: "Fixed" },
];

export const typeChoices = [
  { id: "product", name: "Product" },
  { id: "image", name: "Image" },
  { id: "search", name: "Search" },
];

export const flavorChoices = [
  { id: "off", name: "Open Food Facts" },
  { id: "obf", name: "Open Beauty Facts" },
  { id: "opff", name: "Open Pet Food Facts" },
  { id: "opf", name: "Open Products Facts" },
  { id: "off_pro", name: "Open Food Facts Pro" },
];

// The reasons GET /tickets accepts as a `reason` filter, mirroring
// nutripatrol's ReasonType enum in app/api.py. Same four values the existing
// ImageModerationPage toggles offer.
//
// Deliberately not src/const/flagsConst.ts's `reasons`: those are the values
// the public flag form submits (wrong_barcode, outdated, duplicate...), and
// FlagCreate.reason stores them as free text. The ticket list's `reason`
// filter is validated against ReasonType, so filtering by any of the others
// is a 422 rather than an empty result.
export const reasonChoices = [
  { id: "inappropriate", name: "Inappropriate" },
  { id: "human", name: "Human" },
  { id: "beauty", name: "Beauty" },
  { id: "other", name: "Other" },
];
