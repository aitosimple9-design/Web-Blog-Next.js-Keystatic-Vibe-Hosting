# Kế hoạch — LỘC_WEBSITE BLOG

File dùng chung cho 2 repo. Mỗi repo tự đánh dấu tiến độ của mình.
- `[A]` chỉ áp dụng cho `web_blog` (server + Keystatic)
- `[B]` chỉ áp dụng cho `web_blog_static` (xuất tĩnh + Sveltia)
- Không ghi gì = áp dụng cho cả hai

Claude cập nhật checkbox trong chính PR hoàn thành việc đó. Mỗi giai đoạn chỉ bắt đầu khi giai đoạn trước đã xong.

---

## Mục tiêu
Blog kiến thức nâng cao từ sách, làm trang đích cho traffic quảng cáo:
- Tải nhanh, SEO chuẩn, giữ chân người đọc ngay màn hình đầu
- Giao diện chuyên nghiệp, khác biệt so với các blog hiện có
- Dựng hoàn chỉnh trên máy trước; chỉ trả tiền tên miền + hosting khi deploy
- So sánh 2 phương án A và B, sau đó chọn 1 để vận hành chính thức

Phạm vi trang (4 trang; từ 2026-10-11 Trang chủ `/` là trang thương hiệu cá nhân, Trang chủ cũ thành `/book`), tất cả phải được thiết kế UI/UX tối ưu để thu hút người đọc:
1. **Trang chủ** (thương hiệu cá nhân) và **Trang Book** (trang chủ cũ)
2. **Trang Blog** (danh sách bài)
3. **Trang chi tiết nội dung** (bài viết) — có **form đăng ký**

Form đăng ký (`Newsletter`: Họ tên, Số điện thoại, Email) làm thành **component tái sử dụng** — một nơi định nghĩa, dùng ở cả 3 trang theo layout đã duyệt.

Layout từng trang (wireframe + spec) nằm ở `docs/layout/` (mỗi trang một thư mục con: `chi-tiet-bai/`, `blog/`, `trang-chu/`, `book/`). Thứ tự ưu tiên: Chi tiết bài → Blog → Trang chủ.

## Quyết định đang chờ (Claude KHÔNG tự chọn)
| # | Quyết định | Đề xuất | Cần trước giai đoạn |
|---|---|---|---|
| Q1 | Hệ điều hành máy làm việc (Windows / macOS) | **Windows** (chốt 2026-10-06) | 0 |
| Q2 | TypeScript hay JavaScript | **TypeScript** (chốt 2026-10-07) | 1 |
| Q3 | Tailwind hay CSS Modules | **Tailwind CSS, bản mới nhất** (chốt 2026-10-06; kiểm tra số phiên bản lúc cài) | 1 |
| Q4 | npm hay pnpm | **npm** (chốt 2026-10-07) | 1 |
| Q5 | Phiên bản Next.js (A: kiểm tra lỗi Keystatic GitHub mode trên Next.js 16) | **Next.js 16.4.0** (chốt 2026-10-07). Còn phải kiểm tra lỗi Keystatic GitHub mode trên Next 16 ở GĐ2/GĐ8; nếu lỗi thì hạ về 15.x | 1 |
| Q6 | Thư viện đọc frontmatter / render Markdown | **Dùng cả 2** (đọc frontmatter + render Markdown); tên thư viện cụ thể: hỏi trước khi cài ở GĐ2 (chốt 2026-10-06) | 2 |
| Q7 | Tên thật của 3 danh mục | **Làm demo trước**; danh mục nằm ở một chỗ cấu hình, sửa / thêm được khi cần (chốt 2026-10-06). Lưu ý: wireframe mẫu dùng 5 chủ đề, CLAUDE.md mục 5 còn ghi 3 → đồng bộ khi dựng (đổi cấu trúc bài ⇒ hỏi, đồng bộ sang dự án B) | 2 |
| Q8 | Font dự phòng hiển thị đủ dấu tiếng Việt | **Theo Design System** trong `docs/design-system/` (Blog Book Mono: Source Serif 4 + Be Vietnam Pro, subset `vietnamese`) (chốt 2026-10-06) | 3 |
| Q9 | Nhà cung cấp hosting [A] / thiết lập Cloudflare [B] | — | 8 |
| Q10 | Tên miền | — | 8 |
| Q11 | Form đăng ký (Họ tên + Số điện thoại + Email) gửi đi đâu, lưu ở đâu; trường nào bắt buộc; câu đồng ý dữ liệu cá nhân | Giả định tạm: Họ tên + Email bắt buộc, SĐT tùy chọn; CHƯA gửi đi đâu (hàm `submitSubscription` trong `Newsletter.tsx`) | 3 (giao diện) / 4 (kết nối) |
| Q12 | Ô tìm kiếm trên thanh đầu trang: làm chức năng ngay hay chỉ dựng giao diện (PLAN cũ xếp tìm kiếm vào sau ra mắt) | Đã làm tìm kiếm cơ bản phía trình duyệt (tiêu đề, mô tả, chủ đề, sách; không phân biệt dấu); nâng cấp sau | 3 |
| Q13 | Blog: URL từng chủ đề / từng trang; số bài mỗi trang cố định (đề xuất 6) hay đổi 2 / 4 / 6 theo màn hình; có tab "Tất cả" không | Giả định tạm: `/blog/<chu-de>`, `/blog/<chu-de>/trang/<n>`, bài `/bai-viet/<slug>`; 6 bài/trang cố định; `/blog` chuyển về chủ đề đầu; không có tab "Tất cả" | 4 |
| Q14 | Tên blog, logo, link 7 mạng xã hội, trang Điều khoản / Chính sách; 7 icon x 44px không vừa hàng ở 375px (xuống 2 hàng hay cuộn) | Giả định tạm: tên "Logo", icon chưa có link (hiển thị mờ), xuống 2 hàng ở màn hẹp. Sửa ở `src/config/site.ts` | 3 |

