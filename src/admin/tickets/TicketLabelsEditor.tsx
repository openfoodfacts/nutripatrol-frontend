import { Autocomplete, TextField, createFilterOptions } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useDataProvider,
  useGetList,
  useNotify,
  useRecordContext,
} from "react-admin";
import type { Identifier } from "react-admin";
import type { Label, NutriPatrolDataProvider } from "../dataProvider";
import { LabelChip } from "./TicketLabelsField";

/** An existing label, or the offer to create one named after the input. */
type Option = Label | { create: string };

const isCreate = (option: Option): option is { create: string } =>
  "create" in option;

const filter = createFilterOptions<Option>({
  stringify: (option) => (isCreate(option) ? option.create : option.name),
});

/**
 * The labels of a ticket, to add and remove. Typing a name no label has yet
 * offers to create it: any moderator can.
 *
 * Every change is one call to the API, which records it as a moderator
 * action, so the ticket and its history are reloaded afterwards.
 */
export function TicketLabelsEditor() {
  const record = useRecordContext<{ id: Identifier; labels?: Label[] }>();
  const dataProvider = useDataProvider<NutriPatrolDataProvider>();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const { data: allLabels = [] } = useGetList<Label>("labels", {
    pagination: { page: 1, perPage: 1000 },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      added,
      removed,
    }: {
      added: Option[];
      removed: Label[];
    }) => {
      for (const option of added) {
        const label = isCreate(option)
          ? (
              await dataProvider.create<Label>("labels", {
                data: { name: option.create },
              })
            ).data
          : option;
        await dataProvider.addTicketLabel(record!.id, label.id);
      }
      for (const label of removed) {
        await dataProvider.removeTicketLabel(record!.id, label.id);
      }
    },
    onSettled: () => {
      // The ticket's labels wherever it is shown, its history, and the
      // labels' ticket counts.
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
    onError: (error) => notify((error as Error).message, { type: "error" }),
  });

  if (!record) return null;
  const current = record.labels ?? [];
  const currentIds = new Set(current.map((label) => label.id));

  return (
    <Autocomplete<Option, true, false, false>
      multiple
      size="small"
      disabled={isPending}
      options={allLabels}
      value={current}
      isOptionEqualToValue={(option, value) =>
        !isCreate(option) && !isCreate(value) && option.id === value.id
      }
      getOptionLabel={(option) =>
        isCreate(option) ? `Create label "${option.create}"` : option.name
      }
      filterOptions={(options, state) => {
        const filtered = filter(options, state);
        const name = state.inputValue.trim();
        const exists = allLabels.some(
          (label) => label.name.toLowerCase() === name.toLowerCase(),
        );
        if (name && !exists) filtered.push({ create: name });
        return filtered;
      }}
      onChange={(_event, value) => {
        const added = value.filter(
          (option) => isCreate(option) || !currentIds.has(option.id),
        );
        const keptIds = new Set(
          value.flatMap((option) => (isCreate(option) ? [] : [option.id])),
        );
        const removed = current.filter((label) => !keptIds.has(label.id));
        if (added.length || removed.length) mutate({ added, removed });
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          if (isCreate(option)) return null;
          const { key, onDelete } = getTagProps({ index });
          return <LabelChip key={key} label={option} onDelete={onDelete} />;
        })
      }
      renderInput={(params) => (
        <TextField {...params} label="Labels" placeholder="Add a label" />
      )}
    />
  );
}
