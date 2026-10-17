// Mẫu ký tự và hằng số của chuyển hướng, THUẦN (không đọc file) để dùng được cả ở trình duyệt (keystatic.config.ts chạy ở trang quản trị),
// next.config.ts, check-content và test. Logic đọc file / dựng danh sách nằm ở src/lib/redirects.ts.

/** Đường dẫn cũ: chữ thường, số, . _ ~ % - và dấu /; KHÔNG có ký tự đặc biệt của Next (: * ( ) ? + { } [ ]), không query, không dấu / ở cuối */
export const REDIRECT_FROM_RE = /^\/[a-z0-9._~%-]+(?:\/[a-z0-9._~%-]+)*$/;
/** Đích: đường dẫn trong site (cùng mẫu, được phép là "/") hoặc địa chỉ http(s) đầy đủ */
export const REDIRECT_TO_RE = /^(?:\/(?:[a-z0-9._~%-]+(?:\/[a-z0-9._~%-]+)*)?|https?:\/\/[^\s]+)$/;
/** Đường dẫn hệ thống không được chuyển hướng (sẽ làm hỏng trang quản trị / API / tài nguyên Next) */
export const RESERVED_PREFIXES = ["/keystatic", "/api", "/xem-truoc", "/_next"];
/** Các trang tĩnh có thật trên web; thêm trang mới (vd. /chinh-sach-rieng-tu) thì thêm vào đây để chuyển hướng tới được */
export const STATIC_ROUTES = ["/", "/book", "/blog", "/chinh-sach-rieng-tu", "/lien-he"];
/** Next.js giới hạn số chuyển hướng trong next.config (khoảng 1024); giữ dưới mức đó */
export const REDIRECTS_MAX = 1000;

export const REDIRECT_FROM_MESSAGE =
  "Bắt đầu bằng /, chữ thường không dấu, không dấu cách, không có ? # : * ( ), không / ở cuối. Ví dụ: /bai-viet/slug-cu";
export const REDIRECT_TO_MESSAGE =
  "Đường dẫn trong site (ví dụ: /bai-viet/slug-moi, /blog, /) hoặc địa chỉ đầy đủ bắt đầu bằng https://";
