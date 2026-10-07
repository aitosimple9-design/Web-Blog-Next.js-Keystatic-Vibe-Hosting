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

export const mainNav = [
  { label: "Trang chủ", href: "/" },
  { label: "Blog", href: "/blog" },
] as const;

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

// Q14: điền URL thật. Href rỗng = icon hiển thị nhưng chưa bấm được.
export const socialLinks: { id: SocialId; label: string; href: string }[] = [
  { id: "youtube", label: "YouTube", href: "" },
  { id: "tiktok", label: "TikTok", href: "" },
  { id: "facebook", label: "Facebook", href: "" },
  { id: "instagram", label: "Instagram", href: "" },
  { id: "linkedin", label: "LinkedIn", href: "" },
  { id: "x", label: "X", href: "" },
  { id: "zalo", label: "Zalo", href: "" },
];

// Q13: số bài mỗi trang ở trang Blog (cố định, lưới tự đổi số cột theo màn hình).
export const POSTS_PER_PAGE = 6;
