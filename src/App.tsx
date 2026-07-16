import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { listProductIds, loadProduct } from "./content/loadProduct";
import type { ServiceOnePagerContent } from "./content/types";
import { CountryFlag } from "./components/CountryFlag";
import { ServiceOnePager } from "./templates/a4-service-onepager/ServiceOnePager";

function GalleryPage() {
  const ids = listProductIds();

  return (
    <div className="min-h-screen bg-[#e8e8ed] p-8">
      <header className="no-print mb-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-ink">高考通 · 服务一页纸</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          预览 / 打印路由 · 各国本科申请服务说明
        </p>
      </header>

      <ul className="grid max-w-4xl list-none gap-4 p-0 sm:grid-cols-2">
        {ids.map((id) => {
          let titleZh = id;
          let countryCode: string | undefined;
          try {
            const p = loadProduct(id);
            titleZh = p.product.name;
            countryCode = p.product.countryCode;
          } catch {
            /* keep id */
          }
          return (
            <li
              key={id}
              className="rounded-lg border border-rule bg-paper p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {countryCode ? (
                  <CountryFlag code={countryCode} className="h-6 w-auto" />
                ) : null}
                <p className="text-base font-medium text-ink">{titleZh}</p>
              </div>
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
 * Apply `?density=compact` export override (Promotes compact CSS for overflow retry).
 * Query wins over product `layout.density`.
 */
function applyDensityOverride(
  content: ServiceOnePagerContent,
  densityParam: string | null,
): ServiceOnePagerContent {
  if (densityParam !== "compact" && densityParam !== "normal") {
    return content;
  }
  return {
    ...content,
    layout: {
      ...content.layout,
      density: densityParam,
    },
  };
}

/**
 * Chrome-less print root — no nav, no page shadow (export / designer print).
 * Query: `?export=1` (marker for tooling), `?density=compact` (overflow retry).
 */
function ProductPrintPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  if (!id) return <Navigate to="/" replace />;

  let content: ServiceOnePagerContent;
  try {
    content = applyDensityOverride(
      loadProduct(id),
      searchParams.get("density"),
    );
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

  const density = content.layout?.density ?? "normal";

  return (
    <div className="bg-paper" data-export={searchParams.get("export") ?? undefined} data-density={density}>
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
