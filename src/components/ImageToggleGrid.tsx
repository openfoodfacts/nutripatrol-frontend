import { Box, ButtonBase, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { useProductImageIds } from '../admin/tickets/ProductImagesPanel';
import { productImageUrl } from '../admin/tickets/flavorUrls';

/** Displayed size of a picture, in px. */
const SIZE = 160;

interface ImageToggleGridProps {
    barcode: string;
    flavor: string;
    /** Pictures shown first, under `pinnedTitle`, if the product has them. */
    pinned?: string[];
    pinnedTitle?: string;
    /** Heading of the rest, shown only when there are pinned pictures. */
    othersTitle?: string;
    /** The ids of the pictures toggled on. */
    selected: number[];
    onChange: (selected: number[]) => void;
    /** Written on a toggled picture. */
    badge: string;
    /** Shown when the product's pictures could not be loaded. */
    errorText?: string;
}

/**
 * Every uploaded picture of a product, each one a toggle. Used to name the
 * copies of a picture, by the person reporting them and by the moderator
 * deleting them.
 */
export default function ImageToggleGrid({
    barcode,
    flavor,
    pinned = [],
    pinnedTitle,
    othersTitle,
    selected,
    onChange,
    badge,
    errorText = "Could not load the product's pictures.",
}: ImageToggleGridProps) {
    const { ids, isPending, isError } = useProductImageIds(flavor, barcode);

    if (isPending) {
        return (
            <Stack direction="row" spacing={1} sx={{ py: 1 }}>
                {[0, 1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" width={SIZE} height={SIZE} />
                ))}
            </Stack>
        );
    }

    if (isError || ids.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                {isError ? errorText : 'This product has no pictures.'}
            </Typography>
        );
    }

    const toggle = (imgid: number) =>
        onChange(
            selected.includes(imgid)
                ? selected.filter((id) => id !== imgid)
                : [...selected, imgid],
        );

    const tile = (imgid: string) => {
        const isSelected = selected.includes(Number(imgid));
        return (
            <ButtonBase
                key={imgid}
                onClick={() => toggle(Number(imgid))}
                aria-pressed={isSelected}
                aria-label={`Picture ${imgid}${isSelected ? `, ${badge.toLowerCase()}` : ''}`}
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
                        label={badge}
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

    // Pinned ids the product no longer has (deleted since) are left out.
    const top = ids.filter((imgid) => pinned.includes(imgid));
    const others = ids.filter((imgid) => !pinned.includes(imgid));

    if (top.length === 0) return grid(others);

    return (
        <>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                {pinnedTitle}
            </Typography>
            {grid(top)}
            {others.length > 0 && (
                <>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        {othersTitle}
                    </Typography>
                    {grid(others)}
                </>
            )}
        </>
    );
}
