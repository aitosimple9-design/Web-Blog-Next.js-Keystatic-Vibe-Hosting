// NHÃN GIAO DIỆN NHỎ của web công khai: tên vùng điều hướng cho trình đọc màn hình (aria-label), nút điều khiển, ô tìm kiếm, phân trang, thẻ bài ("phút đọc", "Đọc bài"...).
// Lộc sửa ở Keystatic → Cài đặt → Nhãn giao diện (content/settings/ui-labels.json). Đây là NƠI DUY NHẤT khai báo: khóa, tên hiện trong admin, và chữ mặc định
// (đúng bằng chữ trước đây viết cứng trong mã). keystatic.config.ts dựng các ô từ danh sách này; getUiLabels() (src/shared/content/ui-labels.ts) đọc ra.
// Thêm nhãn mới = thêm một dòng ở đây rồi dùng `ui.<khóa>` ở nơi hiển thị; tests/unit/shared/ui-labels.test.ts chặn khóa trùng / mặc định rỗng.
// Chỗ trống `{n}`, `{name}` được thay khi hiển thị.

type Item = readonly [key: string, name: string, def: string];

export const UI_LABEL_GROUPS = [
  {
    id: "nav",
    title: "Tên các vùng điều hướng (chỉ người dùng trình đọc màn hình nghe thấy)",
    items: [
      ["skipLink", "Liên kết bỏ qua đến nội dung chính", "Bỏ qua, đến nội dung chính"],
      ["navMain", "Menu chính trên thanh đầu trang", "Chính"],
      ["navMobile", "Menu ngăn kéo trên điện thoại", "Menu"],
      ["navFooter", "Menu ở chân trang", "Chân trang"],
      ["navTopics", "Danh sách chủ đề ở trang Blog", "Chủ đề"],
      ["navBreadcrumb", "Đường dẫn (breadcrumb)", "Đường dẫn"],
      ["navSocial", "Hàng icon mạng xã hội", "Mạng xã hội"],
      ["articleHead", "Phần đầu bài viết", "Đầu bài"],
      ["sourceBook", "Khối nguồn sách", "Nguồn sách"],
      ["intro", "Khối giới thiệu ở đầu trang", "Giới thiệu"],
      ["statsSection", "Khối con số ở Trang chủ", "Con số"],
      ["relatedList", "Danh sách bài liên quan", "Danh sách bài liên quan"],
      ["topicList", "Danh sách chủ đề ở trang Book", "Danh sách chủ đề"],
      ["subtopicList", "Thanh trượt chủ đề con ở trang Blog", "Danh sách chủ đề con"],
      ["shelfList", "Tủ sách ở Trang chủ", "Tủ sách"],
    ],
  },
  {
    id: "controls",
    title: "Nút điều khiển",
    items: [
      ["menuOpen", "Nút mở menu (điện thoại)", "Mở menu"],
      ["menuClose", "Nút đóng menu (điện thoại)", "Đóng menu"],
      ["sliderPrev", "Nút trượt về trước", "Trước"],
      ["sliderNext", "Nút trượt về sau", "Sau"],
      ["themeUnknown", "Nút đổi giao diện sáng / tối (lúc chưa biết đang ở giao diện nào)", "Đổi theme"],
      ["themeToLight", "Nút đổi giao diện: chuyển sang sáng", "Chuyển sang theme Giấy (sáng)"],
      ["themeToDark", "Nút đổi giao diện: chuyển sang tối", "Chuyển sang theme Đêm (tối)"],
    ],
  },
  {
    id: "search",
    title: "Ô tìm kiếm",
    items: [
      ["searchOpen", "Nút mở ô tìm kiếm", "Tìm kiếm"],
      ["searchClose", "Nút đóng ô tìm kiếm", "Đóng tìm kiếm"],
      ["searchLabel", "Tên của ô nhập (chỉ trình đọc màn hình)", "Tìm bài viết"],
      ["searchPlaceholder", "Chữ gợi ý trong ô nhập", "Tìm bài viết"],
      ["searchEmpty", "Câu khi không tìm thấy bài", "Không tìm thấy bài phù hợp. Thử một từ khóa khác."],
    ],
  },
  {
    id: "pagination",
    title: "Phân trang",
    items: [
      ["pagination", "Tên vùng phân trang", "Phân trang"],
      ["pagePrev", "Nút trang trước", "Trang trước"],
      ["pageNext", "Nút trang sau", "Trang sau"],
      ["pageN", "Nút số trang (dùng {n} cho số trang)", "Trang {n}"],
    ],
  },
  {
    id: "cards",
    title: "Thẻ bài và thẻ chủ đề",
    items: [
      ["readTime", "Thời gian đọc (dùng {n} cho số phút)", "{n} phút đọc"],
      ["readTimeShort", "Thời gian đọc rút gọn ở thẻ bài (dùng {n} cho số phút)", "{n} phút"],
      ["readPost", "Chữ trên thẻ bài", "Đọc bài"],
      ["viewTopic", "Chữ trên thẻ chủ đề", "Xem bài"],
      ["subtopicPosts", "Chữ ẩn đọc sau tên thẻ chủ đề con (dùng {n} cho số bài)", "{n} bài"],
      ["viewTopicSr", "Phần chữ ẩn đọc thêm sau nút thẻ chủ đề (dùng {name} cho tên chủ đề)", "chủ đề {name}"],
      ["topicCount", "Số mục của danh sách chủ đề (dùng {n} cho số lượng)", "{n} mục"],
    ],
  },
] as const satisfies readonly { id: string; title: string; items: readonly Item[] }[];

export type UiLabelKey = (typeof UI_LABEL_GROUPS)[number]["items"][number][0];
export type UiLabels = Record<UiLabelKey, string>;

/** Chữ mặc định (đúng bằng chữ viết cứng trước đây) */
export const UI_LABEL_DEFAULTS = Object.fromEntries(UI_LABEL_GROUPS.flatMap((g) => g.items.map(([key, , def]) => [key, def]))) as UiLabels;

/** Thay {n}, {name}... trong một nhãn */
export const fillLabel = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
