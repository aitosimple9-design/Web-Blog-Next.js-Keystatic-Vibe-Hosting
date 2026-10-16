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
  ui: {
    brand: { name: "Blog sách" },
    // Menu trái chia nhóm
    navigation: { "Nội dung": ["posts", "topics", "books"], "Cài đặt": ["siteSettings"] },
  },
  singletons: {
    // Cài đặt site: giá trị dự phòng cho metadata toàn site (đọc bởi src/lib/settings.ts). Mọi ô đều tùy chọn.
    siteSettings: singleton({
      label: "Cài đặt site",
      path: "content/settings/site",
      format: "json",
      schema: {
        siteName: fields.text({
          label: "Tên site (hiện ở tiêu đề tab trình duyệt và khi chia sẻ link)",
          validation: { length: { max: 60 } },
        }),
        description: fields.text({
          label: "Mô tả mặc định (≤ 160 ký tự, dùng khi trang không có mô tả riêng)",
          multiline: true,
          validation: { length: { max: 160 } },
        }),
        ogImage: fields.image({
          label: "Ảnh chia sẻ mặc định (Open Graph, nên 1200x630)",
          directory: "public/images/site",
          publicPath: "/images/site/",
        }),
        socials: fields.array(
          fields.object({
            name: fields.text({ label: "Tên mạng xã hội", validation: { isRequired: true } }),
            url: fields.url({ label: "Địa chỉ (URL)", validation: { isRequired: true } }),
          }),
          { label: "Liên kết mạng xã hội", itemLabel: (p) => p.fields.name.value },
        ),
      },
    }),
  },
  collections: {
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
    posts: collection({
      label: "Bài viết",
      path: "content/posts/*",
      slugField: "title",
      // Nút "Xem trước" trong form bài: mở bản ĐÃ LƯU với giao diện thật, cả bài nháp / lên lịch (chỉ chạy trên máy soạn bài, xem src/lib/preview.ts)
      previewUrl: "/xem-truoc/bai-viet/{slug}",
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
        updated: fields.date({
          label: "Ngày sửa gần nhất (tùy chọn; hiện cho Google ở dateModified, bỏ trống thì dùng Ngày đăng)",
        }),
        source: fields.object(
          {
            book: fields.text({ label: "Tên sách", validation: { isRequired: true } }),
            author: fields.text({ label: "Tác giả", validation: { isRequired: true } }),
          },
          { label: "Nguồn sách" },
        ),
        // Ô tải ảnh: file lưu ở public/images/posts/<slug>/<tên file>, và `cover` trong bài tự ghi đúng đường dẫn đó
        // (/images/posts/<slug>/<tên file>, khớp mục 5).
        cover: fields.image({
          label: "Ảnh bìa",
          description: "Tải ảnh lên; đường dẫn trong bài tự điền",
          directory: "public/images/posts",
          publicPath: "/images/posts/",
        }),
        coverAlt: fields.text({
          label: "Mô tả ảnh bìa (alt)",
          description: "Một câu ngắn nói ảnh có gì; Google Hình ảnh và trình đọc màn hình dùng nó. Bỏ trống thì ảnh được coi là trang trí",
          validation: { length: { max: 125 } },
        }),
        status: fields.select({
          label: "Trạng thái",
          description:
            "Nháp và Chờ duyệt: ẩn khỏi website. Đã đăng: hiện, trừ khi tick Ẩn bài này. Bài có ngày đăng ở tương lai là bài lên lịch.",
          options: [
            { label: "Nháp", value: "draft" },
            { label: "Chờ duyệt", value: "review" },
            { label: "Đã đăng", value: "published" },
          ],
          defaultValue: "published",
        }),
        draft: fields.checkbox({
          label: "Ẩn bài này",
          description: "Tick để ẩn bài ngay khỏi website và sitemap, bất kể Trạng thái (ô `draft` trong bài, dùng chung với dự án B)",
          defaultValue: false,
        }),
        tags: fields.array(fields.text({ label: "Thẻ" }), {
          label: "Thẻ (từ khóa của bài)",
          itemLabel: (p) => p.value,
        }),
        focusKeyword: fields.text({
          label: "Từ khóa chính (cụm người đọc gõ để tìm bài, 2-4 từ; dùng cho điểm SEO, không hiện ra ngoài)",
          validation: { length: { max: 60 } },
        }),
        seoTitle: fields.text({
          label: "Tiêu đề SEO riêng (≤ 60 ký tự; bỏ trống thì dùng Tiêu đề bài)",
          validation: { length: { max: 60 } },
        }),
        ogImage: fields.image({
          label: "Ảnh chia sẻ riêng (Open Graph, nên 1200x630; bỏ trống thì dùng ảnh bìa)",
          directory: "public/images/posts",
          publicPath: "/images/posts/",
        }),
        related: fields.multiRelationship({
          label: "Bài liên quan (chọn tay; bỏ trống thì tự chọn theo chủ đề)",
          collection: "posts",
        }),
        notes: fields.text({
          label: "Ghi chú nội bộ (KHÔNG hiện trên website)",
          multiline: true,
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
