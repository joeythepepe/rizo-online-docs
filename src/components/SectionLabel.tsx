import type { BiString } from "../content/types";
import { BiText } from "./BiText";

/**
 * Section title — Chinese only via BiText role="title".
 * Use BiText role="label" for chrome eyebrows (category, doc label).
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
