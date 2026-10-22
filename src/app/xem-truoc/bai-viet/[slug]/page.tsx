// XEM TRƯỚC bài trong trang quản trị (nút "Xem trước" của Keystatic). Hiện cả bản nháp và bài lên lịch, đọc bản đã LƯU.
// Không dựng sẵn, không vào sitemap, chặn công cụ tìm kiếm; chỉ quản trị viên mở được (src/lib/admin-access.ts), người lạ nhận 404.
//  - Chế độ local: đọc file ở máy.
//  - Chế độ GitHub (web thật): đọc bản đã lưu ở NHÁNH đang soạn (`?branch=`, Keystatic tự điền) qua GitHub API bằng token của chính người xem.
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminCookieHeader, tokenFromCookieHeader } from "@/cms/lib/admin-access";
import { fetchPostRaw, fetchSubtopicRaw, fetchTopicRaw, friendlyGithubError, GithubError, validBranch } from "@/cms/lib/github-content";
import { categoryOfRaw, getPostForPreview, getPostFromRaw, subtopicsOfRaw } from "@/shared/content/posts";
import { registerPreviewTopic, topicBySlug, topicFromJson } from "@/shared/content/topics";
import { registerPreviewSubtopic, subtopicBySlug, subtopicFromJson } from "@/shared/content/subtopics";
import { ArticleView } from "@/frontend/components/article/ArticleView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ branch?: string }> };

export const metadata: Metadata = {
  title: "Xem trước bài",
  robots: { index: false, follow: false },
};

const note = {
  published: "XEM TRƯỚC · bài này đã đăng, đây là bản đã lưu",
  draft: "XEM TRƯỚC · bài đang ẩn khỏi website (tick Ẩn bài này, hoặc Trạng thái Nháp / Chờ duyệt)",
  scheduled: "XEM TRƯỚC · bài lên lịch, chỉ hiện trên website từ ngày đăng (sau lần deploy)",
} as const;

function Problem({ text }: { text: string }) {
  return (
    <main id="main" className="wrap band-y max-w-2xl">
      <p className="type-eyebrow uppercase text-ink-faint">Xem trước bài</p>
      <p className="type-dek mt-s3 text-ink-soft">{text}</p>
    </main>
  );
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const cookieHeader = (await headers()).get("cookie");
  if (!(await isAdminCookieHeader(cookieHeader))) notFound();
  const { slug } = await params;

  if (process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github") {
    const { branch = "main" } = await searchParams;
    const token = tokenFromCookieHeader(cookieHeader);
    if (!token || !validBranch(branch)) notFound();
    let post: Awaited<ReturnType<typeof getPostFromRaw>> | null = null;
    let problem: string | null = null;
    try {
      const raw = await fetchPostRaw(token, branch, slug);
      if (raw === null) problem = `Chưa có bài "${slug}" ở nhánh "${branch}". Bấm Lưu trong Keystatic rồi mở lại Xem trước.`;
      else {
        // Chủ đề mới tạo cùng lúc ở nhánh này chưa có trong bản build: lấy từ nhánh để dựng được bài
        const category = categoryOfRaw(raw);
        if (category && !topicBySlug(category)) {
          const topicRaw = await fetchTopicRaw(token, branch, category);
          const topic = topicRaw === null ? null : topicFromJson(category, topicRaw);
          if (topic) registerPreviewTopic({ slug: topic.slug, name: topic.name, description: topic.description, image: topic.image });
        }
        // Chủ đề con mới tạo cùng lúc ở nhánh này cũng chưa có trong bản build
        for (const sub of subtopicsOfRaw(raw)) {
          if (subtopicBySlug(sub)) continue;
          const subRaw = await fetchSubtopicRaw(token, branch, sub);
          const row = subRaw === null ? null : subtopicFromJson(sub, subRaw);
          if (row) registerPreviewSubtopic({ slug: row.slug, name: row.name, topic: row.topic, description: row.description, image: row.image });
        }
        post = await getPostFromRaw(slug, raw);
      }
    } catch (e) {
      problem = `Không dựng được bản xem trước: ${e instanceof GithubError ? friendlyGithubError(e) : e instanceof Error ? e.message : "lỗi không rõ"}`;
    }
    if (!post) return <Problem text={problem ?? "Không có nội dung."} />;
    return <ArticleView post={post} previewNote={`${note[post.state]} (nhánh ${branch}). Chưa lưu thì chưa thấy thay đổi.`} />;
  }

  const post = await getPostForPreview(slug);
  if (!post) notFound();
  return <ArticleView post={post} previewNote={`${note[post.state]}. Chưa lưu thì chưa thấy thay đổi.`} />;
}
