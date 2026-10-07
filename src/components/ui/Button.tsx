// Nút theo Design System: bo radius-sm, cao tối thiểu 44px, kiểu chữ `button`. Mỗi khu vực tối đa MỘT nút chính.
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "on-inverse" | "secondary-on-inverse";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent px-(--button-pad-x) before:bg-accent-strong",
  secondary:
    "border-(length:--border-width) border-rule-strong text-ink px-(--button-pad-x) before:bg-paper-sunk",
  quiet: "text-accent hover:underline underline-offset-(--underline-offset) px-s2 before:hidden",
  "on-inverse": "bg-on-inverse text-inverse px-(--button-pad-x) before:bg-inverse/15",
  "secondary-on-inverse":
    "border-(length:--border-width) border-on-inverse-soft text-on-inverse px-(--button-pad-x) before:bg-on-inverse/15",
};

// Hover: nền "quét" từ trái sang phải, mũi tên cuối nút trượt nhẹ; nhấn: thu về 0.95 (skill motion-system)
const base =
  "type-button tap relative isolate inline-flex items-center justify-center gap-s2 overflow-hidden rounded-sm text-center no-underline select-none " +
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-(--motion-normal) before:ease-(--ease-smooth) hover:before:scale-x-100 " +
  "[&_svg:last-child]:transition-transform [&_svg:last-child]:duration-(--motion-normal) [&_svg:last-child]:ease-(--ease-smooth) hover:[&_svg:last-child]:translate-x-1 " +
  "transition-[color,transform] duration-(--motion-fast) active:scale-95 disabled:pointer-events-none disabled:opacity-60";

type CommonProps = {
  variant?: Variant;
  wide?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = CommonProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "className" | "children"
  >;
type BtnProps = CommonProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >;

export function Button(props: LinkProps | BtnProps) {
  const { variant = "primary", wide, className = "", children, ...rest } = props;
  const cls = `${base} ${variants[variant]} ${wide ? "w-full" : ""} ${className}`;

  if (typeof (rest as LinkProps).href === "string") {
    const { href, ...a } = rest as LinkProps;
    return (
      <Link href={href} className={cls} {...a}>
        {children}
      </Link>
    );
  }
  const b = rest as Omit<BtnProps, keyof CommonProps>;
  return (
    <button type="button" className={cls} {...b}>
      {children}
    </button>
  );
}
