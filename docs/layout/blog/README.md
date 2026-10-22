# Trang Blog

Mockup: `Blog.dc.html` (cùng thư mục). Khối dùng chung (Nav, Newsletter, Footer): xem `../README.md`.
Bấm một chủ đề thì đổi cả Hero chủ đề và danh sách bài (về trang 1).

## Thứ tự khối
> Cập nhật 2026-10-07: đáy dải tối cắt bằng mask nét cọ (lớp `brush-bottom`), lộ nền `paper` bên dưới; khối danh sách bài không còn bo góc gối lên dải tối (kéo lên bằng lề âm đúng chiều cao mép cọ); phần số liệu của Hero chừa đệm dưới `space-9` để không nằm trong vùng mờ.
1. **Dải đầu trang tối** (`inverse`, có ảnh nền theo chủ đề `topic.image` phủ lớp `inverse` 80% để chữ đọc rõ) gồm: **Nav** → **Breadcrumb** → **menu chủ đề** → **TopicHero**
   - Breadcrumb (thay PageHeader, 2026-10-07): "Trang chủ › Blog › {chủ đề}" — chữ `caption` nhỏ, icon nhà ở mục đầu, dấu › mảnh mờ, mục hiện tại là huy hiệu pill trong mờ (`aria-current="page"`), kèm JSON-LD `BreadcrumbList`. Breadcrumb đặt cao hơn, sát thanh đầu trang (đệm trên `space-4` / `space-5` thay cho `space-6` / `space-7`), phần dưới giữ nguyên vị trí. Tiêu đề "Blog" và dòng dek được ẩn khỏi mắt nhìn (`sr-only`, vẫn có cho trình đọc màn hình / SEO). Khoảng cách từ breadcrumb tới TopicHero thu sát: các cột của TopicHero căn lên trên từ 1024px (không căn giữa theo cột cao nhất), nhãn "Chủ đề" → tên chủ đề cách `space-3`.
   - Menu chủ đề: `TopicMenu` (dưới 768) hoặc `TopicTabs` (768), và danh sách dọc trong TopicHero (từ 1024; lưới 3 cột `1fr | cột giữa 18–24rem | 1fr`, hai cột bên bằng nhau để cụm bìa nằm chính giữa, khe giữa các cột `space-5`; cập nhật 2026-10-10)
   - TopicHero: nhãn "Chủ đề", tên chủ đề (`h1` kiểu), dek, nút "Đọc bài mới nhất", hình 3 bìa sách demo (SVG, giữa 2:3; tra theo tên sách ở `content/books/*.json`), số liệu (số bài · số cuốn sách · phút đọc trung bình)
2. **PostList** — khối sáng gối lên đáy dải tối. **Khối Chủ đề con (`SubtopicRail`, 2026-10-22)** nằm ĐẦU khối sáng, trên tiêu đề danh sách: tiêu đề "Chủ đề con" CĂN GIỮA bằng `SectionHead size="xl"` (`display-xl`, LỚN HƠN một bậc so với "Bài viết trong {chủ đề}" `display-lg` ngay dưới; hiện từng từ) + dek + họa tiết hình thoi `accent-warm` (Ornament căn giữa), rồi thanh trượt thẻ chủ đề con: khối THU HẸP hai bên (rộng tối đa 50rem, căn giữa), thẻ chữ nhật DỌC 3:4 (`radius-lg`, `elevated-md`; ảnh tràn phủ `inverse` 65% hoặc `CoverArt` khi chưa có ảnh; chữ trên ảnh ở đáy thẻ: huy hiệu "{n} bài" + tên `display-sm` + mô tả 2 dòng; bấm cả thẻ). Số thẻ nhìn thấy MẶC ĐỊNH: từ 768 → đúng 3 thẻ nguyên vẹn (còn lại trượt) · 375 → 1 thẻ và lộ mép thẻ kế; chủ đề có ≤ 3 chủ đề con thì căn giữa, không trượt. Trượt bằng vuốt / cuộn ngang / phím ‹ ›; nút ‹ › tròn nổi ở GIỮA CHIỀU CAO khối, hai bên (từ 1024 nằm nửa trong nửa ngoài mép khối, 768 nằm sát mép trong; dưới 768px KHÔNG có nút, chỉ vuốt, để nút không che chữ thẻ); nút ẩn hẳn khi đã tới đầu / cuối; không có hàng chấm. Chỉ hiện chủ đề con CÓ BÀI ĐÃ ĐĂNG; chủ đề không có chủ đề con (hoặc admin tắt khối) thì khối ẩn. Ở trang chủ đề con: thẻ đang xem có viền `accent`, hiện thêm liên kết "Tất cả bài trong chủ đề" căn giữa bên dưới thanh trượt. Tiêu đề mục:  GIỮ bố cục cũ (căn trái, số bài ở bên phải) nhưng nổi bật hơn: "Bài viết trong {chủ đề}" cỡ `display-lg`, "{n} bài · trang {k}" là huy hiệu pill nền `accent-soft`, bên dưới là đường kẻ có họa tiết hình thoi `accent-warm` ở đầu trái (`Ornament align="left"`), lưới **PostCard**, **Pagination**
3. **Newsletter** → 4. **Footer**

