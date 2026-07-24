"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DocCard } from "../components/gallery/DocCard";
import { FilterChip } from "../components/gallery/FilterChip";
import { IconColumns, IconSearch, IconX, IconFileText } from "../components/ui/Icons";
import {
  PRODUCT_CATALOGS,
  TRAINING_STAGES,
  trainingSubjectMeta,
} from "../content/catalogs";
import { destLabel } from "../content/destinations";
import {
  availableDestKeys,
  availableSubjects,
  filterGalleryCards,
  groupGalleryCards,
  type GalleryCard,
} from "../content/gallery";
import { EXAM_PATHWAYS } from "../content/pathways";
import type {
  ExamPathway,
  ProductCatalog,
  TrainingStage,
  TrainingSubject,
} from "../content/types";
import {
  DEFAULT_GALLERY_FILTERS,
  hasActiveFilters,
  parseGalleryFilters,
  serializeGalleryFilters,
  type GalleryFilters,
} from "../lib/galleryQuery";
import { readRecentlyViewed } from "../lib/recentlyViewed";

const SCROLL_KEY = "gallery-scroll-y";

export function GalleryPage({ initialCards }: { initialCards: GalleryCard[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(
    () =>
      parseGalleryFilters(
        new URLSearchParams(searchParams?.toString() ?? ""),
      ),
    [searchParams],
  );

  const allCards = initialCards;
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(readRecentlyViewed());
  }, []);

  useEffect(() => {
    try {
      const y = sessionStorage.getItem(SCROLL_KEY);
      if (y) {
        const n = Number(y);
        if (!Number.isNaN(n)) {
          requestAnimationFrame(() => window.scrollTo(0, n));
        }
        sessionStorage.removeItem(SCROLL_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setFilters = useCallback(
    (next: GalleryFilters | ((prev: GalleryFilters) => GalleryFilters)) => {
      const resolved = typeof next === "function" ? next(filters) : next;
      const qs = serializeGalleryFilters(resolved).toString();
      const base = pathname ?? "/";
      router.replace(qs ? `${base}?${qs}` : base, { scroll: false });
    },
    [filters, pathname, router],
  );

  const catalogCards = useMemo(
    () => allCards.filter((c) => c.catalog === filters.catalog),
    [allCards, filters.catalog],
  );

  const filtered = useMemo(
    () => filterGalleryCards(allCards, filters),
    [allCards, filters],
  );

  const groups = useMemo(
    () => groupGalleryCards(filtered, filters),
    [filtered, filters],
  );

  const destKeys = useMemo(
    () => availableDestKeys(allCards, filters.catalog, filters.pathway),
    [allCards, filters.catalog, filters.pathway],
  );

  const subjects = useMemo(
    () => availableSubjects(allCards, filters.stage),
    [allCards, filters.stage],
  );

  const recentCards = useMemo(() => {
    const map = new Map(allCards.map((c) => [c.id, c]));
    return recentIds
      .map((id) => map.get(id))
      .filter((c): c is GalleryCard => Boolean(c));
  }, [allCards, recentIds]);

  const clearFilters = () => {
    setFilters({
      ...DEFAULT_GALLERY_FILTERS,
      catalog: filters.catalog,
    });
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareHref =
    compareIds.length === 2
      ? `/compare?ids=${encodeURIComponent(compareIds.join(","))}`
      : null;

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
              placeholder="搜索方案名称、编号、目的地…"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="w-full rounded-lg bg-ui-input py-2 pl-9 pr-8 text-sm placeholder:text-ui-muted-foreground focus:outline-none focus:ring-1 focus:ring-ui-foreground/30"
            />
            {filters.q ? (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, q: "" })}
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
          className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-ui-border bg-ui-muted p-1"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="产品体系"
        >
          {PRODUCT_CATALOGS.map((c) => {
            const active = c.id === filters.catalog;
            const count = allCards.filter((card) => card.catalog === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() =>
                  setFilters({
                    ...DEFAULT_GALLERY_FILTERS,
                    catalog: c.id as ProductCatalog,
                  })
                }
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-ui-accent text-ui-accent-foreground shadow-sm"
                    : "text-ui-muted-foreground hover:text-ui-foreground"
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
          aria-label={filters.catalog === "training" ? "学段" : "考生路线"}
        >
          {filters.catalog === "training" ? (
            <>
              <FilterChip
                active={filters.stage === "all"}
                onClick={() =>
                  setFilters({ ...filters, stage: "all", subject: "all" })
                }
                count={catalogCards.length}
              >
                全部
              </FilterChip>
              {TRAINING_STAGES.map((s) => {
                const count = catalogCards.filter(
                  (c) => c.trainingStage === s.id,
                ).length;
                return (
                  <FilterChip
                    key={s.id}
                    active={filters.stage === s.id}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        stage: s.id as TrainingStage,
                        subject: "all",
                      })
                    }
                    count={count}
                  >
                    {s.label}
                  </FilterChip>
                );
              })}
            </>
          ) : (
            <>
              <FilterChip
                active={filters.pathway === "all"}
                onClick={() =>
                  setFilters({ ...filters, pathway: "all", dest: "all" })
                }
                count={catalogCards.length}
              >
                全部
              </FilterChip>
              {EXAM_PATHWAYS.map((p) => {
                const count = catalogCards.filter((c) => c.pathway === p.id).length;
                return (
                  <FilterChip
                    key={p.id}
                    active={filters.pathway === p.id}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        pathway: p.id as ExamPathway,
                        dest: "all",
                      })
                    }
                    count={count}
                  >
                    {p.label}
                  </FilterChip>
                );
              })}
            </>
          )}
        </div>

        {filters.catalog === "admissions" && destKeys.length > 1 ? (
          <div
            className="mt-2 flex items-center gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
            aria-label="目的地"
          >
            <FilterChip
              active={filters.dest === "all"}
              onClick={() => setFilters({ ...filters, dest: "all" })}
            >
              全部目的地
            </FilterChip>
            {destKeys.map((key) => {
              const count = catalogCards.filter((c) => {
                if (filters.pathway !== "all" && c.pathway !== filters.pathway) {
                  return false;
                }
                return c.destKey === key;
              }).length;
              return (
                <FilterChip
                  key={key}
                  active={filters.dest === key}
                  onClick={() => setFilters({ ...filters, dest: key })}
                  count={count}
                >
                  {destLabel(key)}
                </FilterChip>
              );
            })}
          </div>
        ) : null}

        {filters.catalog === "training" && subjects.length > 0 ? (
          <div
            className="mt-2 flex items-center gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
            aria-label="学科"
          >
            <FilterChip
              active={filters.subject === "all"}
              onClick={() => setFilters({ ...filters, subject: "all" })}
            >
              全部学科
            </FilterChip>
            {subjects.map((s) => {
              const count = catalogCards.filter((c) => {
                if (filters.stage !== "all" && c.trainingStage !== filters.stage) {
                  return false;
                }
                return c.trainingSubject === s;
              }).length;
              return (
                <FilterChip
                  key={s}
                  active={filters.subject === s}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      subject: s as TrainingSubject,
                    })
                  }
                  count={count}
                >
                  {trainingSubjectMeta(s).label}
                </FilterChip>
              );
            })}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ui-muted-foreground">
          <span>
            显示{" "}
            <span className="font-mono text-ui-foreground">{filtered.length}</span>
            {" / "}
            <span className="font-mono">{catalogCards.length}</span> 方案
          </span>
          {hasActiveFilters(filters) ? (
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-ui-foreground underline-offset-2 hover:underline"
            >
              清除筛选
            </button>
          ) : null}
          {filters.catalog === "training" && filters.stage !== "all" ? (
            <span>
              {filters.stage === "dse"
                ? "DSE：数学、M2、英语、物理、化学 · 小组课与一对一"
                : "该学段：数学、英语、语文 · 小组课与一对一"}
            </span>
          ) : null}
        </div>
      </div>

      {recentCards.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 pt-4">
          <h2 className="mb-2 text-xs font-semibold text-ui-muted-foreground">
            最近查看
          </h2>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {recentCards.map((c) => {
              const qs = serializeGalleryFilters(filters).toString();
              return (
                <Link
                  key={c.id}
                  href={`/p/${c.id}${qs ? `?${qs}` : ""}`}
                  onClick={() => {
                    try {
                      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="shrink-0 rounded-full border border-ui-border bg-ui-card px-3 py-1.5 text-xs font-medium text-ui-foreground transition-colors hover:border-ui-foreground/25"
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 py-5 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-ui bg-ui-muted">
              <IconSearch className="h-5 w-5 text-ui-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">未找到方案</p>
            <p className="mt-1 text-xs text-ui-muted-foreground">
              试试其他筛选，或清除搜索条件。
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-ui-accent px-4 py-2 text-xs font-semibold text-ui-accent-foreground transition-transform hover:scale-105 active:scale-95"
            >
              清除筛选
            </button>
          </div>
        ) : groups ? (
          <div className="flex flex-col gap-8">
            {groups.map((g) => (
              <section key={g.key}>
                <h2 className="sticky top-[57px] z-[5] mb-3 bg-ui-background/90 py-1.5 font-display text-sm font-semibold backdrop-blur-sm">
                  {g.label}
                  <span className="ml-2 font-mono text-xs font-normal text-ui-muted-foreground">
                    {g.cards.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {g.cards.map((card) => (
                    <DocCard
                      key={card.id}
                      card={card}
                      filters={filters}
                      onToggleCompare={toggleCompare}
                      compareSelected={compareIds.includes(card.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((card) => (
              <DocCard
                key={card.id}
                card={card}
                filters={filters}
                onToggleCompare={toggleCompare}
                compareSelected={compareIds.includes(card.id)}
              />
            ))}
          </div>
        )}
      </main>

      {compareIds.length > 0 ? (
        <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-ui-border bg-ui-card px-4 py-2.5 shadow-[0_8px_28px_rgba(14,14,13,0.14)]">
          <IconColumns className="h-4 w-4 text-ui-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs font-medium">对比 {compareIds.length}/2</span>
          {compareHref ? (
            <Link
              href={compareHref}
              className="rounded-full bg-ui-accent px-3 py-1 text-xs font-semibold text-ui-accent-foreground"
            >
              开始对比
            </Link>
          ) : (
            <span className="text-xs text-ui-muted-foreground">再选一份方案</span>
          )}
          <button
            type="button"
            onClick={() => setCompareIds([])}
            className="text-xs text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
          >
            清除
          </button>
        </div>
      ) : null}
    </div>
  );
}
