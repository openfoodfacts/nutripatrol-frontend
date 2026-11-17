import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from "react-router-dom";
import { ShowBase, useCreatePath, useRecordContext } from "react-admin";
import type { FieldProps } from "react-admin";
import { productUrl } from "./flavorUrls";
import { TicketDetails } from "./TicketShow";

/**
 * The ways to look closer at a ticket, behind a single "Details" menu shaped
 * like the Actions one: the ticket itself, and its product on Open Food Facts.
 *
 * The ticket opens in a dialog on top of the list, so that reading it does
 * not lose the list's page, filters and scroll position. Its own page stays
 * one click away in the dialog's title, for a link to share.
 */
export function TicketDetailsButton(_props: Omit<FieldProps, "source">) {
  const record = useRecordContext();
  const createPath = useCreatePath();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!record) return null;

  const close = () => setOpen(false);
  const closeMenu = () => setAnchor(null);
  // Search tickets carry no barcode, so there is no product to open.
  const barcode: string | null = record.barcode;
  const showPath = createPath({
    resource: "tickets",
    id: record.id,
    type: "show",
  });

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        endIcon={<ArrowDropDownIcon />}
        aria-haspopup="menu"
        aria-expanded={anchor ? "true" : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Details
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu();
            setOpen(true);
          }}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ticket</ListItemText>
        </MenuItem>
        {/* An anchor rather than a handler, so the product opens in a new
            tab and the moderator keeps their place in the list. Editing it
            stays under Actions. */}
        <MenuItem
          component="a"
          href={barcode ? productUrl(record.flavor, barcode) : undefined}
          disabled={!barcode}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>See product</ListItemText>
        </MenuItem>
      </Menu>
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
