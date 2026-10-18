import { Fragment, type ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Images, useImages } from './productImages';

interface PinnedImagesGridProps {
    /**
     * Pictures shown first, under `pinnedTitle`: upload ids ("3"), or
     * selected crops ("front_fr"), shown as the upload they were cut from.
     */
    pinned?: string[];
    pinnedTitle?: string;
    /** Heading of the rest, shown only when there are pinned pictures. */
    othersTitle?: string;
    /**
     * Renders one picture, usually an `<Image>`. A pinned picture can be one
     * the product no longer has: `useImages().getImage` tells.
     */
    children: (imgid: string) => ReactNode;
    /** Shown when the product's pictures could not be loaded. */
    errorText?: string;
}

/**
 * Every uploaded picture of the product of the closest `<ImagesContext>`, the
 * pinned ones first. Used for the copies of a picture, by the person
 * reporting them and by the moderator deleting them.
 */
export default function PinnedImagesGrid({
    pinned = [],
    pinnedTitle,
    othersTitle,
    children,
    errorText = "Could not load the product's pictures.",
}: PinnedImagesGridProps) {
    const { images, hasData } = useImages();

    const others = (filter: (imgid: string) => boolean) => (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ py: 1 }}>
            <Images
                filter={(image) => filter(image.imgid)}
                error={
                    <Typography variant="body2" color="text.secondary">
                        {errorText}
                    </Typography>
                }
            >
                {(image) => children(image.imgid)}
            </Images>
        </Stack>
    );

    // Until the pictures are known, a crop cannot be told apart from a
    // deleted upload: everything waits for them.
    if (!hasData || pinned.length === 0) return others(() => true);

    const uploadOf = (id: string) =>
        images.find((image) => image.imgid === id || image.selectedAs.includes(id))
            ?.imgid;
    // A crop of a deleted upload is nothing to show; a deleted upload still
    // is, as "no longer available", so that the moderator knows.
    const top = [
        ...new Set(
            pinned.flatMap((id) => {
                const imgid = uploadOf(id) ?? (/^\d+$/.test(id) ? id : undefined);
                return imgid === undefined ? [] : [imgid];
            }),
        ),
    ].sort((a, b) => Number(b) - Number(a));

    if (top.length === 0) return others(() => true);

    return (
        <>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                {pinnedTitle}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ py: 1, maxHeight: 300, overflow: 'auto' }}>
                {top.map((imgid) => (
                    <Fragment key={imgid}>{children(imgid)}</Fragment>
                ))}
            </Stack>
            {images.some((image) => !top.includes(image.imgid)) && (
                <>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        {othersTitle}
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {others((imgid) => !top.includes(imgid))}
                    </Box>
                </>
            )}
        </>
    );
}
