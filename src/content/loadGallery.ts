/**
 * Server-only gallery card loading (uses filesystem product loader).
 */
import { galleryCardFromContent, type GalleryCard } from "./gallery";
import { listProductIds, loadProduct } from "./loadProduct";

export function loadGalleryCards(): GalleryCard[] {
  return listProductIds().map((id) => {
    try {
      return galleryCardFromContent(id, loadProduct(id));
    } catch {
      return { id, name: id, catalog: "admissions" as const };
    }
  });
}
