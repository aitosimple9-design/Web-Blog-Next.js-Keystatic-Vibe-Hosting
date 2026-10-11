// Hero Trang chủ cá nhân, bố cục TRUNG TÂM (dải tối `inverse`, đáy nét cọ; nền lưới dọc ở PersonBackdrop). Một CTA chính: "Đăng ký nhận bài".
// Các lớp từ sau ra trước: tên khổng lồ (HeroName, nằm SAU người) · chấm tròn phẳng `accent-warm` · chân dung xóa phông (nền trong suốt) ·
// chữ + CTA + icon (trái) và hai thẻ kính mờ số liệu (phải) · cánh cửa mở đầu trang (HeroCurtain, tách riêng, chạy một lần).
// 375 / 768: sân khấu (tên + người) ở trên, chữ + thẻ số liệu xếp dọc bên dưới · 1024+: chữ ở góc dưới trái, thẻ kính ở góc dưới phải, người ở giữa.
// Chuyển động: cửa mở, người phóng về đúng cỡ, tên trượt lên từng chữ cái; sau đó cả cảnh nghiêng nhẹ + các lớp trôi theo con trỏ (chỉ chuột),
// tên / chấm tròn trôi theo thanh cuộn (Drift). Chỉ transform + opacity, tắt khi giảm chuyển động.
import Image from "next/image";
import type { CSSProperties } from "react";
import { profile } from "@/config/profile";
import { brushStyle } from "@/lib/brush";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { CountUp, PointerLayer, PointerScene } from "@/components/ui/Motion";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { Drift } from "@/components/about/Drift";
import { HeroCurtain } from "@/components/about/HeroCurtain";
import { HeroName } from "@/components/about/HeroName";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;
// --pw: bề rộng người · --ph: chiều cao người (tỉ lệ ảnh 1100x1587) · --bh: chiều cao nét cọ ở đáy dải
const vars = {
  "--pw": "clamp(15rem, 41vw, 30rem)",
  "--ph": "calc(var(--pw) * 1.443)",
  "--bh": "clamp(40px, 5.5vw, 64px)",
} as CSSProperties;

const glass =
  "rounded-lg border-(length:--border-width) border-on-inverse/25 bg-on-inverse/10 shadow-elevated-md backdrop-blur-md";

export function PersonHero({ stats }: { stats: { posts: number; topics: number } }) {
  return (
    <div className="relative [perspective:1800px]" style={vars}>
      <PointerScene tilt={2.5}>
        <div className="wrap relative pb-[calc(var(--bh)+var(--space-7))] desktop:pb-0">
          {/* Sân khấu: tên (sau) · chấm tròn · người (trước) */}
          <div className="relative h-[calc(var(--ph)+3.25rem+var(--nh))] [--nh:7rem] tablet:[--nh:0rem]">
            <p className="type-eyebrow anim-fade-rise absolute inset-x-0 top-s2 z-10 flex items-center justify-center gap-s2 uppercase text-on-inverse-soft" style={delay(900)}>
              <span aria-hidden className="block size-1.5 rotate-45 rounded-[1px] bg-accent-warm" />
              Xin chào, mình là
            </p>

            <Drift from={0} to={-24} className="pointer-events-none absolute inset-0">
              <span aria-hidden className="absolute top-[calc(3.25rem+var(--nh)+var(--ph)*0.3)] left-1/2 size-[calc(var(--pw)*0.92)] -translate-x-1/2 rounded-pill bg-accent-warm" />
            </Drift>

            <Drift from={0} to={-56} className="pointer-events-none absolute inset-0 z-[1]">
              <PointerLayer depth={-18} className="absolute inset-x-0 top-[3.25rem] tablet:top-[calc(3.25rem+var(--ph)*0.04)]">
                <HeroName name={profile.name} />
              </PointerLayer>
            </Drift>

            <PointerLayer depth={12} className="pointer-events-none absolute inset-0 z-[2]">
              <div
                className="brush-bottom anim-person absolute bottom-0 left-1/2 aspect-[1100/1587] w-(--pw) -translate-x-1/2"
                style={{ ...brushStyle, ...delay(450) }}
              >
                <Image
                  src={profile.portrait.src}
                  alt={profile.portrait.alt}
                  width={profile.portrait.width}
                  height={profile.portrait.height}
                  priority
                  sizes="(min-width: 1024px) 480px, 41vw"
                  className="size-full object-contain"
                />
              </div>
            </PointerLayer>
          </div>

          {/* Chữ + CTA + icon: dưới sân khấu (375 / 768), góc dưới trái (1024+) */}
          <div
            className="anim-fade-rise z-10 mx-auto mt-s5 max-w-xl text-center desktop:absolute desktop:bottom-[calc(var(--bh)+var(--space-6))] desktop:left-0 desktop:mx-0 desktop:mt-0 desktop:w-[min(22rem,27%)] desktop:text-left"
            style={delay(1300)}
          >
            <p className="type-dek text-pretty text-on-inverse-soft">{profile.positioning}</p>
            <Button href="#dang-ky" variant="on-inverse" className="mt-s5 w-full tablet:w-auto desktop:w-full">
              Đăng ký nhận bài
              <ArrowRightIcon />
            </Button>
            <p className="type-caption mt-s5 text-on-inverse-soft">Theo dõi mình</p>
            <SocialIcons featured="zalo" onDark className="mt-s3 justify-center desktop:justify-start" />
          </div>

          {/* Thẻ kính mờ: số liệu thật, đếm từ nội dung */}
          <dl
            className="anim-fade-rise z-10 mx-auto mt-s6 grid max-w-xl grid-cols-2 gap-s3 desktop:absolute desktop:right-0 desktop:bottom-[calc(var(--bh)+var(--space-6))] desktop:mx-0 desktop:mt-0 desktop:w-[min(13rem,17%)] desktop:grid-cols-1"
            style={delay(1550)}
          >
            {[
              { value: stats.posts, suffix: "+", label: "Bài viết" },
              { value: stats.topics, suffix: "", label: "Chủ đề" },
            ].map((s) => (
              <div key={s.label} className={`${glass} px-s4 py-s4 text-on-inverse`}>
                <dd className="type-display-md tabular-nums">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
                <dt className="type-caption text-on-inverse-soft">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </PointerScene>

      <HeroCurtain left="T·N" right="H·N" />
    </div>
  );
}
