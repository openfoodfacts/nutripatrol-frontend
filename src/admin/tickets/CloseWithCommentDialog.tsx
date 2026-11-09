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
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProvider, useNotify } from "react-admin";
import type { Identifier } from "react-admin";
import type { ClosedStatus, NutriPatrolDataProvider } from "../dataProvider";

/**
 * Close a ticket with a comment saying why.
 *
 * The comment is required: closing without one is what the one-click buttons
 * next to "Close with comment" are for. The API records the comment, then the
 * close, as two actions in the ticket history.
 */
export function CloseWithCommentDialog({
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

  const { mutate, isPending } = useMutation({
    mutationFn: (status: ClosedStatus) =>
      dataProvider.closeTicketWithComment(ticketId, status, comment.trim()),
    onSuccess: () => {
      notify("Ticket closed", { type: "info" });
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
      <DialogTitle>Close with a comment</DialogTitle>
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
          variant="outlined"
          color="error"
          startIcon={<NotInterestedIcon />}
          disabled={disabled}
          onClick={() => mutate("closed-no-issue")}
        >
          No problem
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<CheckIcon />}
          disabled={disabled}
          onClick={() => mutate("closed-fixed")}
        >
          I fixed it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
