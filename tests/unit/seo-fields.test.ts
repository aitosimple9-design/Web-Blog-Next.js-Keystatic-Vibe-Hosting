import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import keystaticConfig from "../../keystatic.config";
import { POST_FIELD_LABELS, POST_FIELD_NAMES, type PostFieldKey } from "@/cms/lib/seo-fields";

// Hộp điểm SEO tìm ô trong form Keystatic theo ĐÚNG các nhãn này. Nhãn trong keystatic.config.ts mà lệch khỏi file
// src/lib/seo-fields.ts thì hộp điểm sẽ không thấy ô và chấm sai, nên test này chặn lệch bằng hai lớp:
//  1) mọi ô phải lấy nhãn từ POST_FIELD_LABELS (không viết chuỗi tay) → kiểm bằng nội dung file cấu hình;
//  2) ô nào Keystatic phơi nhãn ra cấu hình thì nhãn phải bằng đúng hằng số.
const keys = Object.keys(POST_FIELD_LABELS) as PostFieldKey[];
const source = fs.readFileSync(path.join(__dirname, "../../keystatic.config.ts"), "utf8");
const schema = keystaticConfig.collections!.posts.schema as unknown as Record<string, { label?: string }>;

describe("nhãn ô của form bài", () => {
  it.each(keys)("ô %s trong keystatic.config.ts lấy nhãn từ POST_FIELD_LABELS", (key) => {
    expect(source).toContain(`POST_FIELD_LABELS.${key}`);
  });

  it.each(keys.filter((k) => k !== "slug" && k !== "content"))("nhãn ô %s khớp hằng số (Keystatic phơi nhãn ra cấu hình)", (key) => {
    // "title" là ô slug-field: nhãn của ô nằm ở schema.title.label; còn nhãn ô Slug / Nội dung Keystatic giấu trong component
    expect(schema[key]?.label).toBe(POST_FIELD_LABELS[key]);
  });

  it("mọi ô đều có tên thân thiện để báo lỗi", () => {
    for (const key of keys) expect(POST_FIELD_NAMES[key]).toBeTruthy();
  });

  it("không có hai ô trùng nhãn (hộp điểm tìm ô theo nhãn, trùng thì nhầm ô)", () => {
    const labels = Object.values(POST_FIELD_LABELS);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
