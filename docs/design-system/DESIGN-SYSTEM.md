---
version: alpha
name: Blog-Book-Mono-design-system
description: "Phiên bản đen trắng phối kem nhẹ của Blog Book, một blog ghi chép từ sách: giấy kem, chữ serif cho bài đọc dài, màu nhấn duy nhất là chính màu mực (đen ở theme Giấy, kem ở theme Đêm), bìa sách có `cover-shadow`; khối nổi (nút chính, thẻ, ô nhập) dùng thang `elevated-sm/md/lg` (từ 2026-10-07). Chỉ khác bản đỏ đô về màu; thêm một nền trang trí paper-deep."

# Giá trị số liệu: xem tokens.json

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "{spacing.3} {layout.button-pad-x}"
    height: "{layout.touch-target}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "{spacing.3} {layout.button-pad-x}"
    height: "{layout.touch-target}"
    border: "{layout.border-width} {colors.rule-strong}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "{spacing.3} {spacing.2}"
    height: "{layout.touch-target}"
  button-small:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.2} {layout.button-sm-pad-x}"
    height: "{layout.touch-target-sm}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    size: "{layout.touch-target}"
  text-link:
    textColor: "{colors.accent}"
    typography: "{typography.prose}"
    decoration: "underline {layout.border-width}, offset {layout.underline-offset}"
  site-header:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.nav}"
    height: "{layout.header-height}"
    border: "{layout.border-width} bottom {colors.rule}"
  book-cover:
    backgroundColor: "{colors.paper-sunk}"
    rounded: "{rounded.cover}"
    shadow: "{shadows.cover-light}"
    aspectRatio: "{layout.cover-ratio}"
  book-card:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    gap: "{spacing.4}"
    width: "max {layout.book-card-max}"
  rating:
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    iconSize: "{layout.icon-size}"
    iconColor: "{colors.accent}"
  tag-filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.2} {layout.button-sm-pad-x}"
    height: "{layout.touch-target-sm}"
    border: "{layout.border-width} {colors.rule-strong}"
  tag-filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
  tag-topic:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-soft-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "{spacing.1} {layout.tag-topic-pad-x}"
  post-card:
    textColor: "{colors.ink}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.md}"
    imageRatio: "{layout.post-image-ratio}"
    gap: "{spacing.4}"
  topic-card:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.5}"
    border: "{layout.border-width} {colors.rule}"
  feature-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "{spacing.9} 0"
  feature-inverse:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.on-inverse}"
    typography: "{typography.display-xl}"
    padding: "{spacing.9} 0"
  article-header:
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    maxWidth: "{layout.measure-prose}"
    padding: "{spacing.8} {spacing.5} {spacing.6}"
  prose:
    textColor: "{colors.ink}"
    typography: "{typography.prose}"
    maxWidth: "{layout.measure-prose}"
    padding: "0 {spacing.5}"
  takeaways:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.prose-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.5}"
  toc:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    width: "{layout.toc-width}"
  book-ref:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "{spacing.4}"
    border: "{layout.border-width} {colors.rule}"
  input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.ui-body}"
    rounded: "{rounded.sm}"
    padding: "0 {spacing.4}"
    height: "{layout.touch-target}"
    border: "{layout.border-width} {colors.rule-strong}"
  search-input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.ui-body}"
    rounded: "{rounded.pill}"
    padding: "0 {spacing.5}"
    height: "{layout.touch-target}"
  newsletter:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  site-footer:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.ui-body}"
    padding: "{spacing.8} 0 {spacing.6}"
---

## Overview

Blog Book Mono là hệ thiết kế cho một blog ghi chép kiến thức từ sách: **giao diện nhường chỗ cho trang sách**. Nền giấy, chữ serif cho bài đọc dài, bìa sách nhấc lên bằng `cover-shadow`. Từ 2026-10-07 thêm lớp premium: gradient tông ấm cho nút chính và bề mặt nổi, đổ bóng nhiều lớp `elevated-*` cho thẻ, nút, ô nhập. Bài đọc vẫn là trung tâm (`{typography.prose}`, khổ dòng `{layout.measure-prose}`); lớp premium chỉ nằm ở khung giao diện, không chạm vào thân bài.

Đây là phiên bản **đen trắng phối kem nhẹ** của Blog Book (đỏ đô). Chữ, bố cục, hình dạng và component giữ nguyên; khác ở màu nhấn (đen/kem thay cho đỏ đô) và một nền trang trí riêng `{colors.paper-deep}` cho tông kem.

