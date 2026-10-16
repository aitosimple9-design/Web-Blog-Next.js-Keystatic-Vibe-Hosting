# Trang chủ (thương hiệu cá nhân)

Mockup: `Intro.dc.html` (cùng thư mục). Route `/`. Nội dung chỉnh MỘT chỗ: `src/config/profile.ts` (chữ [mẫu] chờ Lộc thay; chỉ tên "Trần Ngọc Hoàng Ni" là thật). Trang Book (Trang chủ cũ) ở `/book`: `../book/README.md`. Khối dùng chung: `../README.md`.
Mục tiêu: người đọc tin người viết trước khi đăng ký. CTA chính DUY NHẤT của cả trang: nút "Đăng ký nhận bài" ở Hero, cuộn tới form `Newsletter` (`#dang-ky`).
Menu: Trang chủ · Book · Blog (`navGroups`, icon `home` / `book` / `blog`).

## Thứ tự khối
1. **Hero** (`PersonHero`, bố cục TRUNG TÂM; thiết kế lại lần 2 ngày 2026-10-11 theo 2 ảnh tham khảo của Lộc: tên khổng lồ sau người + thẻ kính mờ; không dùng ý tưởng sách). Dải tối `inverse`, đáy `brush-bottom`, chứa Nav tông `inverse`; nền `PersonBackdrop` (tĩnh): các đường dọc mảnh như cột lưới `on-inverse` 7%.
   - **Chân dung xóa phông ở giữa**: ảnh WebP nền trong suốt `public/images/profile/portrait-cutout.webp` (người ngồi quay thẳng, tỉ lệ 1100x1587), bề rộng `--pw` = clamp(15rem, 41vw, 30rem); đáy cắt bằng nét cọ (`brush-bottom`); chấm tròn phẳng `accent-warm` (≈ 0,92 bề rộng người) nằm sau thân người.
   - **Tên khổng lồ SAU người** (`HeroName`, là `h1` thật, `aria-label` đọc nguyên tên): hai hàng, mỗi hàng hai chữ in hoa serif: "TRẦN NGỌC" chữ đặc, "HOÀNG NI" chỉ nét viền `on-inverse`; từ 768px khoảng giữa mỗi hàng rộng bằng đầu (0,5 bề rộng người) / vai (0,82) nên người che đúng khoảng trống giữa hai chữ (ý tưởng bìa tạp chí); dưới 768px tên xếp nguyên chữ phía trên người (không bị che). Hiệu ứng: từng chữ cái trượt lên từ sau mặt nạ (CSS `anim-word`, một lần, bắt đầu 650ms), sau đó tên trôi ngược chiều với người theo con trỏ (`PointerLayer` -18) và theo thanh cuộn (`Drift` 0 → -56px).
   - **Cánh cửa mở đầu trang** (`HeroCurtain`, thay cho video vì video nặng và chậm trang quảng cáo): hai cánh `inverse` phủ kín Hero, mang "T·N" | "H·N", xoay quanh mép ngoài về phía người xem tới 100° (CSS `anim-door-l/r`, 1,5s, MỘT lần, bắt đầu 250ms) để lộ Hero; người phóng nhẹ từ 1,08 về 1 (`anim-person`); aria-hidden, không nhận chuột; nội dung thật luôn nằm sẵn bên dưới.
   - **Chữ + CTA**: định vị (1 câu) · nút chính "Đăng ký nhận bài" (`#dang-ky`) · "Theo dõi mình" + `SocialIcons featured="zalo" onDark`. 1024+: góc dưới trái (rộng ≤ 22rem); dưới 1024px: dưới sân khấu, căn giữa.
   - **Thẻ kính mờ** (glass: `backdrop-blur-md`, nền `on-inverse` 10%, viền `on-inverse` 25%, `elevated-md`; mở rộng đã duyệt): "21+ Bài viết", "5 Chủ đề" (`CountUp`, đếm từ nội dung thật). 1024+: góc dưới phải xếp dọc; dưới 1024px: lưới 2 cột dưới chữ. Không có hàng avatar / số người dùng giả.
   - Cả cảnh nghiêng ±2,5° theo con trỏ (`PointerScene`, chỉ `pointer: fine`); chỉ `transform` + `opacity`; bật giảm chuyển động thì cửa mở sẵn, không nghiêng / trôi.
