// Phần giao diện của một bài viết, dùng cho trang thật (/bai-viet/<slug>) và trang xem trước (/xem-truoc/bai-viet/<slug>).
// Layout: docs/layout/chi-tiet-bai/README.md
//  375–767: 1 cột · 768: thân bài căn giữa · 1024: TOC dính trái, ảnh + nguồn sách trong cột phải · 1280+: TOC | thân bài | nguồn sách
import { site } from "@/shared/config/site";
import { brushStyle } from "@/frontend/lib/brush";
import { topicBySlug } from "@/shared/content/topics";
import { getNewsletterSettings, getSiteSettings } from "@/shared/content/settings";
import { getArticlePage, getBlogPage, getPageBlocks } from "@/shared/content/pages";
import { getRelatedPosts, type Post } from "@/shared/content/posts";
import { PageShell } from "@/frontend/components/layout/PageShell";
import { Newsletter } from "@/frontend/components/layout/Newsletter";
import { ArticleHeader, SourceBox } from "@/frontend/components/article/ArticleParts";
import { TOC } from "@/frontend/components/article/TOC";
import { RelatedSlider } from "@/frontend/components/article/RelatedSlider";
import { Breadcrumb } from "@/frontend/components/ui/Breadcrumb";
import { PostImage } from "@/frontend/components/ui/Media";
import { ScrollProgress } from "@/frontend/components/ui/Motion";

// Khung thẻ thông tin bài (nguồn sách / mục lục) dưới 1280px: khối LÕM vào nền (neumorphism, Lộc yêu cầu 2026-10-10).
// Nền = nền trang (bg-paper), không viền, không bóng đổ ra ngoài; chiều sâu chỉ do 2 lớp bóng inset (tối ở góc trên-trái, sáng ở dưới-phải)
// lấy từ token `inset-sunk`, đổi giá trị theo theme. Hover / đang nhấn nút Mục lục: bóng co lại (`inset-sunk-pressed`).
const infoCard =
  "rounded-lg bg-paper shadow-inset-sunk transition-shadow duration-(--motion-normal) ease-(--ease-smooth) motion-reduce:transition-none hover:shadow-inset-sunk-pressed has-[button:active]:shadow-inset-sunk-pressed";

