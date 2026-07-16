import type { ZhString } from "../content/types";
import { BiText } from "./BiText";

/**
 * Section title — Chinese-only via BiText role="title".
 */
export function SectionLabel({
  value,
  className = "",
}: {
  value: ZhString;
  className?: string;
}) {
  return <BiText value={value} role="title" className={className} />;
}
