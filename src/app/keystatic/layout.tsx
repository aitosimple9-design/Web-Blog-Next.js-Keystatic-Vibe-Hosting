import type { ReactNode } from "react";

// Trang quản trị không cần SEO: không cho công cụ tìm kiếm lập chỉ mục.
export const metadata = { title: "Quản trị bài viết", robots: { index: false, follow: false } };

export default function KeystaticLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
