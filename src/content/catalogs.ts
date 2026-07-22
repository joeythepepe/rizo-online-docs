import type {
  ProductCatalog,
  TrainingStage,
  TrainingSubject,
} from "./types";

export interface CatalogMeta {
  id: ProductCatalog;
  label: string;
  description: string;
}

export interface TrainingStageMeta {
  id: TrainingStage;
  label: string;
  description: string;
  /** Default categoryLabel for training products */
  categoryLabel: string;
}

export interface TrainingSubjectMeta {
  id: TrainingSubject;
  label: string;
}

/** Top-level product systems (gallery menu). */
export const PRODUCT_CATALOGS: CatalogMeta[] = [
  {
    id: "admissions",
    label: "睿卓升学一站通",
    description: "【路线】通【国家/类型】· 升学规划与申请辅导",
  },
  {
    id: "training",
    label: "睿卓课程培训",
    description: "小学 / 初中 / 高中 / DSE · 学科精讲 · 小组课与一对一",
  },
];

/** Training stage filters (order: 小学 → 初中 → 高中 → DSE). */
export const TRAINING_STAGES: TrainingStageMeta[] = [
  {
    id: "primary",
    label: "小学",
    description: "夯实基础，衔接小升初",
    categoryLabel: "小学学科培训",
  },
  {
    id: "junior",
    label: "初中",
    description: "中考导向，提分与方法",
    categoryLabel: "初中学科培训",
  },
  {
    id: "senior",
    label: "高中",
    description: "高考导向，体系与冲刺",
    categoryLabel: "高中学科培训",
  },
  {
    id: "dse",
    label: "DSE",
    description: "香港中学文凭 · 数/M2/英/物/化",
    categoryLabel: "DSE学科培训",
  },
];

/** All known training subjects (labels for badges). */
export const TRAINING_SUBJECTS: TrainingSubjectMeta[] = [
  { id: "math", label: "数学" },
  { id: "math2", label: "数学延伸M2" },
  { id: "english", label: "英语" },
  { id: "chinese", label: "语文" },
  { id: "physics", label: "物理" },
  { id: "chemistry", label: "化学" },
];

/** Default subject order per stage (gallery sort + DSE lineup). */
export const TRAINING_SUBJECTS_BY_STAGE: Record<
  TrainingStage,
  TrainingSubject[]
> = {
  primary: ["math", "english", "chinese"],
  junior: ["math", "english", "chinese"],
  senior: ["math", "english", "chinese"],
  /** 目前支持：数学、数学延伸 M2、英语、物理、化学 */
  dse: ["math", "math2", "english", "physics", "chemistry"],
};

export function catalogMeta(id: ProductCatalog): CatalogMeta {
  const found = PRODUCT_CATALOGS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown catalog: ${id}`);
  return found;
}

export function trainingStageMeta(id: TrainingStage): TrainingStageMeta {
  const found = TRAINING_STAGES.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown training stage: ${id}`);
  return found;
}

export function trainingSubjectMeta(id: TrainingSubject): TrainingSubjectMeta {
  const found = TRAINING_SUBJECTS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown training subject: ${id}`);
  return found;
}

/** Resolve catalog for a product (defaults admissions). */
export function resolveProductCatalog(product: {
  catalog?: ProductCatalog;
  pathway?: string;
  trainingStage?: TrainingStage;
  trainingSubject?: TrainingSubject;
}): ProductCatalog {
  if (product.catalog) return product.catalog;
  if (product.trainingStage || product.trainingSubject) return "training";
  return "admissions";
}
