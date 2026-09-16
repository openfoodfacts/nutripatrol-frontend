import { Box } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Centres a short message in the viewport.
 *
 * For the pages mounted outside the moderation layout (AdminApp's `noLayout`
 * routes) that have nothing to say beyond a sentence and a way out: there is
 * no app bar for them to sit under, so they own the whole screen.
 */
export default function StandalonePage({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        p: 2,
      }}
    >
      {children}
    </Box>
  );
}
