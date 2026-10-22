// Địa chỉ các trang Blog (hàm thuần, dùng chung giao diện / sitemap / route):
//   /blog/<chủ đề>                        /blog/<chủ đề>/trang/<n>
//   /blog/<chủ đề>/<chủ đề con>           /blog/<chủ đề>/<chủ đề con>/trang/<n>
// Slug "trang" bị cấm cho chủ đề con (RESERVED_SUBTOPIC_SLUGS) nên không đụng đoạn phân trang.

export const topicHref = (slug: string, page = 1) => (page <= 1 ? `/blog/${slug}` : `/blog/${slug}/trang/${page}`);

export const subtopicHref = (topic: string, sub: string, page = 1) =>
  page <= 1 ? `/blog/${topic}/${sub}` : `/blog/${topic}/${sub}/trang/${page}`;
