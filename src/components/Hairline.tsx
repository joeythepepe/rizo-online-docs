/**
 * Full-width hairline rule (0.5 pt) within the A4 safe box.
 * Pair with `mb-mm-4` after the rule per layout contract.
 */
export function Hairline({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full border-0 border-t border-rule ${className}`.trim()}
      style={{ borderTopWidth: "0.5pt" }}
      role="separator"
    />
  );
}
