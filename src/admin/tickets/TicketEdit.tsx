import {
  Edit,
  SimpleForm,
  Toolbar,
  SaveButton,
  TextField,
  DateField,
  SelectField,
  SelectInput,
} from "react-admin";
import { statusChoices, typeChoices, flavorChoices } from "./choices";

// The API only allows editing a ticket's status (see app/api.py's
// _update_ticket_status) - no Delete button, since the API has no delete
// endpoint either.
function TicketEditToolbar() {
  return (
    <Toolbar>
      <SaveButton />
    </Toolbar>
  );
}

export function TicketEdit() {
  return (
    <Edit>
      <SimpleForm toolbar={<TicketEditToolbar />}>
        <TextField source="id" />
        <TextField source="barcode" />
        <SelectField source="type" choices={typeChoices} />
        <SelectField source="flavor" choices={flavorChoices} />
        <TextField source="url" />
        <DateField source="created_at" showTime />
        <SelectInput source="status" choices={statusChoices} />
      </SimpleForm>
    </Edit>
  );
}