Hệ thống kế thừa sự tiết chế của bản Apple Design đầu tiên (một màu tương tác, khoảng trắng rộng, dải nền xen kẽ làm đường phân cách) nhưng chữ, màu, bố cục và component đã làm lại cho việc đọc tiếng Việt. Có hai theme: **Giấy** (sáng, mặc định) và **Đêm** (tối, đọc ban đêm), đặt bằng `data-theme="light|dark"` trên `<html>` (cách làm: xem README.md).

**Key Characteristics:**
- Một màu tương tác duy nhất, chính là màu mực (`{colors.accent}`: đen ở theme Giấy, kem ở theme Đêm). Vì gần như trùng `{colors.ink}`, thứ bậc đến từ cỡ chữ, độ đậm và khoảng trắng; liên kết trong bài luôn gạch chân.
- Chữ serif (`Source Serif 4`) cho tiêu đề và bài đọc; chữ sans (`Be Vietnam Pro`) cho giao diện (nút, nav, meta, form).
- Dải nền xen kẽ (`paper` ↔ `paper-sunk` ↔ `inverse`) là đường phân cách; không dùng viền giữa các dải. Từ 2026-10-07, chỗ nối giữa `paper` và `paper-sunk` / `paper-raised` (chân trang) được làm mềm bằng vùng chuyển mờ (`seam-*`, cao 56–112px) thay cho cạnh cứng, để không hiện đường phân màu.
- Đổ bóng theo đúng thang `elevated-sm/md/lg` (nhiều lớp, có giá trị riêng cho Giấy / Đêm) và `cover-shadow` cho bìa sách; không tự chế giá trị ngoài thang.
- Nút hành động bo `radius-sm`; `radius-pill` chỉ cho tag và ô tìm kiếm.
- Mục tiêu chạm đủ lớn (xem Touch Targets); mọi cặp chữ và nền đạt ngưỡng tương phản WCAG ở cả hai theme (xem bảng Contrast).
- Gradient chỉ cho nút hành động chính, CTA và bề mặt khối nổi (`gradient-primary`, `gradient-primary-hover`, `gradient-surface`); không dùng cho nền trang, chữ hay ảnh bài. Không ảnh nền phủ chữ. (Lộc duyệt 2026-10-07, xem `EXTENSIONS.md`.)

## Colors

> Giá trị hex của từng theme nằm trong `tokens.json`; mọi component dùng `var(--tên-token)`, không viết mã hex trong CSS. Mỗi token có giá trị theme Giấy (sáng) và Đêm (tối).

### Brand & Accent
- **Mực** (`{colors.accent}`): màu tương tác duy nhất, gần như trùng `{colors.ink}`. `{colors.accent-strong}` cho hover và nhấn. Ở theme Đêm cả hai chuyển sang kem sáng và trắng.
- **Tông ấm** (`{colors.accent-warm}`, thêm 2026-10-07): nâu than (Giấy) / cát vàng nhạt (Đêm), chỉ dùng làm đầu gradient (`gradient-primary*`) và họa tiết trang trí (dấu thoi, đường kẻ); không làm chữ hay nền phẳng. `{colors.input-icon-color}`: màu icon đầu ô nhập khi nghỉ.
- `{colors.accent}`: liên kết, nút chính, sao đánh giá, vòng focus. `{colors.on-accent}`: chữ trên nền `accent`. `{colors.accent-soft}`: nền nhãn chủ đề và hộp điểm chính (`takeaways`), với chữ `{colors.accent-soft-ink}`. `{colors.accent-on-inverse}`: liên kết và nhãn trên dải `inverse`.

### Surface
- `{colors.paper}` cho trang, `{colors.paper-raised}` cho thẻ và ô nhập, `{colors.paper-sunk}` cho dải xen kẽ, chân trang và khối đăng ký, `{colors.inverse}` cho dải tối. `{colors.paper-deep}` là kem đậm, chỉ để trang trí (bìa giữ chỗ, hình Cover); chỉ đặt chữ `{colors.ink}` lên đó. Màu nền đổi giữa các dải là đường phân cách; không dùng viền.

### Text
- `{colors.ink}` cho tiêu đề và đoạn văn; `{colors.ink-soft}` cho dek và tóm tắt; `{colors.ink-faint}` chỉ cho meta, chú thích, placeholder. Trên `{colors.inverse}` dùng `{colors.on-inverse}`, `{colors.on-inverse-soft}`.

### Hairlines & Borders
- `{colors.rule}` chỉ để trang trí (đường kẻ mảnh, viền thẻ), không đạt mốc tương tác cho điều khiển.
- `{colors.rule-strong}` là viền của mọi điều khiển (nút phụ, ô nhập, tag, viền chip), đạt mốc 3:1 của thành phần giao diện.

### Contrast (WCAG, tính bằng script từ giá trị thật)

Đây là nơi duy nhất ghi tỉ lệ tương phản; `tokens.json` chỉ ghi vai trò của từng token.

