import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Reload the tickets on screen after a moderator acted on one: closed it,
 * fixed it, re-opened it, deleted its picture or moved its product.
 *
 * Every ticket query lives under the "tickets" key - lists, the ticket page,
 * its history and comments - so this reloads the ones on screen and marks the
 * others stale. A list filtered by status then drops the ticket that left
 * it, pulls in the next one, and shows the counts and statuses other
 * moderators changed meanwhile.
 *
 * The product pictures go too, since some of these actions delete one or
 * move the product: only the panels open on screen are fetched again from
 * Open Food Facts. Flags are left alone - closing a ticket does not change
 * them. Rows do not blank while it loads: react-query keeps the previous
 * answer on screen, and so do the flags (see useFlagsByTicketIds).
 */
export function useRefreshTickets() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["productImages"] }),
      ]),
    [queryClient],
  );
}
