// XEM TRƯỚC bài trong trang quản trị (nút "Xem trước" của Keystatic). Hiện cả bản nháp và bài lên lịch, đọc thẳng từ file đã LƯU.
// Không dựng sẵn, không vào sitemap, chặn công cụ tìm kiếm; chỉ mở được trên máy soạn bài (src/lib/preview.ts).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPreviewEnabled } from "@/lib/preview";
import { getPostForPreview } from "@/lib/posts";
import { ArticleView } from "@/components/article/ArticleView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Xem trước bài",
  robots: { index: false, follow: false },
};

const note = {
  published: "XEM TRƯỚC · bài này đã đăng, đây là bản đã lưu",
  draft: "XEM TRƯỚC · bài đang ẩn khỏi website (tick Ẩn bài này, hoặc Trạng thái Nháp / Chờ duyệt)",
  scheduled: "XEM TRƯỚC · bài lên lịch, chỉ hiện trên website từ ngày đăng (sau lần deploy)",
} as const;

export default async function PreviewPage({ params }: Props) {
  if (!isPreviewEnabled()) notFound();
  const { slug } = await params;
  const post = await getPostForPreview(slug);
  if (!post) notFound();
  return <ArticleView post={post} previewNote={`${note[post.state]}. Chưa lưu thì chưa thấy thay đổi.`} />;
}
