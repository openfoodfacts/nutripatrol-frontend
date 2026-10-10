import axios from "axios";

/**
 * Deleting a flagged picture from Open Food Facts.
 *
 * The API does it on the moderator's behalf rather than the browser talking
 * to Open Food Facts directly: it forwards their session cookie, so Open Food
 * Facts applies its own permission checks and records the deletion under
 * their name (see nutripatrol's app/moderation_api.py). Open Food Facts moves
 * the picture to the trash rather than erasing it, so the action can be
 * reviewed afterwards.
 */
async function act(
  barcode: string,
  path: string,
  body: Record<string, unknown>,
  method: "post" | "patch" = "post",
): Promise<void> {
  const url = `${import.meta.env.VITE_API_URL}/products/${encodeURIComponent(barcode)}${path}`;
  try {
    // Carries the Open Food Facts session cookie, which is what the API
    // acts with - without it the call is refused.
    await axios.request({ method, url, data: body, withCredentials: true });
  } catch (error) {
    // The API explains its refusals in `detail` ("requires an Open Food Facts
    // session cookie", "moderator session was not accepted", "the new barcode
    // is the current one"...); losing that for a bare "Request failed with
    // status code 401" would leave the moderator with nothing to act on.
    throw new Error(apiDetail(error) ?? (error as Error).message);
  }
}

function apiDetail(error: unknown): string | undefined {
  return (error as { response?: { data?: { detail?: string } } }).response
    ?.data?.detail;
}

export async function deleteProductImage(
  barcode: string,
  imgid: number,
  flavor: string,
): Promise<void> {
  return deleteProductImages(barcode, [imgid], flavor);
}

export async function deleteProductImages(
  barcode: string,
  imgids: number[],
  flavor: string,
): Promise<void> {
  return act(barcode, "/images/delete", { imgids, flavor });
}

/**
 * Delete a product page.
 *
 * Open Food Facts flags it as deleted rather than erasing it, so a moderator
 * can undo this from the product edit form.
 */
export async function deleteOffProduct(
  barcode: string,
  comment: string,
  flavor: string,
): Promise<void> {
  return act(barcode, "/delete", { comment, flavor });
}

/** Mark a product as no longer sold. It is kept, but left out of search. */
export async function setProductObsolete(
  barcode: string,
  obsolete: boolean,
  flavor: string,
  comment?: string,
): Promise<void> {
  return act(barcode, "/obsolete", { obsolete, flavor, comment });
}

/**
 * Move a ticket's product to another project, and close the ticket as fixed.
 *
 * One call rather than an edit followed by a status change: the API closes
 * the ticket itself, and only once Open Food Facts has accepted the move, so
 * there is no state where the product moved but the ticket stayed open.
 * Open Food Facts keeps the previous type in `old_product_type`, so the move
 * can be reverted.
 */
export async function moveTicketProduct(
  ticketId: number,
  flavor: string,
  comment?: string,
): Promise<void> {
  const url = `${import.meta.env.VITE_API_URL}/tickets/${ticketId}/move_product`;
  try {
    await axios.post(url, { flavor, comment }, { withCredentials: true });
  } catch (error) {
    throw new Error(apiDetail(error) ?? (error as Error).message);
  }
}

/**
 * The id to delete a ticket's picture by, or null if there is none.
 *
 * Only an *uploaded* image has one: a ticket can instead name a selected
 * image ("front_fr"), which designates a crop of an upload rather than a file
 * of its own, and which Open Food Facts ignores when asked to delete it.
 */
export function uploadedImageId(imageId: string | null | undefined): number | null {
  if (!imageId || !/^\d+$/.test(imageId)) return null;
  const imgid = Number(imageId);
  return imgid > 0 ? imgid : null;
}
