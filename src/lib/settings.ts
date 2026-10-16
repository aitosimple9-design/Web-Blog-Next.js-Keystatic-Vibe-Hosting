// Đọc "Cài đặt site" do Keystatic lưu ở content/settings/site.json (singleton).
// An toàn khi file chưa có / sai định dạng: từng ô thiếu hoặc sai thì dùng giá trị mặc định lấy từ src/config/site.ts,
// site không bao giờ lỗi vì thiếu cài đặt. Chỉ chạy phía server (đọc file); component client nhận kết quả qua props.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { imageSize } from "image-size";
import {
  site,
  socialLinks,
  legalLinks,
  navGroups as defaultNavGroups,
  newsletterDefaults,
  POSTS_PER_PAGE,
  type NavGroup,
  type NavIconId,
  type NavLink,
  type SocialId,
} from "@/config/site";

const DIR = path.join(process.cwd(), "content", "settings");

// Đọc một file cài đặt (content/settings/<tên>.json); chưa có hoặc JSON hỏng → {}
function readJson(name: string): Record<string, unknown> {
  try {
    const v: unknown = JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), "utf8"));
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

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
  const raw = readJson("site");

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

// ---------------------------------------------------------------------------------------------------------------------
// Header / Footer / Newsletter (Keystatic: nhóm "Cài đặt"). Mỗi hàm đọc an toàn: ô thiếu hoặc sai thì dùng mặc định.
// ---------------------------------------------------------------------------------------------------------------------

export const MENU_MAX = 6;
export const FOOTER_LINKS_MAX = 8;
export const PERKS_MAX = 5;
const NAV_ICONS: NavIconId[] = ["home", "book", "blog"];

export type LogoImage = { src: string; width: number; height: number };

// Đọc kích thước thật của ảnh logo trong public/ (để next/image không nhảy bố cục); không đọc được thì bỏ ảnh, dùng logo chữ
function readLogo(src: string | undefined): LogoImage | undefined {
  if (!src || !src.startsWith("/")) return undefined;
  try {
    const { width, height } = imageSize(fs.readFileSync(path.join(process.cwd(), "public", src)));
    return width && height ? { src, width, height } : undefined;
  } catch {
    return undefined;
  }
}

export type HeaderSettings = {
  /** Ảnh logo; thiếu hoặc không đọc được thì dùng logo chữ */
  logoImage?: LogoImage;
  logoAlt: string;
  /** Nhóm menu (mục con của "Blog" do src/lib/nav.ts thêm từ Chủ đề); mặc định lấy từ src/config/site.ts */
  navGroups: NavGroup[];
  showSearch: boolean;
  showThemeToggle: boolean;
};

export const getHeaderSettings = cache((): HeaderSettings => {
  const raw = readJson("header");

  // Mỗi mục có cờ `newGroup` = bắt đầu nhóm mới (đường kẻ ngang ở menu điện thoại); mục đầu luôn mở nhóm đầu
  const groups: NavGroup[] = [];
  if (Array.isArray(raw.menu)) {
    for (const m of raw.menu.slice(0, MENU_MAX)) {
      if (!isObj(m)) continue;
      const label = text(m.label);
      const to = href(m.href);
      if (!label || !to) continue;
      const icon = NAV_ICONS.find((i) => i === m.icon) ?? "home";
      if (groups.length === 0 || m.newGroup === true) groups.push({ id: `nhom-${groups.length + 1}`, items: [] });
      groups[groups.length - 1].items.push({ label, href: to, icon });
    }
  }

  return {
    logoImage: readLogo(text(raw.logoImage)),
    logoAlt: text(raw.logoAlt) ?? "",
    navGroups: groups.length > 0 ? groups : defaultNavGroups,
    showSearch: raw.showSearch !== false,
    showThemeToggle: raw.showThemeToggle !== false,
  };
});

export type FooterSettings = {
  /** Liên kết ở chân trang; undefined = dùng các mục cấp trên của menu Header */
  links?: NavLink[];
  /** Dòng bản quyền tự viết; undefined = "© năm tên. khẩu hiệu." */
  copyright?: string;
  showSocials: boolean;
};

export const getFooterSettings = cache((): FooterSettings => {
  const raw = readJson("footer");
  const links = Array.isArray(raw.links)
    ? raw.links.slice(0, FOOTER_LINKS_MAX).flatMap((l) => {
        if (!isObj(l)) return [];
        const label = text(l.label);
        const to = href(l.href);
        return label && to ? [{ label, href: to }] : [];
      })
    : [];
  return {
    links: links.length > 0 ? links : undefined,
    copyright: text(raw.copyright),
    showSocials: raw.showSocials !== false,
  };
});

export type NewsletterSettings = {
  eyebrow: string;
  title: string;
  description: string;
  perks: string[];
  submitLabel: string;
};

export const getNewsletterSettings = cache((): NewsletterSettings => {
  const raw = readJson("newsletter");
  const perks = Array.isArray(raw.perks)
    ? raw.perks.slice(0, PERKS_MAX).flatMap((p) => {
        const v = typeof p === "string" ? text(p) : isObj(p) ? text(p.text) : undefined;
        return v ? [v] : [];
      })
    : [];
  return {
    eyebrow: text(raw.eyebrow) ?? newsletterDefaults.eyebrow,
    title: text(raw.title) ?? newsletterDefaults.title,
    description: text(raw.description) ?? newsletterDefaults.description,
    perks: perks.length > 0 ? perks : [...newsletterDefaults.perks],
    submitLabel: text(raw.submitLabel) ?? newsletterDefaults.submitLabel,
  };
});
