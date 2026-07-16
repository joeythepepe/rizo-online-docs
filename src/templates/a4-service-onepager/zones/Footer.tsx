import type { BrandConfig, ServiceOnePagerContent } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";

export interface FooterProps {
  brand: BrandConfig;
  meta: ServiceOnePagerContent["meta"];
  showQr?: boolean;
}

/**
 * Fixed 16 mm footer: Chinese-only meta rows + optional QR + ctaDetail when QR shown.
 * No CSS ellipsis — wrap within the band; vertical overflow fails export measure.
 */
export function Footer({ brand, meta, showQr = true }: FooterProps) {
  const showQrImage = showQr !== false && Boolean(brand.qrSrc);
  const cycle = meta.cycleLabel;
  const price = meta.priceBand;
  const ctaLabel = brand.ctaLabel ?? BILINGUAL_CHROME.ctaLabel;
  const ctaDetail = brand.ctaDetail ?? BILINGUAL_CHROME.ctaDetail;

  const contactParts = [brand.contactLine, brand.wechatId]
    .filter(Boolean)
    .join(" · ");

  const metaLine = [
    contactParts,
    `${meta.version} · 1/1`,
    meta.confidential ? BILINGUAL_CHROME.confidential.zh : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="flex h-[16mm] shrink-0 items-center justify-between gap-mm-4 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-mm-1">
        {(cycle || price) && (
          <div className="flex flex-wrap items-baseline gap-mm-4">
            {cycle ? (
              <span className="text-print-meta text-ink-secondary">
                {cycle.zh}
              </span>
            ) : null}
            {price ? (
              <span className="text-print-meta text-ink-secondary">
                {price.zh}
              </span>
            ) : null}
          </div>
        )}

        <p className="text-print-meta text-ink-tertiary">{metaLine}</p>

        {ctaLabel ? (
          <p className="text-print-meta">
            <span className="text-accent">{ctaLabel.zh}</span>
            {showQrImage && ctaDetail ? (
              <span className="text-ink-tertiary">
                {" · "}
                {ctaDetail.zh}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      {showQrImage ? (
        <img
          src={brand.qrSrc}
          alt=""
          className="h-[14mm] w-[14mm] shrink-0 object-contain"
          width={120}
          height={120}
        />
      ) : null}
    </footer>
  );
}
