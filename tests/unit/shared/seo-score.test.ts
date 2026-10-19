import { describe, expect, it } from "vitest";
import { scoreSeo, slugify, type SeoInput } from "@/shared/seo-score";

const words = (n: number, w = "chữ") => Array.from({ length: n }, () => w).join(" ");

// Bài mẫu đạt gần hết tiêu chí; mỗi test đổi MỘT thứ để xem tiêu chí tương ứng đổi trạng thái.
function good(over: Partial<SeoInput> = {}): SeoInput {
  const intro = `Đọc sách chậm giúp nhớ lâu hơn. ${words(40)}`;
  const body = [
    intro,
    "## Vì sao đọc sách chậm hiệu quả",
    words(150),
    "Xem thêm [bài về ghi chép](/bai-viet/ghi-chep) và [nguồn gốc](https://example.com/nguon).",
    "## Cách bắt đầu",
    words(150),
    "![Cuốn sổ mở trên bàn](/images/a.jpg)",
    "## Kết",
    words(100) + " đọc sách chậm.",
  ].join("\n\n");
  return {
    title: "Đọc sách chậm để nhớ lâu hơn một chút",
    description: "Đọc sách chậm giúp bạn hiểu sâu và nhớ lâu hơn. Ba thói quen nhỏ để bắt đầu ngay hôm nay, không cần thêm thời gian.",
    slug: "doc-sach-cham-de-nho-lau",
    focusKeyword: "đọc sách chậm",
    cover: "/images/posts/x/cover.jpg",
    coverAlt: "Cuốn sổ mở trên bàn gỗ",
    tags: ["doc-sach"],
    related: ["bai-khac"],
    body,
    ...over,
  };
}

const status = (r: ReturnType<typeof scoreSeo>, id: string) => r.checks.find((c) => c.id === id)?.status;

describe("scoreSeo: bài mẫu", () => {
  it("bài đủ tiêu chí đạt mức tốt", () => {
    const r = scoreSeo(good());
    expect(r.level).toBe("good");
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.checks.filter((c) => c.status === "bad")).toEqual([]);
  });

  it("bài trống đạt mức chưa đạt", () => {
    const r = scoreSeo({ title: "", description: "", slug: "a", body: "" });
    expect(r.level).toBe("bad");
    expect(r.score).toBeLessThan(50);
  });
});

describe("scoreSeo: tiêu đề và mô tả", () => {
  it("tiêu đề SEO dùng thay tiêu đề bài khi có", () => {
    const r = scoreSeo(good({ title: "Ngắn", seoTitle: "Đọc sách chậm để nhớ lâu hơn một chút" }));
    expect(status(r, "title-length")).toBe("good");
  });
  it("tiêu đề quá ngắn hoặc quá dài", () => {
    expect(status(scoreSeo(good({ title: "Ngắn quá" })), "title-length")).toBe("bad");
    expect(status(scoreSeo(good({ title: "Một tiêu đề hơi dài hơn mức nên có chút " + "x".repeat(25) })), "title-length")).toBe("warn");
    expect(status(scoreSeo(good({ title: "x".repeat(90) })), "title-length")).toBe("bad");
  });
  it("mô tả: trống / ngắn / vừa / dài", () => {
    expect(status(scoreSeo(good({ description: "" })), "description-length")).toBe("bad");
    expect(status(scoreSeo(good({ description: "x".repeat(60) })), "description-length")).toBe("warn");
    expect(status(scoreSeo(good({ description: "x".repeat(120) })), "description-length")).toBe("good");
    expect(status(scoreSeo(good({ description: "x".repeat(170) })), "description-length")).toBe("warn");
    expect(status(scoreSeo(good({ description: "x".repeat(250) })), "description-length")).toBe("bad");
  });
  it("slug sai định dạng hoặc quá dài", () => {
    expect(status(scoreSeo(good({ slug: "Có Dấu" })), "slug-format")).toBe("bad");
    expect(status(scoreSeo(good({ slug: "a-".repeat(40) + "b" })), "slug-format")).toBe("warn");
  });
});

