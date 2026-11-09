import { Stack, Tooltip, Typography } from "@mui/material";
import CommentIcon from "@mui/icons-material/CommentOutlined";
import { useRecordContext, type FieldProps } from "react-admin";

/** How many comments a ticket has, left empty when it has none. */
export function TicketCommentCountField(_props: FieldProps) {
  const record = useRecordContext<{ comment_count?: number }>();
  const count = record?.comment_count ?? 0;
  if (count === 0) return null;

  return (
    <Tooltip title={count === 1 ? "1 comment" : `${count} comments`}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <CommentIcon fontSize="small" color="action" />
        <Typography variant="body2">{count}</Typography>
      </Stack>
    </Tooltip>
  );
}
