# Kho họa tiết cho blog sách

Hai phần: **A. đã dùng / đã duyệt** (có thể tái dùng ngay) và **B. ứng viên mới** (hợp chủ đề sách và đọc; MỌI mục ở B cần Lộc duyệt rồi ghi vào `docs/design-system/EXTENSIONS.md` trước khi vào mã). Nguồn sự thật cho phần A là `EXTENSIONS.md`; nếu lệch thì EXTENSIONS đúng.

## A. Đã có trong dự án (tái dùng trước khi nghĩ cái mới)
| Họa tiết | Ở đâu | Vai trò |
|---|---|---|
| Nét cọ cắt đáy dải tối (`brush-bottom`) | Hero Book, Blog, trang bài, Trang chủ | chuyển dải, chất thủ công |
| Vùng chuyển mờ giữa các dải (`seam-*`) | các dải paper / sunk | chuyển dải mềm |
| Đường kẻ họa tiết hình thoi (`Ornament`, `SectionHead`) | tiêu đề mục | dẫn mắt, dấu ấn thương hiệu |
| Ảnh nghệ thuật sinh từ slug (`CoverArt`) | thẻ chưa có ảnh | không để ô trống |
| Chân dung tách nền + tên khổng lồ sau người (`PersonHero`) | Trang chủ | chiều sâu |
| Cánh cửa mở đầu (`HeroCurtain`) | Trang chủ | kể chuyện (một lần) |
| Thẻ kính mờ số liệu (`backdrop-blur`) | Hero Trang chủ | chiều sâu nhẹ |
| Chữ khổng lồ nét viền, dòng kẻ ngang SVG, vòng tròn phẳng `accent-warm` | Hero Book | họa tiết nền |
| Dải chữ chạy (`ScrollMarquee`) | Trang chủ, Book | nhịp, ngoại lệ chuyển động |
| Hiện chữ từng từ (`RevealText`), nổi lần lượt (`Reveal`) | tiêu đề mục, thẻ | dẫn mắt khi cuộn |
| Thẻ ảnh tràn phủ `inverse` + chữ trên ảnh, `elevated-*` | thẻ chủ đề, bài, chủ đề con | chiều sâu, đọc nhanh |
| Hover: nhấc thẻ, ảnh phóng, gạch chân chạy, mũi tên trượt, nút nền quét | toàn site | báo tương tác |
| Form: nhãn nổi, gạch nhấn chạy khi focus, lỗi lắc một lần, dấu tích "vẽ" | Newsletter | báo trạng thái (mẫu tốt nhất) |
| Mục lục có trục dọc mảnh, nút mốc, đoạn đã đọc phủ `accent` | trang bài | báo tiến độ |
| Thanh đầu trang co thành viên thuốc khi cuộn | mọi trang | báo trạng thái cuộn |
| Thanh trượt thẻ + nút ‹ › hai bên (`Slider controls="sides"`) | khối Chủ đề con | điều hướng |

## B. Ứng viên mới (cần duyệt)
| Họa tiết | Ý tưởng | Dùng ở đâu | Tài sản | Chi phí |
|---|---|---|---|---|
| **Ruy-băng đánh dấu trang** | dải nhỏ rủ xuống từ mép trên thẻ bài đã lưu / bài nổi bật | thẻ bài, bài nổi bật | SVG | rất thấp |
| **Góc gấp trang** | góc phải thẻ gập nhẹ, hover gập thêm | thẻ bài, thẻ sách | CSS / SVG | thấp |
| **Khung tab hồ sơ** | khung chung có tab nhô ở mép trên, bên trong là slider thẻ (như mẫu khu vườn) | "Bài mới nhất", chủ đề | CSS mặt nạ / SVG | vừa |
| **Đường đồng mức mờ** | họa tiết đường cong rất nhạt phía sau dải sáng | nền dải paper | SVG nhẹ | thấp |
| **Gạch chân bút tay** | nét gạch tay vẽ dần khi cuộn tới từ khóa trong tiêu đề | tiêu đề mục, trích dẫn | SVG `stroke-dashoffset` | thấp |
| **Ghi chú lề** | mũi tên tay + chú thích ngắn cạnh số liệu hoặc câu trích | Trang chủ, trang bài | SVG | thấp |
| **Con dấu tròn** | dấu tròn chữ chạy quanh (năm, "đã đọc", số bài) | Hero, thẻ sách | SVG | thấp |
| **Số chỉ mục lớn** | 01, 02, 03 cỡ lớn nét mảnh sau thẻ / dưới slider | slider, danh sách | chữ | rất thấp |
| **Vật thể tách nền chồng mép dải** | chồng sách, đèn đọc, tách cà phê, cây nhỏ, kính, bút, sổ mở; đè lên mép giữa hai dải, bóng mềm, chân mờ dần (`mask-image`) | Hero, đầu khối Newsletter, Liên hệ | WebP có nền trong suốt ≤ 80KB mỗi cái | vừa (tốc độ) |
| **Hàng ảnh nghiêng phối cảnh** | 5 ảnh nghiêng 3D quanh vật thể giữa (CSS `perspective`) | Hero, "Chủ đề" | ảnh thật | vừa |
| **Nền lớp kệ sách / thư viện mờ** | ảnh rất nhạt (opacity thấp) làm chiều sâu sau tiêu đề | Hero Blog, Liên hệ | ảnh WebP nhẹ | thấp |
| **Nút tròn vòng đồng tâm** | nút điều hướng có 1 đến 2 vòng mảnh bao quanh, vòng nở ra khi hover | slider | CSS | rất thấp |
| **Khung polaroid / thẻ chỉ mục** | thẻ có mép giấy, nghiêng 1 đến 2 độ, hover thẳng lại | thẻ bài, trích dẫn | CSS | thấp |
| **Hạt giấy cực nhẹ** | kết cấu giấy trên nền sáng | nền paper | SVG noise nhỏ, kiểm tra tốc độ | thấp, dễ vô tình nặng |

## Gợi ý ghép theo khối
- **Hero** (chiều sâu): 1 vật thể tách nền chồng mép + nét cọ có sẵn; chữ ký là chữ lớn nét viền hoặc con dấu.
- **Danh sách thẻ**: số chỉ mục + hover có sẵn; chữ ký là ruy-băng hoặc góc gấp.
- **Tiêu đề mục**: Ornament có sẵn + gạch chân bút tay cho một từ khóa.
- **Trang chữ (Liên hệ, Chính sách)**: nền lớp kệ sách mờ hoặc đường đồng mức; chữ ký là con dấu hoặc ghi chú lề; KHÔNG vật thể nặng.
- **Form / nút**: giữ chuẩn Newsletter (chi tiết nhỏ báo trạng thái).
