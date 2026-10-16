// LÕI CHẤM ĐIỂM SEO của một bài viết. Hàm thuần: không đọc file, không dùng API của Node, không import gì,
// nên chạy được ở mọi nơi: cột "SEO" ở danh sách quản trị, hộp điểm trong form bài (trình duyệt), `npm run check-content`.
// Tiêu chí theo hướng dẫn SEO của Google và các plugin Yoast / Rank Math. Phần đọc hiểu kiểu Yoast (từ nối, câu bị động)
// cố ý KHÔNG có: các luật đó viết cho tiếng Anh, áp vào tiếng Việt sẽ chấm sai.

export type SeoInput = {
  title: string;
  seoTitle?: string;
  description: string;
  /** Slug (tên file), không đuôi .md */
  slug: string;
  /** Từ khóa chính (tùy chọn). Thiếu thì các tiêu chí về từ khóa được bỏ qua. */
  focusKeyword?: string;
  cover?: string;
  /** Mô tả ảnh bìa (alt) */
  coverAlt?: string;
  ogImage?: string;
  tags?: string[];
  /** Slug các bài liên quan chọn tay */
  related?: string[];
  /** Nội dung Markdown của bài (không gồm frontmatter) */
  body: string;
};

export type SeoStatus = "good" | "warn" | "bad" | "na";
export type SeoGroup = "Tiêu đề và mô tả" | "Từ khóa chính" | "Nội dung" | "Liên kết" | "Ảnh" | "Khác";

export type SeoCheck = {
  id: string;
  group: SeoGroup;
  label: string;
  status: SeoStatus;
  /** Kết quả cụ thể, ví dụ "42 ký tự" */
  detail: string;
  /** Cách sửa, chỉ có khi chưa tốt */
  hint?: string;
};

export type SeoResult = {
  /** 0–100; 0 khi không có tiêu chí nào áp dụng được */
  score: number;
  level: "good" | "warn" | "bad";
  checks: SeoCheck[];
};

// Ngưỡng của các tiêu chí về độ dài (ký tự / từ)
export const SEO_LIMITS = {
  title: { min: 30, max: 60, warnMin: 20, warnMax: 70 },
  description: { min: 70, max: 160, warnMin: 50, warnMax: 180 },
  slugMax: 75,
  words: { good: 600, warn: 300 },
  headings: { good: 2 },
  paragraphWords: { good: 120, warn: 200 },
  density: { min: 0.5, max: 2.5, warnMin: 0.3, warnMax: 3.5 },
  introWords: 100,
} as const;

const WEIGHTS: Record<string, number> = {
  "title-length": 10,
  "description-length": 10,
  "slug-format": 3,
  "kw-set": 5,
  "kw-title": 8,
  "kw-description": 6,
  "kw-slug": 3,
  "kw-intro": 6,
  "kw-heading": 4,
  "kw-density": 4,
  "word-count": 10,
  headings: 6,
  "no-h1": 4,
  "paragraph-length": 3,
  "link-internal": 5,
  "link-external": 2,
  "image-share": 6,
  "image-cover-alt": 4,
  "image-body-alt": 3,
  tags: 3,
};

// ---------- tách Markdown ----------

const FENCE = /^(\s*)(```|~~~)/;

/** Bỏ các khối mã (``` hoặc ~~~) để chúng không bị đếm là chữ của bài. */
function withoutCode(md: string): string[] {
  const out: string[] = [];
  let open: string | null = null;
  for (const line of md.replace(/\r\n?/g, "\n").split("\n")) {
    const m = FENCE.exec(line);
    if (m) {
      if (open === null) open = m[2];
      else if (open === m[2]) open = null;
      continue;
    }
    if (open === null) out.push(line);
  }
  return out;
}

type Heading = { level: number; text: string };

function headingsOf(lines: string[]): Heading[] {
  const found: Heading[] = [];
  for (const line of lines) {
    const m = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) found.push({ level: m[1].length, text: stripInline(m[2]) });
  }
  return found;
}

