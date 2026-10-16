"use client";

// HỘP ĐIỂM SEO trong form bài của Keystatic: chấm cả nội dung CHƯA LƯU, cập nhật khi đang gõ.
// - Hộp nằm NGOÀI cây DOM của Keystatic (portal vào <body>, nổi góc dưới bên phải) nên Keystatic đổi bố cục cũng không làm vỡ hộp.
// - Dữ liệu đọc từ form bằng src/app/keystatic/seo-form-reader.ts (bám nhãn ô + vai trò ARIA, xem file đó), chấm bằng src/lib/seo-score.ts.
// - TỰ KIỂM TRA để hỏng thì báo rõ thay vì chấm sai trong im lặng:
//     (1) ô nào của form không tìm thấy được → cảnh báo nêu tên ô;
//     (2) khi mở một bài đã có, điểm trực tiếp phải khớp điểm của BẢN ĐÃ LƯU (/api/diem-seo?slug=) → lệch thì cảnh báo.
// - z-index PHẢI là 0: danh sách thả xuống / hộp thoại của Keystatic được dựng vào <body> SAU hộp này và nằm trong lớp có hiệu ứng
//   (ngữ cảnh xếp chồng tầng 0), nên hộp có z-index lớn hơn sẽ đè lên và chặn chuột vào các lựa chọn (đã gặp ở ô Chủ đề).
// Chỉ hiện ở trang bài (tạo mới / sửa); chỉ chạy ở máy soạn bài (route API đã chặn ở production).
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { scoreSeo, type SeoCheck, type SeoResult } from "@/lib/seo-score";
import { POST_FIELD_NAMES, type PostFieldKey } from "@/lib/seo-fields";
import { isFormDirty, readSeoForm } from "./seo-form-reader";
import { SEO_LABEL, isDarkTheme, seoPalette } from "./ks-theme";

const POST_ROUTE = /^\/keystatic\/collection\/posts\/(?:item\/([^/]+)|create)\/?$/;
const PANEL_ATTR = "data-ks-seo-panel";
const OPEN_KEY = "ks-seo-panel-open";
const SIDE_KEY = "ks-seo-panel-side"; // hộp nổi che một phần form: cho chuyển sang trái / phải, nhớ lựa chọn
const DEBOUNCE_MS = 250;
const GIVE_UP_MS = 8000; // form không hiện ra (không có ô Tiêu đề) sau từng này thì báo lỗi

const STATUS_TEXT: Record<SeoCheck["status"], string> = { good: "Đạt", warn: "Cần cải thiện", bad: "Chưa đạt", na: "Chưa áp dụng" };

type View = {
  result: SeoResult;
  missing: PostFieldKey[];
};

function readOpen(): boolean {
  try {
    return localStorage.getItem(OPEN_KEY) === "1";
  } catch {
    return false;
  }
}
function writeOpen(open: boolean) {
  try {
    localStorage.setItem(OPEN_KEY, open ? "1" : "0");
  } catch {
    /* trình duyệt chặn lưu: bỏ qua */
  }
}
type Side = "left" | "right";
function readSide(): Side {
  try {
    return localStorage.getItem(SIDE_KEY) === "left" ? "left" : "right";
  } catch {
    return "right";
  }
}
function writeSide(side: Side) {
  try {
    localStorage.setItem(SIDE_KEY, side);
  } catch {
    /* bỏ qua */
  }
}

/** Các mục có trạng thái khác nhau giữa hai kết quả (theo id), để biết bộ đọc form có lệch với bản đã lưu không. */
function differing(live: SeoResult, saved: SeoResult): string[] {
  const savedStatus = new Map(saved.checks.map((c) => [c.id, c.status]));
  return live.checks.filter((c) => savedStatus.get(c.id) !== c.status).map((c) => c.label);
}

