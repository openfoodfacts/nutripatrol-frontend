import { createContext, useContext } from "react";

/** One uploaded picture of a product, as read from Open Food Facts. */
export interface ProductImage {
  /** Upload id ("1", "2"...), what the image server files the picture by. */
  imgid: string;
  /** Username of whoever uploaded it. */
  uploader?: string;
  uploadedAt?: Date;
  /** Size of the original, in px. */
  width?: number;
  height?: number;
  /** The selected crops made from it ("front_fr", "nutrition_en"...). */
  selectedAs: string[];
}

export interface ImagesContextValue {
  barcode: string;
  flavor: string;
  /** Uploaded pictures, newest first. Empty while loading. */
  images: ProductImage[];
  /** Undefined while loading, and for a picture the product no longer has. */
  getImage: (imgid: string) => ProductImage | undefined;
  /** Whether the pictures' data was read, so `getImage` can be trusted. */
  hasData: boolean;
  isPending: boolean;
  isError: boolean;
  /** Whether pictures show a button to select them. */
  selectable: boolean;
  selected: string[];
  isSelected: (imgid: string) => boolean;
  toggleSelected: (imgid: string) => void;
}

export const ImagesReactContext = createContext<ImagesContextValue | null>(
  null,
);

/** The pictures of the product of the closest `<ImagesContext>`. */
export function useImages(): ImagesContextValue {
  const value = useContext(ImagesReactContext);
  if (!value) {
    throw new Error("useImages must be used inside an <ImagesContext>");
  }
  return value;
}
