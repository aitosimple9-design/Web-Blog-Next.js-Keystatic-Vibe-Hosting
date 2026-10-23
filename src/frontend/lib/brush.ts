// Biến CSS cho lớp .brush-bottom (mask nét cọ ở đáy ảnh hero). Đặt nội tuyến để đường dẫn tới public/ không bị bundler xử lý.
// Tệp mask sinh bằng: node scripts/gen-brush-mask.mjs
import type { CSSProperties } from "react";

export const brushStyle = {
  "--brush-url": 'url("/images/masks/brush-edge.svg")',
  "--brush-top-url": 'url("/images/masks/brush-edge-top.svg")',
} as CSSProperties;

// Nền của khối trang theo vị trí (src/config/blocks.ts → layoutBlocks): paper / paper-sunk xen kẽ.
// Khối nền sunk đứng ngay sau dải tối đáy nét cọ phải kéo lên đè dưới nét cọ (nét cọ để lộ nền phía sau) nên thêm lề âm + đệm bù.
export type SectionTone = "paper" | "sunk";
export const PULL_UP = "relative -mt-[clamp(40px,5.5vw,64px)] pt-[calc(clamp(40px,5.5vw,64px)+var(--space-8))]";
export const toneBg = (tone: SectionTone) => (tone === "sunk" ? "bg-paper-sunk" : "bg-paper");
/** Đệm trên của khối: bình thường pt-s8 (tablet pt-s9); kéo lên dưới nét cọ thì lề âm + đệm bù */
export const toneTop = (pullUp: boolean) => (pullUp ? PULL_UP : "pt-s8 tablet:pt-s9");
