import { notFound, permanentRedirect } from "next/navigation";
import { getTopics } from "@/shared/content/topics";
import { BlogView, blogMetadata, subtopicHref, subtopicsWithPosts, totalPagesFor } from "@/frontend/components/blog/BlogView";

type Props = { params: Promise<{ topic: string; sub: string; page: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  getTopics().flatMap((t) =>
    subtopicsWithPosts(t.slug).flatMap((s) =>
      Array.from({ length: totalPagesFor(t.slug, s.slug) }, (_, i) => i + 1)
        .filter((n) => n > 1)
        .map((n) => ({ topic: t.slug, sub: s.slug, page: String(n) })),
    ),
  );

const valid = (topic: string, sub: string) => subtopicsWithPosts(topic).some((s) => s.slug === sub);

export async function generateMetadata({ params }: Props) {
  const { topic, sub, page } = await params;
  if (!valid(topic, sub)) return {};
  return blogMetadata(topic, Number(page) || 1, sub);
}

export default async function BlogSubtopicPagedPage({ params }: Props) {
  const { topic, sub, page } = await params;
  if (!valid(topic, sub)) notFound();
  const n = Number(page);
  if (!Number.isInteger(n) || n < 1 || n > totalPagesFor(topic, sub)) notFound();
  if (n === 1) permanentRedirect(subtopicHref(topic, sub));
  return <BlogView slug={topic} sub={sub} page={n} />;
}
