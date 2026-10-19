import { notFound } from "next/navigation";
import { topicBySlug, getTopics } from "@/shared/content/topics";
import { BlogView, blogMetadata } from "@/frontend/components/blog/BlogView";

type Props = { params: Promise<{ topic: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => getTopics().map((t) => ({ topic: t.slug }));

export async function generateMetadata({ params }: Props) {
  const { topic } = await params;
  if (!topicBySlug(topic)) return {};
  return blogMetadata(topic, 1);
}

export default async function BlogTopicPage({ params }: Props) {
  const { topic } = await params;
  if (!topicBySlug(topic)) notFound();
  return <BlogView slug={topic} page={1} />;
}
