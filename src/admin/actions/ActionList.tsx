import {
  List,
  Datagrid,
  TextField,
  DateField,
  SelectField,
  ReferenceField,
} from "react-admin";
import { statusChoices } from "../tickets/choices";

// GET /moderator_actions/me is scoped to the caller and always ordered
// created_at desc server-side, and takes no filter or sort parameter - so
// this list offers neither, and every column is marked unsortable rather
// than letting react-admin send a sort the API would silently ignore.
export function ActionList() {
  return (
    <List
      title="My moderation actions"
      sort={{ field: "created_at", order: "DESC" }}
      empty={false}
      exporter={false}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source="id" sortable={false} />
        <ReferenceField
          source="ticket_id"
          reference="tickets"
          link="edit"
          sortable={false}
        >
          <TextField source="barcode" />
        </ReferenceField>
        {/* action_type holds the status the action set on the ticket, so it
            shares the ticket status choices. */}
        <SelectField
          source="action_type"
          choices={statusChoices}
          sortable={false}
        />
        <DateField source="created_at" showTime sortable={false} />
      </Datagrid>
    </List>
  );
}
