import type { ListItem, BiString } from "../../../content/types";
import { BILINGUAL_CHROME } from "../../../content/defaults/bilingual";
import { BiText } from "../../../components/BiText";
import { SectionLabel } from "../../../components/SectionLabel";
import { SoftPanel } from "../../../components/SoftPanel";

export interface DeliverablesProps {
  title?: BiString;
  intro?: BiString;
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
  const listGap = compact ? "gap-mm-2" : "gap-mm-4";
  const bodyRole = compact ? "body-sm" : "body";

  return (
    <>
      <SectionLabel value={sectionTitle} />
      {intro ? <BiText value={intro} role={bodyRole} className="mt-mm-4" /> : null}
      <ul className={`mt-mm-4 flex list-none flex-col ${listGap} p-0`}>
        {items.map((item) => (
          <li key={item.id} className="flex gap-mm-2">
            <span className="text-print-body text-accent shrink-0" aria-hidden>
              ·
            </span>
            <div className="min-w-0">
              <BiText value={item.label} role={bodyRole} />
              {item.detail ? (
                <BiText value={item.detail} role="meta" className="mt-mm-1" />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Service deliverables — bilingual list. SoftPanel optional (default: none;
 * SoftPanel is on requirements by default).
 */
export function Deliverables(props: DeliverablesProps) {
  const body = <DeliverablesBody {...props} />;
  if (props.softPanel) {
    return (
      <section className="min-h-0">
        <SoftPanel>{body}</SoftPanel>
      </section>
    );
  }
  return <section className="min-h-0">{body}</section>;
}
