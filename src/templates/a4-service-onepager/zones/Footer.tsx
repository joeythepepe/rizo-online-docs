import type { BrandConfig, ServiceOnePagerContent } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";

export interface FooterProps {
  brand: BrandConfig;
  meta: ServiceOnePagerContent["meta"];
  showQr?: boolean;
}

/**
 * Fixed 16 mm footer: Bi cycle/price, contact, version, 1/1, Bi CTA, optional QR + ctaDetail.
 * No CSS ellipsis — wrap/clip within the fixed band; export overflow gate handles page fit.
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

  return (
    <footer className="flex h-[16mm] shrink-0 items-center justify-between gap-mm-4 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-mm-1 overflow-hidden">
        {(cycle || price) && (
          <div className="flex flex-wrap gap-mm-4">
            {cycle ? <BiText value={cycle} role="meta" /> : null}
            {price ? <BiText value={price} role="meta" /> : null}
          </div>
        )}

        <p className="text-print-meta text-ink-tertiary">
          {[contactParts, `${meta.version} · 1/1`].filter(Boolean).join(" · ")}
          {meta.confidential ? (
            <span>
              {" · "}
              {BILINGUAL_CHROME.confidential.zh} /{" "}
              {BILINGUAL_CHROME.confidential.en}
            </span>
          ) : null}
        </p>

        {ctaLabel ? (
          <BiText
            value={ctaLabel}
            role="meta"
            zhClassName="text-accent"
          />
        ) : null}

        {showQrImage && ctaDetail ? (
          <BiText value={ctaDetail} role="meta" />
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
