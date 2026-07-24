import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CountryFlag } from "../CountryFlag";
import { DownloadPdfButton } from "../DownloadPdfButton";
import {
  cardSubtitle,
  pathwayLabel,
  stageLabel,
  type GalleryCard,
} from "../../content/gallery";
import { destLabel } from "../../content/destinations";
import { trainingSubjectMeta } from "../../content/catalogs";
import type { ExamPathway, TrainingStage } from "../../content/types";
import { IconFileText, IconMore } from "../ui/Icons";
import type { GalleryFilters } from "../../lib/galleryQuery";
import { gallerySearchString } from "../../lib/galleryQuery";

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
    return (
      <MetaBadge className={STAGE_BADGE[card.trainingStage]}>
        {stageLabel(card.trainingStage)}
      </MetaBadge>
    );
  }
  if (card.pathway) {
    return (
      <MetaBadge className={PATHWAY_BADGE[card.pathway]}>
        {pathwayLabel(card.pathway)}
      </MetaBadge>
    );
  }
  return null;
}

function saveScroll() {
  try {
    sessionStorage.setItem("gallery-scroll-y", String(window.scrollY));
  } catch {
    /* ignore */
  }
}

export function DocCard({
  card,
  filters,
  onToggleCompare,
  compareSelected,
}: {
  card: GalleryCard;
  filters: GalleryFilters;
  onToggleCompare?: (id: string) => void;
  compareSelected?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const href = `/p/${card.id}${gallerySearchString(filters)}`;

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const metaLine =
    card.catalog === "training"
      ? [
          card.trainingSubject
            ? trainingSubjectMeta(card.trainingSubject).label
            : null,
          card.id,
        ]
          .filter(Boolean)
          .join(" · ")
      : [card.destKey ? destLabel(card.destKey) : null, card.id]
          .filter(Boolean)
          .join(" · ");

  return (
    <div className="group relative flex flex-col rounded-ui border border-ui-border bg-ui-card transition-all duration-200 hover:-translate-y-1 hover:border-ui-foreground/20 hover:shadow-[0_8px_28px_rgba(14,14,13,0.1)]">
      <Link
        to={href}
        onClick={saveScroll}
        className="flex flex-1 flex-col gap-4 p-5 active:scale-[0.99]"
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
          <p className="mt-2 font-mono text-[10px] text-ui-muted-foreground/80">
            {metaLine}
          </p>
        </div>
      </Link>

      <div className="absolute right-2 top-2" ref={menuRef}>
        <button
          type="button"
          aria-label="更多操作"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-ui-muted-foreground opacity-0 transition-all hover:border-ui-border hover:bg-ui-muted hover:text-ui-foreground group-hover:opacity-100 focus:opacity-100"
        >
          <IconMore className="h-4 w-4" strokeWidth={1.5} />
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 min-w-[9.5rem] rounded-lg border border-ui-border bg-ui-card py-1 shadow-[0_8px_24px_rgba(14,14,13,0.12)]"
          >
            <div className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
              <DownloadPdfButton
                productId={card.id}
                fileName={`${card.name}.pdf`}
                title={card.name}
                variant="link"
                className="!text-xs"
              >
                下载 PDF
              </DownloadPdfButton>
            </div>
            <Link
              role="menuitem"
              to={`/print/${card.id}`}
              target="_blank"
              rel="noreferrer"
              className="block px-3 py-1.5 text-xs text-ui-foreground hover:bg-ui-muted"
              onClick={() => setMenuOpen(false)}
            >
              打开打印页
            </Link>
            {onToggleCompare ? (
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-1.5 text-left text-xs text-ui-foreground hover:bg-ui-muted"
                onClick={() => {
                  onToggleCompare(card.id);
                  setMenuOpen(false);
                }}
              >
                {compareSelected ? "取消对比" : "加入对比"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {compareSelected ? (
        <div className="pointer-events-none absolute inset-0 rounded-ui ring-2 ring-ui-foreground/40" />
      ) : null}
    </div>
  );
}
