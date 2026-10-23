// Sinh public/images/masks/brush-edge.svg: mép "nét cọ" mượt (một nét quét + vài sợi lông cọ thon dần) dùng làm mask cho đáy dải tối. Chạy: node scripts/gen-brush-mask.mjs
// Phần tô đặc (màu đen) = giữ lại. Đường bao là tổng các sóng sin có tần số NGUYÊN nên hai đầu khớp nhau, lát ngang liền mạch.
// Rộng 2400px (CSS lát lặp mỗi 2400px) nên màn hình rộng không thấy hình lặp.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const W = 2400, H = 64, STEP = 2;
let seed = 11;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// Đường bao mềm: nhiều sóng chậm (cú quét cọ) + vài sóng nhanh biên độ nhỏ (độ nhám của giấy), pha ngẫu nhiên
const waves = [];
for (let k = 2; k <= 40; k++) {
  const amp = k <= 6 ? 3.2 : k <= 16 ? 1.6 : 0.55; // chậm = to, nhanh = nhỏ
  waves.push({ k, amp: amp * (0.5 + rnd()), phase: rnd() * Math.PI * 2 });
}
const envelope = (x) => {
  const t = x / W;
  let y = 30;
  for (const w of waves) y += w.amp * Math.sin(2 * Math.PI * w.k * t + w.phase);
  return y;
};

// Sợi lông cọ: nhô xuống ở mép, nhọn dần về đuôi (mũi nhọn lệch một bên như vệt kéo của cọ)
const tails = Array.from({ length: 46 }, () => ({
  at: rnd() * W,
  len: 4 + rnd() * rnd() * 14,
  w: 2 + rnd() * 6,
  lean: (rnd() - 0.5) * 0.9,
}));
const tailAt = (x) => {
  let best = 0;
  for (const s of tails) {
    // đo khoảng cách có vòng (đầu và cuối tấm lát nối liền nhau)
    let dx = x - s.at;
    if (dx > W / 2) dx -= W;
    if (dx < -W / 2) dx += W;
    const u = dx / s.w + s.lean * (dx > 0 ? 0.4 : -0.4);
    const a = Math.abs(u);
    if (a < 1) best = Math.max(best, s.len * Math.pow(1 - a, 1.6));
  }
  return best;
};

const pts = [];
for (let x = 0; x <= W; x += STEP) {
  let y = x === W ? pts[0][1] : envelope(x) + tailAt(x);
  y = Math.max(8, Math.min(H - 1.5, y));
  pts.push([x, y]);
}
pts[pts.length - 1][1] = pts[0][1]; // khớp hai đầu

const d = `M0 0H${W}V${pts[pts.length - 1][1].toFixed(1)}` + [...pts].reverse().map(([x, y]) => `L${x} ${y.toFixed(1)}`).join("") + "Z";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>\n`;
const out = resolve(root, "public/images/masks");
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, "brush-edge.svg"), svg);
console.log("Đã sinh brush-edge.svg", svg.length, "byte");

// Bản cho MÉP TRÊN (brush-both): lật dọc (phần đặc nằm dưới, mép lởm chởm ở trên) và dịch ngang 700px để khác hình mép dưới
const flipped = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none"><g transform="matrix(1 0 0 -1 0 ${H})"><path d="${d}" fill="#000" transform="translate(700 0)"/><path d="${d}" fill="#000" transform="translate(-1700 0)"/></g></svg>
`;
writeFileSync(resolve(out, "brush-edge-top.svg"), flipped);
console.log("Đã sinh brush-edge-top.svg", flipped.length, "byte");
