import * as React from 'react';
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EditIcon from "@mui/icons-material/Edit";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import CheckIcon from "@mui/icons-material/Check";
import CommentIcon from "@mui/icons-material/Comment";
import {
  useRecordContext,
  useUpdate,
  useNotify,
  type FieldProps,
  usePermissions,
} from "react-admin";
import { CommentDialog } from "./CommentDialog";
import { productEditUrl } from "./flavorUrls";

interface Ticket {
  id: number;
  barcode: string | null;
  status: string;
  flavor: string;
}

/**
 * Per-ticket moderation actions, behind a single "Actions" menu so the list
 * column stays narrow.
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
  const [commenting, setCommenting] = React.useState(false);
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  if (!record) return null;

  const closeMenu = () => setAnchor(null);

  const updateStatus = (newStatus: "closed-no-issue" | "closed-fixed" | "open") => {
    closeMenu();
    update(
      "tickets",
      { id: record.id, data: { status: newStatus }, previousData: record },
      {
        onSuccess: () => notify(newStatus === 'open' ? 'Ticket re-opened' : "Ticket closed", { type: "info" }),
        onError: (error) =>
          notify((error as Error).message, { type: "error" }),
      },
    );
  };

  const moderator = permissions === 'moderator';
  const open = record.status === "open";

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        endIcon={<ArrowDropDownIcon />}
        disabled={isPending}
        aria-haspopup="menu"
        aria-expanded={anchor ? "true" : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Actions
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu}>
        <MenuItem
          // Rendered as an anchor so the moderator can open the product in a
          // new tab and keep their place in the list.
          component="a"
          href={record.barcode ? productEditUrl(record.flavor, record.barcode) : undefined}
          // Search tickets carry no barcode, so there is no product to edit.
          disabled={!record.barcode}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit product</ListItemText>
        </MenuItem>

        {moderator && open && [
          <MenuItem key="no-issue" onClick={() => updateStatus('closed-no-issue')}>
            <ListItemIcon><NotInterestedIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>No problem</ListItemText>
          </MenuItem>,
          <MenuItem key="fixed" onClick={() => updateStatus('closed-fixed')}>
            <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>I fixed it!</ListItemText>
          </MenuItem>,
          <MenuItem
            key="comment"
            onClick={() => {
              closeMenu();
              setCommenting(true);
            }}
          >
            <ListItemIcon><CommentIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Comment…</ListItemText>
          </MenuItem>,
        ]}

        {moderator && !open && (
          <MenuItem onClick={() => updateStatus('open')}>
            <ListItemIcon><SettingsBackupRestoreIcon fontSize="small" color="warning" /></ListItemIcon>
            <ListItemText>Re-open</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Outside the menu, so it stays mounted once the menu closes. */}
      {moderator && open && (
        <CommentDialog
          ticketId={record.id}
          open={commenting}
          onClose={() => setCommenting(false)}
        />
      )}
    </>
  );
}
