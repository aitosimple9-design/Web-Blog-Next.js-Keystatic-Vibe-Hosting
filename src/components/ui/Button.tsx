// Nút theo Design System: bo radius-sm, cao tối thiểu 44px, kiểu chữ `button`. Mỗi khu vực tối đa MỘT nút chính.
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "on-inverse" | "secondary-on-inverse";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-strong active:bg-accent-strong px-(--button-pad-x)",
  secondary:
    "border-(length:--border-width) border-rule-strong text-ink hover:bg-paper-sunk px-(--button-pad-x)",
  quiet: "text-accent hover:underline underline-offset-(--underline-offset) px-s2",
  "on-inverse":
    "bg-on-inverse text-inverse hover:bg-accent-on-inverse px-(--button-pad-x)",
  "secondary-on-inverse":
    "border-(length:--border-width) border-on-inverse-soft text-on-inverse hover:bg-on-inverse/10 px-(--button-pad-x)",
};

const base =
  "type-button tap inline-flex items-center justify-center gap-s2 rounded-sm text-center no-underline select-none " +
  "transition-colors duration-(--motion-fast) active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

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
