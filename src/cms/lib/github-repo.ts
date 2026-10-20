// Repo GitHub chứa nội dung (Keystatic chế độ GitHub đọc / ghi ở đây). Dùng chung cho keystatic.config.ts và các API quản trị.
export const GITHUB_REPO = "aitosimple9-design/Web-Blog-Next.js-Keystatic-Vibe-Hosting";

// Địa chỉ GitHub API. Chỉ bộ E2E (tests/e2e/admin-github) đặt GITHUB_API_URL trỏ tới máy chủ giả; web thật KHÔNG đặt biến này (không phải bí mật, không cần thêm ở Vercel).
export const GITHUB_API = (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/$/, "");
