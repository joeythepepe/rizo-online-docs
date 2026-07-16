import type { ReactNode } from "react";

export interface ChipProps {
  children: ReactNode;
  className?: string;
  /** CN chips use print-label; EN secondary chips use print-en-label / 400 */
  tone?: "zh" | "en";
}

/**
 * Segment / profile chip — 2 mm radius, soft fill, label type.
 */
export function Chip({ children, className = "", tone = "zh" }: ChipProps) {
  const type =
    tone === "en"
      ? "text-print-en-label font-normal text-ink-secondary"
      : "text-print-label text-ink";

  return (
    <span
      className={`inline-flex min-h-[6mm] items-center rounded-chip bg-soft px-[3mm] py-[1.5mm] ${type} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
