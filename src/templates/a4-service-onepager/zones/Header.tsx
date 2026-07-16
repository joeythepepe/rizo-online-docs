import type { BiString, BrandConfig } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";

export interface HeaderProps {
  brand: BrandConfig;
  docLabel?: BiString;
}

/**
 * Fixed 16 mm header: brand logo left (Rizo wordmark), doc label right.
 * Logo caps: max 8 mm tall / 48 mm wide (wide wordmarks); object-contain.
 * Company name BiString is not shown beside the logo — the SVG includes the mark.
 * Art: `public/brand/logo.svg` (see README).
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
    <header className="flex h-[16mm] shrink-0 items-center justify-between gap-mm-4">
      <div className="flex min-w-0 items-center gap-mm-4">
        <img
          src={logoSrc}
          alt={brand.companyName.zh || "Rizo"}
          className="h-[8mm] w-auto max-w-[48mm] object-contain object-left"
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
