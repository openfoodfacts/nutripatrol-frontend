import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { GetListResult, Identifier } from "react-admin";

/**
 * Take a ticket that was just closed out of the ticket lists on screen,
 * without refetching them.
 *
 * A fix queue lists open tickets only, so a closed one has to go; `refresh()`
 * would do it by reloading the page's rows and their flags, which blinks every
 * row to deal with one. This edits react-admin's cached lists instead, and
 * marks them stale without refetching, so a list opened later (the main
 * ticket list, filtered by status) still loads fresh.
 */
export function useDropTicket() {
  const queryClient = useQueryClient();

  return useCallback(
    (ticketId: Identifier) => {
      let emptiedAPage = false;
      queryClient.setQueriesData<GetListResult>(
        { queryKey: ["tickets", "getList"] },
        (list) => {
          if (!list?.data.some((ticket) => ticket.id === ticketId)) return list;
          const data = list.data.filter((ticket) => ticket.id !== ticketId);
          const total = list.total === undefined ? undefined : list.total - 1;
          if (data.length === 0 && total !== 0) emptiedAPage = true;
          return { ...list, data, total };
        },
      );
      // The last row of a page going, with more tickets left, would show an
      // empty queue that is not: that one case is worth the reload.
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
        refetchType: emptiedAPage ? "active" : "none",
      });
    },
    [queryClient],
  );
}
