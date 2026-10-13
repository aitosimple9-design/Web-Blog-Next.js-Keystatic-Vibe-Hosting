# Quy trình làm việc — LỘC_WEBSITE BLOG

Áp dụng cho cả Dự án A (`web_blog`) và Dự án B (`web_blog_static`). File này GIỐNG HỆT nhau ở 2 repo.
Claude Code đọc file này khi bắt đầu một Issue mới hoặc khi không chắc bước tiếp theo.

---

## 1. Vai trò

- **Chủ dự án (Lộc):** đặt mục tiêu, tạo và duyệt Issue, duyệt kế hoạch, review và merge PR, làm mọi việc ở mục 8.
- **Claude Code:** kỹ sư chính. Đọc Issue → lập kế hoạch → code → tự kiểm tra → mở PR.
- **Subagents:**
  - `design-reviewer`: chỉ đọc, chấm giao diện theo `docs/design-system/` và mục 6 trong CLAUDE.md
  - `ui-tester`: dùng Playwright mở trang, chụp ảnh ở 375 / 414 / 768 / 1024 / 1440px, báo chỗ vỡ
  - `content-editor`: biên tập bài viết theo mục 4 của file này
  - `Explore`, `Plan`: có sẵn trong Claude Code, dùng để tìm hiểu code mà không làm đầy ngữ cảnh
- **Skills:** tự nạp khi đúng việc. Danh sách thực tế nằm ở mục "Công cụ" trong CLAUDE.md.

## 2. Bắt đầu mỗi phiên làm việc

1. Đọc `docs/HANDOFF.md` ĐẦU TIÊN: phiên trước dừng ở đâu, việc kế tiếp, bẫy đã gặp.
2. Chạy `git status` và `git branch --show-current`: đang ở nhánh nào, có thay đổi dở không. Đối chiếu với HANDOFF; lệch nhau → báo mình, không đoán.
3. Đọc `docs/PLAN.md`: giai đoạn hiện tại, việc tiếp theo, quyết định đang chờ.
4. Tóm tắt lại cho mình trong 3 dòng (đang ở đâu, làm gì tiếp, đang chờ gì) rồi chờ mình xác nhận mới làm.
5. Nếu chưa rõ đang làm Issue nào → hỏi mình, không tự chọn.

Nguyên tắc: **1 phiên = 1 Issue.** Xong một Issue, mình gõ `/clear` trước khi sang Issue khác.

### Kết thúc phiên / bàn giao — `docs/HANDOFF.md`

Claude ghi (ghi đè) `docs/HANDOFF.md` theo khung có sẵn trong file đó khi:
- Mình nói kết thúc phiên, hoặc sắp gõ `/clear` hoặc `/compact`
- Ngữ cảnh khoảng 70% trở lên (xem `/context`): Claude chủ động nhắc mình và ghi bàn giao
- Xong một bước có thay đổi file trong việc nhiều bước (phòng khi phiên đứt giữa chừng)
- Xong Issue (đã merge): đặt lại HANDOFF cho Issue kế tiếp

Quy tắc ghi:
- Chỉ trạng thái hiện tại, ngắn, không nối thêm lịch sử (lịch sử đã có trong git và PR)
- Có đủ: nhánh, Issue, đã xong, đang dở, việc kế tiếp, đang chờ mình, bẫy đã gặp
- KHÔNG ghi secret, token, API key
- Có thay đổi dở chưa commit → ghi rõ file nào, vì sao dở
- Ghi xong, báo mình "đã bàn giao" rồi mới để mình `/clear`. Claude không tự `/clear`.

## 3. Vòng làm việc chuẩn cho mỗi Issue

### Bước 1 — Issue
Mọi việc bắt đầu từ một GitHub Issue theo mẫu ở Phụ lục A.
Nếu mình giao việc bằng lời mà chưa có Issue: Claude soạn Issue theo mẫu, mình duyệt rồi Claude tạo trên GitHub.

### Bước 2 — Tạo nhánh
Luôn tách từ `main` mới nhất:
```bash
git switch main && git pull
git switch -c feat/12-trang-chu
```
Tiền tố nhánh: `feat/` (tính năng), `fix/` (sửa lỗi), `content/` (bài viết), `docs/` (tài liệu), `chore/` (cấu hình, dọn dẹp).
Tên nhánh: `<tiền tố>/<số issue>-<mô tả ngắn không dấu>`.

### Bước 3 — Lập kế hoạch (Plan mode)
- Đọc Issue (`gh issue view <số>` hoặc GitHub MCP), CLAUDE.md, và các file liên quan.
- Trình kế hoạch gồm:
  - File sẽ tạo / sửa / xóa
  - Thư viện cần thêm (nếu có → phải hỏi)
  - Rủi ro
  - Cách kiểm tra kết quả