### Trang chủ đề con `/blog/<chủ đề>/<chủ đề con>` (2026-10-22)
Dùng CHÍNH `BlogView` (tham số `sub`): Hero, menu chủ đề, con số vẫn của chủ đề lớn; breadcrumb thêm cấp "Trang chủ › Blog › {chủ đề} › {chủ đề con}"; `h1` ẩn là "{chủ đề con} — {chủ đề}"; tiêu đề danh sách "Bài viết trong {chủ đề con}"; danh sách và phân trang chỉ gồm bài thuộc chủ đề con (`/blog/<chủ đề>/<chủ đề con>/trang/<n>`). Một bài có thể thuộc nhiều chủ đề con. Chủ đề con không có bài đã đăng: 404 (không có trang mỏng), không vào sitemap. Slug `trang` bị cấm cho chủ đề con. Title tab: "{chủ đề con} — {chủ đề} — Blog"; canonical riêng từng trang; sitemap có từng trang.

## Thay đổi theo mốc
| Mốc | Menu chủ đề | TopicHero | Danh sách | Phân trang |
|---|---|---|---|---|
| 375 / 414 | nút ☰ + tên chủ đề + ▾, bấm mở danh sách (`aria-expanded`) | căn giữa: nhãn, tiêu đề, CTA, bìa, số liệu | 1 cột, **2 bài / trang** | ‹ 1 2 … cuối › |
| 768 | thanh tab viên tròn, căn giữa, đủ 5 chủ đề | vẫn căn giữa; tiêu đề lớn hơn; nhãn thành viên viền; bìa có vòng sáng; số liệu trong một thẻ có vạch ngăn | 2 cột, **4 bài / trang** | thêm số 3 |
| 1024 | **bỏ tab**; danh sách dọc bên phải Hero: số thứ tự (01…), tên, số bài; mục đang chọn chữ trắng + vạch đánh dấu; hover mới hiện nền sáng mờ + mũi tên | căn trái: chữ + CTA bên trái, bìa ở giữa, số liệu một hàng bên dưới; tiêu đề Blog căn trái | 3 cột, **6 bài / trang** | như 768 |
| 1440 | như 1024 | như 1024, rộng hơn (khung 1120px, dải đen tràn) | như 1024 | như 1024 |

- Phân trang: trang hiện tại có `aria-current="page"`; số cuối = ⌈số bài ÷ số bài mỗi trang⌉; nút ‹ › cao 44px.
- Nav: ☰ ẩn từ 768; ô tìm kiếm mở rộng từ 1024.

### PostCard (lưới Blog)
Cùng khuôn với thẻ chủ đề Trang chủ: thẻ dọc 3:4, ảnh bài tràn cả thẻ phủ `inverse` 65%, chữ nằm thẳng trên ảnh ở đáy: nhãn chủ đề (huy hiệu pill trong mờ) · tiêu đề 2 dòng `display-sm` · tóm tắt 2 dòng · chân thẻ "28 tháng 9 · 6 phút" + "Đọc bài →"; lơ lửng `elevated-lg`, hover nhấc + ảnh phóng + lớp phủ nhạt đi. Bấm được cả thẻ.

## Component cần dựng
`Breadcrumb`, `TopicMenu`, `TopicTabs`, `TopicHero` (+ danh sách chủ đề dọc), `SubtopicRail` (dùng `Slider` với `controls="sides"`), `PostCard`, `Pagination`, `Newsletter`, `SiteHeader`, `SiteFooter`.

## Điểm cần Lộc chốt trước khi dựng (Q13)
- URL mỗi chủ đề và mỗi trang. Đề xuất: `/blog` (tất cả hoặc chủ đề đầu) và `/blog/<chu-de>?trang=2`, để Google lập chỉ mục được từng chủ đề. Dự án B (xuất tĩnh) không dùng `searchParams` phía server nên cần route tĩnh hoặc lọc phía trình duyệt (xem `docs/PLAN.md`).
- Số bài mỗi trang đổi theo màn hình (2 / 4 / 6) hay cố định (đề xuất cố định 6, lưới co cột theo màn hình)? Đổi theo màn hình làm số trang và nội dung mỗi trang khác nhau giữa điện thoại và máy tính, ảnh hưởng SEO và liên kết chia sẻ.
- "Tất cả bài" có tab riêng không? Wireframe chỉ có 5 chủ đề.

## Lưu ý kiểm tra
- Menu chủ đề dùng được bằng bàn phím; mục đang chọn không chỉ khác màu (gạch/vạch + `aria-pressed`).
- Khối sáng gối lên dải tối: kiểm tra tương phản ở cả hai theme Giấy và Đêm (dải `inverse` ở theme Đêm khác theme Giấy).
- Thumb zone: PostCard và Pagination nằm trong 2/3 dưới màn hình khi cuộn.


> 2026-10-16: chữ của trang này sửa được ở Keystatic (menu Trang, file content/pages/*.json, đọc qua `src/shared/content/pages.ts`); chữ mặc định ở `src/shared/config/page-texts.ts`.
