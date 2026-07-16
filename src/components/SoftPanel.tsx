import type { ReactNode } from "react";

export interface SoftPanelProps {
  children: ReactNode;
  className?: string;
  /**
   * Optional 2 pt left accent bar (mutually exclusive with accent list numbers).
   * Uses Tailwind `border-accent` token (#0071E3).
   */
  accentBar?: boolean;
  /** Compact density: p-mm-4 instead of p-mm-8. */
  compact?: boolean;
}

/**
 * Soft fill panel — rounded-none document feel, p-mm-8 internal padding
 * (p-mm-4 when compact).
 */
export function SoftPanel({
  children,
  className = "",
  accentBar = false,
  compact = false,
}: SoftPanelProps) {
  return (
    <div
      className={[
        "rounded-none bg-soft",
        compact ? "p-mm-4" : "p-mm-8",
        accentBar ? "border-l-[2pt] border-accent" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
