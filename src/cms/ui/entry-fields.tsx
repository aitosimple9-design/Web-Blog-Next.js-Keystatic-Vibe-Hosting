// Ô tùy biến của Keystatic dùng ô chọn EntryPicker. KHÔNG đánh dấu "use client": keystatic.config.ts cũng chạy phía server (route API) và cần
// parse / serialize thật; chỉ phần giao diện (EntryPicker) là mã trình duyệt.
import type { BasicFormField } from "@keystatic/core";
import { EntryPicker } from "./EntryPicker";

/** Ô "Tên sách": chọn từ mục Sách, lưu tên dạng chữ (giống ô chữ cũ, file bài không đổi) */
export function bookField(label: string): BasicFormField<string> {
  return {
    kind: "form",
    label,
    Input: (props) => <EntryPicker label={label} noun="sách" value={props.value} onChange={props.onChange} forceValidation={props.forceValidation} />,
    defaultValue: () => "",
    parse: (value) => (typeof value === "string" ? value : ""),
    serialize: (value) => ({ value }),
    validate: (value) => {
      if (!value.trim()) throw new Error(`${label} is required`);
      return value;
    },
    reader: { parse: (value) => (typeof value === "string" ? value : "") },
  };
}
