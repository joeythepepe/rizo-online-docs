import type { ServiceOnePagerContent } from "../../../content/types";
import { BiText } from "../../../components/BiText";
import { CountryFlag } from "../../../components/CountryFlag";

export interface HeroProps {
  product: ServiceOnePagerContent["product"];
  /** Compact density: tighter category → name → tagline gaps. */
  compact?: boolean;
}

/**
 * Hero: Chinese product name + country flag, optional tagline.
 * categoryLabel is not shown (redundant with pathway filter / product name).
 */
export function Hero({ product, compact = false }: HeroProps) {
  const stackMt = compact ? "mt-mm-1" : "mt-mm-2";
  const taglineRole = compact ? "body-sm" : "body";
  const flagClass = compact
    ? "h-[7mm] w-auto"
    : "h-[9mm] w-auto";

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
    </section>
  );
}
