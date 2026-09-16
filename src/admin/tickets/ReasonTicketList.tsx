import { List } from "react-admin";
import { TicketDatagrid, ticketFilters } from "./TicketList";
import { reasonChoices } from "./choices";

/** Path of the page listing the tickets flagged for `reason`.
 *
 * Kept out of the "/tickets" namespace on purpose: the tickets Resource owns
 * "/tickets/*", and a sub-path there would compete with its own edit route.
 */
export function reasonPath(reason: string) {
  return `/tickets-by-reason/${reason}`;
}

// The reason is pinned by the page, so the reason input would only let a
// moderator contradict it - every other filter stays available.
const filters = ticketFilters.filter((filter) => filter.key !== "reason");

/**
 * The ticket list with `reason` pinned to one value.
 *
 * `filter` (as opposed to `filterDefaultValues`) makes it permanent: it is
 * added to every getList call and cannot be cleared from the filter bar.
 */
export function ReasonTicketList({ reason }: { reason: string }) {
  const label =
    reasonChoices.find((choice) => choice.id === reason)?.name ?? reason;
  return (
    <List
      // Rendered from a custom route, outside the Resource, so the resource
      // has to be named explicitly.
      resource="tickets"
      title={`${label} tickets`}
      filter={{ reason: [reason] }}
      // Without a key of its own, every page would share the main ticket
      // list's stored filters, sort and page number.
      storeKey={`tickets.reason.${reason}`}
      filters={filters}
      // These pages are expected to come up empty, and the default empty
      // page hides the filter bar - which would leave a moderator on a blank
      // screen with no hint that a filter is applied.
      empty={false}
      // The default toolbar's Export button downloads the current page as
      // CSV; nothing here is meant to leave the moderation tool.
      exporter={false}
    >
      <TicketDatagrid />
    </List>
  );
}
