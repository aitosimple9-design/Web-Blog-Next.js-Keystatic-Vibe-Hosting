// Ô tùy biến của Keystatic dùng ô chọn EntryPicker. KHÔNG đánh dấu "use client": keystatic.config.ts cũng chạy phía server (route API) và cần
// parse / serialize thật; chỉ phần giao diện (EntryPicker) là mã trình duyệt. Giá trị lưu GIỐNG HỆT ô gốc cũ nên file nội dung không đổi.
import type { BasicFormField } from "@keystatic/core";
import { EntryPicker } from "./EntryPicker";

const str = (value: unknown) => (typeof value === "string" ? value : "");
const strList = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);

/** Chọn MỘT mục, lưu dạng chữ: Sách lưu TÊN, Chủ đề lưu slug (giống ô gõ chữ / ô relationship cũ) */
function singleField(kind: "books" | "topics", label: string): BasicFormField<string> {
  return {
    kind: "form",
    label,
    Input: (props) => <EntryPicker kind={kind} label={label} values={props.value ? [props.value] : []} onChange={(v) => props.onChange(v[0] ?? "")} forceValidation={props.forceValidation} />,
    defaultValue: () => "",
    parse: str,
    serialize: (value) => ({ value }),
    validate: (value) => {
      if (!value.trim()) throw new Error(`${label} is required`);
      return value;
    },
    reader: { parse: str },
  };
}

/** "Tên sách": chọn từ mục Sách, lưu tên dạng chữ */
export const bookField = (label: string) => singleField("books", label);

/** "Chủ đề": chọn từ mục Chủ đề, lưu slug (như `fields.relationship`) */
export const topicField = (label: string) => singleField("topics", label);

/** "Chủ đề con": chọn nhiều, lưu danh sách slug (như `fields.multiRelationship`), ít nhất một */
export function subtopicsField(label: string): BasicFormField<string[]> {
  return {
    kind: "form",
    label,
    Input: (props) => <EntryPicker kind="subtopics" label={label} values={props.value} multi onChange={props.onChange} forceValidation={props.forceValidation} />,
    defaultValue: () => [],
    parse: strList,
    serialize: (value) => ({ value }),
    validate: (value) => {
      if (value.length < 1) throw new Error(`${label} needs at least one`);
      return value;
    },
    reader: { parse: strList },
  };
}
