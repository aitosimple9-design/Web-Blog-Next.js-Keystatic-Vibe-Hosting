# Trang chủ (thương hiệu cá nhân)

Mockup: `Intro.dc.html` (cùng thư mục). Route `/`. Nội dung chỉnh MỘT chỗ: `src/config/profile.ts` (chữ [mẫu] chờ Lộc thay; chỉ tên "Trần Ngọc Hoàng Ni" là thật). Trang Book (Trang chủ cũ) ở `/book`: `../book/README.md`. Khối dùng chung: `../README.md`.
Mục tiêu: người đọc tin người viết trước khi đăng ký. CTA chính DUY NHẤT của cả trang: nút "Đăng ký nhận bài" ở Hero, cuộn tới form `Newsletter` (`#dang-ky`).
Menu: Trang chủ · Book · Blog (`navGroups`, icon `home` / `book` / `blog`).

## Thứ tự khối
1. **Hero** (`PersonHero`, dải tối `inverse`, đáy `brush-bottom`, không ảnh nền, chứa Nav tông `inverse`; thiết kế lại 2026-10-11, KHÔNG dùng ý tưởng sách). Nền = `PersonBackdrop` (tĩnh): các đường dọc mảnh như cột lưới `on-inverse` 7% + chấm tròn phẳng `accent-warm` (từ 768px).
   - Chữ: nhãn "Xin chào, mình là" · `h1` tên · định vị (1 câu) · nút "Đăng ký nhận bài" · "Theo dõi mình" + `SocialIcons featured="zalo" onDark`.
   - **Chân dung "cánh cửa gập" 3D** (`GatefoldStage`, ý tưởng bìa đĩa than gập đôi): lúc vào trang là tấm bìa đóng kín (hai nửa `paper-raised`, chữ cái đầu "T·N" / "H·N" + tên); sau 0,7s hai cánh xoay quanh mép ngoài về phía người xem tới 100° (CSS `anim-door-l/r`, 1,5s, MỘT lần, không lặp) để lộ ảnh 3:4 `radius-lg`; mặt sau cánh cửa `accent-warm` phẳng; tấm nền `accent-warm` lệch xuống phải ở sau ảnh; hai thẻ số liệu `surface-raised` (Bài viết, Chủ đề, đếm từ nội dung) nổi phía trước, hiện sau khi cửa mở. Độ sâu `translateZ`: nền -60, ảnh 0, cửa 24, thẻ 70; `perspective` 2200px. Sau khi mở, khối nghiêng ±10° / ±7° theo con trỏ (chỉ `pointer: fine`) và xoay thêm theo thanh cuộn (cả cảm ứng). Chỉ `transform` + `opacity`; bật giảm chuyển động thì cửa mở sẵn, không nghiêng.
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
Chưa có ảnh thật: chân dung dùng `woman-reading-sofa.jpg` (CC BY 3.0, Julia Spranger), ảnh thứ hai `vintage-book-sofa.jpg` (CC BY 2.0); cả hai phải ghi công khi đăng thật (`public/images/CREDITS.md`). Thay bằng ảnh của chính Lộc ở `src/config/profile.ts`.

## Ghi chú kiểm tra
- Ảnh chân dung cắt dọc 3:4 từ ảnh ngang bằng `object-position` (`profile.portrait.position`).
- Hydration warning của `Newsletter` (PointerScene, `useReducedMotion`) có từ trước, không thuộc trang này.
