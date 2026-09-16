import { useState } from "react";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useRecordContext, type FieldProps } from "react-admin";
import { userUrl } from "./flavorUrls";

/** Displayed size of the thumbnail, in px. */
const SIZE_WIDTH = 100;
const SIZE_HEIGHT = 80;

/**
 * The OFF image server exposes resized copies of every picture next to the
 * original, as `<image_id>.<width>.jpg`. Same transform as the public
 * ImageTicket component, but at 100px: these are table cells, not cards.
 */
function thumbnailUrl(url: string) {
  return url.replace(/\.jpg$/, ".100.jpg");
}

/**
 * The flagged picture of an image ticket, as a thumbnail that opens the
 * full-size original in a dialog, next to who uploaded it and when.
 *
 * Renders an empty cell for the other ticket types: `url` then points at a
 * product or search page, not an image. Also for an image whose URL 404s -
 * moderators delete pictures from the flavor's site, which leaves the
 * ticket (and its now-dangling URL) behind.
 */
// Takes FieldProps although it reads none of them: Datagrid picks the
// column's label and sortability off the props of its children.
export function TicketThumbnailField(_props: FieldProps) {
  const record = useRecordContext<{
    type: string;
    url: string | null;
    barcode: string | null;
    image_id: string | null;
    flavor: string;
    image_uploaded_at?: string | null;
    image_uploader?: string | null
  }>();
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  // Called before the early returns below, and inert until it has all three
  // arguments - so a non-image ticket costs no request.
  const isImage = record?.type === "image";

  if (!record || !isImage || !record.url || failed) return null;

  const alt = record.barcode
    ? `Flagged image of ${record.barcode}`
    : "Flagged image";

  return (
    <>
      <Stack direction="column" spacing={1} alignItems="start">
        <ButtonBase
          onClick={() => setOpen(true)}
          aria-label={`${alt} - open full size`}
          sx={{ borderRadius: 1, flexShrink: 0 }}
        >
          <Box
            component="img"
            src={thumbnailUrl(record.url)}
            alt={alt}
            loading="lazy"
            onError={() => setFailed(true)}
            sx={{
              width: SIZE_WIDTH,
              height: SIZE_HEIGHT,
              objectFit: "contain",
              display: "block",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              backgroundColor: "common.white",
            }}
          />
        </ButtonBase>
        
        {record && (
          <Stack maxWidth={SIZE_WIDTH}>
            {record.image_uploader && (
              <Link color="text.secondary" noWrap
                href={userUrl(record.flavor, record.image_uploader)}>
                {record.image_uploader}
              </Link>
            )}
            {record.image_uploaded_at && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {new Date(record.image_uploaded_at).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
        <DialogContent sx={{ p: 1, backgroundColor: "common.white" }}>
          <Box
            component="img"
            src={record.url}
            alt={alt}
            sx={{
              display: "block",
              
              maxWidth: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
