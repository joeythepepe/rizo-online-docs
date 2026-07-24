import { Suspense } from "react";
import { loadGalleryCards } from "@/content/loadGallery";
import { GalleryPage } from "@/views/GalleryPage";

export default function HomePage() {
  const cards = loadGalleryCards();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ui-background font-ui text-sm text-ui-muted-foreground">
          加载方案库…
        </div>
      }
    >
      <GalleryPage initialCards={cards} />
    </Suspense>
  );
}
