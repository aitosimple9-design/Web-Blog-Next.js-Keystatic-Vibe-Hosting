// NHÃN các ô của form bài trong Keystatic mà hộp điểm SEO phải đọc (src/app/keystatic/SeoPanel.tsx).
// Đây là NGUỒN DUY NHẤT: keystatic.config.ts dùng đúng các hằng số này làm nhãn ô, hộp điểm tìm ô theo đúng các chuỗi này
// (khớp tên truy cập của ô). Sửa nhãn ở đây là cả hai cùng đổi; tests/unit/cms/seo-fields.test.ts chặn việc ai đó sửa nhãn trong
// keystatic.config.ts mà không qua file này, vì khi đó hộp điểm sẽ không tìm thấy ô và chấm sai.
export const POST_FIELD_LABELS = {
  title: "Tiêu đề",
  slug: "Slug (tên file, chữ thường không dấu nối bằng '-')",
  description: "Mô tả (≤ 160 ký tự, dùng cho meta description + Open Graph)",
  cover: "Ảnh bìa",
  coverAlt: "Mô tả ảnh bìa (alt)",
  tags: "Thẻ (từ khóa của bài)",
  focusKeyword: "Từ khóa chính (cụm người đọc gõ để tìm bài, 2-4 từ; dùng cho điểm SEO, không hiện ra ngoài)",
  seoTitle: "Tiêu đề SEO riêng (≤ 60 ký tự; bỏ trống thì dùng Tiêu đề bài)",
  ogImage: "Ảnh chia sẻ riêng (Open Graph, nên 1200x630; bỏ trống thì dùng ảnh bìa)",
  related: "Bài liên quan (chọn tay; bỏ trống thì tự chọn theo chủ đề)",
  content: "Nội dung",
} as const;

export type PostFieldKey = keyof typeof POST_FIELD_LABELS;

/** Tên thân thiện của ô, dùng khi báo "không đọc được ô này". */
export const POST_FIELD_NAMES: Record<PostFieldKey, string> = {
  title: "Tiêu đề",
  slug: "Slug",
  description: "Mô tả",
  cover: "Ảnh bìa",
  coverAlt: "Mô tả ảnh bìa",
  tags: "Thẻ",
  focusKeyword: "Từ khóa chính",
  seoTitle: "Tiêu đề SEO riêng",
  ogImage: "Ảnh chia sẻ riêng",
  related: "Bài liên quan",
  content: "Nội dung",
};
