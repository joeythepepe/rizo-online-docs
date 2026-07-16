import type { TargetCustomer as TargetCustomerData } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { Chip } from "../../../components/Chip";
import { SectionLabel } from "../../../components/SectionLabel";

export interface TargetCustomerProps {
  data: TargetCustomerData;
  /** Compact density: body-sm summary, tighter chip gaps/padding. */
  compact?: boolean;
}

/**
 * Target customer max 52 mm: section title, summary Bi, optional chips.
 * Segments/profiles: CN chip row then EN chip row (full bilingual).
 */
export function TargetCustomer({ data, compact = false }: TargetCustomerProps) {
  const title = data.title ?? BILINGUAL_CHROME.targetSection;
  const segments = data.segments ?? [];
  const profiles = data.profiles ?? [];
  const bodyRole = compact ? "body-sm" : "body";
  const chipGap = compact ? "gap-mm-1" : "gap-mm-2";
  const stackMt = compact ? "mt-mm-2" : "mt-mm-4";

  return (
    <section className="max-h-[52mm] shrink-0 overflow-hidden">
      <SectionLabel value={title} />
      <BiText value={data.summary} role={bodyRole} className={stackMt} />

      {segments.length > 0 ? (
        <div className={`${stackMt} flex flex-col ${chipGap}`}>
          <div className={`flex flex-wrap ${chipGap}`}>
            {segments.map((seg, i) => (
              <Chip key={`seg-zh-${i}`} tone="zh" compact={compact}>
                {seg.zh}
              </Chip>
            ))}
          </div>
          <div className={`flex flex-wrap ${chipGap}`}>
            {segments.map((seg, i) => (
              <Chip key={`seg-en-${i}`} tone="en" compact={compact}>
                {seg.en}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {profiles.length > 0 ? (
        <div className={`mt-mm-2 flex flex-col ${chipGap}`}>
          <div className={`flex flex-wrap ${chipGap}`}>
            {profiles.map((p, i) => (
              <Chip key={`profile-zh-${i}`} tone="zh" compact={compact}>
                {p.zh}
              </Chip>
            ))}
          </div>
          <div className={`flex flex-wrap ${chipGap}`}>
            {profiles.map((p, i) => (
              <Chip key={`profile-en-${i}`} tone="en" compact={compact}>
                {p.en}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
