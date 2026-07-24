"use client";

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
 * Gallery chrome styling (ui-accent); keep utilities print-check safe.
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
    "text-[11px] font-medium text-ui-foreground underline-offset-2 hover:underline disabled:opacity-50 disabled:no-underline";
  const baseButton =
    "inline-flex items-center gap-1.5 rounded-lg bg-ui-accent px-3 py-1.5 text-[11px] font-medium text-ui-accent-foreground hover:opacity-90 disabled:opacity-60";

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        data-download-pdf
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
