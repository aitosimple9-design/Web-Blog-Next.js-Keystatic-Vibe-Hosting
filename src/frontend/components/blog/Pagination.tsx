// Phân trang: ‹ 1 2 3 … cuối ›. Trang hiện tại có aria-current="page". Mọi nút cao ≥ 44px, cách nhau 8px.
import { fillLabel } from "@/shared/config/ui-labels";
import { getUiLabels } from "@/shared/content/ui-labels";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/frontend/components/ui/Icon";

function pageList(current: number, total: number): (number | "gap-l" | "gap-r")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "gap-l" | "gap-r")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("gap-l");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("gap-r");
  out.push(total);
  return out;
}

export function Pagination({
  current,
  total,
  hrefFor,
}: {
  current: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (total <= 1) return null;
  const item =
    "type-ui-strong tap inline-flex items-center justify-center rounded-sm px-s3 no-underline transition-colors duration-(--motion-fast)";
  const arrow = (dir: "prev" | "next") => {
    const target = dir === "prev" ? current - 1 : current + 1;
    const disabled = target < 1 || target > total;
    const icon = dir === "prev" ? <ArrowLeftIcon /> : <ArrowRightIcon />;
    const label = dir === "prev" ? getUiLabels().pagePrev : getUiLabels().pageNext;
    return disabled ? (
      <span aria-hidden className={`${item} border-(length:--border-width) border-rule opacity-40`}>
        {icon}
      </span>
    ) : (
      <Link
        href={hrefFor(target)}
        aria-label={label}
        rel={dir === "prev" ? "prev" : "next"}
        className={`${item} border-(length:--border-width) border-rule-strong hover:bg-paper-sunk`}
      >
        {icon}
      </Link>
    );
  };

  return (
    <nav aria-label={getUiLabels().pagination} className="mt-s7 flex flex-wrap items-center justify-center gap-2">
      {arrow("prev")}
      {pageList(current, total).map((p, i) =>
        typeof p === "string" ? (
          <span key={p + i} aria-hidden className="tap inline-flex items-center justify-center text-ink-faint">
            …
          </span>
        ) : p === current ? (
          <span key={p} aria-current="page" className={`${item} bg-ink text-paper`}>
            <span className="sr-only-x">{getUiLabels().pageN.split("{n}")[0]}</span>
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-label={fillLabel(getUiLabels().pageN, { n: p })}
            className={`${item} border-(length:--border-width) border-rule-strong hover:bg-paper-sunk`}
          >
            {p}
          </Link>
        ),
      )}
      {arrow("next")}
    </nav>
  );
}
