/** Template identifier for the A4 service one-pager. */
export type TemplateId = "a4-service-onepager-v1";

/** Full bilingual unit — CN primary, EN secondary in layout */
export interface BiString {
  zh: string;
  en: string;
}

export interface BrandConfig {
  companyName: BiString;
  /** SVG preferred; PNG min width 600px if used */
  logoSrc?: string;
  /** hex; default #0071E3 */
  accentColor?: string;
  /** phone / site (language-neutral OK) */
  contactLine?: string;
  wechatId?: string;
  qrSrc?: string;
  /** short 备案/entity */
  legalLine?: BiString;
  /** e.g. 预约顾问 / Book a consultation */
  ctaLabel?: BiString;
  /** e.g. 扫码添加顾问微信 / Scan to add WeChat */
  ctaDetail?: BiString;
}

export interface TargetCustomer {
  /** default chrome: 适合人群 / Who it's for */
  title?: BiString;
  /** required both languages */
  summary: BiString;
  /** max 6 */
  segments?: BiString[];
  /** max 3 */
  profiles?: BiString[];
}

export interface ListItem {
  id: string;
  /** both required */
  label: BiString;
  detail?: BiString;
  /**
   * Requirements: Zod defaults omitted values to `true` at parse time
   * (`requirementItemSchema`). Deliverables may leave this undefined.
   */
  mandatory?: boolean;
}

export interface ServiceOnePagerContent {
  templateId: TemplateId;
  /**
   * Presentation mode. v1 product decision: full bilingual only.
   * Not a pure BCP-47 tag — means “render CN primary + EN secondary everywhere.”
   */
  locale: "zh-CN-en";
  meta: {
    /** PDF title may join "zh — en" */
    documentTitle: BiString;
    version: string;
    confidential?: boolean;
    updatedAt?: string;
    /** Overrides default bilingual disclaimer if set (both langs required when set) */
    disclaimer?: BiString;
    cycleLabel?: BiString;
    priceBand?: BiString;
  };
  product: {
    /** both required */
    name: BiString;
    categoryLabel?: BiString;
    tagline?: BiString;
  };
  targetCustomer: TargetCustomer;
  deliverables: {
    title?: BiString;
    intro?: BiString;
    /** hard 1–6 */
    items: ListItem[];
  };
  requirements: {
    title?: BiString;
    intro?: BiString;
    /** hard 1–8 (recommend ≤5 when bilingual) */
    items: ListItem[];
  };
  highlights?: {
    title?: BiString;
    /** max 4 */
    items: BiString[];
  };
  timeline?: {
    title?: BiString;
    /** max 4 */
    steps: { id: string; label: BiString; timeHint?: BiString }[];
  };
  brand: BrandConfig;
  layout?: {
    variant?: "stack" | "split";
    /** compact more often needed for bilingual */
    density?: "normal" | "compact";
    showHighlights?: boolean;
    showQr?: boolean;
    /** default true */
    dropOptionalIfTight?: boolean;
    softPanelOn?: "requirements" | "deliverables" | "none";
    /** Always true in v1 — EN secondary always rendered; flag reserved for future */
    bilingual?: true;
  };
}
