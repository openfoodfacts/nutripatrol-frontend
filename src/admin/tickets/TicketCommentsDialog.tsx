import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "react-admin";
import type { Identifier } from "react-admin";
import type { NutriPatrolDataProvider } from "../dataProvider";

/** A ticket's comments, oldest first, read-only. */
export function TicketCommentsDialog({
  ticketId,
  open,
  onClose,
}: {
  ticketId: Identifier;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Comments</DialogTitle>
      <DialogContent dividers>
        {/* Mounted only while open, so the comments are fetched on demand. */}
        {open && <TicketComments ticketId={ticketId} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function TicketComments({ ticketId }: { ticketId: Identifier }) {
  const dataProvider = useDataProvider<NutriPatrolDataProvider>();
  const { data, isPending, isError } = useQuery({
    // Under "tickets", so posting a comment anywhere refreshes it.
    queryKey: ["tickets", ticketId, "comments"],
    queryFn: () => dataProvider.getTicketComments(ticketId),
  });

  if (isPending) return <Skeleton variant="rectangular" height={60} />;
  if (isError) {
    return (
      <Typography color="text.disabled">
        The comments could not be loaded.
      </Typography>
    );
  }
  const comments = data.comments;
  if (comments.length === 0) {
    return <Typography color="text.disabled">No comments yet.</Typography>;
  }

  return (
    <Stack spacing={1.5} divider={<Divider flexItem />}>
      {comments.map((comment) => (
        <Stack key={comment.id} spacing={0.25}>
          <Typography variant="caption" color="text.secondary">
            {comment.user_id} · {new Date(comment.created_at).toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {comment.text}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
