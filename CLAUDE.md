# LỘC_WEBSITE BLOG — Dự án A: Next.js (server) + Keystatic

Blog kiến thức nâng cao từ sách, dùng làm **trang đích (landing) cho traffic quảng cáo** từ các nền tảng khác.
Ưu tiên: tải nhanh, SEO chuẩn, giữ chân người đọc ngay màn hình đầu, giao diện chuyên nghiệp và khác biệt.
Chạy song song với **Dự án B** (`web_blog_static`: xuất tĩnh + Sveltia + Cloudflare) để so sánh.
Hai dự án dùng CHUNG cấu trúc bài viết (mục 5) — mọi thay đổi ở mục 5 phải đồng bộ sang dự án B.

## 0. Đọc trước khi làm việc
- `docs/HANDOFF.md` — ĐỌC ĐẦU TIÊN mỗi phiên mới: phiên trước dừng ở đâu, việc kế tiếp (xem mục 4).
- `docs/WORKFLOW.md` — quy trình Issue → nhánh → kế hoạch → code → kiểm tra → PR. BẮT BUỘC làm theo.
- `docs/PLAN.md` — giai đoạn hiện tại, việc tiếp theo, quyết định đang chờ (Q1–Q14).
- `docs/design-system/` — Design System, đọc trước bất kỳ việc UI nào: `README.md` (cách dùng), `DESIGN-SYSTEM.md` (nguyên tắc, component), `tokens.json` (giá trị), `EXTENSIONS.md` (các mở rộng đã duyệt cho dự án này). Lộc quản lý thư mục này; khi lệch với CLAUDE.md thì báo Lộc.
- `docs/layout/` — layout 3 trang: `README.md` (chỉ mục, khối dùng chung) + mỗi trang một thư mục (`chi-tiet-bai/`, `blog/`, `trang-chu/`) gồm spec `README.md` và mockup. Đọc spec trang trước khi dựng trang đó.
- `docs/claude-log.md` — các lỗi đã gặp, đừng lặp lại.

## Bản đồ tài liệu quy tắc (CLAUDE.md đã được chia nhỏ 2026-10-23)
Các quy tắc dài nằm ở `.claude/rules/`; mỗi file tự nạp khi làm việc với các đường dẫn nó khai báo (`paths`). Các tài liệu và chú thích cũ nói "CLAUDE.md mục N" thì đọc theo bảng:

| Mục cũ | File quy tắc | Nạp khi làm việc với |
|---|---|---|
| 3 Cấu trúc thư mục | `.claude/rules/cau-truc-thu-muc.md` | `content/`, `src/`, `scripts/`, `keystatic.config.ts` |
| 5 Cấu trúc bài viết | `.claude/rules/bai-viet.md` | `content/posts/`, `keystatic.config.ts`, `check-content` |
| 6 Thiết kế | `.claude/rules/thiet-ke.md` | `src/frontend/`, `src/app/`, CSS, `docs/design-system/`, `docs/layout/` |
| 7 SEO | `.claude/rules/seo.md` | `src/app/`, `next.config.ts` |
| 8 Keystatic | `.claude/rules/keystatic-admin.md` | `src/cms/`, `keystatic.config.ts`, `src/app/api/`, `content/`, `public/images/` |
Mục 0, 1, 2, 4, 9, 10, 11, 12 vẫn ở file này (luôn nạp). Khi một việc chạm tới lĩnh vực của một file quy tắc mà nó chưa tự nạp, hãy đọc file đó trước khi làm.

