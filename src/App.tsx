import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { listProductIds, loadProduct } from "./content/loadProduct";
import { ServiceOnePager } from "./templates/a4-service-onepager/ServiceOnePager";

function GalleryPage() {
  const ids = listProductIds();

  return (
    <div className="min-h-screen bg-[#e8e8ed] p-8">
      <header className="no-print mb-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-ink">Service one-pagers</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Gallery · open preview or chrome-less print route
        </p>
      </header>

      <ul className="grid max-w-4xl list-none gap-4 p-0 sm:grid-cols-2">
        {ids.map((id) => {
          let titleZh = id;
          let titleEn = "";
          try {
            const p = loadProduct(id);
            titleZh = p.product.name.zh;
            titleEn = p.product.name.en;
          } catch {
            /* keep id */
          }
          return (
            <li
              key={id}
              className="rounded-lg border border-rule bg-paper p-5 shadow-sm"
            >
              <p className="text-base font-medium text-ink">{titleZh}</p>
              {titleEn ? (
                <p className="mt-1 text-sm text-ink-secondary">{titleEn}</p>
              ) : null}
              <p className="mt-2 font-mono text-xs text-ink-tertiary">{id}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link
                  className="text-accent underline-offset-2 hover:underline"
                  to={`/p/${id}`}
                >
                  Preview
                </Link>
                <Link
                  className="text-accent underline-offset-2 hover:underline"
                  to={`/print/${id}`}
                >
                  Print
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {ids.length === 0 ? (
        <p className="text-sm text-ink-secondary">No products found.</p>
      ) : null}
    </div>
  );
}

function ProductPreviewPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" replace />;

  let content;
  try {
    content = loadProduct(id);
  } catch (err) {
    return (
      <div className="min-h-screen bg-[#e8e8ed] p-8">
        <p className="text-ink">Unknown product: {id}</p>
        <Link className="mt-4 inline-block text-accent" to="/">
          ← Gallery
        </Link>
        <pre className="mt-4 text-xs text-ink-secondary">
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8e8ed] py-8">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between px-4">
        <div>
          <Link className="text-sm text-accent" to="/">
            ← Gallery
          </Link>
          <p className="mt-1 text-xs text-ink-tertiary">
            Preview · {id} ·{" "}
            <Link className="text-accent" to={`/print/${id}`}>
              open print route
            </Link>
          </p>
        </div>
      </div>
      <div className="mx-auto w-a4 shadow-lg">
        <ServiceOnePager content={content} />
      </div>
    </div>
  );
}

/**
 * Chrome-less print root — no nav, no page shadow (export / designer print).
 */
function ProductPrintPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" replace />;

  let content;
  try {
    content = loadProduct(id);
  } catch (err) {
    return (
      <div className="bg-paper p-mm-14 text-ink">
        <p>Unknown product: {id}</p>
        <pre className="mt-mm-4 text-print-meta text-ink-secondary">
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <ServiceOnePager content={content} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/p/:id" element={<ProductPreviewPage />} />
        <Route path="/print/:id" element={<ProductPrintPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
