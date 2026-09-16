import * as React from 'react';
import { Button, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import CheckIcon from "@mui/icons-material/Check";
import {
  useRecordContext,
  useUpdate,
  useNotify,
  type FieldProps,
  usePermissions,
} from "react-admin";
import { productEditUrl } from "./flavorUrls";

interface Ticket {
  id: number;
  barcode: string | null;
  status: string;
  flavor: string;
}

/**
 * Per-row moderation actions, mirroring the public moderation page's button
 * group (see components/TicketsButtons).
 *
 * "No problem" and "I fixed it!" both close the ticket - the API has a
 * single `closed` status - but stay separate because they describe why the
 * moderator closed it.
 */
export function TicketActionsField(_props: Omit<FieldProps, "source">) {
  const record = useRecordContext<Ticket>();
  const notify = useNotify();
  const [update, { isPending }] = useUpdate();
  const { permissions } = usePermissions();
  if (!record) return null;

  const updateStatus = (newStatus: "closed-no-issue" | "closed-fixed" | "open") =>
    update(
      "tickets",
      { id: record.id, data: { status: newStatus }, previousData: record },
      {
        onSuccess: () => notify(newStatus === 'open' ? 'Ticker re-opened' : "Ticket closed", { type: "info" }),
        onError: (error) =>
          notify((error as Error).message, { type: "error" }),
      },
    );

  const open = record.status === "open";

  return (
    // Stops the buttons from wrapping into a column on a narrow window,
    // where the cell would grow taller than the thumbnail next to it.
    <Stack direction="row" spacing={1} flexWrap="nowrap">
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<EditIcon />}
        // Rendered as an anchor so the moderator can open the product in a
        // new tab and keep their place in the list.
        component="a"
        href={record.barcode ? productEditUrl(record.flavor, record.barcode) : undefined}
        // Search tickets carry no barcode, so there is no product to edit.
        disabled={!record.barcode}
        target="_blank"
        rel="noopener noreferrer"
      >
        Edit
      </Button>

      {permissions !== 'moderator' ? null : open ? <React.Fragment>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<NotInterestedIcon />}
          disabled={isPending}
          onClick={() => updateStatus('closed-no-issue')}
        >
          No problem
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<CheckIcon />}
          disabled={isPending}
          onClick={() => updateStatus('closed-fixed')}
        >
          I fixed it!
        </Button>
      </React.Fragment> : <Button
        size="small"
        variant="outlined"
        color="warning"
        startIcon={<SettingsBackupRestoreIcon />}
        disabled={isPending}
        onClick={() => updateStatus('open')}
      >
        Re Open
      </Button>}
    </Stack>
  );
}