## 1. Stack
- Đã chốt:
  - Next.js App Router, chạy **server Node.js** (KHÔNG dùng `output: 'export'`)
  - CMS: Keystatic — hiện dùng `storage: { kind: 'local' }`; chuyển sang `kind: 'github'` ở giai đoạn deploy
  - Hosting dự kiến: PaaS Việt Nam hỗ trợ Node.js — CHƯA mua. **Tạm thời** (giai đoạn phát triển / thử, Lộc quyết định 2026-10-19) dùng **Vercel**: dự án `web-blog-next-js-keystatic-vibe-hosting` thuộc team `aitosimple`, nối GitHub, chỉ build nhánh `main`, bảo vệ đăng nhập Vercel cho địa chỉ `vercel.app`. Đây KHÔNG phải quyết định hosting chính thức; đừng sửa dòng này thành Vercel
  - **Biến môi trường** (đặt ở Vercel → Settings → Environment Variables, target production + preview; bản mẫu ở `.env.example`, máy cá nhân ở `.env.local` gitignore): `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` (máy cá nhân: `local`), `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (4 biến sau do GitHub App của Keystatic cấp; secret không bao giờ vào repo / chat), và `NEXT_PUBLIC_SITE_URL` = địa chỉ chính thức của web (sitemap, canonical, ảnh chia sẻ, JSON-LD; không có dấu `/` ở cuối; hiện là địa chỉ `vercel.app`, ĐỔI sang tên miền thật khi gắn tên miền rồi Redeploy). Đổi biến Vercel chỉ có hiệu lực sau Redeploy
  - Máy làm việc: Windows (Q1)
  - TypeScript, npm, Next.js 16.4.0 (Q2, Q4, Q5; kiểm tra lỗi Keystatic GitHub mode ở GĐ2/GĐ8, lỗi thì hạ về 15.x)
  - `next.config.ts` KHÔNG bật `cacheComponents` (chưa chắc tương thích Keystatic); xem lại ở GĐ2
  - CSS: Tailwind CSS bản mới nhất (Q3)
  - Đọc bài: dùng cả thư viện đọc frontmatter và thư viện render Markdown (Q6); chọn cụ thể + hỏi trước khi cài
  - Kích thước ảnh trong thân bài: thư viện `image-size` (Lộc duyệt cài 2026-10-16; MIT, không phụ thuộc phụ) đọc width / height thật lúc dựng HTML để hết nhảy bố cục (CLS), qua plugin `src/shared/content/rehype-image-size.ts`
  - Danh mục: demo trước, đặt ở một nơi cấu hình để sửa / thêm được (Q7)
  - Font / design: theo Design System trong `docs/design-system/` (Q8)
- Chưa chốt: xem bảng "Quyết định đang chờ" trong `docs/PLAN.md`. KHÔNG tự chọn; hỏi khi tới giai đoạn cần.
  Riêng phiên bản Next.js: kiểm tra lỗi "Keystatic GitHub mode trắng trang trên Next.js 16" trong issue của Thinkmill/keystatic trước khi đề xuất.

## 2. Lệnh
- `npm run dev` — http://localhost:3000, quản trị bài: http://localhost:3000/keystatic
- `npm run lint`
- `npm run build` — PHẢI chạy không lỗi trước khi mở PR
- `npm run check-content` — kiểm tra bài / chủ đề / sách / ảnh trước khi đăng: LỖI (thoát mã 1) như thiếu trường, chủ đề không tồn tại, file ảnh mất, bài liên quan sai; CẢNH BÁO như sách chưa có bìa, mô tả ngắn; THÔNG TIN bài lên lịch; từ 2026-10-16 có thêm CẢNH BÁO điểm SEO của từng bài (mục chưa đạt, dùng `src/shared/seo-score.ts`, cần Node ≥ 22.18) và ảnh trong bài trùng file với ảnh bìa (Keystatic ghi đè hai ảnh cùng tên). Chạy trước khi mở PR có đổi nội dung
- `npm run make-redirects -- --base main [--to /blog] [--dry]` — tạo sẵn chuyển hướng cho bài ĐÃ ĐĂNG bị xóa so với `main` (dọn nhiều bài một lúc). `check-content --base <ref>` (CI tự dùng nhánh đích) báo LỖI khi bài đã đăng mất / đổi slug mà chưa có chuyển hướng (bài mẫu slug `demo-*` được miễn); cũng báo LỖI khi chủ đề (`/blog/<slug>`) mất / đổi slug mà thiếu chuyển hướng, và khi link nội bộ trong thân bài (`](/bai-viet/...)`, `href="/..."`) trỏ tới trang không tồn tại hoặc bài chưa đăng (bài đã đăng: LỖI; bài nháp: CẢNH BÁO; link đi qua chuyển hướng: CẢNH BÁO)
- `npm run prune-images` — liệt kê thư mục ảnh MỒ CÔI (không còn bài / chủ đề / sách tương ứng); thêm `-- --delete` để xóa. Chỉ cần ở chế độ GitHub (chế độ local tự dọn khi xóa)
- `npm test` — test đơn vị (Vitest). Thư mục `tests/unit/` PHẢN CHIẾU `src/`: `frontend/`, `cms/`, `shared/`, `app/` (test mã ở vùng đó) và `project/` (kiểm tra xuyên suốt: ranh giới vùng `layers`, đồng bộ admin `admin-sync`, `keystatic`, `check-content`). Test mới đặt theo vùng của file mã nó kiểm tra
- `npm run test:e2e` — E2E bằng Playwright, ba project: `tests/e2e/admin-github/` (đường GitHub của quản trị: `next dev` chế độ github cổng 3201 + MÁY CHỦ GITHUB GIẢ `mock-github.mjs` cổng 3300 qua biến `GITHUB_API_URL`, thử xác minh quyền, tạo chuyển hướng ghi vào nhánh, xem trước / chấm SEO từ nhánh; không đụng repo thật), `tests/e2e/public/` (web công khai: build + start cổng 3100) và `tests/e2e/admin/` (trang quản trị Keystatic: `next dev` chế độ local cổng 3200, thư mục build riêng `.next-e2e` qua biến `NEXT_DIST_DIR` nên chạy song song được với `npm run dev` của máy; CHỈ ĐỌC, và tự kiểm tra không làm đổi `content/` / `public/images/`). Sửa trang quản trị (`src/cms/`, `keystatic.config.ts`, `src/app/api/`) thì chạy cả hai
- `npm run typecheck` — kiểm tra kiểu TypeScript; `npm run tokens` — sinh lại `src/frontend/styles/tokens.css` khi sửa `tokens.json`

## 3. Cấu trúc thư mục (đổi cấu trúc = phải hỏi trước)
Chi tiết ở `.claude/rules/cau-truc-thu-muc.md` (tự nạp khi làm việc với `content/`, `src/`, `scripts/`, `keystatic.config.ts`). Tóm tắt: `content/` là nguồn dữ liệu duy nhất (bài, chủ đề, chủ đề con, sách, chuyển hướng, trang, cài đặt); `src/` chia ba vùng `frontend/` · `cms/` · `shared/` (+ `app/` chỉ chứa route, mỏng; luật ranh giới có test chặn); đổi cấu trúc = phải hỏi trước. Mọi trang lấy bài viết qua `src/shared/content/posts.ts`.

## 4. Cách làm việc với mình
- Luôn trả lời bằng tiếng Việt. Thuật ngữ tiếng Anh giữ nguyên, giải thích 1 câu ở lần đầu.
- Mình tự học, mới biết React cơ bản, đang học Next.js → giải thích ngắn khi dùng khái niệm mới.
- Mỗi Issue: trình kế hoạch trước (Plan mode), DỪNG chờ duyệt rồi mới sửa file.
- Việc nhiều hơn 3 bước: làm từng bước, DỪNG chờ xác nhận sau mỗi bước có thay đổi file.
- PHẢI hỏi trước khi: cài/gỡ thư viện, đổi phiên bản Next.js, đổi cấu trúc thư mục, đổi tên/xóa file,
  đổi cấu trúc dữ liệu bài viết, mọi thứ liên quan deploy / tên miền / biến môi trường.
  Cách hỏi: 2–3 phương án, mỗi phương án 1 dòng ưu + 1 dòng nhược, kèm đề xuất.
- Không chắc: hỏi tối đa 3 câu, mỗi câu kèm đề xuất mặc định.
- Khi báo xong: thay đổi gì, ở file nào, cách mình tự kiểm tra.
- **Bàn giao giữa các phiên (`docs/HANDOFF.md`):**
  - Đầu phiên: đọc HANDOFF.md trước, đối chiếu với `git status`, tóm tắt 3 dòng cho mình rồi chờ xác nhận.
  - Ghi (ghi đè) HANDOFF.md khi: mình kết thúc phiên / sắp `/clear` hoặc `/compact`; ngữ cảnh ≥ 70% (nhắc mình trước);
    xong một bước có thay đổi file; xong Issue.
  - Nội dung: nhánh, Issue, đã xong, đang dở, việc kế tiếp, đang chờ mình, bẫy đã gặp. Ngắn, chỉ trạng thái hiện tại.
  - KHÔNG ghi secret. File nằm trong `.gitignore`. Ghi xong báo "đã bàn giao" rồi mới để mình `/clear`.
  - Chi tiết: `docs/WORKFLOW.md` mục 2.

## 5. Cấu trúc bài viết — DÙNG CHUNG với dự án B, giữ đồng bộ
Chi tiết ở `.claude/rules/bai-viet.md` (tự nạp khi làm việc với `content/posts/`, `keystatic.config.ts`, `check-content`). File `content/posts/<slug>.md` (Markdown + frontmatter YAML); bài đã đăng KHÔNG đổi slug; mọi thay đổi cấu trúc bài phải đồng bộ sang dự án B.

## 6. Thiết kế
Chi tiết ở `.claude/rules/thiet-ke.md` (tự nạp khi làm việc với `src/frontend/`, `src/app/`, CSS, `docs/design-system/`, `docs/layout/`). Tóm tắt: Design System "Blog Book Mono" là nguồn duy nhất (`docs/design-system/`); hai theme Giấy / Đêm; chỉ dùng token; MỘT màu nhấn; chuyển động chỉ `transform` + `opacity`; 5 mốc responsive; vùng bấm ≥ 44px. Mỗi khi đổi quy ước giao diện phải cập nhật cùng lúc các tài liệu ghi ở cuối file đó.

## 7. SEO — bắt buộc mỗi trang
Chi tiết ở `.claude/rules/seo.md` (tự nạp khi làm việc với `src/app/`, `next.config.ts`). Tóm tắt: mỗi trang có `title`, `description`, Open Graph, JSON-LD với trang bài; chỉ production thật mới được lập chỉ mục.

## 8. Riêng cho Keystatic
Chi tiết ở `.claude/rules/keystatic-admin.md` (tự nạp khi làm việc với `src/cms/`, `keystatic.config.ts`, `src/app/api/`, `content/`, `public/images/`). Tóm tắt: `keystatic.config.ts` khớp 100% với cấu trúc bài; thêm / xóa gì phải đồng bộ với trang quản trị (không để ảnh mồ côi, không để nội dung chỉ sửa được trong mã); luật dọn ảnh nằm MỘT nơi (`src/cms/lib/content-cleanup.ts`).

## 9. Công cụ
- **Subagents:** `design-reviewer`, `ui-tester` (Playwright), `content-editor`, `admin-sync-reviewer` (kiểm tra nguyên tắc đồng bộ admin, mục 8), `ui-ornament-director` (đạo diễn họa tiết: ra 3 phương án họa tiết / chiều sâu / chi tiết "chữ ký" cho một khối, chỉ đọc; Lộc yêu cầu 2026-10-22); dùng `Explore` khi cần đọc nhiều file.
- **Khi nào gọi subagent (tiết kiệm token, Lộc yêu cầu 2026-10-16):**
  - `ui-tester` và `design-reviewer`: CHỈ khi thay đổi làm đổi DIỆN MẠO NHÌN THẤY của trang công khai (CSS, bố cục, markup, component mới, ảnh / màu / cỡ chữ). KHÔNG gọi khi chỉ đổi nguồn dữ liệu (đọc chữ / ảnh từ Keystatic), trang quản trị, script, test, tài liệu. Trang đã được `ui-tester` kiểm tra mà không đổi diện mạo thì KHÔNG chạy lại. Muốn chứng minh "mặc định giống hệt trước" thì so HTML trước / sau (`npm run build`, `curl` trang) hoặc dùng test, không chụp màn hình.
  - Khi buộc phải gọi `ui-tester`: MỘT lượt, chỉ các trang bị đổi, 3 mốc đại diện (375, 768, 1440px) và 1 theme; chỉ mở rộng 5 mốc × 2 theme khi đổi bố cục lớn hoặc component dùng chung. Giao đúng trang, không "quét cả site".
  - `ui-ornament-director`: CHỈ khi bắt đầu thiết kế hoặc làm lại MỘT khối giao diện mới (Lộc đưa ảnh mẫu hoặc nói UI "chưa đẹp"). Không gọi cho sửa nhỏ / khoảng cách / chữ, không gọi lại khi đã chọn xong phương án. Việc nhỏ hơn thì dùng thẳng skill `ui-ornament-ideas` ngay trong phiên, không mở agent.
  - `admin-sync-reviewer`: CHỈ khi thêm / đổi cấu trúc admin (collection, singleton, ô ảnh, luật dọn ảnh) hoặc thêm nội dung mới hiển thị trên web. Không gọi cho thay đổi giao diện thuần, sửa bài, tài liệu. Test `tests/unit/project/admin-sync.test.ts` chạy ở CI đã chặn phần lớn lỗi.
  - Không chạy hai agent cho cùng một việc; sửa lỗi nhỏ đã biết thì tự chạy `lint` / `test` / `build` rồi xác nhận, không gọi lại agent. Agent tập trung vào việc thiết kế / kiểm tra có giá trị, không lặp lại việc đã làm.
- **Skills thiết kế:** `ui-ornament-ideas` (của dự án, `.claude/skills/ui-ornament-ideas/`: quy trình ý tưởng họa tiết + kho họa tiết đã dùng / ứng viên mới; dùng TRƯỚC khi dựng hoặc làm lại một khối; khối nào Lộc duyệt mở rộng thì ghi vào `EXTENSIONS.md` và cập nhật kho họa tiết), `frontend-design-direction` (trước khi dựng trang mới), `make-interfaces-feel-better`,
  `frontend-a11y` (form, modal, menu), `motion-system` (khi thêm animation).
- **Plugin:** `feature-dev` cho tính năng lớn; `code-review` trước khi mở PR; `commit-commands` cho commit/PR.
- **MCP:** `github` (Issue, PR, đọc log CI), `playwright` (qua `ui-tester`), `context7` (tài liệu thư viện mới nhất — dùng khi viết code Next.js / Tailwind / Keystatic).
  - **Tìm ảnh (Lộc yêu cầu 2026-10-22):** `unsplash` (`@hanoak/unsplash-mcp-server@1.2.1`) và `pexels` (`@hanoak/pexels-mcp-server@1.0.2`), cả hai là gói cộng đồng KHÔNG chính thức (đã đọc mã: chỉ gọi `api.unsplash.com` / `api.pexels.com`, không có script cài đặt, đã ghim phiên bản). Khai báo ở `.mcp.json`; khóa API (`UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`) do Lộc tự nhập ở `.claude/settings.local.json` (gitignore), Claude KHÔNG nhập hay in khóa. Dùng để tìm ảnh cho khối giao diện (skill `ui-ornament-ideas`). Quy tắc khi dùng ảnh: chỉ tải ảnh Lộc đã chọn, lưu đúng thư mục `public/images/...`, ghi tác giả, nguồn, giấy phép vào `public/images/CREDITS.md`; với Unsplash gọi `unsplash_track_download` khi dùng ảnh và hiện ghi công ở nơi cần; nén WebP trong ngân sách tốc độ. Nâng phiên bản gói phải đọc lại mã và hỏi Lộc.
- Tên thật của công cụ có thể khác bản cài: nếu không tìm thấy, báo mình thay vì tự đoán.

## 10. Git & GitHub
- Repo: `aitosimple9-design/web_blog`. Nhánh chính: `main`.
- KHÔNG làm việc trực tiếp trên `main`. Mỗi Issue một nhánh theo `docs/WORKFLOW.md`.
- Commit nhỏ, theo Conventional Commits, có số Issue: `feat(home): thêm hero (#12)`.
- Mọi thay đổi code đi đường: nhánh trên máy → `git push` nhánh → Pull Request.
  Không ghi file trực tiếp lên GitHub qua API.
- Mô tả PR theo `.github/pull_request_template.md`, có `Closes #<số>`.
- **Tự merge PR nội dung (Lộc duyệt 2026-10-18):** `.github/workflows/auto-merge-content.yml` bật auto-merge (squash) cho PR mà MỌI file đổi nằm trong `content/` hoặc `public/images/` (nơi trang quản trị Keystatic ghi); CI xanh thì tự merge. PR đụng file khác (src, scripts, .github, keystatic.config.ts, package.json…) KHÔNG tự merge, Lộc duyệt. PR do Claude mở để sửa code vẫn do Lộc merge.
- Merge là việc của mình. Lệnh bị chặn bởi `.claude/settings.json` → báo mình, KHÔNG tìm cách lách.

## 11. Định nghĩa "xong" — kiểm tra trước khi mở PR
- [ ] `npm run lint` và `npm run build` không lỗi
- [ ] Chỉ khi ĐỔI diện mạo nhìn thấy: `ui-tester` không vỡ giao diện (3 mốc đại diện; 5 mốc khi đổi bố cục lớn). Thay đổi chỉ đổi nguồn dữ liệu / admin: bỏ qua mục này
- [ ] Vùng bấm ≥ 44x44px, cách nhau ≥ 8px; CTA chính nằm trong thumb zone trên mobile
- [ ] Chỉ khi ĐỔI diện mạo nhìn thấy: `design-reviewer` không còn lỗi mức "phải sửa"
- [ ] Trang mới có đủ SEO ở mục 7
- [ ] Nếu đổi CẤU TRÚC admin (collection / singleton / ô ảnh / luật dọn ảnh): `admin-sync-reviewer` không còn vi phạm; xóa / thay ảnh trong admin đã thử thật (mục 8)
- [ ] Đã cập nhật checkbox trong `docs/PLAN.md`
- [ ] Đã nói rõ: thay đổi gì, ở file nào, cách tự kiểm tra

## 12. Không bao giờ
- Sửa hoặc xóa file trong `content/posts/` khi mình không yêu cầu rõ
- Đưa secret vào code hoặc commit, hoặc in giá trị secret ra chat. Được phép (Lộc cho phép 2026-10-19): thêm biến KHÔNG bí mật vào `.env.example` / `.env.local` và vào Vercel (qua MCP) khi Lộc yêu cầu; biến bí mật chỉ Lộc tự nhập
- Tự cài thư viện, tự đổi phiên bản, tự deploy, tự merge
- Sửa `.github/workflows/` Cho phép sửa nhưng cần hỏi đang chuẩn bị sửa gì
- Chép nguyên văn đoạn dài từ sách vào bài viết
