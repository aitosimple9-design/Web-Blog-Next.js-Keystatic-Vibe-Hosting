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
| Q14 | Tên blog, logo, link 7 mạng xã hội, trang Điều khoản / Chính sách; 7 icon x 44px không vừa hàng ở 375px (xuống 2 hàng hay cuộn) | Giả định tạm: tên "Logo", icon chưa có link (hiển thị mờ), xuống 2 hàng ở màn hẹp. Sửa ở `src/shared/config/site.ts` | 3 |

Khi mình chốt một mục: ghi kết quả vào cột "Đề xuất" kèm ngày, và cập nhật mục "Stack" trong CLAUDE.md.

---

## Giai đoạn 0 — Nền móng repo
- [x] Trả lời Q1 (Windows)
- [x] Chép layout 3 trang vào `docs/layout/` (wireframe + spec, mỗi trang một thư mục)
- [x] Chép Design System "Blog Book Mono" vào `docs/design-system/` (`README.md`, `DESIGN-SYSTEM.md`, `tokens.json`)
- [x] Thêm `docs/WORKFLOW.md`, `docs/PLAN.md`, `docs/claude-log.md` (rỗng)
- [x] Thêm `.claude/settings.json` (luật chặn quyền + hook)
- [x] Thêm `.github/ISSUE_TEMPLATE/task.md` và `.github/pull_request_template.md`
- [x] Tạo nhãn theo Phụ lục C của WORKFLOW.md (Lộc xác nhận 2026-10-20)
- [x] (Mình làm) Bật Ruleset bảo vệ `main` nếu tài khoản hỗ trợ (Lộc xác nhận 2026-10-20)
- [x] Kiểm tra `/mcp`: GitHub và Playwright đều `connected`
- [ ] [B] Tạo repo `web_blog_static` và thêm vào GitHub token

**Xong khi:** `/memory` hiển thị CLAUDE.md, `/mcp` kết nối đủ, có Issue mẫu đầu tiên.

## Giai đoạn 1 — Khởi tạo Next.js
- [x] Chốt Q2 → Q5
- [x] Tạo project bằng `create-next-app` trong repo hiện tại (không tạo thư mục con)
- [x] Cấu trúc thư mục đúng mục 3 CLAUDE.md
- [ ] [B] `output: 'export'`, `images: { unoptimized: true }`
- [x] `npm run dev`, `npm run lint`, `npm run build` đều chạy được
- [x] `.gitignore` có `.env*`, `node_modules`, `.next`, `out`

**Xong khi:** trang mặc định chạy, build không lỗi, PR đã merge.

## Giai đoạn 2 — Lớp nội dung
- [x] Chốt Q6, Q7
- [x] `src/shared/content/posts.ts`: lấy danh sách bài, lấy 1 bài theo slug, lọc theo danh mục, bỏ bài `draft: true`
- [x] Kiểm tra dữ liệu: thiếu trường bắt buộc → build báo lỗi rõ ràng (không im lặng bỏ qua) (2026-10-20: do `npm run check-content` làm CI đỏ, không phải lúc `build`)
- [x] 3 bài mẫu, mỗi danh mục 1 bài, dùng chung cho A và B (2026-10-20: nay có 22 bài `demo-*`)
- [x] [A] `keystatic.config.ts` khớp mục 5 CLAUDE.md, lưu đuôi `.md`, chế độ local (2026-10-13; `slug` lấy từ tên file, khai báo `fields.ignored()`; có test `tests/unit/project/keystatic.test.ts`)
- [ ] [B] `public/admin/index.html` + `config.yml` khớp mục 5 CLAUDE.md
- [ ] Thử: sửa bài qua CMS trên máy → file `.md` thay đổi đúng định dạng

**Xong khi:** tạo / sửa bài qua CMS được, `posts.ts` đọc được cả 3 bài mẫu.

