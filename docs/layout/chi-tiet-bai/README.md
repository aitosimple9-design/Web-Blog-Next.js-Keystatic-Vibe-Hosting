# Trang Chi tiết bài (ưu tiên số 1)

Mockup gốc: `Main.dc.html` (cùng thư mục). Khối dùng chung (Nav, Newsletter, Footer, Slider): xem `../README.md`.
Một layout cho mọi chủ đề (không còn 3 layout theo danh mục).

> **Đã chỉnh so với wireframe gốc (Lộc yêu cầu 2026-10-07):** (1) ảnh bìa bài thành **HERO tràn hết bề ngang** ở đầu trang, chữ tiêu đề nằm giữa ảnh;
> (2) nền thẻ **Bài liên quan** là hình chữ nhật DỌC 3:4 bo góc (bố cục bên trong giữ như wireframe). Spec dưới đây là bản ĐANG ÁP DỤNG; khi lệch với `Main.dc.html` thì theo spec này.

## Thứ tự khối (từ trên xuống)
1. **Nav** — dải riêng, dính trên cùng
2. **Hero** — ảnh bìa bài **tràn hết bề ngang** (cao tối thiểu `clamp(560px, 52vw, 680px)`), trôi chậm hơn nội dung khi cuộn (thị sai),
   ảnh "bay" mượt từ thẻ bài sang đây khi bấm (View Transition). **Cập nhật 2026-10-07 (Lộc yêu cầu):** nhãn chủ đề, tiêu đề `h1` serif (hiện từng chữ), dek, meta "03 tháng 10, 2026 · 8 phút đọc" nằm
   **chính giữa trên ảnh** (căn giữa ngang và dọc), KHÔNG có khối nền riêng bên dưới. Ảnh phủ lớp `inverse` 62% (màu phẳng) để chữ `on-inverse` đọc rõ (ngoại lệ chữ trên ảnh thứ bảy).
   Đáy ảnh cắt bằng mask nét cọ (lớp `brush-bottom`).
   Các dòng nhãn / tiêu đề / mô tả / ngày cách nhau `space-5`. **Breadcrumb:** căn giữa, neo gần ĐÁY ảnh hero (cách mép cọ `space-4`), tách xa khối chữ phía trên (tông tối `inverse`): "Trang chủ › Blog › {chủ đề} › {tên bài}", mục hiện tại là pill trong mờ.
3. **Thân bài** gồm 3 khối:
   - **TOC** — mục lục (thiết kế lại 2026-10-07): dạng trục dọc mảnh có nút mốc đánh số "01, 02…"; đoạn đã đọc phủ màu `accent`, mục đang đọc có nút to + vòng sáng + số màu `accent-warm` + chữ đậm; tiêu đề cột có dấu thoi `accent-warm` và số mục. Dưới 1024px (cập nhật 2026-10-10): KHÔNG còn nút pill riêng; mục lục là hàng "Mục lục · N ▾" nằm TRONG thẻ chung với nguồn sách, bấm xổ danh sách ngay trong thẻ (`TOC variant="inline"`). Từ 1024px: cột dính bên trái (`variant="sidebar"`; sticky đặt ở `<nav>`, phần cuộn nội bộ có đệm 8px để không cắt nút mốc tròn)
   - **SourceBox** (= `BookRef`, thiết kế lại 2026-10-07) — bìa sách làm NỀN cả khối (phóng to, lấy phần hình phía trên; phủ `inverse` 45%), bo `radius-lg`, `elevated-md`; huy hiệu pill "Bài viết dựa trên" ở trên, tên sách + tác giả nằm thẳng trên bìa ở đáy. Chỉ ở cột phải (1280+): thẻ đứng tỉ lệ 3:4. Dưới 1280px (cập nhật 2026-10-10): dạng DẢI NGANG (`variant="strip"`), bìa nhỏ đúng tỉ lệ 2:3 (56px; 64px từ 768) bên trái + "Bài viết dựa trên" / tên sách / tác giả bên phải, khung LÕM vào nền (`inset-sunk`, nền `paper`, không viền, hover / nhấn co lại `inset-sunk-pressed`); bìa KHÔNG còn phóng làm nền ở khung ngang vì bị cắt, trông như biến dạng. Dưới 1024px dải này chung thẻ với hàng "Mục lục" (cao khoảng 163px khi thu gọn, trước đó hai khối cao khoảng 290px)
   - **Prose** — thân bài, khổ dòng 66ch; H2 là tiêu đề mục
