// Cấu hình Keystatic — PHẢI khớp CLAUDE.md mục 5 (cấu trúc bài viết dùng chung với dự án B).
// Bài lưu ở content/posts/<slug>.md (đuôi .md thuần, không .mdoc).
// `slug` lấy từ TÊN FILE (Keystatic không ghi trường slug vào frontmatter); src/lib/posts.ts chấp nhận cả hai.
import { collection, config, fields, singleton } from "@keystatic/core";

export default config({
  // Chọn chế độ lưu bằng NEXT_PUBLIC_KEYSTATIC_STORAGE ("github" | "local", mặc định local).
  // Phải có tiền tố NEXT_PUBLIC_ vì trang /keystatic chạy ở trình duyệt, cần cùng giá trị với server.
  storage:
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
      ? { kind: "github", repo: "aitosimple9-design/Web-Blog-Next.js-Keystatic-Vibe-Hosting" }
      : { kind: "local" },
  ui: { brand: { name: "Blog sách" } },
  collections: {
    posts: collection({
      label: "Bài viết",
      path: "content/posts/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "source", "category", "date", "status", "draft", "cover"] as never, // xem ghi chú về cột ở collection topics
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
        // Giá trị lưu là slug chủ đề (tên file trong content/topics), vẫn là `category: chu-de-1` như mục 5.
        category: fields.relationship({
          label: "Chủ đề",
          collection: "topics",
          validation: { isRequired: true },
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
    topics: collection({
      label: "Chủ đề",
      path: "content/topics/*",
      slugField: "name",
      format: "json",
      // Cột danh sách. Kiểu của Keystatic chỉ cho trường chữ / số / ngày; trường ảnh (đối tượng) ép vào được nhưng chỉ hiện ĐƯỜNG DẪN chữ,
      // nên src/app/keystatic/KeystaticThumbnails.tsx đổi đường dẫn ảnh trong ô thành ảnh thu nhỏ ở trình duyệt. Khối lồng (như `source.book`)
      // không làm cột được. Nhãn ô cũng là tiêu đề cột nên giữ NGẮN, chú thích để ở `description`.
      columns: ["name", "order", "description", "image"] as never,
      schema: {
        name: fields.slug({
          name: { label: "Tên chủ đề", validation: { isRequired: true } },
          slug: { label: "Slug (tên file, khớp với ô Chủ đề của bài và địa chỉ /blog/<slug>)" },
        }),
        order: fields.integer({ label: "Thứ tự", description: "Hiển thị: số nhỏ hiện trước", defaultValue: 1 }),
        description: fields.text({
          label: "Mô tả ngắn",
          multiline: true,
          validation: { isRequired: true, length: { max: 200 } },
        }),
        image: fields.image({
          label: "Ảnh nền",
          description: "Hiện ở thẻ chủ đề (Trang Book) và đầu trang Blog",
          directory: "public/images/topics",
          publicPath: "/images/topics/",
        }),
      },
    }),
    books: collection({
      label: "Sách",
      path: "content/books/*",
      slugField: "name",
      format: "json",
      columns: ["name", "cover"] as never,
      schema: {
        name: fields.slug({
          name: {
            label: "Tên sách",
            description: "Phải giống hệt ô Tên sách trong bài viết",
            validation: { isRequired: true },
          },
          slug: { label: "Slug (tên file)" },
        }),
        cover: fields.image({
          label: "Ảnh sách",
          description: "Bìa sách, hiện ở các bài dùng cuốn này",
          directory: "public/images/covers",
          publicPath: "/images/covers/",
        }),
      },
    }),
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
