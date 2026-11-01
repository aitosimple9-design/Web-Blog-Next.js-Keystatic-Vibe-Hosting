"use client";

// CẢNH BÁO TRƯỚC KHI XÓA (rà soát admin 2026-11-01): hộp "Delete entry" của Keystatic chỉ hỏi "Are you sure?", không cho biết mục đang được dùng.
// Ở trang sửa Chủ đề / Chủ đề con / Sách, khi hộp đó hiện ra, chèn thêm một dòng cảnh báo (câu soạn ở src/cms/lib/delete-usage.ts,
// số liệu từ /api/thong-ke). Chỉ cảnh báo, không chặn nút xóa; chỉ đổi hiển thị ở trình duyệt.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { deleteWarning, type DeleteKind, type UsageStats } from "../lib/delete-usage";
import { branchOf } from "./ks-branch";
import { isDarkTheme } from "./ks-theme";

// Chế độ GitHub có thêm /branch/<nhánh>/ sau /keystatic
export const DELETE_GUARD_ROUTE = /^\/keystatic\/(?:branch\/[^/]+\/)?collection\/(topics|subtopics|books)\/item\/([^/]+)\/?$/;
const ATTR = "data-ks-delete-warning";

export function KeystaticDeleteGuard() {
  const pathname = usePathname();
  const m = DELETE_GUARD_ROUTE.exec(pathname);
  const kind = m?.[1] as DeleteKind | undefined;
  const slug = m ? decodeURIComponent(m[2]) : "";

  useEffect(() => {
    if (!kind) return;
    let stats: UsageStats | null = null;
    let alive = true;
    fetch("/api/thong-ke", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<UsageStats>) : null))
      .then((d) => {
        if (alive && d) {
          stats = d;
          apply();
        }
      })
      .catch(() => {});

    const apply = () => {
      const dialog = [...document.querySelectorAll<HTMLElement>('[role="alertdialog"], [role="dialog"]')].find((d) => (d.textContent ?? "").includes("Delete entry"));
      if (!dialog || !stats || dialog.querySelector(`[${ATTR}]`)) return;
      const text = deleteWarning(stats, kind, slug, branchOf() !== null);
      if (!text) return;
      const p = document.createElement("p");
      p.setAttribute(ATTR, "");
      p.setAttribute("role", "alert");
      p.textContent = text;
      const dark = isDarkTheme();
      p.style.cssText = `margin:12px 0 0;padding:10px 12px;border-radius:8px;font-size:14px;line-height:1.5;color:${dark ? "#ffb4ab" : "#8a1c12"};background:${dark ? "rgba(255,123,114,.12)" : "#fdecea"};border:1px solid ${dark ? "rgba(255,123,114,.4)" : "#f5c2bd"};`;
      // đặt ngay sau câu "Are you sure? ..." của Keystatic; không thấy thì để cuối phần nội dung
      const sure = [...dialog.querySelectorAll<HTMLElement>("*")].find((el) => el.children.length === 0 && (el.textContent ?? "").trim().startsWith("Are you sure"));
      if (sure) sure.after(p);
      else dialog.append(p);
    };

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [kind, slug]);

  return null;
}