| Cặp | Dùng cho | Giấy | Đêm |
| --- | --- | --- | --- |
| `ink` / `paper` | Chữ chính trên trang | 19.0:1 | 17.0:1 |
| `ink-soft` / `paper` | Dek, tóm tắt | 9.9:1 | 11.3:1 |
| `ink-faint` / `paper` | Meta, chú thích | 5.9:1 | 6.8:1 |
| `ink-faint` / `paper-sunk` | Meta trên dải xen kẽ | 5.4:1 | 7.1:1 |
| `accent` / `paper` | Liên kết, nút, sao | 19.0:1 | 17.0:1 |
| `on-accent` / `accent` | Chữ trên nút chính | 19.8:1 | 17.8:1 |
| `on-accent` / `accent-warm` | Chữ trên đầu ấm của gradient nút chính | 10.8:1 | 12.0:1 |
| `accent-soft-ink` / `accent-soft` | Nhãn chủ đề | 16.0:1 | 14.0:1 |
| `ink-faint` / `paper-raised` | Dek mục (`SectionHead`), meta trên thẻ nổi | 6.2:1 | 6.3:1 |
| `paper` / `ink` | Nhãn nổi tên nền tảng (tooltip mạng xã hội) | 19.0:1 | 17.0:1 |
| `accent-warm` / `paper` | Họa tiết trang trí (không mang chữ, mốc 3:1) | 10.3:1 | 11.4:1 |
| `rule-strong` / `paper` | Viền điều khiển (mốc 3:1) | 3.7:1 | 4.1:1 |
| `on-inverse` / `inverse` | Chữ trên dải tối | 18.8:1 | 14.2:1 |
| `on-inverse-soft` / `inverse` | Chữ phụ trên dải tối | 9.3:1 | 8.0:1 |
| `accent-on-inverse` / `inverse` | Liên kết trên dải tối | 19.8:1 | 14.2:1 |

Quy tắc: chữ thường tối thiểu 4.5:1, chữ lớn (từ cỡ `display-sm` trở lên) và viền điều khiển tối thiểu 3:1. Đừng truyền đạt thông tin chỉ bằng màu: kèm chữ, biểu tượng hoặc hình dạng (sao đặc và rỗng, gạch chân liên kết, biểu tượng báo lỗi).

## Typography

### Font Family
- **Serif** (`--font-serif`, Source Serif 4): tiêu đề, dek, bài đọc, tóm tắt thẻ.
- **Sans** (`--font-sans`, Be Vietnam Pro): nút, nav, meta, form, nhãn.
- Chuỗi dự phòng đầy đủ nằm ở `type.families` trong `tokens.json`. Cách nạp font (subset, `display`, `next/font/google`): xem README.md.

### Hierarchy
Cỡ chữ, line-height, trọng số và tracking của từng token: xem `type.groups` trong `tokens.json`. Vai trò:
- **Serif, tiêu đề:** `display-xl` (hero trang chủ), `display-lg` (h1 bài viết), `display-md` (h2 trong bài; tiêu đề khối lớn), `display-sm` (h3; tiêu đề thẻ bài lớn), `title` (thẻ sách và thẻ bài nhỏ).
- **Serif, đọc:** `dek` (mô tả dưới tiêu đề bài), `pull-quote` (câu trích nổi bật), `prose` (đoạn văn bài trên desktop), `prose-sm` (đoạn văn bài trên điện thoại, từ `bp-phone` trở xuống), `excerpt` (tóm tắt trong thẻ bài).
- **Sans, giao diện:** `ui-body` (form, danh sách, chân trang), `ui-strong`, `label` (nhãn tag, nhãn trường nhập), `caption` (meta, chú thích ảnh, dòng pháp lý), `eyebrow` (nhãn chủ đề viết hoa), `button`, `nav`.

### Principles
- Không hạ line-height của tiêu đề xuống thấp hơn giá trị trong token (thấp nhất là `display-xl`) để dấu tiếng Việt chồng (ệ, ẫ, ử) không bị cắt.
- Không dùng letter-spacing âm cho chữ dưới `tracking-neg-limit`; chỉ `display-xl` và `display-lg` có tracking âm, và hạ về 0 ở khung hẹp.
- Chỉ dùng các trọng số có trong token; trọng số trung (`label`, `nav`) chỉ cho sans, không dùng đậm hơn mức của `display-xl`.
- Bài đọc là `prose`, khổ dòng tối đa `measure-prose`; từ `bp-phone` trở xuống dùng `prose-sm`. Không đặt chữ bài đọc nhỏ hơn `prose-sm`.
- `eyebrow` chỉ cho cụm ngắn, viết hoa bằng CSS.
- Ngày đăng viết bằng chữ ("03 tháng 10, 2026") kèm thời gian đọc ("8 phút đọc"), dùng `caption` màu `ink-faint`.

