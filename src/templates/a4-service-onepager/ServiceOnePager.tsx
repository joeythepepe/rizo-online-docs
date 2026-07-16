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
 * A4 service one-pager — stack layout (v1).
 * Composes fixed header/footer with flex body zones inside A4Page.
 */
export function ServiceOnePager({ content }: ServiceOnePagerProps) {
  const layout = content.layout ?? {};
  const softPanelOn = layout.softPanelOn ?? "requirements";
  const compact = layout.density === "compact";
  const showOptional =
    layout.showHighlights !== false &&
    (Boolean(content.highlights?.items?.length) ||
      Boolean(content.timeline?.steps?.length));

  const showHighlights =
    showOptional &&
    Boolean(content.highlights?.items?.length) &&
    !content.timeline;
  const showTimeline =
    showOptional && Boolean(content.timeline?.steps?.length);

  return (
    <A4Page>
      <Header brand={content.brand} />
      <Hairline className="mb-mm-4" />

      <Hero product={content.product} />

      {/* Body flex column: target → deliverables → requirements → optional */}
      <div className="mt-mm-12 flex min-h-0 flex-1 flex-col gap-mm-12 overflow-hidden">
        <TargetCustomer data={content.targetCustomer} />

        <Deliverables
          title={content.deliverables.title}
          intro={content.deliverables.intro}
          items={content.deliverables.items}
          softPanel={softPanelOn === "deliverables"}
          compact={compact}
        />

        <Requirements
          title={content.requirements.title}
          intro={content.requirements.intro}
          items={content.requirements.items}
          softPanel={softPanelOn === "requirements"}
          compact={compact}
        />

        {showHighlights && content.highlights ? (
          <Highlights
            title={content.highlights.title}
            items={content.highlights.items}
          />
        ) : null}

        {showTimeline && content.timeline ? (
          <Timeline
            title={content.timeline.title}
            steps={content.timeline.steps}
          />
        ) : null}
      </div>

      <div className="mt-mm-12 shrink-0">
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
