"use client";

// Trang quản trị Keystatic: hai lối tắt tạo CHUYỂN HƯỚNG (đường dẫn cũ → mới) để khỏi gõ tay. Chỉ đổi HIỂN THỊ ở trình duyệt; ghi file qua /api/chuyen-huong
// (src/lib/redirect-tools.ts, chỉ chạy ở máy soạn bài). Cả hai dùng đúng một chỗ ghi nên kết quả giống nhau.
//  1) Cạnh ô Slug của Bài viết / Chủ đề (trang sửa): nút "Tạo chuyển hướng" nếu Slug đang gõ khác slug đã lưu (slug cũ lấy từ địa chỉ trang).
//  2) Nút "Thêm" ở danh sách Chuyển hướng: mở hộp chọn Loại → Mục (hiện sẵn slug cũ) → ô điền slug mới. Sách / Khác nhập tay hai đường dẫn.
// Slug của Sách không có trang riêng nên không có nút ở trang sửa Sách.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { KIND_PREFIX, REDIRECT_KINDS, type RedirectKind } from "@/lib/redirect-patterns";
import { isDarkTheme } from "./ks-theme";

const BOX = "data-ks-redirect-box";
const ITEM_URL = /\/collection\/(posts|topics)\/item\/([^/?#]+)/;
const CREATE_LINK = 'a[href*="/collection/redirects/create"]';
const KIND_OF: Record<string, RedirectKind> = { posts: "Bài viết", topics: "Chủ đề" };

type Result = { ok: true; from: string; to: string; flattened: string[]; removed: string[] } | { ok: false; error: string };

async function post(body: Record<string, string>): Promise<Result> {
  try {
    const r = await fetch("/api/chuyen-huong", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return (await r.json()) as Result;
  } catch {
    return { ok: false, error: "Không gọi được máy chủ. Chạy lại npm run dev rồi thử lại." };
  }
}

const notes = (r: Extract<Result, { ok: true }>) =>
  [...r.flattened.map((x) => `Đã cập nhật chuyển hướng cũ: ${x}`), ...r.removed.map((x) => `Đã xóa chuyển hướng ngược gây vòng lặp: ${x}`)].join(" · ");

/* ---------- 1) Nút cạnh ô Slug ---------- */

function slugInput(): HTMLInputElement | null {
  for (const input of document.querySelectorAll<HTMLInputElement>("main input")) {
    if ((input.labels?.[0]?.textContent ?? "").trim().startsWith("Slug")) return input;
  }
  return null;
}

function refreshBox(box: HTMLElement, oldSlug: string, kind: RedirectKind, input: HTMLInputElement) {
  const button = box.querySelector<HTMLButtonElement>("button")!;
  const prefix = KIND_PREFIX[kind]!;
  const now = input.value.trim();
  const same = !now || now === oldSlug;
  button.disabled = same;
  button.style.opacity = same ? "0.55" : "1";
  button.style.cursor = same ? "not-allowed" : "pointer";
  button.textContent = same ? "Tạo chuyển hướng (Slug chưa đổi)" : `Tạo chuyển hướng ${prefix}${oldSlug} → ${prefix}${now}`;
  button.dataset.newSlug = now;
}

function mountBox() {
  const match = location.pathname.match(ITEM_URL);
  const input = match ? slugInput() : null;
  const existing = document.querySelector<HTMLElement>(`[${BOX}]`);
  if (!match || !input) {
    existing?.remove();
    return;
  }
  const oldSlug = decodeURIComponent(match[2]);
  const kind = KIND_OF[match[1]];
  // Hàng chứa ô Slug + nút Regenerate: hộp nằm ngay dưới hàng này
  const row = input.closest<HTMLElement>("div[class]")?.parentElement?.closest<HTMLElement>("div[class]");
  const anchor = [...(input.closest("main")?.querySelectorAll<HTMLElement>('button[aria-label="regenerate"]') ?? [])][0]?.parentElement?.parentElement ?? row;
  if (!anchor) return;
  let box = existing;
  if (box && (box.dataset.old !== oldSlug || box.previousElementSibling !== anchor)) {
    box.remove();
    box = null;
  }
  if (!box) {
    box = document.createElement("div");
    box.setAttribute(BOX, "");
    box.dataset.old = oldSlug;
    box.style.cssText = "margin-top:8px;display:flex;flex-direction:column;gap:6px;align-items:flex-start";
    const button = document.createElement("button");
    button.type = "button";
    const dark = isDarkTheme();
    button.style.cssText = `font:inherit;font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid ${dark ? "#6b7280" : "#9ca3af"};background:transparent;color:inherit;text-align:left`;
    const status = document.createElement("span");
    status.setAttribute("role", "status");
    status.style.cssText = "font-size:13px";
    button.addEventListener("click", async () => {
      const newSlug = button.dataset.newSlug ?? "";
      if (button.disabled || !newSlug) return;
      button.disabled = true;
      status.textContent = "Đang tạo...";
      const r = await post({ kind, oldSlug, newSlug });
      status.style.color = r.ok ? (isDarkTheme() ? "#56d364" : "#1a7f37") : isDarkTheme() ? "#ff7b72" : "#cf222e";
      status.textContent = r.ok
        ? `Đã tạo chuyển hướng ${r.from} → ${r.to}. Nhớ bấm Lưu để đổi slug bài. ${notes(r)}`
        : `Chưa tạo được: ${r.error}`;
      refreshBox(box!, oldSlug, kind, input);
    });
    box.append(button, status);
    anchor.after(box);
  }
  refreshBox(box, oldSlug, kind, input);
}

/* ---------- 2) Hộp "Thêm chuyển hướng" ---------- */

function Modal({ listUrl, onClose }: { listUrl: string; onClose: () => void }) {
  const [kind, setKind] = useState<RedirectKind>("Bài viết");
  const [items, setItems] = useState<{ slug: string; title: string }[]>([]);
  const [oldSlug, setOldSlug] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();
  const prefix = KIND_PREFIX[kind];
  const dark = isDarkTheme();
  const c = { bg: dark ? "#1f2328" : "#ffffff", fg: dark ? "#e6edf3" : "#1f2328", line: dark ? "#6b7280" : "#9ca3af", mute: dark ? "#9ca3af" : "#57606a" };

  const load = (k: RedirectKind) => {
    if (!KIND_PREFIX[k]) return;
    fetch(`/api/chuyen-huong?kind=${encodeURIComponent(k)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: { slug: string; title: string }[]) => setItems(d))
      .catch(() => setItems([]));
  };
  const changeKind = (k: RedirectKind) => {
    setKind(k);
    setOldSlug("");
    setItems([]);
    setResult(null);
    load(k);
  };
  // Lần mở đầu: loại mặc định là Bài viết (setState chỉ chạy sau khi tải xong)
  useEffect(() => load("Bài viết"), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const field = { width: "100%", boxSizing: "border-box", font: "inherit", padding: "8px 10px", borderRadius: 6, border: `1px solid ${c.line}`, background: "transparent", color: "inherit" } as const;
  const label = { display: "flex", flexDirection: "column", gap: 4, fontSize: 14 } as const;
  const submit = async () => {
    setBusy(true);
    setResult(await post(prefix ? { kind, oldSlug, newSlug } : { kind, from, to }));
    setBusy(false);
  };
  const ready = prefix ? !!oldSlug && !!newSlug.trim() : !!from.trim() && !!to.trim();

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label="Thêm chuyển hướng" style={{ background: c.bg, color: c.fg, borderRadius: 10, padding: 20, width: "min(480px, 100%)", maxHeight: "90vh", overflow: "auto", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 10px 40px rgba(0,0,0,.35)" }}>
        <strong style={{ fontSize: 18 }}>Thêm chuyển hướng</strong>
        {result?.ok ? (
          <>
            <p style={{ margin: 0 }}>
              Đã tạo: <code>{result.from}</code> → <code>{result.to}</code>
            </p>
            {(result.flattened.length > 0 || result.removed.length > 0) && <p style={{ margin: 0, fontSize: 13, color: c.mute }}>{notes(result)}</p>}
            <p style={{ margin: 0, fontSize: 13, color: c.mute }}>Với bài / chủ đề: nhớ đổi slug thật ở trang sửa (bấm Lưu) để đường dẫn mới có trang. Khởi động lại npm run dev thì chuyển hướng mới có tác dụng khi chạy thử.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ ...field, width: "auto", alignSelf: "flex-start", cursor: "pointer", fontWeight: 600 }}>
              Xong
            </button>
          </>
        ) : (
          <>
            <label style={label}>
              Loại
              <select value={kind} onChange={(e) => changeKind(e.target.value as RedirectKind)} style={field}>
                {REDIRECT_KINDS.map((k) => (
                  <option key={k} value={k} style={{ color: "#1f2328" }}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            {prefix ? (
              <>
                <label style={label}>
                  Mục
                  <select value={oldSlug} onChange={(e) => setOldSlug(e.target.value)} style={field}>
                    <option value="" style={{ color: "#1f2328" }}>
                      — Chọn {kind.toLowerCase()} —
                    </option>
                    {items.map((i) => (
                      <option key={i.slug} value={i.slug} style={{ color: "#1f2328" }}>
                        {i.title} ({i.slug})
                      </option>
                    ))}
                  </select>
                </label>
                <label style={label}>
                  Slug cũ (tự điền)
                  <input value={oldSlug ? prefix + oldSlug : ""} readOnly placeholder="Chọn mục ở trên" style={{ ...field, opacity: 0.8 }} />
                </label>
                <label style={label}>
                  Slug mới
                  <input value={newSlug} onChange={(e) => setNewSlug(e.target.value.trim())} placeholder="vi-du-slug-moi" style={field} />
                  <span style={{ fontSize: 12, color: c.mute }}>Chữ thường không dấu, nối bằng dấu gạch ngang. Đường dẫn mới: {prefix}{newSlug || "…"}</span>
                </label>
              </>
            ) : (
              <>
                {kind === "Sách" && <p style={{ margin: 0, fontSize: 13, color: c.mute }}>Sách chưa có trang riêng nên chưa có đường dẫn tự điền; nhập tay nếu cần.</p>}
                <label style={label}>
                  Đường dẫn cũ
                  <input value={from} onChange={(e) => setFrom(e.target.value.trim())} placeholder="/duong-dan-cu" style={field} />
                </label>
                <label style={label}>
                  Đường dẫn mới
                  <input value={to} onChange={(e) => setTo(e.target.value.trim())} placeholder="/duong-dan-moi" style={field} />
                </label>
              </>
            )}
            {result && !result.ok && (
              <p role="alert" style={{ margin: 0, fontSize: 14, color: dark ? "#ff7b72" : "#cf222e" }}>
                Chưa tạo được: {result.error}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" disabled={!ready || busy} onClick={submit} style={{ ...field, width: "auto", cursor: ready && !busy ? "pointer" : "not-allowed", opacity: ready && !busy ? 1 : 0.55, fontWeight: 600 }}>
                {busy ? "Đang tạo..." : "Tạo chuyển hướng"}
              </button>
              <button type="button" onClick={onClose} style={{ ...field, width: "auto", cursor: "pointer" }}>
                Hủy
              </button>
              <button type="button" onClick={() => router.push(`${listUrl}/create`)} style={{ ...field, width: "auto", cursor: "pointer", border: "none", textDecoration: "underline", color: c.mute }}>
                Nhập trong biểu mẫu Keystatic
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function KeystaticRedirectTools() {
  const [listUrl, setListUrl] = useState<string | null>(null);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(mountBox, 80); // setTimeout thay vì requestAnimationFrame: tab chạy nền không bị treo
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    const onInput = (e: Event) => {
      if (e.target instanceof HTMLInputElement && e.target.closest(`[${BOX}]`) === null) schedule();
    };
    // Chặn nút "Thêm" của danh sách Chuyển hướng (chạy ở pha bắt để đi trước bộ định tuyến của Keystatic)
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>(CREATE_LINK) : null;
      if (!a || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      e.stopPropagation();
      setListUrl(new URL(a.href).pathname.replace(/\/create$/, ""));
    };
    document.addEventListener("input", onInput, true);
    document.addEventListener("click", onClick, true);
    schedule();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("click", onClick, true);
      document.querySelector(`[${BOX}]`)?.remove();
    };
  }, []);

  return listUrl ? <Modal listUrl={listUrl} onClose={() => setListUrl(null)} /> : null;
}
