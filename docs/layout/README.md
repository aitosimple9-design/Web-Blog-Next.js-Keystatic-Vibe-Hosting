# Layout 3 trang — chỉ mục và phần dùng chung

Nguồn: wireframe thang xám do Lộc cung cấp (2026-10-07). Wireframe CHỈ cho cấu trúc và hành vi;
màu, chữ, bo góc, đổ bóng lấy từ Design System (`docs/design-system/`), không lấy từ wireframe.

| Trang | Thư mục | Ưu tiên | Spec | Mockup |
|---|---|---|---|---|
| Chi tiết bài | `chi-tiet-bai/` | 1 (đích của quảng cáo) | `README.md` | `Main.dc.html` |
| Blog | `blog/` | 2 | `README.md` | `Blog.dc.html` |
| Trang chủ | `trang-chu/` | 3 | `README.md` | `Home.dc.html` |

Thêm trang mới sau này: tạo thư mục `docs/layout/<ten-trang>/` với `README.md` (spec) + mockup, rồi thêm một dòng vào bảng trên.

## Cách đọc wireframe
- 4 khung: **375** (giữ nguyên cho 414), **768**, **1024**, **1440** (nội dung tối đa 1120px). Bố cục co giãn, không cuộn ngang.
- Chú thích `w1`…`w4` trong mockup = thay đổi tại mốc 375 / 768 / 1024 / 1440. Phần "Thay đổi giữa các mốc" ở cuối mỗi mockup đã được chép vào spec.
- Vùng bấm 44px (`tap`), khe 8px, thumb zone (hết màn hình đầu ở 812px).
- Tên khối (`data-c`) = tên component cần dựng. Mockup là tham chiếu, KHÔNG chép nguyên mã.
- Các file chạy mockup (`wf.css`, `support.js`, `vendor/`) chưa được cung cấp nên mockup chưa mở được bằng trình duyệt; cấu trúc và ghi chú vẫn đọc được trong file `.dc.html`.

## Điểm chuyển mốc chung (đã khớp Design System)
| Mốc | Thanh đầu trang | Ghi chú |
|---|---|---|
| 375 / 414 | Logo trái · tìm kiếm (icon) + ☾ + ☰ bên phải | Lề 24px |
| 768 | Menu (Trang chủ · Blog) căn giữa, ☰ ẩn | Lề 32px |
| 1024 | Ô tìm kiếm mở rộng ("Tìm bài viết") | |
| 1440 | Như 1024 | Khung nội dung tối đa 1120px; dải nền vẫn tràn hết chiều rộng |

## Khối dùng chung ở cả 3 trang (làm MỘT component, không viết bản thứ hai)

### Nav (`SiteHeader`)
- Logo (nút, có dấu hiệu `mark`) · menu: Trang chủ, Blog (trang hiện tại có trạng thái `on`) · tìm kiếm · nút đổi theme (☾) · ☰ (chỉ dưới 768).
- Nằm trong dải nền đầu trang của từng trang (Trang chủ: `paper-sunk` cùng Hero; Blog: dải tối cùng Hero; Chi tiết bài: dải riêng).
- Mọi nút ≥ 44x44px, cách nhau ≥ 8px; nút icon có `aria-label` ("Tìm kiếm", "Đổi theme", "Menu").

### Nút chính (mọi trang)
- Gradient `gradient-primary` (accent → accent-warm), viền sáng trong 1px, vệt sáng quét + nổi `elevated-md` khi hover (chỉ chuột, tắt khi giảm chuyển động). Khối form / thẻ dùng `surface-raised`; ô nhập `field-premium` có icon. Đã duyệt 2026-10-07, xem `docs/design-system/EXTENSIONS.md`. Nút phụ giữ nền quét phẳng.

### Đường nối giữa các dải nền (2026-10-07)
- Không dùng đường kẻ ngang cứng hay cạnh đổi màu đột ngột giữa các dải: dải `paper-sunk` / chân trang `paper-raised` có vùng chuyển mờ về `paper` ở mép tiếp giáp (lớp `seam-*`). Dải chữ trang chủ không còn viền trên / dưới. Hero trang Blog và ảnh hero trang bài thì cắt đáy bằng mask nét cọ (`brush-bottom`), không dùng bóng mờ.

