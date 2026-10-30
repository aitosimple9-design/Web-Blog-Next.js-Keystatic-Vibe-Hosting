"use client";

// Ô CHỌN trong form của Keystatic (Tên sách, Chủ đề, Chủ đề con): danh sách chọn có ô tìm kiếm lấy từ mục tương ứng, cuối danh sách có nút
// "+ Thêm … mới" mở hộp thoại kiểu YouTube để điền rồi tạo luôn, tạo xong tự chọn. Giá trị lưu không đổi so với ô cũ: Sách = TÊN (chữ),
// Chủ đề = slug, Chủ đề con = danh sách slug. Danh sách và việc tạo đi qua /api/danh-muc (src/cms/lib/entry-store.ts; chế độ GitHub commit vào nhánh đang soạn).
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { branchOf } from "./ks-branch";
import { isDarkTheme } from "./ks-theme";

type Kind = "books" | "topics" | "subtopics";
type Item = { slug: string; name: string };
type Result = { ok: true; item: Item } | { ok: false; error: string };

// Mỗi loại: danh từ trong câu chữ, giá trị lưu là tên hay slug, câu báo khi để trống
const KINDS: Record<Kind, { noun: string; byName: boolean; missing: string }> = {
  books: { noun: "sách", byName: true, missing: "Cần chọn sách." },
  topics: { noun: "chủ đề", byName: false, missing: "Cần chọn chủ đề." },
  subtopics: { noun: "chủ đề con", byName: false, missing: "Chọn ít nhất một chủ đề con." },
};

