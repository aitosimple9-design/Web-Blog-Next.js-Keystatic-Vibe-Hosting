// Cho thẻ "Kiểm tra nội dung" ở Dashboard (src/cms/ui/KeystaticContentCheck.tsx): nhóm các dòng "đường dẫn file: lời nhắn" của bộ luật
// (src/shared/content-check.ts) theo file, và dựng đường dẫn tới trang sửa của mục đó trong Keystatic. Hàm thuần để test được.
// Bảng singleton phải khớp keystatic.config.ts (tên singleton ↔ đường dẫn file).

const COLLECTIONS: Record<string, string> = { posts: ".md", topics: ".json", subtopics: ".json", books: ".json", redirects: ".json" };
const SINGLETONS: Record<string, string> = {
  "content/settings/site.json": "siteSettings",
  "content/settings/header.json": "headerSettings",
  "content/settings/footer.json": "footerSettings",
  "content/settings/newsletter.json": "newsletterSettings",
  "content/settings/ui-labels.json": "uiLabels",
  "content/pages/trang-chu.json": "homePage",
  "content/pages/book.json": "bookPage",
  "content/pages/blog.json": "blogPage",
  "content/pages/bai-viet.json": "articlePage",
  "content/pages/404.json": "notFoundPage",
  "content/pages/chinh-sach-rieng-tu.md": "privacyPage",
  "content/pages/lien-he.md": "contactPage",
};

/** Đường dẫn trang sửa trong Keystatic cho file `where` (null = không phải mục sửa được, vd. ảnh mồ côi, biến môi trường) */
export function adminLinkFor(where: string, branch: string | null): string | null {
  const prefix = branch ? `/keystatic/branch/${encodeURIComponent(branch)}` : "/keystatic";
  const single = SINGLETONS[where];
  if (single) return `${prefix}/singleton/${single}`;
  const m = /^content\/([a-z]+)\/([^/]+)$/.exec(where);
  if (!m || !(m[1] in COLLECTIONS) || !m[2].endsWith(COLLECTIONS[m[1]])) return null;
  const slug = m[2].slice(0, -COLLECTIONS[m[1]].length);
  return `${prefix}/collection/${m[1]}/item/${encodeURIComponent(slug)}`;
}

const KIND_LABEL: Record<string, string> = { posts: "Bài viết", topics: "Chủ đề", subtopics: "Chủ đề con", books: "Sách", redirects: "Chuyển hướng" };
const SINGLETON_LABEL: Record<string, string> = {
  siteSettings: "Cài đặt site",
  headerSettings: "Header",
  footerSettings: "Footer",
  newsletterSettings: "Newsletter",
  uiLabels: "Nhãn giao diện",
  homePage: "Trang chủ",
  bookPage: "Trang Book",
  blogPage: "Trang Blog",
  articlePage: "Trang bài viết",
  notFoundPage: "Trang 404",
  privacyPage: "Chính sách riêng tư",
  contactPage: "Liên hệ",
};

/** Tên dễ đọc cho file `where`: "Bài viết · <slug>", "Trang chủ"...; không nhận ra thì giữ nguyên đường dẫn */
export function labelFor(where: string): string {
  const single = SINGLETONS[where];
  if (single) return SINGLETON_LABEL[single] ?? single;
  const m = /^content\/([a-z]+)\/([^/]+)\.(?:md|json)$/.exec(where);
  if (m && KIND_LABEL[m[1]]) return `${KIND_LABEL[m[1]]} · ${m[2]}`;
  if (where.startsWith("public/images/")) return `Ảnh · ${where.slice("public/images/".length)}`;
  return where || "Chung";
}

export type FileGroup = { where: string; label: string; link: string | null; messages: string[] };

/** Nhóm các dòng "where: message" theo `where`, giữ thứ tự xuất hiện đầu tiên */
export function groupByFile(lines: string[], branch: string | null): FileGroup[] {
  const groups = new Map<string, FileGroup>();
  for (const line of lines) {
    const i = line.indexOf(": ");
    const where = i > 0 ? line.slice(0, i) : "";
    const message = i > 0 ? line.slice(i + 2) : line;
    let g = groups.get(where);
    if (!g) {
      g = { where, label: labelFor(where), link: where ? adminLinkFor(where, branch) : null, messages: [] };
      groups.set(where, g);
    }
    g.messages.push(message);
  }
  return [...groups.values()];
}
