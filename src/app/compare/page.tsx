import { redirect } from "next/navigation";
import { loadProduct } from "@/content/loadProduct";
import { ComparePage, type CompareItem } from "@/views/ComparePage";

function parseIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const s = Array.isArray(raw) ? raw.join(",") : raw;
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export default async function CompareRoute({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const sp = await searchParams;
  const ids = parseIds(sp.ids);
  if (ids.length < 2) {
    redirect("/");
  }

  const items: CompareItem[] = ids.map((id) => {
    try {
      return { id, content: loadProduct(id), error: null };
    } catch (err) {
      return {
        id,
        content: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return <ComparePage items={items} />;
}
