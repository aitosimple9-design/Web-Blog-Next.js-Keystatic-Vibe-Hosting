// Cấu hình Keystatic — PHẢI khớp CLAUDE.md mục 5 (cấu trúc bài viết dùng chung với dự án B).
// Bài lưu ở content/posts/<slug>.md (đuôi .md thuần, không .mdoc).
// `slug` lấy từ TÊN FILE (Keystatic không ghi trường slug vào frontmatter); src/lib/posts.ts chấp nhận cả hai.
import { collection, config, fields, singleton } from "@keystatic/core";
import { POST_FIELD_LABELS } from "@/lib/seo-fields";
import { PAGE_BLOCKS, type BlocksPageKey } from "@/config/blocks";

// Ô chữ ngắn: nhãn + giới hạn ký tự (+ nhiều dòng nếu cần). Dùng cho các singleton chữ ở nhóm "Trang".
const t = (label: string, max: number, multiline = false) =>
  fields.text({ label, multiline, validation: { length: { max } } });

// Ô "Các khối" của một trang, MỖI KHỐI MỘT DÒNG: trang cho đổi thứ tự thì là ô số (1, 2, 3... = vị trí hiện, 0 = ẩn); trang chỉ bật / tắt thì là ô tích.
// Danh mục khối ở src/config/blocks.ts; đọc bởi getPageBlocks() (src/lib/pages.ts). Dùng ô số thay cho kéo thả vì mảng của Keystatic không có giá trị mặc định.
const blocksField = (page: BlocksPageKey) => {
  const { reorder, blocks } = PAGE_BLOCKS[page];
  return fields.object(
    Object.fromEntries(
      blocks.map((b, i) => [
        b.id,
        reorder
          ? fields.integer({ label: b.label, defaultValue: i + 1, validation: { min: 0, max: 99 } })
          : fields.checkbox({ label: b.label, defaultValue: true }),
      ]),
    ) as never,
    { label: reorder ? "Các khối của trang: ghi số vị trí (số nhỏ hiện trước, Hero luôn đứng đầu), 0 = ẩn khối, để trống = giữ vị trí mặc định (số mờ trong ô)" : "Các khối của trang: tích = hiện khối" },
  );
};

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
    navigation: { "Nội dung": ["posts", "topics", "books"], "Trang": ["homePage", "bookPage", "blogPage", "articlePage", "notFoundPage"], "Cài đặt": ["siteSettings", "headerSettings", "footerSettings", "newsletterSettings"] },
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
        tagline: fields.text({
          label: "Khẩu hiệu (hiện ở chân trang và sau tên site ở tiêu đề tab)",
          validation: { length: { max: 80 } },
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
        copyrightYear: fields.integer({
          label: "Năm bản quyền (để trống = năm hiện tại)",
          validation: { min: 2000, max: 2100 },
        }),
        socials: fields.array(
          fields.object({
            platform: fields.select({
              label: "Nền tảng",
              options: [
                { label: "YouTube", value: "youtube" },
                { label: "TikTok", value: "tiktok" },
                { label: "Facebook", value: "facebook" },
                { label: "Instagram", value: "instagram" },
                { label: "LinkedIn", value: "linkedin" },
                { label: "X", value: "x" },
                { label: "Zalo", value: "zalo" },
              ],
              defaultValue: "facebook",
            }),
            url: fields.url({ label: "Địa chỉ (URL)", validation: { isRequired: true } }),
          }),
          {
            label: "Liên kết mạng xã hội (để trống = dùng danh sách mặc định)",
            itemLabel: (p) => p.fields.platform.value,
          },
        ),
        legalLinks: fields.array(
          fields.object({
            label: fields.text({ label: "Tên trang (ví dụ: Điều khoản)", validation: { isRequired: true } }),
            href: fields.text({
              label: "Địa chỉ (đường dẫn như /dieu-khoan hoặc https://…; để trống = chỉ hiện chữ)",
            }),
          }),
          {
            label: "Trang pháp lý ở chân trang (để trống = dùng mặc định)",
            itemLabel: (p) => p.fields.label.value,
          },
        ),
        postsPerPage: fields.integer({
          label: "Số bài mỗi trang ở trang Blog (3 đến 12; để trống = 6)",
          validation: { min: 3, max: 12 },
        }),
      },
    }),
    // Header: logo, menu, bật / tắt ô tìm kiếm và nút đổi theme (đọc bởi getHeaderSettings ở src/lib/settings.ts). Mục con của "Blog" tự lấy từ Chủ đề.
    headerSettings: singleton({
      label: "Header",
      path: "content/settings/header",
      format: "json",
      schema: {
        logoImage: fields.image({
          label: "Ảnh logo (để trống = dùng logo chữ là Tên site)",
          description: "Hiển thị cao bằng chữ logo. Nên dùng ảnh PNG / SVG nền trong suốt.",
          directory: "public/images/site",
          publicPath: "/images/site/",
        }),
        logoAlt: fields.text({
          label: "Mô tả ảnh logo (đọc cho người dùng trình đọc màn hình)",
          validation: { length: { max: 80 } },
        }),
        menu: fields.array(
          fields.object({
            label: fields.text({ label: "Tên mục", validation: { isRequired: true, length: { max: 24 } } }),
            href: fields.text({
              label: "Địa chỉ (đường dẫn như /book hoặc https://…)",
              validation: { isRequired: true },
            }),
            icon: fields.select({
              label: "Icon (hiện ở menu điện thoại)",
              options: [
                { label: "Trang chủ", value: "home" },
                { label: "Sách", value: "book" },
                { label: "Blog", value: "blog" },
              ],
              defaultValue: "home",
            }),
            newGroup: fields.checkbox({
              label: "Bắt đầu nhóm mới ở menu điện thoại (kẻ ngang phía trên mục này)",
              defaultValue: false,
            }),
          }),
          {
            label: "Menu (tối đa 6 mục; để trống = dùng menu mặc định: Trang chủ · Book · Blog)",
            description: "Mục /blog đầu tiên tự có danh sách Chủ đề làm mục con.",
            itemLabel: (p) => p.fields.label.value,
            validation: { length: { max: 6 } },
          },
        ),
        showSearch: fields.checkbox({ label: "Hiện ô tìm kiếm", defaultValue: true }),
        showThemeToggle: fields.checkbox({ label: "Hiện nút đổi giao diện Giấy / Đêm", defaultValue: true }),
      },
    }),
    // Footer: liên kết, dòng bản quyền, bật / tắt mạng xã hội (đọc bởi getFooterSettings).
    footerSettings: singleton({
      label: "Footer",
      path: "content/settings/footer",
      format: "json",
      schema: {
        links: fields.array(
          fields.object({
            label: fields.text({ label: "Tên liên kết", validation: { isRequired: true, length: { max: 24 } } }),
            href: fields.text({
              label: "Địa chỉ (đường dẫn như /blog hoặc https://…)",
              validation: { isRequired: true },
            }),
          }),
          {
            label: "Liên kết ở chân trang (tối đa 8; để trống = dùng các mục menu của Header)",
            itemLabel: (p) => p.fields.label.value,
            validation: { length: { max: 8 } },
          },
        ),
        copyright: fields.text({
          label: "Dòng bản quyền (để trống = © năm, tên site, khẩu hiệu lấy ở Cài đặt site)",
          validation: { length: { max: 160 } },
        }),
        showSocials: fields.checkbox({ label: "Hiện hàng icon mạng xã hội", defaultValue: true }),
      },
    }),
    // Newsletter: chữ của form đăng ký ở cả 4 trang (đọc bởi getNewsletterSettings). Nơi gửi dữ liệu chờ Q11, không cấu hình ở đây.
    newsletterSettings: singleton({
      label: "Newsletter",
      path: "content/settings/newsletter",
      format: "json",
      schema: {
        eyebrow: fields.text({ label: "Dòng nhỏ phía trên tiêu đề (mặc định: Bản tin)", validation: { length: { max: 30 } } }),
        title: fields.text({
          label: "Tiêu đề (mặc định: Nhận bài mới qua email)",
          validation: { length: { max: 80 } },
        }),
        description: fields.text({
          label: "Mô tả ngắn",
          multiline: true,
          validation: { length: { max: 200 } },
        }),
        perks: fields.array(fields.text({ label: "Lợi ích", validation: { isRequired: true, length: { max: 60 } } }), {
          label: "Các gạch đầu dòng lợi ích (tối đa 5; để trống = dùng mặc định)",
          itemLabel: (p) => p.value,
          validation: { length: { max: 5 } },
        }),
        submitLabel: fields.text({
          label: "Chữ trên nút gửi (mặc định: Đăng ký)",
          validation: { length: { max: 20 } },
        }),
        form: fields.object(
          {
            formTitle: fields.text({ label: "Tiêu đề khung form (mặc định: Đăng ký nhận bài)", validation: { length: { max: 60 } } }),
            nameLabel: fields.text({ label: "Nhãn ô Họ tên (mặc định: Họ tên)", validation: { length: { max: 30 } } }),
            namePlaceholder: fields.text({ label: "Gợi ý trong ô Họ tên (mặc định: Nguyễn Văn A)", validation: { length: { max: 40 } } }),
            phoneLabel: fields.text({ label: "Nhãn ô Số điện thoại (mặc định: Số điện thoại)", validation: { length: { max: 30 } } }),
            phonePlaceholder: fields.text({ label: "Gợi ý trong ô Số điện thoại (mặc định: 09xx xxx xxx)", validation: { length: { max: 40 } } }),
            optionalTag: fields.text({ label: "Chữ đánh dấu ô không bắt buộc (mặc định: Tùy chọn)", validation: { length: { max: 20 } } }),
            emailLabel: fields.text({ label: "Nhãn ô Email (mặc định: Email)", validation: { length: { max: 30 } } }),
            emailPlaceholder: fields.text({ label: "Gợi ý trong ô Email (mặc định: ban@example.com)", validation: { length: { max: 40 } } }),
            sendingLabel: fields.text({ label: "Chữ trên nút khi đang gửi (mặc định: Đang gửi…)", validation: { length: { max: 30 } } }),
            note: fields.text({ label: "Ghi chú dưới nút (mặc định: Chỉ gửi bài mới, không quảng cáo.)", validation: { length: { max: 100 } } }),
            successTitle: fields.text({ label: "Tiêu đề sau khi đăng ký xong (mặc định: Đã nhận đăng ký)", validation: { length: { max: 60 } } }),
            successMessage: fields.text({
              label: "Lời cảm ơn sau khi đăng ký (dùng {name} và {email} để điền tên và email người đăng ký)",
              multiline: true,
              validation: { length: { max: 200 } },
            }),
            resetLabel: fields.text({ label: "Nút đăng ký email khác (mặc định: Đăng ký email khác)", validation: { length: { max: 40 } } }),
            errorNameRequired: fields.text({ label: "Lỗi: chưa nhập Họ tên", validation: { length: { max: 160 } } }),
            errorEmailRequired: fields.text({ label: "Lỗi: chưa nhập Email", validation: { length: { max: 160 } } }),
            errorEmailInvalid: fields.text({ label: "Lỗi: Email sai định dạng", validation: { length: { max: 160 } } }),
            errorPhoneInvalid: fields.text({ label: "Lỗi: Số điện thoại sai", validation: { length: { max: 160 } } }),
          },
          { label: "Nhãn và thông báo của form (để trống ô nào thì dùng chữ mặc định)" },
        ),
      },
    }),
    // Trang chủ (/): toàn bộ chữ và ảnh của trang (đọc bởi getHomePage ở src/lib/pages.ts). Ô để trống thì dùng nội dung mẫu mặc định (src/config/profile.ts).
    homePage: singleton({
      label: "Trang chủ",
      path: "content/pages/trang-chu",
      format: "json",
      schema: {
        blocks: blocksField("homePage"),
        name: fields.text({
          label: "Tên hiển thị (chữ khổng lồ ở đầu trang; cũng là tên trong thẻ chia sẻ)",
          validation: { length: { max: 60 } },
        }),
        positioning: fields.text({
          label: "Câu định vị dưới tên (cũng là mô tả khi chia sẻ, ≤ 160 ký tự)",
          multiline: true,
          validation: { length: { max: 160 } },
        }),
        ogImage: fields.image({
          label: "Ảnh chia sẻ riêng của trang này (Open Graph, nên 1200x630; để trống = dùng ảnh mặc định ở Cài đặt site)",
          directory: "public/images/profile",
          publicPath: "/images/profile/",
        }),
        greeting: fields.text({ label: "Lời chào phía trên tên (mặc định: Xin chào, mình là)", validation: { length: { max: 40 } } }),
        ctaLabel: fields.text({ label: "Chữ nút chính ở đầu trang (mặc định: Đăng ký nhận bài)", validation: { length: { max: 30 } } }),
        followLabel: fields.text({ label: "Chữ phía trên hàng icon mạng xã hội (mặc định: Theo dõi mình)", validation: { length: { max: 30 } } }),
        portrait: fields.image({
          label: "Ảnh chân dung (đã xóa phông: PNG / WebP nền trong suốt, người ngồi quay thẳng, tỉ lệ khoảng 0,97)",
          directory: "public/images/profile",
          publicPath: "/images/profile/",
        }),
        portraitAlt: fields.text({
          label: "Mô tả ảnh chân dung (đọc cho người dùng trình đọc màn hình)",
          validation: { length: { max: 125 } },
        }),
        statLabels: fields.object(
          {
            posts: fields.text({ label: "Nhãn số bài viết (mặc định: Bài viết)", validation: { length: { max: 20 } } }),
            books: fields.text({ label: "Nhãn số cuốn sách (mặc định: Cuốn sách)", validation: { length: { max: 20 } } }),
            topics: fields.text({ label: "Nhãn số chủ đề (mặc định: Chủ đề)", validation: { length: { max: 20 } } }),
          },
          { label: "Nhãn các con số (số liệu tự đếm từ bài, sách, chủ đề thật)" },
        ),
        story: fields.object(
          {
            eyebrow: fields.text({ label: "Dòng nhỏ phía trên tiêu đề (mặc định: Câu chuyện)", validation: { length: { max: 30 } } }),
            title: fields.text({ label: "Tiêu đề khối Câu chuyện", validation: { length: { max: 80 } } }),
            paragraphs: fields.array(
              fields.text({ label: "Đoạn văn", multiline: true, validation: { isRequired: true, length: { max: 600 } } }),
              {
                label: "Các đoạn văn (tối đa 8; để trống = dùng đoạn mẫu)",
                itemLabel: (p) => p.value.slice(0, 40),
                validation: { length: { max: 8 } },
              },
            ),
          },
          { label: "Khối Câu chuyện" },
        ),
        storyImage: fields.image({
          label: "Ảnh khối Câu chuyện",
          directory: "public/images/profile",
          publicPath: "/images/profile/",
        }),
        storyImageAlt: fields.text({
          label: "Mô tả ảnh Câu chuyện (đọc cho người dùng trình đọc màn hình)",
          validation: { length: { max: 125 } },
        }),
        storyImagePosition: fields.select({
          label: "Phần ảnh Câu chuyện được giữ lại khi khung cắt bớt",
          options: [
            { label: "Giữa", value: "50% 50%" },
            { label: "Phía trên", value: "50% 20%" },
            { label: "Phía dưới", value: "50% 80%" },
            { label: "Bên trái", value: "20% 50%" },
            { label: "Bên phải", value: "80% 50%" },
          ],
          defaultValue: "50% 50%",
        }),
        principles: fields.object(
          {
            title: fields.text({ label: "Tiêu đề khối (mặc định: Cách mình đọc)", validation: { length: { max: 60 } } }),
            dek: fields.text({ label: "Mô tả dưới tiêu đề", validation: { length: { max: 160 } } }),
            items: fields.array(
              fields.object({
                title: fields.text({ label: "Tên nguyên tắc", validation: { isRequired: true, length: { max: 40 } } }),
                text: fields.text({ label: "Mô tả", multiline: true, validation: { isRequired: true, length: { max: 240 } } }),
              }),
              {
                label: "Các nguyên tắc (tối đa 4; để trống = dùng mẫu)",
                itemLabel: (p) => p.fields.title.value,
                validation: { length: { max: 4 } },
              },
            ),
          },
          { label: "Khối Cách mình đọc" },
        ),
        shelf: fields.object(
          {
            title: fields.text({ label: "Tiêu đề khối (mặc định: Tủ sách của mình)", validation: { length: { max: 60 } } }),
            dek: fields.text({ label: "Mô tả dưới tiêu đề", validation: { length: { max: 200 } } }),
            books: fields.array(
              fields.object({
                book: fields.relationship({
                  label: "Sách (chọn từ mục Sách)",
                  collection: "books",
                  validation: { isRequired: true },
                }),
                topic: fields.relationship({
                  label: "Chủ đề mở ra khi bấm vào bìa (chọn từ mục Chủ đề)",
                  collection: "topics",
                }),
              }),
              {
                label: "Các cuốn trong tủ sách (tối đa 12; để TRỐNG = ẨN khối Tủ sách; xóa một sách ở mục Sách thì cuốn đó tự gỡ khỏi đây)",
                itemLabel: (p) => p.fields.book.value ?? "(chưa chọn sách)",
                validation: { length: { max: 12 } },
              },
            ),
          },
          { label: "Khối Tủ sách" },
        ),
        featured: fields.object(
          {
            title: fields.text({ label: "Tiêu đề khối (mặc định: Bài tiêu biểu)", validation: { length: { max: 60 } } }),
            linkLabel: fields.text({ label: "Chữ liên kết (mặc định: Xem tất cả bài viết)", validation: { length: { max: 40 } } }),
          },
          { label: "Khối Bài tiêu biểu (3 bài mới nhất tự lấy từ mục Bài viết)" },
        ),
        connect: fields.object(
          {
            eyebrow: fields.text({ label: "Dòng nhỏ (mặc định: Kết nối)", validation: { length: { max: 30 } } }),
            title: fields.text({ label: "Tiêu đề (mặc định: Kết nối với mình)", validation: { length: { max: 60 } } }),
            text: fields.text({
              label: "Đoạn mô tả (chú ý: đoạn mặc định có cam kết \"mỗi tuần\", hãy sửa cho đúng thực tế)",
              multiline: true,
              validation: { length: { max: 240 } },
            }),
          },
          { label: "Khối Kết nối (hàng icon mạng xã hội lấy ở Cài đặt site)" },
        ),
      },
    }),
    // Trang Book (/book): chữ Hero, dải chữ chạy, tiêu đề các khối (đọc bởi getBookPage ở src/lib/pages.ts). Ô để trống thì dùng chữ mặc định.
    bookPage: singleton({
      label: "Trang Book",
      path: "content/pages/book",
      format: "json",
      schema: {
        blocks: blocksField("bookPage"),
        title: t("Tiêu đề tab trình duyệt (hiện thành: <tiêu đề> — <tên site>; mặc định: Book)", 40),
        description: t("Mô tả trang khi chia sẻ (≤ 160 ký tự; để trống = dùng mô tả của Cài đặt site)", 160, true),
        ogImage: fields.image({
          label: "Ảnh chia sẻ riêng của trang này (Open Graph, nên 1200x630; để trống = dùng ảnh mặc định ở Cài đặt site)",
          directory: "public/images/profile",
          publicPath: "/images/profile/",
        }),
        hero: fields.object(
          {
            titleLine1: t("Tiêu đề lớn, dòng 1 (mặc định: Điều đọng lại)", 40),
            titleLine2: t("Tiêu đề lớn, dòng 2 (mặc định: sau mỗi cuốn sách)", 40),
            dek: t("Dòng mô tả dưới tiêu đề", 160, true),
            ctaLabel: t("Chữ nút chính (mặc định: Đọc bài mới nhất)", 30),
            followLabel: t("Chữ phía trên hàng icon mạng xã hội (mặc định: Theo dõi)", 30),
            featuredEyebrow: t("Nhãn thẻ bài nổi bật (mặc định: Bài nổi bật)", 30),
            featuredFallback: t("Chữ thẻ khi chưa có bài nào (mặc định: Xem tất cả bài viết)", 50),
            statPosts: t("Nhãn số bài viết (mặc định: Bài viết)", 20),
            statTopics: t("Nhãn số chủ đề (mặc định: Chủ đề)", 20),
            statBooks: t("Nhãn số cuốn sách (mặc định: Cuốn sách)", 20),
            backdropWord: t("Chữ khổng lồ nét viền làm họa tiết nền Hero (nên ngắn, ≤ 6 ký tự; mặc định: Đọc)", 6),
          },
          { label: "Hero đầu trang" },
        ),
        marquee: fields.array(fields.text({ label: "Từ", validation: { isRequired: true, length: { max: 24 } } }), {
          label: "Dải chữ chạy dưới Hero (tối đa 8 từ; để trống = dùng 5 từ mặc định)",
          itemLabel: (p) => p.value,
          validation: { length: { max: 8 } },
        }),
        topics: fields.object(
          {
            title: t("Tiêu đề khối (mặc định: Chủ đề)", 60),
            dek: t("Mô tả dưới tiêu đề", 200, true),
          },
          { label: "Khối Chủ đề (danh sách chủ đề tự lấy từ mục Chủ đề)" },
        ),
        latest: fields.object(
          {
            title: t("Tiêu đề khối (mặc định: Bài viết mới nhất)", 60),
            dek: t("Mô tả dưới tiêu đề", 200, true),
            totalLabel: t("Nhãn dưới tổng số bài (mặc định: Bài viết đã đăng)", 40),
            allLabel: t("Chữ nút xem tất cả (mặc định: Xem tất cả)", 30),
          },
          { label: "Khối Bài viết mới nhất (bài tự lấy từ mục Bài viết)" },
        ),
      },
    }),
    // Trang Blog (/blog và từng chủ đề): chữ giới thiệu, nhãn Hero chủ đề, tiêu đề danh sách (đọc bởi getBlogPage).
    blogPage: singleton({
      label: "Trang Blog",
      path: "content/pages/blog",
      format: "json",
      schema: {
        blocks: blocksField("blogPage"),
        ogImage: fields.image({
          label: "Ảnh chia sẻ riêng của trang này (Open Graph, nên 1200x630; để trống = dùng ảnh mặc định ở Cài đặt site)",
          directory: "public/images/profile",
          publicPath: "/images/profile/",
        }),
        heading: t("Tiêu đề trang cho trình đọc màn hình và công cụ tìm kiếm (không hiện ra mắt nhìn; mặc định: Blog)", 40),
        intro: t("Đoạn giới thiệu cho trình đọc màn hình và công cụ tìm kiếm (không hiện ra mắt nhìn)", 240, true),
        hero: fields.object(
          {
            eyebrow: t("Nhãn nhỏ phía trên tên chủ đề (mặc định: Chủ đề)", 30),
            ctaLabel: t("Chữ nút chính (mặc định: Đọc bài mới nhất)", 30),
            statPosts: t("Nhãn số bài viết (mặc định: Bài viết)", 20),
            statBooks: t("Nhãn số cuốn sách (mặc định: Cuốn sách)", 20),
            statMinutes: t("Nhãn số phút đọc trung bình (mặc định: Phút đọc TB)", 24),
          },
          { label: "Hero của chủ đề" },
        ),
        titleSuffix: t("Hậu tố tiêu đề tab của trang chủ đề: <tên chủ đề> — <hậu tố> (mặc định: Blog)", 30),
        pageLabel: t("Nhãn tiêu đề tab khi sang trang 2, 3... (dùng {page} cho số trang; mặc định: trang {page})", 30),
        breadcrumb: fields.object(
          {
            home: t("Nhãn mục đầu (mặc định: Trang chủ)", 30),
            blog: t("Nhãn mục Blog (mặc định: Blog)", 30),
          },
          { label: "Đường dẫn (breadcrumb) ở trang Blog và trang bài" },
        ),
        listTitle: t("Tiêu đề danh sách bài (dùng {topic} để điền tên chủ đề; mặc định: Bài viết trong {topic})", 80),
        emptyText: t("Chữ khi chủ đề chưa có bài viết nào", 160, true),
      },
    }),
    // Trang bài viết (/bai-viet/<slug>): nhãn các khối quanh bài (đọc bởi getArticlePage).
    articlePage: singleton({
      label: "Trang bài viết",
      path: "content/pages/bai-viet",
      format: "json",
      schema: {
        blocks: blocksField("articlePage"),
        sourceLabel: t("Nhãn khối nguồn sách (mặc định: Bài viết dựa trên)", 40),
        relatedTitle: t("Tiêu đề khối bài liên quan (mặc định: Bài liên quan.)", 40),
        relatedDek: t("Dòng phụ cạnh tiêu đề bài liên quan (mặc định: Đọc tiếp những bài cùng chủ đề.)", 80),
        tocLabel: t("Nhãn mục lục (mặc định: Mục lục)", 24),
      },
    }),
    // Trang 404 (đường dẫn không tồn tại): toàn bộ chữ (đọc bởi getNotFoundPage).
    notFoundPage: singleton({
      label: "Trang 404",
      path: "content/pages/404",
      format: "json",
      schema: {
        tabTitle: t("Tiêu đề tab trình duyệt (hiện thành: <tiêu đề> | <tên site>; mặc định: Không tìm thấy trang)", 60),
        eyebrow: t("Dòng nhỏ (mặc định: Lỗi 404)", 30),
        title: t("Tiêu đề (mặc định: Không tìm thấy trang này)", 60),
        text: t("Đoạn mô tả", 240, true),
        homeLabel: t("Chữ nút về Trang chủ (mặc định: Về Trang chủ)", 30),
        blogLabel: t("Chữ nút xem Blog (mặc định: Xem Blog)", 30),
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
      columns: ["title", "source", "category", "date", "status", "draft", "focusKeyword", "cover"] as never, // xem ghi chú về cột ở collection topics
      schema: {
        // Bài hiện có khai báo `slug:` trong frontmatter (mục 5) mà Keystatic không cho khóa lạ → khai báo "bỏ qua".
        // Slug thật luôn là tên file (nhập ở ô Slug bên dưới).
        slug: fields.ignored(),
        title: fields.slug({
          name: { label: POST_FIELD_LABELS.title, validation: { isRequired: true } },
          slug: { label: POST_FIELD_LABELS.slug },
        }),
        description: fields.text({
          label: POST_FIELD_LABELS.description,
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
          label: POST_FIELD_LABELS.cover,
          description: "Tải ảnh lên; đường dẫn trong bài tự điền",
          directory: "public/images/posts",
          publicPath: "/images/posts/",
        }),
        coverAlt: fields.text({
          label: POST_FIELD_LABELS.coverAlt,
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
          label: POST_FIELD_LABELS.tags,
          itemLabel: (p) => p.value,
        }),
        focusKeyword: fields.text({
          label: POST_FIELD_LABELS.focusKeyword,
          validation: { length: { max: 60 } },
        }),
        seoTitle: fields.text({
          label: POST_FIELD_LABELS.seoTitle,
          validation: { length: { max: 60 } },
        }),
        ogImage: fields.image({
          label: POST_FIELD_LABELS.ogImage,
          directory: "public/images/posts",
          publicPath: "/images/posts/",
        }),
        related: fields.multiRelationship({
          label: POST_FIELD_LABELS.related,
          collection: "posts",
        }),
        notes: fields.text({
          label: "Ghi chú nội bộ (KHÔNG hiện trên website)",
          multiline: true,
        }),
        content: fields.markdoc({
          label: POST_FIELD_LABELS.content,
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
