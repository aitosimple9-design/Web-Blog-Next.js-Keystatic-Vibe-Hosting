# Trang chủ (trang đích từ quảng cáo)

Mockup: `Home.dc.html` (cùng thư mục). Khối dùng chung (Nav, Newsletter, Footer, Slider): xem `../README.md`.

## Thứ tự khối
1. **Dải Hero** (`paper-sunk`, chứa cả Nav)
   - Tiêu đề `h1`: "Điều đọng lại sau mỗi cuốn sách" (xuống dòng ở màn hình hẹp)
   - **FeaturedPost** — ảnh bài nổi bật, bấm được cả khối; lớp chữ: nhãn "Bài nổi bật", tiêu đề, mũi tên
   - Dek: "Mỗi bài ghi chép một cuốn sách: ý chính, ví dụ và cách áp dụng."
   - **CTA chính duy nhất:** nút "Đọc bài mới nhất"
   - "Theo dõi" + 7 icon mạng xã hội (YouTube, TikTok, Facebook, Instagram, LinkedIn, X, Zalo)
   - **Số liệu:** 120+ Bài viết · 5 Chủ đề · 80+ Cuốn sách (tính từ nội dung, không viết cứng)
2. **TopicSlider** (`paper`) — "Chủ đề" + dek "Chọn một chủ đề để đọc các bài ghi chép liên quan. Vuốt ngang để xem thêm."
   - Thẻ chủ đề: icon, tên, mô tả 2 dòng, "12 bài", nút "Xem bài →"
3. **LatestGrid** (`paper-sunk`) — "Bài viết mới nhất" + dek "Những bài ghi chép mới đăng gần đây."
   - Lưới bento: 4 **PostTile** (ảnh, nhãn chủ đề, tiêu đề 2 dòng, "03 tháng 10, 2026 · 12 phút đọc") + 1 **StatTile** ("120+ Bài viết đã đăng" + nút "Xem tất cả →")
4. **Newsletter** (`paper`) → 5. **Footer** (`paper-raised`)

## Thay đổi theo mốc
| Mốc | Hero | TopicSlider | LatestGrid |
|---|---|---|---|
| 375 / 414 | 1 cột: tiêu đề, ảnh vuông, chữ + CTA, hàng 7 icon, 3 số liệu | trượt ngang, 1 thẻ, lộ mép thẻ kế; 5 chấm | 1 cột, mỗi ô cao 240px |
| 768 | 2 cột: ảnh 4:5 trái; chữ + CTA + số liệu phải; lề 32px | khoảng 2,5 thẻ; 4 chấm | 2 cột, ô đầu cao hai hàng |
| 1024 | 3 cột: chữ + CTA + icon \| ảnh \| 3 số liệu xếp dọc; tiêu đề hai dòng đè lên mép trên ảnh; ô tìm kiếm mở rộng | **4 thẻ hiện đủ, không lòi mép**; ‹ › trượt từng thẻ để xem thẻ thứ 5; 2 chấm | 4 cột: 2 ô cao, 1 ô rộng, ô số liệu, 1 ô thường |
| 1440 | như 1024; cột chữ 340px, cột số liệu 220px; khung 1120px, dải nền tràn | 4 thẻ, rộng thêm | như 1024, rộng hơn |

- Nút ‹ bị khóa ở đầu, › bị khóa ở cuối; chấm và nút cập nhật khi cuộn.
- Newsletter: xem `../README.md` (375 xếp dọc · 768 Họ tên + SĐT cùng hàng · 1024 chữ trái, form phải).
- Footer: 375 xếp dọc · 768+ logo · menu · icon trên một hàng.

## Component cần dựng
`Hero` (+ `FeaturedPost`), `StatBlock`, `SocialIcons`, `Slider` + `TopicCard` (biến thể icon + nút), `LatestGrid` + `PostTile` + `StatTile`, `Newsletter`, `SiteHeader`, `SiteFooter`.

## Dữ liệu
- Bài nổi bật: bài mới nhất (hoặc đánh dấu nổi bật — cần trường mới nếu Lộc muốn; hiện chưa có trong cấu trúc bài, hỏi trước khi thêm).
- Chủ đề + số bài mỗi chủ đề: từ cấu hình danh mục (Q7) và đếm bài `draft: false`.
- Số liệu Hero và StatTile: đếm từ nội dung.

## Lưu ý kiểm tra
- Một CTA chính ở Hero ("Đọc bài mới nhất"); "Xem bài", "Xem tất cả", "Đăng ký" là nút phụ/khu vực khác (mỗi khu vực tối đa 1 CTA chính).
- Hero trên mobile: CTA có nằm trong thumb zone (2/3 dưới) khi tải trang? Thứ tự mockup đặt CTA sau ảnh, kiểm tra ở 375 và 414.
- 7 icon: nút 44x44px cách nhau ≥ 8px (hàng 7 icon ở 375px: 7×44 + 6×8 = 356px, vượt chiều rộng khả dụng 327px của khung 375 có lề 24px ⇒ phải xuống 2 hàng hoặc cuộn; Lộc chốt).
- Cả hai theme; 5 mốc + điểm giữa.
