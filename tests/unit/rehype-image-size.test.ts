import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { rehypeImageSize } from "@/shared/content/rehype-image-size";

// PNG tối thiểu chỉ cần phần đầu (chữ ký + khối IHDR) cho thư viện đọc kích thước
function png(width: number, height: number): Buffer {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  b[24] = 8; // bit depth
  b[25] = 2; // color type
  return b;
}

let root: string;
let publicDir: string;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "img-size-"));
  publicDir = path.join(root, "public");
  fs.mkdirSync(path.join(publicDir, "images", "posts", "bai-a"), { recursive: true });
  fs.writeFileSync(path.join(publicDir, "images", "posts", "bai-a", "anh.png"), png(1600, 1068));
  fs.writeFileSync(path.join(publicDir, "images", "posts", "bai-a", "co dau.png"), png(300, 200));
  fs.writeFileSync(path.join(publicDir, "images", "posts", "bai-a", "hong.png"), "không phải ảnh");
  fs.writeFileSync(path.join(publicDir, "images", "logo.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"></svg>');
  fs.writeFileSync(path.join(root, "bi-mat.png"), png(10, 10)); // NGOÀI public/
});
afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

async function html(md: string): Promise<string> {
  const file = await unified().use(remarkParse).use(remarkRehype).use(rehypeImageSize, { publicDir }).use(rehypeStringify).process(md);
  return String(file);
}

describe("rehypeImageSize", () => {
  it("ảnh nội bộ có width / height thật, lazy, async; giữ nguyên alt và src", async () => {
    const out = await html("![Hai cuốn sách](/images/posts/bai-a/anh.png)");
    expect(out).toContain('src="/images/posts/bai-a/anh.png"');
    expect(out).toContain('alt="Hai cuốn sách"');
    expect(out).toContain('width="1600"');
    expect(out).toContain('height="1068"');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('decoding="async"');
  });

  it("đọc được SVG", async () => {
    const out = await html("![Logo](/images/logo.svg)");
    expect(out).toContain('width="120"');
    expect(out).toContain('height="40"');
  });

  it("đường dẫn có dấu cách mã hóa %20", async () => {
    const out = await html("![x](/images/posts/bai-a/co%20dau.png)");
    expect(out).toContain('width="300"');
    expect(out).toContain('height="200"');
  });

  it("xử lý nhiều ảnh trong một bài", async () => {
    const out = await html("![a](/images/posts/bai-a/anh.png)\n\nChữ.\n\n![b](/images/logo.svg)");
    expect(out.match(/width=/g)).toHaveLength(2);
  });

  it("ảnh ngoài (http, //cdn) để nguyên, không tải về", async () => {
    for (const src of ["https://example.com/a.png", "//cdn.example.com/a.png"]) {
      const out = await html(`![x](${src})`);
      expect(out).not.toContain("width=");
      expect(out).not.toContain("loading=");
    }
  });

  it("file mất hoặc không phải ảnh thì để nguyên, bài vẫn dựng được", async () => {
    expect(await html("![x](/images/khong-co.png)")).not.toContain("width=");
    expect(await html("![x](/images/posts/bai-a/hong.png)")).not.toContain("width=");
  });

  it("chặn đường dẫn thoát ra ngoài public/ (../)", async () => {
    for (const src of ["/../bi-mat.png", "/images/../../bi-mat.png", "/%2e%2e/bi-mat.png"]) {
      const out = await html(`![x](${src})`);
      expect(out, src).not.toContain("width=");
    }
  });

  it("đường dẫn có % hỏng không làm sập bước dựng", async () => {
    await expect(html("![x](/images/%E0%A4%A.png)")).resolves.toContain("<img");
  });

  it("bỏ qua ?query và #hash khi tìm file", async () => {
    const out = await html("![x](/images/posts/bai-a/anh.png?v=2#phan)");
    expect(out).toContain('width="1600"');
  });

  it("thay ảnh (đổi nội dung / mtime) thì kích thước tự cập nhật", async () => {
    const file = path.join(publicDir, "images", "posts", "bai-a", "doi.png");
    fs.writeFileSync(file, png(100, 50));
    expect(await html("![x](/images/posts/bai-a/doi.png)")).toContain('width="100"');
    fs.writeFileSync(file, png(640, 480));
    const future = new Date(Date.now() + 5000);
    fs.utimesSync(file, future, future); // bảo đảm mtime đổi trên mọi hệ tệp
    expect(await html("![x](/images/posts/bai-a/doi.png)")).toContain('width="640"');
  });
});
