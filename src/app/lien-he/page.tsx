import { LegalPageView, legalMetadata } from "@/frontend/components/layout/LegalPageView";

// Nội dung soạn ở Keystatic (Trang → Liên hệ); trang chưa có chữ thì ẨN (404). Xem src/lib/legal-pages.ts.
export const generateMetadata = () => legalMetadata("contact");

export default function Page() {
  return <LegalPageView id="contact" />;
}
