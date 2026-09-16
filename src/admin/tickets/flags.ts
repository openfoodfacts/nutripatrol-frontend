import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "react-admin";
import type { Identifier } from "react-admin";
import type { NutriPatrolDataProvider } from "../dataProvider";
import { reasons } from "../../const/flagsConst";

// The public flag form offers a different set of reasons per ticket type, but
// they land in one free-text column - so for reading them back the three lists
// are one lookup table. Built from flagsConst rather than duplicated, so a
// reason added to the form is a reason this can name.
const REASON_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(reasons).flatMap((byType) =>
    byType.map(({ value, label }) => [value, label]),
  ),
);

/**
 * How a flag's reason reads to a moderator.
 *
 * Falls back to the raw value, de-underscored: the column is free text, and
 * flags also arrive from Robotoff and from older versions of the form, so it
 * holds values no current list mentions. Showing "nsfw_image" beats showing
 * nothing.
 */
export function flagReasonLabel(reason: string | null | undefined): string | null {
  if (!reason) return null;
  const known = REASON_LABELS[reason];
  if (known) return known;
  const spaced = reason.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * The flags of the given tickets, keyed by ticket id.
 *
 * One request for the whole set, and every caller passing the same ids shares
 * it: the ticket list renders this hook once per row, and react-query collapses
 * them into a single POST as long as the key matches - hence the sort, which
 * makes the key depend on which tickets are on screen rather than on the order
 * they happen to be listed in.
 */
export function useFlagsByTicketIds(ticketIds: Identifier[]) {
  const dataProvider = useDataProvider<NutriPatrolDataProvider>();
  const ids = useMemo(
    () => ticketIds.map(Number).sort((a, b) => a - b),
    [ticketIds],
  );

  return useQuery({
    queryKey: ["flags", "byTicket", ids],
    queryFn: () => dataProvider.getFlagsByTicket(ids),
    enabled: ids.length > 0,
    // A flag is written once and never edited, so the only thing a refetch can
    // discover is somebody else reporting the same product in the last few
    // minutes - not worth a request on every window focus.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
