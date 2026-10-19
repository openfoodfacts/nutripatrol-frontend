/** Product identifiers stay strings so leading zeroes are preserved. */
export function isProductBarcode(value: unknown): value is string {
  return typeof value === "string" && /^[0-9]{4,30}$/.test(value);
}
