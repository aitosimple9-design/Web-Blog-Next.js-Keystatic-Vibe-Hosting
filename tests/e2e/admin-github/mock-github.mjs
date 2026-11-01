// MÁY CHỦ GITHUB GIẢ cho E2E chế độ GitHub của trang quản trị (playwright.config.ts, project "admin-github").
// Next dev chạy với GITHUB_API_URL trỏ vào đây, nên đường ghi / đọc GitHub (xác minh quyền, tạo chuyển hướng, xem trước từ nhánh) được thử
// đầy đủ mà không cần đăng nhập GitHub thật và không đụng repo thật.
//   Token:  "token-hop-le" = có quyền push · "token-chi-doc" = chỉ đọc · token khác = 401
//   Nhánh:  "main" bị bảo vệ (ghi → 403) · "nhanh-thu" ghi được, có bài "bai-thu-nhanh" thuộc chủ đề mới "chu-de-moi-thu" chưa có trong bản build
//   Phụ trợ: GET /health · GET /__calls (các lần ghi đã nhận) · POST /__reset
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const REPO = "aitosimple9-design/Web-Blog-Next.js-Keystatic-Vibe-Hosting";
const PORT = Number(process.argv[2] ?? 3300);

const POST = `---
title: "Bài thử ở nhánh"
description: "Bài chỉ có ở nhánh đang soạn, thuộc chủ đề mới chưa có trong bản build."
category: chu-de-moi-thu
subtopics:
  - chu-de-con-moi-thu
date: 2026-10-01
status: draft
source:
  book: "Sách thử"
  author: "Tác giả thử"
---

Đoạn mở đầu của bài thử.

## Ý chính

Nội dung chỉ tồn tại ở nhánh nhanh-thu.
`;
const TOPIC = JSON.stringify({ name: "Chủ đề mới thử", order: 9, description: "Chủ đề chỉ có ở nhánh." });
const SUBTOPIC = JSON.stringify({ name: "Chủ đề con mới thử", topic: "chu-de-moi-thu", order: 1, description: "Chủ đề con chỉ có ở nhánh." });

const BROKEN = `---\ntitle: "Bài lỗi ở nhánh"\ncategory: chu-de-moi-thu\nsubtopics:\n  - chu-de-con-moi-thu\ndate: 2026-10-01\nstatus: draft\n---\nThiếu mô tả và nguồn sách.\n`;
const BRANCH_FILES = {
  "content/posts/bai-thu-nhanh.md": POST,
  "content/posts/bai-loi-nhanh.md": BROKEN,
  "content/topics/chu-de-moi-thu.json": TOPIC,
  "content/subtopics/chu-de-con-moi-thu.json": SUBTOPIC,
};
// File thật của repo (đường dẫn dấu "/", tính từ thư mục chạy = gốc dự án)
const repoFiles = () => {
  const out = {};
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.posix.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else out[p] = true;
    }
  };
  walk("content");
  walk("public/images");
  return out;
};

let calls = [];
let redirects = {}; // nhánh -> { tên file: nội dung }

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, { "Content-Type": type });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = decodeURIComponent(url.pathname);
  if (path === "/health") return send(res, 200, "ok", "text/plain");
  if (path === "/__calls") return send(res, 200, calls);
  if (path === "/__reset") {
    calls = [];
    redirects = {};
    return send(res, 200, { ok: true });
  }

  const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  const canPush = token === "token-hop-le";
  if (!canPush && token !== "token-chi-doc") return send(res, 401, { message: "Bad credentials" });

  const base = `/repos/${REPO}`;
  if (path === base) return send(res, 200, { permissions: { push: canPush } });
  // Cây file của nhánh và nội dung theo mã băm (cho /api/kiem-tra): nhánh = file thật trong content/ + public/images/ của repo,
  // "nhanh-thu" thêm bài / chủ đề / chủ đề con của nhánh và một bài LỖI (thiếu trường bắt buộc) để kiểm tra có báo.
  if (req.method === "GET" && path.startsWith(`${base}/git/trees/`)) {
    const ref = path.slice(`${base}/git/trees/`.length);
    const files = { ...repoFiles(), ...(ref === "nhanh-thu" ? BRANCH_FILES : {}) };
    return send(res, 200, { tree: Object.keys(files).map((p) => ({ path: p, type: "blob", sha: `f:${p}` })), truncated: false });
  }
  if (req.method === "GET" && path.startsWith(`${base}/git/blobs/f:`)) {
    const p = path.slice(`${base}/git/blobs/f:`.length);
    const text = BRANCH_FILES[p] ?? (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);
    return text === null ? send(res, 404, { message: "Not Found" }) : send(res, 200, text, "text/plain");
  }
  if (!path.startsWith(`${base}/contents/`)) return send(res, 404, { message: "Not Found" });
  const file = path.slice(`${base}/contents/`.length);
  const ref = url.searchParams.get("ref") ?? "main";

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.method === "GET") {
      if (file === "content/redirects") {
        const list = Object.keys(redirects[ref] ?? {});
        return list.length ? send(res, 200, list.map((name) => ({ name, type: "file", sha: `sha-${name}` }))) : send(res, 404, { message: "Not Found" });
      }
      if (file.startsWith("content/redirects/")) {
        const content = redirects[ref]?.[file.slice("content/redirects/".length)];
        return content ? send(res, 200, content, "text/plain") : send(res, 404, { message: "Not Found" });
      }
      if (ref === "nhanh-thu" && file === "content/posts/bai-thu-nhanh.md") return send(res, 200, POST, "text/plain");
      if (ref === "nhanh-thu" && file === "content/topics/chu-de-moi-thu.json") return send(res, 200, TOPIC, "text/plain");
      if (ref === "nhanh-thu" && file === "content/subtopics/chu-de-con-moi-thu.json") return send(res, 200, SUBTOPIC, "text/plain");
      return send(res, 404, { message: "Not Found" });
    }
    if (req.method === "PUT" || req.method === "DELETE") {
      const data = body ? JSON.parse(body) : {};
      const branch = data.branch ?? "main";
      if (!canPush || branch === "main") return send(res, 403, { message: "Protected branch update failed" });
      const content = data.content ? Buffer.from(data.content, "base64").toString("utf8") : null;
      calls.push({ method: req.method, file, branch, message: data.message, content });
      if (file.startsWith("content/redirects/")) {
        redirects[branch] ??= {};
        const name = file.slice("content/redirects/".length);
        if (req.method === "PUT") redirects[branch][name] = content;
        else delete redirects[branch][name];
      }
      return send(res, 201, { content: { sha: "sha-moi" } });
    }
    send(res, 405, { message: "Method Not Allowed" });
  });
});

server.listen(PORT, () => console.log(`mock GitHub: http://localhost:${PORT}`));
