# Trang Blog

Mockup: `Blog.dc.html` (cùng thư mục). Khối dùng chung (Nav, Newsletter, Footer): xem `../README.md`.
Bấm một chủ đề thì đổi cả Hero chủ đề và danh sách bài (về trang 1).

## Thứ tự khối
1. **Dải đầu trang tối** (`inverse`) gồm: **Nav** → **PageHeader** → **menu chủ đề** → **TopicHero**
   - PageHeader: `h1` "Blog" + dek "Các bài ghi chép theo từng cuốn sách và chủ đề…"
   - Menu chủ đề: `TopicMenu` (dưới 768) hoặc `TopicTabs` (768), và danh sách dọc trong TopicHero (từ 1024)
   - TopicHero: nhãn "Chủ đề", tên chủ đề (`h1` kiểu), dek, nút "Đọc bài mới nhất", hình 3 bìa sách (giữa 2:3), số liệu (số bài · số cuốn sách · phút đọc trung bình)
2. **PostList** — khối sáng gối lên đáy dải tối: tiêu đề "Bài viết trong {chủ đề}", meta "{n} bài · trang {k}", lưới **PostCard**, **Pagination**
3. **Newsletter** → 4. **Footer**

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
Ảnh 3:2 · nhãn chủ đề · tiêu đề 2 dòng · tóm tắt 2 dòng · chân thẻ: "28 tháng 9 · 6 phút" + "Đọc bài →". Bấm được cả thẻ.

## Component cần dựng
`PageHeader`, `TopicMenu`, `TopicTabs`, `TopicHero` (+ danh sách chủ đề dọc), `PostCard`, `Pagination`, `Newsletter`, `SiteHeader`, `SiteFooter`.

## Điểm cần Lộc chốt trước khi dựng (Q13)
- URL mỗi chủ đề và mỗi trang. Đề xuất: `/blog` (tất cả hoặc chủ đề đầu) và `/blog/<chu-de>?trang=2`, để Google lập chỉ mục được từng chủ đề. Dự án B (xuất tĩnh) không dùng `searchParams` phía server nên cần route tĩnh hoặc lọc phía trình duyệt (xem `docs/PLAN.md`).
- Số bài mỗi trang đổi theo màn hình (2 / 4 / 6) hay cố định (đề xuất cố định 6, lưới co cột theo màn hình)? Đổi theo màn hình làm số trang và nội dung mỗi trang khác nhau giữa điện thoại và máy tính, ảnh hưởng SEO và liên kết chia sẻ.
- "Tất cả bài" có tab riêng không? Wireframe chỉ có 5 chủ đề.

## Lưu ý kiểm tra
- Menu chủ đề dùng được bằng bàn phím; mục đang chọn không chỉ khác màu (gạch/vạch + `aria-pressed`).
- Khối sáng gối lên dải tối: kiểm tra tương phản ở cả hai theme Giấy và Đêm (dải `inverse` ở theme Đêm khác theme Giấy).
- Thumb zone: PostCard và Pagination nằm trong 2/3 dưới màn hình khi cuộn.
