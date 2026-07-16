import type { BiString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { SectionLabel } from "../../../components/SectionLabel";

export interface TimelineStep {
  id: string;
  label: BiString;
  timeHint?: BiString;
}

export interface TimelineProps {
  title?: BiString;
  steps: TimelineStep[];
}

/**
 * Optional timeline zone (mutually exclusive with highlights) — max 28 mm.
 */
export function Timeline({ title, steps }: TimelineProps) {
  if (!steps.length) return null;

  const sectionTitle = title ?? BILINGUAL_CHROME.timeline;

  return (
    <section className="max-h-[28mm] shrink-0 overflow-hidden">
      <SectionLabel value={sectionTitle} />
      <ol className="mt-mm-4 flex list-none flex-col gap-mm-2 p-0">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-mm-4">
            <span
              className="text-print-body text-accent shrink-0 tabular-nums"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <BiText value={step.label} role="body" />
              {step.timeHint ? (
                <BiText value={step.timeHint} role="meta" className="mt-mm-1" />
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
