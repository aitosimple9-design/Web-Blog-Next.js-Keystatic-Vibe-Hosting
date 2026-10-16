// Chân trang (SiteFooter): nền paper-raised. 375: xếp dọc · 768+: logo trái · menu giữa · 7 icon phải.
import Link from "next/link";
import Image from "next/image";
import { getFooterSettings, getHeaderSettings, getSiteSettings } from "@/lib/settings";
import { SocialIcons } from "@/components/layout/SocialIcons";

export function SiteFooter() {
  const { name, tagline, year, legalLinks } = getSiteSettings();
  const { logoImage, logoAlt, navGroups } = getHeaderSettings();
  const { links, copyright, showSocials } = getFooterSettings();
  // Liên kết chân trang: tự chọn ở Cài đặt → Footer; để trống thì dùng các mục cấp trên của menu Header
  const nav = links ?? navGroups.flatMap((g) => g.items.map(({ label, href }) => ({ label, href })));
  return (
    <footer className="seam-top bg-paper-raised text-ink">
      <div className="wrap pt-s8 pb-s6">
        <div className="grid gap-s5 tablet:grid-cols-[1fr_auto_1fr] tablet:items-center">
          <Link
            href="/"
            className="tap inline-flex w-fit items-center gap-s2 rounded-sm no-underline"
            aria-label={`${name} — về Trang chủ`}
          >
            {logoImage ? (
              <Image
                src={logoImage.src}
                width={logoImage.width}
                height={logoImage.height}
                alt={logoAlt}
                className="h-[calc(var(--logo-size)*1.5)] w-auto max-w-40 object-contain"
              />
            ) : (
              <>
                <span aria-hidden className="block size-[22px] rounded-cover bg-current" />
                <span className="font-serif text-(length:--logo-size) leading-none font-semibold">{name}</span>
              </>
            )}
          </Link>

          <nav aria-label="Chân trang">
            <ul className="type-nav flex flex-wrap gap-x-s2 gap-y-s2 tablet:justify-center">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="tap inline-flex items-center px-s3 no-underline hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {showSocials ? <SocialIcons className="tablet:justify-end" /> : <span aria-hidden className="hidden tablet:block" />}
        </div>

        <div className="mt-s6 flex flex-col gap-s3 border-t-(length:--border-width) border-rule pt-s5 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="type-caption text-ink-faint">
            {copyright ?? `© ${year} ${name}. ${tagline}.`}
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
