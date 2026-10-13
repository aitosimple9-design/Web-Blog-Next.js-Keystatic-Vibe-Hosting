// Biến CSS cho lớp .brush-bottom (mask nét cọ ở đáy ảnh hero). Đặt nội tuyến để đường dẫn tới public/ không bị bundler xử lý.
// Tệp mask sinh bằng: node scripts/gen-brush-mask.mjs
import type { CSSProperties } from "react";

export const brushStyle = {
  "--brush-url": 'url("/images/masks/brush-edge.svg")',
} as CSSProperties;
