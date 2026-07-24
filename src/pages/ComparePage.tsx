import { useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { A4Viewport } from "../components/preview/A4Viewport";
import { loadProduct } from "../content/loadProduct";
import { ServiceOnePager } from "../templates/a4-service-onepager/ServiceOnePager";

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export function ComparePage() {
  const [searchParams] = useSearchParams();
  const ids = useMemo(
    () => parseIds(searchParams.get("ids")),
    [searchParams],
  );

  if (ids.length < 2) {
    return <Navigate to="/" replace />;
  }

  const loaded = ids.map((id) => {
    try {
      return { id, content: loadProduct(id), error: null as string | null };
    } catch (err) {
      return {
        id,
        content: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return (
    <div className="min-h-screen bg-ui-background font-ui text-ui-foreground">
      <header className="sticky top-0 z-10 border-b border-ui-border bg-ui-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
          <div>
            <Link
              to="/"
              className="text-sm font-medium text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
            >
              ← 方案库
            </Link>
            <p className="mt-0.5 font-display text-sm font-semibold">
              方案对比
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {loaded.map((item) => (
              <Link
                key={item.id}
                to={`/p/${item.id}`}
                className="rounded-full border border-ui-border bg-ui-card px-3 py-1 text-xs font-medium hover:border-ui-foreground/25"
              >
                {item.content?.product.name ?? item.id}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-3 py-6 lg:grid-cols-2">
        {loaded.map((item) => (
          <section key={item.id} className="min-w-0">
            <h2 className="mb-3 truncate px-1 font-display text-sm font-semibold">
              {item.content?.product.name ?? item.id}
            </h2>
            {item.error || !item.content ? (
              <p className="text-sm text-red-600">加载失败：{item.error}</p>
            ) : (
              <A4Viewport paddingPx={12}>
                <ServiceOnePager content={item.content} />
              </A4Viewport>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