## Giai đoạn 3 — Design system trong code
- [x] Chốt Q8 (theo Design System)
- [x] Token màu, chữ, khoảng cách, bo góc lấy từ `docs/design-system/tokens.json` (CSS variables), ánh xạ vào theme Tailwind (`npm run tokens` sinh `src/frontend/styles/tokens.css`)
- [x] Hai theme Giấy / Đêm: nút chuyển theme, nhớ lựa chọn, không nháy sáng khi tải
- [x] Layout gốc: global nav, footer
- [x] Component cơ bản: nút chính, nút phụ, card bài viết, nhãn danh mục
- [x] Nâng cấp premium (2026-10-07): token `accent-warm`, `gradient-*`, `elevated-*`, `input-icon-*`; nút, ô nhập, thẻ, khối form, ảnh bài
- [x] Ảnh nền thẻ chủ đề 3:4 + Hero Blog theo chủ đề, nhãn nổi trong form, ô nhập glow / focus-visible, dải chữ tự trôi, icon mạng xã hội chip + URL demo, `SectionHead` căn giữa (2026-10-07)
- [x] Bìa sách demo SVG 7 cuốn + `content/books/*.json` (trước là `src/config/covers.ts`, chuyển sang Keystatic 2026-10-15)
- [x] Breadcrumb ở trang Blog, ẩn tiêu đề "Blog"; breadcrumb viên nổi giữa đường giao ảnh hero / khối trắng ở trang bài; tiêu đề "Bài liên quan" nổi bật (2026-10-07)
- [x] Đường nối mềm giữa các dải nền, bỏ viền kẻ dải chữ (2026-10-07)
- [x] Trang chủ mới (thương hiệu cá nhân, `/`): Hero trung tâm (chân dung xóa phông, tên khổng lồ sau người, cánh cửa mở đầu trang, thẻ kính mờ), Câu chuyện, Cách mình đọc, Con số, Tủ sách, Bài tiêu biểu, Kết nối; Trang chủ cũ chuyển sang `/book`; menu Trang chủ · Book · Blog; nội dung mẫu ở `src/shared/config/profile.ts` (2026-10-11)
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
- [x] (2026-10-14, nhánh `feat/header-scroll-motion`, chờ kiểm tra 5 mốc + `design-reviewer`) Thanh đầu trang viên thuốc khi cuộn, hero kéo lên sau menu (menu trong suốt ở đầu trang), chữ hiện từng từ + khối hiện lần lượt khi cuộn (`RevealText`, `Reveal`): xem CLAUDE.md mục 6 và `docs/design-system/EXTENSIONS.md`
- [x] (2026-10-07, đợt 2) Hero trang bài full-width; nền thẻ bài liên quan chữ nhật dọc 3:4 bo góc (bố cục giữ wireframe); form đăng ký sửa nhãn một dòng + tương tác; ghi vào `docs/design-system/EXTENSIONS.md`
- [x] Ảnh minh họa demo: 12 ảnh Wikimedia Commons (CC0 / phạm vi công cộng / CC BY) (thư mục `stock/` đã xóa 2026-10-15, ảnh nằm ở `posts/<slug>/`, `topics/<slug>/`, `profile/`), nguồn ở `public/images/CREDITS.md`; ảnh CC BY phải ghi công trên web thật (Lộc duyệt ảnh, thay bằng ảnh riêng khi có)

Mỗi trang = 1 Issue riêng. **Xong khi:** mọi trang qua `ui-tester` và `design-reviewer`.

## Giai đoạn 5 — SEO
- [x] `metadata` / `generateMetadata` cho mọi trang
- [x] Open Graph + ảnh chia sẻ mặc định
- [x] `sitemap.ts`, `robots.ts` (bỏ bài nháp)
- [x] Dữ liệu có cấu trúc (JSON-LD) cho bài viết
- [ ] [B] sitemap và robots được sinh thành file tĩnh trong `out/`

**Xong khi:** xem nguồn trang có đủ thẻ meta, `/sitemap.xml` liệt kê đúng bài.

## Giai đoạn 6 — Chất lượng
- [ ] Lighthouse trên trang chủ và 1 trang bài (bản build): Performance, Accessibility, SEO, Best Practices ≥ 90
  - Đo 2026-10-20 (bản build, Lighthouse 12, mặc định mobile): Accessibility 100, Best Practices 100, SEO 100 (khi bản build cho lập chỉ mục; máy local chặn nên đo 69). Performance CHƯA đạt: trang bài 72–79, Blog 67–73, LCP 5–6 s (TBT 90–270 ms, CLS 0); Trang chủ không đo được LCP (`NO_LCP`, nghi do cánh cửa `HeroCurtain` và chữ hiện từng từ). Cần kế hoạch tối ưu riêng (hỏi Lộc)
- [ ] Kiểm tra bàn phím và trình đọc màn hình theo skill `frontend-a11y`
- [x] Ảnh có kích thước đúng, không làm nhảy bố cục (plugin `rehype-image-size`; CLS đo 0 ở Lighthouse 2026-10-20)
- [x] (Mình làm) Thêm CI chạy lint + build cho mỗi PR — Claude soạn file workflow, mình commit (`ci.yml` có lint, typecheck, test, check-content, build, e2e)

