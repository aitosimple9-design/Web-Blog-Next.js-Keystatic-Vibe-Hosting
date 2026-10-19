// Plugin rehype: gắn width / height (kích thước thật của file) cho ảnh trong thân bài, kèm loading="lazy" và decoding="async".
// Vì sao: ảnh Markdown (`![alt](/images/...)`) ra HTML thô không có width / height nên trình duyệt không biết chừa chỗ,
// bài bị NHẢY BỐ CỤC khi ảnh tải xong (CLS, một chỉ số Core Web Vitals mà Google dùng để xếp hạng).
// Có width / height thì trình duyệt tự tính tỉ lệ khung trước khi tải; CSS `max-width: 100%; height: auto` vẫn lo co giãn theo cột.
// Chỉ xử lý ảnh nội bộ (đường dẫn bắt đầu bằng "/") nằm trong thư mục public; ảnh ngoài, ảnh không đọc được kích thước
// thì để nguyên (không làm hỏng bài; `npm run check-content` đã báo ảnh trong bài bị mất file).
import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import type { Element, Nodes, Root } from "hast";

type Options = { /** Thư mục public/ chứa ảnh */ publicDir: string };

// Đọc kích thước tốn một lần đọc file; nhớ kết quả theo (đường dẫn, mtime) nên sửa / thay ảnh thì tự đọc lại.
const cache = new Map<string, { w: number; h: number } | null>();

function sizeOf(file: string): { w: number; h: number } | null {
  let mtime: number;
  try {
    mtime = fs.statSync(file).mtimeMs;
  } catch {
    return null;
  }
  const key = `${file}|${mtime}`;
  if (cache.has(key)) return cache.get(key)!;
  let result: { w: number; h: number } | null = null;
  try {
    const { width, height } = imageSize(fs.readFileSync(file));
    if (width && height) result = { w: width, h: height };
  } catch {
    /* định dạng không hỗ trợ hoặc file hỏng: bỏ qua */
  }
  cache.set(key, result);
  return result;
}

/** Đường dẫn ảnh nội bộ ("/images/a.jpg") → đường dẫn file trong publicDir; null nếu không phải ảnh nội bộ hoặc trỏ ra ngoài public/. */
function resolveInPublic(src: string, publicDir: string): string | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null; // ảnh ngoài (http, //cdn) không đọc được
  let clean: string;
  try {
    clean = decodeURIComponent(src.split(/[?#]/)[0]);
  } catch {
    return null; // "%" hỏng trong đường dẫn
  }
  const file = path.resolve(publicDir, "." + clean);
  const root = path.resolve(publicDir) + path.sep;
  return file.startsWith(root) ? file : null; // chặn ../ đi ra ngoài public/
}

function walk(node: Nodes, visit: (el: Element) => void): void {
  if (node.type === "element") visit(node);
  if ("children" in node) for (const child of node.children) walk(child as Nodes, visit);
}

export function rehypeImageSize({ publicDir }: Options) {
  return (tree: Root) => {
    walk(tree, (el) => {
      if (el.tagName !== "img") return;
      const src = el.properties?.src;
      if (typeof src !== "string") return;
      const file = resolveInPublic(src, publicDir);
      const size = file ? sizeOf(file) : null;
      if (!size) return;
      el.properties.width = size.w;
      el.properties.height = size.h;
      el.properties.loading = "lazy";
      el.properties.decoding = "async";
    });
  };
}
