import type { BiString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { SectionLabel } from "../../../components/SectionLabel";

export interface HighlightsProps {
  title?: BiString;
  items: BiString[];
}

/**
 * Optional highlights zone — max 28 mm. Omit entirely when empty / not shown.
 */
export function Highlights({ title, items }: HighlightsProps) {
  if (!items.length) return null;

  const sectionTitle = title ?? BILINGUAL_CHROME.highlights;

  return (
    <section className="max-h-[28mm] shrink-0 overflow-hidden">
      <SectionLabel value={sectionTitle} />
      <ul className="mt-mm-4 flex list-none flex-col gap-mm-2 p-0">
        {items.map((item, i) => (
          <li key={i} className="flex gap-mm-2">
            <span className="text-print-body text-accent shrink-0" aria-hidden>
              ·
            </span>
            <BiText value={item} role="body" />
          </li>
        ))}
      </ul>
    </section>
  );
}
