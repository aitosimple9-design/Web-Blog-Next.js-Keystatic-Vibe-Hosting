# Trang Book (trước 2026-10-11 là "Trang chủ")

Mockup: `Home.dc.html` (cùng thư mục). Route: `/book`. Từ 2026-10-11 Trang chủ `/` là trang thương hiệu cá nhân (`../trang-chu/`). Khối dùng chung (Nav, Newsletter, Footer, Slider): xem `../README.md`.

## Thứ tự khối
1. **Dải Hero** (cập nhật 2026-10-11: nền TỐI `inverse`, không ảnh nền, đáy cắt nét cọ `brush-bottom`, chứa cả Nav tông `inverse`). Họa tiết nền (`HeroBackdrop`, aria-hidden, chỉ token): dòng kẻ ngang mảnh như trang vở, chữ "Đọc" khổng lồ chỉ có nét viền ở đáy trái, vòng tròn phẳng `accent-warm` kèm vòng viền lệch tâm (chỉ từ 768px, dưới đó ẩn vì đè lên tiêu đề); trôi nhẹ theo thanh cuộn (transform), tắt khi giảm chuyển động. Chữ dùng `on-inverse` / `on-inverse-soft`, nút CTA biến thể `on-inverse`, nút Zalo đảo màu (`SocialIcons onDark`)
   - Tiêu đề `h1`: "Điều đọng lại sau mỗi cuốn sách" (xuống dòng ở màn hình hẹp)
   - **FeaturedPost** — ảnh bài nổi bật, bấm được cả khối; lớp chữ: nhãn "Bài nổi bật", tiêu đề, mũi tên
   - Dek: "Mỗi bài ghi chép một cuốn sách: ý chính, ví dụ và cách áp dụng."
   - **CTA chính duy nhất:** nút "Đọc bài mới nhất"
   - "Theo dõi" + 7 icon | ảnh 3:4 (rộng tối đa 21rem, căn giữa cột) | 3 sốmạng xã hội (YouTube, TikTok, Facebook, Instagram, LinkedIn, X, Zalo): MỘT hàng duy nhất ở mọi mốc; Zalo nằm chính giữa, to nhất (60px, icon 32px, luôn có nền gradient + vòng ngoài `accent-warm`); 6 chip còn lại nhỏ 36px (icon 20px, vùng bấm mở rộng đủ 44px); hover nhấc lên, nền gradient hiện dần, nhãn tên nền tảng nổi phía trên; URL demo ở `src/config/site.ts`
   - **Số liệu:** 120+ Bài viết · 5 Chủ đề · 80+ Cuốn sách (tính từ nội dung, không viết cứng)
1b. **Dải chữ** (`paper`, viền kẻ trên và dưới): "Đọc · Ghi chép · Suy ngẫm · Áp dụng · Nhớ lâu", cỡ `display-sm`, dấu phân cách hình thoi `accent-warm`; tự trôi chậm 60s, dừng khi rê chuột, tắt khi giảm chuyển động.
2. **TopicSlider** (`paper`) — tiêu đề mục (`SectionHead`: căn giữa, tiêu đề `display-lg`, dek chữ sans `ui-body` màu `ink-faint`, đường kẻ họa tiết hình thoi) "Chủ đề" + dek "Chọn một chủ đề để đọc các bài ghi chép liên quan. Vuốt ngang để xem thêm."
   - Thẻ chủ đề: icon, tên, mô tả 2 dòng, "12 bài", nút "Xem bài →"
3. **LatestGrid** (`paper-sunk`) — tiêu đề mục `SectionHead` như trên, "Bài viết mới nhất" + dek "Những bài ghi chép mới đăng gần đây."
   - Lưới bento: 4 **PostTile** (vùng ảnh (bo `radius-md`, nổi `elevated-md`) kéo xuống phủ cả phần chữ, phủ `inverse` 65%, chữ nằm thẳng trên ảnh, nhãn chủ đề là huy hiệu pill trong mờ giống huy hiệu số bài ở thẻ chủ đề (đệm `space-5`, các dòng cách nhau `space-4`, giãn dòng tiêu đề 1,5), không có thẻ bao: nhãn chủ đề, tiêu đề 2 dòng, "03 tháng 10, 2026 · 12 phút đọc") + 1 **StatTile** ("120+ Bài viết đã đăng" + nút "Xem tất cả →")
4. **Newsletter** (`paper`) → 5. **Footer** (`paper-raised`)

