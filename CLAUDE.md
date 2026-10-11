# LỘC_WEBSITE BLOG — Dự án A: Next.js (server) + Keystatic

Blog kiến thức nâng cao từ sách, dùng làm **trang đích (landing) cho traffic quảng cáo** từ các nền tảng khác.
Ưu tiên: tải nhanh, SEO chuẩn, giữ chân người đọc ngay màn hình đầu, giao diện chuyên nghiệp và khác biệt.
Chạy song song với **Dự án B** (`web_blog_static`: xuất tĩnh + Sveltia + Cloudflare) để so sánh.
Hai dự án dùng CHUNG cấu trúc bài viết (mục 5) — mọi thay đổi ở mục 5 phải đồng bộ sang dự án B.

## 0. Đọc trước khi làm việc
- `docs/HANDOFF.md` — ĐỌC ĐẦU TIÊN mỗi phiên mới: phiên trước dừng ở đâu, việc kế tiếp (xem mục 4).
- `docs/WORKFLOW.md` — quy trình Issue → nhánh → kế hoạch → code → kiểm tra → PR. BẮT BUỘC làm theo.
- `docs/PLAN.md` — giai đoạn hiện tại, việc tiếp theo, quyết định đang chờ (Q1–Q14).
- `docs/design-system/` — Design System, đọc trước bất kỳ việc UI nào: `README.md` (cách dùng), `DESIGN-SYSTEM.md` (nguyên tắc, component), `tokens.json` (giá trị), `EXTENSIONS.md` (các mở rộng đã duyệt cho dự án này). Lộc quản lý thư mục này; khi lệch với CLAUDE.md thì báo Lộc.
- `docs/layout/` — layout 3 trang: `README.md` (chỉ mục, khối dùng chung) + mỗi trang một thư mục (`chi-tiet-bai/`, `blog/`, `trang-chu/`) gồm spec `README.md` và mockup. Đọc spec trang trước khi dựng trang đó.
- `docs/claude-log.md` — các lỗi đã gặp, đừng lặp lại.

## 1. Stack
- Đã chốt:
  - Next.js App Router, chạy **server Node.js** (KHÔNG dùng `output: 'export'`)
  - CMS: Keystatic — hiện dùng `storage: { kind: 'local' }`; chuyển sang `kind: 'github'` ở giai đoạn deploy
  - Hosting dự kiến: PaaS Việt Nam hỗ trợ Node.js — CHƯA mua
  - Máy làm việc: Windows (Q1)
  - TypeScript, npm, Next.js 16.4.0 (Q2, Q4, Q5; kiểm tra lỗi Keystatic GitHub mode ở GĐ2/GĐ8, lỗi thì hạ về 15.x)
  - `next.config.ts` KHÔNG bật `cacheComponents` (chưa chắc tương thích Keystatic); xem lại ở GĐ2
  - CSS: Tailwind CSS bản mới nhất (Q3)
  - Đọc bài: dùng cả thư viện đọc frontmatter và thư viện render Markdown (Q6); chọn cụ thể + hỏi trước khi cài
  - Danh mục: demo trước, đặt ở một nơi cấu hình để sửa / thêm được (Q7)
  - Font / design: theo Design System trong `docs/design-system/` (Q8)
- Chưa chốt: xem bảng "Quyết định đang chờ" trong `docs/PLAN.md`. KHÔNG tự chọn; hỏi khi tới giai đoạn cần.
  Riêng phiên bản Next.js: kiểm tra lỗi "Keystatic GitHub mode trắng trang trên Next.js 16" trong issue của Thinkmill/keystatic trước khi đề xuất.

## 2. Lệnh
- `npm run dev` — http://localhost:3000, quản trị bài: http://localhost:3000/keystatic
- `npm run lint`
- `npm run build` — PHẢI chạy không lỗi trước khi mở PR
- `npm run typecheck` — kiểm tra kiểu TypeScript; `npm run tokens` — sinh lại `src/styles/tokens.css` khi sửa `tokens.json`

