// Chữ MẶC ĐỊNH của các trang con (Book, Blog, Trang bài, 404). Chữ thật sửa ở Keystatic (menu Trang → Trang Book / Trang Blog / Trang bài viết / Trang 404,
// file content/pages/book.json, blog.json, bai-viet.json, 404.json); src/lib/pages.ts đọc các file đó và rơi về giá trị dưới đây khi ô thiếu hoặc để trống.
// Chỗ có {topic} sẽ được thay bằng tên chủ đề đang xem.

export const bookDefaults = {
  /** Tiêu đề tab: "<title> — <tên site>" */
  title: "Book",
  /** Mô tả trang; để trống thì dùng mô tả của Cài đặt site */
  description: "",
  hero: {
    titleLine1: "Điều đọng lại",
    titleLine2: "sau mỗi cuốn sách",
    dek: "Mỗi bài ghi chép một cuốn sách: ý chính, ví dụ và cách áp dụng.",
    ctaLabel: "Đọc bài mới nhất",
    followLabel: "Theo dõi",
    featuredEyebrow: "Bài nổi bật",
    featuredFallback: "Xem tất cả bài viết",
    statPosts: "Bài viết",
    statTopics: "Chủ đề",
    statBooks: "Cuốn sách",
    /** Chữ khổng lồ nét viền làm họa tiết nền Hero (nên ngắn, ≤ 6 ký tự) */
    backdropWord: "Đọc",
  },
  marquee: ["Đọc", "Ghi chép", "Suy ngẫm", "Áp dụng", "Nhớ lâu"],
  topics: {
    title: "Chủ đề",
    dek: "Chọn một chủ đề để đọc các bài ghi chép liên quan. Vuốt ngang để xem thêm.",
  },
  latest: {
    title: "Bài viết mới nhất",
    dek: "Những bài ghi chép mới đăng gần đây.",
    totalLabel: "Bài viết đã đăng",
    allLabel: "Xem tất cả",
  },
};
export type BookPageTexts = typeof bookDefaults;

export const blogDefaults = {
  /** Tiêu đề trang dành cho trình đọc màn hình và công cụ tìm kiếm (không hiện ra mắt nhìn) */
  heading: "Blog",
  intro: "Các bài ghi chép theo từng cuốn sách và chủ đề. Chọn một chủ đề để xem danh sách bài của chủ đề đó.",
  hero: {
    eyebrow: "Chủ đề",
    ctaLabel: "Đọc bài mới nhất",
    statPosts: "Bài viết",
    statBooks: "Cuốn sách",
    statMinutes: "Phút đọc TB",
  },
  /** Tiêu đề tab của trang chủ đề: "<tên chủ đề> — <titleSuffix>"; trang phân trang: "<tên chủ đề> — <pageLabel>" ({page} = số trang) */
  titleSuffix: "Blog",
  pageLabel: "trang {page}",
  /** Đường dẫn (breadcrumb) ở trang Blog và trang bài */
  breadcrumb: { home: "Trang chủ", blog: "Blog" },
  listTitle: "Bài viết trong {topic}",
  emptyText: "Chủ đề này chưa có bài viết. Hãy quay lại sau nhé.",
};
export type BlogPageTexts = typeof blogDefaults;

export const articleDefaults = {
  sourceLabel: "Bài viết dựa trên",
  relatedTitle: "Bài liên quan.",
  relatedDek: "Đọc tiếp những bài cùng chủ đề.",
  tocLabel: "Mục lục",
};
export type ArticlePageTexts = typeof articleDefaults;

export const notFoundDefaults = {
  tabTitle: "Không tìm thấy trang",
  eyebrow: "Lỗi 404",
  title: "Không tìm thấy trang này",
  text: "Đường dẫn có thể đã đổi hoặc bài viết chưa được đăng. Quay về Trang chủ hoặc xem các bài mới nhất.",
  homeLabel: "Về Trang chủ",
  blogLabel: "Xem Blog",
};
export type NotFoundPageTexts = typeof notFoundDefaults;
