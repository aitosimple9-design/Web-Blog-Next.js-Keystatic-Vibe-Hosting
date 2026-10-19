import { PageShell } from "@/frontend/components/layout/PageShell";
import { Button } from "@/frontend/components/ui/Button";
import type { Metadata } from "next";
import { getNotFoundPage } from "@/shared/content/pages";

export function generateMetadata(): Metadata {
  return { title: getNotFoundPage().tabTitle };
}

export default function NotFound() {
  const t = getNotFoundPage();
  return (
    <PageShell tone="paper">
      <section className="wrap band-y max-w-2xl text-center">
        <p className="type-eyebrow uppercase text-ink-faint">{t.eyebrow}</p>
        <h1 className="type-display-lg mt-s3">{t.title}</h1>
        <p className="type-dek mt-s4 text-ink-soft">
          {t.text}
        </p>
        <div className="mt-s6 flex flex-col items-stretch justify-center gap-s3 tablet:flex-row tablet:items-center">
          <Button href="/">{t.homeLabel}</Button>
          <Button href="/blog" variant="secondary">
            {t.blogLabel}
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
