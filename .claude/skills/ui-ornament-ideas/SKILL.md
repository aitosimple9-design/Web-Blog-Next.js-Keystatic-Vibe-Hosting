---
name: ui-ornament-ideas
description: Quy trình tìm ý tưởng HỌA TIẾT, chiều sâu và chi tiết "chữ ký" cho một khối / trang của blog sách (Next.js + Keystatic) sao cho đẹp, rực rỡ nhưng vẫn nằm trong Design System Blog Book Mono. Dùng TRƯỚC khi dựng hoặc làm lại một khối giao diện, và khi Lộc nói UI "chưa đẹp", "thiếu họa tiết", hoặc đưa ảnh mẫu (Pinterest, Dribbble...). Không dùng cho sửa lỗi nhỏ, chỉnh khoảng cách, chữ.
---

# Ý tưởng họa tiết cho UI (blog sách)

Mục tiêu: mỗi khối có **một chi tiết nhớ được** như form đăng ký (nhãn nổi, gạch nhấn chạy khi focus, dấu tích "vẽ") thay vì một khối phẳng đúng quy tắc nhưng nhạt. Design System lo màu, chữ, khoảng, bóng, layout, thiết bị; skill này lo phần **họa tiết, chiều sâu, phụ kiện, vi tương tác**.

## Vì sao form làm tốt (mẫu để lặp lại)
1. **Họa tiết gắn với chức năng:** hiệu ứng báo trạng thái (focus, lỗi, thành công), không chỉ để đẹp.
2. **Chỉ dùng token** (màu, bóng `elevated-*`, chuyển động `--motion-*`), nên hợp cả hai theme.
3. **Một ý chính, làm trọn:** vài chi tiết nhỏ đồng điệu thay vì rải mười hiệu ứng.
4. **Tiết chế:** không lấp đầy mọi chỗ trống.

Mỗi họa tiết đề xuất phải trả lời được: nó **dẫn mắt**, **báo trạng thái**, **tạo chiều sâu**, hay **kể chuyện sách**? Không trả lời được thì bỏ.

## Cần có từ Lộc (hỏi nếu thiếu, tối đa 3 câu, kèm đề xuất mặc định)
- Khối / trang nào, người đọc cần làm gì ở đó.
- 1 đến 3 ảnh mẫu (thư mục `Tài liệu/`) và 2 đến 3 dòng: thích gì, KHÔNG thích gì.
- Quy tắc nào được nới (gradient nền, tông vàng đồng `accent-warm` làm viền / chữ, họa tiết nền, chồng lớp).
- Có ảnh thật / vật thể tách nền chưa, hay phải dùng `CoverArt` và SVG tự vẽ.

## Quy trình
1. **Đọc nguồn chuẩn:** `CLAUDE.md` mục 6, `docs/design-system/DESIGN-SYSTEM.md`, `docs/design-system/EXTENSIONS.md` (cái gì ĐÃ duyệt), spec trang ở `docs/layout/<trang>/README.md`, và `references/ornament-catalog.md` cạnh file này (kho họa tiết đã dùng và ứng viên mới).
2. **Bóc ảnh mẫu thành 5 lớp, KHÔNG chép layout, chữ, hình:**
   - nền (màu, kết cấu, ảnh mờ) · chiều sâu (vật thể tách nền, bóng, chồng lớp) · họa tiết (đường nét, hình thoi, số lớn, viền) · chuyển động (cuộn, hover, nghiêng) · chi tiết ký hiệu (cái làm ảnh mẫu "nhớ được").
   - Ghi mỗi lớp: lấy ý nào, dịch sang token nào của dự án.