**Xong khi:** đạt ngưỡng Lighthouse và CI xanh.

## Giai đoạn 7 — So sánh A và B
- [ ] Ghi vào `docs/so-sanh-A-B.md`:
  - Thời gian làm từng giai đoạn
  - Số lỗi trong `claude-log.md`
  - Trải nghiệm viết bài qua CMS
  - Điểm Lighthouse
  - Chi phí vận hành dự kiến mỗi tháng
- [ ] (Mình chốt) Chọn A hoặc B để vận hành chính thức

## Nâng cấp quản trị Keystatic (nhánh `feat/keystatic-admin-upgrade`, chưa có Issue)
- [x] B1 Cột danh sách + menu trái chia nhóm (2026-10-15)
- [x] B2 Singleton "Cài đặt site" làm giá trị dự phòng cho metadata (2026-10-15)
- [x] Cài đặt site đầy đủ (tên, khẩu hiệu, năm, mạng xã hội, pháp lý, số bài / trang) nối vào giao diện, PR #16 (2026-10-16)
- [x] Header + Footer + Newsletter cấu hình ở Keystatic, PR #18 (2026-10-16)
- [x] Trang chủ cấu hình ở Keystatic, PR #19 (2026-10-16)
- [x] Trang Book, Blog, Trang bài, 404 cấu hình chữ ở Keystatic (PR 4 / 5, nhánh feat/trang-con-keystatic, 2026-10-16)
- [x] Quản lý khối từng trang ở Keystatic: bật / tắt + đổi thứ tự (Trang chủ, Book), bật / tắt (Blog, Trang bài), nền xen kẽ tự tính, ảnh chia sẻ riêng Trang chủ / Book / Blog, tiêu đề tab 404 (PR 5 / 5, nhánh feat/quan-ly-khoi, 2026-10-17)
- [x] Quy tắc slug ổn định + tên ảnh (WORKFLOW 4b, CLAUDE.md mục 5); `check-content --base` (tự dùng nhánh đích trên CI) cảnh báo bài đã đăng mất / đổi slug, cảnh báo tên file ảnh sai quy ước (nhánh feat/quy-tac-slug, 2026-10-17)
- [x] Chuyển hướng (redirects): menu Keystatic "Chuyển hướng" (đường dẫn bất kỳ), next.config `redirects()` (308 / 307), `src/shared/redirects.ts`, check-content kiểm tra đích / vòng lặp / chuỗi / che trang, bài đã đăng mất mà thiếu chuyển hướng = LỖI, `npm run make-redirects` (nhánh feat/chuyen-huong, 2026-10-17)
- [x] Trang Chính sách riêng tư + Liên hệ (Keystatic singleton, Markdown, trống = ẩn, tự nối chân trang + sitemap; nội dung pháp lý Lộc duyệt, chưa có chữ) (nhánh feat/trang-phap-ly, 2026-10-17)
- [x] Chặn lập chỉ mục môi trường không phải production (preview của Vercel, máy cá nhân): robots.txt, meta robots, X-Robots-Tag; test `indexing.test.ts` (nhánh feat/noindex-preview, 2026-10-17)
- [ ] (Ý tưởng, làm SAU khi Lộc cần, đã thống nhất 2026-10-17) Mức 2: gom khối vào thư viện chung `src/frontend/components/blocks/` có đăng ký trung tâm, khối nhận dữ liệu qua props, dùng lại ở nhiều trang. Mức 3: `fields.blocks` của Keystatic (thêm / xóa / nhân bản khối, tạo trang mới) — cần luật ghép nền, kiểm chứng bản Keystatic 0.6.x và đồng bộ dự án B
- [x] B2b Chủ đề và Sách chuyển từ `src/config` sang `content/topics`, `content/books` (2026-10-15)
- [x] B3 Trường mới của bài (ảnh bìa tải lên, Trạng thái, thẻ, SEO title, ảnh OG, bài liên quan, ghi chú) [sync sang B] (2026-10-15)
- [x] Xóa bài / chủ đề / sách tự xóa thư mục ảnh (local); `npm run prune-images` cho chế độ GitHub (2026-10-15)
- [x] B4 `isPublished(post, now)` (giờ Asia/Ho_Chi_Minh): bài ngày tương lai ẩn ở danh sách, trang bài, liên quan, tìm kiếm, sitemap; hẹn giờ đăng = Redeploy tay (2026-10-15)
- [x] B5 `npm run check-content` (lỗi / cảnh báo / thông tin) + JSON-LD `image`/`dateModified`, thêm trường tùy chọn `updated` [sync sang B] (2026-10-15)
- [x] B6 Nút "Xem trước" (`/xem-truoc/bai-viet/<slug>`, bản đã lưu, gồm nháp / lên lịch; chỉ chạy ở chế độ local, không trên Vercel). Xem trước ở GitHub mode / production: làm ở GĐ8 (cần xác thực) (2026-10-15)
- [x] B7 Kiểm tra cuối: typecheck, lint, 45 test, check-content, prune-images, build 35 trang đều đạt (2026-10-15)
- [x] Danh sách trong Keystatic có thêm cột: Bài (Tiêu đề, Chủ đề, Ngày đăng, Trạng thái, Ẩn bài này, Ảnh bìa), Chủ đề (Tên, Thứ tự, Mô tả, Ảnh nền), Sách (Tên, Ảnh sách); ô tick `draft` đổi nhãn thành "Ẩn bài này" (giữ nguyên hai ô Trạng thái và Ẩn bài này) (2026-10-16)
- [x] Cột ảnh trong danh sách Keystatic hiện ảnh thu nhỏ thay vì đường dẫn (`KeystaticThumbnails.tsx`, thay ở trình duyệt, không đổi dữ liệu) (2026-10-16)
- [x] Cột "Nguồn sách" ở danh sách Bài viết hiện tên sách (Keystatic không đọc được khối lồng `source.book`): `KeystaticThumbnails.tsx` thay "[object Object]" bằng tên lấy từ `/api/ten-sach` (`getBookNamesBySlug` trong `posts.ts`; cùng cổng `preview.ts`), không đổi dữ liệu (2026-10-16)
- (Nhắc, không phải việc) Trước khi mở PR đổi diện mạo: `ui-tester` + `design-reviewer`, test tay iOS + Android (xem CLAUDE.md mục 11)
- [ ] Hồ sơ / Trang chủ trong Keystatic: hỏi lại Lộc khi tới

