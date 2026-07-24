import Link from "next/link";
import { A4Viewport } from "../components/preview/A4Viewport";
import type { ServiceOnePagerContent } from "../content/types";
import { ServiceOnePager } from "../templates/a4-service-onepager/ServiceOnePager";

export interface CompareItem {
  id: string;
  content: ServiceOnePagerContent | null;
  error: string | null;
}

export function ComparePage({ items }: { items: CompareItem[] }) {
  return (
    <div className="min-h-screen bg-ui-background font-ui text-ui-foreground">
      <header className="sticky top-0 z-10 border-b border-ui-border bg-ui-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
            >
              ← 方案库
            </Link>
            <p className="mt-0.5 font-display text-sm font-semibold">方案对比</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/p/${item.id}`}
                className="rounded-full border border-ui-border bg-ui-card px-3 py-1 text-xs font-medium hover:border-ui-foreground/25"
              >
                {item.content?.product.name ?? item.id}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-3 py-6 lg:grid-cols-2">
        {items.map((item) => (
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
