import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
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
import type { Flag } from "../dataProvider";
import ImageToggleGrid from "../../components/ImageToggleGrid";
import { useFlagsByTicketIds } from "./flags";
import { productUrl } from "./flavorUrls";
import { useProductImageIds } from "./ProductImagesPanel";
import { deleteProductImages, uploadedImageId } from "./offImages";
import { statusChoices } from "./choices";
import { TicketFlagsField } from "./TicketFlagsField";

/** Path of the page. Outside "/tickets/*", which the Resource owns. */
export const DUPLICATE_IMAGES_PATH = "/duplicate-images";

/** What this page reads off a ticket. */
interface Ticket {
  id: number;
  barcode: string | null;
  status: string;
  image_id: string | null;
  flavor: string;
}

/**
 * The pictures the reporters named as copies, as upload ids: the ticket's own
 * image, plus whatever each flag's extra data lists. `duplicate_of_image_id`
 * is what the API has accepted from the start, `duplicate_image_ids` what the
 * form sends now.
 */
function reportedDuplicates(ticket: Ticket, flags: Flag[]): string[] {
  const ids = new Set<number>();
  const own = uploadedImageId(ticket.image_id);
  if (own !== null) ids.add(own);
  for (const flag of flags) {
    const extra = flag.extra_data ?? {};
    const listed = Array.isArray(extra.duplicate_image_ids)
      ? extra.duplicate_image_ids
      : [];
    for (const id of [...listed, extra.duplicate_of_image_id]) {
      const imgid = uploadedImageId(id == null ? null : String(id));
      if (imgid !== null) ids.add(imgid);
    }
  }
  return [...ids].map(String);
}

/**
 * The product's pictures, the reported copies first, and the two answers a
 * duplicate report has: delete the extra copies, or leave them.
 *
 * The reported copies start selected, since that is what the reporters asked
 * for. The moderator unticks the one to keep: every copy is one of a set, and
 * deleting them all would leave the product without the picture.
 */
function DuplicateImagesCard({ flags }: { flags: Flag[] }) {
  const record = useRecordContext<Ticket>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [update] = useUpdate();
  // Null until the moderator clicks a picture: until then the selection
  // follows the reports, which arrive after the ticket.
  const [picked, setPicked] = useState<number[] | null>(null);
  // The same query the grid makes, so it costs nothing more.
  const { ids: productIds } = useProductImageIds(
    record?.flavor ?? "off",
    record?.barcode,
  );
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (!record) return null;

  // Reported ids the product no longer has are left out: they are not shown,
  // so they must not be deleted unseen.
  const selected =
    picked ??
    reportedDuplicates(record, flags)
      .filter((imgid) => productIds.includes(imgid))
      .map(Number);

  const NOTIFICATIONS = {
    "closed-fixed": "Images deleted, ticket closed",
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

  const deleteImages = async () => {
    setConfirming(false);
    setDeleting(true);
    try {
      await deleteProductImages(record.barcode!, selected, record.flavor);
      setPicked([]);
      // Only once Open Food Facts has accepted the deletion: closing a ticket
      // whose pictures are still up would lose the report.
      setStatus("closed-fixed");
    } catch (error) {
      notify((error as Error).message, { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const plural = selected.length > 1 ? "s" : "";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "flex-start" }}
          >
            <Box sx={{ minWidth: 0 }}>
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
              {/* Who reported it and what they wrote. */}
              <TicketFlagsField source="flags" />
            </Box>

            {record.status !== "open" ? (
              // A closed ticket has already been answered - re-opening it is
              // the way back to the buttons.
              <Button
                variant="outlined"
                color="warning"
                startIcon={<SettingsBackupRestoreIcon />}
                onClick={() => setStatus("open")}
              >
                Re-open
              </Button>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<NotInterestedIcon />}
                  disabled={deleting}
                  onClick={() => setStatus("closed-no-issue")}
                >
                  Not duplicates
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  disabled={!record.barcode || selected.length === 0 || deleting}
                  onClick={() => setConfirming(true)}
                >
                  {selected.length > 0
                    ? `Delete ${selected.length} image${plural}`
                    : "Delete images"}
                </Button>
              </Stack>
            )}
          </Stack>

          {record.barcode && (
            <>
              <Typography variant="body2" color="text.secondary">
                The copies the reporters named are selected. Unselect the one to keep.
              </Typography>
              <ImageToggleGrid
                barcode={record.barcode}
                flavor={record.flavor}
                pinned={reportedDuplicates(record, flags)}
                pinnedTitle="Reported as duplicates"
                othersTitle="The product's other pictures"
                selected={selected}
                onChange={setPicked}
                badge="Delete"
              />
            </>
          )}
        </Stack>
        <Confirm
          isOpen={confirming}
          loading={deleting}
          title={`Delete ${selected.length} image${plural}?`}
          content={`Image${plural} ${selected.join(", ")} of ${record.barcode} will be removed from Open Food Facts on your behalf, and this ticket closed. Open Food Facts moves them to the trash, so the deletion can be reviewed afterwards.`}
          onConfirm={deleteImages}
          onClose={() => setConfirming(false)}
        />
      </CardContent>
    </Card>
  );
}

/** The cards, in place of the ticket table. */
function DuplicateImagesCards() {
  const { data, isPending } = useListContext<Ticket>();
  // One request for the flags of the whole page, shared with
  // TicketFlagsField, which asks for the same ids.
  const { data: flagsByTicket } = useFlagsByTicketIds(
    (data ?? []).map((ticket) => ticket.id),
  );
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
        <RecordContextProvider key={ticket.id} value={ticket}>
          <DuplicateImagesCard flags={flagsByTicket?.[String(ticket.id)] ?? []} />
        </RecordContextProvider>
      ))}
    </Stack>
  );
}

// Status only: this is a queue to work through, still a filter so that a
// moderator can look at what they closed.
const filters = [
  <SelectInput key="status" source="status" choices={statusChoices} />,
];

/**
 * The duplicate-images queue: one card per reported product, with all its
 * pictures, the ones reported as copies on top.
 */
export function DuplicateImagesTicketList() {
  return (
    <List
      // Rendered from a custom route, outside the Resource, so the resource
      // has to be named explicitly.
      resource="tickets"
      title="Duplicate images"
      filter={{ reason: ["duplicate"] }}
      filterDefaultValues={{ status: "open" }}
      filters={filters}
      // Without a key of its own, the page would share the main ticket
      // list's stored filters, sort and page number.
      storeKey="tickets.duplicate-images"
      // The default empty page hides the filter bar.
      empty={false}
      exporter={false}
    >
      <DuplicateImagesCards />
    </List>
  );
}