## Kiểm tra SEO trong trang quản trị (nhánh `feat/seo-checker`, chưa có Issue)
Lộc duyệt 2026-10-16: cột SEO ở danh sách Bài viết + hộp điểm SEO trong form bài (chấm cả lúc đang gõ), bộ tiêu chí theo Google / Yoast / Rank Math (không có phần đọc hiểu tiếng Anh).
- [x] Bước 1 Lõi chấm điểm `src/shared/seo-score.ts` (20 tiêu chí, điểm 0-100, hàm thuần) + 29 test
- [x] Bước 2 Hai trường mới `focusKeyword` (từ khóa chính) và `coverAlt` (alt ảnh bìa): `keystatic.config.ts`, `posts.ts`, CLAUDE.md mục 5 [sync: cần đồng bộ sang dự án B]; `coverAlt` dùng làm alt ảnh hero và ảnh chia sẻ
- [x] Bước 3 Cột "Điểm SEO" ở danh sách Bài viết (điểm + chữ Tốt / Cần cải thiện / Chưa đạt, màu theo 2 theme của Keystatic; dựa trên bản đã lưu): `getSeoScoresBySlug` + `/api/diem-seo` + `KeystaticThumbnails.tsx`; mượn cột "Từ khóa chính" làm chỗ giữ chỗ (2026-10-16)
- [x] Bước 4 Hộp điểm SEO trong form bài (nổi góc dưới, chấm cả nội dung chưa Lưu, liệt kê chưa đạt + cách sửa, chuyển trái / phải, nhớ trạng thái): `SeoPanel.tsx`, `seo-form-reader.ts`, `src/cms/lib/seo-fields.ts` (nhãn dùng chung với config); tự báo khi không đọc được ô / lệch bản đã lưu; test trên giao diện thật: gõ từng ô, thẻ, bài liên quan, nội dung, gỡ ảnh, bài mới, 2 theme, màn hình hẹp, bài 6.400 từ (2026-10-16)
- [x] Bước 5 `npm run check-content` báo thêm cảnh báo SEO từng bài + điểm trung bình, cảnh báo ảnh trong bài trùng file với ảnh bìa (lỗi thật gặp khi thử: hai ảnh cùng tên `cover.jpg` ghi đè nhau); tự bỏ qua có thông báo nếu Node cũ không đọc được .ts (2026-10-16)
- [x] Thêm bước `npm run check-content` vào `.github/workflows/ci.yml` (Lộc tự commit, Claude không sửa được thư mục workflows) (đã có ở `ci.yml`)

