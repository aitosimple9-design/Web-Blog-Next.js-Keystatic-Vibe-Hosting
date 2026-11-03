// Vị trí thẻ của băng chuyền "Bài viết mới nhất" (trang Book): xoay vòng, thẻ giữa = 0, hai bên đối xứng.
import { describe, expect, it } from "vitest";
import { carouselPos } from "@/frontend/components/book/LatestCarousel";

const row = (active: number, n: number) => Array.from({ length: n }, (_, i) => carouselPos(i, active, n));

describe("carouselPos", () => {
  it("5 thẻ: thẻ đang chọn ở giữa, 2 thẻ mỗi bên", () => {
    expect(row(0, 5)).toEqual([0, 1, 2, -2, -1]);
    expect(row(2, 5)).toEqual([-2, -1, 0, 1, 2]);
  });
  it("xoay vòng: thẻ cuối ở giữa thì thẻ đầu nằm ngay bên phải", () => {
    expect(row(4, 5)).toEqual([1, 2, -2, -1, 0]);
  });
  it("ít bài hơn vẫn đủ vị trí, không trùng", () => {
    expect(row(0, 3)).toEqual([0, 1, -1]);
    expect(row(0, 4)).toEqual([0, 1, 2, -1]);
    expect(row(0, 1)).toEqual([0]);
  });
});
