// Dùng chung cho các phần ta thêm vào giao diện quản trị Keystatic (cột "Điểm SEO", hộp điểm SEO).
// Keystatic có nút chuyển Light / Dark riêng (không theo `prefers-color-scheme` của trình duyệt), nên đo độ sáng của nền trang
// để biết đang ở theme nào. Màu chữ chọn đủ tương phản (≥ 4,5:1) ở cả hai theme; chữ Tốt / Cần cải thiện / Chưa đạt luôn đi kèm
// nên không chỉ dựa vào màu.
export type SeoLevel = "good" | "warn" | "bad";

export const SEO_LABEL: Record<SeoLevel, string> = { good: "Tốt", warn: "Cần cải thiện", bad: "Chưa đạt" };

export const SEO_COLOR = {
  light: { good: "#1a7f37", warn: "#9a6700", bad: "#cf222e" },
  dark: { good: "#56d364", warn: "#e3b341", bad: "#ff7b72" },
} as const;

export function isDarkTheme(): boolean {
  const rgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g) ?? ["255", "255", "255"];
  const [r, g, b] = rgb.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

export const seoPalette = (dark: boolean) => SEO_COLOR[dark ? "dark" : "light"];
