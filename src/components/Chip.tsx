import type { ReactNode } from "react";

export interface ChipProps {
  children: ReactNode;
  className?: string;
  /** CN chips use print-label; EN secondary chips use print-en-label / 400 */
  tone?: "zh" | "en";
  /**
   * Compact density: shorter min-height and tighter padding (real style change
   * for overflow retry / layout.density=compact).
   */
  compact?: boolean;
}

/**
 * Segment / profile chip — 2 mm radius, soft fill, label type.
 */
export function Chip({
  children,
  className = "",
  tone = "zh",
  compact = false,
}: ChipProps) {
  const type =
    tone === "en"
      ? "text-print-en-label font-normal text-ink-secondary"
      : "text-print-label text-ink";

  const size = compact
    ? "min-h-[5mm] px-[2mm] py-[1mm]"
    : "min-h-[6mm] px-[3mm] py-[1.5mm]";

  return (
    <span
      className={`inline-flex items-center rounded-chip bg-soft ${size} ${type} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
