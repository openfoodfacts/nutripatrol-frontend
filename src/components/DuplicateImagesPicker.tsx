import { Box, ButtonBase, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { useProductImageIds } from '../admin/tickets/ProductImagesPanel';
import { productImageUrl } from '../admin/tickets/flavorUrls';

/** Displayed size of a picture, in px. */
const SIZE = 160;

interface DuplicateImagesPickerProps {
    barcode: string;
    flavor: string;
    /** The image being reported, shown first. Absent on a product report. */
    flaggedImageId?: string;
    /** The ids of the pictures marked as duplicates. */
    selected: number[];
    onChange: (selected: number[]) => void;
}

/**
 * Every picture of the product, to click the ones that are copies of each
 * other. A moderator then deletes the extra copies in one go, instead of
 * comparing the whole gallery against a comment.
 */
export default function DuplicateImagesPicker({
    barcode,
    flavor,
    flaggedImageId,
    selected,
    onChange,
}: DuplicateImagesPickerProps) {
    const { ids, isPending, isError } = useProductImageIds(flavor, barcode);

    const toggle = (imgid: number) =>
        onChange(
            selected.includes(imgid)
                ? selected.filter((id) => id !== imgid)
                : [...selected, imgid],
        );

    const flagged = ids.filter((imgid) => imgid === flaggedImageId);
    const others = ids.filter((imgid) => imgid !== flaggedImageId);

    const tile = (imgid: string) => {
        const isSelected = selected.includes(Number(imgid));
        return (
            <ButtonBase
                key={imgid}
                onClick={() => toggle(Number(imgid))}
                aria-pressed={isSelected}
                aria-label={`Picture ${imgid}${isSelected ? ', marked as duplicate' : ''}`}
                sx={{
                    position: 'relative',
                    width: SIZE,
                    height: SIZE,
                    borderRadius: 1,
                    overflow: 'hidden',
                    outline: '3px solid',
                    outlineColor: isSelected ? 'error.main' : 'transparent',
                }}
            >
                <Box
                    component="img"
                    src={productImageUrl(flavor, barcode, imgid, 400)}
                    alt={`Picture ${imgid} of ${barcode}`}
                    loading="lazy"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isSelected ? 0.6 : 1,
                    }}
                />
                {isSelected && (
                    <Chip
                        label="Duplicate"
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }}
                    />
                )}
            </ButtonBase>
        );
    };

    const grid = (imgids: string[]) => (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ py: 1 }}>
            {imgids.map(tile)}
        </Stack>
    );

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Which pictures are duplicates?
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Click the pictures that show the same thing to mark them as duplicates.
            </Typography>

            {isPending ? (
                <Stack direction="row" spacing={1} sx={{ py: 1 }}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} variant="rectangular" width={SIZE} height={SIZE} />
                    ))}
                </Stack>
            ) : isError || ids.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    {isError
                        ? "Could not load the product's pictures. Tell us which ones are duplicates in your comment."
                        : 'This product has no pictures.'}
                </Typography>
            ) : (
                <>
                    {flagged.length > 0 && (
                        <>
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                The picture you reported
                            </Typography>
                            {grid(flagged)}
                            {others.length > 0 && (
                                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                    The product's other pictures
                                </Typography>
                            )}
                        </>
                    )}
                    {grid(others)}
                </>
            )}
        </Box>
    );
}
