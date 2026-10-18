import { Chip, Stack, Typography } from '@mui/material';
import { Image, Images, useImages } from './productImages';
import type { ProductImage } from './productImages';

/** Displayed size of a picture, in px. */
const SIZE = 160;

interface ImageToggleGridProps {
    /** Pictures shown first, under `pinnedTitle`, if the product has them. */
    pinned?: string[];
    pinnedTitle?: string;
    /** Heading of the rest, shown only when there are pinned pictures. */
    othersTitle?: string;
    /** Written on a selected picture. */
    badge: string;
    /** Shown when the product's pictures could not be loaded. */
    errorText?: string;
}

/**
 * Every uploaded picture of the product of the closest `<ImagesContext>`,
 * each one selectable. Used to name the copies of a picture, by the person
 * reporting them and by the moderator deleting them. The selection is the
 * context's.
 */
export default function ImageToggleGrid({
    pinned = [],
    pinnedTitle,
    othersTitle,
    badge,
    errorText = "Could not load the product's pictures.",
}: ImageToggleGridProps) {
    const { images } = useImages();

    const grid = (filter: (image: ProductImage) => boolean) => (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ py: 1 }}>
            <Images
                filter={filter}
                error={
                    <Typography variant="body2" color="text.secondary">
                        {errorText}
                    </Typography>
                }
            >
                {(image) => (
                    <Image
                        imgid={image.imgid}
                        width={SIZE}
                        selectable
                        selectedSx={{ outlineColor: 'error.main' }}
                        renderSelected={() => (
                            <Chip
                                label={badge}
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }}
                            />
                        )}
                    />
                )}
            </Images>
        </Stack>
    );

    // Pinned ids the product no longer has (deleted since) are left out.
    const isPinned = (image: ProductImage) => pinned.includes(image.imgid);
    if (!images.some(isPinned)) return grid(() => true);

    return (
        <>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                {pinnedTitle}
            </Typography>
            {grid(isPinned)}
            {images.some((image) => !isPinned(image)) && (
                <>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        {othersTitle}
                    </Typography>
                    {grid((image) => !isPinned(image))}
                </>
            )}
        </>
    );
}
