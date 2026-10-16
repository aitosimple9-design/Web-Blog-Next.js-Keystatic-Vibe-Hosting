import { describe, expect, it } from "vitest";
import { editorToMarkdown, type MdNode } from "@/app/keystatic/seo-form-reader";
import { scoreSeo } from "@/lib/seo-score";

// Dựng cây DOM giả: el("p", {}, "chữ", el("a", {href:"/x"}, "liên kết"))
type Child = MdNode | string;
const text = (t: string): MdNode => ({ nodeType: 3, nodeName: "#text", childNodes: [], textContent: t });
function el(name: string, attrs: Record<string, string> = {}, ...children: Child[]): MdNode {
  const nodes = children.map((c) => (typeof c === "string" ? text(c) : c));
  const textContent = nodes.map((n) => n.textContent ?? "").join("");
  return { nodeType: 1, nodeName: name.toUpperCase(), childNodes: nodes, textContent, getAttribute: (k) => attrs[k] ?? null };
}
const md = (...children: Child[]) => editorToMarkdown(el("div", {}, ...children));

describe("editorToMarkdown", () => {
  it("đoạn văn và tiêu đề cấp 2 / 3", () => {
    expect(md(el("p", {}, "Mở đầu."), el("h2", {}, "Ý chính"), el("h3", {}, "Ý nhỏ"), el("p", {}, "Thân bài."))).toBe(
      "Mở đầu.\n\n## Ý chính\n\n### Ý nhỏ\n\nThân bài.",
    );
  });

  it("liên kết thành [chữ](địa chỉ), liên kết thiếu href giữ chữ", () => {
    expect(md(el("p", {}, "Xem ", el("a", { href: "/bai-viet/x" }, "bài này"), " và ", el("a", {}, "không có đích"), "."))).toBe(
      "Xem [bài này](/bai-viet/x) và không có đích.",
    );
  });

  it("ảnh thành ![alt](src), giữ alt rỗng để tiêu chí alt bắt được", () => {
    expect(md(el("p", {}, el("img", { alt: "Cuốn sổ", src: "/a.jpg" })))).toBe("![Cuốn sổ](/a.jpg)");
    expect(md(el("p", {}, el("img", { src: "/a.jpg" })))).toBe("![](/a.jpg)");
  });

  it("chữ đậm / nghiêng / mã trong đoạn chỉ giữ chữ", () => {
    expect(md(el("p", {}, "Một ", el("strong", {}, "từ"), " ", el("em", {}, "khác"), " ", el("code", {}, "mã"), "."))).toBe("Một từ khác mã.");
  });

  it("danh sách: mỗi mục một dòng gạch đầu dòng, mục chứa đoạn <p> bên trong", () => {
    expect(md(el("ul", {}, el("li", {}, el("p", {}, "Một")), el("li", {}, el("p", {}, "Hai"))))).toBe("- Một\n\n- Hai");
    expect(md(el("ol", {}, el("li", {}, "Một"), el("li", {}, "Hai")))).toBe("- Một\n\n- Hai");
  });

  it("trích dẫn có tiền tố >, khối mã giữ nguyên, đường kẻ", () => {
    expect(md(el("blockquote", {}, el("p", {}, "Câu trích.")))).toBe("> Câu trích.");
    expect(md(el("pre", {}, "# không phải tiêu đề"))).toBe("```\n# không phải tiêu đề\n```");
    expect(md(el("p", {}, "A"), el("hr"), el("p", {}, "B"))).toBe("A\n\n---\n\nB");
  });

  it("bỏ đoạn rỗng, gộp khoảng trắng và dòng ngắt <br>", () => {
    expect(md(el("p", {}, "  "), el("p", {}, "Một", el("br"), "dòng   hai"))).toBe("Một dòng hai");
  });

  it("node không phải khối nằm trực tiếp trong ô soạn thảo vẫn thành một đoạn", () => {
    expect(md("Chữ trần ", el("a", { href: "https://a.vn" }, "link"))).toBe("Chữ trần [link](https://a.vn)");
  });

  it("ô soạn thảo rỗng của Keystatic: chữ giữ chỗ và <img> phụ trợ không có src không tính là nội dung", () => {
    const empty = el("p", {}, el("span", { contenteditable: "false" }, 'Start writing or press "/" for commands…'), el("img", { alt: "" }), el("br"));
    expect(md(empty)).toBe("");
  });

  it("ảnh thật nằm trong widget không soạn thảo được vẫn được giữ, chữ của widget thì bỏ", () => {
    expect(md(el("div", { contenteditable: "false" }, "Chú thích widget", el("img", { alt: "Cuốn sổ", src: "/a.jpg" })))).toBe("![Cuốn sổ](/a.jpg)");
    expect(md(el("p", {}, "Trước ", el("span", { contenteditable: "false" }, "nút", el("img", { alt: "", src: "/b.jpg" })), " sau"))).toBe("Trước ![](/b.jpg) sau");
  });

  it("đi sâu vào khối bọc (div, figure)", () => {
    expect(md(el("div", {}, el("figure", {}, el("p", {}, "Trong figure."))))).toBe("Trong figure.");
  });
});

describe("editorToMarkdown + scoreSeo cho kết quả đúng như Markdown thật", () => {
  it("đếm tiêu đề phụ, liên kết nội bộ / ngoài và ảnh thiếu alt từ cây DOM", () => {
    const body = editorToMarkdown(
      el(
        "div",
        {},
        el("p", {}, "Đọc sách chậm giúp nhớ lâu. ", el("a", { href: "/bai-viet/khac" }, "Xem thêm")),
        el("h2", {}, "Một"),
        el("p", {}, "Nguồn: ", el("a", { href: "https://example.com" }, "ví dụ")),
        el("h2", {}, "Hai"),
        el("p", {}, el("img", { src: "/x.jpg" })),
      ),
    );
    const r = scoreSeo({ title: "T", description: "D", slug: "t", body });
    const status = (id: string) => r.checks.find((c) => c.id === id)!.status;
    expect(status("headings")).toBe("good");
    expect(status("link-internal")).toBe("good");
    expect(status("link-external")).toBe("good");
    expect(status("image-body-alt")).toBe("bad");
    expect(status("no-h1")).toBe("good");
  });
});
