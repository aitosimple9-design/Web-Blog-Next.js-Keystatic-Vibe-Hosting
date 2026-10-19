import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getTopics } from "@/shared/content/topics";

// Nạp lại posts.ts với thư mục content giả (POSTS_DIR được tính từ process.cwd() lúc import).
async function loadWithContent(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"));
  fs.mkdirSync(path.join(root, "content", "posts"), { recursive: true });
  for (const [name, text] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, "content", "posts", name), text);
  }
  // Chủ đề giả: posts.ts kiểm tra `category` theo content/topics của thư mục gốc đang dùng.
  fs.mkdirSync(path.join(root, "content", "topics"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "content", "topics", `${cat}.json`),
    JSON.stringify({ name: "Chủ đề thử", description: "Mô tả", image: "/x.jpg" }),
  );
  vi.spyOn(process, "cwd").mockReturnValue(root);
  vi.resetModules();
  return import("@/shared/content/posts");
}

const cat = getTopics()[0].slug;

function post(over: Record<string, string> = {}, body = "## Mục một\n\nNội dung.") {
  const fields: Record<string, string> = {
    title: '"Tiêu đề"',
    slug: "bai-a",
    description: '"Mô tả ngắn"',
    category: cat,
    date: "2026-10-05",
    ...over,
  };
  const head = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `---\n${head}\nsource:\n  book: "Sách"\n  author: "Tác giả"\n---\n${body}\n`;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("posts (nội dung thật trong content/posts)", () => {
  it("mọi bài hợp lệ, không bài nào là nháp, mới nhất trước", async () => {
    const { getAllPosts } = await import("@/shared/content/posts");
    const all = getAllPosts();
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((p) => !p.draft)).toBe(true);
    const dates = all.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("getPost trả HTML; slug lạ trả null", async () => {
    const { getAllPosts, getPost } = await import("@/shared/content/posts");
    const full = await getPost(getAllPosts()[0].slug);
    expect(full?.html).toContain("<");
    expect(await getPost("khong-ton-tai")).toBeNull();
  });

  it("bài liên quan không chứa chính bài đó và tôn trọng giới hạn", async () => {
    const { getAllPosts, getRelatedPosts } = await import("@/shared/content/posts");
    const p = getAllPosts()[0];
    const rel = getRelatedPosts(p, 4);
    expect(rel.length).toBeLessThanOrEqual(4);
    expect(rel.some((r) => r.slug === p.slug)).toBe(false);
  });

  it("countByTopic cộng lại bằng tổng số bài", async () => {
    const { countByTopic, getAllPosts } = await import("@/shared/content/posts");
    const sum = Object.values(countByTopic()).reduce((a, b) => a + b, 0);
    expect(sum).toBe(getAllPosts().length);
  });
});

describe("posts (kiểm tra dữ liệu bằng content giả)", () => {
  it("bỏ bài draft: true, giữ bài còn lại", async () => {
    const m = await loadWithContent({
      "bai-a.md": post(),
      "bai-b.md": post({ slug: "bai-b", draft: "true" }),
    });
    expect(m.getAllPosts().map((p) => p.slug)).toEqual(["bai-a"]);
    expect(await m.getPost("bai-b")).toBeNull();
  });

  it("render Markdown, tạo id cho h2 và bỏ HTML thô", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({}, "## Ý chính\n\nChữ <script>alert(1)</script> thường."),
    });
    const full = await m.getPost("bai-a");
    // rehype-slug giữ dấu tiếng Việt trong id
    expect(full?.headings).toEqual([{ id: "ý-chính", text: "Ý chính" }]);
    expect(full?.html).not.toContain("<script");
  });

  it("slug không khớp tên file thì báo lỗi rõ ràng", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ slug: "bai-khac" }) });
    expect(() => m.getAllPosts()).toThrow(/phải trùng tên file/);
  });

  it("description quá 160 ký tự thì báo lỗi", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({ description: `"${"x".repeat(161)}"` }),
    });
    expect(() => m.getAllPosts()).toThrow(/tối đa 160/);
  });

  it("category chưa có trong content/topics thì báo lỗi", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ category: "chu-de-khong-co" }) });
    expect(() => m.getAllPosts()).toThrow(/chưa có trong content\/topics/);
  });

  it("date sai định dạng thì báo lỗi", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ date: '"05/10/2026"' }) });
    expect(() => m.getAllPosts()).toThrow(/YYYY-MM-DD/);
  });

  it("thiếu trường bắt buộc (title) thì báo lỗi", async () => {
    const m = await loadWithContent({ "bai-a.md": post().replace(/title: .*\n/, "") });
    expect(() => m.getAllPosts()).toThrow(/"title"/);
  });
});

