import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Confirm,
  List,
  RecordContextProvider,
  SelectInput,
  useListContext,
  useNotify,
  useRecordContext,
  useRefresh,
  useUpdate,
} from "react-admin";
import { TicketThumbnailField } from "./TicketThumbnailField";
import { productUrl } from "./flavorUrls";
import { deleteProductImage, uploadedImageId } from "./offImages";
import { statusChoices } from "./choices";

/** What this page reads off a ticket. */
interface Ticket {
  id: number;
  barcode: string | null;
  status: string;
  image_id: string | null;
  flavor: string;
}

/**
 * The two answers this queue exists to give, as buttons.
 *
 * Deleting the picture also closes the ticket, because the two are one
 * decision: a moderator who removed the image has dealt with the report, and
 * leaving it open would hand the same picture to the next moderator.
 *
 * Only while the ticket is open: once it is closed, the decision has been
 * made, and the only thing left to offer is taking it back.
 */
function ImageReviewActions() {
  const record = useRecordContext<Ticket>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [update] = useUpdate();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (!record) return null;

  const imgid = uploadedImageId(record.image_id);
  // A selected image ("front_fr") names a crop rather than a file, and a
  // search ticket has no product at all - neither can be deleted.
  const deletable = record.barcode !== null && imgid !== null;

  const NOTIFICATIONS = {
    "closed-fixed": "Image deleted, ticket closed",
    "closed-no-issue": "Ticket closed",
    open: "Ticket re-opened",
  };

  const setStatus = (status: keyof typeof NOTIFICATIONS) =>
    update(
      "tickets",
      { id: record.id, data: { status }, previousData: record },
      {
        onSuccess: () => {
          notify(NOTIFICATIONS[status], { type: "info" });
          // The list is filtered by status, so the ticket just acted on
          // usually leaves it - which is the point of a queue.
          refresh();
        },
        onError: (error) => notify((error as Error).message, { type: "error" }),
      },
    );

  const deleteImage = async () => {
    setConfirming(false);
    setDeleting(true);
    try {
      await deleteProductImage(record.barcode!, imgid!, record.flavor);
      // Only once Open Food Facts has accepted the deletion: closing a ticket
      // whose picture is still up would lose the report.
      setStatus("closed-fixed");
    } catch (error) {
      notify((error as Error).message, { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // A closed ticket has already been answered - re-opening it is the way
  // back to the two buttons below, rather than a decision of its own.
  if (record.status !== "open") {
    return (
      <Button
        variant="outlined"
        color="warning"
        startIcon={<SettingsBackupRestoreIcon />}
        onClick={() => setStatus("open")}
      >
        Re-open
      </Button>
    );
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<NotInterestedIcon />}
        disabled={deleting}
        onClick={() => setStatus("closed-no-issue")}
      >
        Ignore
      </Button>
      {/* Tooltip on a wrapper, not the button: a disabled button fires no
          pointer events, so the explanation would never show. */}
      <Tooltip
        title={
          deletable
            ? ""
            : "This ticket does not name an uploaded image, so there is nothing to delete"
        }
      >
        <span>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteForeverIcon />}
            disabled={!deletable || deleting}
            onClick={() => setConfirming(true)}
          >
            Delete image
          </Button>
        </span>
      </Tooltip>
      <Confirm
        isOpen={confirming}
        loading={deleting}
        title="Delete this image?"
        content="It is removed from Open Food Facts on your behalf, and this ticket is closed. Open Food Facts moves the picture to the trash, so the deletion can be reviewed afterwards."
        onConfirm={deleteImage}
        onClose={() => setConfirming(false)}
      />
    </Stack>
  );
}

/** One reported picture, and what can be done about it. */
function ImageReviewCard() {
  const record = useRecordContext<Ticket>();
  if (!record) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          {/* The picture, with its uploader and upload date underneath -
              already what this field draws in the full ticket list. */}
          <TicketThumbnailField source="url" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {record.barcode ? (
              <Link
                href={productUrl(record.flavor, record.barcode)}
                target="_blank"
                rel="noopener noreferrer"
                variant="subtitle1"
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
              >
                {record.barcode}
                <OpenInNewIcon fontSize="inherit" />
              </Link>
            ) : (
              <Typography variant="subtitle1" color="text.secondary">
                No product
              </Typography>
            )}
          </Box>
          <ImageReviewActions />
        </Stack>
      </CardContent>
    </Card>
  );
}

/** The cards, in place of the ticket table. */
function ImageReviewList() {
  const { data, isPending } = useListContext<Ticket>();
  if (isPending || !data) return null;
  if (data.length === 0) {
    return (
      <Typography sx={{ p: 2 }} color="text.secondary">
        Nothing to review here.
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {data.map((ticket) => (
        // Gives each card the record context the fields and buttons read,
        // the way Datagrid does for a row.
        <RecordContextProvider key={ticket.id} value={ticket}>
          <ImageReviewCard />
        </RecordContextProvider>
      ))}
    </Stack>
  );
}

// Status is the only filter kept: the point of this page is a queue to work
// through, and the rest of the ticket filters only get in the way. It is
// still a filter rather than a fixed value, so that a moderator can look at
// what they closed.
const filters = [
  <SelectInput key="status" source="status" choices={statusChoices} />,
];

/**
 * The inappropriate-images queue.
 *
 * A deliberately reduced view of the same tickets the main list shows: the
 * picture, who uploaded it and when, the product it is on, and the only two
 * answers this kind of report has - leave it alone, or take it down. The
 * columns the full list carries (type, flavor, status, dates) are all
 * constant or irrelevant once the question is just "should this picture
 * stay?".
 *
 * Pinned to image tickets: a product flagged as inappropriate has no picture
 * to show or delete, and is dealt with from the main ticket list.
 */
export function InappropriateTicketList() {
  return (
    <List
      // Rendered from a custom route, outside the Resource, so the resource
      // has to be named explicitly.
      resource="tickets"
      title="Inappropriate images"
      filter={{ reason: ["inappropriate"], type: "image" }}
      // Open first: this is a work queue, and a ticket acted on here leaves
      // the list.
      filterDefaultValues={{ status: "open" }}
      filters={filters}
      // Without a key of its own, the page would share the main ticket
      // list's stored filters, sort and page number.
      storeKey="tickets.inappropriate-images"
      // The default empty page hides the filter bar, which would leave a
      // moderator on a blank screen with no hint that a filter is applied.
      empty={false}
      // The default toolbar's Export button downloads the current page as
      // CSV; nothing here is meant to leave the moderation tool.
      exporter={false}
    >
      <ImageReviewList />
    </List>
  );
}