/** Bỏ dấu định dạng Markdown trong một đoạn: ảnh, liên kết (giữ chữ), in đậm / nghiêng, mã, thẻ HTML. */
function stripInline(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    .replace(/\{%[^%]*%\}/g, " ");
}

const wordsOf = (text: string): string[] => text.split(/\s+/).filter(Boolean);

/** Chữ thuần của thân bài, theo từng đoạn (bỏ tiêu đề, dòng kẻ, trích dẫn giữ chữ). */
function paragraphsOf(lines: string[]): string[] {
  const paras: string[] = [];
  let cur: string[] = [];
  const flush = () => {
    if (cur.length) paras.push(stripInline(cur.join(" ")).replace(/\s+/g, " ").trim());
    cur = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "" || /^ {0,3}#{1,6}\s/.test(raw) || /^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      continue;
    }
    cur.push(line.replace(/^>\s?/, "").replace(/^([-*+]|\d+[.)])\s+/, ""));
  }
  flush();
  return paras.filter(Boolean);
}

// ---------- so khớp từ khóa ----------

const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

/** Slug hóa không dấu để so với slug bài ("Đọc sách" → "doc-sach"). */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  for (let i = haystack.indexOf(needle); i !== -1; i = haystack.indexOf(needle, i + needle.length)) n++;
  return n;
}

const pluralVi = (n: number, one: string) => `${n} ${one}`;

// ---------- các tiêu chí ----------

function rangeStatus(n: number, r: { min: number; max: number; warnMin: number; warnMax: number }): SeoStatus {
  if (n >= r.min && n <= r.max) return "good";
  if (n >= r.warnMin && n <= r.warnMax) return "warn";
  return "bad";
}