- **DỪNG chờ mình duyệt.** Chưa được sửa file nào trước khi kế hoạch được duyệt.

### Bước 4 — Thực hiện
- Làm theo kế hoạch đã duyệt. Việc nhiều hơn 3 bước: dừng chờ xác nhận sau mỗi bước có thay đổi file.
- Commit nhỏ, mỗi commit một ý, theo Conventional Commits:
  `feat(home): thêm khu vực hero trang chủ (#12)` · `fix(blog): sửa lỗi lọc danh mục (#15)`
- Phát sinh việc ngoài phạm vi Issue → ghi lại, đề xuất tạo Issue mới, không làm luôn.

### Bước 5 — Tự kiểm tra (bắt buộc trước khi mở PR)
1. `npm run lint` không lỗi
2. `npm run build` không lỗi ([B]: tạo được thư mục `out/`)
3. `ui-tester`: chụp các trang bị ảnh hưởng ở 375 / 414 / 768 / 1024 / 1440px
4. `design-reviewer`: không còn lỗi mức "phải sửa"
5. Trang mới có đủ SEO theo CLAUDE.md
6. Đạt checklist "Định nghĩa xong" trong CLAUDE.md

Lỗi ở bước nào → sửa → chạy lại từ bước đó.

### Bước 6 — Mở Pull Request
```bash
git push -u origin <tên-nhánh>
gh pr create --fill
```
Rồi viết lại phần mô tả theo mẫu ở Phụ lục B.
- Mô tả có dòng `Closes #<số issue>` để Issue tự đóng khi merge.
- Cập nhật checkbox tương ứng trong `docs/PLAN.md` ngay trong PR này.
- Báo mình link PR kèm 3 dòng: đã làm gì, cách kiểm tra nhanh, điểm cần mình chú ý.

### Bước 7 — Duyệt và merge (CHỈ chủ dự án)
Mình thực hiện:
1. Xem tab **Files changed** trên GitHub
2. Chạy thử nếu cần: `gh pr checkout <số>` rồi `npm run dev`
3. Kiểm tra CI đã xanh (khi đã có CI)
4. Với thay đổi giao diện: test tay trên ít nhất 1 thiết bị iOS thật và 1 thiết bị Android thật (Claude không làm được bước này)
5. Bấm **Squash and merge** → **Delete branch**

Nếu mình để lại bình luận review: Claude đọc bình luận, sửa trên cùng nhánh, push lại, rồi báo mình.

### Bước 8 — Sau khi merge
```bash
git switch main && git pull
git branch -d <tên-nhánh>
```

## 4. Quy trình viết bài

1. **Mình cung cấp:** tên sách, tác giả, chương, ý chính hoặc ghi chú đọc sách.
2. **Tạo nhánh:** `content/<slug>`.
3. **`content-editor` soạn bản nháp** với `draft: true`, đúng cấu trúc mục 5 của CLAUDE.md:
   - Diễn giải bằng lời mới, có ví dụ và góc nhìn riêng
   - Ghi nguồn đầy đủ (`source.book`, `source.author`)
   - KHÔNG chép nguyên văn đoạn dài từ sách
4. **Kiểm tra:**
   - Đủ trường bắt buộc
   - `description` ≤ 160 ký tự
   - `slug` không dấu
   - Ảnh nằm đúng `public/images/posts/<slug>/`
   - Build không lỗi
5. **Mở PR** → mình đọc, chỉnh giọng văn → đổi `draft: false` → merge.

Sau khi deploy: mình có thể viết trực tiếp qua CMS (`/keystatic` ở A, `/admin` ở B). Claude chỉ hỗ trợ biên tập và kiểm tra định kỳ.

## 5. Khi gặp sự cố

- **Build hoặc CI lỗi:** đọc log (`gh run view --log-failed`), tìm nguyên nhân gốc, sửa trên cùng nhánh.
  KHÔNG tắt kiểm tra, KHÔNG xóa test chỉ để "cho qua".
- **Không chắc chắn:** dừng lại, hỏi tối đa 3 câu, mỗi câu kèm đề xuất mặc định.
- **Sai hướng:** mình nhấn `Esc` hoặc dùng `/rewind`. Claude không chữa cháy chồng lên lỗi cũ.
- **Cùng một lỗi lặp 2 lần mà chưa xử lý được:** dừng, tóm tắt đã thử gì, đề xuất hướng khác.

## 6. Sổ ghi lỗi và cải tiến — `docs/claude-log.md`

