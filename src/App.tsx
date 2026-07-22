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
import {
  PRODUCT_CATALOGS,
  TRAINING_STAGES,
  TRAINING_SUBJECTS_BY_STAGE,
  resolveProductCatalog,
  trainingSubjectMeta,
} from "./content/catalogs";
import { listProductIds, loadProduct } from "./content/loadProduct";
import { EXAM_PATHWAYS } from "./content/pathways";
import type {
  ExamPathway,
  ProductCatalog,
  ServiceOnePagerContent,
  TrainingStage,
  TrainingSubject,
} from "./content/types";
import { CountryFlag } from "./components/CountryFlag";
import { DownloadPdfButton } from "./components/DownloadPdfButton";
import { ServiceOnePager } from "./templates/a4-service-onepager/ServiceOnePager";

interface GalleryCard {
  id: string;
  name: string;
  countryCode?: string;
  catalog: ProductCatalog;
  pathway?: ExamPathway;
  trainingStage?: TrainingStage;
  trainingSubject?: TrainingSubject;
}

function loadGalleryCards(): GalleryCard[] {
  return listProductIds().map((id) => {
    try {
      const p = loadProduct(id);
      return {
        id,
        name: p.product.name,
        countryCode: p.product.countryCode,
        catalog: resolveProductCatalog(p.product),
        pathway: p.product.pathway,
        trainingStage: p.product.trainingStage,
        trainingSubject: p.product.trainingSubject,
      };
    } catch {
      return { id, name: id, catalog: "admissions" as const };
    }
  });
}

function GalleryPage() {
  const allCards = useMemo(() => loadGalleryCards(), []);
  const [catalog, setCatalog] = useState<ProductCatalog>("admissions");
  const [pathway, setPathway] = useState<ExamPathway>("zhongkao");
  /** Default 初中 — main training segment today */
  const [stage, setStage] = useState<TrainingStage>("junior");

  const catalogCards = useMemo(
    () => allCards.filter((c) => c.catalog === catalog),
    [allCards, catalog],
  );

  const filtered = useMemo(() => {
    if (catalog === "training") {
      return catalogCards
        .filter((c) => c.trainingStage === stage)
        .sort((a, b) => {
          const order = TRAINING_SUBJECTS_BY_STAGE[stage] ?? [];
          const ia = order.indexOf(a.trainingSubject ?? "math");
          const ib = order.indexOf(b.trainingSubject ?? "math");
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
    }
    return catalogCards.filter((c) => c.pathway === pathway);
  }, [catalog, catalogCards, pathway, stage]);

  return (
    <div className="min-h-screen bg-[#e8e8ed] p-8">
      <header className="no-print mb-6 max-w-5xl">
        <p className="text-xs font-medium tracking-wide text-ink-tertiary">
          睿卓教育
        </p>
        {/* Top-level product system menu */}
        <nav
          className="mt-3 flex flex-wrap gap-2"
          aria-label="产品体系"
        >
          {PRODUCT_CATALOGS.map((c) => {
            const active = c.id === catalog;
            const count = allCards.filter((card) => card.catalog === c.id)
              .length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatalog(c.id)}
                className={[
                  "rounded-lg px-4 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "bg-paper text-ink border border-rule hover:border-ink",
                ].join(" ")}
              >
                <span className="block font-semibold">{c.label}</span>
                <span
                  className={[
                    "mt-0.5 block text-xs",
                    active ? "text-white/70" : "text-ink-tertiary",
                  ].join(" ")}
                >
                  {count} 个方案
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Secondary filters */}
      <section className="no-print mb-8 max-w-5xl">
        <p className="mb-3 text-sm font-medium text-ink">
          {catalog === "training" ? "学段" : "考生路线"}
        </p>
        <div className="flex flex-wrap gap-2">
          {catalog === "training"
            ? TRAINING_STAGES.map((s) => {
                const active = s.id === stage;
                const count = catalogCards.filter(
                  (c) => c.trainingStage === s.id,
                ).length;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStage(s.id)}
                    className={[
                      "rounded-full px-4 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent text-white"
                        : "bg-paper text-ink border border-rule hover:border-accent",
                    ].join(" ")}
                  >
                    {s.label}
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
              })
            : EXAM_PATHWAYS.map((p) => {
                const active = p.id === pathway;
                const count = catalogCards.filter(
                  (c) => c.pathway === p.id,
                ).length;
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
        {catalog === "training" ? (
          <p className="mt-3 text-xs text-ink-tertiary">
            {stage === "dse"
              ? "DSE 目前开设：数学、数学延伸 M2、英语、物理、化学；支持小组课与一对一。"
              : "该学段开设数学、英语、语文；支持小组课与一对一。"}
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
              {card.catalog === "admissions" && card.countryCode ? (
                <CountryFlag code={card.countryCode} className="h-6 w-auto" />
              ) : null}
              {card.catalog === "training" && card.trainingSubject ? (
                <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-md bg-soft px-2 text-xs font-medium text-ink">
                  {trainingSubjectMeta(card.trainingSubject).label}
                </span>
              ) : null}
              <p className="text-base font-medium text-ink">{card.name}</p>
            </div>
            {card.catalog === "training" ? (
              <p className="mt-2 text-xs text-ink-tertiary">
                小组课 · 一对一 · 核心考点透明
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link
                className="text-accent underline-offset-2 hover:underline"
                to={`/p/${card.id}`}
              >
                预览
              </Link>
              <DownloadPdfButton
                productId={card.id}
                fileName={`${card.name}.pdf`}
                title={card.name}
              />
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-ink-secondary">
          {catalog === "training"
            ? "该学段暂无课程一页纸，请选择其他学段。"
            : "该路线暂无服务一页纸，请选择其他考生路线。"}
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
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-4 px-4">
        <div>
          <Link className="text-sm text-accent" to="/">
            ← 返回
          </Link>
          <p className="mt-1 text-xs text-ink-tertiary">
            预览 · {content.product.name}
          </p>
        </div>
        <DownloadPdfButton
          productId={id}
          fileName={`${content.product.name}.pdf`}
          title={content.meta.documentTitle || content.product.name}
          variant="button"
        />
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
