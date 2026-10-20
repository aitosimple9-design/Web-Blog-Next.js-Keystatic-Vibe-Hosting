import { expect, test } from "@playwright/test";

// E2E đường GITHUB của trang quản trị (web thật): xác minh quyền, tạo chuyển hướng ghi vào nhánh, xem trước và chấm SEO từ NHÁNH.
// Chạy với máy chủ GitHub giả (tests/e2e/admin-github/mock-github.mjs, cổng 3300) nên không đụng repo thật. Xem playwright.config.ts.
const MOCK = "http://localhost:3300";
const ADMIN = { cookie: "keystatic-gh-access-token=token-hop-le" };
const READER = { cookie: "keystatic-gh-access-token=token-chi-doc" };
const BAD = { cookie: "keystatic-gh-access-token=token-gia" };
const BODY = { kind: "Bài viết", oldSlug: "bai-cu", newSlug: "bai-moi", branch: "nhanh-thu" };

test.beforeEach(async ({ request }) => {
  await request.post(`${MOCK}/__reset`);
});

test.describe("Cổng quản trị viên (chế độ GitHub)", () => {
  test("không cookie / token giả / token chỉ đọc đều nhận 404 ở mọi API và trang xem trước", async ({ request }) => {
    for (const headers of [{}, BAD, READER]) {
      for (const url of ["/api/chuyen-huong?existing=1", "/api/diem-seo", "/api/ten-sach", "/xem-truoc/bai-viet/bai-thu-nhanh?branch=nhanh-thu"]) {
        const res = await request.get(url, { headers });
        expect(res.status(), `${url} với ${JSON.stringify(headers)}`).toBe(404);
      }
      const post = await request.post("/api/chuyen-huong", { headers, data: BODY });
      expect(post.status()).toBe(404);
    }
    expect((await (await request.get(`${MOCK}/__calls`)).json()).length, "không được ghi gì lên GitHub").toBe(0);
  });

  test("quản trị viên (token có quyền push) vào được", async ({ request }) => {
    expect((await request.get("/api/diem-seo", { headers: ADMIN })).status()).toBe(200);
    expect((await request.get("/api/chuyen-huong?existing=1", { headers: ADMIN })).status()).toBe(200);
  });
});

test.describe("Tạo chuyển hướng ghi vào NHÁNH", () => {
  test("ghi một commit vào nhánh đang soạn, đúng đường dẫn và nội dung", async ({ request }) => {
    const res = await request.post("/api/chuyen-huong", { headers: ADMIN, data: BODY });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, from: "/bai-viet/bai-cu", to: "/bai-viet/bai-moi", branch: "nhanh-thu" });
    const calls = await (await request.get(`${MOCK}/__calls`)).json();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ method: "PUT", branch: "nhanh-thu", file: expect.stringMatching(/^content\/redirects\/.+\.json$/) });
    expect(calls[0].message).toContain("/bai-viet/bai-cu → /bai-viet/bai-moi");
    expect(JSON.parse(calls[0].content)).toMatchObject({ kind: "Bài viết", from: "/bai-viet/bai-cu", to: "/bai-viet/bai-moi", permanent: true });
  });

  test("tạo chuyển hướng thứ hai đi nối tiếp thì trỏ thẳng về đích cuối (gộp chuỗi)", async ({ request }) => {
    await request.post("/api/chuyen-huong", { headers: ADMIN, data: BODY });
    const res = await request.post("/api/chuyen-huong", { headers: ADMIN, data: { ...BODY, oldSlug: "bai-moi", newSlug: "bai-moi-hon" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.flattened).toEqual(["/bai-viet/bai-cu → /bai-viet/bai-moi-hon"]);
    const calls = await (await request.get(`${MOCK}/__calls`)).json();
    expect(calls.map((c: { message: string }) => c.message).join("\n")).toContain("trỏ /bai-viet/bai-cu thẳng về /bai-viet/bai-moi-hon");
  });

  test("nhánh chính bị bảo vệ: GitHub từ chối, giao diện được hướng dẫn tạo nhánh mới", async ({ request }) => {
    const res = await request.post("/api/chuyen-huong", { headers: ADMIN, data: { ...BODY, branch: "main" } });
    expect(res.status()).toBe(502);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toContain("New branch");
  });

  test("thiếu hoặc sai tên nhánh thì 400, không gọi GitHub", async ({ request }) => {
    for (const branch of [undefined, "../x", "a b", ""]) {
      const res = await request.post("/api/chuyen-huong", { headers: ADMIN, data: { ...BODY, branch } });
      expect(res.status(), String(branch)).toBe(400);
    }
    expect(await (await request.get(`${MOCK}/__calls`)).json()).toHaveLength(0);
  });

  test("dữ liệu sai (slug không hợp lệ) thì 400 và không ghi", async ({ request }) => {
    const res = await request.post("/api/chuyen-huong", { headers: ADMIN, data: { ...BODY, newSlug: "Sai Slug" } });
    expect(res.status()).toBe(400);
    expect(await (await request.get(`${MOCK}/__calls`)).json()).toHaveLength(0);
  });

  test("trạng thái slug nhớ chuyển hướng vừa tạo ở nhánh (bản build chưa có)", async ({ request }) => {
    await request.post("/api/chuyen-huong", { headers: ADMIN, data: BODY });
    const res = await request.get(`/api/chuyen-huong?kind=${encodeURIComponent("Bài viết")}&slug=bai-cu&branch=nhanh-thu`, { headers: ADMIN });
    expect(await res.json()).toMatchObject({ hasRedirect: true, needsRedirect: false });
  });

  test("token không bao giờ xuất hiện trong phản hồi", async ({ request }) => {
    const responses = [
      await request.post("/api/chuyen-huong", { headers: ADMIN, data: BODY }),
      await request.post("/api/chuyen-huong", { headers: ADMIN, data: { ...BODY, branch: "main" } }),
      await request.get("/api/chuyen-huong?existing=1&branch=nhanh-thu", { headers: ADMIN }),
      await request.get("/xem-truoc/bai-viet/bai-thu-nhanh?branch=nhanh-thu", { headers: ADMIN }),
    ];
    for (const r of responses) expect(await r.text()).not.toContain("token-hop-le");
  });
});

