// Danh mục KHỐI đã duyệt của từng trang (Lộc duyệt 2026-10-16): chỉ bật / tắt và (với trang cho phép) đổi thứ tự, KHÔNG thêm khối tùy ý.
// Hero luôn nằm đầu trang nên không có trong danh sách. Thứ tự trong mảng = thứ tự mặc định (khi admin chưa lưu gì).
// Khóa ngoài cùng là tên singleton trong keystatic.config.ts; đọc qua `getPageBlocks()` (src/lib/pages.ts).

/** dark = dải nền tối đáy nét cọ; fixed = luôn nền paper, không tính vào việc xen kẽ (dải chữ chạy, Newsletter); bỏ trống = khối nền sáng, xen kẽ paper / paper-sunk */
export type BlockKind = "dark" | "fixed";
export type BlockDef = { id: string; label: string; kind?: BlockKind };
export type PageBlock = { id: string; enabled: boolean };
export type PageBlocksConfig = {
  /** true = admin được đổi thứ tự (ô số, 0 = ẩn); false = chỉ bật / tắt */
  reorder: boolean;
  blocks: BlockDef[];
};

export const PAGE_BLOCKS = {
  homePage: {
    reorder: true,
    blocks: [
      { id: "story", label: "Câu chuyện" },
      { id: "principles", label: "Cách mình đọc" },
      { id: "stats", label: "Con số" },
      { id: "shelf", label: "Tủ sách", kind: "dark" },
      { id: "featured", label: "Bài tiêu biểu" },
      { id: "connect", label: "Kết nối" },
      { id: "newsletter", label: "Newsletter", kind: "fixed" },
    ],
  },
  bookPage: {
    reorder: true,
    blocks: [
      { id: "marquee", label: "Dải chữ chạy", kind: "fixed" },
      { id: "topics", label: "Chủ đề" },
      { id: "latest", label: "Bài viết mới nhất" },
      { id: "newsletter", label: "Newsletter", kind: "fixed" },
    ],
  },
  blogPage: {
    reorder: false,
    blocks: [{ id: "newsletter", label: "Newsletter", kind: "fixed" }],
  },
  articlePage: {
    reorder: false,
    blocks: [
      { id: "toc", label: "Mục lục" },
      { id: "source", label: "Khối nguồn sách" },
      { id: "related", label: "Bài liên quan" },
      { id: "newsletter", label: "Newsletter", kind: "fixed" },
    ],
  },
} as const satisfies Record<string, PageBlocksConfig>;

export type BlocksPageKey = keyof typeof PAGE_BLOCKS;

export type Tone = "paper" | "sunk" | "dark";
export type LaidOutBlock = {
  id: string;
  /** Nền của khối: paper / sunk xen kẽ theo vị trí; dark = dải tối đáy nét cọ */
  tone: Tone;
  /**
   * Khối cần kéo lên đè dưới nét cọ của khối tối ngay trước nó (hoặc của Hero nếu là khối đầu):
   * nét cọ để lộ nền phía sau, nên khối nền `sunk` (hoặc khối tối) sau một dải tối phải nằm sẵn ở đó.
   */
  pullUp: boolean;
};

/**
 * Sắp bố cục từ danh sách khối đã đọc: bỏ khối bị tắt (và khối `exclude`, vd. Tủ sách rỗng), xen kẽ nền paper / sunk cho khối nền sáng
 * (khối tối và khối `fixed` không tính), rồi đánh dấu khối cần kéo lên dưới nét cọ. Hàm thuần, không đọc file.
 */
export function layoutBlocks(page: BlocksPageKey, blocks: PageBlock[], exclude: string[] = []): LaidOutBlock[] {
  const defs: BlockDef[] = PAGE_BLOCKS[page].blocks;
  const kindOf = (id: string) => defs.find((d) => d.id === id)?.kind;
  let light = 0;
  let prevDark = true; // Hero (luôn đứng đầu) cũng là dải tối đáy nét cọ
  return blocks
    .filter((b) => b.enabled && !exclude.includes(b.id))
    .map((b) => {
      const kind = kindOf(b.id);
      const tone: Tone = kind === "dark" ? "dark" : kind === "fixed" ? "paper" : light++ % 2 === 0 ? "paper" : "sunk";
      const pullUp = prevDark && tone !== "paper";
      prevDark = tone === "dark";
      return { id: b.id, tone, pullUp };
    });
}
