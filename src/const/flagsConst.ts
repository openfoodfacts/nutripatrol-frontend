/**
 * The flag taxonomy: what a report can be about, and why.
 *
 * Mirrors nutripatrol's `app/flag_reasons.py`, which is the authority and
 * also serves this list from `GET /reasons`. It is kept here as a static
 * copy because it carries things the API has no reason to know -- the
 * wording of a label, which queues a moderator gets a menu entry for -- and
 * because the flag form should not need a round trip before it can draw
 * itself.
 *
 * It replaces three lists that disagreed: the form's options, the moderator's
 * filter choices, and the backend's filter enum. Filtering by a reason the
 * form actually submitted used to answer 422.
 *
 * `value` must match the backend `ReasonType` exactly.
 */

export type IssueType = "product" | "image" | "search";

export interface ReasonSpec {
  /** Must match the backend ReasonType. */
  value: string;
  label: string;
  /** Which forms offer it. The API accepts any reason for any type. */
  types: IssueType[];
  /** Shown once the reason is picked. */
  hint?: string;
  /**
   * For reports nobody can act on. They are still submitted: a redirect that
   * loses the report also loses the ability to measure the redirect.
   */
  outOfScope?: { message: string; href: string; linkLabel: string };
  /** Robotoff's own vocabulary. Filterable, never offered to a person. */
  botOnly?: boolean;
  /** Gets a queue of its own in the moderation sidebar. */
  queue?: boolean;
}

const FORUM_URL = "https://slack.openfoodfacts.org/";

export const REASONS: ReasonSpec[] = [
  /* ---------------------------------------------------------------- product */
  {
    value: "wrong_data",
    label: "Incorrect information",
    types: ["product"],
    queue: true,
    hint: "Tell us in your comment which field is wrong and what the packaging says instead.",
  },
  {
    value: "missing_data",
    label: "Missing information",
    types: ["product"],
  },
  {
    value: "wrong_barcode",
    label: "Wrong barcode",
    types: ["product"],
    queue: true,
    hint: "Give the barcode printed on the pack in your comment. If you can, upload a photo of the pack showing it before reporting — it is what lets a moderator act without asking you.",
  },
  {
    value: "not_a_product",
    label: "Not a product of this project",
    types: ["product"],
    hint: "For a cosmetic on Open Food Facts, a pet food, or something that is not a product at all.",
  },
  {
    value: "duplicate_product",
    label: "Duplicate of another product",
    types: ["product"],
  },
  {
    value: "discontinued",
    label: "No longer sold",
    types: ["product"],
  },
  {
    value: "spam_or_vandalism",
    label: "Spam or vandalism",
    types: ["product"],
    queue: true,
  },
  {
    value: "legal_takedown",
    label: "Trademark or legal takedown",
    types: ["product"],
    hint: "For a rights holder asking for a product page to be removed.",
  },
  {
    value: "product_complaint",
    label: "A problem with the product itself",
    types: ["product"],
    queue: true,
    outOfScope: {
      message:
        "Open Food Facts describes products, it does not sell them — nobody here can refund you or reach the manufacturer on your behalf. Send this to the manufacturer, whose contact details are usually on the pack.",
      href: FORUM_URL,
      linkLabel: "Ask on the forums",
    },
  },

  /* ------------------------------------------------------------------ image */
  {
    value: "inappropriate",
    label: "Inappropriate",
    types: ["image"],
    queue: true,
  },
  {
    value: "copyright",
    label: "Copyright (proprietary image)",
    types: ["image"],
    queue: true,
    hint: "Add a link to where the image was originally published in your comment — it is what makes the claim actionable.",
  },
  {
    value: "includes_personal_infos",
    label: "Shows personal information",
    types: ["image"],
    queue: true,
    hint: "Please do not repeat the personal information here — just tell us where in the picture it is.",
  },
  {
    value: "wrong_product",
    label: "Shows a different product",
    types: ["image"],
    queue: true,
    hint: "The photo itself is fine — it is just filed under the wrong barcode. Tell us in your comment which product it shows.",
  },
  {
    value: "duplicate",
    label: "Duplicate image",
    types: ["image"],
  },
  {
    value: "outdated",
    label: "Outdated packaging",
    types: ["image"],
  },

  /* ------------------------------------------------------- product or image */
  {
    value: "delete_request",
    label: "I added this by mistake",
    types: ["product", "image"],
    queue: true,
  },

  /* ----------------------------------------------------------------- search */
  {
    value: "no_results",
    label: "No results",
    types: ["search"],
  },
  {
    value: "wrong_results",
    label: "Irrelevant results",
    types: ["search"],
  },

  /* ----------------------------------------------------------------- shared */
  {
    value: "other",
    label: "Something else",
    types: ["product", "image", "search"],
  },

  /* --------------------------------------------------------------- bot-only */
  { value: "human", label: "Person in the picture", types: [], botOnly: true },
  { value: "beauty", label: "Cosmetic product", types: [], botOnly: true },
];

/** The reasons the form offers for a given type of report. */
export function reasonsForType(type: IssueType): ReasonSpec[] {
  return REASONS.filter((r) => !r.botOnly && r.types.includes(type));
}

export function reasonSpec(value: string | null | undefined): ReasonSpec | undefined {
  return value ? REASONS.find((r) => r.value === value) : undefined;
}

/**
 * Kept for the scores people report and nobody can change.
 *
 * Nutri-Score and NOVA are computed from the data, so "the Nutri-Score is
 * wrong" is either a data error -- which belongs under the field that is
 * wrong -- or a disagreement with the formula, which belongs on the forums.
 * 79 reports said it anyway.
 */
export const SCORE_DISPUTE_NOTICE = {
  message:
    "Nutri-Score and NOVA are calculated from the product's data — they cannot be edited directly. If a value behind the score is wrong, report that value instead; if you disagree with how the score is computed, the forums are the place for it.",
  href: FORUM_URL,
  linkLabel: "Ask on the forums",
};

/**
 * SOURCES: the origin of the flag. Robotoff is excluded on purpose — it is a
 * different system, and files its own flags.
 */
export const sources = ["web", "mobile"];

/**
 * FLAVORS: which project the report is about.
 *
 * Note the hyphen in 'off-pro': this is what the flag form accepts in its
 * query string. API responses use 'off_pro' — see src/admin/tickets/choices.ts.
 */
export const flavors = ["off", "obf", "opff", "opf", "off-pro"];
