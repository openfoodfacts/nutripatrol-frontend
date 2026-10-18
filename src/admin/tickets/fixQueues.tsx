import type { ComponentType, ReactElement } from "react";
import CollectionsIcon from "@mui/icons-material/Collections";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import ReportIcon from "@mui/icons-material/Report";
import type { Flag } from "../dataProvider";
import { projectSpec } from "../../const/flagsConst";
import type { SuggestedAction } from "./flagActions";
import {
  deleteProductImage,
  moveTicketProduct,
  uploadedImageId,
} from "./offImages";
import { MoveToProjectButton } from "./MoveToProjectButton";
import {
  ReportedImagesPanel,
  reportedDuplicates,
  reportedImages,
} from "./ReportedImagesPanel";
import { FixButton } from "./FixQueueList";

/** What a queue reads off a ticket. */
export interface QueueTicket {
  id: number;
  barcode: string | null;
  flavor: string;
  type: string;
  image_id: string | null;
}

/** What an extra action of a queue is given, for each row. */
export interface QueueTicketActionProps {
  ticket: QueueTicket;
  flags: Flag[];
}

/**
 * A page listing the open tickets one fix applies to, with a button applying
 * it to each. Adding an entry to `fixQueues` adds the page, its route and its
 * menu entry.
 */
export interface FixQueue {
  /** Names the page's URL ("/fix/<key>") and its stored sort and page. */
  key: string;
  menuLabel: string;
  icon: ReactElement;
  title: string;
  /**
   * Which tickets are in the queue, in GET /tickets filter terms. Open ones
   * only, always: the page adds `status: "open"` itself.
   */
  filter: Record<string, unknown>;
  /** Shown when the queue is empty. */
  emptyText: string;
  /**
   * The fix for one ticket, from its reports, or null when they do not carry
   * what the fix needs. Unless the action says it closes the ticket itself,
   * the page closes it as fixed once `run` succeeds.
   */
  fix: (ticket: QueueTicket, flags: Flag[]) => SuggestedAction | null;
  /** Shown in place of the button when `fix` returns null. */
  noFixText: string;
  /**
   * Buttons shown after the fix, for when it is not the right answer. Each
   * deals with refreshing the list itself. Every queue also gets a "Close"
   * button, after these.
   */
  extraActions?: ComponentType<QueueTicketActionProps>[];
  /**
   * The row's expandable section, for tickets with a product. Defaults to
   * the product's pictures.
   */
  expand?: ReactElement;
  /** Show the ticket's picture in a column of its own. */
  thumbnail?: boolean;
}

/** The URL of a queue's page. Outside "/tickets/*", which the Resource owns. */
export function fixQueuePath(queue: FixQueue) {
  return `/fix/${queue.key}`;
}

/**
 * The project the reporters say the product belongs on, or undefined.
 *
 * Several people can report the same product, and they need not agree: the
 * most named project wins, ties going to the earliest report. The ticket's
 * own project is not a destination, whoever named it.
 */
function targetProject(flags: Flag[], flavor: string) {
  const votes = new Map<string, number>();
  for (const flag of flags) {
    const target = projectSpec(flag.extra_data?.correct_flavor);
    if (!target || target.value === flavor) continue;
    votes.set(target.value, (votes.get(target.value) ?? 0) + 1);
  }
  let best: string | undefined;
  for (const [value, count] of votes) {
    if (best === undefined || count > votes.get(best)!) best = value;
  }
  return projectSpec(best);
}

export const fixQueues: FixQueue[] = [
  {
    key: "not-a-product",
    menuLabel: "Not a product",
    icon: <DriveFileMoveIcon />,
    title: "Not a product of this project",
    filter: { reason: ["not_a_product"] },
    emptyText: "Nothing to move.",
    // A product that belongs on no project at all is a deletion, which is
    // decided from the ticket page instead.
    noFixText: "No project suggested",
    fix: (ticket, flags) => {
      const target = targetProject(flags, ticket.flavor);
      if (!ticket.barcode || !target) return null;
      return {
        key: "move-project",
        label: `Move to ${target.label}`,
        confirm: `Move ${ticket.barcode} to ${target.label}? It will no longer be listed on ${projectSpec(ticket.flavor)?.label ?? "its current project"}.`,
        run: () =>
          moveTicketProduct(
            ticket.id,
            target.value,
            "Moved after a NutriPatrol report: not a product of this project",
          ),
        destructive: true,
        closesTicket: true,
      };
    },
    extraActions: [
      ({ ticket, flags }) => (
        <MoveToProjectButton
          ticket={ticket}
          flags={flags}
          suggested={targetProject(flags, ticket.flavor)?.value}
        />
      ),
    ],
  },
  {
    key: "duplicate-images",
    menuLabel: "Duplicate images",
    icon: <CollectionsIcon />,
    title: "Duplicate images",
    filter: { reason: ["duplicate"] },
    emptyText: "No copies to clean up.",
    noFixText: "No product",
    // The fix itself is in the row's expandable section, one picture at a
    // time: this only closes the ticket once it is done.
    fix: () => ({
      key: "close-fixed",
      label: "Close (fixed)",
    }),
    expand: (
      <ReportedImagesPanel
        reported={reportedDuplicates}
        reportedTitle="Reported as duplicates"
        hint="Delete the extra copies, keep one, then close the ticket."
      />
    ),
  },
  {
    key: "inappropriate-images",
    menuLabel: "Inappropriate images",
    icon: <ReportIcon />,
    title: "Inappropriate images",
    // A product flagged as inappropriate has no picture to show or delete,
    // and is dealt with from the main ticket list.
    filter: { reason: ["inappropriate"], type: "image" },
    emptyText: "No pictures to review.",
    thumbnail: true,
    // A selected image ("front_fr") names a crop rather than a file: the
    // upload it was cut from is in the row's expandable section.
    noFixText: "Delete it from the pictures below",
    fix: (ticket) => {
      const imgid = uploadedImageId(ticket.image_id);
      if (!ticket.barcode || imgid === null) return null;
      const barcode = ticket.barcode;
      return {
        key: "delete-image",
        label: "Delete image",
        confirm: `Move image ${imgid} of ${barcode} to the Open Food Facts trash?`,
        run: () => deleteProductImage(barcode, imgid, ticket.flavor),
        destructive: true,
      };
    },
    // For when the pictures were deleted from the expandable section.
    extraActions: [
      ({ ticket }) => (
        <FixButton
          ticket={ticket}
          action={{ key: "close-fixed", label: "Close (fixed)" }}
        />
      ),
    ],
    expand: (
      <ReportedImagesPanel
        reported={reportedImages}
        reportedTitle="Reported picture"
        hint="Delete the reported picture, and any other one that does not belong, then close the ticket."
      />
    ),
  },
];
