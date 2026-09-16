import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-admin";
import StandalonePage from "./StandalonePage";
import { sessionCookieChanged } from "../admin/authProvider";
import { TICKETS_ROUTE } from "../admin/routes";
import {
  applyDevRole,
  devMode,
  devRoles,
  getDevRole,
  type DevRole,
} from "../admin/devAuth";

// react-admin remembers the page that bounced the user here, so that picking
// an account can put them back on it. It is only set when the redirect came
// from a guarded route - a login page opened by hand has nothing to go back to.
interface LoginLocationState {
  nextPathname?: string;
  nextSearch?: string;
}

/**
 * Where a signed-in user belongs: back where they were headed, or - failing
 * that - the ticket list, which is the app's landing page for an account.
 */
function signedInPath(state: LoginLocationState | null): string {
  if (state?.nextPathname) return state.nextPathname + (state.nextSearch ?? "");
  return TICKETS_ROUTE;
}

/**
 * Where a role lands once it has been picked: back where the user was headed,
 * or - failing that - somewhere that role can actually see.
 */
function landingPath(role: DevRole, state: LoginLocationState | null): string {
  // Nothing to go back to while signed out: every guarded route would send
  // them straight here again.
  if (role === "anonymous") return "/login";
  if (role === "contributor" && !state?.nextPathname) return "/";
  return signedInPath(state);
}

/**
 * The account switcher shown in place of the Open Food Facts hand-off when the
 * app runs in dev mode.
 *
 * The three roles are the three ways the app behaves, and switching between
 * them is otherwise impossible on localhost - see admin/devAuth for why there
 * is no real session to switch.
 */
function DevRoleSwitcher() {
  const { state } = useLocation() as { state: LoginLocationState | null };
  const current = getDevRole();

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 560 }}>
      <Stack spacing={2} alignItems="center">
        <Alert severity="info" sx={{ textAlign: "left" }}>
          Development mode: Open Food Facts sets its session cookie on an
          openfoodfacts host, so there is no real session to sign into from
          localhost. Pick the account to play instead.
        </Alert>
        <ToggleButtonGroup
          exclusive
          value={current}
          orientation="vertical"
          sx={{ width: "100%" }}
          onChange={(_, role: DevRole | null) => {
            // null is the group telling us the current button was clicked
            // again; re-applying the role it already has would only cost a
            // reload.
            if (role === null || role === current) return;
            applyDevRole(role, landingPath(role, state));
          }}
        >
          {devRoles.map((role) => (
            <ToggleButton
              key={role.id}
              value={role.id}
              sx={{ textTransform: "none", textAlign: "left" }}
            >
              <Stack>
                <Typography variant="subtitle1">{role.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {role.description}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Paper>
  );
}

/**
 * The Open Food Facts hand-off, plus the watch that notices it worked.
 *
 * The sign-in itself happens on another site in another tab, so this page is
 * in the background at the very moment the session appears and nothing in it
 * would otherwise re-render. Hence the watch on the tab coming back to the
 * front: that is exactly when the answer can have changed, so returning from
 * Open Food Facts lands the user on the tickets rather than on the login
 * button they just used.
 *
 * Returning to the tab is not itself news, though - the session cookie
 * changing is. react-query's own `refetchOnWindowFocus` cannot tell the two
 * apart and would re-run checkAuth every time the user so much as glanced at
 * another window; this asks OFF only when the cookie it would ask about has
 * actually moved.
 *
 * `logoutOnFailure` stays false: "not signed in" is the normal state here, and
 * logging out would only redirect this page to itself.
 */
function OpenFoodFactsLogin() {
  const { state } = useLocation() as { state: LoginLocationState | null };
  const { isPending, isFetching, authenticated, refetch } = useAuthState(
    undefined,
    false,
    { refetchOnWindowFocus: false, staleTime: 0 },
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      // Nothing to re-ask: the cached verdict was derived from this very
      // cookie, so checkAuth would replay it - at the cost of a re-render, and
      // of a round-trip to OFF on any focus that lands between the cache being
      // dropped and it being filled again.
      if (!sessionCookieChanged()) return;
      refetch();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refetch]);

  // Checking costs a round-trip to Open Food Facts whenever a session cookie
  // is present; showing the button meanwhile would flash it at a user who is
  // already signed in and about to be redirected away.
  if (isPending) return <CircularProgress />;

  // `!isFetching` because react-query hands back the previous answer while it
  // re-asks, and "yes" is exactly the answer that goes stale here: logging out
  // lands on this page, and redirecting on a pre-logout "yes" would throw the
  // user straight back into the app they just left. Waiting costs nothing the
  // other way round - a signed-out visitor sees the button, and the redirect
  // happens if and when the check comes back signed in.
  if (authenticated && !isFetching) {
    return <Navigate to={signedInPath(state)} replace />;
  }

  return (
    <Button
      href={`${import.meta.env.VITE_PO_URL}/cgi/session.pl`}
      target="_blank"
      rel="noopener"
      variant="contained"
      color="primary"
    >
      Login
    </Button>
  );
}

/**
 * react-admin's `loginPage`, mounted at /login.
 *
 * NutriPatrol has no accounts of its own: signing in happens on Open Food
 * Facts, which sets the shared `session` cookie the authProvider reads back.
 * So this leaves the app instead of submitting a form - and opens a tab, so
 * that whatever the user was trying to reach is still here when they return.
 */
export default function LoginPage() {
  return (
    <StandalonePage>
      <Typography variant="h4">
        Login with your Open Food Facts account
      </Typography>
      {/* Dev mode deliberately keeps the page put even when "signed in": the
      switcher is the only way to change role, and redirecting a signed-in
      developer away from it would make it unreachable. */}
      {devMode ? <DevRoleSwitcher /> : <OpenFoodFactsLogin />}
    </StandalonePage>
  );
}
