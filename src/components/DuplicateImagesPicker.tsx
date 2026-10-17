import { Box, Typography } from '@mui/material';
import ImageToggleGrid from './ImageToggleGrid';

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
                Click the pictures that show the same thing to mark them as duplicates.
            </Typography>
            <ImageToggleGrid
                barcode={barcode}
                flavor={flavor}
                pinned={flaggedImageId ? [flaggedImageId] : []}
                pinnedTitle="The picture you reported"
                othersTitle="The product's other pictures"
                selected={selected}
                onChange={onChange}
                badge="Duplicate"
                errorText="Could not load the product's pictures. Tell us which ones are duplicates in your comment."
            />
        </Box>
    );
}