describe("trường mới của bài (tùy chọn)", () => {
  it("bài cũ không có trường mới vẫn hợp lệ", async () => {
    const m = await loadWithContent({ "bai-a.md": post() });
    const [p] = m.getAllPosts();
    expect(p.tags).toEqual([]);
    expect(p.related).toEqual([]);
    expect(p.seoTitle).toBeUndefined();
    expect(p.ogImage).toBeUndefined();
    expect(p.focusKeyword).toBeUndefined();
    expect(p.coverAlt).toBeUndefined();
  });

  it("đọc từ khóa chính và mô tả ảnh bìa; từ khóa chính không lọt vào HTML", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({ focusKeyword: '"đọc sách chậm"', coverAlt: '"Cuốn sổ mở trên bàn"' }),
    });
    const a = m.getAllPosts()[0];
    expect(a.focusKeyword).toBe("đọc sách chậm");
    expect(a.coverAlt).toBe("Cuốn sổ mở trên bàn");
    const full = await m.getPost("bai-a");
    expect(full!.html).not.toContain("đọc sách chậm");
  });

  it("Trạng thái Nháp / Chờ duyệt ẩn bài, Đã đăng thì hiện", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({ status: "draft" }),
      "bai-b.md": post({ slug: "bai-b", status: "review" }),
      "bai-c.md": post({ slug: "bai-c", status: "published" }),
      "bai-d.md": post({ slug: "bai-d", status: "published", draft: "true" }),
    });
    expect(m.getAllPosts().map((p) => p.slug)).toEqual(["bai-c"]);
  });

  it("cover là đường dẫn ảnh trong public/images/posts/<slug>/", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ cover: "/images/posts/bai-a/cover.jpg" }) });
    expect(m.getAllPosts()[0].cover).toBe("/images/posts/bai-a/cover.jpg");
  });

  it("đọc thẻ, tiêu đề SEO, ảnh chia sẻ; bài liên quan chọn tay đứng đầu", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({ tags: "[doc-sach, ghi-nho]", seoTitle: '"Tiêu đề SEO"', ogImage: "/images/posts/bai-a/og.jpg", related: "[bai-c]" }),
      "bai-b.md": post({ slug: "bai-b", date: "2026-10-04" }),
      "bai-c.md": post({ slug: "bai-c", date: "2026-10-01" }),
    });
    const a = m.getAllPosts().find((p) => p.slug === "bai-a")!;
    expect(a.tags).toEqual(["doc-sach", "ghi-nho"]);
    expect(a.seoTitle).toBe("Tiêu đề SEO");
    expect(a.ogImage).toBe("/images/posts/bai-a/og.jpg");
    expect(m.getRelatedPosts(a).map((p) => p.slug)).toEqual(["bai-c", "bai-b"]);
  });

  it("ghi chú nội bộ (notes) không lọt vào dữ liệu bài", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ notes: '"BÍ MẬT NỘI BỘ"' }) });
    expect(JSON.stringify(m.getAllPosts())).not.toContain("BÍ MẬT");
    const full = await m.getPost("bai-a");
    expect(JSON.stringify(full)).not.toContain("BÍ MẬT");
  });
});