2. **Câu chuyện** (`StorySection`, `paper`): nhãn, `h2`, ảnh thứ hai, 4 đoạn `prose-article` (66ch). Ảnh trôi chậm (`ScrollParallax`).
3. **Cách mình đọc** (`PrincipleCards`, `paper-sunk`): `SectionHead` + 4 thẻ nguyên tắc đánh số (số `accent-warm`, `surface-raised`, `elevated-md`).
4. **Con số** (`paper`): bài viết · cuốn sách · chủ đề, `CountUp`, đếm từ nội dung thật (`getSiteStats`).
5. **Tủ sách của mình** (`BookShelf`, dải tối `inverse`, đáy `brush-bottom`): `Slider` các `BookCover`, mỗi bìa bấm sang `/blog/<chủ đề>`.
6. **Bài tiêu biểu** (`paper-sunk`, kéo lên dưới nét cọ của Tủ sách bằng lề âm để nền tràn tới mép cọ): 3 `PostCard variant="tile"` (3 bài mới nhất) + liên kết "Xem tất cả bài viết".
7. **Kết nối** (`paper`): lời mời + `SocialIcons` (7 icon) → **Newsletter** (`#dang-ky`) → Footer.
Chỗ chừa (chưa dựng, thêm sau không phải thiết kế lại): Hành trình (timeline) sau khối 2; Lời chứng thực và "Làm việc cùng tôi" sau khối 6. Lời chứng thực chỉ dùng khi thật và có đồng ý; "Làm việc cùng tôi" cạnh tranh CTA chính nên cân nhắc.

## Thay đổi theo mốc
| Mốc | Hero | Câu chuyện | Cách mình đọc | Tủ sách | Bài tiêu biểu |
|---|---|---|---|---|---|
| 375 / 414 | 1 cột căn giữa: chân dung (≤ 19rem), tên, định vị, nút, icon | tiêu đề, ảnh 3:2, chữ | 1 cột | ~2,3 bìa | 1 cột |
| 768 | 2 cột: chân dung trái, chữ phải căn trái | ảnh rộng trên, chữ 66ch căn giữa | lưới 2×2 | ~4,4 bìa | thẻ đầu rộng 2 cột, hai thẻ dưới |
| 1024 | chữ trái, chân dung lớn (≤ 28rem) phải | 2 cột: chữ trái, ảnh 4:5 dính bên phải | 4 thẻ một hàng | 5 bìa, ‹ › tới bìa 6 | 3 thẻ một hàng |
| 1440 | như 1024, khung 1120px; dải nền tràn | như 1024 | như 1024 | như 1024 | như 1024 |

## SEO
`title` "<Tên> — <tagline>", meta description = câu định vị, Open Graph `profile`, canonical `/`, JSON-LD `Person` (trong `page.tsx`).

## Ảnh
Chân dung demo: ảnh Pexels của Eugene Lisyuk (giấy phép Pexels, miễn phí), xóa phông cục bộ bằng `rembg` (model `isnet-general-use`), xuất WebP nền trong suốt 1100px; ghi nguồn ở `public/images/CREDITS.md`. Ảnh thứ hai (khối Câu chuyện): `vintage-book-sofa.jpg` (CC BY 2.0, phải ghi công khi đăng thật). Thay bằng ảnh thật của Lộc: ảnh người ngồi quay thẳng, ĐÃ xóa phông (PNG / WebP nền trong suốt, tỉ lệ ≈ 0,69), sửa đường dẫn ở `src/config/profile.ts`.

## Ghi chú kiểm tra
- Ảnh chân dung cắt dọc 3:4 từ ảnh ngang bằng `object-position` (`profile.portrait.position`).
- Hydration warning của `Newsletter` (PointerScene, `useReducedMotion`) có từ trước, không thuộc trang này.

## Cập nhật 2026-10-12: chiều sâu cho Hero + ảnh chân dung của Lộc
- Ảnh chân dung: ảnh Lộc cung cấp (đã tách nền), `portrait-cutout.webp` 844x866, đầu căn giữa khung; tỉ lệ `--ph = --pw × 1.026`.
- Chiều sâu: cả cảnh lùi xa rồi tiến lại (`anim-dolly`, translateZ + scale, 2,2s); hai cánh cửa xoay ra phía người xem, mép trong viền `accent-warm`, ánh sáng ấm lộ ở khe giữa rồi tan (`anim-light`); vành elip `accent-warm` quấn quanh thân (nửa sau nằm sau người, nửa trước đè lên người), trôi theo con trỏ ở độ sâu khác nhau. Chỉ transform + opacity, nét phẳng, không gradient.


> 2026-10-16: nội dung trang này sửa được ở Keystatic (Trang → Trang chủ, `content/pages/trang-chu.json`, đọc qua `src/lib/pages.ts`); `src/config/profile.ts` chỉ còn là nội dung mẫu mặc định. Tủ sách để trống = ẩn khối (khối Bài tiêu biểu khi đó không kéo lên dưới nét cọ).
