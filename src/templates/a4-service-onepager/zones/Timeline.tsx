import type { ZhString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { SectionLabel } from "../../../components/SectionLabel";

export interface TimelineStep {
  id: string;
  label: ZhString;
  timeHint?: ZhString;
}

export interface TimelineProps {
  title?: ZhString;
  steps: TimelineStep[];
  compact?: boolean;
}

/**
 * Optional timeline zone (mutually exclusive with highlights).
 */
export function Timeline({ title, steps, compact = false }: TimelineProps) {
  if (!steps.length) return null;

  const sectionTitle = title ?? BILINGUAL_CHROME.timeline;
  const listGap = compact ? "gap-mm-1" : "gap-mm-2";
  const bodyRole = compact ? "body-sm" : "body";
  const numCls = compact ? "text-print-body-sm" : "text-print-body";

  return (
    <section className="shrink-0 overflow-visible">
      <SectionLabel value={sectionTitle} />
      <ol className={`mt-mm-2 flex list-none flex-col ${listGap} p-0`}>
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-mm-4">
            <span
              className={`${numCls} text-accent shrink-0 tabular-nums`}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <BiText value={step.label} role={bodyRole} />
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
