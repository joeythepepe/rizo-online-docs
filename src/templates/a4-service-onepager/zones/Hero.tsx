import type { ServiceOnePagerContent } from "../../../content/types";
import { BiText } from "../../../components/BiText";

export interface HeroProps {
  product: ServiceOnePagerContent["product"];
  /** Compact density: tighter category → name → tagline gaps. */
  compact?: boolean;
}

/**
 * Hero max 54 mm: category, Chinese product name, optional tagline.
 * cycle/price live in Footer only.
 */
export function Hero({ product, compact = false }: HeroProps) {
  const stackMt = compact ? "mt-mm-1" : "mt-mm-2";
  const taglineRole = compact ? "body-sm" : "body";

  return (
    <section className="max-h-[54mm] shrink-0 overflow-hidden">
      {product.categoryLabel ? (
        <BiText value={product.categoryLabel} role="label" />
      ) : null}

      <BiText
        value={product.name}
        role="display"
        className={product.categoryLabel ? stackMt : undefined}
      />

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
