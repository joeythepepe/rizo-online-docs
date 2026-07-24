import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadGalleryCards } from "@/content/loadGallery";
import { listProductIds, loadProduct } from "@/content/loadProduct";
import { ProductPreviewPage } from "@/views/ProductPreviewPage";

export function generateStaticParams() {
  return listProductIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = loadProduct(id);
    return {
      title: `${p.product.name} · 睿卓教育在线文档`,
      description: p.product.tagline ?? p.meta.documentTitle,
    };
  } catch {
    return { title: "未知方案 · 睿卓教育在线文档" };
  }
}

export default async function PreviewRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let baseContent;
  try {
    baseContent = loadProduct(id);
  } catch {
    notFound();
  }

  const allCards = loadGalleryCards();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ui-background font-ui text-sm text-ui-muted-foreground">
          加载预览…
        </div>
      }
    >
      <ProductPreviewPage
        id={id}
        baseContent={baseContent}
        allCards={allCards}
      />
    </Suspense>
  );
}
