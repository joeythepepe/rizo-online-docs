import type { ServiceOnePagerContent } from "../../../content/types";
import { BiText } from "../../../components/BiText";

export interface HeroProps {
  product: ServiceOnePagerContent["product"];
}

/**
 * Hero max 54 mm: category, name CN+EN, optional tagline.
 * cycle/price live in Footer only.
 */
export function Hero({ product }: HeroProps) {
  return (
    <section className="max-h-[54mm] shrink-0 overflow-hidden">
      {product.categoryLabel ? (
        <BiText value={product.categoryLabel} role="label" />
      ) : null}

      <BiText
        value={product.name}
        role="display"
        className={product.categoryLabel ? "mt-mm-2" : undefined}
      />

      {product.tagline ? (
        <BiText value={product.tagline} role="body" className="mt-mm-2" />
      ) : null}
    </section>
  );
}
