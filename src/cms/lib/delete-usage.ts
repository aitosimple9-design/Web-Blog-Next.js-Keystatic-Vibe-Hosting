// Câu cảnh báo trong hộp "Delete entry" của Keystatic khi xóa một Chủ đề / Chủ đề con / Sách đang được dùng (src/cms/ui/KeystaticDeleteGuard.tsx).
// Hàm thuần: nhận số liệu của /api/thong-ke (src/shared/content/admin-stats.ts), trả câu cảnh báo hoặc null khi không ai dùng.
// Chỉ CẢNH BÁO, không chặn: ở chế độ GitHub số liệu là của bản đã merge, có thể chưa tính thay đổi trên nhánh đang soạn. Lớp chặn thật là check-content ở CI.

export type UsageStats = {
  topics: Record<string, { subtopics: number; posts: number }>;
  subtopics: Record<string, { posts: number }>;
  books?: Record<string, { posts: number }>;
  shelf?: { topics: Record<string, number>; books: Record<string, number> };
};

export type DeleteKind = "topics" | "subtopics" | "books";

const NOUN: Record<DeleteKind, string> = { topics: "Chủ đề", subtopics: "Chủ đề con", books: "Sách" };

/** Câu cảnh báo khi xóa mục `slug` loại `kind`; null = không có gì đang dùng (hoặc chưa có số liệu) */
export function deleteWarning(stats: UsageStats, kind: DeleteKind, slug: string, onBranch = false): string | null {
  const parts: string[] = [];
  let effect = "";
  if (kind === "topics") {
    const t = stats.topics[slug];
    if (t?.posts) parts.push(`${t.posts} bài viết`);
    if (t?.subtopics) parts.push(`${t.subtopics} chủ đề con`);
    if (stats.shelf?.topics[slug]) parts.push(`${stats.shelf.topics[slug]} bìa ở Tủ sách Trang chủ`);
    effect = "Xóa bây giờ thì chúng trỏ vào chủ đề không còn: CI báo lỗi và không đăng được. Hãy chuyển bài và chủ đề con sang chủ đề khác trước, và tạo chuyển hướng cho /blog/" + slug + ".";
  } else if (kind === "subtopics") {
    const s = stats.subtopics[slug];
    if (s?.posts) parts.push(`${s.posts} bài viết`);
    effect = "Xóa bây giờ thì các bài đó trỏ vào chủ đề con không còn: CI báo lỗi và không đăng được. Hãy bỏ chủ đề con này khỏi các bài trước.";
  } else {
    const b = stats.books?.[slug];
    if (b?.posts) parts.push(`${b.posts} bài viết`);
    if (stats.shelf?.books[slug]) parts.push(`${stats.shelf.books[slug]} bìa ở Tủ sách Trang chủ`);
    effect = "Xóa thì các bài đó mất bìa sách (hiện bìa sinh tự động) và Tủ sách mất cuốn này. Nên đổi Tên sách ở các bài trước.";
  }
  if (parts.length === 0) return null;
  const note = onBranch ? " (Số liệu theo bản đã merge vào main; thay đổi trên nhánh này chưa được tính.)" : "";
  return `${NOUN[kind]} này đang được dùng bởi ${parts.join(", ")}. ${effect}${note}`;
}
