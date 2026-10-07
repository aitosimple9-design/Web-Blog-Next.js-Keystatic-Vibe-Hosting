# Trang Chi tiết bài (ưu tiên số 1)

Mockup: `Main.dc.html` (cùng thư mục). Khối dùng chung (Nav, Newsletter, Footer, Slider): xem `../README.md`.
Một layout cho mọi chủ đề (không còn 3 layout theo danh mục).

## Thứ tự khối (từ trên xuống)
1. **Nav** — dải riêng, không đè lên nội dung
2. **ArticleHeader** — nhãn chủ đề, tiêu đề `h1` serif (2–3 dòng), dek (1–2 câu), meta "03 tháng 10, 2026 · 8 phút đọc"
3. **Thân bài** gồm 4 khối:
   - **TOC** — mục lục: nút "Mục lục ▾" mở/đóng; liệt kê các tiêu đề H2 và "Tổng kết"; mục đang đọc có trạng thái `on`
   - **Ảnh bìa bài** — tỉ lệ 3:2
   - **SourceBox** (= `BookRef`) — bìa sách 2:3, nhãn "Bài viết dựa trên", "Tên sách — Tác giả"
   - **Prose** — thân bài, khổ dòng 66ch; H2 là tiêu đề mục
4. **RelatedSlider** — "Bài liên quan. Đọc tiếp những bài cùng chủ đề."
5. **Newsletter** → 6. **Footer**

Dải nền: Nav (liền mép) · bài (`paper`) · bài liên quan (`paper-sunk`) · Newsletter (`paper`) · Footer (`paper-raised`).

## Thay đổi theo mốc
| Mốc | Tiêu đề | Mục lục | Ảnh bìa | SourceBox | Thân bài |
|---|---|---|---|---|---|
| 375 / 414 | căn trái | nút mở/đóng | rộng hết lề (24px) | dưới ảnh | 1 cột, lề 24px |
| 768 | căn trái | nút mở/đóng | rộng hơn thân bài, tràn đến mép khung | dưới ảnh | căn giữa, 66ch, lề 32px |
| 1024 | căn trái | **cột dính (sticky) bên trái** | trong cột phải, phía trên thân bài | trong cột phải, trên thân bài | cột phải |
| 1440 | **căn giữa phía trên** (nhãn, tiêu đề lớn, dek, meta) | cột dính bên trái | nằm trên thân bài | **cột phải** | 3 cột: TOC dính · Prose 66ch · SourceBox |

- Khung nội dung tối đa 1120px; hai bên là khoảng trống, dải nền tràn hết chiều rộng.
- Nav: ☰ ẩn từ 768; ô tìm kiếm mở rộng từ 1024.

### RelatedSlider
- Thẻ: nhãn chủ đề, tiêu đề `h3`, 2 dòng tóm tắt, "6 phút đọc", bìa sách 2:3. Các thẻ xen kẽ hai kiểu nền (tối / sáng) — dùng `inverse` và `paper-raised`.
- 375: 1 thẻ rộng 272px, lộ mép thẻ kế · 768: 300px (~2 thẻ) · 1024: 320px (~3 thẻ) · 1440: hàng tràn ra mép phải khung, thẻ cuối vẫn cuộn vào đủ.
- Có chấm vị trí và ‹ › (xem `../README.md`).

## Component cần dựng
`ArticleHeader`, `TOC` (nút + cột dính), `SourceBox`/`BookRef`, `Prose`, `Slider` + `RelatedCard`, `Newsletter`, `SiteHeader`, `SiteFooter`.

## Dữ liệu lấy từ bài viết (`src/lib/posts.ts`)
`title`, `description` (dek), `category`, `date`, `source.book`, `source.author`, `cover`; thời gian đọc và mục lục tính từ nội dung (H2).
Bài liên quan: cùng `category`, trừ bài hiện tại, bỏ `draft: true`.

## Lưu ý kiểm tra
- Mục lục mở/đóng bằng bàn phím (`aria-expanded`); liên kết nhảy tới đúng mục (cần `id` trên H2).
- Ảnh bìa và bìa sách có `width`/`height` hoặc `aspect-ratio` để không nhảy bố cục.
- CTA chính của trang là nút "Đăng ký" trong Newsletter; không thêm CTA chính thứ hai.
- Cả hai theme Giấy và Đêm; 5 mốc test + các điểm giữa (ví dụ 600, 900, 1200px).
