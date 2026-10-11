# Trang chủ (thương hiệu cá nhân)

Mockup: `Intro.dc.html` (cùng thư mục). Route `/`. Nội dung chỉnh MỘT chỗ: `src/config/profile.ts` (chữ [mẫu] chờ Lộc thay; chỉ tên "Trần Ngọc Hoàng Ni" là thật). Trang Book (Trang chủ cũ) ở `/book`: `../book/README.md`. Khối dùng chung: `../README.md`.
Mục tiêu: người đọc tin người viết trước khi đăng ký. CTA chính DUY NHẤT của cả trang: nút "Đăng ký nhận bài" ở Hero, cuộn tới form `Newsletter` (`#dang-ky`).
Menu: Trang chủ · Book · Blog (`navGroups`, icon `home` / `book` / `blog`).

## Thứ tự khối
1. **Hero** (`PersonHero`, dải tối `inverse`, đáy `brush-bottom`, không ảnh nền, chứa Nav tông `inverse`). Nền = `HeroBackdrop` với `word="Ni"` (dòng kẻ ngang, chữ viền khổng lồ, vòng tròn phẳng `accent-warm` nhỏ ở góc trái dưới từ 768px).
   - Chữ: nhãn "Xin chào, mình là" · `h1` tên · định vị (1 câu) · nút "Đăng ký nhận bài" · "Theo dõi mình" + `SocialIcons featured="zalo" onDark`.
   - **Chân dung 3D** (`PortraitStage`): khối `preserve-3d`, các lớp ở độ sâu khác nhau: vòng tròn `accent-warm` (z -90) và khung viền lệch (z -40) phía sau; ảnh 3:4 `radius-lg` (z 0); thẻ "Đang đọc" `surface-raised` (z 55) và bìa sách nghiêng 6° (z 90) phía trước. Nghiêng ±14° / ±9° theo con trỏ (spring, chỉ khi có chuột), xoay thêm theo thanh cuộn (chạy cả cảm ứng); tắt khi giảm chuyển động. Chỉ `transform`.
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
