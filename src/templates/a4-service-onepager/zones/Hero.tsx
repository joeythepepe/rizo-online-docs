import type { ServiceOnePagerContent } from "../../../content/types";
import { BiText } from "../../../components/BiText";
import { CountryFlag } from "../../../components/CountryFlag";

export interface HeroProps {
  product: ServiceOnePagerContent["product"];
  /** Compact density: tighter category → name → tagline gaps. */
  compact?: boolean;
}

/**
 * Hero: flag + product name, tagline, then 优势/劣势 intro under title.
 */
export function Hero({ product, compact = false }: HeroProps) {
  const stackMt = compact ? "mt-mm-1" : "mt-mm-2";
  const taglineRole = compact ? "body-sm" : "body";
  const flagClass = compact ? "h-[7mm] w-auto" : "h-[9mm] w-auto";
  const pros = product.pros?.slice(0, 3) ?? [];
  const cons = product.cons?.slice(0, 3) ?? [];
  const hasProsCons = pros.length > 0 || cons.length > 0;

  return (
    <section className="shrink-0 overflow-visible">
      <div className="flex items-center gap-mm-4">
        {product.countryCode ? (
          <CountryFlag code={product.countryCode} className={flagClass} />
        ) : null}
        <BiText value={product.name} role="display" className="min-w-0" />
      </div>

      {product.tagline ? (
        <BiText
          value={product.tagline}
          role={taglineRole}
          className={stackMt}
        />
      ) : null}

      {hasProsCons ? (
        <div
          className={`${stackMt} grid grid-cols-2 gap-mm-4 text-print-body-sm leading-[1.5]`}
        >
          {pros.length > 0 ? (
            <div className="min-w-0">
              <p className="text-print-label font-medium text-accent">
                {product.prosLabel ?? "优势"}
              </p>
              <ul className="mt-mm-1 list-none space-y-[1mm] p-0">
                {pros.map((item, i) => (
                  <li key={`pro-${i}`} className="flex gap-mm-2 text-ink">
                    <span className="shrink-0 text-accent" aria-hidden>
                      ·
                    </span>
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {cons.length > 0 ? (
            <div className="min-w-0">
              <p className="text-print-label font-medium text-ink-secondary">
                {product.consLabel ?? "劣势"}
              </p>
              <ul className="mt-mm-1 list-none space-y-[1mm] p-0">
                {cons.map((item, i) => (
                  <li key={`con-${i}`} className="flex gap-mm-2 text-ink">
                    <span className="shrink-0 text-ink-tertiary" aria-hidden>
                      ·
                    </span>
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
