import { describe, expect, it } from "vitest";
import { layoutBlocks } from "@/shared/config/blocks";
import { resolveBlocks } from "@/shared/content/pages";

const home = (raw?: unknown, exclude: string[] = []) => layoutBlocks("homePage", resolveBlocks("homePage", raw), exclude);
const sum = (l: ReturnType<typeof home>) => l.map((b) => `${b.id}:${b.tone}${b.pullUp ? "^" : ""}`).join(" ");

describe("layoutBlocks: nền xen kẽ và nét cọ tự khớp theo vị trí", () => {
  it("mặc định Trang chủ giống hệt bố cục cũ (Bài tiêu biểu kéo lên dưới nét cọ của Tủ sách)", () => {
    expect(sum(home())).toBe("story:paper principles:sunk stats:paper shelf:dark featured:sunk^ newsletter:paper");
  });

  it("mặc định Book: dải chữ và Newsletter luôn paper, Bài mới nhất là sunk", () => {
    const l = layoutBlocks("bookPage", resolveBlocks("bookPage", {}));
    expect(sum(l as never)).toBe("marquee:paper topics:paper latest:sunk newsletter:paper");
  });

  it("tắt một khối thì nền xen kẽ tính lại, khối đầu tiên sau Hero luôn paper", () => {
    expect(sum(home({ blocks: { story: 0 } }))).toBe("principles:paper stats:sunk shelf:dark featured:paper newsletter:paper");
  });

  it("Tủ sách rỗng (exclude) coi như tắt: không còn dải tối, không kéo lên", () => {
    expect(sum(home({}, ["shelf"]))).toBe("story:paper principles:sunk stats:paper featured:sunk newsletter:paper");
  });

  it("đổi thứ tự: khối nền sunk đứng ngay sau dải tối thì kéo lên, khối paper thì không", () => {
    // Tủ sách lên đầu: tối ngay sau Hero (kéo lên để nối liền), rồi Câu chuyện (paper, không kéo)
    const first = home({ blocks: { shelf: 1, story: 2, principles: 3, stats: 4, featured: 5, newsletter: 6 } });
    expect(first[0]).toEqual({ id: "shelf", tone: "dark", pullUp: true });
    expect(first[1]).toEqual({ id: "story", tone: "paper", pullUp: false });
    // Con số (paper) ngay sau Tủ sách thì không cần kéo
    const second = home({ blocks: { stats: 5, shelf: 4 } });
    const i = second.findIndex((b) => b.id === "shelf");
    expect(second[i + 1].pullUp).toBe(second[i + 1].tone !== "paper");
  });

  it("tắt hết khối: không lỗi, danh sách rỗng", () => {
    expect(home({ blocks: { story: 0, principles: 0, stats: 0, shelf: 0, featured: 0, newsletter: 0 } })).toEqual([]);
  });
});
