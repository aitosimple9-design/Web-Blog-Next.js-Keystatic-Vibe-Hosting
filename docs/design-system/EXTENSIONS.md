# Phần mở rộng của dự án so với Design System gốc

Design System Blog Book Mono (`README.md`, `DESIGN-SYSTEM.md`, `tokens.json`) giữ nguyên là bản gốc do Lộc quản lý.
File này ghi các **mở rộng đã được Lộc yêu cầu / duyệt** cho dự án này, để Claude và `design-reviewer` không coi là lỗi.
Mọi mở rộng vẫn dùng đúng bảng màu, bo góc, kiểu chữ, token của Design System. Thêm mục mới = ghi ngày + lý do.

## Ràng buộc không đổi (mở rộng KHÔNG được phá)
- Chỉ một màu nhấn (`accent`); không gradient; không đổ bóng ngoài `cover-shadow`; không chữ đặt trực tiếp lên ảnh (chữ nằm trong khung nền đặc).
- Vùng bấm ≥ 44x44px, cách nhau ≥ 8px; hai theme Giấy / Đêm; vòng focus bàn phím luôn hiện.
- Chuyển động: chỉ `transform` + `opacity`; tắt khi `prefers-reduced-motion`; không vòng lặp vô hạn; hover chỉ trên thiết bị có chuột.

## Mở rộng đã duyệt
| Ngày | Nội dung | Nơi áp dụng |
|---|---|---|
| 2026-10-07 | **Ảnh bìa nghệ thuật sinh tự động** (`CoverArt`): hình học đơn sắc từ slug, đổi theo theme, thay ô giữ chỗ trống | Mọi ảnh bài / bìa sách chưa có ảnh thật |
| 2026-10-07 | **Ảnh minh họa thật** từ nguồn có giấy phép, ghi ở `public/images/CREDITS.md` (CC BY phải ghi công trên web thật) | Bài mẫu, hero |
| 2026-10-07 | **Hiệu ứng vào trang** (chữ hiện từng từ, nổi lên lần lượt), **theo con trỏ** (nghiêng, lớp trôi), **theo cuộn** (dải chữ, thị sai, thanh tiến độ đọc), **đếm số**, **View Transition** ảnh thẻ → trang bài | Hero Trang chủ, hero Blog, trang bài |
| 2026-10-07 | **Hover**: nút nền quét, thẻ nhấc + ảnh phóng, gạch chân chạy, mũi tên trượt, icon nhấc, logo xoay | Toàn site |
| 2026-10-07 | **Hero trang bài full-width**: ảnh tràn hết bề ngang, khối tiêu đề nền đặc `paper` gối lên đáy ảnh | `docs/layout/chi-tiet-bai/` |
| 2026-10-07 | **Thẻ bài liên quan hình chữ nhật 3:2** có ảnh, khung chữ nền đặc gối đáy ảnh, hover nổi + nút mũi tên đổi màu nhấn | `docs/layout/chi-tiet-bai/` |
| 2026-10-07 | **Form đăng ký tương tác**: nhãn một dòng + "Tùy chọn" tách riêng, icon đầu ô đổi màu khi focus, gạch nhấn chạy khi focus, hover đổi viền / nền, lỗi lắc một lần, dấu tích "vẽ" khi thành công, vòng trang trí trôi theo con trỏ | `Newsletter` (cả 3 trang) |

## Quy tắc dựng form (bổ sung)
- Nhãn trường luôn MỘT dòng, ngắn ("Số điện thoại", không "Số điện thoại (không bắt buộc)"). Thông tin phụ (tùy chọn / bắt buộc) đặt thành chữ `caption` riêng cùng hàng nhãn, không nối vào nhãn.
- Khi hai ô cùng hàng, nhãn phải cùng một dòng để hai ô thẳng hàng (`items-start`).
- Lỗi: biểu tượng + chữ giải thích cách sửa + viền dày; không báo lỗi chỉ bằng màu (không đổi).

## Nguồn tham khảo ý tưởng tương tác form (tìm 2026-10-07)
Gạch chân / viền động khi focus, nhãn đổi trạng thái, hover đổi nền ô, dấu tích vẽ khi thành công, thời lượng 120–220ms:
uxpin.com (Ultimate Guide to Microinteractions in Forms), frontendtools.tech (10 Micro-Interaction Examples), pixelfreestudio.com (Best Practices for Animating Forms and Inputs).
