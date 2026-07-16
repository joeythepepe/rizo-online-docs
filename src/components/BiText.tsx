import type { BiString } from "../content/types";

export type BiTextRole =
  | "display"
  | "title"
  | "body"
  | "body-sm"
  | "label"
  | "meta";

const ROLE_CLASSES: Record<
  BiTextRole,
  { zh: string; en: string; zhColor: string; enColor: string }
> = {
  display: {
    zh: "text-print-display",
    en: "text-print-en-display",
    zhColor: "text-ink",
    enColor: "text-ink-secondary",
  },
  title: {
    zh: "text-print-title",
    en: "text-print-en-title",
    zhColor: "text-ink",
    enColor: "text-ink-secondary",
  },
  body: {
    zh: "text-print-body",
    en: "text-print-en-body",
    zhColor: "text-ink",
    enColor: "text-ink-secondary",
  },
  "body-sm": {
    zh: "text-print-body-sm",
    en: "text-print-en-body",
    zhColor: "text-ink",
    enColor: "text-ink-secondary",
  },
  label: {
    zh: "text-print-label",
    en: "text-print-en-label",
    zhColor: "text-ink-secondary",
    enColor: "text-ink-tertiary",
  },
  meta: {
    zh: "text-print-meta",
    en: "text-print-en-meta",
    zhColor: "text-ink-tertiary",
    enColor: "text-ink-tertiary",
  },
};

export interface BiTextProps {
  value: BiString;
  role?: BiTextRole;
  /** Extra class on the outer wrapper */
  className?: string;
  /**
   * `div` (default): block stack with p tags.
   * `span`: inline-flex column with gap-mm-1 so CN→EN gap works on inline boxes.
   */
  as?: "div" | "span";
  zhClassName?: string;
  enClassName?: string;
}

/**
 * Canonical bilingual unit: CN primary, then EN secondary 1 mm below.
 * Uses frozen print-* / print-en-* tokens only.
 */
export function BiText({
  value,
  role = "body",
  className = "",
  as = "div",
  zhClassName = "",
  enClassName = "",
}: BiTextProps) {
  const tokens = ROLE_CLASSES[role];
  const isInline = as === "span";
  const Tag = as;
  const ZhTag = isInline ? "span" : "p";
  const EnTag = isInline ? "span" : "p";

  const wrapperClass = [
    isInline ? "inline-flex flex-col gap-mm-1" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={wrapperClass || undefined}>
      <ZhTag className={`${tokens.zh} ${tokens.zhColor} ${zhClassName}`.trim()}>
        {value.zh}
      </ZhTag>
      <EnTag
        className={`${isInline ? "" : "mt-mm-1 "} ${tokens.en} ${tokens.enColor} ${enClassName}`.trim()}
      >
        {value.en}
      </EnTag>
    </Tag>
  );
}
