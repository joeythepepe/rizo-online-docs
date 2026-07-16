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
 */
export function Highlights({ title, items, compact = false }: HighlightsProps) {
  if (!items.length) return null;

  const sectionTitle = title ?? BILINGUAL_CHROME.highlights;
  const listGap = compact ? "gap-mm-1" : "gap-mm-2";
  const textCls = compact ? "text-print-body-sm" : "text-print-body";

  return (
    <section className="max-h-[36mm] shrink-0 overflow-hidden">
      <SectionLabel value={sectionTitle} />
      <ul className={`mt-mm-2 flex list-none flex-col ${listGap} p-0`}>
        {items.map((item, i) => (
          <li key={i} className="flex gap-mm-2">
            <span className={`${textCls} text-accent shrink-0`} aria-hidden>
              ·
            </span>
            <p className={`${textCls} text-ink min-w-0`}>{item}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
