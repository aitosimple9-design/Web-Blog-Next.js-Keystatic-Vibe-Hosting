import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Source_Serif_4 } from "next/font/google";
import { site } from "@/config/site";
import { getSiteSettings } from "@/lib/settings";
import { isIndexable } from "@/lib/indexing";
import "./globals.css";

// Font theo Design System: Source Serif 4 (tiêu đề + bài đọc) và Be Vietnam Pro (giao diện), subset tiếng Việt.
const serif = Source_Serif_4({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--next-serif",
  display: "swap",
});
const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--next-sans",
  display: "swap",
});

// Tên / khẩu hiệu / mô tả / ảnh OG lấy từ "Cài đặt site" (Keystatic); thiếu thì dùng giá trị trong src/config/site.ts.
export function generateMetadata(): Metadata {
  const s = getSiteSettings();
  return {
    metadataBase: new URL(site.url),
    title: { default: `${s.name} — ${s.tagline}`, template: `%s | ${s.name}` },
    description: s.description,
    // Không phải production: thêm thẻ meta robots noindex (header X-Robots-Tag ở next.config.ts chặn thêm một lớp)
    ...(isIndexable() ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: s.name,
      images: s.ogImage ? [{ url: s.ogImage }] : undefined,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#111110" },
  ],
};

// Đặt theme TRƯỚC khi vẽ trang để không nháy sáng: ưu tiên lựa chọn đã lưu, nếu không thì theo hệ điều hành.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Tiện ích trình duyệt (Monica, Grammarly...) hay chèn thuộc tính vào <body> trước khi React gắn vào: bỏ qua cảnh báo hydration CHỈ cho chính thẻ này (không che lỗi của phần bên trong) */}
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Bỏ qua, đến nội dung chính
        </a>
        {children}
      </body>
    </html>
  );
}
