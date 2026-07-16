import type { ZhString } from "../types";

/**
 * Default Chinese UI chrome strings.
 * Applied when product JSON omits chrome-overridable titles / CTA / disclaimer.
 */
export const BILINGUAL_CHROME = {
  docLabel: "服务说明",
  targetSection: "适合人群",
  deliverablesSection: "服务内容",
  requirementsSection: "客户需具备",
  highlights: "方案要点",
  timeline: "服务节奏",
  confidential: "内部资料 · 请勿外传",
  /** Always rendered when meta.disclaimer is omitted */
  disclaimer:
    "本材料为咨询服务说明，不代表院校官方意见，不承诺录取结果。",
  ctaLabel: "预约顾问",
  ctaDetail: "扫码添加顾问微信",
} as const satisfies Record<string, ZhString>;

export type BilingualChromeKey = keyof typeof BILINGUAL_CHROME;
