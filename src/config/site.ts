// Cấu hình site. Các giá trị "giữ chỗ" chờ Lộc chốt ở PLAN.md (Q14): tên blog, logo, link mạng xã hội, trang pháp lý.

export const site = {
  name: "Logo", // Q14: tên blog thật
  tagline: "Ghi chép kiến thức từ sách",
  description:
    "Mỗi bài ghi chép một cuốn sách: ý chính, ví dụ và cách áp dụng.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "vi_VN",
  year: 2026,
} as const;

// Menu: NƠI DUY NHẤT khai báo trang. Thêm trang = thêm 1 dòng vào nhóm phù hợp (hoặc thêm 1 nhóm mới).
//  - Menu ngăn kéo trên điện thoại (<768px): mỗi nhóm cách nhau bằng đường kẻ ngang, tự vẽ.
//  - Mục có `children` thì thu gọn sẵn, bấm mới xổ ra danh sách con.
//  - Menu ngang (768px+) và chân trang lấy các mục cấp trên của mọi nhóm (`mainNav`).
// `icon` là mã trong `NavIcon` (src/components/layout/NavIcon.tsx); mã mới thì thêm vào đó.
export type NavIconId = "home" | "book" | "blog";
export type NavLink = { label: string; href: string };
export type NavItem = NavLink & { icon: NavIconId; children?: NavLink[] };
export type NavGroup = { id: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    id: "chinh",
    items: [
      { label: "Trang chủ", href: "/", icon: "home" },
      { label: "Book", href: "/book", icon: "book" },
    ],
  },
  {
    id: "noi-dung",
    items: [
      {
        label: "Blog",
        href: "/blog",
        icon: "blog",
      },
    ],
  },
];

export const mainNav: NavLink[] = navGroups.flatMap((g) => g.items.map(({ label, href }) => ({ label, href })));

export const legalLinks = [
  // Q14: chưa có trang. Để href rỗng thì hiển thị dạng chữ, chưa bấm được.
  { label: "Điều khoản", href: "" },
  { label: "Chính sách", href: "" },
] as const;

export type SocialId =
  | "youtube"
  | "tiktok"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "zalo";

// Q14: URL DEMO (trang chủ từng nền tảng) — thay bằng trang thật của blog khi có. Href rỗng = icon hiển thị nhưng chưa bấm được.
export const socialLinks: { id: SocialId; label: string; href: string }[] = [
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/" },
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
  { id: "x", label: "X", href: "https://x.com/" },
  { id: "zalo", label: "Zalo", href: "https://zalo.me/" },
];

// Q13: số bài mỗi trang ở trang Blog (cố định, lưới tự đổi số cột theo màn hình).
export const POSTS_PER_PAGE = 6;
