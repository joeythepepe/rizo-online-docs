import type { BiString } from "../content/types";
import { BiText } from "./BiText";

/**
 * Section eyebrow label pair (CN label + EN label).
 */
export function SectionLabel({
  value,
  className = "",
}: {
  value: BiString;
  className?: string;
}) {
  return <BiText value={value} role="label" className={className} />;
}
