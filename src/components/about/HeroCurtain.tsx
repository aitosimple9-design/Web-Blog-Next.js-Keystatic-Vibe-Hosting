// Cánh cửa mở đầu trang: hai cánh tối phủ kín Hero lúc vào trang, mang chữ cái đầu của tên ("T·N" | "H·N").
// Hai cánh xoay quanh mép ngoài về phía người xem (CSS `anim-door-*`, MỘT lần, 1,5s) rồi nằm gọn sát hai mép, để lộ Hero bên dưới.
// Chiều sâu: mép trong mỗi cánh có viền `accent-warm`, ánh sáng ấm lộ ra ở khe giữa rồi tan, cả cảnh lùi xa rồi tiến lại (`anim-dolly` ở PersonHero).
// Chỉ transform; bật giảm chuyển động thì cửa mở sẵn ngay. Trang trí thuần (aria-hidden, không nhận chuột), nội dung thật luôn nằm sẵn bên dưới nên SEO không mất.
import type { CSSProperties } from "react";

const start = { "--delay": "250ms" } as CSSProperties;

export function HeroCurtain({ left, right }: { left: string; right: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 [transform-style:preserve-3d]">
      {/* Ánh sáng ấm lộ ra sau khe cửa rồi tan dần (flat accent-warm, chỉ opacity) */}
      <div className="anim-light absolute inset-0 bg-accent-warm" style={start} />
      <div className="absolute inset-y-0 left-0 w-1/2 [transform-style:preserve-3d]">
        <div
          className="anim-door-l absolute inset-0 flex items-center justify-end border-r-4 border-accent-warm bg-inverse pr-[8%] shadow-elevated-lg"
          style={start}
        >
          <span className="type-display-xl text-on-inverse">{left}</span>
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2 [transform-style:preserve-3d]">
        <div
          className="anim-door-r absolute inset-0 flex items-center justify-start border-l-4 border-accent-warm bg-inverse pl-[8%] shadow-elevated-lg"
          style={start}
        >
          <span className="type-display-xl text-on-inverse">{right}</span>
        </div>
      </div>
    </div>
  );
}
