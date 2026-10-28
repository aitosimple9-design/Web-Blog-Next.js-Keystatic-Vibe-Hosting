---
description: "Cấu trúc bài viết content/posts (frontmatter), DÙNG CHUNG với dự án B (CLAUDE.md cũ mục 5)"
paths:
  - "content/posts/**"
  - "content/topics/**"
  - "content/subtopics/**"
  - "keystatic.config.ts"
  - "scripts/check-content.mjs"
  - "src/shared/content/**"
---

# Cấu trúc bài viết — DÙNG CHUNG với dự án B, giữ đồng bộ (trước đây: CLAUDE.md mục 5)
File `content/posts/<slug>.md`, định dạng `.md` thuần (Markdown + frontmatter YAML).
Keystatic phải cấu hình lưu đuôi `.md`, KHÔNG dùng `.mdoc` mặc định
(kiểm tra tùy chọn `extension` của `fields.markdoc` trong tài liệu Keystatic khi triển khai).

```yaml
---
title: "Tiêu đề bài"                 # bắt buộc
slug: tieu-de-bai                    # bắt buộc, chữ thường, không dấu, nối bằng "-"
description: "Mô tả ≤ 160 ký tự"     # bắt buộc, dùng cho meta description + Open Graph
category: chu-de-1                   # bắt buộc, 1 trong 3 danh mục (tên thật: Q7 trong PLAN.md)
subtopics: [chu-de-1-con-1]          # bắt buộc từ 2026-10-22 [sync: cần đồng bộ sang dự án B]: ≥ 1 slug trong content/subtopics, mỗi cái phải thuộc chủ đề `category`
date: 2026-10-05                     # bắt buộc, YYYY-MM-DD; ở tương lai (giờ VN) = bài LÊN LỊCH, ẩn tới ngày đó (hiện sau lần deploy vào / sau ngày đăng)
source:                              # bắt buộc
  book: "Tên sách"
  author: "Tác giả"
cover: /images/posts/tieu-de-bai/cover.jpg   # không bắt buộc; tải ảnh trong Keystatic thì ô này TỰ ghi đúng đường dẫn nơi ảnh được lưu
draft: false                         # true = không hiển thị, không vào sitemap
# --- Trường tùy chọn thêm 2026-10-15 [sync: cần đồng bộ sang dự án B]; thiếu thì bài vẫn hợp lệ ---
status: published                    # draft | review | published; draft / review = ẩn như `draft: true`; thiếu = đã đăng
tags: [doc-sach, ghi-nho]            # thẻ, đưa vào meta keywords
seoTitle: "Tiêu đề SEO ≤ 60 ký tự"   # thẻ title riêng; thiếu thì dùng `title`
ogImage: /images/posts/tieu-de-bai/og.jpg  # ảnh chia sẻ riêng; thiếu thì dùng ảnh bìa, rồi ảnh mặc định ở Cài đặt site
related: [slug-bai-khac]             # bài liên quan chọn tay (đứng đầu mục Bài liên quan)
notes: "Ghi chú nội bộ"              # KHÔNG bao giờ hiển thị / vào HTML / metadata
updated: 2026-10-10                  # ngày sửa gần nhất (tùy chọn) → dateModified ở JSON-LD; thiếu thì dùng `date`
# --- Trường tùy chọn thêm 2026-10-16 (điểm SEO) [sync: cần đồng bộ sang dự án B]; thiếu thì bài vẫn hợp lệ, chỉ bị trừ điểm SEO ---
focusKeyword: "đọc sách chậm"        # từ khóa chính (2-4 từ); chỉ để chấm điểm SEO ở trang quản trị, KHÔNG hiện ra HTML / metadata
coverAlt: "Cuốn sổ mở trên bàn gỗ"   # mô tả ảnh bìa ≤ 125 ký tự → alt của ảnh hero và ảnh chia sẻ; thiếu thì ảnh bìa là trang trí (alt rỗng)
---
```
- `category` là tên file trong `content/topics/` (Keystatic: menu "Chủ đề"). Nó quyết định chủ đề của bài (nhãn, Hero chủ đề và danh sách ở trang Blog, bài liên quan). Trang chi tiết dùng 1 layout chung (`docs/layout/chi-tiet-bai/`). Mục 5 dùng chung với dự án B: cần đồng bộ sang B (nhãn `sync`).
- **Slug và tên ảnh:** slug (= tên file) chữ thường không dấu nối bằng `-`; **bài đã đăng KHÔNG đổi slug** (đổi là link cũ 404, mất thứ hạng; bất đắc dĩ thì phải có chuyển hướng ở menu "Chuyển hướng": `check-content` báo LỖI, CI đỏ, nếu bài đã đăng mất / đổi slug mà thiếu chuyển hướng). Ảnh: chữ thường không dấu nối `-`, bìa `cover.<đuôi>`, ảnh trong bài tên khác ảnh bìa. Chi tiết `docs/WORKFLOW.md` mục 4b; `check-content` (cả trên CI) báo LỖI khi bài đã đăng mất / đổi slug mà chưa có chuyển hướng, cảnh báo khi tên ảnh sai quy ước.
- Nội dung: diễn giải bằng lời mới, có ví dụ và góc nhìn riêng, ghi nguồn. KHÔNG chép nguyên văn đoạn dài từ sách.
