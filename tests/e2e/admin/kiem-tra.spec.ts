import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import path from "node:path";

// /api/kiem-tra ở chế độ local (máy soạn bài): chạy cùng bộ luật với `npm run check-content`, nên số lỗi phải khớp.
test("chế độ local: kết quả khớp với npm run check-content", async ({ request }) => {
  const res = await request.get("/api/kiem-tra");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toMatchObject({ ok: true, mode: "local" });
  const cli = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "check-content.mjs"), "--base", "main"], { encoding: "utf8" });
  const errors = /\nLỖI \((\d+)\)/.exec(cli.stdout)?.[1] ?? "0";
  expect(body.result.errors.length).toBe(Number(errors));
  expect(body.result.counts.posts).toBeGreaterThan(0);
});
