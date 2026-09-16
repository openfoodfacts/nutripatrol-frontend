import { Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import StandalonePage from "./StandalonePage";

/**
 * Where authProvider.checkAuth sends a signed-in user without moderator
 * rights. Their session is fine, so offering them the login form again would
 * only send them round in a circle - this says what is actually wrong, and
 * points at the part of the site they can use.
 */
export default function NonModeratorPage() {
  return (
    <StandalonePage>
      <Typography variant="h4">
        You have to be a moderator to access this page.
      </Typography>
      <Button component={Link} to="/" variant="outlined">
        Back to NutriPatrol
      </Button>
    </StandalonePage>
  );
}
