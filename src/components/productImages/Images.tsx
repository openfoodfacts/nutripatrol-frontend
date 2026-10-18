import { Fragment, type ReactNode } from "react";
import { Skeleton, Typography } from "@mui/material";
import { useImages } from "./useImages";
import type { ProductImage } from "./useImages";

interface ImagesProps {
  /** Renders one picture: `<Images>{(image) => <Image imgid={image.imgid} />}</Images>`. */
  children: (image: ProductImage, index: number) => ReactNode;
  /** Keeps only the pictures it returns true for. */
  filter?: (image: ProductImage) => boolean;
  /** Shown while the product's pictures are loading. */
  loading?: ReactNode;
  /** Shown when the product has no pictures (or none left by `filter`). */
  empty?: ReactNode;
  /** Shown when the product's pictures could not be loaded. */
  error?: ReactNode;
}

const defaultLoading = [0, 1, 2].map((i) => (
  <Skeleton key={i} variant="rectangular" width={160} height={160} />
));

/**
 * The pictures of the product of the closest `<ImagesContext>`, newest first,
 * each one rendered by `children`.
 *
 * It renders them side by side with no wrapper, so the layout is the
 * parent's: put it in a `<Stack direction="row">` or a grid.
 */
export function Images({
  children,
  filter,
  loading = defaultLoading,
  empty = (
    <Typography variant="body2" color="text.secondary">
      This product has no pictures.
    </Typography>
  ),
  error = (
    <Typography variant="body2" color="text.secondary">
      Could not load the product's pictures.
    </Typography>
  ),
}: ImagesProps) {
  const { images, isPending, isError } = useImages();

  if (isPending) return loading;
  if (isError) return error;

  const shown = filter ? images.filter(filter) : images;
  if (shown.length === 0) return empty;

  return shown.map((image, index) => (
    <Fragment key={image.imgid}>{children(image, index)}</Fragment>
  ));
}
