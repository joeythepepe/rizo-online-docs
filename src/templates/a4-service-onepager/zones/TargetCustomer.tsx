import type { TargetCustomer as TargetCustomerData } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { Chip } from "../../../components/Chip";
import { SectionLabel } from "../../../components/SectionLabel";

export interface TargetCustomerProps {
  data: TargetCustomerData;
}

/**
 * Target customer max 52 mm: section title, summary Bi, optional chips.
 * Segments/profiles: CN chip row then EN chip row (full bilingual).
 */
export function TargetCustomer({ data }: TargetCustomerProps) {
  const title = data.title ?? BILINGUAL_CHROME.targetSection;
  const segments = data.segments ?? [];
  const profiles = data.profiles ?? [];

  return (
    <section className="max-h-[52mm] shrink-0 overflow-hidden">
      <SectionLabel value={title} />
      <BiText value={data.summary} role="body" className="mt-mm-4" />

      {segments.length > 0 ? (
        <div className="mt-mm-4 flex flex-col gap-mm-2">
          <div className="flex flex-wrap gap-mm-2">
            {segments.map((seg, i) => (
              <Chip key={`seg-zh-${i}`} tone="zh">
                {seg.zh}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-mm-2">
            {segments.map((seg, i) => (
              <Chip key={`seg-en-${i}`} tone="en">
                {seg.en}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {profiles.length > 0 ? (
        <div className="mt-mm-2 flex flex-col gap-mm-2">
          <div className="flex flex-wrap gap-mm-2">
            {profiles.map((p, i) => (
              <Chip key={`profile-zh-${i}`} tone="zh">
                {p.zh}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-mm-2">
            {profiles.map((p, i) => (
              <Chip key={`profile-en-${i}`} tone="en">
                {p.en}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
