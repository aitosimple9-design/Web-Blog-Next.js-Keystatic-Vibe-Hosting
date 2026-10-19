// Đọc form bài của Keystatic ở TRÌNH DUYỆT để hộp điểm SEO chấm được cả nội dung CHƯA LƯU.
// Keystatic không cho một ô đọc giá trị các ô khác, nên ta đọc thẳng DOM. Để bền lâu, việc đọc bám vào thứ Keystatic
// buộc phải giữ ổn định vì trình đọc màn hình dùng chúng: TÊN TRUY CẬP của ô (= nhãn trong keystatic.config.ts, xem
// src/lib/seo-fields.ts), vai trò ARIA (textbox / group / grid / row) và thẻ HTML ngữ nghĩa (p, h2, ul, a...).
// KHÔNG bám vào class CSS hay cấu trúc lồng nhau, là thứ đổi mỗi lần Keystatic cập nhật.
// Ô nào không tìm thấy được ghi vào `missing` để hộp điểm báo rõ thay vì chấm sai trong im lặng.
import type { SeoInput } from "@/shared/seo-score";
import { POST_FIELD_LABELS, type PostFieldKey } from "@/cms/lib/seo-fields";

// ---------- nội dung soạn thảo -> Markdown ----------

/** Phần tối thiểu của một DOM node mà bộ chuyển cần (để test được mà không cần trình duyệt). */
export type MdNode = {
  nodeType: number;
  nodeName: string;
  childNodes: ArrayLike<MdNode>;
  textContent: string | null;
  getAttribute?: (name: string) => string | null;
};

const TEXT = 3;
const ELEMENT = 1;
const HEADING = /^H([1-6])$/;
const BLOCK_TAGS = new Set(["P", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "HR", "TABLE", "FIGURE", "DIV", "SECTION", "ARTICLE"]);

const kids = (n: MdNode): MdNode[] => Array.from(n.childNodes);
const isBlock = (n: MdNode) => n.nodeType === ELEMENT && (BLOCK_TAGS.has(n.nodeName) || HEADING.test(n.nodeName));

/**
 * Phần tử mà người dùng không gõ vào được (`contenteditable="false"`): chữ giữ chỗ "Start writing or press /...", nút, widget
 * của bộ soạn thảo. Chữ trong đó KHÔNG phải nội dung bài; riêng ảnh bên trong vẫn là nội dung (ảnh chèn vào bài là một khối như vậy).
 */
const isWidget = (n: MdNode) => n.getAttribute?.("contenteditable") === "false";

/** Chỉ các ảnh (có `src`) trong một cây, dạng Markdown; dùng cho widget không soạn thảo được. */
function imagesOnly(node: MdNode): string {
  if (node.nodeType !== ELEMENT) return "";
  if (node.nodeName === "IMG") return image(node);
  return kids(node).map(imagesOnly).join("");
}

/** Ảnh thật có `src`. Bộ soạn thảo tự thêm `<img alt="">` không có `src` vào đoạn rỗng (thẻ phụ trợ), phải bỏ qua. */
function image(node: MdNode): string {
  const src = node.getAttribute?.("src");
  return src ? `![${node.getAttribute?.("alt") ?? ""}](${src})` : "";
}

function inline(node: MdNode): string {
  if (node.nodeType === TEXT) return node.textContent ?? "";
  if (node.nodeType !== ELEMENT) return "";
  const name = node.nodeName;
  if (name === "BR") return " ";
  if (isWidget(node)) return imagesOnly(node);
  if (name === "IMG") return image(node);
  const text = kids(node).map(inline).join("");
  if (name === "A") {
    const href = node.getAttribute?.("href");
    return href ? `[${text}](${href})` : text;
  }
  return text;
}