## 3. Cấu trúc thư mục (đổi cấu trúc = phải hỏi trước)
```
content/posts/<slug>.md         ← bài viết (nguồn dữ liệu duy nhất)
public/images/posts/<slug>/     ← ảnh của từng bài
public/images/covers/           ← bìa sách demo (SVG, sinh bằng scripts/gen-demo-covers.mjs)
docs/                           ← WORKFLOW, PLAN, claude-log, HANDOFF (cục bộ, gitignore)
docs/design-system/              ← Design System (README, DESIGN-SYSTEM, tokens.json) — Lộc quản lý
docs/layout/                     ← layout từng trang (wireframe + spec), Lộc quản lý
keystatic.config.ts             ← collection "posts" theo đúng mục 5
src/app/                        ← routes (App Router)
src/app/keystatic/              ← giao diện quản trị Keystatic
src/app/api/keystatic/          ← API của Keystatic
src/lib/posts.ts                ← module DUY NHẤT đọc bài viết
src/components/                 ← UI components (ui/, layout/, home/, blog/, article/)
src/config/                     ← site.ts (tên blog, nav, mạng xã hội), topics.ts (danh mục: nơi DUY NHẤT sửa/thêm chủ đề), covers.ts (bìa sách demo theo tên sách)
src/styles/                     ← tokens.css (TỰ SINH từ docs/design-system/tokens.json bằng `npm run tokens`), prose.css
scripts/                        ← build-tokens.mjs, seed-demo-posts.mjs (bài mẫu demo-*.md), gen-demo-covers.mjs (bìa sách demo)
```
Mọi trang lấy bài viết qua `src/lib/posts.ts`. Không gọi API Keystatic rải rác trong components —
để sau này đổi CMS (kể cả lên WordPress Headless) chỉ cần sửa 1 file.

## 4. Cách làm việc với mình
- Luôn trả lời bằng tiếng Việt. Thuật ngữ tiếng Anh giữ nguyên, giải thích 1 câu ở lần đầu.
- Mình tự học, mới biết React cơ bản, đang học Next.js → giải thích ngắn khi dùng khái niệm mới.
- Mỗi Issue: trình kế hoạch trước (Plan mode), DỪNG chờ duyệt rồi mới sửa file.
- Việc nhiều hơn 3 bước: làm từng bước, DỪNG chờ xác nhận sau mỗi bước có thay đổi file.
- PHẢI hỏi trước khi: cài/gỡ thư viện, đổi phiên bản Next.js, đổi cấu trúc thư mục, đổi tên/xóa file,
  đổi cấu trúc dữ liệu bài viết, mọi thứ liên quan deploy / tên miền / biến môi trường.
  Cách hỏi: 2–3 phương án, mỗi phương án 1 dòng ưu + 1 dòng nhược, kèm đề xuất.
- Không chắc: hỏi tối đa 3 câu, mỗi câu kèm đề xuất mặc định.
- Khi báo xong: thay đổi gì, ở file nào, cách mình tự kiểm tra.
- **Bàn giao giữa các phiên (`docs/HANDOFF.md`):**
  - Đầu phiên: đọc HANDOFF.md trước, đối chiếu với `git status`, tóm tắt 3 dòng cho mình rồi chờ xác nhận.
  - Ghi (ghi đè) HANDOFF.md khi: mình kết thúc phiên / sắp `/clear` hoặc `/compact`; ngữ cảnh ≥ 70% (nhắc mình trước);
    xong một bước có thay đổi file; xong Issue.
  - Nội dung: nhánh, Issue, đã xong, đang dở, việc kế tiếp, đang chờ mình, bẫy đã gặp. Ngắn, chỉ trạng thái hiện tại.
  - KHÔNG ghi secret. File nằm trong `.gitignore`. Ghi xong báo "đã bàn giao" rồi mới để mình `/clear`.
  - Chi tiết: `docs/WORKFLOW.md` mục 2.

## 5. Cấu trúc bài viết — DÙNG CHUNG với dự án B, giữ đồng bộ
File `content/posts/<slug>.md`, định dạng `.md` thuần (Markdown + frontmatter YAML).
Keystatic phải cấu hình lưu đuôi `.md`, KHÔNG dùng `.mdoc` mặc định
(kiểm tra tùy chọn `extension` của `fields.markdoc` trong tài liệu Keystatic khi triển khai).

