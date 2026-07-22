import type { ReactNode } from "react";

/**
 * A4 print page shell — 210×297 mm frame with 14 mm safe area.
 * Geometry lives in design-tokens/print.css (.a4-page / .a4-safe).
 *
 * PDF-only logo matrix watermark: present in DOM as one baked SVG layer,
 * visible only under ancestors with `data-export="1"` (download / CLI capture).
 * Web preview and plain `/print/:id` browsing stay watermark-free.
 */
export function A4Page({ children }: { children: ReactNode }) {
  return (
    <div className="a4-page bg-paper text-ink font-sans" data-page="a4">
      {/* Baked matrix layer — CSS hides unless [data-export="1"] ancestor */}
      <div className="a4-watermark" aria-hidden="true">
        <img
          src="/brand/watermark-matrix.svg"
          alt=""
          className="a4-watermark-img"
          width={210}
          height={297}
          draggable={false}
        />
      </div>
      <div className="a4-safe flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}
