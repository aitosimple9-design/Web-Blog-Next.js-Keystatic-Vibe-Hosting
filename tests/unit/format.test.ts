import { describe, expect, it } from "vitest";
import { formatDateLong, formatDateShort, formatReadTime, readingMinutes } from "@/lib/format";

describe("format", () => {
  it("viết ngày bằng chữ, ngày luôn 2 chữ số", () => {
    expect(formatDateLong("2026-10-03")).toBe("03 tháng 10, 2026");
    expect(formatDateShort("2026-09-28")).toBe("28 tháng 9");
  });

  it("thời gian đọc: 200 từ/phút, tối thiểu 1 phút", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(200)).toBe(1);
    expect(readingMinutes(1000)).toBe(5);
    expect(formatReadTime(5)).toBe("5 phút đọc");
  });
});