export type EntryPickerProps = {
  kind: Kind;
  label: string;
  /** Giá trị đang chọn (ô chọn một thì có 0 hoặc 1 phần tử) */
  values: string[];
  multi?: boolean;
  onChange(values: string[]): void;
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

export function EntryPicker({ kind, label, values, multi = false, onChange, forceValidation }: EntryPickerProps) {
  const { noun, byName, missing } = KINDS[kind];
  const uid = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [filter, setFilter] = useState("");
  const [dark, setDark] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const c = palette(dark);
  const keyOf = (i: Item) => (byName ? i.name : i.slug);

  useEffect(() => {
    let live = true;
    fetch(`/api/danh-muc?kind=${kind}${query()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Item[]) => live && Array.isArray(list) && setItems(list))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [kind]);

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
  const nameOf = (v: string) => items.find((i) => keyOf(i) === v)?.name ?? v;
  const unknown = values.filter((v) => items.length > 0 && !items.some((i) => keyOf(i) === v));
  const invalid = forceValidation && values.length === 0;
  const toggle = () => {
    if (!open) {
      setDark(isDarkTheme());
      setFilter("");
    }
    setOpen(!open);
  };
  const pick = (key: string) => {
    if (multi) return onChange(values.includes(key) ? values.filter((v) => v !== key) : [...values, key]);
    onChange([key]);
    setOpen(false);
    trigger.current?.focus();
  };
  const created = (item: Item) => {
    setItems((prev) => [...prev.filter((i) => i.slug !== item.slug), item].sort((a, b) => a.name.localeCompare(b.name, "vi")));
    setDialog(false);
    if (multi) {
      onChange([...values.filter((v) => v !== keyOf(item)), keyOf(item)]);
    } else {
      pick(keyOf(item));
    }
  };

  const row = { display: "block", width: "100%", textAlign: "left", font: "inherit", fontSize: 14, padding: "10px 12px", minHeight: 40, background: "transparent", color: "inherit", border: 0, cursor: "pointer" } as const;
  const summary = values.map(nameOf).join(", ");

  return (
    <div ref={wrap} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 14, fontWeight: 500 }}>
        <span id={`${uid}-label`}>{label}</span>
        <span aria-hidden="true" style={{ color: c.error }}>
          {" "}
          *
        </span>
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
        style={{ ...row, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderRadius: 6, border: `1px solid ${invalid ? c.error : c.line}`, color: summary ? "inherit" : c.mute }}
      >
        <span>{summary || `Chọn ${noun}…`}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {unknown.length > 0 && (
        <span style={{ fontSize: 12, color: c.mute }}>
          “{unknown.join("”, “")}” không có trong danh sách {noun} (bài cũ hoặc đã xóa); chọn lại trong danh sách hoặc thêm mới.
        </span>
      )}
      {invalid && (
        <span role="alert" style={{ fontSize: 12, color: c.error }}>
          {missing}
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
          <ul id={`${uid}-list`} role="listbox" aria-multiselectable={multi || undefined} aria-labelledby={`${uid}-label`} style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 240, overflowY: "auto" }}>
            {shown.map((i) => {
              const on = values.includes(keyOf(i));
              return (
                <li key={i.slug} role="option" aria-selected={on}>
                  <button type="button" onClick={() => pick(keyOf(i))} style={{ ...row, fontWeight: on ? 600 : 400, background: on ? c.hover : "transparent" }}>
                    {multi && <span aria-hidden="true">{on ? "☑ " : "☐ "}</span>}
                    {i.name}
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li style={{ padding: "10px 12px", fontSize: 14, color: c.mute }}>Không có {noun} nào khớp.</li>}
          </ul>
          <button type="button" onClick={() => setDialog(true)} style={{ ...row, borderTop: `1px solid ${c.line}`, color: c.accent, fontWeight: 600 }}>
            + Thêm {noun} mới
          </button>
        </div>
      )}
      {dialog && <CreateDialog kind={kind} initialName={filter.trim()} dark={dark} onClose={() => setDialog(false)} onCreated={created} />}
    </div>
  );
}

function CreateDialog({ kind, initialName, dark, onClose, onCreated }: { kind: Kind; initialName: string; dark: boolean; onClose(): void; onCreated(item: Item): void }) {
  const { noun } = KINDS[kind];
  const c = palette(dark);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [order, setOrder] = useState("");
  const [topics, setTopics] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const needsMore = kind !== "books";
  const ready = !!name.trim() && (!needsMore || !!description.trim()) && (kind !== "subtopics" || !!topic);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (kind !== "subtopics") return;
    fetch(`/api/danh-muc?kind=topics${query()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Item[]) => Array.isArray(list) && setTopics(list))
      .catch(() => undefined);
  }, [kind]);

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/danh-muc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name, description, topic, order: order ? Number(order) : undefined, branch: branchOf() ?? undefined }),
      });
      const r = (await res.json().catch(() => null)) as Result | null;
      if (r?.ok) return onCreated(r.item);
      setError(r && !r.ok ? r.error : "Không tạo được, thử lại sau.");
    } catch {
      setError("Không gọi được máy chủ, thử lại sau.");
    }
    setBusy(false);
  };

  const box = { display: "flex", flexDirection: "column", gap: 2, padding: "8px 12px", borderRadius: 8, border: `1px solid ${c.line}` } as const;
  const small = { fontSize: 12, color: c.mute } as const;
  const input = { font: "inherit", fontSize: 15, padding: "4px 0", border: 0, outline: "none", background: "transparent", color: "inherit", width: "100%" } as const;

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
          <label style={box}>
            <span style={small}>Tên {noun} (bắt buộc)</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder={`Thêm tên ${noun}`} style={input} />
          </label>
          {kind === "subtopics" && (
            <label style={box}>
              <span style={small}>Chủ đề (bắt buộc)</span>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ ...input, cursor: "pointer" }}>
                <option value="" style={{ color: "#1f2328" }}>
                  Chọn chủ đề
                </option>
                {topics.map((t) => (
                  <option key={t.slug} value={t.slug} style={{ color: "#1f2328" }}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {needsMore && (
            <>
              <label style={box}>
                <span style={small}>Mô tả ngắn (bắt buộc, tối đa 200 ký tự: {description.length}/200)</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} rows={4} placeholder="Thêm mô tả" style={{ ...input, resize: "vertical" }} />
              </label>
              <label style={box}>
                <span style={small}>Thứ tự (số nhỏ hiện trước; để trống = xếp cuối)</span>
                <input type="number" min={1} value={order} onChange={(e) => setOrder(e.target.value)} style={input} />
              </label>
            </>
          )}
          <span style={small}>{kind === "books" ? "Ảnh bìa thêm sau ở mục Sách." : kind === "topics" ? "Ảnh nền thêm sau ở mục Chủ đề." : "Ảnh bìa thêm sau ở mục Chủ đề con."}</span>
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
            disabled={!ready || busy}
            style={{ font: "inherit", fontSize: 14, fontWeight: 600, minHeight: 44, padding: "0 20px", borderRadius: 999, border: 0, background: c.fg, color: c.bg, opacity: !ready || busy ? 0.4 : 1, cursor: !ready || busy ? "default" : "pointer" }}
          >
            {busy ? "Đang tạo…" : "Tạo"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
