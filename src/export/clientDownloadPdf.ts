/**
 * Browser-side one-click PDF download for the A4 service page.
 * Renders the print route off-screen, captures [data-page=a4], writes A4 PDF.
 */

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { A4_HEIGHT_MM, A4_WIDTH_MM } from "./pdf";

const LOAD_TIMEOUT_MS = 30_000;
const FONT_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(t);
        reject(e);
      },
    );
  });
}

async function waitForImages(doc: Document): Promise<void> {
  const imgs = Array.from(doc.images);
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
    ),
  );
}

async function waitForFonts(doc: Document): Promise<void> {
  if (doc.fonts?.ready) {
    await withTimeout(doc.fonts.ready, FONT_TIMEOUT_MS, "document.fonts.ready");
  }
}

/**
 * Capture an already-mounted A4 element and download as PDF.
 */
export async function downloadA4ElementAsPdf(
  element: HTMLElement,
  options: { fileName: string; title?: string },
): Promise<void> {
  const { fileName, title } = options;

  // Ensure layout has settled (mm units / webfonts).
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
    // Prefer full element box; mm-sized A4 must not be clipped by transform.
    width: element.offsetWidth,
    height: element.offsetHeight,
    style: {
      // Neutralize any preview shadow / transform on ancestors for capture.
      transform: "none",
      boxShadow: "none",
    },
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  if (title) {
    pdf.setProperties({ title });
  }

  pdf.addImage(dataUrl, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, "FAST");
  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}

function createOffscreenFrame(src: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "pdf-export");
  iframe.setAttribute("aria-hidden", "true");
  // Keep in layout (not display:none) so mm geometry + fonts compute correctly.
  Object.assign(iframe.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${A4_WIDTH_MM}mm`,
    height: `${A4_HEIGHT_MM}mm`,
    opacity: "0",
    pointerEvents: "none",
    border: "0",
    zIndex: "-1",
  });
  iframe.src = src;
  return iframe;
}

/**
 * Load `/print/:productId?export=1` off-screen, capture A4, download PDF, tear down.
 */
export async function downloadProductPdf(
  productId: string,
  options: { fileName?: string; title?: string } = {},
): Promise<void> {
  const fileName = options.fileName ?? `${productId}.pdf`;
  const src = `/print/${encodeURIComponent(productId)}?export=1`;

  const iframe = createOffscreenFrame(src);
  document.body.appendChild(iframe);

  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        iframe.onload = () => resolve();
        iframe.onerror = () => reject(new Error(`Failed to load print page: ${src}`));
      }),
      LOAD_TIMEOUT_MS,
      "print page load",
    );

    const doc = iframe.contentDocument;
    if (!doc?.body) {
      throw new Error("Print iframe has no document");
    }

    await waitForFonts(doc);
    await waitForImages(doc);

    // Ensure baked PDF watermark finished painting (export-only layer).
    const wm = doc.querySelector(".a4-watermark-img") as HTMLImageElement | null;
    if (wm && !wm.complete) {
      await withTimeout(
        new Promise<void>((resolve) => {
          wm.addEventListener("load", () => resolve(), { once: true });
          wm.addEventListener("error", () => resolve(), { once: true });
        }),
        FONT_TIMEOUT_MS,
        "watermark image",
      );
    }

    // Brief settle for layout after fonts/images.
    await new Promise((r) => window.setTimeout(r, 120));

    const page = doc.querySelector("[data-page=a4]") as HTMLElement | null;
    if (!page) {
      throw new Error("A4 page not found on print route");
    }

    await downloadA4ElementAsPdf(page, {
      fileName,
      title: options.title,
    });
  } finally {
    iframe.remove();
  }
}
