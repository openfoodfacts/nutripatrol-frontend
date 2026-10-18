import { useState } from "react";
import { Box, DialogContentText, IconButton, Typography } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useQueryClient } from "@tanstack/react-query";
import {
  Confirm,
  useListContext,
  useNotify,
  useRecordContext,
} from "react-admin";
import type { Flag } from "../dataProvider";
import PinnedImagesGrid from "../../components/PinnedImagesGrid";
import {
  Image,
  ImagesContext,
  useImages,
} from "../../components/productImages";
import type { QueueTicket } from "./fixQueues";
import { useFlagsByTicketIds } from "./flags";
import { deleteProductImages } from "./offImages";

/**
 * The pictures the reporters named as copies: the ticket's own image, each
 * flag's image, and the ids each flag adds.
 *
 * Those come from `duplicate_of_image_id`, the key the API takes, from
 * `duplicate_image_ids`, in case it takes the form's list one day, and from
 * the "Duplicate pictures: 1, 2." note the form writes into the comment when
 * the API refuses that list.
 *
 * Images are upload ids ("3") or selected crops ("front_fr"), which the grid
 * resolves to the upload they were cut from.
 */
function reportedDuplicates(ticket: QueueTicket, flags: Flag[]): string[] {
  const ids = new Set<string>();
  const add = (id: unknown) => {
    if (typeof id === "number" && id > 0) ids.add(String(id));
    if (typeof id === "string" && id.trim()) ids.add(id.trim());
  };
  add(ticket.image_id);
  for (const flag of flags) {
    add(flag.image_id);
    const extra = flag.extra_data ?? {};
    add(extra.duplicate_of_image_id);
    if (Array.isArray(extra.duplicate_image_ids)) {
      extra.duplicate_image_ids.forEach(add);
    }
    const note = flag.comment?.match(/Duplicate pictures: ([\d, ]+)/);
    note?.[1].match(/\d+/g)?.forEach(add);
  }
  return [...ids];
}

/**
 * The row's product pictures, the reported copies first, each with its own
 * delete button: the expandable section of the duplicate images queue.
 *
 * Pictures are deleted one at a time: every copy is one of a set, and the
 * moderator keeps one of them, so which ones go is a call per picture. The
 * ticket stays open until the moderator closes it from the row's actions.
 */
export function DuplicateImagesPanel() {
  const record = useRecordContext<QueueTicket>();
  const { data: tickets } = useListContext();
  // One request for the whole page, shared with the Reports column.
  const { data: flagsByTicket } = useFlagsByTicketIds(
    (tickets ?? []).map((ticket) => ticket.id),
  );
  const notify = useNotify();
  const queryClient = useQueryClient();
  // The picture waiting for the moderator to confirm its deletion.
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!record?.barcode) return null;
  const barcode = record.barcode;
  const flags = flagsByTicket?.[String(record.id)] ?? [];

  const deleteImage = async () => {
    if (toDelete === null) return;
    setDeleting(true);
    try {
      await deleteProductImages(barcode, [Number(toDelete)], record.flavor);
      notify(`Image ${toDelete} deleted`, { type: "info" });
      setToDelete(null);
      // The gallery reloads without it.
      await queryClient.invalidateQueries({ queryKey: ["productImages"] });
    } catch (error) {
      notify((error as Error).message, { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ImagesContext barcode={barcode} flavor={record.flavor}>
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Delete the extra copies, keep one, then close the ticket.
        </Typography>
        <PinnedImagesGrid
          pinned={reportedDuplicates(record, flags)}
          pinnedTitle="Reported as duplicates"
          othersTitle="The product's other pictures"
        >
          {(imgid) => (
            <DeletableImage
              imgid={imgid}
              disabled={deleting}
              onDelete={() => setToDelete(imgid)}
            />
          )}
        </PinnedImagesGrid>
      </Box>
      <Confirm
        isOpen={toDelete !== null}
        loading={deleting}
        title={`Delete image ${toDelete}?`}
        content={
          <>
            {toDelete !== null && (
              <Image
                imgid={toDelete}
                width={200}
                fit="contain"
                zoomable={false}
                sx={{ mb: 2 }}
              />
            )}
            <DialogContentText>
              It is removed from Open Food Facts on your behalf. Open Food
              Facts moves it to the trash, so the deletion can be reviewed
              afterwards. The ticket stays open until you close it.
            </DialogContentText>
          </>
        }
        onConfirm={deleteImage}
        onClose={() => setToDelete(null)}
      />
    </ImagesContext>
  );
}

/** A picture with a button to delete it, unless it is already gone. */
function DeletableImage({
  imgid,
  disabled,
  onDelete,
}: {
  imgid: string;
  disabled: boolean;
  onDelete: () => void;
}) {
  const { getImage } = useImages();
  return (
    <Box sx={{ position: "relative" }}>
      <Image imgid={imgid} width={160} showInfo />
      {getImage(imgid) && (
        <IconButton
          size="small"
          aria-label={`Delete picture ${imgid}`}
          title="Delete this picture"
          onClick={onDelete}
          disabled={disabled}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            color: "error.main",
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <DeleteForeverIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
