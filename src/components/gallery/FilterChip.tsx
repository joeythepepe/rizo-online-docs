import type { ReactNode } from "react";

export function FilterChip({
  active,
  onClick,
  children,
  count,
  tone = "dark",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  /** dark = black fill; accent = chartreuse (catalog primary) */
  tone?: "dark" | "accent";
}) {
  const activeClass =
    tone === "accent"
      ? "border-ui-accent bg-ui-accent text-ui-accent-foreground"
      : "border-ui-foreground bg-ui-foreground text-ui-accent";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
        active
          ? activeClass
          : "border-ui-border bg-ui-card text-ui-muted-foreground hover:border-ui-foreground/25 hover:text-ui-foreground"
      }`}
    >
      {children}
      {count !== undefined ? (
        <span className={`ml-1.5 font-mono ${active ? "opacity-70" : ""}`}>
          {count}
        </span>
      ) : null}
    </button>
  );
}