```yaml
---
title: "Tiêu đề bài"                 # bắt buộc
slug: tieu-de-bai                    # bắt buộc, chữ thường, không dấu, nối bằng "-"
description: "Mô tả ≤ 160 ký tự"     # bắt buộc, dùng cho meta description + Open Graph
category: chu-de-1                   # bắt buộc, 1 trong 3 danh mục (tên thật: Q7 trong PLAN.md)
date: 2026-10-05                     # bắt buộc, YYYY-MM-DD
source:                              # bắt buộc
  book: "Tên sách"
  author: "Tác giả"
cover: /images/posts/tieu-de-bai/cover.jpg   # không bắt buộc
draft: false                         # true = không hiển thị, không vào sitemap
---
```
- `category` quyết định chủ đề của bài (nhãn, Hero chủ đề và danh sách ở trang Blog, bài liên quan). Trang chi tiết dùng 1 layout chung (`docs/layout/chi-tiet-bai/`). Mục 5 dùng chung với dự án B: cần đồng bộ sang B (nhãn `sync`).
- Nội dung: diễn giải bằng lời mới, có ví dụ và góc nhìn riêng, ghi nguồn. KHÔNG chép nguyên văn đoạn dài từ sách.

## 6. Thiết kế
- Nguồn duy nhất: Design System "Blog Book Mono" — `docs/design-system/DESIGN-SYSTEM.md` (nguyên tắc, component) + `docs/design-system/tokens.json` (giá trị token) + `docs/design-system/README.md` (cách nạp font, theme).
  Skill `frontend-design-direction` dùng để định hướng trước khi dựng trang mới, không được lệch khỏi Design System.
- Phạm vi: 4 trang (Trang chủ cá nhân `/`, Book `/book` = trang chủ cũ, Trang Blog, Trang chi tiết bài) — tất cả phải tối ưu UI/UX để thu hút người đọc. Menu: Trang chủ · Book · Blog.
  Dựng đúng theo `docs/layout/<trang>/README.md`; mockup `.dc.html` chỉ là tham chiếu cấu trúc, màu và chữ lấy từ Design System, KHÔNG chép nguyên mã mockup.
- Hai theme bắt buộc: Giấy (sáng) và Đêm (tối) bằng `data-theme` trên `<html>`.
  - Có nút chuyển theme ở thanh đầu trang; mặc định theo `prefers-color-scheme`, nhớ lựa chọn của người đọc.
  - Đặt theme bằng script chạy trước khi vẽ trang (không nháy sáng).
  - Chỉ dùng token (`var(--ink)`, `var(--paper)`…), KHÔNG viết mã hex trong CSS; mọi component phải đẹp ở cả 2 theme.
