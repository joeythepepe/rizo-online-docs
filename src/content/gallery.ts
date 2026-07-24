import {
  PRODUCT_CATALOGS,
  TRAINING_STAGES,
  TRAINING_SUBJECTS_BY_STAGE,
  resolveProductCatalog,
  trainingSubjectMeta,
} from "./catalogs";
import { compareDestKeys, destLabel, resolveDestKey } from "./destinations";
import { EXAM_PATHWAYS } from "./pathways";
import type { GalleryFilters } from "../lib/galleryQuery";
import type {
  ExamPathway,
  ProductCatalog,
  ServiceOnePagerContent,
  TrainingStage,
  TrainingSubject,
} from "./types";

export interface GalleryCard {
  id: string;
  name: string;
  tagline?: string;
  countryCode?: string;
  destKey?: string;
  catalog: ProductCatalog;
  pathway?: ExamPathway;
  trainingStage?: TrainingStage;
  trainingSubject?: TrainingSubject;
  cycleLabel?: string;
  version?: string;
}

/** Build a gallery card from loaded product content (server-side helper). */
export function galleryCardFromContent(
  id: string,
  p: ServiceOnePagerContent,
): GalleryCard {
  return {
    id,
    name: p.product.name,
    tagline: p.product.tagline,
    countryCode: p.product.countryCode,
    destKey: resolveDestKey(p.product),
    catalog: resolveProductCatalog(p.product),
    pathway: p.product.pathway,
    trainingStage: p.product.trainingStage,
    trainingSubject: p.product.trainingSubject,
    cycleLabel: p.meta.cycleLabel,
    version: p.meta.version,
  };
}

export function cardSubtitle(card: GalleryCard): string {
  if (card.tagline?.trim()) return card.tagline.trim();
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

function sortAdmissions(a: GalleryCard, b: GalleryCard): number {
  const pathwayOrder = EXAM_PATHWAYS.map((p) => p.id);
  const pa = pathwayOrder.indexOf(a.pathway as ExamPathway);
  const pb = pathwayOrder.indexOf(b.pathway as ExamPathway);
  const sa = pa === -1 ? 99 : pa;
  const sb = pb === -1 ? 99 : pb;
  if (sa !== sb) return sa - sb;
  const da = a.destKey ? destLabel(a.destKey) : a.name;
  const db = b.destKey ? destLabel(b.destKey) : b.name;
  const byDest = da.localeCompare(db, "zh-CN");
  if (byDest !== 0) return byDest;
  return a.name.localeCompare(b.name, "zh-CN");
}

function sortTraining(a: GalleryCard, b: GalleryCard): number {
  const stageOrder = TRAINING_STAGES.map((s) => s.id);
  const sa = stageOrder.indexOf(a.trainingStage ?? "junior");
  const sb = stageOrder.indexOf(b.trainingStage ?? "junior");
  if (sa !== sb) return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
  const subjectStage = a.trainingStage ?? b.trainingStage ?? "junior";
  const order = TRAINING_SUBJECTS_BY_STAGE[subjectStage] ?? [];
  const ia = order.indexOf(a.trainingSubject ?? "math");
  const ib = order.indexOf(b.trainingSubject ?? "math");
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
}

/** Filter + sort cards for gallery / prev-next sets. */
export function filterGalleryCards(
  allCards: GalleryCard[],
  filters: GalleryFilters,
): GalleryCard[] {
  let list = allCards.filter((c) => c.catalog === filters.catalog);

  if (filters.catalog === "training") {
    if (filters.stage !== "all") {
      list = list.filter((c) => c.trainingStage === filters.stage);
    }
    if (filters.subject !== "all") {
      list = list.filter((c) => c.trainingSubject === filters.subject);
    }
    list = [...list].sort(sortTraining);
  } else {
    if (filters.pathway !== "all") {
      list = list.filter((c) => c.pathway === filters.pathway);
    }
    if (filters.dest !== "all") {
      list = list.filter((c) => c.destKey === filters.dest);
    }
    list = [...list].sort(sortAdmissions);
  }

  const q = filters.q.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        cardSubtitle(c).toLowerCase().includes(q) ||
        (c.destKey && destLabel(c.destKey).toLowerCase().includes(q)),
    );
  }

  return list;
}

/** Destination chips available under current catalog + pathway (before dest filter). */
export function availableDestKeys(
  allCards: GalleryCard[],
  catalog: ProductCatalog,
  pathway: ExamPathway | "all",
): string[] {
  let list = allCards.filter((c) => c.catalog === catalog);
  if (pathway !== "all") list = list.filter((c) => c.pathway === pathway);
  const keys = new Set<string>();
  for (const c of list) {
    if (c.destKey) keys.add(c.destKey);
  }
  return [...keys].sort(compareDestKeys);
}

/** Subject chips under current training stage. */
export function availableSubjects(
  allCards: GalleryCard[],
  stage: TrainingStage | "all",
): TrainingSubject[] {
  let list = allCards.filter((c) => c.catalog === "training");
  if (stage !== "all") list = list.filter((c) => c.trainingStage === stage);
  const present = new Set(
    list.map((c) => c.trainingSubject).filter(Boolean) as TrainingSubject[],
  );
  if (stage !== "all") {
    return (TRAINING_SUBJECTS_BY_STAGE[stage] ?? []).filter((s) => present.has(s));
  }
  const order = TRAINING_STAGES.flatMap((s) => TRAINING_SUBJECTS_BY_STAGE[s.id]);
  const seen = new Set<TrainingSubject>();
  const out: TrainingSubject[] = [];
  for (const s of order) {
    if (present.has(s) && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

export interface GalleryGroup {
  key: string;
  label: string;
  cards: GalleryCard[];
}

/** Group filtered cards when top segment is "all". */
export function groupGalleryCards(
  cards: GalleryCard[],
  filters: GalleryFilters,
): GalleryGroup[] | null {
  if (filters.catalog === "admissions" && filters.pathway === "all") {
    const by = new Map<string, GalleryCard[]>();
    for (const c of cards) {
      const key = c.pathway ?? "other";
      const arr = by.get(key) ?? [];
      arr.push(c);
      by.set(key, arr);
    }
    return EXAM_PATHWAYS.filter((p) => by.has(p.id)).map((p) => ({
      key: p.id,
      label: p.label,
      cards: by.get(p.id) ?? [],
    }));
  }
  if (filters.catalog === "training" && filters.stage === "all") {
    const by = new Map<string, GalleryCard[]>();
    for (const c of cards) {
      const key = c.trainingStage ?? "other";
      const arr = by.get(key) ?? [];
      arr.push(c);
      by.set(key, arr);
    }
    return TRAINING_STAGES.filter((s) => by.has(s.id)).map((s) => ({
      key: s.id,
      label: s.label,
      cards: by.get(s.id) ?? [],
    }));
  }
  return null;
}

export function catalogLabel(id: ProductCatalog): string {
  return PRODUCT_CATALOGS.find((c) => c.id === id)?.label ?? id;
}

export function pathwayLabel(id: ExamPathway): string {
  return EXAM_PATHWAYS.find((p) => p.id === id)?.label ?? id;
}

export function stageLabel(id: TrainingStage): string {
  return TRAINING_STAGES.find((s) => s.id === id)?.label ?? id;
}
