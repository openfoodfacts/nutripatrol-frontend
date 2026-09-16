import {
  Alert,
  Button,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import StandalonePage from "./StandalonePage";
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
 * Where a role lands once it has been picked: back where the user was headed,
 * or - failing that - somewhere that role can actually see.
 */
function landingPath(role: DevRole, state: LoginLocationState | null): string {
  // Nothing to go back to while signed out: every guarded route would send
  // them straight here again.
  if (role === "anonymous") return "/login";
  if (state?.nextPathname) return state.nextPathname + (state.nextSearch ?? "");
  return role === "moderator" ? TICKETS_ROUTE : "/";
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
      {devMode ? (
        <DevRoleSwitcher />
      ) : (
        <Button
          href={`${import.meta.env.VITE_PO_URL}/cgi/session.pl`}
          target="_blank"
          rel="noopener"
          variant="contained"
          color="primary"
        >
          Login
        </Button>
      )}
    </StandalonePage>
  );
}
