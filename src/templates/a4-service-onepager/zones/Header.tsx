import type { BiString, BrandConfig } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";

export interface HeaderProps {
  brand: BrandConfig;
  docLabel?: BiString;
}

/**
 * Fixed header: larger Rizo wordmark left, Chinese doc label right.
 * Logo caps: max 12 mm tall / 72 mm wide; object-contain.
 * Company name is not shown beside the logo (SVG includes the mark).
 */
export function Header({
  brand,
  docLabel = BILINGUAL_CHROME.docLabel,
}: HeaderProps) {
  const logoSrc = brand.logoSrc ?? "/brand/logo.svg";
  // Intrinsic size of public/brand/logo.svg (viewBox 378×51)
  const logoW = 378;
  const logoH = 51;

  return (
    <header className="flex h-[20mm] shrink-0 items-center justify-between gap-mm-4">
      <div className="flex min-w-0 items-center gap-mm-4">
        <img
          src={logoSrc}
          alt={brand.companyName.zh || "Rizo"}
          className="h-[12mm] w-auto max-w-[72mm] object-contain object-left"
          width={logoW}
          height={logoH}
        />
      </div>
      <BiText
        value={docLabel}
        role="label"
        className="shrink-0 text-right"
      />
    </header>
  );
}