Khi mình chốt một mục: ghi kết quả vào cột "Đề xuất" kèm ngày, và cập nhật mục "Stack" trong CLAUDE.md.

---

## Giai đoạn 0 — Nền móng repo
- [x] Trả lời Q1 (Windows)
- [x] Chép layout 3 trang vào `docs/layout/` (wireframe + spec, mỗi trang một thư mục)
- [x] Chép Design System "Blog Book Mono" vào `docs/design-system/` (`README.md`, `DESIGN-SYSTEM.md`, `tokens.json`)
- [x] Thêm `docs/WORKFLOW.md`, `docs/PLAN.md`, `docs/claude-log.md` (rỗng)
- [x] Thêm `.claude/settings.json` (luật chặn quyền + hook)
- [x] Thêm `.github/ISSUE_TEMPLATE/task.md` và `.github/pull_request_template.md`
- [ ] Tạo nhãn theo Phụ lục C của WORKFLOW.md
- [ ] (Mình làm) Bật Ruleset bảo vệ `main` nếu tài khoản hỗ trợ
- [x] Kiểm tra `/mcp`: GitHub và Playwright đều `connected`
- [ ] [B] Tạo repo `web_blog_static` và thêm vào GitHub token

**Xong khi:** `/memory` hiển thị CLAUDE.md, `/mcp` kết nối đủ, có Issue mẫu đầu tiên.

## Giai đoạn 1 — Khởi tạo Next.js
- [x] Chốt Q2 → Q5
- [x] Tạo project bằng `create-next-app` trong repo hiện tại (không tạo thư mục con)
- [ ] Cấu trúc thư mục đúng mục 3 CLAUDE.md
- [ ] [B] `output: 'export'`, `images: { unoptimized: true }`
- [x] `npm run dev`, `npm run lint`, `npm run build` đều chạy được
- [x] `.gitignore` có `.env*`, `node_modules`, `.next`, `out`

**Xong khi:** trang mặc định chạy, build không lỗi, PR đã merge.

## Giai đoạn 2 — Lớp nội dung
- [ ] Chốt Q6, Q7
- [ ] `src/lib/posts.ts`: lấy danh sách bài, lấy 1 bài theo slug, lọc theo danh mục, bỏ bài `draft: true`
- [ ] Kiểm tra dữ liệu: thiếu trường bắt buộc → build báo lỗi rõ ràng (không im lặng bỏ qua)
- [ ] 3 bài mẫu, mỗi danh mục 1 bài, dùng chung cho A và B
- [ ] [A] `keystatic.config.ts` khớp mục 5 CLAUDE.md, lưu đuôi `.md`, chế độ local
- [ ] [B] `public/admin/index.html` + `config.yml` khớp mục 5 CLAUDE.md
- [ ] Thử: sửa bài qua CMS trên máy → file `.md` thay đổi đúng định dạng