## Thay đổi theo mốc
| Mốc | Hero | TopicSlider | LatestGrid |
|---|---|---|---|
| 375 / 414 | 1 cột: tiêu đề,icon | ảnh 3:4 (rộng tối đa 21rem, căn giữa cột) | 3 số(rộng tối đa 22rem, căn giữa), chữ + CTA, hàng 7 icon (Zalo giữa, to nhất), 3 số liệu | trượt ngang, 1 thẻ, lộ mép thẻ kế; 5 chấm | 1 cột, mỗi ô cao 320px |
| 768 | 2 cột:icon | ảnh 3:4 (rộng tối đa 21rem, căn giữa cột) | 3 số(rộng tối đa 22rem) trái; chữ + CTA + số liệu phải; lề 32px | khoảng 2,5 thẻ; 4 chấm | 2 cột, ô đầu cao hai hàng |
| 1024 | 3 cột: chữ + CTA + icon | ảnh 3:4 (rộng tối đa 21rem, căn giữa cột) | 3 số\| ảnh 3:4 \| 3 số liệu xếp dọc; tiêu đề hai dòng đè lên mép trên ảnh; ô tìm kiếm mở rộng | **4 thẻ hiện đủ, không lòi mép**; ‹ › trượt từng thẻ để xem thẻ thứ 5; 2 chấm | 4 cột: 2 ô cao, 1 ô rộng, ô số liệu, 1 ô thường |
| 1440 | như 1024; cột chữ 340px, cột số liệu 220px; khung 1120px, dải nền tràn | 4 thẻ, rộng thêm | như 1024, rộng hơn |

- Thanh trượt chủ đề chừa đệm dưới ≈128px (kéo lại bằng lề âm) và đệm hai bên để bóng thẻ không bị cắt; ảnh ô "Bài viết mới nhất" nổi nhẹ `elevated-md`.
- Nút ‹ bị khóa ở đầu, › bị khóa ở cuối; chấm và nút cập nhật khi cuộn.
- Newsletter: xem `../README.md` (375 xếp dọc · 768 Họ tên + SĐT cùng hàng · 1024 chữ trái, form phải).
- Footer: 375 xếp dọc · 768+ logo · menu · icon | ảnh 3:4 (rộng tối đa 21rem, căn giữa cột) | 3 sốtrên một hàng.

## Component cần dựng
`Hero` (+ `FeaturedPost`), `StatBlock`, `SocialIcons`, `SectionHead` (tiêu đề mục căn giữa + họa tiết), `ScrollMarquee` (dải chữ), `Slider` + `TopicCard` (thẻ dọc tỉ lệ 3:4 (tên · mô tả · nút cách đều nhau `space-4`): ảnh theo chủ đề từ `content/topics/*.json` tràn cả thẻ, phủ `inverse` 65%; chip số thứ tự nền đặc góc trên; số bài là huy hiệu pill (viền mảnh, nền `on-inverse` 15%, số đậm); tên · số bài · mô tả · nút nằm thẳng trên ảnh ở đáy thẻ, không khung bó; lơ lửng `elevated-lg`, hover nhấc + ảnh phóng + lớp phủ nhạt đi), `LatestGrid` + `PostTile` + `StatTile`, `Newsletter`, `SiteHeader`, `SiteFooter`.

## Dữ liệu
- Bài nổi bật: bài mới nhất (hoặc đánh dấu nổi bật — cần trường mới nếu Lộc muốn; hiện chưa có trong cấu trúc bài, hỏi trước khi thêm).
- Chủ đề + số bài mỗi chủ đề: từ cấu hình danh mục (Q7) và đếm bài `draft: false`.
- Số liệu Hero và StatTile: đếm từ nội dung.

## Lưu ý kiểm tra
- Một CTA chính ở Hero ("Đọc bài mới nhất"); "Xem bài", "Xem tất cả", "Đăng ký" là nút phụ/khu vực khác (mỗi khu vực tối đa 1 CTA chính).
- Hero trên mobile: CTA có nằm trong thumb zone (2/3 dưới) khi tải trang? Thứ tự mockup đặt CTA sau ảnh, kiểm tra ở 375 và 414.
- 7 icon: nút 44x44px cách nhau ≥ 8px (hàng 7 icon | ảnh 3:4 (rộng tối đa 21rem, căn giữa cột) | 3 sốở 375px: 7×44 + 6×8 = 356px, vượt chiều rộng khả dụng 327px của khung 375 có lề 24px ⇒ phải xuống 2 hàng hoặc cuộn; Lộc chốt).
- Cả hai theme; 5 mốc + điểm giữa.


> 2026-10-16: chữ của trang này sửa được ở Keystatic (menu Trang, file content/pages/*.json, đọc qua `src/lib/pages.ts`); chữ mặc định ở `src/config/page-texts.ts`.