describe("scoreSeo: từ khóa chính", () => {
  it("không có từ khóa: các mục từ khóa bỏ qua, riêng 'đã đặt' là cảnh báo", () => {
    const r = scoreSeo(good({ focusKeyword: "" }));
    expect(status(r, "kw-set")).toBe("warn");
    for (const id of ["kw-title", "kw-description", "kw-slug", "kw-intro", "kw-heading", "kw-density"]) {
      expect(status(r, id)).toBe("na");
    }
  });
  it("từ khóa không có trong tiêu đề / mô tả / slug / mở đầu / tiêu đề phụ", () => {
    const r = scoreSeo(good({ focusKeyword: "xe đạp" }));
    expect(status(r, "kw-title")).toBe("bad");
    expect(status(r, "kw-description")).toBe("warn");
    expect(status(r, "kw-slug")).toBe("warn");
    expect(status(r, "kw-intro")).toBe("warn");
    expect(status(r, "kw-heading")).toBe("warn");
  });
  it("so khớp không phân biệt hoa thường", () => {
    expect(status(scoreSeo(good({ focusKeyword: "ĐỌC SÁCH CHẬM" })), "kw-title")).toBe("good");
  });
  it("không nhầm chữ có dấu khác nghĩa ('đọc' khác 'dọc')", () => {
    expect(status(scoreSeo(good({ focusKeyword: "dọc sách" })), "kw-title")).toBe("bad");
  });
  it("slug khớp từ khóa theo dạng không dấu", () => {
    expect(status(scoreSeo(good({ focusKeyword: "Đọc sách chậm" })), "kw-slug")).toBe("good");
  });
  it("từ khóa nằm ngoài 100 từ đầu thì cảnh báo ở mục mở đầu", () => {
    const body = `${words(120)} đọc sách chậm.\n\n## Mục\n\n${words(500)}`;
    expect(status(scoreSeo(good({ body })), "kw-intro")).toBe("warn");
  });
  it("mật độ: quá thấp, đạt, quá dày", () => {
    const base = (hits: number, total: number) =>
      [words(total - hits * 3), ...Array.from({ length: hits }, () => "đọc sách chậm")].join(" ");
    expect(status(scoreSeo(good({ body: base(1, 1000) })), "kw-density")).toBe("warn"); // 0,3%
    expect(status(scoreSeo(good({ body: base(5, 1000) })), "kw-density")).toBe("good"); // 1,5%
    expect(status(scoreSeo(good({ body: base(20, 1000) })), "kw-density")).toBe("bad"); // 6%
  });
});

describe("scoreSeo: nội dung", () => {
  it("độ dài bài", () => {
    expect(status(scoreSeo(good({ body: words(700) })), "word-count")).toBe("good");
    expect(status(scoreSeo(good({ body: words(400) })), "word-count")).toBe("warn");
    expect(status(scoreSeo(good({ body: words(100) })), "word-count")).toBe("bad");
  });
  it("không tính chữ trong khối mã và chữ ở tiêu đề vào số từ", () => {
    const r = scoreSeo(good({ body: `${words(10)}\n\n\`\`\`\n${words(900)}\n\`\`\`\n\n## ${words(50)}` }));
    expect(status(r, "word-count")).toBe("bad");
  });
  it("tiêu đề phụ: 0 / 1 / 2", () => {
    expect(status(scoreSeo(good({ body: words(600) })), "headings")).toBe("bad");
    expect(status(scoreSeo(good({ body: `## A\n\n${words(600)}` })), "headings")).toBe("warn");
    expect(status(scoreSeo(good({ body: `## A\n\n${words(300)}\n\n### B\n\n${words(300)}` })), "headings")).toBe("good");
  });
  it("tiêu đề cấp 1 trong thân bài là lỗi; '#' trong khối mã thì không", () => {
    expect(status(scoreSeo(good({ body: `# Tên\n\n${words(600)}` })), "no-h1")).toBe("bad");
    expect(status(scoreSeo(good({ body: `\`\`\`sh\n# chú thích\n\`\`\`\n\n${words(600)}` })), "no-h1")).toBe("good");
  });
  it("đoạn văn dài", () => {
    expect(status(scoreSeo(good({ body: words(150) })), "paragraph-length")).toBe("warn");
    expect(status(scoreSeo(good({ body: words(250) })), "paragraph-length")).toBe("bad");
    expect(status(scoreSeo(good({ body: "" })), "paragraph-length")).toBe("na");
  });
});

