import { Link, Stack, Typography } from "@mui/material";
import type { Flag } from "../dataProvider";
import { flagReasonLabel } from "./flags";
import { userUrl } from "./flavorUrls";

/** How many lines of a comment the compact form shows before clamping. */
const CLAMPED_LINES = 3;

/**
 * One report, as the person who filed it left it: who they are, what they
 * picked from the form, and whatever they typed.
 *
 * `dense` is the ticket list's version - clamped and stripped to the two
 * things worth scanning a list for. The full one, on the ticket page, adds
 * where the flag came from and when, and lets the comment run.
 */
export function FlagSummary({
  flag,
  dense = false,
}: {
  flag: Flag;
  dense?: boolean;
}) {
  const reason = flagReasonLabel(flag.reason);
  // Robotoff files flags of its own, and older ones predate the form asking;
  // either way there is a row to show, just nobody to credit or link to.
  const author = flag.user_id || "unknown";

  return (
    <Stack spacing={0.25}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="baseline"
        flexWrap="wrap"
        useFlexGap
      >
        {flag.user_id ? (
          <Link
            href={userUrl(flag.flavor, flag.user_id)}
            target="_blank"
            rel="noopener"
            variant="body2"
            fontWeight="medium"
          >
            {author}
          </Link>
        ) : (
          <Typography variant="body2" fontWeight="medium" color="text.secondary">
            {author}
          </Typography>
        )}
        {reason && (
          <Typography variant="caption" color="text.secondary">
            {reason}
          </Typography>
        )}
        {!dense && (
          <Typography variant="caption" color="text.secondary">
            {flag.source} · {new Date(flag.created_at).toLocaleString()}
            {/* Only the automated sources score themselves - a person filling
                in the form has nothing to be confident about. */}
            {flag.confidence != null &&
              ` · confidence ${Math.round(flag.confidence * 100)}%`}
          </Typography>
        )}
      </Stack>

      {flag.comment ? (
        <Typography
          variant="body2"
          // The comment is the moderator's actual evidence, so it keeps the
          // line breaks the reporter typed. In a table cell it is clamped
          // instead of pushing every row taller than the thumbnail next to
          // it - `title` and the ticket page both have the whole thing.
          title={dense ? flag.comment : undefined}
          sx={{
            whiteSpace: "pre-wrap",
            ...(dense && {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: CLAMPED_LINES,
              overflow: "hidden",
            }),
          }}
        >
          {flag.comment}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled" fontStyle="italic">
          No comment
        </Typography>
      )}
    </Stack>
  );
}
