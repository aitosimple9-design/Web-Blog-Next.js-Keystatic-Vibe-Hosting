"use client";

// THẺ "KIỂM TRA NỘI DUNG" ở đầu Dashboard của Keystatic (Lộc chọn 2026-11-02: kết quả ngay trong trang quản trị, không phải chờ CI).
// Gọi /api/kiem-tra (cùng bộ luật với `npm run check-content` / CI) cho nhánh đang soạn, khi mở Dashboard và khi bấm "Kiểm tra lại".
// Lỗi nhóm theo từng mục, bấm tên mục để mở trang sửa (src/cms/lib/check-links.ts); cảnh báo và thông tin gấp gọn trong <details>.
// Thẻ chèn (portal) ngay trước <section> đầu tiên của Dashboard; mất (Keystatic vẽ lại) thì chèn lại. Chỉ đổi hiển thị, không ghi gì.
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { groupByFile, type FileGroup } from "../lib/check-links";
import { branchOf } from "./ks-branch";
import { isDarkTheme, seoPalette } from "./ks-theme";

// Dashboard: /keystatic hoặc /keystatic/branch/<nhánh> (chế độ GitHub)
export const DASHBOARD_ROUTE = /^\/keystatic(?:\/branch\/[^/]+)?\/?$/;
const HOST_ATTR = "data-ks-content-check";
const SOFT = "color-mix(in srgb, currentColor 14%, transparent)";
const MUTED = "color-mix(in srgb, currentColor 70%, transparent)";
const MAX_GROUPS = 40;

type Result = { errors: string[]; warnings: string[]; infos: string[]; counts: { posts: number; topics: number; subtopics: number; books: number } };
type Response = { ok: true; mode: "github" | "local"; branch: string | null; base: string | null; ms: number; result: Result } | { ok: false; error: string };
type State = { phase: "loading" } | { phase: "done"; data: Extract<Response, { ok: true }>; at: Date } | { phase: "error"; message: string };