function blocks(node: MdNode, out: string[], quote = false): void {
  let run: MdNode[] = []; // dãy node "dòng" liền nhau gộp thành một đoạn
  const flush = () => {
    if (run.length === 0) return;
    const text = run.map(inline).join("").replace(/\s+/g, " ").trim();
    if (text) out.push((quote ? "> " : "") + text);
    run = [];
  };
  for (const child of kids(node)) {
    if (!isBlock(child)) {
      run.push(child);
      continue;
    }
    flush();
    const name = child.nodeName;
    if (isWidget(child)) {
      const images = imagesOnly(child);
      if (images) out.push(images);
      continue;
    }
    const h = HEADING.exec(name);
    if (h) {
      out.push(`${"#".repeat(Number(h[1]))} ${inline(child).replace(/\s+/g, " ").trim()}`);
    } else if (name === "UL" || name === "OL") {
      for (const li of kids(child).filter((c) => c.nodeName === "LI")) {
        const inner: string[] = [];
        blocks(li, inner);
        if (inner.length) out.push(`- ${inner.join(" ")}`);
      }
    } else if (name === "BLOCKQUOTE") {
      blocks(child, out, true);
    } else if (name === "PRE") {
      out.push(`\`\`\`\n${child.textContent ?? ""}\n\`\`\``);
    } else if (name === "HR") {
      out.push("---");
    } else if (name === "P" || name === "LI") {
      const text = kids(child).map(inline).join("").replace(/\s+/g, " ").trim();
      if (text) out.push((quote ? "> " : "") + text);
    } else {
      blocks(child, out, quote); // DIV, SECTION, FIGURE, TABLE...: đi sâu vào trong
    }
  }
  flush();
}

/** Nội dung trong ô soạn thảo (DOM) → Markdown để `scoreSeo` chấm: tiêu đề `##`, liên kết, ảnh, danh sách, trích dẫn, khối mã. */
export function editorToMarkdown(root: MdNode): string {
  const out: string[] = [];
  blocks(root, out);
  return out.join("\n\n");
}

// ---------- tên truy cập ----------

/** Chữ của một node, bỏ các nhánh `aria-hidden` (như dấu * bắt buộc) và khoảng trắng thừa. */
function visibleText(el: Element): string {
  let text = "";
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === Node.TEXT_NODE) text += n.textContent ?? "";
    else if (n instanceof Element && n.getAttribute("aria-hidden") !== "true") text += visibleText(n);
  }
  return text.replace(/\s+/g, " ").trim();
}

/** Tên truy cập của một control: aria-label, aria-labelledby, rồi <label for>. */
export function accessibleName(el: Element): string {
  const direct = el.getAttribute("aria-label");
  if (direct?.trim()) return direct.trim();
  const by = el.getAttribute("aria-labelledby");
  if (by) {
    const text = by
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => e !== null)
      .map(visibleText)
      .join(" ")
      .trim();
    if (text) return text;
  }
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label) return visibleText(label);
  }
  return "";
}

// ---------- đọc form ----------

/**
 * Form có thay đổi chưa Lưu không? Keystatic giữ lại thay đổi chưa Lưu cả khi tải lại trang, và bật nút "Reset changes"
 * khi form khác bản đã lưu. Trả null nếu không tìm thấy nút đó (Keystatic đổi giao diện): lúc đó coi như chưa biết.
 */
export function isFormDirty(root: ParentNode = document): boolean | null {
  const reset = Array.from(root.querySelectorAll("button")).find((b) => /^reset changes$/i.test(visibleText(b)));
  if (!reset) return null;
  return !(reset.hasAttribute("disabled") || reset.getAttribute("aria-disabled") === "true");
}

export type SeoFormRead = {
  /** Dữ liệu để chấm. Ô không đọc được thì để trống (xem `missing`). */
  input: SeoInput;
  /** Các ô không tìm thấy trong form (khóa trong POST_FIELD_LABELS). Rỗng = đọc đủ. */
  missing: PostFieldKey[];
};

const CONTROL_SELECTOR = "input, textarea, [role='textbox'], [role='group'], [role='grid']";