### Note on Font Substitutes
- Nếu không nạp được Source Serif 4, chuỗi dự phòng là Source Serif Pro, Georgia, Times New Roman. Nếu không nạp được Be Vietnam Pro, dùng `system-ui`. Hai họ này được chọn vì hỗ trợ tiếng Việt; hỗ trợ subset `vietnamese` chưa được kiểm tra trực tiếp trên Google Fonts (xem Known Gaps).

## Layout

### Spacing System
- Thang `space-1` đến `space-9`; đơn vị gốc là `space-1`, các bậc lớn là bội của `space-2`. Giá trị: xem `tokens.json`. Vai trò chính:
  - Lề ngang trang và padding thẻ: `space-5`. Khe trong thẻ, padding hộp nhỏ: `space-4`. Padding khối lớn (Newsletter) và khe giữa cột: `space-6`.
  - Padding dọc một dải: `space-9` ở khung rộng, `space-7` dưới `bp-tablet`. Khe giữa các phần lớn, đầu bài: `space-8`.
  - Khe nhỏ: `space-1` (sao, icon và chữ), `space-2` (trong nút, giữa tiêu đề và dòng phụ), `space-3` (giữa nhóm nhỏ).

### Grid & Container
- Vùng nội dung tối đa `content-max` căn giữa, lề ngang `space-5`. Thân bài hẹp hơn: `measure-prose`.
- Thanh đầu trang cao `header-height`. Bìa sách có tỉ lệ `cover-ratio`; ảnh bài `post-image-ratio`.
- Lưới: sách 4, 3, 2, 1 cột; bài 3, 2, 1 cột theo các mốc breakpoint (xem Responsive Behavior).
- Trang chủ là chuỗi dải xen kẽ: `feature` (giấy), lưới `post-card` và `topic-card`, một dải `paper-sunk` hoặc `inverse` cho `newsletter`, rồi `site-footer`.

### Whitespace Philosophy
- Khoảng trắng là cách tạo thứ bậc chính: dải rộng với padding dọc `space-9`, thân bài khổ hẹp, không chồng chrome. Muốn nhấn mạnh một khối, đổi nền dải trước khi thêm viền hay đổ bóng.

## Elevation & Depth

| Mức | Xử lý | Dùng cho |
| --- | --- | --- |
| Phẳng | Không đổ bóng | Chữ, dải nền, thanh đầu trang |
| Nổi nhẹ | `elevated-sm` | Nút chính khi nghỉ, ảnh bài, ô nhập khi nghỉ |
| Nổi vừa | `elevated-md` | Thẻ, khối form, nút chính khi hover, ô nhập khi hover / focus |
| Nổi cao | `elevated-lg` | Thẻ khi hover, bảng tìm kiếm, khối nổi chính |
| Bìa sách | `cover-shadow` (giá trị sáng và tối: xem `tokens.json`) | `book-cover` đặt trên bề mặt |
| Thanh đầu trang | Nền `paper` mờ (`header-backdrop-opacity`) + `backdrop-filter` (`header-backdrop-saturate`, `header-blur`) + viền dưới `rule` | `site-header` dính trên cùng |

### Decorative Depth
- Bề mặt nổi (`surface-raised`) dùng `gradient-surface` rất nhẹ (từ `paper-raised` sang `accent-soft`) cộng `elevated-md`. Đầu ấm của gradient là `accent-warm` (nâu than ở Giấy, cát vàng nhạt ở Đêm); chỉ dùng trong gradient, không làm màu chữ. Chữ `on-accent` trên mọi điểm của gradient vẫn đạt WCAG AA (kiểm lại bảng Contrast nếu đổi `accent-warm`).
- Chiều sâu ở chỗ khác đến từ đổi màu nền giữa các dải và nền mờ của thanh đầu trang. Bìa sách nhấc nhẹ khi hover (chỉ khi người dùng không bật giảm chuyển động).

## Shapes

### Border Radius Scale
- `radius-none`: dải toàn chiều rộng.
- `radius-cover`: bìa sách.
- `radius-sm`: nút và ô nhập.
- `radius-md`: thẻ bài, ảnh trong bài, hộp thông tin, `takeaways`, `book-ref`.
- `radius-lg`: khối lớn (`newsletter`, `topic-card`).
- `radius-pill`: chỉ tag và ô tìm kiếm; không dùng cho nút hành động.

### Photography Geometry
- Bìa sách theo `cover-ratio`; ảnh bài viết theo `post-image-ratio` với `radius-md`; chú thích đặt ngay dưới ảnh bằng `figcaption`. Luôn khai báo `width`, `height` hoặc dùng `aspect-ratio` để trang không nhảy khi ảnh tải.

