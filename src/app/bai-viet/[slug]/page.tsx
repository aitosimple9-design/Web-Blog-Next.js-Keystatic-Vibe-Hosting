// Trang Chi tiết bài (ưu tiên số 1; đích của quảng cáo). Layout: docs/layout/chi-tiet-bai/README.md
//  375–767: 1 cột · 768: thân bài căn giữa · 1024: TOC dính trái, ảnh + nguồn sách trong cột phải · 1280+: TOC | thân bài | nguồn sách
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { brushStyle } from "@/lib/brush";
import { topicBySlug } from "@/config/topics";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/posts";
import { PageShell } from "@/components/layout/PageShell";
import { Newsletter } from "@/components/layout/Newsletter";
import { ArticleHeader, SourceBox } from "@/components/article/ArticleParts";
import { TOC } from "@/components/article/TOC";
import { RelatedSlider } from "@/components/article/RelatedSlider";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PostImage } from "@/components/ui/Media";
import { ScrollProgress } from "@/components/ui/Motion";

type Props = { params: Promise<{ slug: string }> };

// Khung thẻ thông tin bài (nguồn sách / mục lục) dưới 1280px: khối LÕM vào nền (neumorphism, Lộc yêu cầu 2026-10-10).
// Nền = nền trang (bg-paper), không viền, không bóng đổ ra ngoài; chiều sâu chỉ do 2 lớp bóng inset (tối ở góc trên-trái, sáng ở dưới-phải)
// lấy từ token `inset-sunk`, đổi giá trị theo theme. Hover / đang nhấn nút Mục lục: bóng co lại (`inset-sunk-pressed`).
const infoCard =
  "rounded-lg bg-paper shadow-inset-sunk transition-shadow duration-(--motion-normal) ease-(--ease-smooth) motion-reduce:transition-none hover:shadow-inset-sunk-pressed has-[button:active]:shadow-inset-sunk-pressed";

export const dynamicParams = false;
export const generateStaticParams = () =>
  getAllPosts().map((p) => ({ slug: p.slug }));

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
    isBasedOn: {
      "@type": "Book",
      name: post.source.book,
      author: post.source.author,
    },
    articleSection: topic?.name,
    inLanguage: "vi",
    mainEntityOfPage: `${site.url}/bai-viet/${post.slug}`,
  };

  return (
    <PageShell tone="paper">
      <ScrollProgress />
      <article>
        {/* HERO: ảnh tràn hết bề ngang, chủ đề / tiêu đề / mô tả / ngày nằm GIỮA ảnh (không có nền riêng bên dưới);
            lớp phủ `inverse` 55% (màu phẳng) giữ chữ dễ đọc; đáy cắt bằng mask nét cọ */}
        <section aria-label="Đầu bài">
          <div
            className="on-inverse brush-bottom relative isolate min-h-[clamp(560px,52vw,680px)] w-full overflow-hidden bg-inverse text-on-inverse"
            style={brushStyle}
          >
            <div className="absolute inset-0 -z-20">
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
            <div aria-hidden className="absolute inset-0 -z-10 bg-inverse/62" />
            <div className="wrap flex min-h-[inherit] flex-col items-center justify-center pt-s8 pb-[calc(var(--brush-h)+var(--space-9))]">
              <ArticleHeader post={post} />
              <Breadcrumb
                center
                className="absolute bottom-[calc(var(--brush-h)+var(--space-4))] left-1/2 w-max max-w-[calc(100%-32px)] -translate-x-1/2"
                items={[
                  { label: "Trang chủ", href: "/" },
                  { label: "Blog", href: "/blog" },
                  ...(topicBySlug(post.category)
                    ? [
                        {
                          label: topicBySlug(post.category)!.name,
                          href: `/blog/${post.category}`,
                        },
                      ]
                    : []),
                  { label: post.title },
                ]}
              />
            </div>
          </div>
        </section>

        <div className="wrap grid gap-s6 pt-s7 pb-s8 desktop:grid-cols-[var(--toc-width)_minmax(0,1fr)] desktop:gap-x-s7 min-[1280px]:grid-cols-[180px_minmax(0,var(--measure-prose))_minmax(0,1fr)] min-[1280px]:gap-x-s6">
          {/* Dưới 1024px: MỘT thẻ chung = nguồn sách (bìa nhỏ đúng tỉ lệ) + hàng "Mục lục" xổ ngay trong thẻ */}
          <div className={`mx-auto w-full max-w-175 overflow-hidden desktop:hidden ${infoCard}`}>
            <SourceBox variant="strip" book={post.source.book} author={post.source.author} className="p-s4" />
            <div className="border-t-(length:--border-width) border-rule">
              <TOC variant="inline" headings={post.headings} />
            </div>
          </div>

          {/* Từ 1024px: mục lục là cột dính bên trái */}
          <div className="hidden desktop:block">
            <TOC headings={post.headings} />
          </div>

          <div className="min-w-0">
            {/* 1024–1279px: dải nguồn sách trong cột thân bài (từ 1280px nó chuyển sang cột phải) */}
            <div className={`hidden desktop:block min-[1280px]:hidden ${infoCard}`}>
              <SourceBox variant="strip" book={post.source.book} author={post.source.author} className="p-s4" />
            </div>

            <div
              className="prose-article mx-auto mt-s5 desktop:mx-0 tablet:mt-s6"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </div>

          <div className="hidden min-w-0 min-[1280px]:block">
            <div className="sticky top-[calc(var(--header-height)+var(--space-6))]">
              <SourceBox
                book={post.source.book}
                author={post.source.author}
                compact
              />
            </div>
          </div>
        </div>
      </article>

      <RelatedSlider posts={related} />
      <Newsletter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </PageShell>
  );
}
