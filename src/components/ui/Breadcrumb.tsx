// Breadcrumb (đường dẫn): Trang chủ › Blog › Chủ đề. Dùng trên dải tối (trang Blog) và nền sáng (trang bài, căn giữa).
// Tinh tế: chữ nhỏ, dấu › mảnh, mục hiện tại là huy hiệu pill trong mờ (cùng kiểu huy hiệu của thẻ chủ đề).
// Kèm dữ liệu có cấu trúc BreadcrumbList (JSON-LD) cho SEO. Mục cuối là trang hiện tại (aria-current="page").
import Link from "next/link";
import { site } from "@/config/site";
import { ChevronRightIcon, HomeIcon } from "@/components/ui/Icon";

export type Crumb = { label: string; href?: string };

const tones = {
  inverse: {
    link: "text-on-inverse-soft hover:text-on-inverse",
    current: "border-on-inverse-soft/60 bg-on-inverse/15 text-on-inverse",
    sep: "text-on-inverse-soft",
  },
  paper: {
    link: "text-ink-soft hover:text-ink",
    current: "border-rule-strong bg-accent-soft text-accent-soft-ink",
    sep: "text-ink-faint",
  },
} as const;

/** `tone`: nền tối (inverse) hoặc nền sáng (paper). `center`: căn giữa hàng. */
export function Breadcrumb({
  items,
  className = "",
  tone = "inverse",
  center = false,
}: {
  items: Crumb[];
  className?: string;
  tone?: keyof typeof tones;
  center?: boolean;
}) {
  const t = tones[tone];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${site.url}${c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Đường dẫn" className={className}>
      <ol
        className={`flex flex-wrap items-center gap-x-s2 gap-y-1 ${center ? "justify-center" : ""}`}
      >
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.label} className="flex min-w-0 items-center gap-s2">
              {last || !c.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={`type-caption inline-flex max-w-[16rem] items-center rounded-pill border-(length:--border-width) px-s3 py-1 tablet:max-w-sm ${t.current}`}
                >
                  {/* `truncate` phải nằm ở phần tử khối bên trong: trên chính `inline-flex` thì dấu "…" không có tác dụng, chữ bị cắt cứng giữa chữ */}
                  <span className="min-w-0 truncate">{c.label}</span>
                </span>
              ) : (
                <Link
                  href={c.href}
                  className={`type-caption group/crumb inline-flex min-h-11 min-w-11 items-center justify-center gap-s1 no-underline transition-colors duration-(--motion-fast) ${t.link}`}
                >
                  {i === 0 ? <HomeIcon size={16} aria-hidden /> : null}
                  <span className="ul-grow">{c.label}</span>
                </Link>
              )}
              {last ? null : (
                <ChevronRightIcon
                  aria-hidden
                  className={`shrink-0 opacity-60 ${t.sep}`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