Mỗi khi Claude làm sai và được sửa, thêm 1 dòng:
```
2026-10-06 | Issue #12 | dùng searchParams ở bản xuất tĩnh | quên giới hạn mục 8 CLAUDE.md B | chuyển sang route tĩnh
```

Cuối mỗi giai đoạn, Claude đọc sổ và **đề xuất** (mình quyết định):
- Sai cùng kiểu từ 2 lần → thêm 1 dòng vào CLAUDE.md
- Việc bắt buộc không được sai → chuyển thành hook
- Hướng dẫn phải nhắc lại nhiều lần → đóng gói thành skill

## 7. Đồng bộ giữa 2 dự án

- Các thay đổi sau phải làm ở CẢ 2 repo, mỗi repo một Issue gắn nhãn `sync`:
  - Cấu trúc bài viết (mục 5 CLAUDE.md)
  - `docs/design-system/`
  - `docs/WORKFLOW.md`
  - Cấu trúc `docs/PLAN.md`
- 3 bài mẫu dùng chung: copy nguyên file `.md` sang repo kia.
- Cuối mỗi giai đoạn, ghi nhận xét vào `docs/so-sanh-A-B.md` (thời gian làm, lỗi gặp, độ khó).

## 8. Ranh giới: việc CHỈ người làm

- Merge PR vào `main`
- Sửa file trong `.github/workflows/` (Claude được soạn nội dung, mình đọc rồi tự commit)
- Cài đặt repo, Rulesets, Secrets, biến môi trường
- Deploy, tên miền, hosting, thanh toán
- Tạo và gia hạn GitHub token
- Duyệt việc cài thư viện mới

Đã bị chặn bằng `.claude/settings.json`: merge PR, push thẳng `main`, force push, ghi file trực tiếp lên GitHub qua API, xóa repo, sửa secret.
Nếu một lệnh bị chặn → báo mình, KHÔNG tìm cách lách.

## 9. Lệnh dành cho mình (chủ dự án)

| Lệnh | Dùng khi |
|---|---|
| `Shift+Tab` | Chuyển chế độ; chọn Plan mode trước việc lớn |
| `Esc` | Dừng Claude giữa chừng |
| `/clear` | Bắt đầu Issue mới với ngữ cảnh sạch |
| `/context` | Xem ngữ cảnh đang đầy đến đâu |
| `/compact` | Thu gọn ngữ cảnh khi phiên dài |
| `/rewind` | Quay lại trạng thái trước khi Claude sửa sai |
| `/memory` | Xem CLAUDE.md nào đang được nạp |
| `/mcp` | Kiểm tra GitHub, Playwright đã kết nối chưa |

---

## Phụ lục A — Mẫu Issue
Lưu thành `.github/ISSUE_TEMPLATE/task.md`:
```markdown
---
name: Việc cần làm
about: Tính năng, sửa lỗi, bài viết hoặc cấu hình
labels: ''
---

## Mục tiêu
<!-- Làm xong thì người đọc / mình được gì? 1–2 câu -->

## Tiêu chí chấp nhận
- [ ]
- [ ]

## Ngoài phạm vi
<!-- Những gì KHÔNG làm trong Issue này -->

## Trang / kích thước cần kiểm tra
<!-- vd: trang chủ ở 375 / 414 / 768 / 1024 / 1440px -->

## Giai đoạn trong PLAN.md
<!-- vd: Giai đoạn 4 -->
```

## Phụ lục B — Mẫu Pull Request
Lưu thành `.github/pull_request_template.md`:
```markdown
Closes #

## Đã thay đổi
-

## File chính
-

## Cách kiểm tra
1.

## Ảnh chụp (375 / 414 / 768 / 1024 / 1440px)

## Checklist
- [ ] `npm run lint` không lỗi
- [ ] `npm run build` không lỗi
- [ ] Không vỡ giao diện ở 375 / 414 / 768 / 1024 / 1440px, và ở các điểm giữa các mốc (kéo thanh DevTools)
- [ ] Vùng bấm ≥ 44x44px, cách nhau ≥ 8px; CTA chính trong thumb zone trên mobile
- [ ] (Lộc) Đã test tay trên 1 iOS thật + 1 Android thật
- [ ] Đủ SEO (title, description, Open Graph) cho trang mới
- [ ] Đúng bảng thiết kế trong CLAUDE.md
- [ ] Đã cập nhật `docs/PLAN.md`
```

## Phụ lục C — Nhãn (labels) trên GitHub
- Loại việc: `type:feat`, `type:fix`, `type:content`, `type:docs`, `type:chore`
- Giai đoạn: `phase:0` → `phase:8`
- Trạng thái: `needs-decision` (chờ mình chốt), `blocked` (bị chặn)
- Đồng bộ: `sync` (phải làm ở cả 2 repo)
