import { Admin, CustomRoutes, Layout, Menu, Resource, usePermissions } from "react-admin";
import type { LayoutProps } from "react-admin";
import { Route } from "react-router-dom";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import HistoryIcon from "@mui/icons-material/History";
import FlagIcon from "@mui/icons-material/Flag";
import { dataProvider } from "./admin/dataProvider";
import { authProvider } from "./admin/authProvider";
import AdminAppBar from "./admin/AdminAppBar";
import { TicketList } from "./admin/tickets/TicketList";
import { TicketShow } from "./admin/tickets/TicketShow";
import { ReasonTicketList, reasonPath } from "./admin/tickets/ReasonTicketList";
import { InappropriateTicketList } from "./admin/tickets/InappropriateTicketList";
import { reasonChoices } from "./admin/tickets/choices";
import { ActionList } from "./admin/actions/ActionList";
import {
  FLAG_IMAGE_ROUTE,
  FLAG_INFOS_ROUTE,
  FLAG_PRODUCT_ROUTE,
  NOT_MODERATOR_ROUTE,
  THANKS_ROUTE,
  TUTORIAL_ROUTE,
} from "./admin/routes";
import HomePage from "./pages/HomePage";
import FlagInfos from "./pages/FlagInfos";
import FlagFormPage from "./pages/FlagFormPage";
import ThanksPage from "./pages/ThanksPage";
import Tutorial from "./pages/Tutorial";
import LoginPage from "./pages/LoginPage";
import NonModeratorPage from "./pages/NonModeratorPage";
import NotFound from "./pages/NotFound";

// One page per flagging reason, so that a moderator working through, say,
// inappropriate images gets a link to bookmark instead of having to set the
// filter by hand. They are the ticket list with `reason` pinned - the routes
// and the menu entries are both generated from reasonChoices, so adding a
// reason there adds its page.
function AdminMenu() {
  const { permissions } = usePermissions();

  return (
    <Menu>
      <Menu.ResourceItems />
      {(permissions === "moderator" ? reasonChoices : []).map((reason) => (
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

  return <Layout {...props} menu={AdminMenu} appBar={AdminAppBar} />;
}

export default function AdminApp() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      layout={AdminLayout}
      // NutriPatrol has no credentials of its own, so this replaces
      // react-admin's username/password form with a hand-off to Open Food
      // Facts. react-admin mounts it at "/login" and redirects here itself
      // whenever checkAuth rejects.
      loginPage={LoginPage}
      // Rendered inside the layout for any path none of the routes below
      // claim - including a mistyped resource name, which is why it keeps the
      // menu around rather than filling the viewport.
      catchAll={NotFound}
      disableTelemetry
      title="NutriPatrol Admin"
    >
      {(permissions) => (
        <>
          <Resource
            name="tickets"
            list={TicketList}
            show={TicketShow}
            icon={ConfirmationNumberIcon}
          />
          {/* Labelled "My actions" because the backing route
          (/moderator_actions/me) only ever returns the caller's own. */}
          {permissions === 'moderator' ? <Resource
            name="moderator_actions"
            list={ActionList}
            icon={HistoryIcon}
            options={{ label: "My actions" }}

          /> : null}

          <CustomRoutes>
            {(permissions === 'moderator' ? reasonChoices : []).map((reason) => (
              <Route
                key={reason.id}
                path={reasonPath(reason.id)}
                element={
                  reason.id === "inappropriate" ? (
                    <InappropriateTicketList />
                  ) : (
                    <ReasonTicketList reason={reason.id} />
                  )
                }
              />
            ))}
          </CustomRoutes>

          {/* Everything below is public-facing, and `noLayout` keeps it out of the
          moderation shell: these pages are reached from Open Food Facts by
          contributors who are not moderators, and the layout's menu is a list
          of pages they are not allowed to open. It also puts them in the outer
          router, ahead of the layout's "/*" - which is what lets "/" be the
          home page instead of react-admin's dashboard slot. */}
          <CustomRoutes noLayout>
            <Route path="/" element={<HomePage />} />
            <Route path={FLAG_INFOS_ROUTE} element={<FlagInfos />} />
            <Route path={TUTORIAL_ROUTE} element={<Tutorial />} />
            {/* Filing a flag records who filed it, so it needs a session - but
            only a session, not moderator rights. */}
            <Route
              path={FLAG_PRODUCT_ROUTE}
              element={<FlagFormPage type_="product" />}
            />
            <Route
              path={FLAG_IMAGE_ROUTE}
              element={<FlagFormPage type_="image" />}
            />
            <Route path={THANKS_ROUTE} element={<ThanksPage />} />
            {/* Deliberately unguarded: it is where checkAuth sends a signed-in
            non-moderator, so a check of its own would bounce them straight
            back to it. */}
            <Route path={NOT_MODERATOR_ROUTE} element={<NonModeratorPage />} />
          </CustomRoutes></>)
      }
    </Admin>
  );
}
