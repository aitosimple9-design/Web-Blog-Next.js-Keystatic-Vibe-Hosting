// Chân trang (SiteFooter): nền paper-raised. 375: xếp dọc · 768+: logo trái · menu giữa · 7 icon phải.
import Link from "next/link";
import { site, mainNav, legalLinks } from "@/config/site";
import { SocialIcons } from "@/components/layout/SocialIcons";

export function SiteFooter() {
  return (
    <footer className="bg-paper-raised text-ink">
      <div className="wrap pt-s8 pb-s6">
        <div className="grid gap-s5 tablet:grid-cols-[1fr_auto_1fr] tablet:items-center">
          <Link
            href="/"
            className="tap inline-flex w-fit items-center gap-s2 rounded-sm no-underline"
            aria-label={`${site.name} — về Trang chủ`}
          >
            <span aria-hidden className="block size-[22px] rounded-cover bg-current" />
            <span className="font-serif text-(length:--logo-size) leading-none font-semibold">{site.name}</span>
          </Link>

          <nav aria-label="Chân trang">
            <ul className="type-nav flex flex-wrap gap-x-s2 gap-y-1 tablet:justify-center">
              {mainNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="tap inline-flex items-center px-s3 no-underline hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <SocialIcons className="tablet:justify-end" />
        </div>

        <div className="mt-s6 flex flex-col gap-s3 border-t-(length:--border-width) border-rule pt-s5 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="type-caption text-ink-faint">
            © {site.year} {site.name}. {site.tagline}.
          </p>
          <ul className="type-caption flex gap-s2 text-ink-soft">
            {legalLinks.map((l) => (
              <li key={l.label}>
                {l.href ? (
                  <Link href={l.href} className="tap inline-flex items-center px-s2 no-underline hover:underline">
                    {l.label}
                  </Link>
                ) : (
                  <span className="tap inline-flex items-center px-s2 opacity-60">{l.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
