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
 * Target customer: section title, summary, optional CN chips.
 * No overflow-hidden — silent clipping was cropping CJK glyphs.
 */
export function TargetCustomer({ data, compact = false }: TargetCustomerProps) {
  const title = data.title ?? BILINGUAL_CHROME.targetSection;
  const segments = data.segments ?? [];
  const profiles = data.profiles ?? [];
  const bodyRole = compact ? "body-sm" : "body";
  const chipGap = compact ? "gap-mm-1" : "gap-mm-2";
  const stackMt = compact ? "mt-mm-2" : "mt-mm-4";

  return (
    <section className="shrink-0 overflow-visible">
      <SectionLabel value={title} />
      <BiText value={data.summary} role={bodyRole} className={stackMt} />

      {segments.length > 0 ? (
        <div className={`${stackMt} flex flex-wrap ${chipGap}`}>
          {segments.map((seg, i) => (
            <Chip key={`seg-${i}`} tone="zh" compact={compact}>
              {seg}
            </Chip>
          ))}
        </div>
      ) : null}

      {profiles.length > 0 ? (
        <div className={`mt-mm-2 flex flex-wrap ${chipGap}`}>
          {profiles.map((p, i) => (
            <Chip key={`profile-${i}`} tone="zh" compact={compact}>
              {p}
            </Chip>
          ))}
        </div>
      ) : null}
    </section>
  );
}
