// Bài mới nhất — băng chuyền 5 bài (dải paper hoặc paper-sunk theo vị trí khối; Lộc duyệt 2026-11-03).
// 375 / 414: trượt ngang 1 thẻ + mép thẻ kế, chấm · 768+: băng chuyền xếp lớp xoay vòng, nút ‹ › + chấm + "1 / 5" (xem LatestCarousel).
// Dưới cùng: "<tổng số>+ Bài viết đã đăng" + nút "Xem tất cả".
import type { PostMeta } from "@/shared/content/posts";
import { PostCard } from "@/frontend/components/blog/PostCard";
import { Button } from "@/frontend/components/ui/Button";
import { ArrowRightIcon } from "@/frontend/components/ui/Icon";
import { SectionHead } from "@/frontend/components/ui/SectionHead";
import { Reveal } from "@/frontend/components/ui/Reveal";
import { LatestCarousel } from "@/frontend/components/book/LatestCarousel";
import type { BookPageTexts } from "@/shared/config/page-texts";
import { toneBg, type SectionTone } from "@/frontend/lib/brush";
import { getUiLabels } from "@/shared/content/ui-labels";

export function LatestGrid({
  posts,
  total,
  text,
  tone = "sunk",
  pullUp = false,
}: {
  posts: PostMeta[];
  total: number;
  text: BookPageTexts["latest"];
  tone?: SectionTone;
  pullUp?: boolean;
}) {
  return (
    <section aria-labelledby="latest-title" className={`${tone === "sunk" ? (pullUp ? "seam-bottom" : "seam-both") : ""} ${toneBg(tone)} ${pullUp ? "relative -mt-[clamp(40px,5.5vw,64px)] pt-[clamp(40px,5.5vw,64px)]" : ""} overflow-x-clip text-ink`}>
      <div className="wrap band-y">
        <SectionHead id="latest-title" title={text.title} dek={text.dek} />

        <Reveal className="mt-s6">
          <LatestCarousel
            // Tên riêng cho khung băng chuyền, KHÁC tiêu đề khối (hai vùng trùng tên là lỗi axe `landmark-unique`)
            label={getUiLabels().latestList}
            dimClassName={tone === "sunk" ? "bg-paper-sunk" : "bg-paper"}
            items={posts.map((p, i) => (
              <PostCard key={p.slug} post={p} variant="tile" excerpt badge={i === 0 ? text.newLabel : undefined} />
            ))}
          />
        </Reveal>

        <div className="mt-s6 flex flex-wrap items-center justify-center gap-x-s5 gap-y-s3">
          <p className="type-ui-body font-semibold tabular-nums text-ink-soft">
            {total}+ {text.totalLabel}
          </p>
          <Button href="/blog" variant="secondary">
            {text.allLabel}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
