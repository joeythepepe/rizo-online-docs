import { notFound } from "next/navigation";
import { listProductIds, loadProduct } from "@/content/loadProduct";
import type { ServiceOnePagerContent } from "@/content/types";
import { ServiceOnePager } from "@/templates/a4-service-onepager/ServiceOnePager";

export function generateStaticParams() {
  return listProductIds().map((id) => ({ id }));
}

function applyDensityOverride(
  content: ServiceOnePagerContent,
  densityParam: string | null | undefined,
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
 * Chrome-less print root — export / designer print.
 * Query: `?export=1`, `?density=compact`.
 */
export default async function PrintRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ export?: string; density?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  let content: ServiceOnePagerContent;
  try {
    content = applyDensityOverride(loadProduct(id), sp.density ?? null);
  } catch {
    notFound();
  }

  const density = content.layout?.density ?? "normal";

  return (
    <div
      className="bg-paper"
      data-export={sp.export ?? undefined}
      data-density={density}
    >
      <ServiceOnePager content={content} />
    </div>
  );
}
