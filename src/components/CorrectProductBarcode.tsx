import { Alert, Link, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { flavorSiteUrl, productUrl } from "../admin/tickets/flavorUrls";
import { isProductBarcode } from "../utils/barcode";

type Lookup = { barcode: string; flavor: string; message: string; found: boolean };

export default function CorrectProductBarcode({ value, currentBarcode, flavor, onChange }: {
  value: string;
  currentBarcode: string;
  flavor: string;
  onChange: (value: string) => void;
}) {
  const barcode = value.trim();
  const valid = isProductBarcode(barcode) && barcode !== currentBarcode;
  const [lookup, setLookup] = useState<Lookup | null>(null);

  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${flavorSiteUrl(flavor)}/api/v2/product/${encodeURIComponent(barcode)}?fields=code,product_name`,
          { signal: controller.signal },
        );
        if (!response.ok && response.status !== 404) throw new Error("Lookup failed");
        const data = await response.json();
        if (controller.signal.aborted) return;
        const found = data.status === 1 && Boolean(data.product);
        setLookup({ barcode, flavor, found, message: found
          ? data.product.product_name || barcode
          : "Product not found in this project. A moderator can still create it when moving the image." });
      } catch {
        if (!controller.signal.aborted) setLookup({ barcode, flavor, found: false,
          message: "Could not check this product. You can still send the report." });
      }
    }, 400);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [barcode, flavor, valid]);

  const result = lookup?.barcode === barcode && lookup.flavor === flavor && valid ? lookup : null;
  return <>
    <TextField
      name="correct_barcode"
      label="Correct product barcode (optional)"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      margin="normal"
      error={Boolean(barcode) && !valid}
      helperText={barcode && !valid
        ? "Enter a different barcode with 4 to 30 digits, or leave it blank."
        : "The barcode of the product this image actually shows. Leave blank if unknown."}
      inputProps={{ inputMode: "numeric", pattern: "[0-9]{4,30}", maxLength: 30 }}
    />
    {result && <Alert severity={result.found ? "success" : "info"} sx={{ width: "100%", mt: 1 }}>
      {result.found
        ? <Link href={productUrl(flavor, barcode)} target="_blank" rel="noopener">{result.message}</Link>
        : result.message}
    </Alert>}
  </>;
}