/** `previewNote` có chữ = bản XEM TRƯỚC: hiện thanh ghi chú ở đáy màn hình và không xuất JSON-LD. */
export function ArticleView({ post, previewNote }: { post: Post; previewNote?: string }) {
  const related = getRelatedPosts(post);
  const { tocLabel } = getArticlePage();
  // Khối bật / tắt ở Keystatic (Trang → Trang bài viết → Các khối); thứ tự cố định
  const on = new Set(getPageBlocks("articlePage").filter((b) => b.enabled).map((b) => b.id));
  const showToc = on.has("toc");
  const showSource = on.has("source");
  // Lưới thân bài: mặc định TOC | thân bài | nguồn sách. Tắt mục lục: dưới 1280px chỉ còn một cột; từ 1280px giữ cột trái trống để thân bài đứng đúng chỗ cũ.
  // Tắt cả hai: một cột, thân bài căn giữa.
  const gridCols =
    showToc
      ? "desktop:grid-cols-[var(--toc-width)_minmax(0,1fr)] desktop:gap-x-s7 min-[1280px]:grid-cols-[180px_minmax(0,var(--measure-prose))_minmax(0,1fr)] min-[1280px]:gap-x-s6"
      : showSource
        ? "desktop:grid-cols-1 min-[1280px]:grid-cols-[180px_minmax(0,var(--measure-prose))_minmax(0,1fr)] min-[1280px]:gap-x-s6"
        : "desktop:grid-cols-1";
  const { breadcrumb } = getBlogPage();
  const topic = topicBySlug(post.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    // Ảnh tuyệt đối theo thứ tự dự phòng như thẻ og:image: ảnh chia sẻ riêng → ảnh bìa → ảnh mặc định ở Cài đặt site
    image: (() => {
      const img = post.ogImage ?? post.cover ?? getSiteSettings().ogImage;
      return img ? new URL(img, site.url).toString() : undefined;
    })(),
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
    <PageShell tone="inverse">
      <ScrollProgress />
      <article>
        {/* HERO: ảnh tràn hết bề ngang, chủ đề / tiêu đề / mô tả / ngày nằm GIỮA ảnh (không có nền riêng bên dưới);
            lớp phủ `inverse` 55% (màu phẳng) giữ chữ dễ đọc; đáy cắt bằng mask nét cọ */}
        <section aria-label="Đầu bài">
          <div
            className="on-inverse brush-bottom relative isolate min-h-[calc(clamp(560px,52vw,680px)+var(--header-height))] w-full overflow-hidden bg-inverse text-on-inverse"
            style={brushStyle}
          >
            <div className="absolute inset-0 -z-20">
              <PostImage
                src={post.cover}
                alt={post.coverAlt ?? ""}
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
            <div className="wrap flex min-h-[inherit] flex-col items-center justify-center pt-[calc(var(--header-height)+var(--space-8))] pb-[calc(var(--brush-h)+var(--space-9))]">
              <ArticleHeader post={post} />
              <Breadcrumb
                center
                className="absolute bottom-[calc(var(--brush-h)+var(--space-4))] left-1/2 w-max max-w-[calc(100%-32px)] -translate-x-1/2"
                items={[
                  { label: breadcrumb.home, href: "/" },
                  { label: breadcrumb.blog, href: "/blog" },
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

        <div className={`wrap grid gap-s6 pt-s7 pb-s8 ${gridCols}`}>
          {/* Dưới 1024px: MỘT thẻ chung = nguồn sách (bìa nhỏ đúng tỉ lệ) + hàng "Mục lục" xổ ngay trong thẻ (khối nào tắt thì bỏ khỏi thẻ) */}
          {showToc || showSource ? (
            <div className={`mx-auto w-full max-w-175 overflow-hidden desktop:hidden ${infoCard}`}>
              {showSource ? <SourceBox variant="strip" book={post.source.book} author={post.source.author} className="p-s4" /> : null}
              {showToc ? (
                <div className={showSource ? "border-t-(length:--border-width) border-rule" : ""}>
                  <TOC variant="inline" headings={post.headings} label={tocLabel} />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Từ 1024px: mục lục là cột dính bên trái */}
          {showToc ? (
            <div className="hidden desktop:block">
              <TOC headings={post.headings} label={tocLabel} />
            </div>
          ) : null}

          <div className={`min-w-0 ${!showToc && showSource ? "min-[1280px]:col-start-2" : ""}`}>
            {/* 1024–1279px: dải nguồn sách trong cột thân bài (từ 1280px nó chuyển sang cột phải) */}
            {showSource ? (
              <div className={`hidden desktop:block min-[1280px]:hidden ${infoCard}`}>
                <SourceBox variant="strip" book={post.source.book} author={post.source.author} className="p-s4" />
              </div>
            ) : null}

            <div
              className={`prose-article mx-auto mt-s5 tablet:mt-s6 ${showToc || showSource ? "desktop:mx-0" : ""}`}
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </div>

          {showSource ? (
            <div className="hidden min-w-0 min-[1280px]:block">
              <div className="sticky top-[calc(var(--header-height)+var(--space-6))]">
                <SourceBox
                  book={post.source.book}
                  author={post.source.author}
                  compact
                />
              </div>
            </div>
          ) : null}
        </div>
      </article>

      {on.has("related") ? <RelatedSlider posts={related} /> : null}
      {on.has("newsletter") ? <Newsletter settings={getNewsletterSettings()} /> : null}

      {previewNote ? (
        // sticky (không dùng fixed): bài nằm trong <main> có transform nên fixed sẽ bị tính theo <main>, không theo cửa sổ
        <div role="status" className="type-caption sticky bottom-0 z-50 bg-inverse py-s3 text-center text-on-inverse">
          <div className="wrap">{previewNote}</div>
        </div>
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </PageShell>
  );
}
