import type { ReactNode } from "react";

export interface SoftPanelProps {
  children: ReactNode;
  className?: string;
  /** Optional 2 pt left accent bar (mutually exclusive with accent list numbers). */
  accentBar?: boolean;
}

/**
 * Soft fill panel — rounded-none document feel, p-mm-8 internal padding.
 */
export function SoftPanel({
  children,
  className = "",
  accentBar = false,
}: SoftPanelProps) {
  return (
    <div
      className={`rounded-none bg-soft p-mm-8 ${className}`.trim()}
      style={
        accentBar
          ? { borderLeft: "2pt solid #0071E3" }
          : undefined
      }
    >
      {children}
    </div>
  );
}
