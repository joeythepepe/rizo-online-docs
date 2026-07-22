/** Template identifier for the A4 service one-pager. */
export type TemplateId = "a4-service-onepager-v1";

/**
 * Chinese copy string. Product content is CN-only (no English fields).
 * Kept as a named alias so call sites stay readable.
 */
export type ZhString = string;

/**
 * Exam pathway for filtering gallery cards (admissions catalog).
 * Product title pattern: 【路线】通【地区/类型】 e.g. 高考通英国、中考通深圳普高.
 */
export type ExamPathway = "gaokao" | "dse" | "alevel" | "sat" | "zhongkao";

/**
 * Top-level product system shown in the gallery menu.
 * - admissions: 睿卓升学一站通
 * - training: 睿卓课程培训
 */
export type ProductCatalog = "admissions" | "training";

/** Training stage filter: 小学 / 初中 / 高中 / DSE */
export type TrainingStage = "primary" | "junior" | "senior" | "dse";

/**
 * Training subject under each stage.
 * 语数英 for 小学/初中/高中；DSE 另含 M2 / 物理 / 化学。
 */
export type TrainingSubject =
  | "math"
  | "math2"
  | "english"
  | "chinese"
  | "physics"
  | "chemistry";

export interface BrandConfig {
  companyName: ZhString;
  /** SVG preferred; PNG min width 600px if used */
  logoSrc?: string;
  /** hex; default #0071E3 */
  accentColor?: string;
  /** phone / site */
  contactLine?: string;
  wechatId?: string;
  qrSrc?: string;
  /** short 备案/entity */
  legalLine?: ZhString;
  /** e.g. 预约顾问 */
  ctaLabel?: ZhString;
  /** e.g. 扫码添加顾问微信 */
  ctaDetail?: ZhString;
}

export interface TargetCustomer {
  /** default chrome: 适合人群 */
  title?: ZhString;
  summary: ZhString;
  /** max 6 */
  segments?: ZhString[];
  /** max 3 */
  profiles?: ZhString[];
}

export interface ListItem {
  id: string;
  label: ZhString;
  detail?: ZhString;
  /**
   * Requirements: Zod defaults omitted values to `true` at parse time.
   * Deliverables may leave this undefined.
   */
  mandatory?: boolean;
}

export interface ServiceOnePagerContent {
  templateId: TemplateId;
  /** Chinese product materials only */
  locale: "zh-CN";
  meta: {
    documentTitle: ZhString;
    version: string;
    confidential?: boolean;
    updatedAt?: string;
    /** Overrides default disclaimer if set */
    disclaimer?: ZhString;
    cycleLabel?: ZhString;
    priceBand?: ZhString;
  };
  product: {
    name: ZhString;
    categoryLabel?: ZhString;
    tagline?: ZhString;
    /**
     * Product system. Omitted → treated as admissions when pathway set,
     * else admissions by gallery default.
     */
    catalog?: ProductCatalog;
    /**
     * ISO 3166-1 alpha-2 country/region code for flag badge
     * (e.g. HK, GB, US). Rendered via country-flag-icons.
     */
    countryCode?: string;
    /**
     * 考生路线：gaokao | dse | alevel | sat | zhongkao（中考）
     * Admissions catalog only.
     */
    pathway?: ExamPathway;
    /** Training stage: primary | junior | senior（小学/初中/高中） */
    trainingStage?: TrainingStage;
    /** Training subject: math | english | chinese */
    trainingSubject?: TrainingSubject;
    /** 路径优势（标题下展示，建议 2–3 条）；培训页可映射为小组课要点 */
    pros?: ZhString[];
    /** 路径劣势/风险（标题下展示）；培训页可映射为一对一要点 */
    cons?: ZhString[];
    /** Override left column label under hero (default 优势) */
    prosLabel?: ZhString;
    /** Override right column label under hero (default 劣势) */
    consLabel?: ZhString;
  };
  targetCustomer: TargetCustomer;
  deliverables: {
    title?: ZhString;
    intro?: ZhString;
    /** hard 1–6 */
    items: ListItem[];
  };
  requirements: {
    title?: ZhString;
    intro?: ZhString;
    /** hard 1–8 */
    items: ListItem[];
  };
  highlights?: {
    title?: ZhString;
    /** max 4 */
    items: ZhString[];
  };
  timeline?: {
    title?: ZhString;
    /** max 4 */
    steps: { id: string; label: ZhString; timeHint?: ZhString }[];
  };
  brand: BrandConfig;
  layout?: {
    variant?: "stack" | "split";
    density?: "normal" | "compact";
    showHighlights?: boolean;
    showQr?: boolean;
    /** default true */
    dropOptionalIfTight?: boolean;
    softPanelOn?: "requirements" | "deliverables" | "none";
  };
}
