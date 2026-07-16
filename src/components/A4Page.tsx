import type { ReactNode } from "react";

/**
 * A4 print page shell — 210×297 mm frame with 14 mm safe area.
 * Geometry lives in design-tokens/print.css (.a4-page / .a4-safe).
 */
export function A4Page({ children }: { children: ReactNode }) {
  return (
    <div className="a4-page bg-paper text-ink font-sans" data-page="a4">
      <div className="a4-safe flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}
