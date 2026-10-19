// Khung chung của hai trang chữ (Chính sách riêng tư, Liên hệ): tiêu đề, ngày cập nhật, thân Markdown (kiểu chữ bài đọc `prose-article`),
// trang Liên hệ thêm nút email và hàng icon mạng xã hội (lấy ở Cài đặt site). Trang ẨN (chưa có chữ) thì 404. Layout: như trang 404 (nền paper, một cột).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_PAGES, getLegalPage, readLegalPage, type LegalPageId } from "@/shared/content/legal-pages";
import { getSiteSettings } from "@/shared/content/settings";
import { formatDateLong } from "@/shared/format";
import { PageShell } from "@/frontend/components/layout/PageShell";
import { SocialIcons } from "@/frontend/components/layout/SocialIcons";
import { Button } from "@/frontend/components/ui/Button";

export function legalMetadata(id: LegalPageId): Metadata {
  const page = readLegalPage(id);
  if (!page) return {}; // trang ẩn: 404, không cần metadata
  return {
    title: page.title,
    description: page.description ?? getSiteSettings().description,
    alternates: { canonical: LEGAL_PAGES[id].href },
  };
}

export async function LegalPageView({ id }: { id: LegalPageId }) {
  const page = await getLegalPage(id);
  if (!page) notFound();
  return (
    <PageShell tone="paper">
      <article className="wrap band-y max-w-3xl">
        <h1 className="type-display-lg text-balance">{page.title}</h1>
        {page.updated ? <p className="type-caption mt-s3 text-ink-faint">Cập nhật lần cuối: {formatDateLong(page.updated)}</p> : null}
        {page.html ? <div className="prose-article mt-s6" dangerouslySetInnerHTML={{ __html: page.html }} /> : null}
        {id === "contact" ? (
          <div className="mt-s7 grid gap-s5">
            {page.email ? (
              <div>
                <p className="type-eyebrow uppercase text-ink-faint">Email</p>
                <div className="mt-s3">
                  <Button href={`mailto:${page.email}`}>{page.email}</Button>
                </div>
              </div>
            ) : null}
            <SocialIcons />
          </div>
        ) : null}
      </article>
    </PageShell>
  );
}