### Newsletter (form đăng ký)
- Chữ: nhãn "Bản tin", tiêu đề "Nhận bài mới qua email", dek "Mỗi tuần một bài ghi chép sau khi đọc sách, gửi thẳng vào hộp thư của bạn.", 3 gạch đầu dòng: "Ý chính, ví dụ và cách áp dụng" · "Đọc trong khoảng 10 phút" · "Hủy đăng ký bất cứ lúc nào".
- Form: tiêu đề "Đăng ký nhận bài"; trường **Họ tên**, **Số điện thoại** (**nhãn nổi**: nằm trong ô như placeholder, khi focus hoặc đã nhập thì thu nhỏ bay lên đè viền trên; nhãn luôn một dòng; "Tùy chọn" là chữ riêng hiện cùng hàng nhãn, ở mép phải viền trên, khi ô nổi nhãn), **Email** (chiếm cả hàng), mỗi ô có icon đầu ô; nút chính "Đăng ký" rộng hết khung; dòng nhỏ "Chỉ gửi bài mới, không quảng cáo."
- Tương tác (đã duyệt, xem `docs/design-system/EXTENSIONS.md`): hover đổi viền / nền ô; focus: icon đổi màu + gạch nhấn chạy; lỗi lắc một lần; thành công: dấu tích được vẽ; vòng trang trí trôi theo con trỏ.
- Có phần trang trí (`deco`).
- 375: chữ rồi form, mỗi ô một hàng · 768: Họ tên và Số điện thoại cùng một hàng · 1024+: chữ trái, form phải.
- Dải nền: `paper` (Design System cho phép `paper-sunk` hoặc `inverse`); khối bo `radius-lg`.
- Lỗi: biểu tượng + chữ giải thích cách sửa + viền dày (Design System); không báo lỗi chỉ bằng màu.

### Footer (`SiteFooter`)
- Hàng 1: Logo · menu (Trang chủ, Blog) · 7 icon mạng xã hội (YouTube, TikTok, Facebook, Instagram, LinkedIn, X, Zalo).
- Hàng 2: "© 2026 Logo. Ghi chép kiến thức từ sách." · Điều khoản · Chính sách.
- 375: xếp dọc (logo, menu, mạng xã hội, pháp lý) · 768+: logo trái · menu giữa · 7 icon phải.
- Icon mạng xã hội: chip tròn 44px, icon 24px (chi tiết: `trang-chu/README.md`).
- 7 icon x 44px + 6 khe x 8px = 356px, lớn hơn bề rộng khả dụng ở 375px (327px sau lề 24px): phải xuống 2 hàng hoặc cuộn ngang; Lộc chốt khi dựng.
- Dải nền `paper-raised`.

### Thanh trượt (`Slider`) dùng ở Trang chủ (chủ đề) và Chi tiết bài (bài liên quan)
- Cuộn ngang bằng vuốt/cuộn; có chấm vị trí và nút ‹ › (trượt từng thẻ); nút bị khóa ở hai đầu; số chấm theo số trang trượt.
- Làm MỘT component, truyền loại thẻ vào.

## Component mới so với Design System
Design System chưa có các khối sau (Known Gaps); đề xuất dựng từ token có sẵn, Lộc duyệt khi dựng:
`Slider`, `TopicCard` (biến thể có icon + nút), `StatTile` / số liệu, `TopicTabs`, `TopicMenu` (nút ☰ mở danh sách),
`TopicHero`, `Pagination`, `SearchBox`, `SocialIcons` (7 icon), `PostTile` (ô lưới bento), `ArticleHeader`, `SourceBox` (= `BookRef` của Design System), `TOC`.

## Việc chờ Lộc quyết định (ghi ở docs/PLAN.md, Q11–Q14)
1. **Q11 — Form đăng ký gửi đi đâu?** Thu thập Họ tên + Số điện thoại + Email là dữ liệu cá nhân: cần chỗ lưu, câu đồng ý, và quyết định trường nào bắt buộc.
2. **Q12 — Tìm kiếm:** wireframe có ô tìm kiếm ở thanh đầu trang mọi trang; PLAN cũ xếp tìm kiếm vào "sau khi ra mắt". Làm chức năng ngay hay chỉ dựng giao diện?
3. **Q13 — Chủ đề và phân trang:** Blog đổi chủ đề trên một trang, phân trang 2 / 4 / 6 bài theo mốc màn hình. Cần chốt URL (ví dụ `/blog/<chu-de>?trang=2`) và số bài mỗi trang cố định hay đổi theo màn hình (ảnh hưởng SEO và dự án B tĩnh).
4. **Q14 — Tên blog, logo, link 7 mạng xã hội, trang Điều khoản / Chính sách:** wireframe dùng chữ giữ chỗ ("Logo", "Chủ đề 1…").
5. **Số chủ đề:** wireframe mẫu có 5 chủ đề, `CLAUDE.md` mục 5 vẫn ghi 3 danh mục → cần đồng bộ khi chốt Q7 (đổi cấu trúc bài ⇒ hỏi, và đồng bộ sang dự án B).
