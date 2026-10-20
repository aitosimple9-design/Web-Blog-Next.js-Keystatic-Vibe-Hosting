// Đọc "Nhãn giao diện" do Keystatic lưu ở content/settings/ui-labels.json (singleton; mỗi nhóm là một khối con, khóa theo src/shared/config/ui-labels.ts).
// Ô thiếu / rỗng / sai kiểu thì dùng chữ mặc định, nên site không bao giờ lỗi vì thiếu nhãn. Chỉ chạy phía server (đọc file); component client lấy qua UiLabelsProvider.
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { UI_LABEL_DEFAULTS, UI_LABEL_GROUPS, type UiLabels } from "@/shared/config/ui-labels";

const FILE = path.join(process.cwd(), "content", "settings", "ui-labels.json");
const MAX_LEN = 200;

/** Ghép nhãn từ nội dung JSON thô (tách riêng để test được) */
export function parseUiLabels(raw: unknown): UiLabels {
  const root = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const out: Record<string, string> = { ...UI_LABEL_DEFAULTS };
  for (const group of UI_LABEL_GROUPS) {
    const section = root[group.id];
    if (typeof section !== "object" || section === null) continue;
    for (const [key] of group.items) {
      const v = (section as Record<string, unknown>)[key];
      if (typeof v === "string" && v.trim()) out[key] = v.trim().slice(0, MAX_LEN);
    }
  }
  return out as UiLabels;
}

export const getUiLabels = cache((): UiLabels => {
  try {
    return parseUiLabels(JSON.parse(fs.readFileSync(FILE, "utf8")));
  } catch {
    return { ...UI_LABEL_DEFAULTS };
  }
});
