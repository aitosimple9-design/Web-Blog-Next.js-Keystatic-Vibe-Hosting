"use client";

// Ô CHỌN trong form bài của Keystatic (hiện dùng cho "Tên sách" ở khối Nguồn sách): danh sách chọn có ô tìm kiếm lấy từ mục Sách, cuối danh sách
// có nút "+ Thêm sách mới" mở hộp thoại kiểu YouTube để điền rồi tạo luôn, tạo xong tự chọn. Giá trị lưu vẫn là CHỮ (tên sách) nên cấu trúc bài không đổi.
// Danh sách và việc tạo đi qua /api/danh-muc (src/cms/lib/entry-store.ts; chế độ GitHub commit vào nhánh đang soạn).
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { branchOf } from "./ks-branch";
import { isDarkTheme } from "./ks-theme";

type Item = { slug: string; name: string };
type Result = { ok: true; item: Item } | { ok: false; error: string };

export type EntryPickerProps = {
  label: string;
  /** Danh từ ngắn trong câu chữ: "sách" */
  noun: string;
  value: string;
  onChange(value: string): void;
  forceValidation: boolean;
};

const palette = (dark: boolean) => ({
  bg: dark ? "#1f2328" : "#ffffff",
  fg: dark ? "#e6edf3" : "#1f2328",
  line: dark ? "#6b7280" : "#9ca3af",
  mute: dark ? "#9ca3af" : "#57606a",
  hover: dark ? "#2d333b" : "#f3f4f6",
  accent: dark ? "#58a6ff" : "#0969da",
  error: dark ? "#ff7b72" : "#cf222e",
});

const query = () => {
  const b = branchOf();
  return b ? `&branch=${encodeURIComponent(b)}` : "";
};

