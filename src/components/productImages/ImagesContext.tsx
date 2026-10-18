import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { flavorSiteUrl } from "../../admin/tickets/flavorUrls";
import {
  ImagesReactContext,
  type ImagesContextValue,
  type ProductImage,
} from "./useImages";

/**
 * An entry of the product's `images` field. Uploads are keyed by their id and
 * carry the upload details; selected crops ("front_fr") point to one by
 * `imgid`.
 */
interface RawImage {
  imgid?: string | number;
  uploaded_t?: string | number;
  uploader?: string;
  sizes?: { full?: { w?: number; h?: number } };
}

function parseImages(raw: Record<string, RawImage> | undefined): ProductImage[] {
  const entries = Object.entries(raw ?? {});
  const isUpload = (key: string) => /^\d+$/.test(key);

  const selectedAs = new Map<string, string[]>();
  for (const [key, image] of entries) {
    if (isUpload(key) || image.imgid == null) continue;
    const imgid = String(image.imgid);
    selectedAs.set(imgid, [...(selectedAs.get(imgid) ?? []), key]);
  }

  return entries
    .filter(([key]) => isUpload(key))
    .map(([imgid, image]) => ({
      imgid,
      uploader: image.uploader,
      // A Unix timestamp, in seconds - sometimes written as a string.
      uploadedAt: image.uploaded_t
        ? new Date(Number(image.uploaded_t) * 1000)
        : undefined,
      width: image.sizes?.full?.w,
      height: image.sizes?.full?.h,
      selectedAs: selectedAs.get(imgid) ?? [],
    }))
    .sort((a, b) => Number(b.imgid) - Number(a.imgid));
}

interface ImagesContextProps {
  barcode: string;
  flavor?: string;
  /** The selected pictures' ids, to control the selection. */
  selected?: string[];
  /** The pictures selected at first, when the selection is not controlled. */
  defaultSelected?: string[];
  onSelectionChange?: (selected: string[]) => void;
  /** Show the select buttons. Implied by `onSelectionChange`. */
  selectable?: boolean;
  /** Whether more than one picture can be selected at a time. */
  multiple?: boolean;
  /**
   * Read the product's pictures. Off, the pictures still show, but nothing
   * is known about them - for a list showing one per row, where a request
   * per row would be too many.
   */
  loadData?: boolean;
  children: ReactNode;
}

/**
 * Loads the pictures of a product, and the selection made among them, for the
 * `<Images>` and `<Image>` below it.
 *
 * Read from the public product API of the flavor's site, once per product:
 * every component under it shares the one request.
 */
export function ImagesContext({
  barcode,
  flavor = "off",
  selected,
  defaultSelected = [],
  onSelectionChange,
  selectable = onSelectionChange !== undefined,
  multiple = true,
  loadData = true,
  children,
}: ImagesContextProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["productImages", "details", flavor, barcode],
    queryFn: async () => {
      const response = await fetch(
        `${flavorSiteUrl(flavor)}/api/v2/product/${encodeURIComponent(barcode)}?fields=images`,
      );
      if (!response.ok) throw new Error(response.statusText);
      const body = (await response.json()) as {
        product?: { images?: Record<string, RawImage> };
      };
      return parseImages(body.product?.images);
    },
    enabled: loadData && Boolean(barcode),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [uncontrolledSelected, setUncontrolledSelected] =
    useState(defaultSelected);
  const currentSelected = selected ?? uncontrolledSelected;

  const value = useMemo<ImagesContextValue>(() => {
    const images = data ?? [];
    const byId = new Map(images.map((image) => [image.imgid, image]));
    return {
      barcode,
      flavor,
      images,
      getImage: (imgid) => byId.get(imgid),
      hasData: data !== undefined,
      // A disabled query stays pending: nothing is coming.
      isPending: loadData && isPending,
      isError,
      selectable,
      selected: currentSelected,
      isSelected: (imgid) => currentSelected.includes(imgid),
      toggleSelected: (imgid) => {
        let next: string[];
        if (currentSelected.includes(imgid)) {
          next = currentSelected.filter((id) => id !== imgid);
        } else {
          next = multiple ? [...currentSelected, imgid] : [imgid];
        }
        if (selected === undefined) setUncontrolledSelected(next);
        onSelectionChange?.(next);
      },
    };
  }, [
    barcode,
    flavor,
    data,
    loadData,
    isPending,
    isError,
    selectable,
    selected,
    currentSelected,
    multiple,
    onSelectionChange,
  ]);

  return <ImagesReactContext value={value}>{children}</ImagesReactContext>;
}
