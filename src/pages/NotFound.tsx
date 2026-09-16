import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * react-admin's `catchAll`, shown for any unclaimed path.
 *
 * It renders inside the moderation layout, so it fills the content area
 * rather than the viewport, and leaves the menu in place as a way out.
 */
export default function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        py: 8,
      }}
    >
      <Typography variant="h1">404</Typography>
      <Typography variant="h4">Page not found</Typography>
      <Button component={Link} to="/" variant="outlined">
        Back to NutriPatrol
      </Button>
    </Box>
  );
}
