import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useListContext, useRecordContext, type FieldProps } from "react-admin";
import type { Identifier } from "react-admin";
import { FlagSummary } from "./FlagSummary";
import { useFlagsByTicketIds } from "./flags";

/** Keeps the column from crowding out the rest of the row on a wide screen. */
const MAX_WIDTH = 340;

/**
 * The reports behind a ticket, in the list.
 *
 * A ticket is an aggregate - everyone who flagged the same product or image
 * lands on one - and until now the list showed only the aggregate. Who
 * complained and what they wrote is the part a moderator has to read to decide
 * anything, so it belongs next to it rather than a click away.
 *
 * The flags of the whole page are fetched in one request, shared by every row:
 * see useFlagsByTicketIds.
 */
// Takes FieldProps although it reads none of them: Datagrid picks the column's
// label and sortability off the props of its children.
export function TicketFlagsField(_props: FieldProps) {
  const record = useRecordContext<{ id: Identifier }>();
  const { data: tickets } = useListContext();
  const { data, isPending, isError } = useFlagsByTicketIds(
    (tickets ?? []).map((ticket) => ticket.id),
  );

  if (!record) return null;

  if (isPending) {
    return <Skeleton variant="text" width={MAX_WIDTH / 2} />;
  }

  // The list itself is fine - only this column failed, and react-admin has
  // already notified. Saying so beats an empty cell that reads as "no flags".
  if (isError) {
    return (
      <Typography variant="body2" color="text.disabled">
        Flags unavailable
      </Typography>
    );
  }

  const flags = data?.[String(record.id)] ?? [];

  // A moderator sees every flag, so an empty cell here means the ticket
  // outlived its flags. Anyone else sees only their own, which is why their
  // view of a shared ticket can look this thin.
  if (flags.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  return (
    <Stack
      spacing={1}
      divider={<Divider flexItem />}
      sx={{ maxWidth: MAX_WIDTH, py: 0.5 }}
    >
      {flags.map((flag) => (
        <FlagSummary key={flag.id} flag={flag} dense />
      ))}
    </Stack>
  );
}