/**
 * Loại control theo vai trò: ô chữ thường ("text"), hoặc đúng `role` ARIA (textbox, group, grid, combobox...).
 * Cần vì Keystatic đặt CÙNG một tên cho nhiều control của một ô (ô chọn bài liên quan là combobox, danh sách đã chọn là grid).
 */
function kindOf(el: Element): string {
  return el.getAttribute("role") ?? "text";
}

/** Mỗi ô của form bài là loại control nào (để tìm đúng control khi nhiều control cùng tên). */
const FIELD_KIND: Record<PostFieldKey, string> = {
  title: "text",
  slug: "text",
  description: "text",
  coverAlt: "text",
  focusKeyword: "text",
  seoTitle: "text",
  cover: "group",
  ogImage: "group",
  tags: "grid",
  related: "grid",
  content: "textbox",
};

/** Ô ảnh có file khi trong khối có ảnh xem trước hoặc nút gỡ ảnh (tên nút theo ngôn ngữ giao diện Keystatic). */
const REMOVE_BUTTON = /^(remove|clear|delete|xóa|gỡ)/i;
function imageHasFile(group: Element): boolean {
  if (group.querySelector("img")) return true;
  return Array.from(group.querySelectorAll("button")).some((b) => REMOVE_BUTTON.test(visibleText(b)));
}

/** Các hàng dữ liệu của một danh sách (thẻ, bài liên quan); hàng "trống" của Keystatic có `data-has-items="false"`. */
function itemRows(grid: Element): Element[] {
  return Array.from(grid.querySelectorAll("[role='row']")).filter(
    (r) => r.getAttribute("data-has-items") !== "false" && r.querySelector("h3") === null && (r.textContent ?? "").trim() !== "",
  );
}

/**
 * Đọc form bài đang mở. `root` là vùng chứa form (mặc định `main`). Gọi lại mỗi khi form đổi; rẻ nên không cần cache.
 */
export function readSeoForm(root: ParentNode = document.querySelector("main") ?? document): SeoFormRead {
  const byKey = new Map<string, Element>(); // "<loại>|<tên truy cập>" → control
  for (const el of Array.from(root.querySelectorAll(CONTROL_SELECTOR))) {
    const name = accessibleName(el);
    const key = `${kindOf(el)}|${name}`;
    if (name && !byKey.has(key)) byKey.set(key, el);
  }
  const missing: PostFieldKey[] = [];
  const find = (key: PostFieldKey): Element | null => {
    const el = byKey.get(`${FIELD_KIND[key]}|${POST_FIELD_LABELS[key]}`) ?? null;
    if (!el) missing.push(key);
    return el;
  };
  const text = (key: PostFieldKey): string => {
    const el = find(key) as HTMLInputElement | HTMLTextAreaElement | null;
    return el && "value" in el ? el.value : "";
  };

  const title = text("title");
  const slug = text("slug");
  const description = text("description");
  const coverAlt = text("coverAlt");
  const focusKeyword = text("focusKeyword");
  const seoTitle = text("seoTitle");

  const coverGroup = find("cover");
  const ogGroup = find("ogImage");
  const tagsGrid = find("tags");
  const relatedGrid = find("related");
  const editor = find("content");

  return {
    input: {
      title,
      seoTitle,
      description,
      slug,
      focusKeyword,
      cover: coverGroup && imageHasFile(coverGroup) ? "(ảnh đã chọn)" : undefined,
      coverAlt,
      ogImage: ogGroup && imageHasFile(ogGroup) ? "(ảnh đã chọn)" : undefined,
      tags: tagsGrid ? itemRows(tagsGrid).map((r) => (r.textContent ?? "").trim()) : [],
      related: relatedGrid ? itemRows(relatedGrid).map((r) => r.getAttribute("data-key") ?? (r.textContent ?? "").trim()) : [],
      body: editor ? editorToMarkdown(editor as unknown as MdNode) : "",
    },
    missing,
  };
}