export function scoreSeo(input: SeoInput): SeoResult {
  const checks: SeoCheck[] = [];
  const add = (c: SeoCheck) => checks.push(c);

  const effectiveTitle = (input.seoTitle?.trim() || input.title).trim();
  const description = input.description.trim();
  const keyword = norm(input.focusKeyword ?? "");
  const lines = withoutCode(input.body);
  const headings = headingsOf(lines);
  const paragraphs = paragraphsOf(lines);
  const bodyWords = paragraphs.flatMap(wordsOf);
  const wordCount = bodyWords.length;
  const bodyText = norm(paragraphs.join(" "));

  // --- Tiêu đề và mô tả ---
  const T = SEO_LIMITS.title;
  const tLen = effectiveTitle.length;
  const tStatus = rangeStatus(tLen, T);
  add({
    id: "title-length",
    group: "Tiêu đề và mô tả",
    label: "Độ dài tiêu đề SEO",
    status: tStatus,
    detail: `${tLen} ký tự (nên ${T.min}–${T.max})`,
    hint:
      tStatus === "good"
        ? undefined
        : tLen < T.min
          ? `Tiêu đề hơi ngắn, thêm ý để đạt ít nhất ${T.min} ký tự. Điền ô "Tiêu đề SEO riêng" nếu muốn khác tiêu đề bài.`
          : `Google cắt tiêu đề dài hơn khoảng ${T.max} ký tự. Rút gọn hoặc điền ô "Tiêu đề SEO riêng".`,
  });

  const D = SEO_LIMITS.description;
  const dLen = description.length;
  const dStatus = dLen === 0 ? "bad" : rangeStatus(dLen, D);
  add({
    id: "description-length",
    group: "Tiêu đề và mô tả",
    label: "Độ dài mô tả",
    status: dStatus,
    detail: dLen === 0 ? "chưa có mô tả" : `${dLen} ký tự (nên ${D.min}–${D.max})`,
    hint:
      dStatus === "good"
        ? undefined
        : dLen < D.min
          ? `Mô tả nên dài ${D.min}–${D.max} ký tự để Google hiện đủ ý.`
          : `Google cắt mô tả dài hơn khoảng ${D.max} ký tự. Rút gọn lại.`,
  });

  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug);
  const slugStatus: SeoStatus = !slugOk ? "bad" : input.slug.length > SEO_LIMITS.slugMax ? "warn" : "good";
  add({
    id: "slug-format",
    group: "Tiêu đề và mô tả",
    label: "Địa chỉ bài (slug)",
    status: slugStatus,
    detail: `${input.slug.length} ký tự`,
    hint: !slugOk
      ? "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang."
      : slugStatus === "warn"
        ? `Slug dài quá ${SEO_LIMITS.slugMax} ký tự, nên rút gọn còn vài từ chính.`
        : undefined,
  });

  // --- Từ khóa chính ---
  const kwGroup: SeoGroup = "Từ khóa chính";
  if (!keyword) {
    add({
      id: "kw-set",
      group: kwGroup,
      label: "Đã đặt từ khóa chính",
      status: "warn",
      detail: "chưa đặt",
      hint: 'Điền ô "Từ khóa chính" (cụm người đọc sẽ gõ để tìm bài này, 2–4 từ) để kiểm tra các mục bên dưới.',
    });
    for (const [id, label] of [
      ["kw-title", "Từ khóa trong tiêu đề"],
      ["kw-description", "Từ khóa trong mô tả"],
      ["kw-slug", "Từ khóa trong địa chỉ bài"],
      ["kw-intro", "Từ khóa trong đoạn mở đầu"],
      ["kw-heading", "Từ khóa trong tiêu đề phụ"],
      ["kw-density", "Mật độ từ khóa"],
    ] as const) {
      add({ id, group: kwGroup, label, status: "na", detail: "cần từ khóa chính" });
    }
  } else {
    add({ id: "kw-set", group: kwGroup, label: "Đã đặt từ khóa chính", status: "good", detail: `"${input.focusKeyword!.trim()}"` });

    const inTitle = norm(effectiveTitle).includes(keyword);
    add({
      id: "kw-title",
      group: kwGroup,
      label: "Từ khóa trong tiêu đề",
      status: inTitle ? "good" : "bad",
      detail: inTitle ? "có" : "không có",
      hint: inTitle ? undefined : "Đưa từ khóa chính vào tiêu đề, càng gần đầu càng tốt.",
    });

    const inDesc = norm(description).includes(keyword);
    add({
      id: "kw-description",
      group: kwGroup,
      label: "Từ khóa trong mô tả",
      status: inDesc ? "good" : "warn",
      detail: inDesc ? "có" : "không có",
      hint: inDesc ? undefined : "Nhắc từ khóa chính trong mô tả để Google in đậm khi khớp.",
    });

    const kwSlug = slugify(keyword);
    const inSlug = kwSlug !== "" && input.slug.includes(kwSlug);
    add({
      id: "kw-slug",
      group: kwGroup,
      label: "Từ khóa trong địa chỉ bài",
      status: inSlug ? "good" : "warn",
      detail: inSlug ? "có" : "không có",
      hint: inSlug ? undefined : `Slug nên chứa "${kwSlug}".`,
    });

    const intro = norm(bodyWords.slice(0, SEO_LIMITS.introWords).join(" "));
    const inIntro = intro.includes(keyword);
    add({
      id: "kw-intro",
      group: kwGroup,
      label: "Từ khóa trong đoạn mở đầu",
      status: inIntro ? "good" : "warn",
      detail: inIntro ? `có, trong ${SEO_LIMITS.introWords} từ đầu` : `không có trong ${SEO_LIMITS.introWords} từ đầu`,
      hint: inIntro ? undefined : "Nhắc từ khóa chính ngay ở đoạn mở đầu để người đọc và Google biết bài nói về gì.",
    });

    const sub = headings.filter((h) => h.level >= 2);
    const inHeading = sub.some((h) => norm(h.text).includes(keyword));
    add({
      id: "kw-heading",
      group: kwGroup,
      label: "Từ khóa trong tiêu đề phụ",
      status: sub.length === 0 ? "na" : inHeading ? "good" : "warn",
      detail: sub.length === 0 ? "bài chưa có tiêu đề phụ" : inHeading ? "có" : "không có",
      hint: sub.length > 0 && !inHeading ? "Đưa từ khóa (hoặc biến thể gần) vào ít nhất một tiêu đề phụ (##)." : undefined,
    });

    if (wordCount === 0) {
      add({ id: "kw-density", group: kwGroup, label: "Mật độ từ khóa", status: "na", detail: "bài chưa có nội dung" });
    } else {
      const hits = countOccurrences(bodyText, keyword);
      const kwWords = keyword.split(" ").length;
      const pct = ((hits * kwWords) / wordCount) * 100;
      const Dn = SEO_LIMITS.density;
      const st = rangeStatus(pct, { min: Dn.min, max: Dn.max, warnMin: Dn.warnMin, warnMax: Dn.warnMax });
      add({
        id: "kw-density",
        group: kwGroup,
        label: "Mật độ từ khóa",
        status: st,
        detail: `${pct.toFixed(1).replace(".", ",")}% (${hits} lần; nên ${Dn.min}–${Dn.max}%)`,
        hint:
          st === "good"
            ? undefined
            : pct < Dn.min
              ? "Từ khóa xuất hiện ít, nhắc thêm vài lần một cách tự nhiên."
              : "Từ khóa xuất hiện dày, dùng từ đồng nghĩa để bài đọc tự nhiên hơn.",
      });
    }
  }

  // --- Nội dung ---
  const W = SEO_LIMITS.words;
  const wStatus: SeoStatus = wordCount >= W.good ? "good" : wordCount >= W.warn ? "warn" : "bad";
  add({
    id: "word-count",
    group: "Nội dung",
    label: "Độ dài bài",
    status: wStatus,
    detail: `${wordCount} từ (nên từ ${W.good})`,
    hint: wStatus === "good" ? undefined : `Bài ngắn, thêm ví dụ hoặc góc nhìn riêng để đạt khoảng ${W.good} từ.`,
  });

  const subCount = headings.filter((h) => h.level === 2 || h.level === 3).length;
  const hStatus: SeoStatus = subCount >= SEO_LIMITS.headings.good ? "good" : subCount === 1 ? "warn" : "bad";
  add({
    id: "headings",
    group: "Nội dung",
    label: "Tiêu đề phụ",
    status: hStatus,
    detail: pluralVi(subCount, "tiêu đề phụ"),
    hint: hStatus === "good" ? undefined : `Chia bài bằng ít nhất ${SEO_LIMITS.headings.good} tiêu đề phụ (## hoặc ###) để dễ lướt và có mục lục.`,
  });

  const h1 = headings.filter((h) => h.level === 1).length;
  add({
    id: "no-h1",
    group: "Nội dung",
    label: "Không dùng tiêu đề cấp 1 trong bài",
    status: h1 === 0 ? "good" : "bad",
    detail: h1 === 0 ? "đúng" : `${h1} tiêu đề cấp 1`,
    hint: h1 === 0 ? undefined : "Trang bài đã có tiêu đề cấp 1 (tên bài). Trong thân bài dùng ## thay cho #.",
  });

  const longest = paragraphs.reduce((m, p) => Math.max(m, wordsOf(p).length), 0);
  const P = SEO_LIMITS.paragraphWords;
  const pStatus: SeoStatus = wordCount === 0 ? "na" : longest <= P.good ? "good" : longest <= P.warn ? "warn" : "bad";
  add({
    id: "paragraph-length",
    group: "Nội dung",
    label: "Độ dài đoạn văn",
    status: pStatus,
    detail: wordCount === 0 ? "bài chưa có nội dung" : `đoạn dài nhất ${longest} từ (nên ≤ ${P.good})`,
    hint: pStatus === "good" || pStatus === "na" ? undefined : "Có đoạn quá dài, tách thành các đoạn ngắn để dễ đọc trên điện thoại.",
  });

  // --- Liên kết ---
  const bodyJoined = lines.join("\n");
  const linkRe = /(?<!!)\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/g;
  const urls = [...bodyJoined.matchAll(linkRe)].map((m) => m[1]);
  const internalLinks = urls.filter((u) => u.startsWith("/")).length;
  const hasInternal = (input.related?.length ?? 0) > 0 || internalLinks > 0;
  add({
    id: "link-internal",
    group: "Liên kết",
    label: "Liên kết nội bộ",
    status: hasInternal ? "good" : "warn",
    detail: hasInternal
      ? `${(input.related?.length ?? 0)} bài liên quan chọn tay, ${internalLinks} liên kết trong bài`
      : "chưa có",
    hint: hasInternal ? undefined : 'Chọn ít nhất 1 bài ở ô "Bài liên quan", hoặc đặt liên kết tới bài khác của blog trong nội dung.',
  });

  const externalLinks = urls.filter((u) => /^https?:\/\//i.test(u)).length;
  add({
    id: "link-external",
    group: "Liên kết",
    label: "Liên kết ngoài (dẫn nguồn)",
    status: externalLinks > 0 ? "good" : "warn",
    detail: externalLinks > 0 ? `${externalLinks} liên kết` : "chưa có",
    hint: externalLinks > 0 ? undefined : "Nên dẫn ít nhất 1 liên kết tới nguồn uy tín (nhà xuất bản, nghiên cứu) khi nhắc số liệu hoặc ý của người khác.",
  });

  // --- Ảnh ---
  const hasShare = Boolean(input.cover?.trim() || input.ogImage?.trim());
  add({
    id: "image-share",
    group: "Ảnh",
    label: "Có ảnh bìa hoặc ảnh chia sẻ",
    status: hasShare ? "good" : "bad",
    detail: hasShare ? "có" : "chưa có",
    hint: hasShare ? undefined : "Tải ảnh bìa (hoặc ảnh chia sẻ riêng); thiếu ảnh thì link chia sẻ lên mạng xã hội trông trống.",
  });

  const hasCover = Boolean(input.cover?.trim());
  const hasAlt = Boolean(input.coverAlt?.trim());
  add({
    id: "image-cover-alt",
    group: "Ảnh",
    label: "Mô tả ảnh bìa (alt)",
    status: !hasCover ? "na" : hasAlt ? "good" : "warn",
    detail: !hasCover ? "chưa có ảnh bìa" : hasAlt ? "có" : "chưa có",
    hint: hasCover && !hasAlt ? 'Điền ô "Mô tả ảnh bìa" bằng một câu ngắn nói ảnh có gì; Google Hình ảnh và trình đọc màn hình dùng nó.' : undefined,
  });

  const imgs = [...bodyJoined.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)];
  const missingAlt = imgs.filter((m) => m[1].trim() === "").length;
  add({
    id: "image-body-alt",
    group: "Ảnh",
    label: "Ảnh trong bài có mô tả (alt)",
    status: imgs.length === 0 ? "na" : missingAlt === 0 ? "good" : "bad",
    detail: imgs.length === 0 ? "bài không có ảnh" : missingAlt === 0 ? `${imgs.length} ảnh đều có` : `${missingAlt}/${imgs.length} ảnh thiếu`,
    hint: missingAlt > 0 ? "Điền mô tả trong ngoặc vuông: ![mô tả ảnh](đường dẫn)." : undefined,
  });

  // --- Khác ---
  const tagCount = (input.tags ?? []).filter((t) => t.trim()).length;
  add({
    id: "tags",
    group: "Khác",
    label: "Thẻ (tags)",
    status: tagCount > 0 ? "good" : "warn",
    detail: tagCount > 0 ? pluralVi(tagCount, "thẻ") : "chưa có",
    hint: tagCount > 0 ? undefined : 'Thêm vài thẻ ở ô "Thẻ"; chúng được đưa vào meta keywords.',
  });

  // --- tổng điểm ---
  let got = 0;
  let max = 0;
  for (const c of checks) {
    if (c.status === "na") continue;
    const w = WEIGHTS[c.id] ?? 1;
    max += w;
    got += c.status === "good" ? w : c.status === "warn" ? w / 2 : 0;
  }
  const score = max === 0 ? 0 : Math.round((got / max) * 100);
  return { score, level: score >= 80 ? "good" : score >= 50 ? "warn" : "bad", checks };
}
