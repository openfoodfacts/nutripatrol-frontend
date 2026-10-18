import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import { useQueryClient } from "@tanstack/react-query";
import { Confirm, useNotify, useRecordContext } from "react-admin";
import {
  Image,
  Images,
  ImagesContext,
  useImages,
} from "../../components/productImages";
import { deleteProductImages, moveProductImages } from "./offImages";

/** Open Food Facts barcodes are numeric; the API refuses anything else. */
const BARCODE_PATTERN = /^\d{1,30}$/;

interface ProductImagesManagerProps {
  barcode: string;
  flavor: string;
}

/**
 * Every picture of the ticket's product, to select some and delete them, or
 * move them to the product they actually show.
 *
 * Reports often point at one picture when the problem is several: the same
 * photo uploaded three times, or a whole set taken on the wrong product.
 */
export function ProductImagesManager({ barcode, flavor }: ProductImagesManagerProps) {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [moving, setMoving] = useState(false);

  const imgids = selected.map(Number);
  const pictures =
    imgids.length > 1 ? `${imgids.length} pictures` : "this picture";

  const run = async (action: () => Promise<void>, success: string) => {
    setRunning(true);
    try {
      await action();
      notify(success, { type: "info" });
      setSelected([]);
      // The gallery reloads without the pictures that left it.
      await queryClient.invalidateQueries({ queryKey: ["productImages"] });
    } catch (error) {
      notify((error as Error).message, { type: "error" });
    } finally {
      setRunning(false);
    }
  };

  const deleteSelected = async () => {
    setConfirmingDelete(false);
    await run(
      () => deleteProductImages(barcode, imgids, flavor),
      `Deleted ${pictures}`,
    );
  };

  const moveSelected = async (moveTo: string, copyData: boolean) => {
    setMoving(false);
    await run(
      () => moveProductImages(barcode, imgids, moveTo, flavor, copyData),
      `Moved ${pictures} to ${moveTo}`,
    );
  };

  return (
    <ImagesContext
      barcode={barcode}
      flavor={flavor}
      selected={selected}
      onSelectionChange={setSelected}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        mb={2}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          {selected.length === 0
            ? "Select pictures to delete or move them."
            : `${selected.length} selected`}
        </Typography>
        {selected.length > 0 && (
          <Button size="small" color="inherit" onClick={() => setSelected([])}>
            Clear
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<DriveFileMoveIcon />}
          disabled={selected.length === 0 || running}
          onClick={() => setMoving(true)}
        >
          Move to another barcode
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          disabled={selected.length === 0 || running}
          onClick={() => setConfirmingDelete(true)}
        >
          Delete
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ maxHeight: 300, overflow: 'auto' }}>
        <Images>
          {(image) => (
            <Image imgid={image.imgid} width={160} fit="contain" showInfo />
          )}
        </Images>
      </Stack>

      <Confirm
        isOpen={confirmingDelete}
        loading={running}
        title={`Delete ${pictures}?`}
        content={
          <>
            <SelectedPictures />
            <DialogContentText>
              They are removed from Open Food Facts on your behalf. Open Food
              Facts moves them to the trash, so the deletion can be reviewed
              afterwards. The ticket stays as it is.
            </DialogContentText>
          </>
        }
        onConfirm={deleteSelected}
        onClose={() => setConfirmingDelete(false)}
      />
      <MoveDialog
        open={moving}
        barcode={barcode}
        pictures={pictures}
        onMove={moveSelected}
        onClose={() => setMoving(false)}
      />
    </ImagesContext>
  );
}

/**
 * The same, for the ticket of the current record: the expandable section of a
 * ticket list's row. react-admin only mounts it once the row is expanded, so
 * the product is read for the rows a moderator opens, not for every row.
 */
export function ProductImagesManagerPanel() {
  const record = useRecordContext<{ barcode: string | null; flavor: string }>();
  if (!record?.barcode) return null;

  return (
    <Box sx={{ py: 1 }}>
      <ProductImagesManager barcode={record.barcode} flavor={record.flavor} />
    </Box>
  );
}

/**
 * The pictures an action is about to apply to, so the moderator checks them
 * rather than a list of ids.
 */
function SelectedPictures() {
  const { selected } = useImages();
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mb={2}>
      {selected.map((imgid) => (
        <Image
          key={imgid}
          imgid={imgid}
          resolution={100}
          width={80}
          fit="contain"
          selectable={false}
          zoomable={false}
        />
      ))}
    </Stack>
  );
}

/** Asks for the barcode to move the selected pictures to. */
function MoveDialog({
  open,
  barcode,
  pictures,
  onMove,
  onClose,
}: {
  open: boolean;
  barcode: string;
  pictures: string;
  onMove: (moveTo: string, copyData: boolean) => void;
  onClose: () => void;
}) {
  const [moveTo, setMoveTo] = useState("");
  const [copyData, setCopyData] = useState(false);

  const target = moveTo.trim();
  const error = !target
    ? undefined
    : !BARCODE_PATTERN.test(target)
      ? "A barcode is made of digits only"
      : target === barcode
        ? "That is this product's barcode"
        : undefined;
  const canMove = Boolean(target) && !error;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canMove) onMove(target, copyData);
        }}
      >
        <DialogTitle>Move {pictures}</DialogTitle>
        <DialogContent>
          <SelectedPictures />
          <DialogContentText sx={{ mb: 2 }}>
            For pictures uploaded on the wrong product. Open Food Facts creates
            the destination product if it does not exist yet.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Destination barcode"
            value={moveTo}
            onChange={(event) => setMoveTo(event.target.value)}
            error={Boolean(error)}
            helperText={error ?? " "}
            inputProps={{ inputMode: "numeric" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={copyData}
                onChange={(event) => setCopyData(event.target.checked)}
              />
            }
            label="If it is created, copy this product's data onto it"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!canMove}>
            Move
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
