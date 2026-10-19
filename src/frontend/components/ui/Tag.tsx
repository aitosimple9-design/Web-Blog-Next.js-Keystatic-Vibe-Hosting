// Tag chủ đề (nền accent-soft, không viền) và Tag lọc (pill, cao tối thiểu 36px, đảo màu khi đang chọn).
import Link from "next/link";
import type { ReactNode } from "react";

export function TopicTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`type-caption inline-block w-fit rounded-pill bg-accent-soft px-(--tag-topic-pad-x) py-s1 text-accent-soft-ink ${className}`}
    >
      {children}
    </span>
  );
}

export function FilterTag({
  href,
  selected,
  children,
}: {
  href: string;
  selected?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      className={`type-label tap inline-flex items-center justify-center rounded-pill border-(length:--border-width) px-(--button-sm-pad-x) no-underline transition-colors duration-(--motion-fast) ${
        selected
          ? "border-ink bg-ink text-paper"
          : "border-rule-strong text-ink-soft hover:bg-paper-sunk"
      }`}
    >
      {children}
    </Link>
  );
}