## Components

Mỗi component là class HTML thuần trong `components/bundle.css`; cấu trúc HTML nằm ở `components/<Tên>/README.md`.

### Top Navigation
- **SiteHeader** (`{component.site-header}`): dính trên cùng, cao `header-height`, tên blog bằng serif cỡ `logo-size` bên trái, `site-nav` (`nav`, trang hiện tại gạch chân `border-width-strong` màu `accent`), nút đổi theme và nút menu. Dưới `bp-tablet` nav thu thành nút menu `touch-target`. Một tầng duy nhất, không chồng thanh thứ hai.

### Buttons
- **Primary** (`{component.button-primary}`): nền `accent`, chữ `on-accent`, kiểu chữ `button`, cao tối thiểu `touch-target`, bo `radius-sm`. Nền `gradient-primary` (accent → accent-warm), viền sáng trong 1px, `elevated-sm`; hover: đảo sang `gradient-primary-hover`, nhấc `translateY(-1px)`, `elevated-md`, vệt sáng chéo quét qua; nhấn thu về 0.95. Mỗi khu vực tối đa một nút chính.
- **Secondary** (`{component.button-secondary}`): trong suốt, chữ `ink`, viền `border-width` `rule-strong`; hover nền `paper-sunk`.
- **Quiet** (`{component.button-quiet}`): chữ `accent`, gạch chân khi hover.
- **Small** (`{component.button-small}`): cao `touch-target-sm`, chỉ dùng chỗ chật. **Icon button** (`{component.icon-button}`): `touch-target` × `touch-target`, bắt buộc có `aria-label`.
- **Text link** (`{component.text-link}`): màu `accent`, luôn gạch chân mảnh `border-width`, hover dày `border-width-strong`.
- Trên dải tối, chữ và viền nút phụ chuyển sang `on-inverse`.

### Cards & Containers
- **BookCover**: có ảnh bìa (truyền vào, hoặc bìa demo tra theo tên sách trong `src/config/covers.ts`) thì hiển thị ảnh, không thì dùng hình sinh tự động. Bìa demo 7 cuốn "Sách mẫu 1 đến 7" vẽ bằng SVG, tông `ink` / `paper` / `accent-warm` / cát, có tên sách, tác giả và nhãn "BẢN DEMO".
- **BookCover** (`{component.book-cover}`): tỉ lệ `cover-ratio`, bo `radius-cover`, `cover-shadow`; bốn cỡ `cover-size-sm`, `cover-size-md`, `cover-size-lg`, `cover-size-xl`. Chưa có ảnh thì dùng ô giữ chỗ `book-cover-ph` (nền `accent`, `is-ink`, `is-strong`, `is-paper`).
- **BookCard** (`{component.book-card}`): bìa, tên sách (`title`), tác giả, đánh giá, tag chủ đề; tối đa `book-card-max`.
- **PostCard biến thể `tile`** (ô lưới "Bài viết mới nhất", thêm 2026-10-07): ô lưới bento: vùng ảnh kéo xuống phủ cả nhãn, tiêu đề, ngày (phủ `inverse` 65%, chữ `on-inverse` nằm thẳng trên ảnh), `radius-md`, `elevated-md`, hover `elevated-lg`; nhãn chủ đề là huy hiệu pill trong mờ (cùng kiểu huy hiệu số bài của `TopicCard`: viền `on-inverse-soft` 60%, nền `on-inverse` 15%), nhãn / tiêu đề / ngày cách nhau `space-4`, giãn dòng tiêu đề 1,5, đệm trong `space-5`. Bento gốc nhưng hàng lưới cao hơn (320px mobile / 340px tablet; desktop hai hàng cố định 300px, ô cao 620px, ô thường 262x300px). Đã thử bản thẻ bao (không chọn).
- **PostCard** (`{component.post-card}`, lưới Blog, cập nhật 2026-10-07): cùng khuôn `TopicCard` (thẻ 3:4, ảnh tràn phủ `inverse` 65%, chữ trên ảnh, `elevated-lg`): nhãn chủ đề pill trong mờ, tiêu đề `display-sm`, tóm tắt `excerpt`, meta; bấm được cả khối. Biến thể `post-card-row` xếp ngang (ảnh `post-card-row-image`).
- **TopicCard** (`{component.topic-card}`): thẻ dọc tỉ lệ 3:4, bo `radius-lg`, tên / mô tả / nút cách đều nhau `space-4`, đệm trong `space-5`, ảnh theo chủ đề TRÀN cả thẻ, phủ một lớp `inverse` 65% (màu phẳng, không gradient, nhạt đi khi hover); chữ (`on-inverse`) và nút sáng (`on-inverse` nền, chữ `inverse`) nằm thẳng trên ảnh ở đáy thẻ, KHÔNG có khung bó riêng; chip số thứ tự nền đặc ở góc trên; số bài là huy hiệu pill (viền `on-inverse-soft` 60%, nền `on-inverse` 15%, số `ui-strong` đậm) nổi nhưng không rực. Thẻ lơ lửng `elevated-lg`; hover nhấc + ảnh phóng; bấm được cả khối. Ngoại lệ có chủ đích cho "không chữ trên ảnh" (Lộc duyệt 2026-10-07).
- **Khối lớn lơ lửng** (bóng theo mẫu khối form Newsletter: `surface-float` / `elevated-lg`; vùng chứa cuộn ngang phải chừa đệm đủ lớn để bóng không bị cắt): thẻ chủ đề, khối form `Newsletter` và khung ngoài của nó, ô số liệu của `LatestGrid` dùng `elevated-lg` để tạo cảm giác nổi.
- **SectionHead** (thêm 2026-10-07): tiêu đề mục căn giữa, tiêu đề `display-lg`, dek chữ sans `ui-body` màu `ink-faint`, đường kẻ ngang có họa tiết thoi `accent-warm`.
- **SocialIcons** (thêm 2026-10-07): chip tròn `touch-target`, icon 24px (biến thể Hero: một hàng, icon nổi bật ở giữa 60px + 6 chip 36px có vùng bấm mở rộng đủ 44px), viền `rule-strong` + `elevated-sm`; hover nhấc, nền gradient hiện dần, nhãn tên nền tảng nổi phía trên.
- **FeaturedPost** (`{component.feature-paper}`, `{component.feature-inverse}`): dải hero, chữ trái, bìa có bóng phải; tiêu đề `display-xl`.
- **BookRef** (`{component.book-ref}`, cập nhật 2026-10-07: bìa sách làm nền cả khối phủ `inverse` 45%, chữ `on-inverse` nằm thẳng trên bìa, huy hiệu pill "Bài viết dựa trên"; ngoại lệ chữ trên ảnh thứ sáu): ghi nguồn sách ngay trong bài, gồm bìa (nền), nhãn "Bài viết dựa trên", tên sách, tác giả.
- **Takeaways** (`{component.takeaways}`): hộp điểm chính nền `accent-soft`, chữ `ink`.

