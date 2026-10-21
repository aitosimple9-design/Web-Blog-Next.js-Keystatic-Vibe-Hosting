"use client";

// THẺ "ĐỊA CHỈ WEB" ở đầu trang Cài đặt → Site của Keystatic (thay cho dải nổi cũ): cho biết web đang dùng địa chỉ thật, địa chỉ tạm hay còn localhost
// (kiểm tra NEXT_PUBLIC_SITE_URL, hàm dùng chung `checkSiteUrl` ở src/shared/site-url-check.ts). Dữ liệu từ /api/dia-chi-web (chỉ quản trị viên).
// - Thẻ được dựng bằng React và chèn (portal) ngay TRƯỚC lưới thẻ của trang Cài đặt (`[data-ks-cards]`, do KeystaticSettingsCards đánh dấu); mất thì chèn lại.
// - Dáng thẻ giống các thẻ Cài đặt khác (viền bo góc, tiêu đề đậm, một dòng mô tả, chân thẻ xám); chữ trạng thái luôn kèm nhãn Đúng / Lưu ý / Sai, không chỉ dựa vào màu.
// - Máy cá nhân và bản preview (level "dev"): vẫn hiện thẻ, chữ trung tính, để người soạn biết ở đây không bị kiểm tra.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import type { SiteUrlStatus } from "@/shared/site-url-check";
import { isDarkTheme, seoPalette } from "./ks-theme";

// Chế độ GitHub có thêm /branch/<nhánh>/ sau /keystatic
export const SITE_SETTINGS_ROUTE = /^\/keystatic\/(?:branch\/[^/]+\/)?singleton\/siteSettings\/?$/;
const HOST_ATTR = "data-ks-site-url-host";
const MARK = { ok: "Đúng", warn: "Lưu ý", error: "Sai", dev: "Bình thường" } as const;
const SOFT = "color-mix(in srgb, currentColor 14%, transparent)";
const MUTED = "color-mix(in srgb, currentColor 70%, transparent)";

export function KeystaticSiteUrlCard() {
  const pathname = usePathname();
  const [status, setStatus] = useState<SiteUrlStatus | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [dark, setDark] = useState(false);
  const active = SITE_SETTINGS_ROUTE.test(pathname);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    fetch("/api/dia-chi-web", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<SiteUrlStatus>) : null))
      .then((s) => alive && s && setStatus(s))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return; // không ở trang Cài đặt site thì không vẽ gì (xem điều kiện ở cuối hàm)
    let timer = 0;
    const place = () => {
      const grid = document.querySelector<HTMLElement>("[data-ks-cards]");
      if (!grid || !grid.parentElement) return;
      let el = grid.parentElement.querySelector<HTMLElement>(`:scope > [${HOST_ATTR}]`);
      if (!el) {
        // <section>, KHÔNG phải <div>: KeystaticSettingsCards chọn lưới thẻ bằng `main form > div > div > div`, một <div> chèn trước lưới sẽ bị nhận nhầm là lưới
        el = document.createElement("section");
        el.setAttribute(HOST_ATTR, "");
        el.style.cssText = "width:100%;max-width:880px;margin:0 auto 24px;";
        grid.before(el);
      }
      setHost((cur) => (cur === el ? cur : el));
      const d = isDarkTheme();
      setDark((cur) => (cur === d ? cur : d));
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(place, 50); // setTimeout thay vì requestAnimationFrame: tab chạy nền không bị treo
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [active, pathname]);

  if (!active || !host || !status) return null;
  const p = seoPalette(dark);
  const color = status.level === "ok" ? p.good : status.level === "warn" ? p.warn : status.level === "error" ? p.bad : "inherit";
  const fg = dark ? "#ededed" : "#0a0a0a";
  return createPortal(
    <section
      data-ks-site-url={status.level}
      aria-label="Địa chỉ web"
      style={{
        color: fg,
        border: `1px solid ${SOFT}`,
        borderRadius: 10,
        background: dark ? "color-mix(in srgb, #fff 5%, transparent)" : "#fff",
        font: "14px/1.5 system-ui, sans-serif",
      }}
    >
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>Địa chỉ web</div>
        <div style={{ marginTop: 4, color: MUTED }}>Địa chỉ chính thức của web (biến NEXT_PUBLIC_SITE_URL). Sitemap, thẻ canonical và ảnh chia sẻ đều dùng nó.</div>
      </div>
      <div role={status.level === "error" ? "alert" : "status"} style={{ padding: "16px 24px 24px", color }}>
        <strong>{MARK[status.level]}:</strong> {status.message}
      </div>
      <div style={{ padding: "12px 24px", borderTop: `1px solid ${SOFT}`, borderRadius: "0 0 9px 9px", background: "color-mix(in srgb, currentColor 5%, transparent)", fontSize: 13, color: MUTED }}>
        Đổi ở Vercel → Settings → Environment Variables; đổi xong phải Redeploy mới có hiệu lực.
      </div>
    </section>,
    host,
  );
}
