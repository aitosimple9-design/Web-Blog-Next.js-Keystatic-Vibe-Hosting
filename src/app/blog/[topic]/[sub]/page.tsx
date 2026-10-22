import { notFound } from "next/navigation";
import { getTopics } from "@/shared/content/topics";
import { BlogView, blogMetadata, subtopicsWithPosts } from "@/frontend/components/blog/BlogView";

type Props = { params: Promise<{ topic: string; sub: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => getTopics().flatMap((t) => subtopicsWithPosts(t.slug).map((s) => ({ topic: t.slug, sub: s.slug })));

// Chỉ chủ đề con CÓ BÀI ĐÃ ĐĂNG và đúng chủ đề cha mới có trang; còn lại 404 (không có trang mỏng cho Google)
const valid = (topic: string, sub: string) => subtopicsWithPosts(topic).some((s) => s.slug === sub);

export async function generateMetadata({ params }: Props) {
  const { topic, sub } = await params;
  if (!valid(topic, sub)) return {};
  return blogMetadata(topic, 1, sub);
}

export default async function BlogSubtopicPage({ params }: Props) {
  const { topic, sub } = await params;
  if (!valid(topic, sub)) notFound();
  return <BlogView slug={topic} sub={sub} page={1} />;
}
