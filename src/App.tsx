import { useMemo, useState, type ReactNode, type SVGProps } from "react";
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

function IconFileText(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

const PATHWAY_BADGE: Record<ExamPathway, string> = {
  zhongkao: "bg-blue-50 text-blue-700 border-blue-100",
  gaokao: "bg-emerald-50 text-emerald-700 border-emerald-100",
  dse: "bg-violet-50 text-violet-700 border-violet-100",
  alevel: "bg-orange-50 text-orange-700 border-orange-100",
  sat: "bg-rose-50 text-rose-700 border-rose-100",
};

const STAGE_BADGE: Record<TrainingStage, string> = {
  primary: "bg-blue-50 text-blue-700 border-blue-100",
  junior: "bg-emerald-50 text-emerald-700 border-emerald-100",
  senior: "bg-violet-50 text-violet-700 border-violet-100",
  dse: "bg-orange-50 text-orange-700 border-orange-100",
};

function MetaBadge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function cardBadge(card: GalleryCard) {
  if (card.catalog === "training" && card.trainingStage) {
    const stage = TRAINING_STAGES.find((s) => s.id === card.trainingStage);
    return (
      <MetaBadge className={STAGE_BADGE[card.trainingStage]}>
        {stage?.label ?? card.trainingStage}
      </MetaBadge>
    );
  }
  if (card.pathway) {
    const p = EXAM_PATHWAYS.find((x) => x.id === card.pathway);
    return (
      <MetaBadge className={PATHWAY_BADGE[card.pathway]}>
        {p?.label ?? card.pathway}
      </MetaBadge>
    );
  }
  return null;
}

function cardSubtitle(card: GalleryCard): string {
  if (card.catalog === "training") {
    const subject = card.trainingSubject
      ? trainingSubjectMeta(card.trainingSubject).label
      : "";
    return subject ? `${subject} · 小组课 · 一对一` : "小组课 · 一对一 · 核心考点透明";
  }
  const p = card.pathway
    ? EXAM_PATHWAYS.find((x) => x.id === card.pathway)?.description
    : undefined;
  return p ?? "升学规划与申请辅导";
}

function DocCard({ card }: { card: GalleryCard }) {
  return (
    <Link
      to={`/p/${card.id}`}
      className="group flex flex-col gap-4 rounded-ui border border-ui-border bg-ui-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-ui-foreground/20 hover:shadow-[0_8px_28px_rgba(14,14,13,0.1)] active:translate-y-0 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        {card.catalog === "admissions" && card.countryCode ? (
          <CountryFlag code={card.countryCode} className="h-9 w-auto" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ui-muted transition-colors group-hover:bg-ui-foreground/[0.08]">
            <IconFileText className="h-4 w-4 text-ui-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
        {cardBadge(card)}
      </div>

      <div className="flex-1">
        <h3 className="mb-1.5 font-display text-sm font-semibold leading-snug text-ui-foreground">
          {card.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-ui-muted-foreground">
          {cardSubtitle(card)}
        </p>
      </div>
    </Link>
  );
}

function GalleryPage() {
  const allCards = useMemo(() => loadGalleryCards(), []);
  const [catalog, setCatalog] = useState<ProductCatalog>("admissions");
  const [pathway, setPathway] = useState<ExamPathway | "all">("all");
  const [stage, setStage] = useState<TrainingStage | "all">("all");
  const [search, setSearch] = useState("");

  const catalogCards = useMemo(
    () => allCards.filter((c) => c.catalog === catalog),
    [allCards, catalog],
  );

  const segmentFiltered = useMemo(() => {
    if (catalog === "training") {
      const list =
        stage === "all"
          ? catalogCards
          : catalogCards.filter((c) => c.trainingStage === stage);
      return [...list].sort((a, b) => {
        const stageOrder = TRAINING_STAGES.map((s) => s.id);
        const sa = stageOrder.indexOf(a.trainingStage ?? "junior");
        const sb = stageOrder.indexOf(b.trainingStage ?? "junior");
        if (sa !== sb) return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
        const subjectStage = a.trainingStage ?? b.trainingStage ?? "junior";
        const order = TRAINING_SUBJECTS_BY_STAGE[subjectStage] ?? [];
        const ia = order.indexOf(a.trainingSubject ?? "math");
        const ib = order.indexOf(b.trainingSubject ?? "math");
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });
    }
    if (pathway === "all") return catalogCards;
    return catalogCards.filter((c) => c.pathway === pathway);
  }, [catalog, catalogCards, pathway, stage]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return segmentFiltered;
    return segmentFiltered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        cardSubtitle(c).toLowerCase().includes(q),
    );
  }, [segmentFiltered, search]);

  return (
    <div className="min-h-screen bg-ui-background font-ui text-ui-foreground">
      <header className="sticky top-0 z-10 border-b border-ui-border bg-ui-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-5 px-6 py-4">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ui-foreground">
              <IconFileText className="h-3.5 w-3.5 text-ui-accent" strokeWidth={2} />
            </div>
            <span className="font-display text-sm font-semibold tracking-tight">
              睿卓教育在线文档
            </span>
          </div>

          <div className="relative ml-auto w-full max-w-sm">
            <IconSearch
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ui-muted-foreground"
              strokeWidth={1.5}
            />
            <input
              type="search"
              placeholder="搜索方案名称、编号…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-ui-input py-2 pl-9 pr-8 text-sm placeholder:text-ui-muted-foreground focus:outline-none focus:ring-1 focus:ring-ui-foreground/30"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ui-muted-foreground transition-colors hover:text-ui-foreground"
                aria-label="清除搜索"
              >
                <IconX className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-1 pt-5">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="产品体系"
        >
          {PRODUCT_CATALOGS.map((c) => {
            const active = c.id === catalog;
            const count = allCards.filter((card) => card.catalog === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setCatalog(c.id);
                  setPathway("all");
                  setStage("all");
                }}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "border-ui-accent bg-ui-accent text-ui-accent-foreground"
                    : "border-ui-border bg-ui-card text-ui-muted-foreground hover:border-ui-foreground/25 hover:text-ui-foreground"
                }`}
              >
                {c.label}
                <span className={`ml-1.5 font-mono ${active ? "opacity-70" : ""}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-3 flex items-center gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
          aria-label={catalog === "training" ? "学段" : "考生路线"}
        >
          {catalog === "training" ? (
            <>
              <button
                type="button"
                onClick={() => setStage("all")}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  stage === "all"
                    ? "border-ui-foreground bg-ui-foreground text-ui-accent"
                    : "border-ui-border bg-ui-card text-ui-muted-foreground hover:border-ui-foreground/25 hover:text-ui-foreground"
                }`}
              >
                全部
                <span className={`ml-1.5 font-mono ${stage === "all" ? "opacity-70" : ""}`}>
                  {catalogCards.length}
                </span>
              </button>
              {TRAINING_STAGES.map((s) => {
                const active = s.id === stage;
                const count = catalogCards.filter((c) => c.trainingStage === s.id).length;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStage(s.id)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      active
                        ? "border-ui-foreground bg-ui-foreground text-ui-accent"
                        : "border-ui-border bg-ui-card text-ui-muted-foreground hover:border-ui-foreground/25 hover:text-ui-foreground"
                    }`}
                  >
                    {s.label}
                    <span className={`ml-1.5 font-mono ${active ? "opacity-70" : ""}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPathway("all")}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  pathway === "all"
                    ? "border-ui-foreground bg-ui-foreground text-ui-accent"
                    : "border-ui-border bg-ui-card text-ui-muted-foreground hover:border-ui-foreground/25 hover:text-ui-foreground"
                }`}
              >
                全部
                <span className={`ml-1.5 font-mono ${pathway === "all" ? "opacity-70" : ""}`}>
                  {catalogCards.length}
                </span>
              </button>
              {EXAM_PATHWAYS.map((p) => {
                const active = p.id === pathway;
                const count = catalogCards.filter((c) => c.pathway === p.id).length;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPathway(p.id)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      active
                        ? "border-ui-foreground bg-ui-foreground text-ui-accent"
                        : "border-ui-border bg-ui-card text-ui-muted-foreground hover:border-ui-foreground/25 hover:text-ui-foreground"
                    }`}
                  >
                    {p.label}
                    <span className={`ml-1.5 font-mono ${active ? "opacity-70" : ""}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {catalog === "training" && stage !== "all" ? (
          <p className="mt-3 text-xs text-ui-muted-foreground">
            {stage === "dse"
              ? "DSE 目前开设：数学、数学延伸 M2、英语、物理、化学；支持小组课与一对一。"
              : "该学段开设数学、英语、语文；支持小组课与一对一。"}
          </p>
        ) : null}
      </div>

      <main className="mx-auto max-w-6xl px-6 py-5 pb-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-ui bg-ui-muted">
              <IconSearch className="h-5 w-5 text-ui-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">未找到方案</p>
            <p className="mt-1 text-xs text-ui-muted-foreground">
              {catalog === "training"
                ? "试试其他学段，或清除搜索条件。"
                : "试试其他考生路线，或清除搜索条件。"}
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-lg bg-ui-accent px-4 py-2 text-xs font-semibold text-ui-accent-foreground transition-transform hover:scale-105 active:scale-95"
            >
              清除搜索
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((card) => (
              <DocCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </main>
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
      <div className="min-h-screen bg-ui-background p-8 font-ui text-ui-foreground">
        <p>未知产品：{id}</p>
        <Link
          className="mt-4 inline-block text-sm font-medium text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
          to="/"
        >
          ← 返回
        </Link>
        <pre className="mt-4 font-mono text-xs text-ui-muted-foreground">
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-background font-ui text-ui-foreground">
      <header className="no-print sticky top-0 z-10 border-b border-ui-border bg-ui-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[210mm] items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <Link
              className="text-sm font-medium text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
              to="/"
            >
              ← 返回
            </Link>
            <p className="mt-0.5 truncate font-mono text-xs text-ui-muted-foreground">
              {content.product.name}
            </p>
          </div>
          <DownloadPdfButton
            productId={id}
            fileName={`${content.product.name}.pdf`}
            title={content.meta.documentTitle || content.product.name}
            variant="button"
            className="!px-4 !py-2 !text-xs"
          />
        </div>
      </header>
      <div className="py-8">
        <div className="mx-auto w-a4 shadow-lg">
          <ServiceOnePager content={content} />
        </div>
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