- Form đăng ký là component tái sử dụng DUY NHẤT (`Newsletter`: Họ tên, Số điện thoại, Email), có ở cả 3 trang; không viết bản thứ hai. Nơi gửi dữ liệu: chờ Q11, KHÔNG tự chọn.
- Tailwind (Q3): ánh xạ token của Design System vào theme Tailwind; không tự thêm màu ngoài token.
- Chỉ có MỘT màu nhấn (`accent`; tông ấm `accent-warm` chỉ làm đầu gradient và họa tiết, không làm chữ hay nền phẳng); phong cách **premium** (Lộc duyệt 2026-10-07): gradient CHỈ cho nút chính / CTA và bề mặt khối nổi (token `gradient-primary*`, `gradient-surface`, pha từ `accent` + `accent-warm`; lớp `.btn-grad`, `.surface-raised` trong globals.css); đổ bóng nhiều lớp CHỈ theo thang `elevated-sm/md/lg` (+ `cover-shadow` cho bìa sách; + cặp `inset-sunk` / `inset-sunk-pressed` DUY NHẤT cho khối LÕM vào nền ở thẻ nguồn sách + mục lục trang bài dưới 1280px, Lộc duyệt 2026-10-10), không tự chế giá trị. KHÔNG gradient cho nền trang, chữ, ảnh bài (ngoại lệ DUY NHẤT: vùng chuyển mờ giữa các dải nền, lớp `seam-top` / `seam-bottom` / `seam-both`; đáy ảnh hero cắt bằng mask nét cọ `brush-bottom` thay cho bóng mờ, pha từ `paper` sang trong suốt; không dùng đường kẻ ngang cứng giữa các dải).
- **Chuyển động và hình ảnh (Lộc mở rộng 2026-10-07, vẫn nằm trong bảng màu / bo góc / bóng của Design System):**
  - Hero và thẻ phải có ảnh hoặc hiệu ứng, không để ô trống. Chưa có ảnh thật: dùng `CoverArt` (ảnh nghệ thuật sinh từ slug, đơn sắc, không gradient). Ảnh thật chỉ dùng ảnh có giấy phép cho phép, ghi nguồn ở `public/images/CREDITS.md`. Thẻ chủ đề Trang chủ tỉ lệ 3:4: ảnh theo chủ đề (`image` trong `src/config/topics.ts`) tràn cả thẻ phủ `inverse` 65%, chữ và nút nằm thẳng trên ảnh, không khung bó (ngoại lệ thứ hai cho chữ trên ảnh; ô "Bài viết mới nhất" cũng có vùng ảnh kéo xuống phủ cả chữ, giữ bento gốc; thẻ bài ở lưới Blog và thẻ bài liên quan cùng khuôn ảnh tràn + chữ trên ảnh); khối lớn (thẻ chủ đề, form Newsletter) lơ lửng bằng `elevated-lg`; Hero trang Blog có ảnh nền theo chủ đề phủ lớp `inverse` 80% (ngoại lệ cho chữ trên ảnh).
  - Được phép: hiện chữ từng từ, nổi lên khi vào trang (CSS: `anim-*` trong globals.css); hover (nhấc thẻ, phóng ảnh, nền nút quét, gạch chân chạy, mũi tên trượt); nghiêng / trôi lớp theo con trỏ; chạy theo thanh cuộn (dải chữ, thị sai, thanh tiến độ đọc); đếm số; chuyển trang bằng `<ViewTransition>` (ảnh bay từ thẻ sang trang bài).
  - KHÔNG: vòng lặp vô hạn / tự chạy không dừng (NGOẠI LỆ duy nhất, Lộc duyệt 2026-10-07: dải chữ `ScrollMarquee` trôi chậm 60s, dừng khi rê chuột, tắt khi giảm chuyển động), animate width / height / top / left, thêm màu ngoài token, đổ bóng ngoài thang `elevated-*` (trừ `inset-sunk*` đã duyệt ở mục 6), gradient cho nền trang / chữ / ảnh.
  - **Hero trang bài:** ảnh bìa là HERO tràn hết bề ngang đầu trang; nhãn chủ đề / tiêu đề / mô tả / ngày nằm CHÍNH GIỮA trên ảnh, không có khối nền riêng (ảnh phủ `inverse` 62%; ngoại lệ chữ trên ảnh); đáy ảnh cắt bằng mask nét cọ. Thẻ **bài liên quan**: nền là hình chữ nhật DỌC tỉ lệ 3:4 bo góc `radius-lg` (không vuông), dùng ảnh bài màu gốc tràn cả thẻ phủ `inverse` 55% (không còn nền đen / trắng xen kẽ), bố cục bên trong giữ như wireframe (nhãn, tiêu đề, bìa sách nhỏ, tóm tắt, thời gian đọc).
  - **Trang chủ cá nhân (`/`, Lộc duyệt 2026-10-11): Hero tối cùng kiểu Hero Book nhưng chữ viền là tên ngắn ("Ni") và chân dung 3D (`PortraitStage`: ảnh + vòng tròn + khung + thẻ + bìa ở các độ sâu `translateZ` khác nhau, nghiêng theo con trỏ / thanh cuộn, chỉ transform, tắt khi giảm chuyển động); khối Tủ sách là dải tối thứ hai đáy nét cọ, khối kế tiếp kéo lên dưới nét cọ bằng lề âm. Nội dung mẫu ở `src/config/profile.ts`; spec `docs/layout/trang-chu/`.**
  - **Hero Trang Book (`/book`, trước là Trang chủ) nền TỐI (Lộc duyệt 2026-10-11): dải `inverse` phẳng, KHÔNG ảnh nền, KHÔNG gradient, đáy cắt nét cọ `brush-bottom`; họa tiết chỉ dùng token (dòng kẻ ngang `on-inverse` 7% bằng SVG pattern, chữ "Đọc" khổng lồ chỉ có nét viền `on-inverse` 20%, vòng tròn phẳng `accent-warm` + vòng viền ở tablet / desktop; ngoại lệ họa tiết cho `accent-warm` phẳng); thanh đầu trang tông `inverse`; thẻ "Bài nổi bật" vẫn là bề mặt sáng nổi.**
  - **Form:** nhãn nổi (floating label) nằm trong ô, bay lên đè viền trên khi focus / đã nhập; nhãn luôn MỘT dòng, thông tin phụ ("Tùy chọn") là chữ riêng ở mép phải viền trên; hai ô cùng hàng phải thẳng hàng. Tương tác form xem `docs/design-system/EXTENSIONS.md`.
  - **Mỗi khi đổi quy ước giao diện (code + yêu cầu của Lộc): cập nhật CÙNG LÚC** CLAUDE.md mục 6, `docs/design-system/EXTENSIONS.md`, spec trang trong `docs/layout/`, `.claude/agents/design-reviewer.md`, và `docs/PLAN.md` — không chỉ sửa code.
  - Bắt buộc: chỉ `transform` + `opacity`; hover chỉ trên thiết bị có chuột; theo con trỏ chỉ khi `pointer: fine`; tắt khi `prefers-reduced-motion`; duration / spring lấy từ `src/lib/motion-tokens.ts` (CSS: biến `--motion-*`, `--ease-smooth`); nhấn nút thu về `0.95`; lớp tương tác nằm trong `src/components/ui/Motion.tsx` (client).
  Màu nhấn trùng màu mực nên liên kết trong bài LUÔN gạch chân; thứ bậc đến từ cỡ chữ, độ đậm, khoảng trắng.
