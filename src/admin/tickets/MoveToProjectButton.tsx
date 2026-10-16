import { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import { useNotify } from "react-admin";
import { projects } from "../../const/flagsConst";
import type { QueueTicketActionProps } from "./fixQueues";
import { moveTicketProduct } from "./offImages";
import { useDropTicket } from "./useDropTicket";

/**
 * Move the product to a project the moderator picks, for when the reporters
 * named none, or the wrong one.
 *
 * A menu of the other projects, next to the button: picking one is the
 * confirmation. The project the reports suggest, if any, is highlighted.
 */
export function MoveToProjectButton({
  ticket,
  suggested,
}: QueueTicketActionProps & { suggested?: string }) {
  const notify = useNotify();
  const dropTicket = useDropTicket();
  const choices = projects.filter((project) => project.value !== ticket.flavor);
  // The button the menu hangs from; null while it is closed.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [running, setRunning] = useState(false);

  if (!ticket.barcode || choices.length === 0) return null;

  const move = async (spec: (typeof projects)[number]) => {
    setAnchor(null);
    setRunning(true);
    try {
      // Closes the ticket as fixed in the same call.
      await moveTicketProduct(
        ticket.id,
        spec.value,
        "Moved after a NutriPatrol report: not a product of this project",
      );
      notify(`Moved to ${spec.label}, ticket closed`, { type: "info" });
      dropTicket(ticket.id);
    } catch (error) {
      notify((error as Error).message, { type: "error" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<DriveFileMoveIcon />}
        disabled={running}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ whiteSpace: "nowrap" }}
      >
        Move to…
      </Button>
      <Menu
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
      >
        {choices.map((project) => (
          <MenuItem
            key={project.value}
            selected={project.value === suggested}
            onClick={() => move(project)}
          >
            {project.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
