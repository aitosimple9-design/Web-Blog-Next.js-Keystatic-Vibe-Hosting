// Trang Chi tiết bài (ưu tiên số 1; đích của quảng cáo). Giao diện: src/components/article/ArticleView.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { getSiteSettings } from "@/lib/settings";
import { getAllPosts, getPost } from "@/lib/posts";
import { ArticleView } from "@/components/article/ArticleView";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  getAllPosts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const url = `/bai-viet/${post.slug}`;
  return {
    title: post.seoTitle ?? post.title,
    description: post.description,
    keywords: post.tags.length ? post.tags : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.seoTitle ?? post.title} | ${site.name}`,
      description: post.description,
      url,
      publishedTime: post.date,
      modifiedTime: post.updated,
      // Thứ tự dự phòng: ảnh chia sẻ riêng → ảnh bìa → ảnh mặc định ở Cài đặt site
      images: (() => {
        const img = post.ogImage ?? post.cover ?? getSiteSettings().ogImage;
        return img ? [{ url: img }] : undefined;
      })(),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <ArticleView post={post} />;
}
