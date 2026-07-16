import type { BiString, BrandConfig } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";

export interface HeaderProps {
  brand: BrandConfig;
  docLabel?: BiString;
}

/**
 * Fixed 16 mm header: logo (≤8 mm) + company BiString left, doc label right.
 */
export function Header({
  brand,
  docLabel = BILINGUAL_CHROME.docLabel,
}: HeaderProps) {
  const logoSrc = brand.logoSrc ?? "/brand/logo.svg";

  return (
    <header className="flex h-[16mm] shrink-0 items-center justify-between gap-mm-4">
      <div className="flex min-w-0 items-center gap-mm-4">
        <img
          src={logoSrc}
          alt=""
          className="h-[8mm] w-auto max-w-[36mm] object-contain object-left"
        />
        <BiText value={brand.companyName} role="label" className="min-w-0" />
      </div>
      <BiText
        value={docLabel}
        role="label"
        className="shrink-0 text-right"
      />
    </header>
  );
}
