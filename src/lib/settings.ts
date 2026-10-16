// Đọc "Cài đặt site" do Keystatic lưu ở content/settings/site.json (singleton).
// An toàn khi file chưa có / sai định dạng: trả về giá trị mặc định lấy từ src/config/site.ts, site không bao giờ lỗi vì thiếu cài đặt.
// Lưu ý: tên site mới chỉ nối vào metadata (thẻ title, OG); logo ở thanh đầu trang / chân trang vẫn lấy từ src/config/site.ts.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { site } from "@/config/site";

const FILE = path.join(process.cwd(), "content", "settings", "site.json");

export type SiteSettings = {
  name: string;
  description: string;
  /** Ảnh OG mặc định (đường dẫn trong public/), có thể không có */
  ogImage?: string;
  socials: { name: string; url: string }[];
};

const text = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);

export const getSiteSettings = cache((): SiteSettings => {
  let raw: Record<string, unknown> = {};
  try {
    raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Record<string, unknown>;
  } catch {
    // chưa có file hoặc JSON hỏng → dùng mặc định
  }
  const description = text(raw.description);
  const socials = Array.isArray(raw.socials)
    ? raw.socials.flatMap((s) => {
        const o = s as Record<string, unknown>;
        const name = text(o?.name);
        const url = text(o?.url);
        return name && url ? [{ name, url }] : [];
      })
    : [];
  return {
    name: text(raw.siteName) ?? site.name,
    description: description && description.length <= 160 ? description : site.description,
    ogImage: text(raw.ogImage),
    socials,
  };
});
