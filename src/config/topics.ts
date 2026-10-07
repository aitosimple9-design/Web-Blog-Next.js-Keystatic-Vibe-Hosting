// Danh mục (chủ đề) — MỘT chỗ duy nhất để sửa / thêm (Q7: demo trước, sửa được khi cần).
// `slug` phải khớp trường `category` trong frontmatter của bài (content/posts/*.md) và là URL: /blog/<slug>.
// Thêm chủ đề: thêm một dòng vào mảng dưới đây (giữ slug chữ thường, không dấu, nối bằng "-").
// Khi nối Keystatic (Giai đoạn 2), danh sách này sẽ được đồng bộ với `keystatic.config.ts`.

export type Topic = {
  slug: string;
  name: string;
  description: string;
  /** Ảnh nền của thẻ chủ đề (trang chủ) và Hero trang Blog; ảnh demo trong public/images/stock, ghi nguồn ở CREDITS.md */
  image: string;
};

export const topics: Topic[] = [
  {
    slug: "chu-de-1",
    image: "/images/stock/books-lamps.jpg",
    name: "Chủ đề 1",
    description:
      "Ghi chép ý chính và cách áp dụng từ các cuốn sách thuộc chủ đề này.",
  },
  {
    slug: "chu-de-2",
    image: "/images/stock/journal-coffee.jpg",
    name: "Chủ đề 2",
    description:
      "Những ý tưởng đáng nhớ được rút ra từ sách, kèm ví dụ dễ thử ngay.",
  },
  {
    slug: "chu-de-3",
    image: "/images/stock/reading-room.jpg",
    name: "Chủ đề 3",
    description:
      "Tóm lược và góc nhìn riêng về các cuốn sách cùng một mạch chủ đề.",
  },
  {
    slug: "chu-de-4",
    image: "/images/stock/notes-laptop.jpg",
    name: "Chủ đề 4",
    description:
      "Từ trang sách đến việc làm: những bước nhỏ để đưa kiến thức vào đời sống.",
  },
  {
    slug: "chu-de-5",
    image: "/images/stock/vintage-book-sofa.jpg",
    name: "Chủ đề 5",
    description:
      "Đọc chậm một cuốn sách, ghi lại điều còn đọng lại sau khi gấp trang.",
  },
];

export const topicBySlug = (slug: string) =>
  topics.find((t) => t.slug === slug);
