// Trang Chi tiết bài (ưu tiên số 1; đích của quảng cáo). Layout: docs/layout/chi-tiet-bai/README.md
//  375–767: 1 cột · 768: thân bài căn giữa · 1024: TOC dính trái, ảnh + nguồn sách trong cột phải · 1280+: TOC | thân bài | nguồn sách
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { topicBySlug } from "@/config/topics";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/posts";
import { PageShell } from "@/components/layout/PageShell";
import { Newsletter } from "@/components/layout/Newsletter";
import { ArticleHeader, SourceBox } from "@/components/article/ArticleParts";
import { TOC } from "@/components/article/TOC";
import { RelatedSlider } from "@/components/article/RelatedSlider";
import { PostImage } from "@/components/ui/Media";
import { ScrollProgress } from "@/components/ui/Motion";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => getAllPosts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const url = `/bai-viet/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.title} | ${site.name}`,
      description: post.description,
      url,
      publishedTime: post.date,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const related = getRelatedPosts(post);
  const topic = topicBySlug(post.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.source.author },
    isBasedOn: { "@type": "Book", name: post.source.book, author: post.source.author },
    articleSection: topic?.name,
    inLanguage: "vi",
    mainEntityOfPage: `${site.url}/bai-viet/${post.slug}`,
  };

  return (
    <PageShell tone="paper">
      <ScrollProgress />
      <article>
        {/* HERO: ảnh tràn hết bề ngang; khối tiêu đề nền đặc gối lên đáy ảnh (không đặt chữ trực tiếp lên ảnh) */}
        <section aria-label="Đầu bài">
          <div className="relative h-[clamp(240px,46vw,600px)] w-full overflow-hidden bg-paper-deep">
            <PostImage
              src={post.cover}
              alt=""
              seed={post.slug}
              fill
              rounded={false}
              priority
              parallax
              transitionName={`post-${post.slug}`}
              sizes="100vw"
            />
          </div>
          <div className="wrap relative z-10 -mt-s8 tablet:-mt-s9">
            <div className="mx-auto max-w-4xl rounded-lg border-(length:--border-width) border-rule bg-paper px-s5 py-s6 tablet:px-s8 tablet:py-s7">
              <ArticleHeader post={post} />
            </div>
          </div>
        </section>

        <div className="wrap grid gap-s6 pt-s7 pb-s8 desktop:grid-cols-[var(--toc-width)_minmax(0,1fr)] desktop:gap-x-s7 min-[1280px]:grid-cols-[180px_minmax(0,var(--measure-prose))_minmax(0,1fr)] min-[1280px]:gap-x-s6">
          <div className="mx-auto w-full max-w-175 desktop:mx-0 desktop:max-w-none">
            <TOC headings={post.headings} />
          </div>

          <div className="min-w-0">
            <SourceBox book={post.source.book} author={post.source.author} className="min-[1280px]:hidden" />

            <div
              className="prose-article mx-auto mt-s5 desktop:mx-0 tablet:mt-s6"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </div>

          <div className="hidden min-w-0 min-[1280px]:block">
            <div className="sticky top-[calc(var(--header-height)+var(--space-6))]">
              <SourceBox book={post.source.book} author={post.source.author} compact />
            </div>
          </div>
        </div>
      </article>

      <RelatedSlider posts={related} />
      <Newsletter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </PageShell>
  );
}