**Xong khi:** tạo / sửa bài qua CMS được, `posts.ts` đọc được cả 3 bài mẫu.

## Giai đoạn 3 — Design system trong code
- [x] Chốt Q8 (theo Design System)
- [x] Token màu, chữ, khoảng cách, bo góc lấy từ `docs/design-system/tokens.json` (CSS variables), ánh xạ vào theme Tailwind (`npm run tokens` sinh `src/styles/tokens.css`)
- [x] Hai theme Giấy / Đêm: nút chuyển theme, nhớ lựa chọn, không nháy sáng khi tải
- [x] Layout gốc: global nav, footer
- [x] Component cơ bản: nút chính, nút phụ, card bài viết, nhãn danh mục
- [x] Nâng cấp premium (2026-10-07): token `accent-warm`, `gradient-*`, `elevated-*`, `input-icon-*`; nút, ô nhập, thẻ, khối form, ảnh bài
- [x] Ảnh nền thẻ chủ đề 3:4 + Hero Blog theo chủ đề, nhãn nổi trong form, ô nhập glow / focus-visible, dải chữ tự trôi, icon mạng xã hội chip + URL demo, `SectionHead` căn giữa (2026-10-07)
- [x] Bìa sách demo SVG 7 cuốn + `src/config/covers.ts` (2026-10-07)
- [x] Breadcrumb ở trang Blog, ẩn tiêu đề "Blog"; breadcrumb viên nổi giữa đường giao ảnh hero / khối trắng ở trang bài; tiêu đề "Bài liên quan" nổi bật (2026-10-07)
- [x] Đường nối mềm giữa các dải nền, bỏ viền kẻ dải chữ (2026-10-07)
- [x] Trang chủ mới (thương hiệu cá nhân, `/`): Hero chân dung "cánh cửa gập" 3D, Câu chuyện, Cách mình đọc, Con số, Tủ sách, Bài tiêu biểu, Kết nối; Trang chủ cũ chuyển sang `/book`; menu Trang chủ · Book · Blog; nội dung mẫu ở `src/config/profile.ts` (2026-10-11)
- [x] Hero Trang book nền tối, đáy nét cọ, họa tiết bằng token (dòng kẻ, chữ "Đọc" nét viền, vòng tròn `accent-warm`), không ảnh (2026-10-11)
- [ ] Review bằng mắt toàn bộ trang cũ ở 2 theme + 5 mốc, `design-reviewer` duyệt
- [x] Component `Newsletter` (form đăng ký) tái sử dụng được, đủ trạng thái (mặc định, lỗi, thành công)
- [x] Component dùng chung theo `docs/layout/README.md`: `SiteHeader` (có tìm kiếm, nút theme, ☰), `SiteFooter` (7 icon mạng xã hội), `Slider` (chấm + nút ‹ ›), `SocialIcons`, `SearchBox`
- [ ] Component riêng từng trang (làm khi dựng trang đó): xem mục "Component cần dựng" trong spec của trang
- [ ] `design-reviewer` duyệt bộ component

**Xong khi:** có 1 trang demo hiển thị đủ component, đạt ở 375 / 414 / 768 / 1024 / 1440px.

## Giai đoạn 4 — Các trang
Layout đã duyệt nằm ở `docs/layout/<trang>/README.md`. Làm theo thứ tự ưu tiên (mỗi trang một Issue):
- [x] (dựng xong, chờ Lộc duyệt) Trang chi tiết bài — `docs/layout/chi-tiet-bai/` (ưu tiên 1; đích của quảng cáo; 1 layout cho mọi chủ đề, có `Newsletter`)
- [x] (dựng xong, chờ Lộc duyệt) Trang Blog — `docs/layout/blog/` (Hero theo chủ đề, danh sách, phân trang; cần chốt Q13 trước)
  - [B] lọc phía trình duyệt hoặc route tĩnh riêng cho từng chủ đề, không dùng `searchParams` phía server