- Component dùng đúng tên trong Design System (thêm `SectionHead`, `SocialIcons`, `ScrollMarquee`, `Breadcrumb` đã duyệt 2026-10-07; `PostCard`, `TopicCard`, `FeaturedPost`, `BookRef`, `Takeaways`, `Newsletter`, `SiteHeader`, `SiteFooter`, `Tag`);
  KHÔNG tự tạo component trùng vai trò. Thiếu component (phân trang, tìm kiếm, bình luận, trang tác giả — Known Gaps) → hỏi Lộc, đề xuất ghép từ component sẵn có.
- Chữ: tiêu đề và bài đọc serif, giao diện sans; không hạ line-height dưới giá trị token (dấu tiếng Việt); `prose-sm` từ 480px trở xuống.
- Lỗi form: biểu tượng + chữ giải thích cách sửa + viền dày; không báo lỗi chỉ bằng màu. Vòng focus bàn phím không bao giờ tắt.
- Bố cục trang bài: một cột, hoặc `guide` với `TOC` dính bên trái từ `bp-desktop` (1024px); dưới đó TOC thành khối trên thân bài.
- Mọi bài có `BookRef` ghi nguồn sách; ngày viết bằng chữ ("03 tháng 10, 2026") kèm thời gian đọc.
- Giá trị token và quy tắc chi tiết nằm trong `docs/design-system/`; khi CLAUDE.md và Design System lệch nhau về giao diện, báo Lộc, không tự chọn.
- Số CTA → tối đa 1 CTA chính mỗi khu vực
- CẤM: emoji, câu chữ sáo rỗng ("Nâng tầm", "Đột phá"), tên giả, chữ "Cuộn để khám phá"
- Font theo Design System (Source Serif 4 + Be Vietnam Pro, subset `vietnamese`, `next/font/google`).
- Responsive bắt buộc test đủ 5 mốc: 375px (mobile nhỏ), 414px (mobile lớn), 768px (tablet dọc), 1024px (tablet ngang), 1440px (desktop).
  Giữa các mốc: layout phải reflow mượt (fluid), không vỡ cột / tràn chữ ở bất kỳ điểm nào trong khoảng — không chỉ đúng tại 5 con số trên.
  Dùng chung điểm ngắt của Design System (`bp-phone` 480, `bp-tablet` 768, `bp-desktop` 1024, `bp-wide` 1120).
