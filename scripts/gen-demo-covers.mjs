// Sinh 7 bìa sách DEMO (SVG, 400x600) vào public/images/covers/. Chạy: node scripts/gen-demo-covers.mjs
// Màu lấy từ bảng Design System (ink, paper, accent-soft, paper-deep, accent-warm, sand). Thay bằng bìa thật khi có.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "public/images/covers");
mkdirSync(out, { recursive: true });

const C = { ink: "#0a0a0a", paper: "#fbfaf6", cream: "#ebe7db", deep: "#e4dccb", warm: "#4a3b2c", sand: "#dcc79e" };
const FONT = "'Source Serif 4', Georgia, 'Times New Roman', serif";

const books = [
  { n: 1, author: "Tác giả mẫu 3", bg: C.deep, ink: C.ink, art: `<circle cx="200" cy="230" r="150" fill="none" stroke="${C.ink}" stroke-width="3"/><circle cx="200" cy="230" r="105" fill="${C.warm}"/><circle cx="200" cy="230" r="52" fill="${C.sand}"/>` },
  { n: 2, author: "Tác giả mẫu 4", bg: C.ink, ink: C.paper, art: [0,1,2,3,4,5].map((i) => `<rect x="${70 + i * 44}" y="${90 + (i % 3) * 20}" width="28" height="${230 - (i % 3) * 20}" fill="${i % 2 ? C.sand : C.cream}"/>`).join("") },
  { n: 3, author: "Tác giả mẫu 1", bg: C.cream, ink: C.ink, art: `<path d="M90 340V210a110 110 0 0 1 220 0v130z" fill="${C.warm}"/><path d="M135 340V215a65 65 0 0 1 130 0v125z" fill="${C.cream}"/><rect x="70" y="340" width="260" height="6" fill="${C.ink}"/>` },
  { n: 4, author: "Tác giả mẫu 2", bg: C.warm, ink: C.paper, art: [0,1,2].map((r) => [0,1,2].map((c) => `<rect x="${95 + c * 70}" y="${105 + r * 70}" width="60" height="60" fill="${(r + c) % 2 ? C.sand : C.paper}" opacity="${(r + c) % 2 ? 1 : 0.9}"/>`).join("")).join("") },
  { n: 5, author: "Tác giả mẫu 3", bg: C.sand, ink: C.ink, art: `<circle cx="200" cy="215" r="78" fill="${C.warm}"/><rect x="60" y="270" width="280" height="4" fill="${C.ink}"/><rect x="100" y="292" width="200" height="4" fill="${C.ink}" opacity="0.7"/><rect x="140" y="314" width="120" height="4" fill="${C.ink}" opacity="0.45"/>` },
  { n: 6, author: "Tác giả mẫu 4", bg: C.paper, ink: C.ink, art: `<path d="M60 80h280v260z" fill="${C.ink}"/><path d="M60 80v260h280z" fill="${C.sand}"/><circle cx="130" cy="150" r="26" fill="${C.paper}"/>` },
  { n: 7, author: "Tác giả mẫu 1", bg: C.deep, ink: C.ink, art: Array.from({ length: 7 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<circle cx="${95 + c * 42}" cy="${100 + r * 36}" r="${6 + ((r + c) % 3) * 3}" fill="${(r + c) % 2 ? C.warm : C.ink}"/>`).join("")).join("") },
];

for (const b of books) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <rect width="400" height="600" fill="${b.bg}"/>
  <rect x="14" y="0" width="3" height="600" fill="${b.ink}" opacity="0.18"/>
  ${b.art}
  <text x="200" y="440" text-anchor="middle" font-family="${FONT}" font-size="38" font-weight="600" fill="${b.ink}">SÁCH MẪU ${b.n}</text>
  <rect x="150" y="466" width="100" height="2" fill="${b.ink}" opacity="0.5"/>
  <text x="200" y="500" text-anchor="middle" font-family="${FONT}" font-size="20" fill="${b.ink}" opacity="0.85">${b.author}</text>
  <text x="200" y="560" text-anchor="middle" font-family="${FONT}" font-size="12" letter-spacing="3" fill="${b.ink}" opacity="0.55">BẢN DEMO</text>
</svg>
`;
  mkdirSync(resolve(out, `sach-mau-${b.n}`), { recursive: true });
  writeFileSync(resolve(out, `sach-mau-${b.n}`, `sach-mau-${b.n}.svg`), svg);
}
console.log("Đã sinh", books.length, "bìa demo vào public/images/covers/");