test.describe("Xem trước bài từ NHÁNH", () => {
  test("dựng bài chỉ có ở nhánh, kể cả chủ đề mới chưa có trong bản build", async ({ request }) => {
    const res = await request.get("/xem-truoc/bai-viet/bai-thu-nhanh?branch=nhanh-thu", { headers: ADMIN });
    expect(res.status()).toBe(200);
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
    const html = await res.text();
    expect(html).toContain("Bài thử ở nhánh");
    expect(html).toContain("Chủ đề mới thử");
    expect(html).toContain("nhanh-thu");
    expect(html).not.toContain("chưa có trong content/topics");
  });

  test("chủ đề mới chỉ sống trong yêu cầu xem trước, không rò ra trang công khai", async ({ request }) => {
    await request.get("/xem-truoc/bai-viet/bai-thu-nhanh?branch=nhanh-thu", { headers: ADMIN });
    const home = await request.get("/blog");
    expect(await home.text()).not.toContain("Chủ đề mới thử");
    expect((await request.get("/blog/chu-de-moi-thu")).status()).toBe(404);
  });

  test("bài chưa có ở nhánh: báo rõ chứ không vỡ", async ({ request }) => {
    const res = await request.get("/xem-truoc/bai-viet/khong-co-bai?branch=nhanh-thu", { headers: ADMIN });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Chưa có bài");
  });

  test("tên nhánh lạ bị chặn (404)", async ({ request }) => {
    expect((await request.get("/xem-truoc/bai-viet/bai-thu-nhanh?branch=../x", { headers: ADMIN })).status()).toBe(404);
  });
});

test.describe("Chấm SEO bản đã lưu ở NHÁNH", () => {
  test("?slug=&branch= đọc bài từ nhánh (bản build không có bài này)", async ({ request }) => {
    const inBranch = await request.get("/api/diem-seo?slug=bai-thu-nhanh&branch=nhanh-thu", { headers: ADMIN });
    expect(inBranch.status()).toBe(200);
    expect(await inBranch.json()).toMatchObject({ score: expect.any(Number) });
    const inBuild = await request.get("/api/diem-seo?slug=bai-thu-nhanh", { headers: ADMIN });
    expect(inBuild.status()).toBe(404);
  });
});
