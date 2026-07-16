import type { BrandConfig } from "../../../content/types";

export interface FooterProps {
  brand: BrandConfig;
  showQr?: boolean;
}

/**
 * Bottom bar: optional WeChat QR only (no contact / version / CTA text).
 */
export function Footer({ brand, showQr = true }: FooterProps) {
  const showQrImage = showQr !== false && Boolean(brand.qrSrc);

  if (!showQrImage) {
    return null;
  }

  return (
    <footer className="flex h-[16mm] shrink-0 items-center justify-end overflow-hidden">
      <img
        src={brand.qrSrc}
        alt=""
        className="h-[14mm] w-[14mm] shrink-0 object-contain"
        width={120}
        height={120}
      />
    </footer>
  );
}
