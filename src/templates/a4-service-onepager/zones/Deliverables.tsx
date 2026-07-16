import type { ListItem, ZhString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { SectionLabel } from "../../../components/SectionLabel";
import { SoftPanel } from "../../../components/SoftPanel";

export interface DeliverablesProps {
  title?: ZhString;
  intro?: ZhString;
  items: ListItem[];
  /** Wrap in SoftPanel when layout.softPanelOn === "deliverables" */
  softPanel?: boolean;
  compact?: boolean;
}

function DeliverablesBody({
  title,
  intro,
  items,
  compact,
}: Omit<DeliverablesProps, "softPanel">) {
  const sectionTitle = title ?? BILINGUAL_CHROME.deliverablesSection;
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
              className={`${numCls} text-accent shrink-0 tabular-nums`}
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
 * Service deliverables — Chinese numbered list (matches requirements style).
 * SoftPanel optional (default: none; SoftPanel is on requirements by default).
 */
export function Deliverables(props: DeliverablesProps) {
  const body = <DeliverablesBody {...props} />;
  if (props.softPanel) {
    return (
      <section className="min-h-0">
        <SoftPanel compact={props.compact}>{body}</SoftPanel>
      </section>
    );
  }
  return <section className="min-h-0">{body}</section>;
}
