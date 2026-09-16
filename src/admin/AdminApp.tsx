import type { ReactNode } from "react";
import { Admin, Authenticated, CustomRoutes, Layout, Menu, Resource } from "react-admin";
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
import {
  FLAG_IMAGE_ROUTE,
  FLAG_INFOS_ROUTE,
  FLAG_PRODUCT_ROUTE,
  NOT_MODERATOR_ROUTE,
  THANKS_ROUTE,
  TUTORIAL_ROUTE,
} from "./routes";
import HomePage from "../pages/HomePage";
import FlagInfos from "../pages/FlagInfos";
import FlagFormPage from "../pages/FlagFormPage";
import ThanksPage from "../pages/ThanksPage";
import Tutorial from "../pages/Tutorial";
import LoginPage from "../pages/LoginPage";
import NonModeratorPage from "../pages/NonModeratorPage";
import NotFound from "../pages/NotFound";

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

// checkAuth requires a moderator unless told otherwise, because that is what
// every moderation page needs. The flag form is the exception: it is linked
// from Open Food Facts product pages and is meant for any contributor, so it
// asks for the weaker check.
const SIGNED_IN = { moderatorOnly: false };

function SignedIn({ children }: { children: ReactNode }) {
  return <Authenticated authParams={SIGNED_IN}>{children}</Authenticated>;
}

export function AdminApp() {
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
      </CustomRoutes>
    </Admin>
  );
}
