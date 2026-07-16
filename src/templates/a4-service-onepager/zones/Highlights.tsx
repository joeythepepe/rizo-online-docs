import type { ZhString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { SectionLabel } from "../../../components/SectionLabel";

export interface HighlightsProps {
  title?: ZhString;
  items: ZhString[];
  compact?: boolean;
}

/**
 * Optional highlights zone — Chinese-only bullet items.
 * No overflow-hidden / max-height: clipping was cutting CJK glyph tops
 * (e.g. 「欧盟」looked like 「欧明」). Page-level overflow is measured at export.
 * Cap visible items at 3 to keep A4 fit after training bullets were added.
 */
export function Highlights({ title, items, compact = false }: HighlightsProps) {
  if (!items.length) return null;

  const sectionTitle = title ?? BILINGUAL_CHROME.highlights;
  const listGap = compact ? "gap-mm-1" : "gap-mm-2";
  // Slightly smaller type reduces risk of bottom-of-page crop
  const textCls = "text-print-body-sm";
  const visible = items.slice(0, 3);

  return (
    <section className="shrink-0 overflow-visible">
      <SectionLabel value={sectionTitle} />
      <ul className={`mt-mm-2 flex list-none flex-col ${listGap} p-0`}>
        {visible.map((item, i) => (
          <li key={i} className="flex items-start gap-mm-2">
            <span
              className={`${textCls} text-accent shrink-0 leading-[1.5]`}
              aria-hidden
            >
              ·
            </span>
            <p className={`${textCls} text-ink min-w-0 leading-[1.5]`}>{item}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
