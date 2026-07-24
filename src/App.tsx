import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ComparePage } from "./pages/ComparePage";
import { GalleryPage } from "./pages/GalleryPage";
import { ProductPreviewPage } from "./pages/ProductPreviewPage";
import { ProductPrintPage } from "./pages/ProductPrintPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/p/:id" element={<ProductPreviewPage />} />
        <Route path="/print/:id" element={<ProductPrintPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
