import type { Flag } from "../dataProvider";
import {
  deleteProductImages,
  setProductType,
  uploadedImageId,
} from "./offImages";
import { projectSpec } from "../../const/flagsConst";

/**
 * Turning a report into the action it is asking for.
 *
 * Every action below is one whose arguments the report already carries --
 * its barcode, its image -- so the moderator confirms rather than
 * transcribes. A report without them produces no action, rather than a
 * disabled button: a row of greyed-out promises is worse than a short one.
 */
export interface SuggestedAction {
  key: string;
  /** Names the values it will use, because that is what is being confirmed. */
  label: string;
  /** The sentence in the confirmation dialog. */
  confirm: string;
  run: () => Promise<void>;
  /** Whether it changes Open Food Facts, and so deserves a hard confirm. */
  destructive?: boolean;
}

/**
 * The images a report points at, as ids Open Food Facts will act on: the
 * flagged image itself, since an image ticket is already about one.
 */
function imageIds(flag: Flag): number[] {
  const own = uploadedImageId(flag.image_id);
  return own === null ? [] : [own];
}

/**
 * What can be done about this report in one click.
 *
 * Pure, so that the mapping from a report to an action can be checked without
 * a browser or a moderator session.
 */
export function suggestedActions(flag: Flag): SuggestedAction[] {
  const { barcode, flavor, reason } = flag;
  if (!barcode) return [];

  const actions: SuggestedAction[] = [];
  const imgids = imageIds(flag);

  const deleteImages = (label: string): SuggestedAction => ({
    key: "delete-images",
    label: imgids.length > 1 ? `${label} (${imgids.length} images)` : label,
    confirm: `Move image${imgids.length > 1 ? "s" : ""} ${imgids.join(", ")} of ${barcode} to the Open Food Facts trash?`,
    run: () => deleteProductImages(barcode, imgids, flavor),
    destructive: true,
  });

  switch (reason) {

    case "not_a_product": {
      // Only when the reporter said where it belongs: a product of no
      // project at all is a deletion, which deserves a closer look than one
      // click.
      const target = projectSpec(flag.extra_data?.correct_flavor);
      if (!target || target.value === flavor) break;
      actions.push({
        key: "move-project",
        label: `Move to ${target.label}`,
        confirm: `Move ${barcode} to ${target.label}? It will no longer be listed on ${projectSpec(flavor)?.label ?? "its current project"}.`,
        run: () =>
          setProductType(
            barcode,
            target.productType,
            flavor,
            "Moved after a NutriPatrol report: not a product of this project",
          ),
        destructive: true,
      });
      break;
    }

    case "copyright":
    case "inappropriate":

      actions.push(deleteImages("Delete photo"));
      break;
  }

  return actions;
}