### Breadcrumb (thêm 2026-10-07)
- **Breadcrumb** (trang bài dùng tông `inverse`, neo gần đáy ảnh hero): `nav` `aria-label="Đường dẫn"`, danh sách có thứ tự; chữ `caption`, mục đầu có icon nhà, dấu `›` (ChevronRight) mảnh mờ 60%; mục hiện tại là pill trong mờ (viền `on-inverse-soft` 60%, nền `on-inverse` 15%), `aria-current="page"`; liên kết cao tối thiểu 44px, hover đổi sang `on-inverse` và gạch chân chạy; kèm JSON-LD `BreadcrumbList`. Hai tông: dải tối (`tone="inverse"`, trang Blog) và nền sáng (`tone="paper"`: liên kết `ink-soft` → `ink`, pill `accent-soft`, dấu › `ink-faint`; trang bài, căn giữa, tên bài bị cắt khi quá dài).

### Tags & Rating
- **Tag** (`{component.tag-filter}`, `{component.tag-filter-selected}`): pill cao `touch-target-sm`, viền `rule-strong`; đang chọn đảo thành nền `ink`, chữ `paper`. **Tag chủ đề** (`{component.tag-topic}`): nền `accent-soft`, chữ `accent-soft-ink`, không viền.
- **Rating** (`{component.rating}`): sao `icon-size` màu `accent`, đặc và rỗng (không chỉ dựa vào màu), kèm chữ "4,5/5".

### Article
- **ArticleProse** (`{component.prose}`): thân bài `prose`, khổ `measure-prose`; H2 `display-md`, H3 `display-sm`, trích dẫn `pull-quote` giữa hai đường kẻ `rule-strong`, ảnh bo `radius-md`.
- **ArticleLayout**: một cột, hoặc bố cục `guide` với **TOC** (`{component.toc}`) dính bên trái từ `bp-desktop` trở lên. TOC (cập nhật 2026-10-07): trục dọc mảnh `rule` có nút mốc đánh số, đoạn đã đọc phủ `accent` (chỉ dùng `transform`), mục đang đọc nút to + vòng sáng `accent` 14% + chữ đậm; dưới `bp-desktop` là nút pill kèm số mục.

