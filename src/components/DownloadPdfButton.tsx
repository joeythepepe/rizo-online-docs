import { useState, type ReactNode } from "react";
import { downloadProductPdf } from "../export/clientDownloadPdf";

export interface DownloadPdfButtonProps {
  productId: string;
  /** Suggested download file name (without path). Defaults to `{productId}.pdf`. */
  fileName?: string;
  /** PDF document title metadata. */
  title?: string;
  className?: string;
  /** Visual variant for gallery links vs preview toolbar. */
  variant?: "link" | "button";
  children?: ReactNode;
}

/**
 * One-click「下载 PDF」— captures the print A4 and saves a file.
 */
export function DownloadPdfButton({
  productId,
  fileName,
  title,
  className = "",
  variant = "link",
  children = "下载 PDF",
}: DownloadPdfButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await downloadProductPdf(productId, { fileName, title });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("download PDF failed:", err);
    } finally {
      setBusy(false);
    }
  }

  const baseLink =
    "text-accent underline-offset-2 hover:underline disabled:opacity-50 disabled:no-underline";
  const baseButton =
    "rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60";

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={[variant === "button" ? baseButton : baseLink, className]
          .filter(Boolean)
          .join(" ")}
        aria-busy={busy}
      >
        {busy ? "生成中…" : children}
      </button>
      {error ? (
        <span className="max-w-xs text-xs text-red-600" role="alert">
          下载失败：{error}
        </span>
      ) : null}
    </span>
  );
}
