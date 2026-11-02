import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "@/cms/lib/same-origin";

const req = (headers: Record<string, string>) => new Request("http://localhost:3000/api/danh-muc", { method: "POST", headers });

describe("isSameOriginRequest (chặn lệnh ghi từ trang web khác)", () => {
  it("trình duyệt báo Sec-Fetch-Site: chỉ nhận same-origin / none", () => {
    expect(isSameOriginRequest(req({ "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOriginRequest(req({ "sec-fetch-site": "none" }))).toBe(true);
    expect(isSameOriginRequest(req({ "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isSameOriginRequest(req({ "sec-fetch-site": "same-site" }))).toBe(false);
  });

  it("không có Sec-Fetch-Site: Origin phải trùng máy chủ; không có Origin thì cho qua (curl, công cụ dòng lệnh)", () => {
    expect(isSameOriginRequest(req({ origin: "http://localhost:3000", host: "localhost:3000" }))).toBe(true);
    expect(isSameOriginRequest(req({ origin: "https://trang-la.example", host: "localhost:3000" }))).toBe(false);
    expect(isSameOriginRequest(req({ origin: "khong-phai-url" }))).toBe(false);
    expect(isSameOriginRequest(req({}))).toBe(true);
  });

  it("sau proxy (Vercel): so với x-forwarded-host", () => {
    expect(isSameOriginRequest(req({ origin: "https://web.example", host: "noi-bo:3000", "x-forwarded-host": "web.example" }))).toBe(true);
  });
});
