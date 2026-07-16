import type { BiString } from "../types";

/**
 * Default bilingual UI chrome strings (DESIGN.md Appendix B).
 * Applied when product JSON omits chrome-overridable BiStrings.
 */
export const BILINGUAL_CHROME = {
  docLabel: {
    zh: "服务说明",
    en: "Service overview",
  },
  targetSection: {
    zh: "适合人群",
    en: "Who it's for",
  },
  deliverablesSection: {
    zh: "服务内容",
    en: "What's included",
  },
  requirementsSection: {
    zh: "客户需具备",
    en: "Client requirements",
  },
  highlights: {
    zh: "方案要点",
    en: "Highlights",
  },
  timeline: {
    zh: "服务节奏",
    en: "Service cadence",
  },
  confidential: {
    zh: "内部资料 · 请勿外传",
    en: "Internal — do not forward",
  },
  /** Always rendered when meta.disclaimer is omitted */
  disclaimer: {
    zh: "本材料为咨询服务说明，不代表院校官方意见，不承诺录取结果。",
    en: "This material describes consulting services only. It does not represent any university and does not guarantee admission.",
  },
  ctaLabel: {
    zh: "预约顾问",
    en: "Book a consultation",
  },
  ctaDetail: {
    zh: "扫码添加顾问微信",
    en: "Scan to add counselor WeChat",
  },
} as const satisfies Record<string, BiString>;

export type BilingualChromeKey = keyof typeof BILINGUAL_CHROME;
