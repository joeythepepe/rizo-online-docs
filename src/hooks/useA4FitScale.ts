import { useEffect, useState, type RefObject } from "react";

/**
 * Scale an A4 (210mm) frame to fit the container width with horizontal padding.
 * Returns 1 when the container is wide enough for full size.
 */
export function useA4FitScale(
  containerRef: RefObject<HTMLElement | null>,
  paddingPx = 32,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      // 210mm ≈ 793.7 CSS px at 96dpi
      const a4CssPx = (210 / 25.4) * 96;
      const available = Math.max(0, width - paddingPx * 2);
      if (available <= 0) {
        setScale(1);
        return;
      }
      setScale(Math.min(1, available / a4CssPx));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, paddingPx]);

  return scale;
}
