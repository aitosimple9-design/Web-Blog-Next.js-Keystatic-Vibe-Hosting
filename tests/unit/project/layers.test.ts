import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Luật ranh giới của src/ (CLAUDE.md mục 3):
//   frontend/  giao diện công khai          → không được import cms/
//   cms/       trang quản trị Keystatic      → được dùng shared/ (và frontend/ khi bất khả kháng)
//   shared/    dùng chung (đọc nội dung...)  → KHÔNG import frontend/ hay cms/
//   app/       chỉ route, mỏng                → import được cả ba
// Nhờ vậy nhìn tên thư mục là biết file thuộc phần nào, và giao diện công khai không kéo mã quản trị vào gói của khách.
const SRC = path.join(process.cwd(), "src");
const ZONES = ["app", "frontend", "cms", "shared"];

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const zoneOf = (abs: string) => path.relative(SRC, abs).split(path.sep)[0];
const STRING = /(["'])((?:@\/|\.{1,2}\/)[^"'\n]*)\1/g;

function targetsOf(file: string): { spec: string; zone: string }[] {
  const text = fs.readFileSync(file, "utf8");
  const out: { spec: string; zone: string }[] = [];
  for (const m of text.matchAll(STRING)) {
    const spec = m[2];
    const abs = spec.startsWith("@/") ? path.join(SRC, spec.slice(2)) : path.resolve(path.dirname(file), spec);
    if (!abs.startsWith(SRC)) continue;
    out.push({ spec, zone: zoneOf(abs) });
  }
  return out;
}

describe("ranh giới src/ (frontend / cms / shared)", () => {
  const files = walk(SRC);

  it("src/ chỉ có bốn thư mục: app, frontend, cms, shared", () => {
    const top = fs.readdirSync(SRC, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    expect(top).toEqual([...ZONES].sort());
    expect(fs.readdirSync(SRC, { withFileTypes: true }).filter((e) => e.isFile())).toEqual([]);
  });

  it("frontend/ không import cms/", () => {
    const bad = files.filter((f) => zoneOf(f) === "frontend").flatMap((f) => targetsOf(f).filter((t) => t.zone === "cms").map((t) => `${path.relative(SRC, f)} → ${t.spec}`));
    expect(bad).toEqual([]);
  });

  it("shared/ không import frontend/ hay cms/", () => {
    const bad = files.filter((f) => zoneOf(f) === "shared").flatMap((f) => targetsOf(f).filter((t) => t.zone === "frontend" || t.zone === "cms").map((t) => `${path.relative(SRC, f)} → ${t.spec}`));
    expect(bad).toEqual([]);
  });

  it("cms/ không import frontend/ (giữ trang quản trị tách khỏi giao diện công khai)", () => {
    const bad = files.filter((f) => zoneOf(f) === "cms").flatMap((f) => targetsOf(f).filter((t) => t.zone === "frontend").map((t) => `${path.relative(SRC, f)} → ${t.spec}`));
    expect(bad).toEqual([]);
  });
});
