"use client";

// Chuyển "Nhãn giao diện" (Keystatic → Cài đặt → Nhãn giao diện) xuống các component CLIENT (thanh đầu trang, ô tìm kiếm, nút đổi theme, thanh trượt...).
// Server component gọi thẳng getUiLabels() (src/shared/content/ui-labels.ts). Không có Provider (test, trang riêng lẻ) thì dùng chữ mặc định.
import { createContext, useContext, type ReactNode } from "react";
import { UI_LABEL_DEFAULTS, type UiLabels } from "@/shared/config/ui-labels";

const Ctx = createContext<UiLabels>(UI_LABEL_DEFAULTS);

export function UiLabelsProvider({ labels, children }: { labels: UiLabels; children: ReactNode }) {
  return <Ctx.Provider value={labels}>{children}</Ctx.Provider>;
}

export const useUiLabels = () => useContext(Ctx);
