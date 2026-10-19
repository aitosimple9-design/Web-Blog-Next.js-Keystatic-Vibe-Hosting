import { notFound, permanentRedirect } from "next/navigation";
import { topicBySlug, getTopics } from "@/shared/content/topics";
import { BlogView, blogMetadata, topicHref, totalPagesFor } from "@/frontend/components/blog/BlogView";

type Props = { params: Promise<{ topic: string; page: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  getTopics().flatMap((t) =>
    Array.from({ length: totalPagesFor(t.slug) }, (_, i) => i + 1)
      .filter((n) => n > 1)
      .map((n) => ({ topic: t.slug, page: String(n) })),
  );

export async function generateMetadata({ params }: Props) {
  const { topic, page } = await params;
  if (!topicBySlug(topic)) return {};
  return blogMetadata(topic, Number(page) || 1);
}

export default async function BlogTopicPagedPage({ params }: Props) {
  const { topic, page } = await params;
  if (!topicBySlug(topic)) notFound();
  const n = Number(page);
  if (!Number.isInteger(n) || n < 1 || n > totalPagesFor(topic)) notFound();
  if (n === 1) permanentRedirect(topicHref(topic));
  return <BlogView slug={topic} page={n} />;
}
