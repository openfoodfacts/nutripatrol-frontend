import { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import CommentIcon from "@mui/icons-material/CommentOutlined";
import { useRecordContext, type FieldProps } from "react-admin";
import { TicketCommentsDialog } from "./TicketCommentsDialog";

/**
 * How many comments a ticket has, left empty when it has none. Clicking it
 * opens the comments.
 */
export function TicketCommentCountField(_props: FieldProps) {
  const record = useRecordContext<{ id: number; comment_count?: number }>();
  const [open, setOpen] = useState(false);
  const count = record?.comment_count ?? 0;
  if (!record || count === 0) return null;

  return (
    <>
      <Tooltip title={count === 1 ? "Show 1 comment" : `Show ${count} comments`}>
        <Button
          size="small"
          color="inherit"
          startIcon={<CommentIcon fontSize="small" color="action" />}
          onClick={() => setOpen(true)}
          sx={{ minWidth: 0 }}
        >
          {count}
        </Button>
      </Tooltip>
      <TicketCommentsDialog
        ticketId={record.id}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
