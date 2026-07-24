import { useRef, type ReactNode } from "react";
import { useA4FitScale } from "../../hooks/useA4FitScale";

/**
 * Scales A4 (210×297 mm) to fit container width; reserves scaled height so layout does not collapse.
 */
export function A4Viewport({
  children,
  className = "",
  paddingPx = 24,
}: {
  children: ReactNode;
  className?: string;
  paddingPx?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useA4FitScale(ref, paddingPx);
  // CSS px for A4 at 96dpi (layout reservation only)
  const a4W = (210 / 25.4) * 96;
  const a4H = (297 / 25.4) * 96;

  return (
    <div ref={ref} className={`flex justify-center ${className}`.trim()}>
      <div
        style={{
          width: a4W * scale,
          height: a4H * scale,
        }}
      >
        <div
          className="origin-top-left shadow-lg"
          style={{
            width: "210mm",
            height: "297mm",
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