4. **RelatedSlider** — tiêu đề nổi bật hơn (`display-lg`, phần "Đọc tiếp…" cỡ `display-md`, giữ căn trái, từ 768px luôn nằm MỘT hàng) kèm đường kẻ họa tiết hình thoi `accent-warm` căn trái bên dưới (`Ornament align="left"`): "Bài liên quan. Đọc tiếp những bài cùng chủ đề." Thẻ 3:4: ảnh bài màu gốc tràn cả thẻ phủ `inverse` 55% (không xen kẽ đen / trắng nữa), chữ `on-inverse` nằm thẳng trên ảnh, giữ bố cục wireframe (nhãn, tiêu đề, bìa sách demo nhỏ, tóm tắt, thời gian đọc), lơ lửng `elevated-lg` (hover nhấc lên); track chừa đệm dưới ≈128px (kéo lại bằng lề âm) và đệm trái để bóng không bị cắt.
5. **Newsletter** → 6. **Footer**
- Thanh tiến độ đọc 3px (màu nhấn) cố định ở mép trên cửa sổ.

Dải nền: Nav (paper, viền dưới) · hero (ảnh) · thân bài (`paper`) · bài liên quan (`paper-sunk`) · Newsletter (`paper`) · Footer (`paper-raised`).

## Thay đổi theo mốc
| Mốc | Hero | Khối tiêu đề | Mục lục | SourceBox | Thân bài |
|---|---|---|---|---|---|
| 375 / 414 | ảnh tràn, cao ~ `46vw` (tối thiểu 240px) | căn trái, lề 24px, gối lên ảnh `space-8` | hàng xổ trong thẻ chung | thẻ chung (dải ngang) trên thân bài | 1 cột, lề 24px |
| 768 | như trên | **căn giữa**, rộng tối đa 896px, gối `space-9` | hàng xổ trong thẻ chung | thẻ chung (dải ngang) trên thân bài | căn giữa, 66ch, lề 32px |
| 1024 | ảnh tràn, cao ~ 470px | như 768 | **cột dính (sticky) bên trái** | dải ngang trong cột thân bài, trên thân bài | cột phải |
| 1280+ | ảnh tràn, tối đa 600px | như 768 | cột dính bên trái | **cột phải**, dính | 3 cột: TOC 180px · Prose 66ch · SourceBox |

- Khung nội dung tối đa 1120px; ảnh hero KHÔNG bị giới hạn (tràn hết chiều rộng màn hình).
- Nav: ☰ ẩn từ 768; ô tìm kiếm mở rộng từ 1024.

### RelatedSlider — nền thẻ HÌNH CHỮ NHẬT DỌC 3:4
- **Nền thẻ:** hình chữ nhật dọc tỉ lệ **3:4**, bo góc `radius-lg` (16px), xen kẽ nền tối (`inverse`) / sáng (`paper-raised`).
- **Bố cục bên trong (giữ đúng wireframe, không đổi):** hàng trên gồm nhãn chủ đề (chữ viết hoa nhỏ) + tiêu đề (tối đa 3 dòng) bên trái và bìa sách nhỏ bên phải; hàng dưới gồm tóm tắt 2 dòng và "6 phút đọc".
- Rộng: 375 → 272px (lộ mép thẻ kế) · 768 → 300px · 1024+ → 320px (cao = rộng × 4/3) · hàng tràn ra mép phải màn hình, thẻ cuối vẫn cuộn vào đủ.
- **Hover:** thẻ nhấc lên 8px. Bấm được cả thẻ (một liên kết duy nhất, phủ cả thẻ).
- Có chấm vị trí và ‹ › (xem `../README.md`).

## Component cần dựng
`ArticleHero` (ảnh + khối tiêu đề), `ArticleHeader`, `TOC` (nút + cột dính), `SourceBox`/`BookRef`, `Prose`, `Slider` + `RelatedCard`, `ScrollProgress`, `Newsletter`, `SiteHeader`, `SiteFooter`.

## Dữ liệu lấy từ bài viết (`src/lib/posts.ts`)
`title`, `description` (dek), `category`, `date`, `source.book`, `source.author`, `cover`; thời gian đọc và mục lục tính từ nội dung (H2).
Bài liên quan: cùng `category`, trừ bài hiện tại, bỏ `draft: true`. Bài chưa có `cover` dùng `CoverArt` (ảnh nghệ thuật sinh từ slug).

## Lưu ý kiểm tra
- Mục lục mở/đóng bằng bàn phím (`aria-expanded`); liên kết nhảy tới đúng mục (cần `id` trên H2).
- Ảnh hero và thẻ liên quan có khung tỉ lệ cố định để không nhảy bố cục.
- CTA chính của trang là nút "Đăng ký" trong Newsletter; không thêm CTA chính thứ hai.
- Hero + khối tiêu đề: tương phản đạt ở cả hai theme (khối tiêu đề nền đặc nên chữ không phụ thuộc ảnh).
- Cả hai theme Giấy và Đêm; 5 mốc test + các điểm giữa (ví dụ 600, 900, 1200px).
