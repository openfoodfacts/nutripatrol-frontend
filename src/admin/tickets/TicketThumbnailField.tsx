import { Link, Stack, Typography } from "@mui/material";
import { useRecordContext, type FieldProps } from "react-admin";
import { Image, ImagesContext } from "../../components/productImages";
import { userUrl } from "./flavorUrls";

/** Displayed size of the thumbnail, in px. */
const SIZE_WIDTH = 100;
const SIZE_HEIGHT = 80;

/**
 * The id the image server files the ticket's picture by: the URL's file name,
 * so "3" for an upload, or "front_fr.12" for revision 12 of a selected crop.
 * Read from the URL rather than `image_id`, which leaves the revision out.
 */
function imageFileId(url: string): string | null {
  return url.match(/\/([^/]+)\.jpg$/)?.[1] ?? null;
}

/**
 * The flagged picture of an image ticket, as a thumbnail that opens the
 * full-size original in a dialog, next to who uploaded it and when.
 *
 * Renders an empty cell for the other ticket types: `url` then points at a
 * product or search page, not an image. An image whose URL 404s - moderators
 * delete pictures from the flavor's site, which leaves the ticket (and its
 * now-dangling URL) behind - shows as no longer available.
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

  const imgid = record?.url ? imageFileId(record.url) : null;
  if (!record || record.type !== "image" || !record.barcode || !imgid) {
    return null;
  }

  return (
    // The ticket already says who uploaded the picture and when, so there is
    // no need for a product request per row.
    <ImagesContext barcode={record.barcode} flavor={record.flavor} loadData={false}>
      <Stack direction="column" spacing={1} alignItems="start">
        <Image
          imgid={imgid}
          resolution={100}
          width={SIZE_WIDTH}
          height={SIZE_HEIGHT}
          fit="contain"
          alt={`Flagged image of ${record.barcode}`}
        />
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
      </Stack>
    </ImagesContext>
  );
}
