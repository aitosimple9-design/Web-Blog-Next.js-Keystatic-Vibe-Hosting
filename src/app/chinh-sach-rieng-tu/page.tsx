import { LegalPageView, legalMetadata } from "@/frontend/components/layout/LegalPageView";

// Nội dung soạn ở Keystatic (Trang → Chính sách riêng tư); trang chưa có chữ thì ẨN (404). Xem src/lib/legal-pages.ts.
export const generateMetadata = () => legalMetadata("privacy");

export default function Page() {
  return <LegalPageView id="privacy" />;
}
