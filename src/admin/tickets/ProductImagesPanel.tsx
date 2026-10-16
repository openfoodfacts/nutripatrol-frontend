import { useQuery } from "@tanstack/react-query";
import { Box, Link, Skeleton, Stack, Typography } from "@mui/material";
import { useRecordContext } from "react-admin";
import { flavorSiteUrl, productImageUrl } from "./flavorUrls";

/** Displayed height of a picture, in px. */
const HEIGHT = 160;

/** The part of the product this panel reads. */
interface ProductImages {
  /**
   * Keyed by upload id ("1", "2"...) for the uploaded pictures, and by
   * "front_fr" and the like for the selected crops of them.
   */
  images?: Record<string, { imgid?: string }>;
}

/** The ids of a product's uploaded pictures, newest first. */
function uploadedIds(product: ProductImages | undefined): string[] {
  return Object.keys(product?.images ?? {})
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(b) - Number(a));
}

/**
 * The ids of a product's uploaded pictures, newest first, read from the
 * public product API of its project. Fetches nothing without a barcode.
 */
export function useProductImageIds(flavor: string, barcode: string | null | undefined) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["productImages", flavor, barcode],
    queryFn: async (): Promise<ProductImages | undefined> => {
      const response = await fetch(
        `${flavorSiteUrl(flavor)}/api/v2/product/${encodeURIComponent(barcode!)}?fields=images`,
      );
      if (!response.ok) throw new Error(response.statusText);
      const body = (await response.json()) as { product?: ProductImages };
      return body.product;
    },
    enabled: Boolean(barcode),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return { ids: uploadedIds(data), isPending, isError };
}

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
  const flavor = record?.flavor ?? "off";

  const { ids, isPending, isError } = useProductImageIds(flavor, barcode);

  if (!barcode) return null;

  if (isPending) {
    return (
      <Stack direction="row" spacing={1} sx={{ py: 1 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rectangular" width={HEIGHT} height={HEIGHT} />
        ))}
      </Stack>
    );
  }

  if (isError || ids.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {isError ? "Could not load the product's pictures." : "This product has no pictures."}
      </Typography>
    );
  }

  return (
    // Capped so that a product with dozens of pictures does not push the next
    // rows off screen; the rest are a scroll away.
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      sx={{ py: 1, maxHeight: 300, overflowY: "auto" }}
    >
      {ids.map((imgid) => (
        // Opens the original in a new tab: these are 400px previews, and the
        // label a moderator needs to read is often small print.
        <Link
          key={imgid}
          href={productImageUrl(flavor, barcode, imgid, "full")}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box
            component="img"
            src={productImageUrl(flavor, barcode, imgid, 400)}
            alt={`Picture ${imgid} of ${barcode}`}
            loading="lazy"
            sx={{ height: HEIGHT, borderRadius: 1, display: "block" }}
          />
        </Link>
      ))}
    </Stack>
  );
}
