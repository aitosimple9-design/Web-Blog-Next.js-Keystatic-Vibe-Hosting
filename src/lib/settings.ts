// Đọc "Cài đặt site" do Keystatic lưu ở content/settings/site.json (singleton).
// An toàn khi file chưa có / sai định dạng: từng ô thiếu hoặc sai thì dùng giá trị mặc định lấy từ src/config/site.ts,
// site không bao giờ lỗi vì thiếu cài đặt. Chỉ chạy phía server (đọc file); component client nhận kết quả qua props.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { site, socialLinks, legalLinks, POSTS_PER_PAGE, type SocialId } from "@/config/site";

const FILE = path.join(process.cwd(), "content", "settings", "site.json");

export const POSTS_PER_PAGE_MIN = 3;
export const POSTS_PER_PAGE_MAX = 12;

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  /** Ảnh OG mặc định (đường dẫn trong public/), có thể không có */
  ogImage?: string;
  /** Năm hiện ở dòng bản quyền; ô để trống thì lấy năm hiện tại */
  year: number;
  socials: { id: SocialId; label: string; href: string }[];
  legalLinks: { label: string; href: string }[];
  postsPerPage: number;
};

const text = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);
const int = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : undefined;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
// Địa chỉ liên kết hợp lệ: đường dẫn trong site ("/...") hoặc http(s)
const href = (v: unknown) => {
  const s = text(v);
  return s && (s.startsWith("/") || /^https?:\/\//.test(s)) ? s : undefined;
};

export const getSiteSettings = cache((): SiteSettings => {
  let raw: Record<string, unknown> = {};
  try {
    raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Record<string, unknown>;
  } catch {
    // chưa có file hoặc JSON hỏng → dùng mặc định
  }

  const description = text(raw.description);

  // Mạng xã hội: danh sách trống / thiếu → giữ danh sách mặc định; nền tảng lạ hoặc thiếu URL thì bỏ qua
  const socials = Array.isArray(raw.socials)
    ? raw.socials.flatMap((s) => {
        if (!isObj(s)) return [];
        const base = socialLinks.find((l) => l.id === s.platform);
        const url = href(s.url);
        return base && url ? [{ id: base.id, label: base.label, href: url }] : [];
      })
    : [];

  // Trang pháp lý: có nhãn; thiếu địa chỉ thì hiện dạng chữ, chưa bấm được (như mặc định)
  const legal = Array.isArray(raw.legalLinks)
    ? raw.legalLinks.flatMap((l) => {
        if (!isObj(l)) return [];
        const label = text(l.label);
        return label ? [{ label, href: href(l.href) ?? "" }] : [];
      })
    : [];

  return {
    name: text(raw.siteName) ?? site.name,
    tagline: text(raw.tagline) ?? site.tagline,
    description: description && description.length <= 160 ? description : site.description,
    ogImage: text(raw.ogImage),
    year: int(raw.copyrightYear, 2000, 2100) ?? new Date().getFullYear(),
    socials: socials.length > 0 ? socials : socialLinks.map((l) => ({ ...l })),
    legalLinks: legal.length > 0 ? legal : legalLinks.map((l) => ({ ...l })),
    postsPerPage: int(raw.postsPerPage, POSTS_PER_PAGE_MIN, POSTS_PER_PAGE_MAX) ?? POSTS_PER_PAGE,
  };
});
