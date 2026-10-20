"use client";

// Dải thông báo nhỏ nổi ở dưới giữa trang quản trị: web đang dùng địa chỉ thật hay còn localhost / địa chỉ tạm (kiểm tra NEXT_PUBLIC_SITE_URL).
// Dữ liệu từ /api/dia-chi-web (chỉ quản trị viên). Môi trường không phải production (level "dev") thì không hiện gì.
// Portal vào <body>, z-index 0 (cùng lý do với hộp điểm SEO: không đè lên danh sách thả xuống của Keystatic). Chữ luôn kèm nhãn Đúng / Lưu ý / Sai, không chỉ dựa vào màu.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteUrlStatus } from "@/shared/site-url-check";
import { isDarkTheme, seoPalette } from "./ks-theme";

const MARK = { ok: "Đúng", warn: "Lưu ý", error: "Sai" } as const;

export function KeystaticSiteUrlBanner() {
  const [status, setStatus] = useState<SiteUrlStatus | null>(null);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/dia-chi-web", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<SiteUrlStatus>) : null))
      .then((s) => {
        if (alive && s) {
          setStatus(s);
          setDark(isDarkTheme());
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  if (!status || status.level === "dev") return null;
  const p = seoPalette(dark);
  const color = status.level === "ok" ? p.good : status.level === "warn" ? p.warn : p.bad;
  return createPortal(
    <div
      role={status.level === "error" ? "alert" : "status"}
      data-ks-site-url={status.level}
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 0,
        maxWidth: "min(92vw, 640px)",
        padding: "8px 14px",
        borderRadius: 8,
        border: `1px solid ${color}`,
        background: dark ? "#1b1b1b" : "#ffffff",
        color,
        font: "500 13px/1.45 system-ui, sans-serif",
        boxShadow: "0 2px 8px rgba(0,0,0,.15)",
      }}
    >
      <strong>{MARK[status.level]}:</strong> {status.message}
    </div>,
    document.body,
  );
}
