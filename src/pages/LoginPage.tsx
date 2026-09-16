import { Button, Typography } from "@mui/material";
import StandalonePage from "./StandalonePage";

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
      <Button
        href={`${import.meta.env.VITE_PO_URL}/cgi/session.pl`}
        target="_blank"
        rel="noopener"
        variant="contained"
        color="primary"
      >
        Login
      </Button>
    </StandalonePage>
  );
}
