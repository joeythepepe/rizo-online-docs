import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { loadProduct } from "../content/loadProduct";
import type { ServiceOnePagerContent } from "../content/types";
import { ServiceOnePager } from "../templates/a4-service-onepager/ServiceOnePager";

/**
 * Apply `?density=compact` export override (Promotes compact CSS for overflow retry).
 * Query wins over product `layout.density`.
 */
function applyDensityOverride(
  content: ServiceOnePagerContent,
  densityParam: string | null,
): ServiceOnePagerContent {
  if (densityParam !== "compact" && densityParam !== "normal") {
    return content;
  }
  return {
    ...content,
    layout: {
      ...content.layout,
      density: densityParam,
    },
  };
}

/**
 * Chrome-less print root — no nav, no page shadow (export / designer print).
 * Query: `?export=1` (marker for tooling), `?density=compact` (overflow retry).
 */
export function ProductPrintPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  if (!id) return <Navigate to="/" replace />;

  let content: ServiceOnePagerContent;
  try {
    content = applyDensityOverride(
      loadProduct(id),
      searchParams.get("density"),
    );
  } catch (err) {
    return (
      <div className="bg-paper p-mm-14 text-ink">
        <p>未知产品：{id}</p>
        <pre className="mt-mm-4 text-print-meta text-ink-secondary">
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>
    );
  }

  const density = content.layout?.density ?? "normal";

  return (
    <div
      className="bg-paper"
      data-export={searchParams.get("export") ?? undefined}
      data-density={density}
    >
      <ServiceOnePager content={content} />
    </div>
  );
}
