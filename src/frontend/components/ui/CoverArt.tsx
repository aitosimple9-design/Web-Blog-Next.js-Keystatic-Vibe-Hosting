// "Ảnh bìa nghệ thuật" sinh tự động từ một chuỗi (slug bài / tên sách): hình học đơn sắc, mỗi bài một ảnh riêng.
// Chỉ dùng màu của Design System (biến CSS nên tự đổi theo theme Giấy / Đêm), KHÔNG gradient, KHÔNG đổ bóng.
// Dùng làm ảnh giữ chỗ cho tới khi có ảnh bìa thật. Xác định (cùng seed ⇒ cùng hình) nên SSR và client khớp nhau.

type Orientation = "wide" | "tall"; // wide = 3:2 (ảnh bài), tall = 2:3 (bìa sách)

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: string) {
  let a = hash(seed) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const v = (n: string) => `var(--${n})`;
const palettes = [
  { bg: v("paper-deep"), a: v("ink"), b: v("paper-raised"), c: v("accent-soft") },
  { bg: v("ink"), a: v("paper-deep"), b: v("accent-soft"), c: v("ink-soft") },
  { bg: v("accent-soft"), a: v("ink"), b: v("paper-deep"), c: v("paper-raised") },
  { bg: v("paper-sunk"), a: v("ink-soft"), b: v("paper-deep"), c: v("rule-strong") },
];

export function CoverArt({
  seed,
  orientation = "wide",
  className = "",
}: {
  seed: string;
  orientation?: Orientation;
  className?: string;
}) {
  const r = rng(seed);
  const W = orientation === "wide" ? 300 : 200;
  const H = orientation === "wide" ? 200 : 300;
  const pal = palettes[Math.floor(r() * palettes.length)];
  const kind = Math.floor(r() * 5);
  const shapes: React.ReactNode[] = [];

  if (kind === 0) {
    // Vòm và mặt trời
    shapes.push(<circle key="s" cx={W * (0.3 + r() * 0.4)} cy={H * 0.42} r={H * (0.2 + r() * 0.08)} fill={pal.a} />);
    for (let i = 0; i < 4; i++) {
      const w = W * (0.9 - i * 0.18);
      shapes.push(
        <path
          key={i}
          d={`M${(W - w) / 2} ${H} v${-H * 0.16 - i * 6} a${w / 2} ${w / 2} 0 0 1 ${w} 0 v${H * 0.16 + i * 6} z`}
          fill={[pal.b, pal.c, pal.b, pal.c][i]}
          opacity={0.95 - i * 0.12}
        />,
      );
    }
  } else if (kind === 1) {
    // Ba vòng tròn chồng lên nhau
    const cx = W / 2;
    const cy = H / 2;
    const rad = Math.min(W, H) * 0.3;
    shapes.push(<circle key="1" cx={cx - rad * 0.55} cy={cy} r={rad} fill={pal.a} />);
    shapes.push(<circle key="2" cx={cx + rad * 0.55} cy={cy - rad * 0.2} r={rad} fill={pal.b} opacity={0.92} />);
    shapes.push(<circle key="3" cx={cx} cy={cy + rad * 0.5} r={rad * 0.55} fill={pal.c} />);
    shapes.push(<circle key="4" cx={W * (0.15 + r() * 0.7)} cy={H * 0.14} r={5} fill={pal.a} />);
  } else if (kind === 2) {
    // Gáy sách trên giá
    const base = H * 0.82;
    let x = W * 0.08;
    let i = 0;
    while (x < W * 0.92) {
      const w = (orientation === "wide" ? 20 : 15) + r() * 18;
      const h = H * (0.32 + r() * 0.4);
      shapes.push(<rect key={i} x={x} y={base - h} width={w} height={h} rx={1.5} fill={[pal.a, pal.b, pal.c][i % 3]} />);
      if (i % 2 === 0) shapes.push(<rect key={`l${i}`} x={x} y={base - h * 0.55} width={w} height={2} fill={pal.bg} opacity={0.5} />);
      x += w + 3 + r() * 3;
      i++;
    }
    shapes.push(<rect key="shelf" x={W * 0.05} y={base} width={W * 0.9} height={3} fill={pal.a} />);
  } else if (kind === 3) {
    // Lưới cung phần tư
    const cols = orientation === "wide" ? 3 : 2;
    const rows = orientation === "wide" ? 2 : 3;
    const cw = W / cols;
    const ch = H / rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const rot = Math.floor(r() * 4) * 90;
        const col = [pal.a, pal.b, pal.c][Math.floor(r() * 3)];
        const s = Math.min(cw, ch);
        shapes.push(
          <path
            key={`${x}${y}`}
            transform={`translate(${x * cw + cw / 2} ${y * ch + ch / 2}) rotate(${rot})`}
            d={`M${-s / 2} ${-s / 2} h${s} a${s} ${s} 0 0 1 ${-s} ${s} z`}
            fill={col}
          />,
        );
      }
    }
  } else {
    // Vòng đồng tâm lệch tâm
    const cx = W * (0.35 + r() * 0.3);
    const cy = H * (0.4 + r() * 0.2);
    for (let i = 5; i >= 1; i--) {
      shapes.push(<circle key={i} cx={cx} cy={cy} r={Math.min(W, H) * 0.11 * i} fill={[pal.a, pal.b, pal.c][i % 3]} />);
    }
    shapes.push(<rect key="bar" x={0} y={H * 0.86} width={W} height={H * 0.04} fill={pal.a} />);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
      className={`absolute inset-0 size-full ${className}`}
    >
      <rect width={W} height={H} fill={pal.bg} />
      {shapes}
    </svg>
  );
}