- [x] (dựng xong, chờ Lộc duyệt) Trang chủ — `docs/layout/trang-chu/` (trang đích: hiểu ngay blog nói về gì, 1 CTA chính "Đọc bài mới nhất")
- [x] Trang 404 (ngoài 3 trang chính)
- [x] Hiệu ứng hover + animation + ảnh cho hero và thẻ (2026-10-07): xem CLAUDE.md mục 6 "Chuyển động và hình ảnh"
- [x] (2026-10-07, đợt 2) Hero trang bài full-width; nền thẻ bài liên quan chữ nhật dọc 3:4 bo góc (bố cục giữ wireframe); form đăng ký sửa nhãn một dòng + tương tác; ghi vào `docs/design-system/EXTENSIONS.md`
- [x] Ảnh minh họa demo: 12 ảnh Wikimedia Commons (CC0 / phạm vi công cộng / CC BY) trong `public/images/stock/`, nguồn ở `public/images/CREDITS.md`; ảnh CC BY phải ghi công trên web thật (Lộc duyệt ảnh, thay bằng ảnh riêng khi có)

Mỗi trang = 1 Issue riêng. **Xong khi:** mọi trang qua `ui-tester` và `design-reviewer`.

## Giai đoạn 5 — SEO
- [ ] `metadata` / `generateMetadata` cho mọi trang
- [ ] Open Graph + ảnh chia sẻ mặc định
- [ ] `sitemap.ts`, `robots.ts` (bỏ bài nháp)
- [ ] Dữ liệu có cấu trúc (JSON-LD) cho bài viết
- [ ] [B] sitemap và robots được sinh thành file tĩnh trong `out/`

**Xong khi:** xem nguồn trang có đủ thẻ meta, `/sitemap.xml` liệt kê đúng bài.

## Giai đoạn 6 — Chất lượng
- [ ] Lighthouse trên trang chủ và 1 trang bài (bản build): Performance, Accessibility, SEO, Best Practices ≥ 90
- [ ] Kiểm tra bàn phím và trình đọc màn hình theo skill `frontend-a11y`
- [ ] Ảnh có kích thước đúng, không làm nhảy bố cục
- [ ] (Mình làm) Thêm CI chạy lint + build cho mỗi PR — Claude soạn file workflow, mình commit

**Xong khi:** đạt ngưỡng Lighthouse và CI xanh.

## Giai đoạn 7 — So sánh A và B
- [ ] Ghi vào `docs/so-sanh-A-B.md`:
  - Thời gian làm từng giai đoạn
  - Số lỗi trong `claude-log.md`
  - Trải nghiệm viết bài qua CMS
  - Điểm Lighthouse
  - Chi phí vận hành dự kiến mỗi tháng
- [ ] (Mình chốt) Chọn A hoặc B để vận hành chính thức

## Giai đoạn 8 — Deploy (chỉ làm với phương án được chọn)
- [ ] Chốt Q9, Q10
- [ ] [A] Keystatic chuyển sang GitHub mode (GitHub App/OAuth + biến môi trường)
- [ ] [A] Deploy lên hosting Node.js đã chọn
- [ ] [B] Deploy lên Cloudflare + Worker `sveltia-cms-auth` + GitHub OAuth App
- [ ] Gắn tên miền, HTTPS
- [ ] Gửi sitemap lên Google Search Console
- [ ] Thử viết 1 bài trên web thật qua CMS → web tự cập nhật

Toàn bộ giai đoạn này: Claude hướng dẫn và soạn cấu hình, **mình thao tác** trên hosting, DNS, secret.

---

## Lộ trình sau khi ra mắt (chưa làm — mỗi mục cần Issue và quyết định riêng)
- Form đăng ký nhận bài mới qua email
- Tìm kiếm bài viết
- Theo dõi chuyển đổi từ quảng cáo (pixel / analytics)
- Bình luận
- Nâng cấp backend lên WordPress Headless — chỉ khi cần thành viên, nhiều người viết hoặc bán hàng.
  Nhờ `src/lib/posts.ts` là nơi duy nhất đọc bài, việc chuyển chủ yếu là viết lại file này và nhập bài vào WordPress.
