import { Chip, Stack, type ChipProps } from "@mui/material";
import { useRecordContext, type FieldProps } from "react-admin";
import type { Label } from "../dataProvider";

/** One label, in its color. */
export function LabelChip({
  label,
  onDelete,
}: {
  label: Pick<Label, "name" | "color">;
  onDelete?: ChipProps["onDelete"];
}) {
  return (
    <Chip
      size="small"
      label={label.name}
      color={label.color ?? "default"}
      variant={label.color ? "filled" : "outlined"}
      onDelete={onDelete}
    />
  );
}

/** The labels of a ticket, left empty when it has none. */
export function TicketLabelsField(_props: FieldProps) {
  const record = useRecordContext<{ labels?: Label[] }>();
  const labels = record?.labels ?? [];
  if (labels.length === 0) return null;

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {labels.map((label) => (
        <LabelChip key={label.id} label={label} />
      ))}
    </Stack>
  );
}