- Vùng bấm tối thiểu 44x44px (WCAG 2.5.5 / Apple HIG; ngoại lệ đã duyệt: hàng icon mạng xã hội ở Hero, chip nhỏ 36px mở rộng vùng bấm lên 44px). Khoảng cách tối thiểu giữa 2 vùng bấm liền kề: 8px
  (tránh bấm nhầm, nhất là các nút hành động gần nhau như Xóa cạnh Sửa).
- Vùng bấm chính (CTA, nút gửi, nút xác nhận) ưu tiên đặt trong thumb zone — 2/3 dưới màn hình trên mobile.
- Kiểm thử: Chrome DevTools responsive mode cho 5 mốc trên + bắt buộc test tay trên tối thiểu 1 thiết bị iOS thật
  và 1 thiết bị Android thật trước khi merge. Người xác nhận đạt: Lộc (chủ dự án).

## 7. SEO — bắt buộc mỗi trang
- `title`, meta `description`, Open Graph (Metadata API: `metadata` / `generateMetadata`)
- URL dạng slug không dấu
- Toàn site: `src/app/sitemap.ts` + `src/app/robots.ts`; bài `draft: true` không vào sitemap

## 8. Riêng cho Keystatic
- Giữ `keystatic.config.ts` khớp 100% với mục 5 (tên trường, kiểu dữ liệu, thư mục).
- Giai đoạn hiện tại chỉ dùng chế độ local. Chuyển sang GitHub mode là việc deploy → phải hỏi trước.
- Không commit secret của Keystatic/GitHub; chỉ để trong biến môi trường.

## 9. Công cụ
- **Subagents:** `design-reviewer`, `ui-tester` (Playwright), `content-editor`; dùng `Explore` khi cần đọc nhiều file.
- **Skills thiết kế:** `frontend-design-direction` (trước khi dựng trang mới), `make-interfaces-feel-better`,
  `frontend-a11y` (form, modal, menu), `motion-system` (khi thêm animation).
- **Plugin:** `feature-dev` cho tính năng lớn; `code-review` trước khi mở PR; `commit-commands` cho commit/PR.
- **MCP:** `github` (Issue, PR, đọc log CI), `playwright` (qua `ui-tester`), `context7` (tài liệu thư viện mới nhất — dùng khi viết code Next.js / Tailwind / Keystatic).
- Tên thật của công cụ có thể khác bản cài: nếu không tìm thấy, báo mình thay vì tự đoán.

## 10. Git & GitHub
- Repo: `aitosimple9-design/web_blog`. Nhánh chính: `main`.
- KHÔNG làm việc trực tiếp trên `main`. Mỗi Issue một nhánh theo `docs/WORKFLOW.md`.
- Commit nhỏ, theo Conventional Commits, có số Issue: `feat(home): thêm hero (#12)`.
- Mọi thay đổi code đi đường: nhánh trên máy → `git push` nhánh → Pull Request.
  Không ghi file trực tiếp lên GitHub qua API.
- Mô tả PR theo `.github/pull_request_template.md`, có `Closes #<số>`.
- Merge là việc của mình. Lệnh bị chặn bởi `.claude/settings.json` → báo mình, KHÔNG tìm cách lách.

## 11. Định nghĩa "xong" — kiểm tra trước khi mở PR
- [ ] `npm run lint` và `npm run build` không lỗi
- [ ] `ui-tester`: không vỡ giao diện ở 375 / 414 / 768 / 1024 / 1440px
- [ ] Vùng bấm ≥ 44x44px, cách nhau ≥ 8px; CTA chính nằm trong thumb zone trên mobile
- [ ] `design-reviewer`: không còn lỗi mức "phải sửa"
- [ ] Trang mới có đủ SEO ở mục 7
- [ ] Đã cập nhật checkbox trong `docs/PLAN.md`
- [ ] Đã nói rõ: thay đổi gì, ở file nào, cách tự kiểm tra

## 12. Không bao giờ
- Sửa hoặc xóa file trong `content/posts/` khi mình không yêu cầu rõ
- Sửa `.env*`, đưa secret vào code hoặc commit
- Tự cài thư viện, tự đổi phiên bản, tự deploy, tự merge
- Sửa `.github/workflows/` (chỉ soạn nội dung để mình commit)
- Chép nguyên văn đoạn dài từ sách vào bài viết
