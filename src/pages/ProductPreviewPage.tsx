import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { DownloadPdfButton } from "../components/DownloadPdfButton";
import { A4Viewport } from "../components/preview/A4Viewport";
import {
  IconChevronLeft,
  IconChevronRight,
  IconExternal,
  IconLink,
} from "../components/ui/Icons";
import {
  filterGalleryCards,
  loadGalleryCards,
  pathwayLabel,
  stageLabel,
} from "../content/gallery";
import { loadProduct } from "../content/loadProduct";
import type { ServiceOnePagerContent } from "../content/types";
import {
  gallerySearchString,
  parseGalleryFilters,
  serializeGalleryFilters,
} from "../lib/galleryQuery";
import { pushRecentlyViewed } from "../lib/recentlyViewed";
import { ServiceOnePager } from "../templates/a4-service-onepager/ServiceOnePager";

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

export function ProductPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copyDone, setCopyDone] = useState(false);

  const filters = useMemo(
    () => parseGalleryFilters(searchParams),
    [searchParams],
  );

  const densityParam = searchParams.get("density");
  const density: "normal" | "compact" =
    densityParam === "compact" || densityParam === "normal"
      ? densityParam
      : "normal";

  const loadResult = useMemo(() => {
    if (!id) return { ok: false as const, error: "missing id" };
    try {
      const raw = loadProduct(id);
      return {
        ok: true as const,
        content: applyDensityOverride(raw, density),
      };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [id, density]);

  const allCards = useMemo(() => loadGalleryCards(), []);

  const siblings = useMemo(() => {
    if (!id) return [];
    const productCard = allCards.find((c) => c.id === id);
    let list = filterGalleryCards(allCards, filters);
    if (productCard && !list.some((c) => c.id === id)) {
      if (productCard.catalog === "training") {
        list = filterGalleryCards(allCards, {
          catalog: "training",
          pathway: "all",
          stage: productCard.trainingStage ?? "all",
          dest: "all",
          subject: "all",
          q: "",
        });
      } else {
        list = filterGalleryCards(allCards, {
          catalog: "admissions",
          pathway: productCard.pathway ?? "all",
          stage: "all",
          dest: "all",
          subject: "all",
          q: "",
        });
      }
    }
    if (productCard && !list.some((c) => c.id === id)) {
      list = [productCard, ...list];
    }
    return list;
  }, [allCards, filters, id]);

  const index = id ? siblings.findIndex((c) => c.id === id) : -1;
  const prev = index > 0 ? siblings[index - 1] : null;
  const next =
    index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  useEffect(() => {
    if (id && loadResult.ok) pushRecentlyViewed(id);
  }, [id, loadResult.ok]);

  const setDensity = (d: "normal" | "compact") => {
    const nextParams = serializeGalleryFilters(filters);
    if (d === "compact") nextParams.set("density", "compact");
    else nextParams.delete("density");
    setSearchParams(nextParams, { replace: true });
  };

  const goSibling = (siblingId: string) => {
    const qs = serializeGalleryFilters(filters);
    if (density === "compact") qs.set("density", "compact");
    const s = qs.toString();
    navigate(`/p/${siblingId}${s ? `?${s}` : ""}`);
  };

  useEffect(() => {
    if (!loadResult.ok) return;

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        goSibling(prev.id);
      } else if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        goSibling(next.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        navigate(`/${gallerySearchString(filters)}`);
      } else if (e.key === "d" || e.key === "D") {
        const btn = document.querySelector<HTMLButtonElement>(
          "[data-download-pdf]",
        );
        if (btn && !btn.disabled) {
          e.preventDefault();
          btn.click();
        }
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setDensity(density === "compact" ? "normal" : "compact");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!id) return <Navigate to="/" replace />;

  if (!loadResult.ok) {
    return (
      <div className="min-h-screen bg-ui-background p-8 font-ui text-ui-foreground">
        <p>未知产品：{id}</p>
        <Link
          className="mt-4 inline-block text-sm font-medium text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
          to={`/${gallerySearchString(filters)}`}
        >
          ← 返回方案库
        </Link>
        <pre className="mt-4 font-mono text-xs text-ui-muted-foreground">
          {loadResult.error}
        </pre>
      </div>
    );
  }

  const content = loadResult.content;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const metaBits = [
    content.product.categoryLabel,
    content.meta.cycleLabel,
    content.meta.version ? `v${content.meta.version}` : null,
    content.meta.priceBand,
  ].filter(Boolean);

  const familyLabel =
    content.product.catalog === "training" || content.product.trainingStage
      ? content.product.trainingStage
        ? stageLabel(content.product.trainingStage)
        : "培训"
      : content.product.pathway
        ? pathwayLabel(content.product.pathway)
        : "升学";

  return (
    <div className="min-h-screen bg-ui-background font-ui text-ui-foreground">
      <header className="no-print sticky top-0 z-10 border-b border-ui-border bg-ui-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <Link
                className="text-sm font-medium text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
                to={`/${gallerySearchString(filters)}`}
              >
                ← 方案库
              </Link>
              <p className="mt-0.5 truncate font-display text-sm font-semibold">
                {content.product.name}
              </p>
              {metaBits.length > 0 ? (
                <p className="mt-0.5 truncate font-mono text-[11px] text-ui-muted-foreground">
                  {metaBits.join(" · ")}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex items-center rounded-lg border border-ui-border bg-ui-card p-0.5 text-[11px] font-semibold"
                role="group"
                aria-label="版式密度"
              >
                <button
                  type="button"
                  onClick={() => setDensity("normal")}
                  className={`rounded-md px-2.5 py-1.5 ${
                    density === "normal"
                      ? "bg-ui-foreground text-ui-accent"
                      : "text-ui-muted-foreground hover:text-ui-foreground"
                  }`}
                >
                  标准
                </button>
                <button
                  type="button"
                  onClick={() => setDensity("compact")}
                  className={`rounded-md px-2.5 py-1.5 ${
                    density === "compact"
                      ? "bg-ui-foreground text-ui-accent"
                      : "text-ui-muted-foreground hover:text-ui-foreground"
                  }`}
                >
                  紧凑
                </button>
              </div>

              <a
                href={`/print/${encodeURIComponent(id)}${density === "compact" ? "?density=compact" : ""}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-ui-border bg-ui-card px-3 py-1.5 text-[11px] font-medium text-ui-foreground hover:border-ui-foreground/25"
              >
                <IconExternal className="h-3.5 w-3.5" strokeWidth={1.5} />
                打印页
              </a>

              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1 rounded-lg border border-ui-border bg-ui-card px-3 py-1.5 text-[11px] font-medium text-ui-foreground hover:border-ui-foreground/25"
              >
                <IconLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                {copyDone ? "已复制" : "复制链接"}
              </button>

              <DownloadPdfButton
                productId={id}
                fileName={`${content.product.name}.pdf`}
                title={content.meta.documentTitle || content.product.name}
                variant="button"
                className="!px-4 !py-2 !text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ui-border/60 pt-2">
            <div className="flex items-center gap-2 text-xs text-ui-muted-foreground">
              <button
                type="button"
                disabled={!prev}
                onClick={() => prev && goSibling(prev.id)}
                className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 font-medium text-ui-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <IconChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                上一份
              </button>
              <span className="font-mono">
                {index >= 0 ? index + 1 : "—"} / {siblings.length}
              </span>
              <span className="text-ui-muted-foreground/80">· {familyLabel}</span>
              <button
                type="button"
                disabled={!next}
                onClick={() => next && goSibling(next.id)}
                className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 font-medium text-ui-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                下一份
                <IconChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <p className="hidden text-[10px] text-ui-muted-foreground sm:block">
              快捷键：← → 切换 · C 紧凑 · Esc 返回 · D 下载
            </p>
          </div>

          {siblings.length > 1 ? (
            <div
              className="flex gap-1.5 overflow-x-auto pb-0.5"
              style={{ scrollbarWidth: "none" }}
            >
              {siblings.map((s) => {
                const active = s.id === id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goSibling(s.id)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      active
                        ? "border-ui-foreground bg-ui-foreground text-ui-accent"
                        : "border-ui-border bg-ui-card text-ui-muted-foreground hover:text-ui-foreground"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </header>

      <div className="px-2 py-6 sm:px-4">
        <A4Viewport>
          <ServiceOnePager content={content} />
        </A4Viewport>
        <p className="mx-auto mt-4 max-w-md text-center text-[11px] text-ui-muted-foreground">
          页面下载为浏览器快照；印刷级 PDF 请用 CLI{" "}
          <code className="font-mono">export:pdf</code>。
        </p>
      </div>
    </div>
  );
}
