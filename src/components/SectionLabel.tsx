import type { BiString } from "../content/types";
import { BiText } from "./BiText";

/**
 * Section title pair — print-title / print-en-title (not label/eyebrow tokens).
 * Use BiText role="label" directly for chrome eyebrows (category, doc label).
 */
export function SectionLabel({
  value,
  className = "",
}: {
  value: BiString;
  className?: string;
}) {
  return <BiText value={value} role="title" className={className} />;
}
