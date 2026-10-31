import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Chặn lệch ở bước "Xác định phần cần chạy" của .github/workflows/ci.yml (job `changes`): file đổi nào bật nhóm CI nào.
// Lấy ĐÚNG đoạn script trong ci.yml rồi chạy bằng bash với danh sách file giả, nên sửa luật ở ci.yml là test này thấy ngay.
// Nhóm: check = lint / typecheck / test / build, pub = E2E web công khai, adm = E2E trang quản trị.
const hasBash = spawnSync("bash", ["--version"]).status === 0;
const yml = fs.readFileSync(path.join(__dirname, "../../../.github/workflows/ci.yml"), "utf8");
const block = /        run: \|\r?\n(          check=false[\s\S]*?GITHUB_OUTPUT"\r?\n)/.exec(yml);
const script = block?.[1]
  .split(/\r?\n/)
  .map((l) => l.slice(10))
  .join("\n")
  .replace('done < <(git diff --name-only "$BASE_SHA" "$HEAD_SHA")', 'done < "$FILES"')
  .replace('>> "$GITHUB_OUTPUT"', "");

function scope(files: string[], event = "pull_request") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ci-scope-"));
  try {
    fs.writeFileSync(path.join(dir, "scope.sh"), script!);
    fs.writeFileSync(path.join(dir, "files.txt"), files.join("\n") + "\n");
    const out = execFileSync("bash", [path.join(dir, "scope.sh")], { env: { ...process.env, FILES: path.join(dir, "files.txt"), EVENT: event }, encoding: "utf8" });
    const get = (k: string) => new RegExp(`^${k}=(true|false)$`, "m").exec(out)?.[1] === "true";
    return { check: get("check"), pub: get("public"), adm: get("admin") };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const NONE = { check: false, pub: false, adm: false };
const CHECK = { check: true, pub: false, adm: false };
const PUB = { check: true, pub: true, adm: false };
const ADM = { check: true, pub: false, adm: true };
const ALL = { check: true, pub: true, adm: true };

describe.skipIf(!hasBash)("ci.yml: phân loại file đổi", () => {
  it("lấy được script phân loại từ ci.yml", () => {
    expect(script).toBeTruthy();
  });

  it.each([
    ["docs/PLAN.md", NONE],
    ["CLAUDE.md", NONE],
    [".claude/rules/keystatic-admin.md", NONE],
    ["content/posts/bai-moi.md", CHECK],
    ["content/books/sach.json", CHECK],
    ["public/images/covers/a/a.svg", CHECK],
    ["tests/unit/shared/a.test.ts", CHECK],
    ["scripts/check-content.mjs", CHECK],
    ["src/frontend/components/ui/Button.tsx", PUB],
    ["src/app/page.tsx", PUB],
    ["src/app/globals.css", PUB],
    ["tests/e2e/public/smoke.spec.ts", PUB],
    // API tìm kiếm phục vụ ô tìm kiếm của web công khai, KHÔNG phải của trang quản trị
    ["src/app/api/tim-kiem/route.ts", PUB],
    ["src/cms/ui/EntryPicker.tsx", ADM],
    ["keystatic.config.ts", ADM],
    ["src/app/api/danh-muc/route.ts", ADM],
    ["src/app/api/keystatic/[...params]/route.ts", ADM],
    ["src/app/keystatic/layout.tsx", ADM],
    // trang xem trước bài nháp: test của nó nằm ở nhóm quản trị
    ["src/app/xem-truoc/bai-viet/[slug]/page.tsx", ADM],
    ["tests/e2e/admin/admin.spec.ts", ADM],
    // cấu hình chung của cả web và trang quản trị
    ["next.config.ts", ALL],
    ["src/shared/content/posts.ts", ALL],
    ["package.json", ALL],
    ["tsconfig.json", ALL],
    ["playwright.config.ts", ALL],
    [".github/workflows/ci.yml", ALL],
  ] as const)("%s", (file, want) => {
    expect(scope([file])).toEqual(want);
  });

  it("nhiều file: gộp các nhóm (bài mẫu + nút quản trị bật cả check và quản trị)", () => {
    expect(scope(["docs/a.md", "src/cms/lib/x.ts", "content/pages/trang-chu.json"])).toEqual(ADM);
    expect(scope(["src/cms/lib/x.ts", "src/frontend/components/a.tsx"])).toEqual(ALL);
  });

  it("push lên main luôn chạy hết", () => {
    expect(scope(["docs/a.md"], "push")).toEqual(ALL);
  });
});
