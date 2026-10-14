// Khung trang: SiteHeader (đúng tông dải nền đầu trang) + nội dung + SiteFooter.
// Header đặt NGOÀI các dải để dính (sticky) suốt trang. Tone `inverse`: hero kéo lên nằm sau menu, thanh trong suốt ở đầu trang
// (mỗi hero chừa `pt` bằng `header-height`); các tone khác vẽ thanh phẳng. Cuộn xuống thì thành viên thuốc (xem HeaderBar).
import { getAllPosts } from "@/lib/posts";
import { topicBySlug } from "@/config/topics";
import { HeaderBar, type HeaderTone } from "@/components/layout/HeaderBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import type { ReactNode } from "react";

export function PageShell({ tone = "paper", children }: { tone?: HeaderTone; children: ReactNode }) {
  const searchIndex = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    topic: topicBySlug(p.category)?.name ?? p.category,
    book: p.source.book,
  }));
  return (
    // Một thẻ gốc duy nhất: nếu trả về 3 phần tử rời, Next.js sau khi chuyển trang gọi scrollIntoView trên cả
    // header / main / footer và trang bị cuộn xuống đáy (footer được cuộn tới trước).
    <div>
      <HeaderBar tone={tone} searchIndex={searchIndex} />
      <main id="main" tabIndex={-1} className="anim-page outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
