// Sinh public/images/masks/brush-edge.svg: mép "nét cọ" (bristles) dùng làm mask cho đáy ảnh hero. Chạy: node scripts/gen-brush-mask.mjs
// Phần tô đặc (màu đen) = giữ lại; mép dưới lởm chởm như vệt cọ khô. Hai đầu cùng độ cao để lát ngang liền mạch.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200, H = 64;
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const pts = [];
const step = 4;
// vài vệt cọ dài rải rác (vị trí, độ dài thêm, độ rộng)
const streaks = Array.from({ length: 22 }, () => ({ at: rnd() * W, len: 7 + rnd() * 12, w: 5 + rnd() * 14 }));
for (let x = 0; x <= W; x += step) {
  const t = x / W;
  // đường bao mềm, nhấp nhô chậm như một nét quét cọ + răng cọ mịn
  const env = 28 + 7 * Math.sin(t * Math.PI * 4) + 4 * Math.sin(t * Math.PI * 11 + 1);
  const fine = rnd() * 3.5;
  let streak = 0;
  for (const k of streaks) {
    const dx = Math.abs(x - k.at);
    if (dx < k.w) streak = Math.max(streak, k.len * (1 - dx / k.w));
  }
  let y = Math.min(H - 2, env + fine + streak);
  if (x === 0 || x === W) y = 32; // khớp hai đầu để lát liền
  pts.push([x, y]);
}
const d = `M0 0H${W}V32` + [...pts].reverse().map(([x, y]) => `L${x} ${y.toFixed(1)}`).join("") + "Z";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>\n`;
const out = resolve(root, "public/images/masks");
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, "brush-edge.svg"), svg);
console.log("Đã sinh brush-edge.svg", svg.length, "byte");
