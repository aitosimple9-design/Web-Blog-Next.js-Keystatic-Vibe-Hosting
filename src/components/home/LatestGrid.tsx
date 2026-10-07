// Bài mới nhất — lưới bento (dải paper-sunk). 375: 1 cột, ô cao 240px · 768: 2 cột, ô đầu cao hai hàng ·
// 1024+: 4 cột (2 ô cao, 1 ô rộng, ô số liệu, 1 ô thường).
import type { PostMeta } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

// Vị trí từng ô theo mốc (thứ tự DOM: t1, t2, t3, ô số liệu, t4)
const slots = [
  "tablet:row-span-2 desktop:col-start-1 desktop:row-start-1 desktop:row-span-2",
  "desktop:col-start-2 desktop:row-start-1 desktop:row-span-2",
  "desktop:col-span-2 desktop:col-start-3 desktop:row-start-1",
];
const lastSlot = "desktop:col-start-4 desktop:row-start-2";

export function LatestGrid({ posts, total }: { posts: PostMeta[]; total: number }) {
  const [a, b, c, d] = posts;
  const tile = (p: PostMeta | undefined, cls: string, i: number) =>
    p ? (
      <Reveal key={p.slug} delay={i * 0.06} className={`h-full min-h-0 ${cls}`}>
        <PostCard post={p} variant="tile" />
      </Reveal>
    ) : null;

  return (
    <section aria-labelledby="latest-title" className="bg-paper-sunk text-ink">
      <div className="wrap band-y">
        <div className="max-w-2xl">
          <h2 id="latest-title" className="type-display-md">
            Bài viết mới nhất
          </h2>
          <p className="type-dek mt-s3 text-ink-soft">Những bài ghi chép mới đăng gần đây.</p>
        </div>

        <div className="mt-s6 grid auto-rows-[240px] gap-s5 tablet:grid-cols-2 desktop:grid-cols-4 desktop:grid-rows-2 tablet:auto-rows-[260px] desktop:auto-rows-[300px]">
          {tile(a, slots[0], 0)}
          {tile(b, slots[1], 1)}
          {tile(c, slots[2], 2)}

          <div className="on-inverse flex flex-col justify-between rounded-md bg-inverse p-s5 text-on-inverse desktop:col-start-3 desktop:row-start-2">
            <div>
              <p className="type-display-lg tabular-nums">{total}+</p>
              <p className="type-ui-body mt-s1 text-on-inverse-soft">Bài viết đã đăng</p>
            </div>
            <Button href="/blog" variant="on-inverse" className="self-start">
              Xem tất cả
              <ArrowRightIcon />
            </Button>
          </div>

          {tile(d, lastSlot, 3)}
        </div>
      </div>
    </section>
  );
}
