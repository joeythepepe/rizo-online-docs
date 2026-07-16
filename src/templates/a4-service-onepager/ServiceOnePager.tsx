import type { ServiceOnePagerContent } from "../../content/types";
import { A4Page } from "../../components/A4Page";
import { Hairline } from "../../components/Hairline";
import { Header } from "./zones/Header";
import { Hero } from "./zones/Hero";
import { TargetCustomer } from "./zones/TargetCustomer";
import { Deliverables } from "./zones/Deliverables";
import { Requirements } from "./zones/Requirements";
import { Highlights } from "./zones/Highlights";
import { Timeline } from "./zones/Timeline";
import { Disclaimer } from "./zones/Disclaimer";
import { Footer } from "./zones/Footer";

export interface ServiceOnePagerProps {
  content: ServiceOnePagerContent;
}

/**
 * A4 service one-pager — stack (default) or split body layout.
 *
 * Split (`layout.variant: "split"`) is data-driven only (no viewport breakpoints).
 * Content width 182 mm, gutter 4 mm, 12-col math:
 *   col = (182 − 11×4) / 12 = 11.5 mm
 *   Deliverables col-span-5 → 73.5 mm
 *   Requirements col-span-7 → 104.5 mm
 */
export function ServiceOnePager({ content }: ServiceOnePagerProps) {
  const layout = content.layout ?? {};
  const softPanelOn = layout.softPanelOn ?? "requirements";
  const compact = layout.density === "compact";
  /** Default stack when unset — split only when product JSON opts in. */
  const variant = layout.variant ?? "stack";
  const isSplit = variant === "split";
  /**
   * `layout.showHighlights` gates the optional block for **both** highlights and
   * timeline (schema: mutually exclusive). Unset / true → show whichever is present;
   * false → omit both. Not a highlights-only switch despite the field name.
   */
  const showOptionalBlock = layout.showHighlights !== false;

  const showHighlights =
    showOptionalBlock &&
    Boolean(content.highlights?.items?.length) &&
    !content.timeline;
  const showTimeline =
    showOptionalBlock && Boolean(content.timeline?.steps?.length);

  // Dense stack: bilingual body needs tighter inter-zone gaps than mm-12 to fit A4.
  const sectionGap = compact ? "gap-mm-4" : "gap-mm-6";
  const sectionTop = compact ? "mt-mm-6" : "mt-mm-8";

  const deliverables = (
    <Deliverables
      title={content.deliverables.title}
      intro={content.deliverables.intro}
      items={content.deliverables.items}
      softPanel={softPanelOn === "deliverables"}
      compact={compact}
    />
  );

  const requirements = (
    <Requirements
      title={content.requirements.title}
      intro={content.requirements.intro}
      items={content.requirements.items}
      softPanel={softPanelOn === "requirements"}
      compact={compact}
    />
  );

  return (
    <A4Page>
      <Header brand={content.brand} />
      <Hairline className="mb-mm-4" />

      <Hero product={content.product} compact={compact} />

      {/* Body: target → (deliverables/requirements stack or 5/7 split) → optional */}
      <div
        className={`${sectionTop} flex min-h-0 flex-1 flex-col ${sectionGap}`}
        data-density={compact ? "compact" : "normal"}
        data-layout-variant={variant}
      >
        <TargetCustomer data={content.targetCustomer} compact={compact} />

        {isSplit ? (
          /* Equal-height stretch (default) fills SoftPanel to taller column — intentional. */
          <div
            className="grid min-h-0 grid-cols-12 gap-mm-4"
            data-split-grid="5-7"
          >
            {/* 5×11.5 + 4×4 = 73.5 mm */}
            <div className="col-span-5 min-w-0" data-split-col="5">
              {deliverables}
            </div>
            {/* 7×11.5 + 6×4 = 104.5 mm */}
            <div className="col-span-7 min-w-0" data-split-col="7">
              {requirements}
            </div>
          </div>
        ) : (
          <>
            {deliverables}
            {requirements}
          </>
        )}

        {showHighlights && content.highlights ? (
          <Highlights
            title={content.highlights.title}
            items={content.highlights.items}
            compact={compact}
          />
        ) : null}

        {showTimeline && content.timeline ? (
          <Timeline
            title={content.timeline.title}
            steps={content.timeline.steps}
            compact={compact}
          />
        ) : null}
      </div>

      <div className={`${sectionTop} shrink-0`}>
        <Disclaimer value={content.meta.disclaimer} />
      </div>

      <Footer
        brand={content.brand}
        meta={content.meta}
        showQr={layout.showQr !== false}
      />
    </A4Page>
  );
}

export default ServiceOnePager;
