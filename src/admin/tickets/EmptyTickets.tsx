import { Box, Typography } from "@mui/material";
import { useListContext } from "react-admin";

/** Explain the queue without hiding its filters when no tickets match. */
export function EmptyTickets({ description }: { description: string }) {
  const { isPending, isFetching, error } = useListContext();
  if (isPending || isFetching || error) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        No tickets match this view
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        There may be no reports yet, or the current filters may exclude them.
      </Typography>
    </Box>
  );
}
