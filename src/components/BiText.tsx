import type { ZhString } from "../content/types";

export type BiTextRole =
  | "display"
  | "title"
  | "body"
  | "body-sm"
  | "label"
  | "meta";

const ROLE_CLASSES: Record<BiTextRole, { text: string; color: string }> = {
  display: { text: "text-print-display", color: "text-ink" },
  title: { text: "text-print-title", color: "text-ink" },
  body: { text: "text-print-body", color: "text-ink" },
  "body-sm": { text: "text-print-body-sm", color: "text-ink" },
  label: { text: "text-print-label", color: "text-ink-secondary" },
  meta: { text: "text-print-meta", color: "text-ink-tertiary" },
};

export interface BiTextProps {
  value: ZhString;
  role?: BiTextRole;
  className?: string;
  as?: "div" | "span";
  zhClassName?: string;
}

/**
 * Chinese-only text for print templates (frozen print-* tokens).
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
  const TextTag = isInline ? "span" : "p";

  return (
    <Tag className={className || undefined}>
      <TextTag
        className={`${tokens.text} ${tokens.color} ${zhClassName}`.trim()}
      >
        {value}
      </TextTag>
    </Tag>
  );
}
