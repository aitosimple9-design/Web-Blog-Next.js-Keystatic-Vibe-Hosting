---
description: "SEO bắt buộc mỗi trang, chỉ production được lập chỉ mục (CLAUDE.md cũ mục 7)"
paths:
  - "src/app/**"
  - "src/frontend/lib/indexing.ts"
  - "src/shared/site-url-check.ts"
  - "next.config.ts"
---

# SEO — bắt buộc mỗi trang (trước đây: CLAUDE.md mục 7)
- `title`, meta `description`, Open Graph (Metadata API: `metadata` / `generateMetadata`)
- URL dạng slug không dấu
- JSON-LD `Article` của trang bài có `image` (tuyệt đối; thứ tự ảnh chia sẻ riêng → bìa → ảnh mặc định ở Cài đặt site), `datePublished`, `dateModified` (= `updated` hoặc `date`)
- Toàn site: `src/app/sitemap.ts` + `src/app/robots.ts`; bài `draft: true` không vào sitemap
- **Chỉ production thật mới được lập chỉ mục** (`src/frontend/lib/indexing.ts`, `isIndexable()`): trên Vercel là `VERCEL_ENV=production`; bản xem trước (preview), máy cá nhân và mọi môi trường khác bị chặn bằng `robots.txt` (`Disallow: /`, không sitemap), thẻ meta `robots` noindex (layout) và header `X-Robots-Tag` (next.config.ts). Host không phải Vercel: đặt biến môi trường `ALLOW_INDEXING=true` ở bản production (đụng biến môi trường: hỏi Lộc trước). Cần đặt `NEXT_PUBLIC_SITE_URL` đúng tên miền thật ở production: nếu sai (trống, localhost, không https, dấu `/` cuối) thì build production DỪNG với thông báo cách sửa (`src/shared/site-url-check.ts`, mục 3); đổi biến xong phải Redeploy.