export function EntryPicker({ label, noun, value, onChange, forceValidation }: EntryPickerProps) {
  const uid = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [filter, setFilter] = useState("");
  const [dark, setDark] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const c = palette(dark);

  useEffect(() => {
    let live = true;
    fetch(`/api/danh-muc?kind=books${query()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Item[]) => live && Array.isArray(list) && setItems(list))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !dialog) {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dialog]);

  const shown = items.filter((i) => i.name.toLowerCase().includes(filter.trim().toLowerCase()));
  const known = !value || items.some((i) => i.name === value);
  const invalid = forceValidation && !value.trim();
  const toggle = () => {
    if (!open) {
      setDark(isDarkTheme());
      setFilter("");
    }
    setOpen(!open);
  };
  const pick = (name: string) => {
    onChange(name);
    setOpen(false);
    trigger.current?.focus();
  };
  const created = (item: Item) => {
    setItems((prev) => [...prev.filter((i) => i.slug !== item.slug), item].sort((a, b) => a.name.localeCompare(b.name, "vi")));
    setDialog(false);
    pick(item.name);
  };

  const row = { display: "block", width: "100%", textAlign: "left", font: "inherit", fontSize: 14, padding: "10px 12px", minHeight: 40, background: "transparent", color: "inherit", border: 0, cursor: "pointer" } as const;

  return (
    <div ref={wrap} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4 }}>
      <span id={`${uid}-label`} style={{ fontSize: 14, fontWeight: 500 }}>
        {label}
      </span>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-labelledby={`${uid}-label`}
        aria-invalid={invalid || undefined}
        onClick={toggle}
        style={{ ...row, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderRadius: 6, border: `1px solid ${invalid ? c.error : c.line}`, color: value ? "inherit" : c.mute }}
      >
        <span>{value || `Chọn ${noun}…`}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {!known && <span style={{ fontSize: 12, color: c.mute }}>“{value}” chưa có trong mục Sách (bài cũ); chọn một cuốn trong danh sách hoặc thêm mới.</span>}
      {invalid && (
        <span role="alert" style={{ fontSize: 12, color: c.error }}>
          Cần chọn {noun}.
        </span>
      )}
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 4, background: c.bg, color: c.fg, border: `1px solid ${c.line}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
          <div style={{ padding: 8 }}>
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Tìm ${noun}…`}
              aria-label={`Tìm ${noun}`}
              style={{ width: "100%", boxSizing: "border-box", font: "inherit", fontSize: 14, padding: "8px 10px", borderRadius: 6, border: `1px solid ${c.line}`, background: "transparent", color: "inherit" }}
            />
          </div>
          <ul id={`${uid}-list`} role="listbox" aria-labelledby={`${uid}-label`} style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 240, overflowY: "auto" }}>
            {shown.map((i) => (
              <li key={i.slug} role="option" aria-selected={i.name === value}>
                <button type="button" onClick={() => pick(i.name)} style={{ ...row, fontWeight: i.name === value ? 600 : 400, background: i.name === value ? c.hover : "transparent" }}>
                  {i.name}
                </button>
              </li>
            ))}
            {shown.length === 0 && <li style={{ padding: "10px 12px", fontSize: 14, color: c.mute }}>Không có {noun} nào khớp.</li>}
          </ul>
          <button type="button" onClick={() => setDialog(true)} style={{ ...row, borderTop: `1px solid ${c.line}`, color: c.accent, fontWeight: 600 }}>
            + Thêm {noun} mới
          </button>
        </div>
      )}
      {dialog && <CreateDialog noun={noun} initialName={filter.trim()} dark={dark} onClose={() => setDialog(false)} onCreated={created} />}
    </div>
  );
}

function CreateDialog({ noun, initialName, dark, onClose, onCreated }: { noun: string; initialName: string; dark: boolean; onClose(): void; onCreated(item: Item): void }) {
  const c = palette(dark);
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/danh-muc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "books", name, branch: branchOf() ?? undefined }),
      });
      const r = (await res.json().catch(() => null)) as Result | null;
      if (r?.ok) return onCreated(r.item);
      setError(r && !r.ok ? r.error : "Không tạo được, thử lại sau.");
    } catch {
      setError("Không gọi được máy chủ, thử lại sau.");
    }
    setBusy(false);
  };

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-dialog-title"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void submit();
        }}
        style={{ background: c.bg, color: c.fg, borderRadius: 14, width: "min(480px, 100%)", maxHeight: "90vh", overflow: "auto", boxShadow: "0 10px 40px rgba(0,0,0,.35)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${c.line}` }}>
          <strong id="entry-dialog-title" style={{ fontSize: 18 }}>
            Thêm {noun} mới
          </strong>
          <button type="button" onClick={onClose} aria-label="Đóng" style={{ font: "inherit", fontSize: 20, width: 44, height: 44, margin: -8, background: "transparent", color: "inherit", border: 0, cursor: "pointer" }}>
            ×
          </button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 12px", borderRadius: 8, border: `1px solid ${c.line}` }}>
            <span style={{ fontSize: 12, color: c.mute }}>Tên {noun} (bắt buộc)</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder={`Thêm tên ${noun}`}
              style={{ font: "inherit", fontSize: 15, padding: "4px 0", border: 0, outline: "none", background: "transparent", color: "inherit" }}
            />
          </label>
          <span style={{ fontSize: 12, color: c.mute }}>Ảnh bìa thêm sau ở mục Sách.</span>
          {error && (
            <p role="alert" style={{ margin: 0, fontSize: 14, color: c.error }}>
              {error}
            </p>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: `1px solid ${c.line}` }}>
          <button type="button" onClick={onClose} style={{ font: "inherit", fontSize: 14, minHeight: 44, padding: "0 16px", borderRadius: 999, background: "transparent", color: "inherit", border: `1px solid ${c.line}`, cursor: "pointer" }}>
            Hủy
          </button>
          <button
            type="submit"
            disabled={!name.trim() || busy}
            style={{ font: "inherit", fontSize: 14, fontWeight: 600, minHeight: 44, padding: "0 20px", borderRadius: 999, border: 0, background: c.fg, color: c.bg, opacity: !name.trim() || busy ? 0.4 : 1, cursor: !name.trim() || busy ? "default" : "pointer" }}
          >
            {busy ? "Đang tạo…" : "Tạo"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
