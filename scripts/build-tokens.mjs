// Sinh src/frontend/styles/tokens.css từ docs/design-system/tokens.json.
// Chạy: npm run tokens   (KHÔNG sửa tay tokens.css; sửa tokens.json rồi chạy lại)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const t = JSON.parse(readFileSync(resolve(root, "docs/design-system/tokens.json"), "utf8"));

const out = [];
const push = (s = "") => out.push(s);

const colors = t.color.tokens;
const shadows = t.shadow.tokens;
const gradients = t.gradient?.tokens ?? [];

const themeVars = (mode) => [
  ...colors.map((c) => `  --${c.name}: ${c.value[mode]};`),
  ...shadows.map((s) => `  --${s.name}: ${s.value[mode]};`),
  ...gradients.map((g) => `  --${g.name}: ${g.value[mode]};`),
];

push("/* TỰ ĐỘNG SINH từ docs/design-system/tokens.json bằng scripts/build-tokens.mjs. KHÔNG sửa tay. */");
push();
push(":root,\n:root[data-theme=\"light\"] {");
push("  color-scheme: light;");
themeVars("light").forEach((l) => push(l));
push("}");
push();
push(":root[data-theme=\"dark\"] {");
push("  color-scheme: dark;");
themeVars("dark").forEach((l) => push(l));
push("}");
push();
push("/* Khi chưa có data-theme (chưa chạy script / tắt JS): theo hệ điều hành */");
push("@media (prefers-color-scheme: dark) {");
push("  :root:not([data-theme]) {");
push("    color-scheme: dark;");
themeVars("dark").forEach((l) => push("  " + l));
push("  }");
push("}");
push();

// ---- giá trị không đổi theo theme: khai báo trong :root để dùng var(--space-5)...
push(":root {");
for (const s of t.spacing.tokens) push(`  --${s.name}: ${s.value};`);
for (const r of t.radius.tokens) push(`  --${r.name}: ${r.value};`);
for (const l of t.layout.tokens) push(`  --${l.name}: ${l.value};`);
for (const b of t.breakpoint.tokens) push(`  --${b.name}: ${b.value};`);
push("}");
push();

// ---- Tailwind v4 theme: chỉ cho phép màu / bo góc / chữ của Design System
push("@theme inline {");
push("  --color-*: initial;");
for (const c of colors) push(`  --color-${c.name}: var(--${c.name});`);
push("  --shadow-*: initial;");
for (const s of shadows) push(`  --shadow-${s.name}: var(--${s.name});`);
push("}");
push();
push("@theme {");
push("  --radius-*: initial;");
for (const r of t.radius.tokens) push(`  --radius-${r.name.replace(/^radius-/, "")}: ${r.value};`);
push("  --spacing-s0: 0px;");
for (const s of t.spacing.tokens) push(`  --spacing-${s.name.replace(/^space-/, "s")}: ${s.value};`);
push("  --font-*: initial;");
push("  --font-serif: var(--font-serif-stack);");
push("  --font-sans: var(--font-sans-stack);");
push("  --breakpoint-*: initial;");
for (const b of [...t.breakpoint.tokens].sort((a, z) => parseInt(a.value) - parseInt(z.value))) {
  push(`  --breakpoint-${b.name.replace(/^bp-/, "")}: ${b.value};`);
}
push("  --container-content: var(--content-max);");
push("}");
push();
push(":root {");
push(`  --font-serif-stack: var(--next-serif), ${t.type.families.serif};`);
push(`  --font-sans-stack: var(--next-sans), ${t.type.families.sans};`);
push("}");
push();

// ---- kiểu chữ: class type-<tên>
const cssName = (n) => n.replace(/[^a-z0-9-]/gi, "");
// Cỡ chữ co giãn mượt giữa các mốc (DS: display-xl hạ về cỡ display-lg ở desktop, 36px ở tablet)
const fluid = {
  "display-xl": "clamp(32px, 5.68vw - 7.6px, 56px)",
  "display-lg": "clamp(30px, 3.4vw + 8px, 44px)",
  "display-md": "clamp(26px, 1.6vw + 16px, 32px)",
  "pull-quote": "clamp(22px, 1.2vw + 14px, 28px)",
};
for (const g of t.type.groups) {
  for (const s of g.styles) {
    const n = cssName(s.name);
    push(`@utility type-${n} {`);
    push(`  font-family: var(--font-${g.family}-stack);`);
    push(`  font-size: ${fluid[s.name] ?? s.fontSize};`);
    push(`  line-height: ${s.lineHeight};`);
    push(`  font-weight: ${s.fontWeight};`);
    if (s.fontStyle) push(`  font-style: ${s.fontStyle};`);
    if (parseFloat(s.letterSpacing) < 0) {
      // DS: tracking âm chỉ cho display-xl / display-lg và về 0 ở khung hẹp
      push(`  letter-spacing: 0;`);
      push(`  @media (min-width: 768px) { letter-spacing: ${s.letterSpacing}; }`);
    } else if (s.letterSpacing !== "0") {
      push(`  letter-spacing: ${s.letterSpacing};`);
    }
    push("}");
  }
}
push();

writeFileSync(resolve(root, "src/frontend/styles/tokens.css"), out.join("\n") + "\n");
console.log("Đã sinh src/frontend/styles/tokens.css (" + out.length + " dòng)");
