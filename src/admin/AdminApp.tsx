import { Admin, CustomRoutes, Layout, Menu, Resource } from "react-admin";
import type { LayoutProps } from "react-admin";
import { Route } from "react-router-dom";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import HistoryIcon from "@mui/icons-material/History";
import FlagIcon from "@mui/icons-material/Flag";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { TicketList } from "./tickets/TicketList";
import { TicketEdit } from "./tickets/TicketEdit";
import { ReasonTicketList, reasonPath } from "./tickets/ReasonTicketList";
import { reasonChoices } from "./tickets/choices";
import { ActionList } from "./actions/ActionList";

// One page per flagging reason, so that a moderator working through, say,
// inappropriate images gets a link to bookmark instead of having to set the
// filter by hand. They are the ticket list with `reason` pinned - the routes
// and the menu entries are both generated from reasonChoices, so adding a
// reason there adds its page.
function AdminMenu() {
  return (
    <Menu>
      <Menu.ResourceItems />
      {reasonChoices.map((reason) => (
        <Menu.Item
          key={reason.id}
          to={reasonPath(reason.id)}
          primaryText={reason.name}
          leftIcon={<FlagIcon />}
        />
      ))}
    </Menu>
  );
}

function AdminLayout(props: LayoutProps) {
  return <Layout {...props} menu={AdminMenu} />;
}

export function AdminApp() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      layout={AdminLayout}
      disableTelemetry
      title="NutriPatrol Admin"
    >
      <Resource
        name="tickets"
        list={TicketList}
        edit={TicketEdit}
        icon={ConfirmationNumberIcon}
      />
      {/* Labelled "My actions" because the backing route
          (/moderator_actions/me) only ever returns the caller's own. */}
      <Resource
        name="moderator_actions"
        list={ActionList}
        icon={HistoryIcon}
        options={{ label: "My actions" }}
      />
      <CustomRoutes>
        {reasonChoices.map((reason) => (
          <Route
            key={reason.id}
            path={reasonPath(reason.id)}
            element={<ReasonTicketList reason={reason.id} />}
          />
        ))}
      </CustomRoutes>
    </Admin>
  );
}