function Inner({ slug }: { slug: string | null }) {
  const [view, setView] = useState<View | null>(null);
  const [failed, setFailed] = useState(false);
  const [mismatch, setMismatch] = useState<string[] | null>(null);
  const [dirtyUnknown, setDirtyUnknown] = useState(false); // không nhận ra nút "Reset changes": không biết form đã sửa chưa
  const [open, setOpen] = useState(readOpen); // Inner chỉ dựng sau khi đã ở trình duyệt nên đọc localStorage ngay được
  const [dark, setDark] = useState(false);
  const [side, setSide] = useState<Side>(readSide);
  const touched = useRef(false); // người dùng đã sửa form: không đối chiếu với bản đã lưu nữa
  const compared = useRef(false);
  const timer = useRef(0);
  const startedAt = useRef(0);

  const refresh = useCallback(() => {
    const read = readSeoForm();
    const formShown = !read.missing.includes("title") || !read.missing.includes("content");
    if (!formShown) {
      if (Date.now() - startedAt.current > GIVE_UP_MS) setFailed(true);
      return;
    }
    setFailed(false);
    setDark(isDarkTheme());
    const result = scoreSeo(read.input);
    setView({ result, missing: read.missing });

    // Đối chiếu MỘT lần với bản đã lưu khi mở bài có sẵn và form chưa có thay đổi nào. Keystatic giữ lại thay đổi chưa Lưu
    // sau khi tải lại trang; form đã khác bản lưu thì lệch là đúng, không phải lỗi đọc form nên bỏ qua.
    if (slug && !compared.current && !touched.current && read.missing.length === 0) {
      compared.current = true;
      const dirty = isFormDirty();
      if (dirty === true) return;
      if (dirty === null) {
        console.warn('[SeoPanel] không tìm thấy nút "Reset changes" của Keystatic: không biết form đã sửa chưa, vẫn đối chiếu với bản đã lưu');
        setDirtyUnknown(true);
      }
      fetch(`/api/diem-seo?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<SeoResult>) : null))
        .then((saved) => {
          if (!saved) return;
          const diff = differing(result, saved);
          if (diff.length > 0 && !touched.current) {
            console.warn("[SeoPanel] điểm trực tiếp lệch với bản đã lưu ở:", diff);
            setMismatch(diff);
          }
        })
        .catch(() => {});
    }
  }, [slug]);

  useEffect(() => {
    startedAt.current = Date.now();
    const schedule = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(refresh, DEBOUNCE_MS);
    };
    const inPanel = (n: Node | null) => (n instanceof Element ? n : n?.parentElement)?.closest(`[${PANEL_ATTR}]`) != null;
    const onEdit = (e: Event) => {
      if (!inPanel(e.target as Node)) touched.current = true;
      schedule();
    };
    const observer = new MutationObserver((list) => {
      if (list.some((m) => !inPanel(m.target))) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    document.addEventListener("input", onEdit, true);
    document.addEventListener("change", onEdit, true);
    schedule();
    return () => {
      observer.disconnect();
      document.removeEventListener("input", onEdit, true);
      document.removeEventListener("change", onEdit, true);
      window.clearTimeout(timer.current);
    };
  }, [refresh]);

  const toggle = (next: boolean) => {
    setOpen(next);
    writeOpen(next);
  };
  const flip = () => {
    const next: Side = side === "right" ? "left" : "right";
    setSide(next);
    writeSide(next);
  };

  if (failed) {
    return createPortal(
      <div {...{ [PANEL_ATTR]: "" }} role="status" style={{ ...box(dark), padding: 12, width: 300 }}>
        <strong>Hộp điểm SEO không đọc được form.</strong> Có thể Keystatic đã đổi giao diện. Điểm ở danh sách Bài viết vẫn đúng (chấm theo bản đã lưu).
      </div>,
      document.body,
    );
  }
  if (!view) return null;

  const { result, missing } = view;
  const pal = seoPalette(dark);
  const color = pal[result.level];
  const problems = result.checks.filter((c) => c.status === "bad" || c.status === "warn").sort((a, b) => (a.status === b.status ? 0 : a.status === "bad" ? -1 : 1));
  const passed = result.checks.filter((c) => c.status === "good");
  const skipped = result.checks.filter((c) => c.status === "na");

  const pill: CSSProperties = {
    ...box(dark),
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    padding: "0 14px",
    cursor: "pointer",
    font: "inherit",
    fontWeight: 600,
  };

  return createPortal(
    <div {...{ [PANEL_ATTR]: "" }} style={{ position: "fixed", [side]: side === "left" ? 240 : 16, bottom: 64, zIndex: 0, maxWidth: "calc(100vw - 32px)" }}>
      {open ? (
        <section
          role="region"
          aria-label="Điểm SEO của bài"
          onKeyDown={(e) => e.key === "Escape" && toggle(false)}
          style={{ ...box(dark), width: 420, maxWidth: "100%", maxHeight: "min(70vh, 640px)", overflowY: "auto", padding: 16 }}
        >
          <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: muted(dark) }}>Điểm SEO</div>
              <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.2 }}>
                {result.score}
                <span style={{ fontSize: 14, fontWeight: 500 }}>/100 · {SEO_LABEL[result.level]}</span>
              </div>
              <div style={{ fontSize: 12, color: muted(dark), marginTop: 2 }}>Chấm theo nội dung đang gõ, kể cả phần chưa Lưu.</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                onClick={flip}
                style={btn(dark)}
                aria-label={side === "right" ? "Chuyển hộp điểm SEO sang bên trái" : "Chuyển hộp điểm SEO sang bên phải"}
              >
                {side === "right" ? "Sang trái" : "Sang phải"}
              </button>
              <button type="button" onClick={() => toggle(false)} style={btn(dark)} aria-label="Thu gọn hộp điểm SEO">
                Thu gọn
              </button>
            </div>
          </header>

          {missing.length > 0 && (
            <p role="status" style={notice(dark, pal.warn)}>
              Không đọc được ô: {missing.map((k) => POST_FIELD_NAMES[k]).join(", ")}. Điểm có thể thiếu chính xác; có thể Keystatic đã đổi giao diện.
            </p>
          )}
          {dirtyUnknown && (
            <p role="status" style={notice(dark, pal.warn)}>
              Không nhận ra nút &quot;Reset changes&quot; của Keystatic (có thể đã đổi giao diện), nên không phân biệt được form đã có thay đổi chưa Lưu. Cảnh báo
              &quot;lệch bản đã lưu&quot; nếu có chỉ đáng tin khi bạn vừa mở bài và chưa sửa gì.
            </p>
          )}
          {mismatch && (
            <p role="status" style={notice(dark, pal.warn)}>
              Điểm đọc trực tiếp từ form lệch với bản đã lưu ở: {mismatch.join(", ")}. Hãy bấm Lưu rồi tải lại trang để đối chiếu; nếu vẫn lệch, báo người bảo trì.
            </p>
          )}

          {problems.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3 style={h3(dark)}>Cần xử lý ({problems.length})</h3>
              <ul style={list}>
                {problems.map((c) => (
                  <li key={c.id} style={{ marginBottom: 10 }}>
                    <div>
                      <span style={{ color: pal[c.status === "bad" ? "bad" : "warn"], fontWeight: 700 }}>{STATUS_TEXT[c.status]}</span>
                      {" · "}
                      <strong>{c.label}</strong>
                      <span style={{ color: muted(dark) }}>: {c.detail}</span>
                    </div>
                    {c.hint && <div style={{ fontSize: 13, color: muted(dark), marginTop: 2 }}>{c.hint}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {passed.length > 0 && (
            <details style={{ marginTop: 8 }} open={problems.length === 0}>
              <summary style={summary}>Đã đạt ({passed.length})</summary>
              <ul style={list}>
                {passed.map((c) => (
                  <li key={c.id} style={{ marginTop: 6, fontSize: 13 }}>
                    <span style={{ color: pal.good, fontWeight: 700 }}>{STATUS_TEXT.good}</span> · {c.label}
                    <span style={{ color: muted(dark) }}>: {c.detail}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {skipped.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={summary}>Chưa áp dụng ({skipped.length})</summary>
              <ul style={list}>
                {skipped.map((c) => (
                  <li key={c.id} style={{ marginTop: 6, fontSize: 13, color: muted(dark) }}>
                    {c.label}: {c.detail}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      ) : (
        <button type="button" onClick={() => toggle(true)} aria-expanded="false" style={pill}>
          <span>SEO</span>
          <span style={{ color }}>
            {result.score} · {SEO_LABEL[result.level]}
          </span>
        </button>
      )}
    </div>,
    document.body,
  );
}

// ---------- kiểu dáng (theo theme Light / Dark của Keystatic) ----------

const muted = (dark: boolean) => (dark ? "#b4b4b4" : "#59636e");
const box = (dark: boolean): CSSProperties => ({
  background: dark ? "#2f2f2f" : "#ffffff",
  color: dark ? "#f0f0f0" : "#1f2328",
  border: `1px solid ${dark ? "#555" : "#d1d9e0"}`,
  borderRadius: 12,
  boxShadow: dark ? "0 8px 24px rgba(0,0,0,.5)" : "0 8px 24px rgba(31,35,40,.18)",
  fontSize: 14,
  lineHeight: 1.45,
});
const btn = (dark: boolean): CSSProperties => ({
  background: "transparent",
  color: "inherit",
  border: `1px solid ${dark ? "#666" : "#b6bec6"}`,
  borderRadius: 8,
  minHeight: 44,
  padding: "0 12px",
  cursor: "pointer",
  font: "inherit",
  whiteSpace: "nowrap",
});
const notice = (dark: boolean, accent: string): CSSProperties => ({
  margin: "12px 0 0",
  padding: "8px 10px",
  fontSize: 13,
  borderLeft: `4px solid ${accent}`,
  background: dark ? "#3a3a3a" : "#f6f8fa",
  borderRadius: 4,
});
const h3 = (dark: boolean): CSSProperties => ({ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: dark ? "#f0f0f0" : "#1f2328" });
const list: CSSProperties = { margin: 0, padding: 0, listStyle: "none" };
const summary: CSSProperties = { cursor: "pointer", fontWeight: 600, minHeight: 32 };

export function KeystaticSeoPanel() {
  const pathname = usePathname();
  // true ở trình duyệt, false khi dựng phía server: hộp dùng portal vào <body> nên chỉ được dựng ở trình duyệt
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const match = POST_ROUTE.exec(pathname ?? "");
  if (!mounted || !match) return null;
  // `key` buộc dựng lại hộp (và đối chiếu lại) khi chuyển sang bài khác
  return <Inner key={pathname} slug={match[1] ? decodeURIComponent(match[1]) : null} />;
}