## Chủ đề con (Lộc giao 2026-10-22; 3 PR, mỗi PR Lộc merge)
- [x] PR 1 — Dữ liệu và quản trị: `content/subtopics`, mục Keystatic "Chủ đề con", bài bắt buộc có `subtopics` (nhiều lựa chọn, phải thuộc chủ đề của bài), `check-content`, xem trước nhánh GitHub, 14 chủ đề con mẫu gán cho 22 bài
- [x] PR 2 — Trang Blog: khối chủ đề con phía trên danh sách bài (5 thẻ, trượt + nút hai bên), trang `/blog/<chủ đề>/<chủ đề con>` (+ phân trang, sitemap, canonical, chuyển hướng khi mất / đổi slug), khối bật / tắt trong Keystatic, nhãn vào "Nhãn giao diện"
- [ ] PR 3 — Đồng bộ tài liệu (layout Blog, EXTENSIONS, design-reviewer), E2E, `ui-tester` 3 mốc

## Giai đoạn 8 — Deploy (chỉ làm với phương án được chọn)
- [ ] Chốt Q9, Q10
- [ ] [A] Keystatic chuyển sang GitHub mode (GitHub App/OAuth + biến môi trường). Next 16 dev cần `allowedDevOrigins: ["127.0.0.1"]` (đã thêm, Thinkmill/keystatic#1549); chờ Lộc chọn GitHub App hay OAuth
- [ ] [A] Hosting: Vercel (đang chờ MCP Vercel); local mode không chạy được trên Vercel nên cần GitHub mode
- [ ] [A] Deploy lên hosting Node.js đã chọn
- [ ] [B] Deploy lên Cloudflare + Worker `sveltia-cms-auth` + GitHub OAuth App
- [x] (2026-10-20) Kiểm tra `NEXT_PUBLIC_SITE_URL`: build production dừng khi sai, `check-content` báo, dải thông báo ở trang quản trị (`src/shared/site-url-check.ts`)
- [ ] Gắn tên miền, HTTPS
- [ ] [A] Quyết định 2026-10-18 (Lộc chọn D rút gọn): trang quản trị ở chế độ GitHub tạo PR; workflow `.github/workflows/auto-merge-content.yml` tự bật auto-merge (squash) khi PR CHỈ đổi `content/` và `public/images/`, CI (`check`, `e2e`) xanh thì tự merge. PR có file ngoài hai nơi đó vẫn do Lộc duyệt. Workflow đã viết, Lộc đã bật "Allow auto-merge" và đã thử PR #31 (chỉ đổi content/): tự merge đúng (2026-10-19). Còn: khi deploy kiểm tra Keystatic GitHub mode tạo nhánh + PR ra sao (có phải bấm tạo nhánh tay không). Phần phân quyền nhiều người (CODEOWNERS, tài khoản GitHub cho marketing) để sau, khi có người thứ hai
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
  Nhờ `src/shared/content/posts.ts` là nơi duy nhất đọc bài, việc chuyển chủ yếu là viết lại file này và nhập bài vào WordPress.

---

## Việc tồn đọng (Lộc giao ghi lại 2026-10-19, xử lý sau; làm xong thì gạch và ghi ngày)

**Đã xong (2026-10-19, Lộc ưu tiên):** menu trang quản trị có icon + phân cách (#38); quy hoạch `src/` thành ba vùng `frontend/` · `cms/` · `shared/` có test chặn import sai (tests/unit/project/layers.test.ts); dọn thư mục kết quả test cục bộ (`.playwright-mcp`, `shots`, `playwright-report`, `test-results`). Test đơn vị xếp theo vùng `tests/unit/{frontend,cms,shared,app,project}`; đổi tên `components/about` → `home`, `home` → `book` cho khớp trang; Form Chủ đề / Sách / Chuyển hướng và nhãn ô lồng cũng dạng thẻ; Nhãn giao diện nhỏ (aria-label, nút, tìm kiếm, phân trang, thẻ bài) sửa ở Keystatic → Cài đặt → Nhãn giao diện; Thử THẬT Keystatic GitHub mode trên Vercel (2026-10-20: cột SEO / tên sách / ảnh, khóa Slug, Xem trước từ nhánh, Tạo chuyển hướng ghi commit lên nhánh đều chạy; SỬA lỗi hộp điểm SEO không hiện vì địa chỉ có `/branch/<nhánh>/`); xem trước chủ đề mới ở nhánh; E2E đường GitHub bằng máy chủ GitHub giả; Trang cài đặt (singleton) dạng thẻ kiểu Vercel (`KeystaticSettingsCards`); E2E trang quản trị `tests/e2e/admin/` (chỉ đọc; bắt được lỗi hộp điểm SEO không hiện do ô Slug ghi DOM lặp, đã sửa).

**Nội dung (việc của Lộc)**
- [ ] Thay 8 chỗ `[mẫu]` ở Trang chủ, tên site "Logo", link mạng xã hội thật, email liên hệ, nội dung Chính sách riêng tư (trang đang ẨN vì trống)
- [ ] Sửa 21 bài `demo-*` thành bài thật (đã chọn cách A: `demo-*` được miễn kiểm tra slug; giữ `scripts/seed-demo-posts.mjs` nhưng chạy lại sẽ XÓA và ghi đè bài đã sửa, cẩn thận)
- [ ] Đặt ảnh chia sẻ mặc định (Cài đặt → Site) và ảnh chia sẻ riêng của Trang chủ / Book / Blog: hiện thiếu `og:image` ở ba trang này
- [ ] 2 bài demo có tiêu đề SEO ngắn (điểm 65/100): `demo-04`, `demo-14`
- [ ] Newsletter: chốt nơi gửi dữ liệu form (Q11), chưa chọn
- [ ] Test tay trên 1 iPhone và 1 Android thật trước khi ra mắt

**Deploy / hạ tầng**
- [x] Thử THẬT Keystatic chế độ GitHub trên Vercel sau PR #36: cột Điểm SEO, cột Nguồn sách, hộp điểm SEO, Xem trước; Tạo chuyển hướng và Lưu thử ở NHÁNH MỚI (không thử ở `main`); xem Keystatic tạo nhánh + PR ra sao; PR chỉ đổi nội dung có tự merge không (2026-10-20, xem mục "Đã xong")
- [ ] Thêm Callback URL của địa chỉ ngắn vào GitHub App (`https://web-blog-next-js-keystatic-vibe-hos.vercel.app/api/keystatic/github/oauth/callback`) nếu chưa; khi có tên miền thật thì thêm tiếp
- [x] Redeploy để `NEXT_PUBLIC_SITE_URL` (đã đổi sang địa chỉ ngắn) có hiệu lực (mọi bản deploy production từ khi đổi biến, mới nhất là #41 ngày 2026-10-20, đều đã build lại)
- [ ] Gắn tên miền thật: đổi `NEXT_PUBLIC_SITE_URL`, tắt bảo vệ đăng nhập Vercel khi công khai, kiểm tra header `x-robots-tag: noindex` (hiện do Vercel thêm cho địa chỉ `vercel.app`, không phải của mã) và Google Search Console
- [ ] Hosting chính thức: vẫn dự kiến PaaS Việt Nam, Vercel chỉ dùng tạm (CLAUDE.md mục 1)
- [x] Cảnh báo Turbopack ở `src/cms/lib/content-cleanup.ts:113` (đọc thư mục ảnh theo đường dẫn tính toán, làm gói function admin nặng hơn): xử lý bằng chú thích `turbopackIgnore` hoặc đổi cách đọc (2026-10-20: thêm `/*turbopackIgnore: true*/`, build sạch cảnh báo)
- [ ] Phân quyền nhiều người (CODEOWNERS, tài khoản GitHub cho marketing, quyền theo vai trò): để sau khi có người thứ hai
- [x] Xem trước ở chế độ GitHub: chủ đề mới tạo cùng lúc chưa có trong bản build nên chưa xem trước được tới khi merge (#41 `registerPreviewTopic`)

**Tính năng / hệ thống**
- [ ] Trang riêng cho Sách (Lộc đang cân nhắc); khi có thì thêm địa chỉ vào `KIND_PREFIX` (`src/shared/redirect-patterns.ts`), nút Tạo chuyển hướng ở trang sửa Sách và kiểm tra slug sách ở `check-content`
- [x] (2026-10-20) Đưa nốt chữ giao diện nhỏ còn nằm trong mã (aria-label, "phút đọc"...) lên admin nếu Lộc muốn (hiện duyệt GIỮ trong mã)
