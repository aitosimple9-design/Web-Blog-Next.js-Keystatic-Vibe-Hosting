---
description: "Riêng cho Keystatic và trang quản trị: đồng bộ admin, xem trước, dọn ảnh (CLAUDE.md cũ mục 8)"
paths:
  - "src/cms/**"
  - "keystatic.config.ts"
  - "src/app/api/**"
  - "src/app/keystatic/**"
  - "src/app/xem-truoc/**"
  - "content/**"
  - "public/images/**"
  - "tests/e2e/admin*/**"
---

# Riêng cho Keystatic (trước đây: CLAUDE.md mục 8)
- Giữ `keystatic.config.ts` khớp 100% với mục 5 (tên trường, kiểu dữ liệu, thư mục). Ngoại lệ duy nhất: Keystatic lấy `slug` từ TÊN FILE và không ghi `slug:` vào frontmatter nên `slug` khai báo `fields.ignored()`; `posts.ts` dùng tên file khi thiếu `slug:` (có thì phải trùng). Bài do Keystatic lưu có thể không có dòng `slug:`.
- Xóa bài / chủ đề / sách trong chế độ local: `src/app/api/keystatic/[...params]/route.ts` + `src/cms/lib/content-cleanup.ts` xóa luôn thư mục ảnh cùng slug (Keystatic tự nó để lại ảnh mồ côi). Chế độ GitHub không chen được vào lệnh xóa → chạy `npm run prune-images`.
- Nút "Xem trước" trong form bài (`previewUrl` ở `keystatic.config.ts`) mở `/xem-truoc/bai-viet/<slug>`: giao diện thật của bản ĐÃ LƯU, gồm cả bài nháp và bài lên lịch (có thanh ghi chú ở đáy). Keystatic không xem được chữ đang gõ mà chưa Lưu. Trang này CHỈ quản trị viên mở được (`src/cms/lib/admin-access.ts`: chế độ local trên máy không có `VERCEL`, hoặc chế độ GitHub với người đã đăng nhập Keystatic và có quyền push vào repo), người khác nhận 404; không dựng sẵn, `noindex`, `robots.txt` chặn `/xem-truoc/`. Chế độ GitHub (web thật) đọc bản đã lưu ở nhánh `?branch=` qua GitHub API bằng token của chính người xem; chủ đề của bài lấy từ bản build, hoặc từ chính nhánh nếu mới tạo (`registerPreviewTopic`, chỉ sống trong một yêu cầu). Hộp điểm SEO và `/api/diem-seo?slug=&branch=` cũng chấm bản ở nhánh. Mọi script của giao diện quản trị phải nhận địa chỉ có `/branch/<nhánh>/` của chế độ GitHub (từng sót ở SeoPanel) **Cách xác thực quản trị viên (Lộc duyệt 2026-10-19):** cookie `keystatic-gh-access-token` do Keystatic cấp + hỏi GitHub `GET /repos/<repo>` có `permissions.push` (nhớ 60 giây, chỉ lưu bản băm); token chỉ dùng phía server, không log, không trả ra ngoài. Nút "Tạo chuyển hướng" ở chế độ GitHub commit vào NHÁNH đang soạn (`src/cms/lib/github-content.ts`); nhánh chính được bảo vệ thì GitHub từ chối và giao diện báo tạo nhánh mới (New branch).
- **NGUYÊN TẮC ĐỒNG BỘ VỚI TRANG QUẢN TRỊ (Lộc, 2026-10-16):** thêm hay xóa gì thì file đi kèm phải đồng bộ với Keystatic. Xóa trong admin → mọi file liên quan mất theo (file nội dung, thư mục ảnh theo slug, ảnh đã thay / gỡ, ảnh của singleton ở `public/images/site/`), không để ảnh mồ côi. Thêm → phải hiện ra và sửa được trong admin: KHÔNG để chữ, ảnh, liên kết, danh sách hiển thị trên web mà chỉ sửa được trong mã (việc đưa phần còn lại vào admin nằm ở kế hoạch 5 PR trong `docs/HANDOFF.md`). Luật dọn ảnh nằm MỘT nơi: `src/cms/lib/content-cleanup.ts` (`IMAGE_RULES`, `SINGLETON_IMAGE_RULES`); route API, `npm run prune-images` và `npm run check-content` đều đọc từ đó. Thêm ô ảnh mới vào `keystatic.config.ts` (thư mục `directory` mới) hoặc collection / singleton mới thì PHẢI khai báo luật dọn ảnh và thêm vào `ui.navigation`; `tests/unit/project/admin-sync.test.ts` làm hỏng build nếu quên. Trước khi mở PR có đụng admin / `content/` / `public/images/`: chạy subagent `admin-sync-reviewer`.
- Giai đoạn hiện tại chỉ dùng chế độ local. Chuyển sang GitHub mode là việc deploy → phải hỏi trước.
- Không commit secret của Keystatic/GitHub; chỉ để trong biến môi trường.
