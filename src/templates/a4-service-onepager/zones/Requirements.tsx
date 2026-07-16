import type { ListItem, BiString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { SectionLabel } from "../../../components/SectionLabel";
import { SoftPanel } from "../../../components/SoftPanel";

export interface RequirementsProps {
  title?: BiString;
  intro?: BiString;
  items: ListItem[];
  /** SoftPanel on by default per design (softPanelOn: requirements) */
  softPanel?: boolean;
  compact?: boolean;
  /** Accent digits when SoftPanel has no accent bar */
  accentNumbers?: boolean;
}

function RequirementsBody({
  title,
  intro,
  items,
  compact,
  accentNumbers = true,
}: Omit<RequirementsProps, "softPanel">) {
  const sectionTitle = title ?? BILINGUAL_CHROME.requirementsSection;
  // Vertical list + horizontal number↔text share the same mm step today.
  const gap = compact ? "gap-mm-2" : "gap-mm-4";
  const stackMt = compact ? "mt-mm-2" : "mt-mm-4";
  const bodyRole = compact ? "body-sm" : "body";
  const numCls = compact ? "text-print-body-sm" : "text-print-body";

  return (
    <>
      <SectionLabel value={sectionTitle} />
      {intro ? (
        <BiText value={intro} role={bodyRole} className={stackMt} />
      ) : null}
      <ol className={`${stackMt} flex list-none flex-col ${gap} p-0`}>
        {items.map((item, index) => (
          <li key={item.id} className={`flex ${gap}`}>
            <span
              className={`${numCls} shrink-0 tabular-nums ${
                accentNumbers ? "text-accent" : "text-ink"
              }`}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <BiText value={item.label} role={bodyRole} />
              {item.detail ? (
                <BiText value={item.detail} role="meta" className="mt-mm-1" />
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

/**
 * Client requirements — priority flex consumer; SoftPanel default.
 */
export function Requirements({
  softPanel = true,
  compact,
  ...rest
}: RequirementsProps) {
  const body = <RequirementsBody compact={compact} {...rest} />;
  if (softPanel) {
    return (
      <section className="min-h-0 shrink-0">
        <SoftPanel compact={compact}>{body}</SoftPanel>
      </section>
    );
  }
  return <section className="min-h-0 shrink-0">{body}</section>;
}
