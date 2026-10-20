import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Chạy scripts/check-content.mjs trên một thư mục nội dung giả (--root).
function run(files: Record<string, string>, env: Record<string, string> = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "check-"));
  for (const [rel, text] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, text);
  }
  const r = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "check-content.mjs"), "--root", root], {
    encoding: "utf8",
    // Xóa các biến môi trường của máy chạy test để kết quả không phụ thuộc máy
    env: { ...process.env, VERCEL_ENV: "", ALLOW_INDEXING: "", NEXT_PUBLIC_SITE_URL: "", ...env },
  });
  return { code: r.status, out: r.stdout };
}

const topic = { "content/topics/chu-de-1.json": JSON.stringify({ name: "Chủ đề 1", description: "Mô tả", image: "/images/t.jpg" }), "public/images/t.jpg": "x" };
const post = (extra = "") =>
  `---\ntitle: Bài A\ndescription: "Mô tả đủ dài để qua ngưỡng cảnh báo năm mươi ký tự cho SEO nhé"\ncategory: chu-de-1\ndate: 2026-10-05\nsource:\n  book: "Sách X"\n  author: "Tác giả"\n${extra}---\nNội dung.\n`;

describe("scripts/check-content.mjs", () => {
  it("nội dung đúng thì đạt (mã 0)", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post() });
    expect(r.code).toBe(0);
    expect(r.out).toContain("không có lỗi");
  });

  it("địa chỉ web: production mà còn localhost / để trống là LỖI, vercel.app là cảnh báo, máy cá nhân chỉ là thông tin", () => {
    const base = { ...topic, "content/posts/bai-a.md": post() };
    const bad = run(base, { VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });
    expect(bad.code).toBe(1);
    expect(bad.out).toContain("NEXT_PUBLIC_SITE_URL");
    expect(run(base, { VERCEL_ENV: "production" }).code).toBe(1);
    const temp = run(base, { VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://abc.vercel.app" });
    expect(temp.code).toBe(0);
    expect(temp.out).toContain("địa chỉ tạm");
    expect(run(base, { VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://blog.example.com" }).code).toBe(0);
    expect(run(base).code).toBe(0);
  });

  it("bắt chủ đề không tồn tại, ảnh bìa mất, bài liên quan sai (mã 1)", () => {
    const r = run({
      ...topic,
      "content/posts/bai-a.md": post("cover: /images/posts/bai-a/khong-co.jpg\nrelated: [bai-ma]\n").replace("chu-de-1", "chu-de-9"),
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain('chủ đề "chu-de-9"');
    expect(r.out).toContain("file ảnh cover không tồn tại");
    expect(r.out).toContain('bài liên quan "bai-ma" không tồn tại');
  });

  it("bắt mô tả quá 160 ký tự và thiếu tác giả", () => {
    const r = run({
      ...topic,
      "content/posts/bai-a.md": post().replace(/description: ".*"/, `description: "${"x".repeat(161)}"`).replace('  author: "Tác giả"\n', ""),
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain("tối đa 160");
    expect(r.out).toContain("source.author");
  });

  it("cảnh báo (không lỗi): sách chưa có trong mục Sách, thư mục ảnh mồ côi", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post(), "public/images/posts/bai-ma/cover.jpg": "x" });
    expect(r.code).toBe(0);
    expect(r.out).toContain("chưa có trong mục Sách");
    expect(r.out).toContain("thư mục ảnh mồ côi");
  });

  it("báo thông tin bài lên lịch", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post().replace("2026-10-05", "2099-01-01") });
    expect(r.code).toBe(0);
    expect(r.out).toContain("LÊN LỊCH");
  });

  it("cảnh báo ảnh trong bài dùng chung file với ảnh bìa (Keystatic ghi đè hai ảnh cùng tên)", () => {
    const r = run({
      ...topic,
      "content/posts/bai-a.md": post("cover: /images/posts/bai-a/cover.jpg\n").replace("Nội dung.", "![Mô tả](/images/posts/bai-a/cover.jpg)"),
      "public/images/posts/bai-a/cover.jpg": "x",
    });
    expect(r.code).toBe(0); // chỉ cảnh báo, không làm CI đỏ
    expect(r.out).toContain("dùng chung file với ảnh bìa");
  });

  it("ảnh trong bài khác tên với ảnh bìa thì không cảnh báo, ảnh trong bài mất file thì lỗi", () => {
    const ok = run({
      ...topic,
      "content/posts/bai-a.md": post("cover: /images/posts/bai-a/cover.jpg\n").replace("Nội dung.", "![Mô tả](/images/posts/bai-a/anh-trong-bai.jpg)"),
      "public/images/posts/bai-a/cover.jpg": "x",
      "public/images/posts/bai-a/anh-trong-bai.jpg": "y",
    });
    expect(ok.out).not.toContain("dùng chung file");
    const missing = run({ ...topic, "content/posts/bai-a.md": post().replace("Nội dung.", "![Mô tả](/images/posts/bai-a/mat.jpg)") });
    expect(missing.code).toBe(1);
    expect(missing.out).toContain("ảnh trong nội dung không tồn tại");
  });

  it("chấm SEO: cảnh báo mục chưa đạt kèm điểm, không làm CI đỏ, có điểm trung bình ở mục thông tin", () => {
    const r = run({ ...topic, "content/posts/bai-a.md": post() });
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/SEO \d+\/100, chưa đạt:.*Độ dài bài/);
    expect(r.out).toMatch(/Điểm SEO trung bình \d+\/100 \(1 bài\)/);
  });

  it("Trang chủ: tủ sách trỏ tới sách đã xóa và ảnh mất là LỖI; còn chữ [mẫu] chỉ là thông tin", () => {
    const home = (extra: object) => JSON.stringify({ name: "Tên", shelf: { books: [{ book: "sach-a", topic: "chu-de-1" }] }, ...extra });
    const base = { ...topic, "content/posts/bai-a.md": post(), "content/books/sach-a.json": JSON.stringify({ name: "Sách X" }) };
    const ok = run({ ...base, "content/pages/trang-chu.json": home({ story: { paragraphs: ["[mẫu] a"] } }) });
    expect(ok.code).toBe(0);
    expect(ok.out).toMatch(/còn 1 chỗ chữ \[mẫu\]/);
    const noBook = run({ ...base, "content/pages/trang-chu.json": JSON.stringify({ shelf: { books: [{ book: "sach-da-xoa" }] } }) });
    expect(noBook.code).toBe(1);
    expect(noBook.out).toContain('sách "sach-da-xoa" không còn trong mục Sách');
    const noImg = run({ ...base, "content/pages/trang-chu.json": home({ portrait: "/images/profile/mat.webp" }) });
    expect(noImg.code).toBe(1);
    expect(noImg.out).toContain("file ảnh không tồn tại (portrait)");
  });

  it("cảnh báo tên file ảnh sai quy ước (chữ hoa, dấu cách), ảnh đặt tên đúng thì không", () => {
    const bad = run({ ...topic, "public/images/posts/bai-a/Ảnh Bìa.JPG": "x", "content/posts/bai-a.md": post("cover: /images/posts/bai-a/Ảnh Bìa.JPG\n") });
    expect(bad.code).toBe(0);
    expect(bad.out).toContain("tên file ảnh cover nên là chữ thường không dấu");
    const good = run({ ...topic, "public/images/posts/bai-a/cover.jpg": "x", "content/posts/bai-a.md": post("cover: /images/posts/bai-a/cover.jpg\n") });
    expect(good.out).not.toContain("tên file ảnh");
  });

  // So slug bài đã đăng với nhánh gốc (--base): dựng một kho git tạm có 1 commit gốc rồi sửa cây làm việc.
  describe("slug bài đã đăng phải ổn định (--base)", () => {
    function runWithBase(base: Record<string, string>, change: (root: string) => void) {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), "check-git-"));
      const put = (rel: string, text: string) => {
        const abs = path.join(root, rel);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, text);
      };
      for (const [rel, text] of Object.entries(base)) put(rel, text);
      const git = (...a: string[]) => spawnSync("git", ["-C", root, "-c", "user.name=t", "-c", "user.email=t@t", ...a], { encoding: "utf8" });
      git("init", "-q");
      git("add", "-A");
      git("commit", "-q", "-m", "base");
      change(root);
      const r = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "check-content.mjs"), "--root", root, "--base", "HEAD"], { encoding: "utf8" });
      return { code: r.status, out: r.stdout };
    }
    const baseFiles = { ...topic, "content/posts/bai-a.md": post() };

    it("chủ đề bị xóa / đổi slug mà chưa có chuyển hướng: LỖI; có chuyển hướng /blog/<slug> thì đạt", () => {
      const two = { ...baseFiles, "content/topics/chu-de-2.json": JSON.stringify({ name: "Chủ đề 2", description: "Mô tả", image: "/images/t.jpg" }) };
      const lost = runWithBase(two, (root) => fs.rmSync(path.join(root, "content/topics/chu-de-2.json")));
      expect(lost.code).toBe(1);
      expect(lost.out).toContain("/blog/chu-de-2");
      const ok = runWithBase(two, (root) => {
        fs.rmSync(path.join(root, "content/topics/chu-de-2.json"));
        fs.mkdirSync(path.join(root, "content/redirects"), { recursive: true });
        fs.writeFileSync(path.join(root, "content/redirects/c2.json"), JSON.stringify({ label: "c2", from: "/blog/chu-de-2", to: "/blog", permanent: true }));
      });
      expect(ok.code).toBe(0);
    });

    it("không đổi gì: slug ổn định, không cảnh báo", () => {
      const r = runWithBase(baseFiles, () => {});
      expect(r.code).toBe(0);
      expect(r.out).toContain("slug ổn định");
    });

    it("đổi tên file của bài đã đăng mà chưa có chuyển hướng: LỖI, gợi ý slug mới theo tiêu đề", () => {
      const r = runWithBase(baseFiles, (root) => fs.renameSync(path.join(root, "content/posts/bai-a.md"), path.join(root, "content/posts/bai-a-moi.md")));
      expect(r.code).toBe(1);
      expect(r.out).toContain('slug đổi thành "bai-a-moi"');
      expect(r.out).toContain("/bai-viet/bai-a");
    });

    it("bài mẫu (slug bắt đầu bằng demo-) bị xóa hoặc đổi slug: không bắt chuyển hướng", () => {
      const demo = { ...topic, "content/posts/demo-bai-a.md": post() };
      const r0 = runWithBase(demo, (root) => fs.rmSync(path.join(root, "content/posts/demo-bai-a.md")));
      expect(r0.out).not.toContain("LỖI");
      expect(r0.code).toBe(0);
      expect(runWithBase(demo, (root) => fs.renameSync(path.join(root, "content/posts/demo-bai-a.md"), path.join(root, "content/posts/bai-that.md"))).code).toBe(0);
    });

    it("xóa bài đã đăng mà chưa có chuyển hướng: LỖI link cũ sẽ 404", () => {
      const r = runWithBase(baseFiles, (root) => fs.rmSync(path.join(root, "content/posts/bai-a.md")));
      expect(r.code).toBe(1);
      expect(r.out).toContain("không còn ở nhánh này");
    });

    const redirect = (from: string, to: string) => JSON.stringify({ label: "t", from, to, permanent: true });
    const put = (root: string, rel: string, text: string) => {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      fs.writeFileSync(path.join(root, rel), text);
    };

    it("đổi slug nhưng đã có chuyển hướng cũ → mới: đạt, không còn lỗi", () => {
      const r = runWithBase(baseFiles, (root) => {
        fs.renameSync(path.join(root, "content/posts/bai-a.md"), path.join(root, "content/posts/bai-a-moi.md"));
        put(root, "content/redirects/bai-a.json", redirect("/bai-viet/bai-a", "/bai-viet/bai-a-moi"));
      });
      expect(r.code).toBe(0);
      expect(r.out).toContain("đã có chuyển hướng");
    });

    it("xóa bài nhưng có chuyển hướng về /blog: đạt", () => {
      const r = runWithBase(baseFiles, (root) => {
        fs.rmSync(path.join(root, "content/posts/bai-a.md"));
        put(root, "content/redirects/bai-a.json", redirect("/bai-viet/bai-a", "/blog"));
      });
      expect(r.code).toBe(0);
    });

    it("bài nháp hoặc lên lịch ở bản gốc thì đổi / xóa thoải mái", () => {
      const draft = { ...topic, "content/posts/bai-nhap.md": post("draft: true\n"),"content/posts/bai-sau.md": post().replace("2026-10-05", "2999-01-01") };
      const r = runWithBase(draft, (root) => {
        fs.rmSync(path.join(root, "content/posts/bai-nhap.md"));
        fs.rmSync(path.join(root, "content/posts/bai-sau.md"));
      });
      expect(r.out).not.toContain("không còn ở nhánh này");
      expect(r.out).toContain("slug ổn định");
    });

    it("nhánh gốc không tồn tại: bỏ qua, không làm hỏng kiểm tra khác", () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), "check-nogit-"));
      for (const [rel, text] of Object.entries(baseFiles)) {
        const abs = path.join(root, rel);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, text);
      }
      const r = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "check-content.mjs"), "--root", root, "--base", "nhanh-khong-co"], { encoding: "utf8" });
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("Không so được slug");
    });
  });

  // Kiểm tra từng chuyển hướng (content/redirects/*.json)
  describe("chuyển hướng", () => {
    const r1 = (from: string, to: string, extra: Record<string, string> = {}) =>
      run({ ...topic, "content/posts/bai-a.md": post(), "content/redirects/x.json": JSON.stringify({ label: "x", from, to, permanent: true }), ...extra });

    it("hợp lệ: đạt", () => {
      const r = r1("/bai-viet/slug-cu", "/bai-viet/bai-a");
      expect(r.code).toBe(0);
      expect(r.out).toContain("Chuyển hướng: 1 mục");
    });
    it("đích là trang không có trên web (gõ sai): LỖI", () => {
      const r = r1("/bai-viet/slug-cu", "/bai-viet/bai-khong-co");
      expect(r.code).toBe(1);
      expect(r.out).toContain("không phải trang có trên web");
    });
    it("đích là bài nháp / chưa đăng: LỖI", () => {
      const r = run({ ...topic, "content/posts/bai-nhap.md": post("draft: true\n"), "content/redirects/x.json": JSON.stringify({ label: "x", from: "/cu", to: "/bai-viet/bai-nhap" }) });
      expect(r.code).toBe(1);
    });
    it("đích là địa chỉ https ngoài site: không kiểm tra, đạt", () => {
      expect(r1("/cu", "https://example.com/trang").code).toBe(0);
    });
    it("đường dẫn cũ sai mẫu hoặc thuộc hệ thống: LỖI", () => {
      expect(r1("/Bai Viet", "/blog").out).toContain("sai mẫu");
      expect(r1("/keystatic/x", "/blog").out).toContain("hệ thống");
      expect(r1("/:slug", "/blog").code).toBe(1);
    });
    it("che mất trang đang chạy (bài đã đăng, trang tĩnh, chủ đề): LỖI", () => {
      for (const from of ["/bai-viet/bai-a", "/book", "/blog/chu-de-1"]) {
        const r = r1(from, "https://example.com");
        expect(r.code, from).toBe(1);
        expect(r.out).toContain("che mất nó");
      }
    });
    it("hai mục cùng đường dẫn cũ: LỖI", () => {
      const r = r1("/cu", "/blog", { "content/redirects/y.json": JSON.stringify({ label: "y", from: "/cu", to: "/book" }) });
      expect(r.code).toBe(1);
      expect(r.out).toContain("hai lần");
    });
    it("vòng lặp: LỖI; chuỗi nối tiếp: chỉ CẢNH BÁO", () => {
      const loop = run({ ...topic, "content/posts/bai-a.md": post(), "content/redirects/a.json": JSON.stringify({ from: "/a", to: "/b" }), "content/redirects/b.json": JSON.stringify({ from: "/b", to: "/a" }) });
      expect(loop.code).toBe(1);
      const chain = run({ ...topic, "content/posts/bai-a.md": post(), "content/redirects/a.json": JSON.stringify({ from: "/a", to: "/b" }), "content/redirects/b.json": JSON.stringify({ from: "/b", to: "/blog" }) });
      expect(chain.code).toBe(0);
      expect(chain.out).toContain("chuỗi nối tiếp");
    });
    it("file chuyển hướng hỏng: LỖI, không làm sập kiểm tra", () => {
      const r = run({ ...topic, "content/posts/bai-a.md": post(), "content/redirects/hong.json": "{không phải json" });
      expect(r.code).toBe(1);
    });
  });

  describe("trang chữ (Chính sách riêng tư, Liên hệ)", () => {
    const base = { ...topic, "content/posts/bai-a.md": post() };
    it("chưa có trang: THÔNG TIN đang ẨN, vẫn đạt", () => {
      const r = run(base);
      expect(r.code).toBe(0);
      expect(r.out).toContain("Chính sách riêng tư: chưa có trang");
      expect(r.out).toContain("Liên hệ: chưa có trang");
    });
    it("còn chữ [mẫu]: CẢNH BÁO (không chặn)", () => {
      const r = run({ ...base, "content/pages/chinh-sach-rieng-tu.md": "---\n{}\n---\n[mẫu] Tên công ty\n" });
      expect(r.code).toBe(0);
      expect(r.out).toContain("còn chữ [mẫu]");
    });
    it("email liên hệ sai định dạng: LỖI; trang chỉ có khung rỗng thì báo đang ẨN", () => {
      expect(run({ ...base, "content/pages/lien-he.md": "---\nemail: sai\n---\nX\n" }).code).toBe(1);
      expect(run({ ...base, "content/pages/lien-he.md": "---\n{}\n---\n" }).out).toContain("Liên hệ: đang ẨN");
    });
  });

  describe("link nội bộ trong thân bài", () => {
    const withBody = (body: string, extra: Record<string, string> = {}) =>
      run({ ...topic, "content/posts/bai-a.md": post().replace("Nội dung.", body), "content/posts/bai-b.md": post().replace("Bài A", "Bài B"), ...extra });
    it("link tới bài có thật / chủ đề / trang tĩnh / file: đạt", () => {
      const r = withBody("Xem [bài B](/bai-viet/bai-b), [chủ đề](/blog/chu-de-1#x), [Book](/book), [tệp](/files/a.pdf).");
      expect(r.code).toBe(0);
      expect(r.out).toContain("link nội bộ");
    });
    it("link tới bài không còn (đổi slug / xóa): LỖI", () => {
      const r = withBody("Xem [bài cũ](/bai-viet/bai-da-doi-ten).");
      expect(r.code).toBe(1);
      expect(r.out).toContain("/bai-viet/bai-da-doi-ten");
    });
    it("link tới bài nháp: LỖI (bài đã đăng); link kiểu HTML cũng được kiểm tra", () => {
      const draft = { "content/posts/bai-c.md": post("draft: true\n").replace("Bài A", "Bài C") };
      expect(withBody("Xem [nháp](/bai-viet/bai-c).", draft).code).toBe(1);
      expect(withBody('<a href="/bai-viet/khong-co">x</a>').code).toBe(1);
    });
    it("link đi qua chuyển hướng: chỉ CẢNH BÁO", () => {
      const r = withBody("Xem [cũ](/bai-viet/bai-cu).", { "content/redirects/r.json": JSON.stringify({ label: "r", from: "/bai-viet/bai-cu", to: "/bai-viet/bai-b", permanent: true }) });
      expect(r.code).toBe(0);
      expect(r.out).toContain("đang đi qua chuyển hướng");
    });
  });
});
