import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PreviewIcon from "@mui/icons-material/Preview";
import { productUrl } from "./flavorUrls";

/** One product page, with a header saying which one it is. */
function ProductFrame({ flavor, barcode }: { flavor: string; barcode: string }) {
  const url = productUrl(flavor, barcode);
  return (
    <Stack flex={1} minWidth={0}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 0.5 }}>
        <Typography variant="subtitle2" noWrap flexGrow={1}>
          {barcode}
        </Typography>
        <Button
          size="small"
          endIcon={<OpenInNewIcon fontSize="inherit" />}
          href={url}
          target="_blank"
          rel="noopener"
        >
          New tab
        </Button>
      </Stack>
      <Box
        component="iframe"
        src={url}
        title={`Product ${barcode}`}
        // Read-only on purpose: the frame is for checking, and the session
        // cookie it would need to edit belongs to the moderator's own tab.
        sandbox="allow-scripts allow-same-origin allow-popups"
        sx={{ flex: 1, border: 0, borderTop: 1, borderColor: "divider", width: "100%" }}
      />
    </Stack>
  );
}

/**
 * A look at the product page without leaving the moderation list.
 *
 * Open Food Facts pages are embedded as they are, rather than rebuilt from
 * the API, so the moderator sees exactly what a visitor sees. A second
 * barcode splits the dialog in two, for the reports that are about two
 * products at once - a duplicate, a wrong barcode.
 */
export function ProductPreviewButton({
  flavor,
  barcode,
}: {
  flavor: string;
  barcode: string;
}) {
  const [open, setOpen] = useState(false);
  const [other, setOther] = useState("");
  const compareWith = /^\d{4,30}$/.test(other) && other !== barcode ? other : null;

  return (
    <>
      <Tooltip title="Preview the product">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <PreviewIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { height: "90vh" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}>
          <Typography variant="h6" component="span" flexGrow={1}>
            Product preview
          </Typography>
          <TextField
            label="Compare with barcode"
            value={other}
            onChange={(event) => setOther(event.target.value.trim())}
            size="small"
            variant="outlined"
            margin="none"
            fullWidth={false}
            sx={{ width: "14rem" }}
          />
          <IconButton aria-label="Close" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: "flex" }}>
          <Stack direction="row" flex={1} divider={<Box sx={{ borderLeft: 1, borderColor: "divider" }} />}>
            <ProductFrame flavor={flavor} barcode={barcode} />
            {compareWith && <ProductFrame flavor={flavor} barcode={compareWith} />}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
