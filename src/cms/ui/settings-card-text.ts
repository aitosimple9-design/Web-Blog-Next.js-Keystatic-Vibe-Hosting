// Tách nhãn của một ô trong trang cài đặt (singleton) thành TIÊU ĐỀ + MÔ TẢ + GHI CHÚ CHÂN THẺ, để KeystaticSettingsCards vẽ mỗi ô thành một thẻ
// như trang Settings của Vercel (tiêu đề đậm, một dòng mô tả xám, dải chân thẻ). Hàm thuần: test được mà không cần trình duyệt.
// Quy ước nhãn trong keystatic.config.ts: "Tiêu đề (mô tả; để trống = dùng mặc định)". Phần trong ngoặc CUỐI nhãn là mô tả.
export type CardText = {
  title: string;
  description: string;
  /** Câu "để trống = ..." / "mặc định: ..." tách riêng xuống dải chân thẻ */
  footer: string;
};

const upper = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Vị trí dấu "(" khớp với ")" ở CUỐI chuỗi (có đếm ngoặc lồng nhau), hoặc -1 nếu chuỗi không kết thúc bằng ngoặc. */
function openParenOfTrailingGroup(s: string): number {
  if (!s.endsWith(")")) return -1;
  let depth = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ")") depth++;
    else if (s[i] === "(") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const FOOTER_CLAUSE = /^(để trống|bỏ trống|mặc định)\b/i;

export function splitLabel(raw: string): CardText {
  const label = raw.replace(/\s+/g, " ").trim();
  let title = label;
  let rest = "";
  const open = openParenOfTrailingGroup(label);
  if (open > 0) {
    title = label.slice(0, open).trim();
    rest = label.slice(open + 1, -1).trim();
  }
  // "Các khối của trang: ghi số vị trí (...)": phần sau dấu hai chấm là mô tả
  const colon = title.indexOf(": ");
  if (colon > 0) {
    rest = [title.slice(colon + 2).trim(), rest].filter(Boolean).join(". ");
    title = title.slice(0, colon).trim();
  }
  const clauses = rest ? rest.split(/;\s+/) : [];
  const footerClauses = clauses.filter((c) => FOOTER_CLAUSE.test(c.trim()));
  const descClauses = clauses.filter((c) => !FOOTER_CLAUSE.test(c.trim()));
  const sentence = (parts: string[]) => {
    const text = upper(parts.join(". ").trim());
    return text && !/[.!?…]$/.test(text) ? `${text}.` : text;
  };
  return { title: upper(title), description: sentence(descClauses), footer: sentence(footerClauses) };
}
