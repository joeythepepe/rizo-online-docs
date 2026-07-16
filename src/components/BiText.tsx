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
  { zh: string; zhColor: string }
> = {
  display: {
    zh: "text-print-display",
    zhColor: "text-ink",
  },
  title: {
    zh: "text-print-title",
    zhColor: "text-ink",
  },
  body: {
    zh: "text-print-body",
    zhColor: "text-ink",
  },
  "body-sm": {
    zh: "text-print-body-sm",
    zhColor: "text-ink",
  },
  label: {
    zh: "text-print-label",
    zhColor: "text-ink-secondary",
  },
  meta: {
    zh: "text-print-meta",
    zhColor: "text-ink-tertiary",
  },
};

export interface BiTextProps {
  value: BiString;
  role?: BiTextRole;
  /** Extra class on the outer wrapper */
  className?: string;
  /**
   * `div` (default): block with p.
   * `span`: inline wrapper for inline contexts.
   */
  as?: "div" | "span";
  zhClassName?: string;
  /** @deprecated EN is no longer rendered (CN-only product decision). Kept for call-site compatibility. */
  enClassName?: string;
}

/**
 * Chinese-only text unit for print templates.
 * Schema still stores BiString `{ zh, en }`; only `.zh` is shown.
 */
export function BiText({
  value,
  role = "body",
  className = "",
  as = "div",
  zhClassName = "",
}: BiTextProps) {
  const tokens = ROLE_CLASSES[role];
  const isInline = as === "span";
  const Tag = as;
  const ZhTag = isInline ? "span" : "p";

  return (
    <Tag className={className || undefined}>
      <ZhTag className={`${tokens.zh} ${tokens.zhColor} ${zhClassName}`.trim()}>
        {value.zh}
      </ZhTag>
    </Tag>
  );
}
