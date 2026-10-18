import { Stack } from "@mui/material";
import { useRecordContext } from "react-admin";
import { Image, Images, ImagesContext } from "../../components/productImages";

/** Displayed height of a picture, in px. */
const HEIGHT = 160;

/**
 * Every picture of the row's product, in the row's expandable section: they
 * show what the product actually is, which is what a moderator needs to see
 * before moving it to another project or closing the report.
 *
 * Read from the public product API of the ticket's project, and only once the
 * row is expanded - react-admin mounts this panel on expansion.
 */
export function ProductImagesPanel() {
  const record = useRecordContext<{ barcode: string | null; flavor: string }>();
  const barcode = record?.barcode;

  if (!barcode) return null;

  return (
    <ImagesContext barcode={barcode} flavor={record.flavor ?? "off"}>
      {/* Capped so that a product with dozens of pictures does not push the
          next rows off screen; the rest are a scroll away. */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{ py: 1, maxHeight: 300, overflowY: "auto" }}
      >
        <Images>
          {/* The label a moderator needs to read is often small print: a
              click opens the original. */}
          {(image) => (
            <Image imgid={image.imgid} width={HEIGHT} fit="contain" showInfo />
          )}
        </Images>
      </Stack>
    </ImagesContext>
  );
}
