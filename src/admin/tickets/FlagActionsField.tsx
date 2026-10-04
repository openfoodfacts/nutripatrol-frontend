import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import { useNotify, useRefresh, useUpdate, usePermissions } from "react-admin";
import type { Flag } from "../dataProvider";
import { suggestedActions } from "./flagActions";
import type { SuggestedAction } from "./flagActions";

/**
 * The actions a report already carries the arguments for.
 *
 * Shown on the ticket page only, next to the evidence that justifies them:
 * these change Open Food Facts, and some of them -- a barcode change, a
 * product deletion -- are heavier than anything the ticket list offers. The
 * confirmation names the exact values taken from the report, so what is being
 * agreed to is the action and not the button.
 *
 * Open Food Facts is asked first and the ticket is closed only once it has
 * accepted: closing a ticket whose picture is still up would lose the report.
 */
export function FlagActionsField({ flag }: { flag: Flag }) {
  const { permissions } = usePermissions();
  const notify = useNotify();
  const refresh = useRefresh();
  const [update] = useUpdate();
  const [pending, setPending] = useState<SuggestedAction | null>(null);
  const [running, setRunning] = useState(false);

  if (permissions !== "moderator") return null;

  const actions = suggestedActions(flag);
  if (actions.length === 0) return null;

  const run = async (action: SuggestedAction) => {
    setPending(null);
    setRunning(true);
    try {
      await action.run();
      update(
        "tickets",
        { id: flag.ticket_id, data: { status: "closed-fixed" } },
        {
          onSuccess: () => {
            notify("Done, and the ticket is closed", { type: "info" });
            refresh();
          },
          // The edit went through; only the ticket did not close. Saying so
          // beats a bare failure, which would invite doing it all again.
          onError: (error) =>
            notify(
              `Open Food Facts was updated, but the ticket stayed open: ${(error as Error).message}`,
              { type: "warning" },
            ),
        },
      );
    } catch (error) {
      notify((error as Error).message, { type: "error" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
        {actions.map((action) => (
          <Button
            key={action.key}
            size="small"
            variant="outlined"
            color={action.destructive ? "error" : "primary"}
            startIcon={<BoltIcon />}
            disabled={running}
            onClick={() => setPending(action)}
          >
            {action.label}
          </Button>
        ))}
      </Stack>

      <Dialog open={pending !== null} onClose={() => setPending(null)}>
        <DialogTitle>{pending?.label}</DialogTitle>
        <DialogContent>
          <DialogContentText>{pending?.confirm}</DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            The ticket will be closed as fixed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Cancel</Button>
          <Button
            color={pending?.destructive ? "error" : "primary"}
            variant="contained"
            onClick={() => pending && run(pending)}
          >
            {pending?.label}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
