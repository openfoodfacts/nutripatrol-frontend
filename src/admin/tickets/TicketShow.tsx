import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Link,
  Skeleton,
  Stack,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DateField,
  SelectField,
  Show,
  TextField,
  useDataProvider,
  useNotify,
  usePermissions,
  useRecordContext,
} from "react-admin";
import type { Identifier } from "react-admin";
import type { NutriPatrolDataProvider } from "../dataProvider";
import {
  actionTypeLabel,
  flavorChoices,
  statusChoices,
  typeChoices,
} from "./choices";
import { FlagSummary } from "./FlagSummary";
import { useFlagsByTicketIds } from "./flags";
import { productUrl, userUrl } from "./flavorUrls";
import { ProductImagesManager } from "./ProductImagesManager";
import { TicketActionsField } from "./TicketActionsField";
import { TicketThumbnailField } from "./TicketThumbnailField";

interface Ticket {
  id: Identifier;
  barcode: string | null;
  type: string;
  status: string;
  flavor: string;
  url: string | null;
  created_at: string;
}

/** A titled block, so the three parts of the page read as three parts. */
function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          {count !== undefined && <Chip size="small" label={count} />}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

/** What the ticket itself says, next to the picture it is about. */
function TicketSummary() {
  const record = useRecordContext<Ticket>();
  if (!record) return null;

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <TicketThumbnailField source="url" />

          <Stack spacing={1} flexGrow={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <SelectField source="status" choices={statusChoices} />
              <Typography color="text.disabled">·</Typography>
              <SelectField source="type" choices={typeChoices} />
              <Typography color="text.disabled">·</Typography>
              <SelectField source="flavor" choices={flavorChoices} />
              <Typography color="text.disabled">·</Typography>
              <DateField source="created_at" showTime />
            </Stack>

            {/* The barcode is the one field a moderator copies or follows, so
                it is the heading here and a link to the product itself.
                Search tickets carry none. */}
            {record.barcode ? (
              <Link
                href={productUrl(record.flavor, record.barcode)}
                target="_blank"
                rel="noopener"
                variant="h5"
              >
                {record.barcode}
              </Link>
            ) : (
              <TextField source="url" variant="body2" />
            )}

            <Box pt={1}>
              <TicketActionsField label="Actions" />
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Every report that opened or joined this ticket. */
function TicketFlags() {
  const record = useRecordContext<Ticket>();
  const ticketIds = record ? [record.id] : [];
  const { data, isPending, isError } = useFlagsByTicketIds(ticketIds);
  const flags = record ? (data?.[String(record.id)] ?? []) : [];

  if (!record) return null;
  if (isPending) return <Skeleton variant="rectangular" height={120} />;
  if (isError) {
    return (
      <Section title="Reports">
        <Typography color="text.disabled">
          The reports could not be loaded.
        </Typography>
      </Section>
    );
  }

  return (
    <Section title="Reports" count={flags.length}>
      {flags.length === 0 ? (
        <Typography color="text.disabled">
          No report is attached to this ticket.
        </Typography>
      ) : (
        <Stack spacing={2} divider={<Divider flexItem />}>
          {flags.map((flag) => (
            <FlagSummary key={flag.id} flag={flag} />
          ))}
        </Stack>
      )}
    </Section>
  );
}

/** Every picture of the product, to delete or move some of them. */
function TicketProductImages() {
  const record = useRecordContext<Ticket>();
  // Search tickets have no product.
  if (!record?.barcode) return null;

  return (
    <Section title="Product pictures">
      <ProductImagesManager barcode={record.barcode} flavor={record.flavor} />
    </Section>
  );
}

/**
 * Where a moderator writes a comment. Reporters read comments too, which the
 * field says, so that nothing meant for moderators only ends up there.
 */
function AddCommentForm({ ticketId }: { ticketId: Identifier }) {
  const dataProvider = useDataProvider<NutriPatrolDataProvider>();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [text, setText] = useState("");
  const { mutate, isPending } = useMutation({
    mutationFn: () => dataProvider.addTicketComment(ticketId, text.trim()),
    onSuccess: () => {
      setText("");
      // The history lists the new `comment` action, and the ticket its count.
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error) => notify((error as Error).message, { type: "error" }),
  });

  return (
    <Stack
      component="form"
      spacing={1}
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        if (text.trim()) mutate();
      }}
    >
      <MuiTextField
        label="Add a comment"
        helperText="Visible to the people who reported this ticket."
        value={text}
        onChange={(event) => setText(event.target.value)}
        multiline
        minRows={2}
        inputProps={{ maxLength: 2000 }}
        fullWidth
      />
      <Box>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={isPending || !text.trim()}
        >
          Comment
        </Button>
      </Box>
    </Stack>
  );
}

/** What moderators have done about it, most recent first. */
function TicketHistory() {
  const record = useRecordContext<Ticket>();
  const dataProvider = useDataProvider<NutriPatrolDataProvider>();
  const { permissions } = usePermissions();
  const { data, isPending, isError } = useQuery({
    queryKey: ["tickets", record?.id, "actions"],
    queryFn: () => dataProvider.getTicketActions(record!.id),
    enabled: record != null,
  });

  if (!record) return null;
  if (isPending) return <Skeleton variant="rectangular" height={120} />;
  if (isError) {
    return (
      <Section title="Moderation history">
        <Typography color="text.disabled">
          The history could not be loaded.
        </Typography>
      </Section>
    );
  }

  const actions = data?.actions ?? [];

  return (
    <Section title="Moderation history" count={data?.total ?? actions.length}>
      {actions.length === 0 ? (
        <Typography color="text.disabled">
          Nothing has been done about this ticket yet.
        </Typography>
      ) : (
        <Stack spacing={1} divider={<Divider flexItem />}>
          {actions.map((action) => (
            <Stack key={action.id} spacing={0.5}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="baseline"
                flexWrap="wrap"
                useFlexGap
              >
                {/* The status the action set on the ticket, or `comment`. */}
                <Chip
                  size="small"
                  label={actionTypeLabel(action.action_type)}
                />
                <Link
                  href={userUrl(record.flavor, action.user_id)}
                  target="_blank"
                  rel="noopener"
                  variant="body2"
                >
                  {action.user_id}
                </Link>
                <Typography variant="caption" color="text.secondary">
                  {new Date(action.created_at).toLocaleString()}
                </Typography>
              </Stack>
              {action.comment && (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {action.comment.text}
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      )}
      {permissions === "moderator" && (
        <Box mt={2}>
          <AddCommentForm ticketId={record.id} />
        </Box>
      )}
    </Section>
  );
}

/**
 * Everything about one ticket on one page: what was flagged, every report
 * behind it, and what moderators have done since.
 *
 * The list can only ever show a summary of each - a ticket gathers the reports
 * of everyone who hit the same product, and long comments do not fit in a
 * table cell. This is where they are read in full.
 */
export function TicketShow() {
  return (
    <Show
      // The default title is the record's id, which says nothing; the barcode
      // is on the page itself, right under this.
      title="Ticket"
      // Drops react-admin's default toolbar: its one button is Edit, and
      // tickets have no edit page. Moderating happens below, on the record.
      actions={false}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <TicketSummary />
        <TicketFlags />
        <TicketProductImages />
        <TicketHistory />
      </Stack>
    </Show>
  );
}