### Inputs & Forms
- **Input** (`{component.input}`): cao `touch-target`, nền `paper-raised`, viền `border-width` `rule-strong`, bo `radius-sm`; `elevated-sm`; hover viền đậm hơn (`ink-soft`) và `elevated-md`; focus viền `accent` + glow 3px `accent` alpha 10%, icon đầu ô (`input-icon-size`) thành đậm. Vòng focus bàn phím `focus-ring-width` `accent` vẫn giữ (chuột bấm thì ẩn vòng ngoài, giữ glow; xem EXTENSIONS.md). Nhãn là nhãn nổi nằm trong ô, bay lên đè viền trên khi focus hoặc đã nhập. **Search** (`{component.search-input}`): bo pill.
- Lỗi: thêm `is-invalid` (viền `border-width-strong` `accent-strong`) cộng biểu tượng và câu giải thích cách sửa; không báo lỗi chỉ bằng màu.
- **Newsletter** (`{component.newsletter}`): nền `paper-sunk`, bo `radius-lg`, tiêu đề `display-md`, ô email và nút "Đăng ký" cùng hàng.

### Footer
- **SiteFooter** (`{component.site-footer}`): nền `paper-sunk`, lưới 3 cột (`footer-columns`), về 2 cột dưới `bp-tablet`; dòng pháp lý `caption` màu `ink-faint` sau đường kẻ `rule`.

## Content & States

Phần này gom các quy tắc nội dung và trạng thái trước đây nằm ở README.md.

### Content
- Mỗi thẻ bài có: nhãn chủ đề, tiêu đề, một đến hai câu tóm tắt, ngày đăng viết bằng chữ ("03 tháng 10, 2026") và thời gian đọc ("8 phút đọc").
- Tiêu đề bài nên gọn và dek một đến hai câu; đây là mặc định đề xuất, không phải ràng buộc của hệ thống (xem Known Gaps).
- Nút bắt đầu bằng động từ ("Đọc bài viết", "Đăng ký"). Mỗi bài kiến thức nên có `book-ref` ghi nguồn sách.
- Tên chủ đề, tên blog, tên sách và tác giả trong mẫu chỉ là ví dụ giữ chỗ.

### States
- Bốn trạng thái: mặc định, hover, nhấn và focus bàn phím. Focus là vòng `focus-ring-width` `accent`, cách `focus-ring-offset` (đổi sang `on-inverse` trên dải tối); không bao giờ tắt vòng focus.
- Chuyển màu `motion-fast`, nút / thẻ nhấc nhẹ và đổi cấp đổ bóng khi hover chỉ chạy khi người dùng không bật giảm chuyển động. Dải chữ trang chủ là ngoại lệ tự trôi chậm (dừng khi rê chuột, tắt khi giảm chuyển động).
- Lỗi form luôn có biểu tượng, chữ giải thích cách sửa và viền dày `border-width-strong`; không báo lỗi chỉ bằng màu, vì hệ thống không có màu báo lỗi riêng.

### Images & Icons
- Bìa sách là ảnh của bạn; chỉ đăng bìa khi bạn có quyền hiển thị, nếu không dùng ô giữ chỗ `book-cover-ph`. Hệ thống không kèm logo, bìa hay bộ icon.
- Biểu tượng là SVG một màu cỡ từ `icon-size` đến `icon-size-lg` dùng `currentColor`, nhúng trực tiếp; nút biểu tượng bắt buộc có `aria-label`.
- Ảnh bài viết theo `post-image-ratio` với `radius-md`; chú thích đặt ngay dưới ảnh bằng `figcaption`.

## Do's and Don'ts

### Do
- Dùng token (`var(--accent)`, `var(--space-5)`), không viết mã hex trong CSS.
- Đặt `data-theme` trước khi vẽ trang để không nháy sáng (cách làm: xem README.md).
- Giữ khổ bài đọc `measure-prose` và cỡ `prose`; từ `bp-phone` trở xuống dùng `prose-sm`.
- Kèm chữ hoặc biểu tượng cho mọi thông tin quan trọng (lỗi, trạng thái, đánh giá).
- Mỗi bài kiến thức có `book-ref` ghi nguồn sách.
- Đổi nền dải để tạo nhịp trước khi thêm viền hay đổ bóng.
- Dùng gradient và đổ bóng đúng chừng mực: gradient cho nút chính / CTA / bề mặt khối nổi; đổ bóng theo thang `elevated-*`.

### Don't
- Thêm màu thứ hai hoặc dựa vào màu để phân biệt liên kết với chữ thường: màu nhấn trùng màu mực, nên liên kết phải luôn gạch chân.
- Đổ bóng cho chữ, hoặc tự chế giá trị bóng ngoài thang `elevated-*` / `cover-shadow`.
- Dùng `radius-pill` cho nút hành động.
- Dùng gradient cho nền trang (trừ vùng chuyển `seam-*` giữa các dải), chữ hay ảnh bài; hoặc đặt chữ lên ảnh nền.
- Đặt chữ bài đọc nhỏ hơn `prose-sm`, hoặc letter-spacing âm cho chữ dưới `tracking-neg-limit`.
- Bỏ vòng focus bàn phím.
- Chồng thanh điều hướng thứ hai dính cạnh.

