import { useState } from "react";
import { Button, Link, Stack, Typography } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Confirm,
  Datagrid,
  DateField,
  List,
  SelectField,
  ShowButton,
  useListContext,
  useNotify,
  useRecordContext,
  useUpdate,
  type FieldProps,
} from "react-admin";
import { flavorChoices } from "./choices";
import { useFlagsByTicketIds } from "./flags";
import { productUrl } from "./flavorUrls";
import type { SuggestedAction } from "./flagActions";
import type { FixQueue, QueueTicket } from "./fixQueues";
import { ProductImagesPanel } from "./ProductImagesPanel";
import { TicketFlagsField } from "./TicketFlagsField";
import { useDropTicket } from "./useDropTicket";

function BarcodeField(_props: FieldProps) {
  const record = useRecordContext<QueueTicket>();
  if (!record?.barcode) return null;
  return (
    <Link
      href={productUrl(record.flavor, record.barcode)}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
    >
      {record.barcode}
      <OpenInNewIcon fontSize="inherit" />
    </Link>
  );
}

/**
 * The queue's fix for a ticket, as one button behind a confirmation.
 *
 * Open Food Facts is asked first and the ticket is closed only once it has
 * accepted, either by the fix's own API call or by a status update after it.
 * Either way the row then leaves the list, without reloading the others.
 */
function FixButton({
  ticket,
  action,
}: {
  ticket: QueueTicket;
  action: SuggestedAction;
}) {
  const notify = useNotify();
  const dropTicket = useDropTicket();
  const [update] = useUpdate();
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);

  const done = () => {
    notify("Done, and the ticket is closed", { type: "info" });
    dropTicket(ticket.id);
  };

  const run = async () => {
    setConfirming(false);
    setRunning(true);
    try {
      await action.run();
    } catch (error) {
      notify((error as Error).message, { type: "error" });
      setRunning(false);
      return;
    }
    if (action.closesTicket) {
      done();
      setRunning(false);
      return;
    }
    update(
      "tickets",
      { id: ticket.id, data: { status: "closed-fixed" } },
      {
        onSuccess: done,
        // The fix went through; only the ticket did not close. Saying so
        // beats a bare failure, which would invite doing it all again.
        onError: (error) =>
          notify(
            `Open Food Facts was updated, but the ticket stayed open: ${(error as Error).message}`,
            { type: "warning" },
          ),
        onSettled: () => setRunning(false),
      },
    );
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color={action.destructive ? "error" : "primary"}
        startIcon={<BoltIcon />}
        disabled={running}
        onClick={() => setConfirming(true)}
        sx={{ whiteSpace: "nowrap" }}
      >
        {action.label}
      </Button>
      <Confirm
        isOpen={confirming}
        title={action.label}
        content={`${action.confirm} The ticket will be closed as fixed.`}
        onConfirm={run}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}

/**
 * Close the ticket without changing project: the report was wrong, or
 * was dealt with some other way. It can be re-opened from the ticket list.
 */
function CloseButton({ ticket }: { ticket: QueueTicket }) {
  const notify = useNotify();
  const dropTicket = useDropTicket();
  const [update, { isPending }] = useUpdate();

  const close = () =>
    update(
      "tickets",
      { id: ticket.id, data: { status: "closed-no-issue" } },
      {
        onSuccess: () => {
          notify("Ticket closed", { type: "info" });
          dropTicket(ticket.id);
        },
        onError: (error) => notify((error as Error).message, { type: "error" }),
      },
    );

  return (
    <Button
      size="small"
      variant="outlined"
      color="inherit"
      startIcon={<CloseIcon />}
      disabled={isPending}
      onClick={close}
      sx={{ whiteSpace: "nowrap" }}
    >
      Close (no issue)
    </Button>
  );
}

/** The row's buttons: the queue's fix, its extra actions, then Close. */
function QueueActions({ queue }: { queue: FixQueue } & Omit<FieldProps, "source">) {
  const record = useRecordContext<QueueTicket>();
  const { data: tickets } = useListContext();
  // One request for the whole page, shared with the Reports column.
  const { data, isPending } = useFlagsByTicketIds(
    (tickets ?? []).map((ticket) => ticket.id),
  );

  if (!record || isPending) return null;

  const flags = data?.[String(record.id)] ?? [];
  const action = queue.fix(record, flags);

  return (
    <Stack direction="column" spacing={1} alignItems="start" flexWrap="nowrap">
      {action ? (
        <FixButton ticket={record} action={action} />
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
          {queue.noFixText}
        </Typography>
      )}
      {(queue.extraActions ?? []).map((Action, index) => (
        <Action key={index} ticket={record} flags={flags} />
      ))}
      <CloseButton ticket={record} />
    </Stack>
  );
}

/**
 * A fix queue's page: its open tickets, and the buttons that deal with each.
 *
 * No filters: it is a work queue, where each ticket gets the queue's fix,
 * one of its extra actions, or is closed. Looking at closed ones goes
 * through the main ticket list.
 */
export function FixQueueList({ queue }: { queue: FixQueue }) {
  return (
    <List
      // Rendered from a custom route, outside the Resource, so the resource
      // has to be named explicitly.
      resource="tickets"
      title={queue.title}
      filter={{ ...queue.filter, status: "open" }}
      // Without a key of its own, the page would share the main ticket
      // list's stored sort and page number.
      storeKey={`tickets.fix.${queue.key}`}
      empty={false}
      exporter={false}
      actions={false}
    >
      <Datagrid
        rowClick={false}
        bulkActionButtons={false}
        // The product's pictures, under the row: what it actually is decides
        // most of these reports.
        expand={<ProductImagesPanel />}
        isRowExpandable={(ticket) => Boolean(ticket.barcode)}
        empty={
          <Typography sx={{ p: 2 }} color="text.secondary">
            {queue.emptyText}
          </Typography>
        }
      >
        <BarcodeField source="barcode" />
        <SelectField source="flavor" label="On" choices={flavorChoices} />
        <DateField
          source="created_at"
          options={{ day: "numeric", month: "short", year: "numeric" }}
        />
        <TicketFlagsField source="flags" label="Reports" sortable={false} />
        <ShowButton label="Details" />
        <QueueActions queue={queue} label="Actions" />
      </Datagrid>
    </List>
  );
}
