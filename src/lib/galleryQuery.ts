import type {
  ExamPathway,
  ProductCatalog,
  TrainingStage,
  TrainingSubject,
} from "../content/types";
import { EXAM_PATHWAYS } from "../content/pathways";
import { PRODUCT_CATALOGS, TRAINING_STAGES, TRAINING_SUBJECTS } from "../content/catalogs";

export interface GalleryFilters {
  catalog: ProductCatalog;
  pathway: ExamPathway | "all";
  stage: TrainingStage | "all";
  dest: string | "all";
  subject: TrainingSubject | "all";
  q: string;
}

export const DEFAULT_GALLERY_FILTERS: GalleryFilters = {
  catalog: "admissions",
  pathway: "all",
  stage: "all",
  dest: "all",
  subject: "all",
  q: "",
};

const CATALOGS = new Set(PRODUCT_CATALOGS.map((c) => c.id));
const PATHWAYS = new Set(EXAM_PATHWAYS.map((p) => p.id));
const STAGES = new Set(TRAINING_STAGES.map((s) => s.id));
const SUBJECTS = new Set(TRAINING_SUBJECTS.map((s) => s.id));

function parseCatalog(v: string | null): ProductCatalog {
  if (v && CATALOGS.has(v as ProductCatalog)) return v as ProductCatalog;
  return DEFAULT_GALLERY_FILTERS.catalog;
}

function parsePathway(v: string | null): ExamPathway | "all" {
  if (!v || v === "all") return "all";
  if (PATHWAYS.has(v as ExamPathway)) return v as ExamPathway;
  return "all";
}

function parseStage(v: string | null): TrainingStage | "all" {
  if (!v || v === "all") return "all";
  if (STAGES.has(v as TrainingStage)) return v as TrainingStage;
  return "all";
}

function parseSubject(v: string | null): TrainingSubject | "all" {
  if (!v || v === "all") return "all";
  if (SUBJECTS.has(v as TrainingSubject)) return v as TrainingSubject;
  return "all";
}

/** Read gallery filters from URLSearchParams (gallery or preview query). */
export function parseGalleryFilters(params: URLSearchParams): GalleryFilters {
  return {
    catalog: parseCatalog(params.get("catalog")),
    pathway: parsePathway(params.get("pathway")),
    stage: parseStage(params.get("stage")),
    dest: params.get("dest")?.trim() || "all",
    subject: parseSubject(params.get("subject")),
    q: params.get("q")?.trim() ?? "",
  };
}

/** Serialize filters for URL (omits defaults to keep links short). */
export function serializeGalleryFilters(
  filters: GalleryFilters,
  extra?: Record<string, string | undefined | null>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.catalog !== DEFAULT_GALLERY_FILTERS.catalog) {
    params.set("catalog", filters.catalog);
  }
  if (filters.pathway !== "all") params.set("pathway", filters.pathway);
  if (filters.stage !== "all") params.set("stage", filters.stage);
  if (filters.dest !== "all") params.set("dest", filters.dest);
  if (filters.subject !== "all") params.set("subject", filters.subject);
  if (filters.q) params.set("q", filters.q);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v != null && v !== "") params.set(k, v);
    }
  }
  return params;
}

export function gallerySearchString(filters: GalleryFilters): string {
  const qs = serializeGalleryFilters(filters).toString();
  return qs ? `?${qs}` : "";
}

export function filtersEqual(a: GalleryFilters, b: GalleryFilters): boolean {
  return (
    a.catalog === b.catalog &&
    a.pathway === b.pathway &&
    a.stage === b.stage &&
    a.dest === b.dest &&
    a.subject === b.subject &&
    a.q === b.q
  );
}

export function hasActiveFilters(filters: GalleryFilters): boolean {
  return (
    filters.pathway !== "all" ||
    filters.stage !== "all" ||
    filters.dest !== "all" ||
    filters.subject !== "all" ||
    filters.q.trim() !== ""
  );
}
