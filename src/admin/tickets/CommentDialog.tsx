import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CommentIcon from "@mui/icons-material/Comment";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProvider, useNotify } from "react-admin";
import type { Identifier } from "react-admin";
import type { ClosedStatus, NutriPatrolDataProvider } from "../dataProvider";

/**
 * Comment on a ticket, and either leave it open or close it.
 *
 * The comment is required: closing without one is what the one-click buttons
 * next to "Comment" are for. Closing with a comment makes the API record the
 * comment, then the close, as two actions in the ticket history.
 */
export function CommentDialog({
  ticketId,
  open,
  onClose,
}: {
  ticketId: Identifier;
  open: boolean;
  onClose: () => void;
}) {
  const dataProvider = useDataProvider<NutriPatrolDataProvider>();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [comment, setComment] = useState("");

  // `null` comments without changing the ticket's status.
  const { mutate, isPending } = useMutation({
    mutationFn: async (status: ClosedStatus | null) => {
      if (status === null) {
        await dataProvider.addTicketComment(ticketId, comment.trim());
      } else {
        await dataProvider.closeTicketWithComment(ticketId, status, comment.trim());
      }
    },
    onSuccess: (_data, status) => {
      notify(status === null ? "Comment added" : "Ticket closed", { type: "info" });
      setComment("");
      onClose();
      // The ticket's status and comment count, in every list and on its page,
      // and its history.
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error) => notify((error as Error).message, { type: "error" }),
  });

  const disabled = isPending || !comment.trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Comment on this ticket</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Comment"
          helperText="Visible to the people who reported this ticket."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          multiline
          minRows={3}
          inputProps={{ maxLength: 2000 }}
          fullWidth
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<CommentIcon />}
          disabled={disabled}
          onClick={() => mutate(null)}
        >
          Comment
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<NotInterestedIcon />}
          disabled={disabled}
          onClick={() => mutate("closed-no-issue")}
        >
          Close: no problem
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<CheckIcon />}
          disabled={disabled}
          onClick={() => mutate("closed-fixed")}
        >
          Close: I fixed it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
