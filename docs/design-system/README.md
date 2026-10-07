Blog Book Mono là phiên bản đen trắng phối kem nhẹ của Blog Book: giấy kem, chữ serif cho bài đọc dài, một màu tương tác duy nhất là đen (sang theme Đêm thì thành kem), và bìa sách có đổ bóng riêng. Phiên bản dự án có thêm lớp premium (từ 2026-10-07): gradient `gradient-primary*` / `gradient-surface`, tông ấm `accent-warm`, thang đổ bóng `elevated-sm/md/lg`; chi tiết ở `EXTENSIONS.md`. Giữ nguyên chữ, bố cục, hình dạng và component của Blog Book (đỏ đô); đổi màu nhấn và bổ sung một nền trang trí riêng (`paper-deep`) cho tông kem, để hai bản vẫn đối chiếu được công bằng.

## Cách dùng

- Nạp `tokens.css` trước, rồi `components/bundle.css`. Component là HTML thuần với class (`btn btn-primary`, `post-card`, `prose`); mỗi `components/<Tên>/README.md` nói rõ cấu trúc HTML cần có.
- Không viết mã hex trong CSS của bạn. Dùng `var(--accent)`, `var(--ink)`, `var(--space-5)`, `var(--radius-md)`.
- Hai theme: `data-theme="light"` (Giấy, mặc định) và `data-theme="dark"` (Đêm) đặt trên `<html>`. Đặt theme bằng một đoạn script chạy trước khi vẽ trang (theo `prefers-color-scheme`, nhớ lựa chọn của người đọc) để không bị nháy sáng.
- Font: nạp Source Serif 4 (400, 600, nghiêng 400) và Be Vietnam Pro (400, 500, 600) với subset `vietnamese` và `latin`, `display: swap`. Trong Next.js dùng `next/font/google`, đặt biến riêng (ví dụ `--next-serif`) rồi gán `--font-serif: var(--next-serif), Georgia, serif` để giữ chuỗi dự phòng của token.
- Ảnh bìa và ảnh bài luôn khai báo `width`, `height` (hoặc dùng `aspect-ratio` có sẵn: `cover-ratio`, `post-image-ratio`) để trang không nhảy khi ảnh tải.

## Nguyên tắc và giá trị

- Nguyên tắc về màu, chữ, bố cục, hình dạng, đổ bóng, nội dung và trạng thái: xem `DESIGN-SYSTEM.md`.
- Giá trị số liệu (màu, cỡ chữ, khoảng cách, bo góc, breakpoint, đổ bóng, gradient): xem `tokens.json`. Token gradient được script `scripts/build-tokens.mjs` đưa vào `src/styles/tokens.css` (biến `--gradient-*`, `--elevated-*`); class dùng chung `.btn-grad`, `.surface-raised`, `.field-premium`, `.img-elevated`, `.marquee-run` nằm ở `src/app/globals.css`.
- Mở rộng đã được duyệt cho dự án (ngoài Design System gốc): xem `EXTENSIONS.md`.
