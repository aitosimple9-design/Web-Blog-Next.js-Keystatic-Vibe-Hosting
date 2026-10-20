// Ngày viết bằng chữ theo Design System: "03 tháng 10, 2026" và dạng ngắn "28 tháng 9".

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d: String(d).padStart(2, "0") };
};

export function formatDateLong(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} tháng ${m}, ${y}`;
}

export function formatDateShort(iso: string): string {
  const { m, d } = parts(iso);
  return `${d} tháng ${m}`;
}

// Tốc độ đọc tiếng Việt khoảng 200 từ / phút
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

export const formatReadTime = (min: number, template = "{n} phút đọc") => template.replace("{n}", String(min));
