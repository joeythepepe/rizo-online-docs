import type { ReactNode } from "react";

/**
 * Segment / profile chip — 2 mm radius, soft fill, label type.
 */
export function Chip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-[6mm] items-center rounded-chip bg-soft px-[3mm] py-[1.5mm] text-print-label text-ink ${className}`.trim()}
    >
      {children}
    </span>
  );
}
