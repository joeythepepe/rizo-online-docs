import type { BrandConfig, ServiceOnePagerContent } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";

export interface FooterProps {
  brand: BrandConfig;
  meta: ServiceOnePagerContent["meta"];
  showQr?: boolean;
}

/**
 * Fixed 16 mm footer: meta rows + optional QR.
 * Dense horizontal layout so the band does not silent-clip under export measure.
 */
export function Footer({ brand, meta, showQr = true }: FooterProps) {
  const showQrImage = showQr !== false && Boolean(brand.qrSrc);
  const cycle = meta.cycleLabel;
  const price = meta.priceBand;
  const ctaLabel = brand.ctaLabel ?? BILINGUAL_CHROME.ctaLabel;

  const contactParts = [brand.contactLine, brand.wechatId]
    .filter(Boolean)
    .join(" · ");

  const metaLine = [
    contactParts,
    `${meta.version} · 1/1`,
    meta.confidential
      ? `${BILINGUAL_CHROME.confidential.zh}/${BILINGUAL_CHROME.confidential.en}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="flex h-[16mm] shrink-0 items-center justify-between gap-mm-4 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-mm-1 overflow-hidden">
        {(cycle || price) && (
          <div className="flex flex-wrap items-baseline gap-mm-4 overflow-hidden">
            {cycle ? (
              <span className="text-print-meta text-ink-tertiary">
                <span className="text-ink-secondary">{cycle.zh}</span>
                <span className="text-ink-tertiary"> / {cycle.en}</span>
              </span>
            ) : null}
            {price ? (
              <span className="text-print-meta text-ink-tertiary">
                <span className="text-ink-secondary">{price.zh}</span>
                <span className="text-ink-tertiary"> / {price.en}</span>
              </span>
            ) : null}
          </div>
        )}

        <p className="truncate text-print-meta text-ink-tertiary">{metaLine}</p>

        {ctaLabel ? (
          <p className="truncate text-print-meta">
            <span className="text-accent">{ctaLabel.zh}</span>
            <span className="text-ink-tertiary"> / {ctaLabel.en}</span>
          </p>
        ) : null}
      </div>

      {showQrImage ? (
        <img
          src={brand.qrSrc}
          alt=""
          className="h-[14mm] w-[14mm] shrink-0 object-contain"
        />
      ) : null}
    </footer>
  );
}
