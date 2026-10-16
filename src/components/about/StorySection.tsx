// Khối Câu chuyện: tiêu đề, ảnh thứ hai, 4 đoạn chữ serif (khổ dòng 66ch).
// 375: tiêu đề, ảnh 3:2, chữ · 768: ảnh rộng phía trên, chữ 66ch căn giữa · 1024+: 2 cột, chữ trái, ảnh dọc 4:5 bên phải (dính khi cuộn).
import Image from "next/image";
import { getHomePage } from "@/lib/pages";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollParallax } from "@/components/ui/Motion";

export function StorySection() {
  const { story } = getHomePage();
  return (
    <section aria-labelledby="story-title" className="bg-paper py-s8 text-ink tablet:py-s9">
      <div className="wrap grid gap-x-s8 gap-y-s6 desktop:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <Reveal className="desktop:col-start-1 desktop:row-start-1">
          <p className="type-eyebrow flex items-center gap-s2 uppercase text-ink-faint tablet:justify-center desktop:justify-start">
            <span aria-hidden className="block size-1.5 rotate-45 rounded-[1px] bg-accent-warm" />
            {story.eyebrow}
          </p>
          <h2 id="story-title" className="type-display-lg mt-s3 text-balance tablet:text-center desktop:text-left">
            <RevealText text={story.title} />
          </h2>
        </Reveal>

        <Reveal className="desktop:col-start-2 desktop:row-span-2 desktop:row-start-1">
          <ScrollParallax className="relative aspect-[3/2] rounded-lg shadow-elevated-lg desktop:sticky desktop:top-[calc(var(--header-height)+var(--space-6))] desktop:aspect-[4/5]">
            <Image
              src={story.image.src}
              alt={story.image.alt}
              fill
              sizes="(min-width: 1024px) 416px, 100vw"
              className="object-cover"
              style={{ objectPosition: story.image.position }}
            />
          </ScrollParallax>
        </Reveal>

        <Reveal className="desktop:col-start-1 desktop:row-start-2">
          <div className="prose-article mx-auto desktop:mx-0">
            {story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
