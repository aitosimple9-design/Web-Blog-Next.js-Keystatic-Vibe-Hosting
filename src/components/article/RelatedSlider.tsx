// Bài liên quan: hàng thẻ trượt, thẻ HÌNH CHỮ NHẬT NGANG (tỉ lệ 3:2).
// Ảnh phủ cả thẻ; chữ nằm trong khung nền đặc (paper-raised) gối lên đáy ảnh — không đặt chữ trực tiếp lên ảnh.
// 375: 300px (lộ mép thẻ kế) · 768: 340px · 1024+: 380px · tràn ra mép phải màn hình.
// Hover: thẻ nhấc lên, ảnh phóng nhẹ, khung chữ nổi lên, nhãn đảo màu, nút mũi tên đổi sang màu nhấn và trượt.
import Link from "next/link";
import { topicBySlug } from "@/config/topics";
import type { PostMeta } from "@/lib/posts";
import { Slider } from "@/components/ui/Slider";
import { PostImage } from "@/components/ui/Media";
import { ArrowRightIcon } from "@/components/ui/Icon";

function RelatedCard({ post }: { post: PostMeta }) {
  const topic = topicBySlug(post.category)?.name ?? post.category;
  return (
    <article className="group lift relative aspect-(--post-image-ratio) overflow-hidden rounded-md bg-paper-deep">
      <PostImage src={post.cover} seed={post.slug} fill rounded={false} sizes="380px" />

      <span className="type-caption absolute top-s3 left-s3 rounded-pill bg-paper-raised px-3 py-1 text-ink transition-colors duration-(--motion-normal) group-hover:bg-ink group-hover:text-paper">
        {topic}
      </span>

      <div className="absolute inset-x-s3 bottom-s3 flex items-end justify-between gap-s3 rounded-md bg-paper-raised p-s4 text-ink transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover:-translate-y-1">
        <div className="min-w-0">
          <h3 className="type-ui-strong line-clamp-2 text-balance">
            <Link href={`/bai-viet/${post.slug}`} className="no-underline after:absolute after:inset-0">
              <span className="ul-grow">{post.title}</span>
            </Link>
          </h3>
          <p className="type-caption mt-s1 text-ink-faint">{post.readingMinutes} phút đọc</p>
        </div>
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-pill border-(length:--border-width) border-rule-strong transition-[background-color,color,border-color,transform] duration-(--motion-normal) ease-(--ease-smooth) group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent motion-safe:group-hover:translate-x-1"
        >
          <ArrowRightIcon />
        </span>
      </div>
    </article>
  );
}

export function RelatedSlider({ posts }: { posts: PostMeta[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="related-title" className="bg-paper-sunk text-ink">
      <div className="wrap py-s7 tablet:py-s9">
        <h2 id="related-title" className="type-display-md max-w-3xl text-balance">
          Bài liên quan.{" "}
          <span className="font-normal text-ink-soft">Đọc tiếp những bài cùng chủ đề.</span>
        </h2>
        <div className="mt-s6">
          <Slider
            label="Danh sách bài liên quan"
            gapClassName="gap-s4"
            trackClassName="bleed-r pt-2 pb-2"
            itemClassName="w-[300px] tablet:w-[340px] desktop:w-[380px]"
            items={posts.map((p) => (
              <RelatedCard key={p.slug} post={p} />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
