// Cấu hình Keystatic — PHẢI khớp CLAUDE.md mục 5 (cấu trúc bài viết dùng chung với dự án B).
// Bài lưu ở content/posts/<slug>.md (đuôi .md thuần, không .mdoc).
// `slug` lấy từ TÊN FILE (Keystatic không ghi trường slug vào frontmatter); src/lib/posts.ts chấp nhận cả hai.
import { collection, config, fields } from "@keystatic/core";
import { topics } from "@/config/topics";

export default config({
  // Giai đoạn hiện tại chỉ dùng local. Chuyển sang { kind: 'github', repo } là việc deploy (PR riêng).
  storage: { kind: "local" },
  ui: { brand: { name: "Blog sách" } },
  collections: {
    posts: collection({
      label: "Bài viết",
      path: "content/posts/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["category", "date", "draft"],
      schema: {
        // Bài hiện có khai báo `slug:` trong frontmatter (mục 5) mà Keystatic không cho khóa lạ → khai báo "bỏ qua".
        // Slug thật luôn là tên file (nhập ở ô Slug bên dưới).
        slug: fields.ignored(),
        title: fields.slug({
          name: { label: "Tiêu đề", validation: { isRequired: true } },
          slug: { label: "Slug (tên file, chữ thường không dấu nối bằng '-')" },
        }),
        description: fields.text({
          label: "Mô tả (≤ 160 ký tự, dùng cho meta description + Open Graph)",
          multiline: true,
          validation: { isRequired: true, length: { max: 160 } },
        }),
        category: fields.select({
          label: "Chủ đề",
          options: topics.map((t) => ({ label: t.name, value: t.slug })),
          defaultValue: topics[0].slug,
        }),
        date: fields.date({
          label: "Ngày đăng",
          validation: { isRequired: true },
          defaultValue: { kind: "today" },
        }),
        source: fields.object(
          {
            book: fields.text({ label: "Tên sách", validation: { isRequired: true } }),
            author: fields.text({ label: "Tác giả", validation: { isRequired: true } }),
          },
          { label: "Nguồn sách" },
        ),
        cover: fields.text({
          label: "Ảnh bìa (đường dẫn, ví dụ /images/posts/<slug>/cover.jpg)",
        }),
        draft: fields.checkbox({
          label: "Bản nháp (ẩn khỏi trang và sitemap)",
          defaultValue: false,
        }),
        content: fields.markdoc({
          label: "Nội dung",
          extension: "md",
          options: {
            heading: [2, 3],
            image: { directory: "public/images/posts", publicPath: "/images/posts/" },
          },
        }),
      },
    }),
  },
});
