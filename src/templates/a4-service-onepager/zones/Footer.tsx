import type { BrandConfig, ServiceOnePagerContent } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";

export interface FooterProps {
  brand: BrandConfig;
  meta: ServiceOnePagerContent["meta"];
  showQr?: boolean;
}

/**
 * Fixed 16 mm footer: cycle/price, contact, version, 1/1, optional QR + CTA.
 */
export function Footer({ brand, meta, showQr = true }: FooterProps) {
  const showQrImage = showQr !== false && Boolean(brand.qrSrc);
  const cycle = meta.cycleLabel;
  const price = meta.priceBand;
  const ctaLabel = brand.ctaLabel ?? BILINGUAL_CHROME.ctaLabel;

  const contactParts = [brand.contactLine, brand.wechatId]
    .filter(Boolean)
    .join(" · ");

  const cyclePriceZh = [cycle?.zh, price?.zh].filter(Boolean).join(" · ");
  const cyclePriceEn = [cycle?.en, price?.en].filter(Boolean).join(" · ");

  return (
    <footer className="flex h-[16mm] shrink-0 items-center justify-between gap-mm-4">
      <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
        {cyclePriceZh ? (
          <p className="text-print-meta text-ink-tertiary truncate">
            {cyclePriceZh}
            {cyclePriceEn ? (
              <span className="text-print-en-meta"> · {cyclePriceEn}</span>
            ) : null}
          </p>
        ) : null}

        <p className="text-print-meta text-ink-tertiary truncate">
          {contactParts ? `${contactParts} · ` : ""}
          {meta.version} · 1/1
          {ctaLabel ? (
            <span className="text-accent">
              {" "}
              · {ctaLabel.zh}
              <span className="text-print-en-meta text-ink-tertiary">
                {" "}
                / {ctaLabel.en}
              </span>
            </span>
          ) : null}
        </p>
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