## Responsive Behavior

### Breakpoints
Giá trị từng mốc: xem nhóm `breakpoint` trong `tokens.json`.

| Mốc | Thay đổi |
| --- | --- |
| `bp-wide` | Nội dung khoá ở `content-max`; lưới 4 cột trở lên. |
| `bp-desktop` | Bố cục bài 'guide' có mục lục bên cạnh; lưới 3 cột. |
| `bp-tablet` | Thanh đầu trang thu thành menu; hero xếp một cột; lưới 2 cột. |
| `bp-phone` | Lưới 1 cột; bài đọc dùng `prose-sm`; tiêu đề hạ cỡ. |

### Touch Targets
- Tối thiểu `touch-target` × `touch-target` cho nút, link điều hướng, ô nhập; nút `btn-sm` và tag cao `touch-target-sm` chỉ dùng chỗ chật. Khe giữa hai vùng bấm cạnh nhau tối thiểu `space-2`.

### Collapsing Strategy
- Thanh đầu trang thu thành menu dưới `bp-tablet`; padding dọc dải giảm từ `space-9` xuống `space-7`.
- `feature` xếp một cột, bìa lên trên; tiêu đề hạ từ `display-xl` xuống cỡ `display-lg` ở `bp-desktop`, rồi `hero-title-tablet` ở `bp-tablet`.
- Bố cục `guide`: TOC thành khối trên thân bài, không còn dính, dưới `bp-desktop`.
- Chân trang 3 cột thành 2 cột dưới `bp-tablet`; `post-card-row` xếp dọc dưới `bp-phone`.

### Image Behavior
- Ảnh bìa và ảnh bài giữ tỉ lệ cố định (`cover-ratio`, `post-image-ratio`) với `object-fit: cover`; chỉ đổi kích thước theo cột. Tải lười mặc định, ảnh đầu trang tải ngay.

## Iteration Guide

1. Làm từng component một; tham chiếu khoá trong `components:` (ví dụ `{component.post-card}`).
2. Dùng tham chiếu token (`{colors.accent}`, `{rounded.md}`) khắp nơi, không viết hex hay px của token.
3. Cách nạp `tokens.css`, `components/bundle.css` và đặt `data-theme`: xem README.md.
4. Tiêu đề và bài đọc luôn serif; giao diện luôn sans. Ranh giới này không phá.
5. Khi cần nhấn: đổi nền dải trước, rồi mới tới cỡ chữ và độ đậm, cuối cùng mới tới viền.
6. Đổ bóng theo thang `elevated-sm/md/lg`; `cover-shadow` chỉ cho bìa sách.
7. Trạng thái và chuyển động: xem mục Content & States.

## Known Gaps

- **Thay đổi phá vỡ tính nhất quán với bản Mono gốc (2026-10-07):** thêm gradient, thang đổ bóng `elevated-*`, màu `accent-warm`, icon ô nhập. Mọi trang cũ dùng component cũ phải được review lại bằng mắt ở cả hai theme và 5 mốc responsive. Bảng Contrast đã thêm cặp `on-accent` / `accent-warm`.

- Subset `vietnamese` của Source Serif 4 và Be Vietnam Pro trên Google Fonts chưa được kiểm tra trực tiếp (môi trường dựng không truy cập được); cần xác nhận khi tích hợp.
- (Đã xử lý 2026-10-07) Hover nút chính trước đây quá tinh tế; nay đảo gradient + nhấc + vệt sáng.
- `cover-shadow` (`{shadows.cover-light}`) vẫn dùng sắc nâu ấm của bản đỏ đô (không phải đen trung tính). Chưa chỉnh lại vì mức khác biệt nhỏ.
- Không có màu báo lỗi hay màu thành công riêng, vì màu nhấn trùng màu mực; trạng thái lỗi dựa vào biểu tượng, chữ và viền dày `border-width-strong`.
- Hệ thống không kèm logo, ảnh bìa hay bộ icon; icon là SVG một màu cỡ từ `icon-size` đến `icon-size-lg` tự nhúng (`currentColor`).
- Chưa có component cho bình luận, trang tác giả, tìm kiếm kết quả và phân trang.
- Tên blog, chủ đề, tên sách và tác giả trong mẫu chỉ là giữ chỗ.
- Độ dài tiêu đề khoảng 70 ký tự là mặc định đề xuất, không phải ràng buộc của hệ thống.
