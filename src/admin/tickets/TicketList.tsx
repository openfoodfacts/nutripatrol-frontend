import { Stack } from "@mui/material";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  SelectField,
  TextInput,
  SelectInput,
  SelectArrayInput,
  Labeled,
  usePermissions,
} from "react-admin";
import { TicketDetailsButton } from "./TicketDetailsButton";
import {
  statusChoices,
  typeChoices,
  flavorChoices,
  reasonChoices,
} from "./choices";
import { EmptyTickets } from "./EmptyTickets";
import { TicketFlagsField } from "./TicketFlagsField";
import { TicketThumbnailField } from "./TicketThumbnailField";
import { TicketActionsField } from "./TicketActionsField";
import { TicketCommentCountField } from "./TicketCommentCountField";
import { ProductImagesManagerPanel } from "./ProductImagesManager";

// `reason` is a flag field, not a ticket one: the API filters tickets on the
// reasons of their flags. So it is filterable but not sortable, and the column
// that shows it is TicketFlagsField - one reason per flag, not one per ticket.
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

/**
 * A row's expanded part: the ticket fields that do not earn a column - the
 * reports need the width more, and the filters already narrow the list by
 * each of them - then every picture of the product, to delete or move some
 * of them without leaving the list.
 */
function TicketExpandPanel() {
  return (
    <Stack spacing={1} sx={{ pt: 1 }}>
      <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
        {/* Search tickets have no barcode, and say so. */}
        <Labeled>
          <TextField source="barcode" emptyText="-" />
        </Labeled>
        <Labeled>
          <SelectField source="type" choices={typeChoices} />
        </Labeled>
        <Labeled>
          <SelectField source="status" choices={statusChoices} />
        </Labeled>
        <Labeled>
          <SelectField source="flavor" choices={flavorChoices} />
        </Labeled>
      </Stack>
      {/* Renders nothing for search tickets, which have no product. */}
      <ProductImagesManagerPanel />
    </Stack>
  );
}

// Shared with the per-reason pages (see ReasonTicketList), so that a column
// added here shows up on all of them.
export function TicketDatagrid({
  description = "This page lists reports about products, images and searches.",
}: { description?: string }) {
  const { permissions } = usePermissions();
  return (
    // Rows are inert: the whole row used to be a link to the edit form,
    // which made every stray click on a thumbnail or a barcode navigate
    // away. Moderating goes through the Actions column instead.
    <Datagrid
      rowClick={false}
      bulkActionButtons={false}
      // Every row, search tickets included: the panel holds the ticket's
      // fields as well as the product's pictures.
      expand={<TicketExpandPanel />}
      empty={<EmptyTickets description={description} />}
    >
      {/* Not backed by a single source, and only ever filled for image
          tickets - hence an explicit label and no sorting. */}
      <TicketThumbnailField source="url" label="Image" sortable={false} />
      {/* Day precision, month in letters: enough to scan a list by age,
          and unambiguous between the d/m and m/d readings of a numeric
          date. The full timestamp stays on the ticket page. */}
      <DateField
        source="created_at"
        options={{ day: "numeric", month: "short", year: "numeric" }}
      />
      {/* Who reported it and what they wrote - not a ticket field but its
          flags', fetched a page at a time. See TicketFlagsField. */}
      <TicketFlagsField source="flags" label="Reports" sortable={false} />
      <TicketCommentCountField
        source="comment_count"
        label="Comments"
        sortable={false}
      />
      {/* The way to the full ticket, now that the row itself is inert. */}
      <TicketDetailsButton />
      {/* Contributors cannot moderate, so the column would only hold an
          edit link. */}
      {permissions === "moderator" && (
        <TicketActionsField label="Actions" sortable={false} />
      )}
    </Datagrid>
  );
}

export function TicketList() {
  return (
    <List
      filters={ticketFilters}
      // Moderators come here to work through what is still pending, newest
      // first. Both are only defaults: the status filter can be cleared and
      // any sortable column clicked.
      filterDefaultValues={{ status: "open" }}
      sort={{ field: "created_at", order: "DESC" }}
      empty={false}
      // The default toolbar's Export button downloads the current page as
      // CSV; nothing here is meant to leave the moderation tool.
      exporter={false}
    >
      <TicketDatagrid />
    </List>
  );
}
