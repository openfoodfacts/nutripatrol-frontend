import type { ComponentType, ReactElement } from "react";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import type { Flag } from "../dataProvider";
import { projectSpec } from "../../const/flagsConst";
import type { SuggestedAction } from "./flagActions";
import { moveTicketProduct } from "./offImages";
import { MoveToProjectButton } from "./MoveToProjectButton";

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
];
