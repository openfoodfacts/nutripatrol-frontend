import { Box, Chip, Typography } from '@mui/material';
import PinnedImagesGrid from './PinnedImagesGrid';
import { Image, ImagesContext } from './productImages';

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
    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Which pictures are duplicates?
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Select the pictures that show the same thing to mark them as duplicates.
            </Typography>
            <ImagesContext
                barcode={barcode}
                flavor={flavor}
                selected={selected.map(String)}
                onSelectionChange={(ids) => onChange(ids.map(Number))}
            >
                <PinnedImagesGrid
                    pinned={flaggedImageId ? [flaggedImageId, ...selected.map(String)] : selected.map(String)}
                    pinnedTitle="The picture you reported"
                    othersTitle="The product's other pictures"
                    errorText="Could not load the product's pictures. Tell us which ones are duplicates in your comment."
                >
                    {(imgid) => (
                        <Image
                            imgid={imgid}
                            width={160}
                            selectedSx={{ outlineColor: 'error.main' }}
                            renderSelected={() => (
                                <Chip
                                    label="Duplicate"
                                    color="error"
                                    size="small"
                                    sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }}
                                />
                            )}
                        />
                    )}
                </PinnedImagesGrid>
            </ImagesContext>
        </Box>
    );
}
