import { useState, type ReactNode } from "react";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { productImageUrl, userUrl } from "../../admin/tickets/flavorUrls";
import { useImages, type ProductImage } from "./useImages";

interface ImageProps {
  imgid: string;
  /** Width of the thumbnail on the image server. The modal shows the original. */
  resolution?: 100 | 400 | "full";
  /** The shape the picture is shown in. `height` defaults to `width`. */
  width?: number | string;
  height?: number | string;
  /**
   * "cover" fills the shape, cropping what overflows; "contain" shows the
   * whole picture inside it, leaving the rest empty.
   */
  fit?: "cover" | "contain";
  /** Shown in place of a picture that cannot be loaded - deleted, usually. */
  notFound?: ReactNode;
  /** Show the select button. Defaults to the `<ImagesContext>`'s setting. */
  selectable?: boolean;
  /** Drawn over the picture while it is selected, e.g. a "Duplicate" chip. */
  renderSelected?: (image: ProductImage | undefined) => ReactNode;
  /** Applied to the picture's frame while it is selected. */
  selectedSx?: SxProps<Theme>;
  /** Clicking the picture opens it full size in a modal. */
  zoomable?: boolean;
  /** Show the uploader and the upload date under the picture. */
  showInfo?: boolean;
  alt?: string;
  sx?: SxProps<Theme>;
}

/**
 * One picture of the product of the closest `<ImagesContext>`, with a
 * skeleton while it loads, a select button and a full size view.
 */
export function Image({
  imgid,
  resolution = 400,
  width = 160,
  height = width,
  fit = "cover",
  notFound,
  selectable,
  renderSelected,
  selectedSx,
  zoomable = true,
  showInfo = false,
  alt,
  sx,
}: ImageProps) {
  const context = useImages();
  const { barcode, flavor, isPending } = context;
  const image = context.getImage(imgid);
  const canSelect = selectable ?? context.selectable;
  const isSelected = canSelect && context.isSelected(imgid);
  const toggle = () => context.toggleSelected(imgid);

  const [open, setOpen] = useState(false);
  const src = productImageUrl(flavor, barcode, imgid, resolution);
  // Kept by URL so that showing another picture starts over.
  const [failedSrc, setFailedSrc] = useState<string>();

  // The picture can be requested before the product's data arrives: its URL
  // only needs the id. The data only tells whether it still exists - for an
  // upload, that is: a selected crop ("front_fr") is not listed among them.
  const isMissing =
    /^\d+$/.test(imgid) && context.hasData && image === undefined;
  const isUnavailable = isMissing || failedSrc === src;
  const label = alt ?? `Picture ${imgid} of ${barcode}`;

  const onClick = zoomable ? () => setOpen(true) : canSelect ? toggle : undefined;

  return (
    <Box sx={[{ width }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        sx={[
          {
            position: "relative",
            width,
            height,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "action.hover",
            outline: "3px solid",
            outlineColor: isSelected ? "primary.main" : "transparent",
          },
          ...(isSelected
            ? Array.isArray(selectedSx)
              ? selectedSx
              : [selectedSx]
            : []),
        ]}
      >
        {isUnavailable ? (
          (notFound ?? <DefaultNotFound imgid={imgid} />)
        ) : (
          <>
            <LoadingImg
              key={src}
              src={src}
              alt={label}
              fit={fit}
              onError={() => setFailedSrc(src)}
            />
            {onClick && (
              <ButtonBase
                onClick={onClick}
                aria-label={zoomable ? `Enlarge ${label}` : label}
                aria-pressed={zoomable ? undefined : isSelected}
                sx={{ position: "absolute", inset: 0 }}
              />
            )}
          </>
        )}
        {isSelected && renderSelected && (
          // Under the select button, and letting clicks through to the picture.
          <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {renderSelected(image)}
          </Box>
        )}
        {canSelect && (
          <IconButton
            size="small"
            onClick={toggle}
            aria-pressed={isSelected}
            aria-label={isSelected ? `Unselect ${label}` : `Select ${label}`}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            {isSelected ? (
              <CheckCircleIcon fontSize="small" color="primary" />
            ) : (
              <RadioButtonUncheckedIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>

      {showInfo && <ImageInfo image={image} isPending={isPending} />}

      {zoomable && (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ pr: 6 }}>
            Picture {imgid}
            <IconButton
              onClick={() => setOpen(false)}
              aria-label="Close"
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ position: "relative", height: "75vh" }}>
              <LoadingImg
                key={imgid}
                src={productImageUrl(flavor, barcode, imgid, "full")}
                alt={label}
                fit="contain"
              />
            </Box>
            <ImageInfo image={image} isPending={isPending} />
          </DialogContent>
          <DialogActions>
            <Button
              href={productImageUrl(flavor, barcode, imgid, "full")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the original
            </Button>
            {canSelect && (
              <Button
                variant={isSelected ? "outlined" : "contained"}
                onClick={toggle}
              >
                {isSelected ? "Unselect" : "Select"}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

/** An `<img>` filling its positioned parent, with a skeleton until it loads. */
function LoadingImg({
  src,
  alt,
  fit,
  onError,
}: {
  src: string;
  alt: string;
  fit: "cover" | "contain";
  onError?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={onError}
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: fit,
          opacity: loaded ? 1 : 0,
        }}
      />
    </>
  );
}

function DefaultNotFound({ imgid }: { imgid: string }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={0.5}
      sx={{ height: "100%", p: 1, color: "text.disabled", textAlign: "center" }}
    >
      <BrokenImageOutlinedIcon />
      <Typography variant="caption">Picture {imgid} is no longer available</Typography>
    </Stack>
  );
}

/** Who uploaded the picture and when, and the crops made from it. */
function ImageInfo({
  image,
  isPending,
}: {
  image: ProductImage | undefined;
  isPending: boolean;
}) {
  const { flavor } = useImages();

  if (isPending) return <Skeleton variant="text" width="80%" />;
  if (!image) return null;

  return (
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {image.uploader ? (
          <Link
            href={userUrl(flavor, image.uploader)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {image.uploader}
          </Link>
        ) : (
          "Unknown uploader"
        )}
        {image.uploadedAt && ` · ${image.uploadedAt.toLocaleDateString()}`}
        {image.width && image.height && ` · ${image.width}×${image.height}`}
      </Typography>
      {image.selectedAs.length > 0 && (
        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
          {image.selectedAs.map((key) => (
            <Chip key={key} label={key} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