3. **Chọn "chữ ký" của khối:** đúng MỘT chi tiết chính. Đừng thêm gì cho tới khi chọn xong.
4. **Ngân sách họa tiết cho mỗi khối:** tối đa 1 họa tiết chính + 2 chi tiết phụ; tối đa 1 vật thể tách nền chồng mép; không card lồng card (một lớp khung nền, thẻ con không viền).
5. **Đề xuất 3 phương án** cho Lộc chọn: **A an toàn** (chỉ dùng cái đã duyệt), **B cân bằng** (một mở rộng nhỏ), **C táo bạo** (cần nới quy tắc). Mỗi phương án viết mini-spec theo mẫu bên dưới.
6. **Sau khi Lộc chọn: dựng bản thử MỘT khối**, chụp ở 375, 768, 1440px (một theme; thêm Đêm nếu có màu nền mới), **đặt cạnh ảnh mẫu** rồi sửa tới khi gần tinh thần ảnh mẫu. Chỉ rồi mới nhân ra các khối khác.
7. **Đồng bộ tài liệu cùng lúc:** `docs/design-system/EXTENSIONS.md` (mở rộng mới), `CLAUDE.md` mục 6, spec trang ở `docs/layout/`, `.claude/agents/design-reviewer.md`, `docs/PLAN.md`; ảnh mới vào `public/images/CREDITS.md`.

## Mẫu mini-spec cho mỗi phương án
```
Tên: <họa tiết / chi tiết>
Vai trò: dẫn mắt | báo trạng thái | chiều sâu | kể chuyện sách
Đặt ở: <khối, vị trí, mốc responsive>
Dùng token: <màu, bóng, bo góc, chuyển động>
Tài sản cần: <ảnh tách nền / SVG / không>, dung lượng dự kiến
Chuyển động: <transform + opacity>, tắt khi prefers-reduced-motion, chỉ khi pointer: fine nếu theo con trỏ
Chi phí: tốc độ (LCP, dung lượng), độ phức tạp mã
A11y / SEO: aria-hidden nếu trang trí, tương phản chữ trên họa tiết, không đưa nội dung vào ảnh
Cần duyệt: <mở rộng nào so với Design System, nếu có>
```

## Ràng buộc cứng (từ CLAUDE.md mục 6)
- Chỉ token, KHÔNG mã hex; đẹp ở cả hai theme Giấy và Đêm; MỘT màu nhấn `accent` (`accent-warm` chỉ đầu gradient và họa tiết, trừ khi Lộc duyệt mở rộng).
- Chuyển động chỉ `transform` + `opacity`; KHÔNG vòng lặp vô hạn (ngoại lệ đã duyệt: `ScrollMarquee`); tắt khi giảm chuyển động.
- Đổ bóng chỉ theo thang `elevated-*` (+ `inset-sunk*` đã duyệt); gradient chỉ nút chính, bề mặt nổi và vùng chuyển mờ giữa các dải (đã duyệt).
- CẤM emoji, chữ sáo rỗng, chữ trên ảnh ngoài các ngoại lệ đã duyệt.
- Vùng bấm ≥ 44px; responsive 375 / 414 / 768 / 1024 / 1440px.
- Ngân sách tốc độ: mỗi lớp ảnh trang trí ≤ 80KB (WebP), tổng ≤ 200KB mỗi khối, `loading="lazy"` dưới màn hình đầu; sau khối đầu tiên chạy lại Lighthouse mobile, không để điểm tụt.

## Anti-pattern
- Rải nhiều kiểu họa tiết khác nhau trong một khối; hiệu ứng che chữ hoặc làm chữ khó đọc.
- Chép nguyên layout / hình của ảnh mẫu (rủi ro bản quyền, mất nét riêng).
- Gradient tím mặc định, blob trang trí, ảnh stock vô hồn, card lồng card.
- Ảnh không rõ giấy phép; ảnh tách nền quá nặng.
- Thêm thư viện chỉ để có một hiệu ứng (phải hỏi Lộc trước khi cài).

## Việc skill này KHÔNG làm
Không tự thêm họa tiết vào mã khi chưa có phương án Lộc chọn. Không tự nới Design System: đề xuất, ghi rõ "cần duyệt", chờ Lộc.
