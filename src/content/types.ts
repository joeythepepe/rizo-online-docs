/** Template identifier for the A4 service one-pager. */
export type TemplateId = "a4-service-onepager-v1";

/**
 * Chinese copy string. Product content is CN-only (no English fields).
 * Kept as a named alias so call sites stay readable.
 */
export type ZhString = string;

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
