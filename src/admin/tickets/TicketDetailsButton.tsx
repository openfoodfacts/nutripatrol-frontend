import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from "react-router-dom";
import { ShowBase, useCreatePath, useRecordContext } from "react-admin";
import type { FieldProps } from "react-admin";
import { TicketDetails } from "./TicketShow";

/**
 * Opens the ticket's details on top of the list, so that reading a ticket
 * does not lose the list's page, filters and scroll position. The ticket's
 * own page stays one click away in the dialog's title, for a link to share.
 */
export function TicketDetailsButton(_props: Omit<FieldProps, "source">) {
  const record = useRecordContext();
  const createPath = useCreatePath();
  const [open, setOpen] = useState(false);
  if (!record) return null;

  const close = () => setOpen(false);
  const showPath = createPath({
    resource: "tickets",
    id: record.id,
    type: "show",
  });

  return (
    <>
      <Button
        size="small"
        startIcon={<VisibilityIcon />}
        onClick={() => setOpen(true)}
      >
        Details
      </Button>
      <Dialog
        open={open}
        onClose={close}
        fullWidth
        maxWidth="lg"
        scroll="paper"
        // The dialog is portalled out of the DOM, but React still bubbles its
        // clicks up to the datagrid row it is declared in.
        onClick={(event) => event.stopPropagation()}
      >
        <DialogTitle component={Stack} direction="row" alignItems="center">
          <Typography variant="h6" component="span" flexGrow={1}>
            Ticket
          </Typography>
          <Tooltip title="Open the ticket's page">
            <IconButton component={Link} to={showPath} aria-label="Open the ticket's page">
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={close} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Mounted only while open, so the ticket is fetched on demand -
              and fetched afresh, rather than shown as the list last saw it. */}
          {open && (
            <ShowBase
              resource="tickets"
              id={record.id}
              loading={<Skeleton variant="rectangular" height={240} />}
              error={
                <Typography color="text.disabled" p={2}>
                  The ticket could not be loaded.
                </Typography>
              }
              redirectOnError={false}
            >
              <TicketDetails />
            </ShowBase>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