describe("bài lên lịch (isPublished, giờ Asia/Ho_Chi_Minh)", () => {
  it("todayInVietnam đổi ngày đúng lúc nửa đêm giờ Việt Nam", async () => {
    const m = await loadWithContent({ "bai-a.md": post() });
    // 16:59 UTC ngày 30/11 = 23:59 ngày 30/11 ở VN; 17:00 UTC = 00:00 ngày 01/12 ở VN
    expect(m.todayInVietnam(new Date("2026-11-30T16:59:00Z"))).toBe("2026-11-30");
    expect(m.todayInVietnam(new Date("2026-11-30T17:00:00Z"))).toBe("2026-12-01");
  });

  it("isPublished: nháp luôn ẩn; ngày tương lai ẩn; tới ngày thì hiện", async () => {
    const m = await loadWithContent({ "bai-a.md": post() });
    const now = new Date("2026-10-15T05:00:00Z");
    expect(m.isPublished({ draft: false, date: "2026-10-15" }, now)).toBe(true);
    expect(m.isPublished({ draft: false, date: "2026-10-14" }, now)).toBe(true);
    expect(m.isPublished({ draft: false, date: "2026-10-16" }, now)).toBe(false);
    expect(m.isPublished({ draft: true, date: "2026-01-01" }, now)).toBe(false);
  });

  it("bài ngày tương lai không vào danh sách, trang bài, bài liên quan; tới ngày thì hiện", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(new Date("2026-11-30T16:30:00Z")); // 23:30 ngày 30/11 ở VN
      const m = await loadWithContent({
        "bai-a.md": post({ date: "2026-11-01" }),
        "bai-b.md": post({ slug: "bai-b", date: "2026-12-01" }),
      });
      expect(m.getAllPosts().map((p) => p.slug)).toEqual(["bai-a"]);
      expect(await m.getPost("bai-b")).toBeNull();
      expect(m.getRelatedPosts(m.getAllPosts()[0]).map((p) => p.slug)).toEqual([]);

      vi.setSystemTime(new Date("2026-11-30T17:00:00Z")); // 00:00 ngày 01/12 ở VN
      expect(m.getAllPosts().map((p) => p.slug).sort()).toEqual(["bai-a", "bai-b"]);
      expect(await m.getPost("bai-b")).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("ngày sửa gần nhất (updated, tùy chọn)", () => {
  it("đọc được updated; thiếu thì để trống", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({ updated: "2026-10-10" }),
      "bai-b.md": post({ slug: "bai-b" }),
    });
    const all = m.getAllPosts();
    expect(all.find((p) => p.slug === "bai-a")!.updated).toBe("2026-10-10");
    expect(all.find((p) => p.slug === "bai-b")!.updated).toBeUndefined();
  });

  it("updated sai định dạng thì báo lỗi", async () => {
    const m = await loadWithContent({ "bai-a.md": post({ updated: '"10/10/2026"' }) });
    expect(() => m.getAllPosts()).toThrow(/YYYY-MM-DD/);
  });
});

describe("xem trước bài (getPostForPreview)", () => {
  it("lấy được cả bản nháp và bài lên lịch, kèm trạng thái; trang công khai vẫn không thấy", async () => {
    const m = await loadWithContent({
      "bai-a.md": post({ slug: "bai-a" }),
      "bai-b.md": post({ slug: "bai-b", status: "draft" }),
      "bai-c.md": post({ slug: "bai-c", date: "2099-01-01" }),
    });
    expect((await m.getPostForPreview("bai-a"))?.state).toBe("published");
    expect((await m.getPostForPreview("bai-b"))?.state).toBe("draft");
    expect((await m.getPostForPreview("bai-c"))?.state).toBe("scheduled");
    expect((await m.getPostForPreview("bai-b"))?.html).toContain("<h2");
    expect(await m.getPostForPreview("khong-co")).toBeNull();
    expect(await m.getPost("bai-b")).toBeNull();
    expect(await m.getPost("bai-c")).toBeNull();
    expect(m.getAllPosts().map((p) => p.slug)).toEqual(["bai-a"]);
  });
});

describe("cổng xem trước (isPreviewEnabled)", () => {
  const set = (storage: string | undefined, vercel: string | undefined) => {
    if (storage === undefined) vi.stubEnv("NEXT_PUBLIC_KEYSTATIC_STORAGE", "");
    else vi.stubEnv("NEXT_PUBLIC_KEYSTATIC_STORAGE", storage);
    vi.stubEnv("VERCEL", vercel ?? "");
  };
  it("chỉ bật khi Keystatic ở chế độ local và không chạy trên Vercel", async () => {
    const { isPreviewEnabled } = await import("@/cms/lib/preview");
    set("local", undefined);
    expect(isPreviewEnabled()).toBe(true);
    set("github", undefined);
    expect(isPreviewEnabled()).toBe(false);
    set("local", "1");
    expect(isPreviewEnabled()).toBe(false);
    set("github", "1");
    expect(isPreviewEnabled()).toBe(false);
    vi.unstubAllEnvs();
  });
});
