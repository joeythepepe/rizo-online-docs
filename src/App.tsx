import { useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { listProductIds, loadProduct } from "./content/loadProduct";
import { EXAM_PATHWAYS } from "./content/pathways";
import type { ExamPathway, ServiceOnePagerContent } from "./content/types";
import { CountryFlag } from "./components/CountryFlag";
import { ServiceOnePager } from "./templates/a4-service-onepager/ServiceOnePager";

interface GalleryCard {
  id: string;
  name: string;
  countryCode?: string;
  pathway?: ExamPathway;
}

function loadGalleryCards(): GalleryCard[] {
  return listProductIds().map((id) => {
    try {
      const p = loadProduct(id);
      return {
        id,
        name: p.product.name,
        countryCode: p.product.countryCode,
        pathway: p.product.pathway,
      };
    } catch {
      return { id, name: id };
    }
  });
}

function GalleryPage() {
  const allCards = useMemo(() => loadGalleryCards(), []);
  const [pathway, setPathway] = useState<ExamPathway>("gaokao");

  const filtered = useMemo(
    () => allCards.filter((c) => c.pathway === pathway),
    [allCards, pathway],
  );

  const activeMeta = EXAM_PATHWAYS.find((p) => p.id === pathway);

  return (
    <div className="min-h-screen bg-[#e8e8ed] p-8">
      <header className="no-print mb-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-ink">睿卓升学一站通</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          【路线】通【国家】· 本科申请服务说明
        </p>
      </header>

      {/* 考生路线筛选 */}
      <section className="no-print mb-8 max-w-5xl">
        <p className="mb-3 text-sm font-medium text-ink">考生路线</p>
        <div className="flex flex-wrap gap-2">
          {EXAM_PATHWAYS.map((p) => {
            const active = p.id === pathway;
            const count = allCards.filter((c) => c.pathway === p.id).length;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPathway(p.id)}
                className={[
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "bg-paper text-ink border border-rule hover:border-accent",
                ].join(" ")}
              >
                {p.label}
                <span
                  className={[
                    "ml-1.5 text-xs",
                    active ? "text-white/80" : "text-ink-tertiary",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {activeMeta ? (
          <p className="mt-3 text-sm text-ink-secondary">
            {activeMeta.description}
            <span className="text-ink-tertiary">
              {" "}
              · 下方为「{activeMeta.label}通【国家】」服务
            </span>
          </p>
        ) : null}
      </section>

      <ul className="grid max-w-5xl list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((card) => (
          <li
            key={card.id}
            className="rounded-lg border border-rule bg-paper p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              {card.countryCode ? (
                <CountryFlag code={card.countryCode} className="h-6 w-auto" />
              ) : null}
              <p className="text-base font-medium text-ink">{card.name}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link
                className="text-accent underline-offset-2 hover:underline"
                to={`/p/${card.id}`}
              >
                预览
              </Link>
              <Link
                className="text-accent underline-offset-2 hover:underline"
                to={`/print/${card.id}`}
              >
                打印
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-ink-secondary">
          该路线暂无服务一页纸，请选择其他考生路线。
        </p>
      ) : null}
    </div>
  );
}

function ProductPreviewPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" replace />;

  let content;
  try {
    content = loadProduct(id);
  } catch (err) {
    return (
      <div className="min-h-screen bg-[#e8e8ed] p-8">
        <p className="text-ink">未知产品：{id}</p>
        <Link className="mt-4 inline-block text-accent" to="/">
          ← 返回
        </Link>
        <pre className="mt-4 text-xs text-ink-secondary">
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8e8ed] py-8">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between px-4">
        <div>
          <Link className="text-sm text-accent" to="/">
            ← 返回
          </Link>
          <p className="mt-1 text-xs text-ink-tertiary">
            预览 · {content.product.name} ·{" "}
            <Link className="text-accent" to={`/print/${id}`}>
              打开打印页
            </Link>
          </p>
        </div>
      </div>
      <div className="mx-auto w-a4 shadow-lg">
        <ServiceOnePager content={content} />
      </div>
    </div>
  );
}

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
function ProductPrintPage() {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/p/:id" element={<ProductPreviewPage />} />
        <Route path="/print/:id" element={<ProductPrintPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