export function KeystaticContentCheck() {
  const pathname = usePathname();
  const active = DASHBOARD_ROUTE.test(pathname);
  const [state, setState] = useState<State>({ phase: "loading" });
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [dark, setDark] = useState(false);

  // Chỉ đặt state khi có kết quả (lần đầu state đã là "loading"); nút "Kiểm tra lại" tự đặt "loading" trước khi gọi
  const load = useCallback(() => {
    const b = branchOf();
    fetch(`/api/kiem-tra${b ? `?branch=${encodeURIComponent(b)}` : ""}`, { cache: "no-store" })
      .then(async (r) => ((await r.json().catch(() => null)) as Response | null) ?? { ok: false as const, error: `Máy chủ trả lỗi ${r.status}` })
      .then((d) => setState(d.ok ? { phase: "done", data: d, at: new Date() } : { phase: "error", message: d.error }))
      .catch(() => setState({ phase: "error", message: "Không gọi được máy chủ, thử lại sau." }));
  }, []);

  const run = () => {
    setState({ phase: "loading" });
    load();
  };

  useEffect(() => {
    if (active) load();
  }, [active, pathname, load]);

  useEffect(() => {
    if (!active) return;
    let timer = 0;
    const place = () => {
      const main = document.querySelector<HTMLElement>("#keystatic-main-panel");
      const first = main ? [...main.querySelectorAll<HTMLElement>("section")].find((s) => !s.hasAttribute(HOST_ATTR) && s.querySelector(":scope > h2")) : null;
      if (!first?.parentElement) return;
      let el = first.parentElement.querySelector<HTMLElement>(`:scope > [${HOST_ATTR}]`);
      if (!el) {
        el = document.createElement("section");
        el.setAttribute(HOST_ATTR, "");
        first.before(el);
      }
      setHost((cur) => (cur === el ? cur : el));
      const d = isDarkTheme();
      setDark((cur) => (cur === d ? cur : d));
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(place, 50);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [active, pathname]);

  if (!active || !host) return null;
  const p = seoPalette(dark);
  const fg = dark ? "#ededed" : "#0a0a0a";
  const branch = branchOf();

  let status: { color: string; text: string; role: "status" | "alert" };
  if (state.phase === "loading") status = { color: MUTED, text: "Đang kiểm tra…", role: "status" };
  else if (state.phase === "error") status = { color: p.bad, text: `Không kiểm tra được: ${state.message}`, role: "alert" };
  else {
    const { errors, warnings } = state.data.result;
    status = errors.length
      ? { color: p.bad, text: `Chưa đạt: ${errors.length} lỗi, ${warnings.length} cảnh báo. Lỗi phải sửa trước khi đăng (CI sẽ chặn).`, role: "alert" }
      : { color: p.good, text: `Đạt: không có lỗi${warnings.length ? `, ${warnings.length} cảnh báo (nên xem, không chặn đăng)` : ""}.`, role: "status" };
  }

  const done = state.phase === "done" ? state.data : null;
  const btn = { font: "inherit", fontSize: 14, minHeight: 44, padding: "0 16px", borderRadius: 999, border: `1px solid ${SOFT}`, background: "transparent", color: "inherit", cursor: "pointer" } as const;

  return createPortal(
    <div style={{ color: fg, border: `1px solid ${SOFT}`, borderRadius: 10, background: dark ? "color-mix(in srgb, #fff 5%, transparent)" : "#fff", font: "14px/1.5 system-ui, sans-serif", marginBottom: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px 0" }}>
        <div style={{ minWidth: 0, flex: "1 1 280px" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>Kiểm tra nội dung</h2>
          <div style={{ marginTop: 4, color: MUTED }}>
            Cùng luật với CI, chạy trên bản đã Lưu {branch ? <>của nhánh <strong>{branch}</strong></> : "trên máy này"}. Chữ đang gõ chưa Lưu thì chưa được kiểm tra.
          </div>
        </div>
        <button type="button" onClick={run} disabled={state.phase === "loading"} style={{ ...btn, opacity: state.phase === "loading" ? 0.5 : 1 }}>
          Kiểm tra lại
        </button>
      </div>
      <p role={status.role} style={{ margin: 0, padding: "16px 24px", color: status.color, fontWeight: 600 }}>
        {status.text}
      </p>
      {done && done.result.errors.length > 0 && <Groups groups={groupByFile(done.result.errors, branch)} color={p.bad} />}
      {done && done.result.warnings.length > 0 && (
        <details style={{ padding: "0 24px 12px" }}>
          <summary style={{ cursor: "pointer", padding: "11px 0", fontWeight: 500 }}>Xem {done.result.warnings.length} cảnh báo</summary>
          <Groups groups={groupByFile(done.result.warnings, branch)} color={p.warn} inset />
        </details>
      )}
      {done && done.result.infos.length > 0 && (
        <details style={{ padding: "0 24px 12px" }}>
          <summary style={{ cursor: "pointer", padding: "11px 0", fontWeight: 500 }}>Thông tin ({done.result.infos.length})</summary>
          <ul style={{ margin: "4px 0 0", paddingLeft: 20, color: MUTED }}>
            {done.result.infos.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </details>
      )}
      <div style={{ padding: "12px 24px", borderTop: `1px solid ${SOFT}`, borderRadius: "0 0 9px 9px", background: "color-mix(in srgb, currentColor 5%, transparent)", fontSize: 13, color: MUTED }}>
        {done
          ? `Đã kiểm tra ${done.result.counts.posts} bài, ${done.result.counts.topics} chủ đề, ${done.result.counts.subtopics} chủ đề con, ${done.result.counts.books} sách${done.base ? `, so với ${done.base}` : ""} · ${(done.ms / 1000).toFixed(1)} giây · lúc ${state.phase === "done" ? state.at.toLocaleTimeString("vi-VN") : ""}`
          : "CI vẫn là lớp chặn cuối cùng: nó còn chạy lint, test và build."}
      </div>
    </div>,
    host,
  );
}

function Groups({ groups, color, inset = false }: { groups: FileGroup[]; color: string; inset?: boolean }) {
  const shown = groups.slice(0, MAX_GROUPS);
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: inset ? "4px 0 0" : "0 24px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      {shown.map((g) => (
        <li key={g.where || "_"} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12 }}>
          <div style={{ fontWeight: 600, overflowWrap: "anywhere" }} title={g.where || undefined}>
            {g.link ? (
              <a href={g.link} style={{ color: "inherit", textDecoration: "underline" }}>
                {g.label}
              </a>
            ) : (
              g.label
            )}
          </div>
          <ul style={{ margin: "2px 0 0", paddingLeft: 18 }}>
            {g.messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </li>
      ))}
      {groups.length > MAX_GROUPS && <li style={{ color: MUTED }}>… và {groups.length - MAX_GROUPS} mục khác (chạy npm run check-content để xem đủ).</li>}
    </ul>
  );
}
