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
export async function deleteProductImage(
  barcode: string,
  imgid: number,
  flavor: string,
): Promise<void> {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/products/${encodeURIComponent(barcode)}/images/delete`,
      { imgids: [imgid], flavor },
      // Carries the Open Food Facts session cookie, which is what the API
      // acts with - without it the call is refused.
      { withCredentials: true },
    );
  } catch (error) {
    // The API explains its refusals in `detail` ("requires an Open Food Facts
    // session cookie", "moderator session was not accepted"...); losing that
    // for a bare "Request failed with status code 401" would leave the
    // moderator with nothing to act on.
    const detail = (error as { response?: { data?: { detail?: string } } })
      .response?.data?.detail;
    throw new Error(detail ?? (error as Error).message);
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
