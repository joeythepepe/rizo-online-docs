"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DownloadPdfButton } from "../components/DownloadPdfButton";
import { A4Viewport } from "../components/preview/A4Viewport";
import {
  filterGalleryCards,
  type GalleryCard,
} from "../content/gallery";
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

export function ProductPreviewPage({
  id,
  baseContent,
  allCards,
}: {
  id: string;
  baseContent: ServiceOnePagerContent;
  allCards: GalleryCard[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = useMemo(
    () =>
      parseGalleryFilters(
        new URLSearchParams(searchParams?.toString() ?? ""),
      ),
    [searchParams],
  );

  const densityParam = searchParams?.get("density") ?? null;
  const density: "normal" | "compact" =
    densityParam === "compact" || densityParam === "normal"
      ? densityParam
      : "normal";

  const content = useMemo(
    () => applyDensityOverride(baseContent, density),
    [baseContent, density],
  );

  const siblings = useMemo(() => {
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

  const index = siblings.findIndex((c) => c.id === id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next =
    index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  useEffect(() => {
    pushRecentlyViewed(id);
  }, [id]);

  const setDensity = (d: "normal" | "compact") => {
    const nextParams = serializeGalleryFilters(filters);
    if (d === "compact") nextParams.set("density", "compact");
    else nextParams.delete("density");
    const qs = nextParams.toString();
    router.replace(qs ? `/p/${id}?${qs}` : `/p/${id}`, { scroll: false });
  };

  const goSibling = (siblingId: string) => {
    const qs = serializeGalleryFilters(filters);
    if (density === "compact") qs.set("density", "compact");
    const s = qs.toString();
    router.push(`/p/${siblingId}${s ? `?${s}` : ""}`);
  };

  useEffect(() => {
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
        router.push(`/${gallerySearchString(filters)}`);
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

  return (
    <div className="min-h-screen bg-ui-background font-ui text-ui-foreground">
      <header className="no-print sticky top-0 z-20 border-b border-ui-border bg-ui-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href={`/${gallerySearchString(filters)}`}
            className="shrink-0 text-sm font-medium text-ui-muted-foreground transition-colors hover:text-ui-foreground"
          >
            ← 方案库
          </Link>

          <DownloadPdfButton
            productId={id}
            fileName={`${content.product.name}.pdf`}
            title={content.meta.documentTitle || content.product.name}
            variant="button"
            className="!rounded-full !px-4 !py-2 !text-xs !font-semibold"
          />
        </div>
      </header>

      <div className="px-2 py-8 sm:px-4 sm:py-10">
        <A4Viewport>
          <ServiceOnePager content={content} />
        </A4Viewport>
      </div>
    </div>
  );
}
