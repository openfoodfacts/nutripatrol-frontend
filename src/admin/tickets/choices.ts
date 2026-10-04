import { REASONS } from "../../const/flagsConst";

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

// The reasons GET /tickets accepts as a `reason` filter.
//
// Derived from src/const/flagsConst.ts rather than declared again, which is
// the point of that file: the form's options, this filter and nutripatrol's
// ReasonType used to be three lists that disagreed, so filtering by a reason
// the form actually submitted -- wrong_barcode, outdated, duplicate -- was a
// 422 rather than an empty result.
//
// All of them, including the bot-only ones: a moderator filters by what is in
// the queue, and Robotoff's flags are most of it.
export const reasonChoices = REASONS.map(({ value, label }) => ({
  id: value,
  name: label,
}));

// The reasons worth a queue of their own in the sidebar. Curated, because
// there are twenty of them and a menu entry each would be unusable.
export const reasonQueues = REASONS.filter((r) => r.queue);