describe("scoreSeo: liên kết", () => {
  it("liên kết nội bộ: bài liên quan hoặc liên kết trong bài", () => {
    expect(status(scoreSeo(good({ related: [], body: words(600) })), "link-internal")).toBe("warn");
    expect(status(scoreSeo(good({ related: ["a"], body: words(600) })), "link-internal")).toBe("good");
    expect(status(scoreSeo(good({ related: [], body: `${words(50)} [x](/bai-viet/y)` })), "link-internal")).toBe("good");
  });
  it("liên kết ngoài: chỉ tính http(s)", () => {
    expect(status(scoreSeo(good({ body: `${words(50)} [x](/bai-viet/y)` })), "link-external")).toBe("warn");
    expect(status(scoreSeo(good({ body: `${words(50)} [x](https://a.vn)` })), "link-external")).toBe("good");
  });
  it("ảnh không bị tính là liên kết", () => {
    expect(status(scoreSeo(good({ related: [], body: `${words(50)} ![a](/images/a.jpg)` })), "link-internal")).toBe("warn");
  });
});

describe("scoreSeo: ảnh và thẻ", () => {
  it("ảnh chia sẻ: bìa hoặc ogImage", () => {
    expect(status(scoreSeo(good({ cover: undefined, ogImage: undefined })), "image-share")).toBe("bad");
    expect(status(scoreSeo(good({ cover: undefined, ogImage: "/images/o.jpg" })), "image-share")).toBe("good");
  });
  it("alt ảnh bìa", () => {
    expect(status(scoreSeo(good({ coverAlt: "" })), "image-cover-alt")).toBe("warn");
    expect(status(scoreSeo(good({ cover: undefined, coverAlt: "" })), "image-cover-alt")).toBe("na");
  });
  it("alt ảnh trong bài", () => {
    expect(status(scoreSeo(good({ body: `${words(50)} ![](/a.jpg)` })), "image-body-alt")).toBe("bad");
    expect(status(scoreSeo(good({ body: `${words(50)} ![mô tả](/a.jpg)` })), "image-body-alt")).toBe("good");
    expect(status(scoreSeo(good({ body: words(50) })), "image-body-alt")).toBe("na");
  });
  it("thẻ", () => {
    expect(status(scoreSeo(good({ tags: [] })), "tags")).toBe("warn");
    expect(status(scoreSeo(good({ tags: ["", " "] })), "tags")).toBe("warn");
  });
});

describe("scoreSeo: điểm", () => {
  it("điểm giảm khi bỏ tiêu chí quan trọng và không có tiêu chí 'na' kéo điểm", () => {
    const full = scoreSeo(good()).score;
    expect(scoreSeo(good({ description: "" })).score).toBeLessThan(full);
    expect(scoreSeo(good({ cover: undefined })).score).toBeLessThan(full);
  });
  it("mọi mục đều có hướng sửa khi chưa tốt", () => {
    const r = scoreSeo({ title: "x", description: "", slug: "A", body: "# a\n\n" + words(250) });
    for (const c of r.checks.filter((c) => c.status === "bad" || c.status === "warn")) {
      expect(c.hint, c.id).toBeTruthy();
    }
  });
  it("CRLF và khối mã ~~~ được xử lý như bình thường", () => {
    const body = `## A\r\n\r\n${words(300)}\r\n\r\n~~~\r\n# không phải tiêu đề\r\n~~~\r\n\r\n## B\r\n\r\n${words(300)}`;
    const r = scoreSeo(good({ body }));
    expect(status(r, "no-h1")).toBe("good");
    expect(status(r, "headings")).toBe("good");
  });
});

describe("slugify", () => {
  it("bỏ dấu tiếng Việt, đ thành d", () => {
    expect(slugify("Đọc sách chậm!")).toBe("doc-sach-cham");
    expect(slugify("  Tập trung  sâu ")).toBe("tap-trung-sau");
  });
});
