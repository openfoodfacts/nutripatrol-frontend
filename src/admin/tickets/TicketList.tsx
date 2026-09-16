import {
  List,
  Datagrid,
  TextField,
  DateField,
  SelectField,
  TextInput,
  SelectInput,
  SelectArrayInput,
} from "react-admin";
import {
  statusChoices,
  typeChoices,
  flavorChoices,
  reasonChoices,
} from "./choices";
import { TicketThumbnailField } from "./TicketThumbnailField";
import { TicketActionsField } from "./TicketActionsField";

// `reason` is a flag field, not a ticket one: the API filters tickets on the
// reasons of their flags. So it is filterable but not displayable or
// sortable - hence a filter input with no matching column.
export const ticketFilters = [
  <TextInput key="barcode" source="barcode" label="Barcode" />,
  <SelectInput key="status" source="status" choices={statusChoices} />,
  <SelectInput key="type" source="type" choices={typeChoices} label="Type" />,
  <SelectInput key="flavor" source="flavor" choices={flavorChoices} />,
  <SelectArrayInput
    key="reason"
    source="reason"
    choices={reasonChoices}
    label="Reason"
  />,
];

// Shared with the per-reason pages (see ReasonTicketList), so that a column
// added here shows up on all of them.
export function TicketDatagrid() {
  return (
    // Rows are inert: the whole row used to be a link to the edit form,
    // which made every stray click on a thumbnail or a barcode navigate
    // away. Moderating goes through the Actions column instead.
    <Datagrid rowClick={false} bulkActionButtons={false}>
      {/* Not backed by a single source, and only ever filled for image
          tickets - hence an explicit label and no sorting. */}
      <TicketThumbnailField source="url" label="Image" sortable={false} />
      <TextField source="barcode" />
      <SelectField source="type" choices={typeChoices} />
      <SelectField source="status" choices={statusChoices} />
      <SelectField source="flavor" choices={flavorChoices} />
      {/* Day precision, month in letters: enough to scan a list by age,
          and unambiguous between the d/m and m/d readings of a numeric
          date. The full timestamp stays on the edit page. */}
      <DateField
        source="created_at"
        options={{ day: "numeric", month: "short", year: "numeric" }}
      />
      {/* <TextField source="" /> */}
      <TicketActionsField label="Actions" sortable={false} />
    </Datagrid>
  );
}

export function TicketList() {
  return (
    <List
      filters={ticketFilters}
      // The default toolbar's Export button downloads the current page as
      // CSV; nothing here is meant to leave the moderation tool.
      exporter={false}
    >
      <TicketDatagrid />
    </List>
  );
}
