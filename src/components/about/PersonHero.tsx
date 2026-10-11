// Hero Trang chủ cá nhân (dải tối `inverse`, đáy nét cọ; họa tiết nền ở HeroBackdrop với chữ viền = tên ngắn). Một CTA chính: "Đăng ký nhận bài".
// 375: 1 cột căn giữa (chân dung, tên, định vị, nút, icon) · 768: 2 cột (chân dung trái, chữ phải căn trái) · 1024+: chữ trái, chân dung lớn bên phải.
// Chân dung là sân khấu 3D (PortraitStage): ảnh + vòng tròn + khung ở các độ sâu khác nhau, nghiêng theo con trỏ / thanh cuộn.
// Tiêu đề hiện từng chữ, các phần còn lại nổi lên lần lượt (CSS `anim-*`, chạy ngay khi vẽ).
import Image from "next/image";
import { profile, shelf } from "@/config/profile";
import { Button } from "@/components/ui/Button";
import { BookCover } from "@/components/ui/Media";
import { ArrowRightIcon } from "@/components/ui/Icon";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { PortraitStage } from "@/components/about/PortraitStage";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export function PersonHero() {
  const words = profile.name.split(" ");
  const reading = shelf.books[0].title;

  return (
    <div className="wrap grid items-center gap-x-s7 gap-y-s7 pt-s5 pb-[calc(var(--brush-h)+var(--space-7))] tablet:grid-cols-2 tablet:pb-[calc(var(--brush-h)+var(--space-8))] desktop:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] desktop:pt-s7">
      {/* Chữ: SEO đọc trước chân dung; trên màn nhỏ chân dung được đặt lên đầu bằng `order` */}
      <div className="order-2 text-center tablet:text-left desktop:order-1">
        <p className="type-eyebrow anim-fade-rise inline-flex items-center gap-s2 uppercase text-on-inverse-soft" style={delay(80)}>
          <span aria-hidden className="block size-1.5 rotate-45 rounded-[1px] bg-accent-warm" />
          Xin chào, mình là
        </p>
        <h1 className="type-display-xl mt-s3 text-balance">
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className="word-mask mr-[0.22em]">
              <span className="anim-word" style={{ "--i": i } as React.CSSProperties}>
                {w}
              </span>
            </span>
          ))}
        </h1>
        <p className="type-dek anim-fade-rise mx-auto mt-s4 max-w-xl text-on-inverse-soft tablet:mx-0" style={delay(420)}>
          {profile.positioning}
        </p>
        <div className="anim-fade-rise" style={delay(540)}>
          <Button href="#dang-ky" variant="on-inverse" className="mt-s5 w-full tablet:w-auto">
            Đăng ký nhận bài
            <ArrowRightIcon />
          </Button>
        </div>
        <div className="anim-fade-rise mt-s5" style={delay(660)}>
          <p className="type-caption text-on-inverse-soft">Theo dõi mình</p>
          <SocialIcons featured="zalo" onDark className="mt-s3 justify-center tablet:justify-start" />
        </div>
      </div>

      {/* Chân dung 3D */}
      <div
        className="anim-pop order-1 mx-auto w-full max-w-[19rem] px-s4 tablet:max-w-[22rem] desktop:order-2 desktop:ml-auto desktop:max-w-[28rem]"
        style={delay(200)}
      >
        <PortraitStage
          photo={
            <Image
              src={profile.portrait.src}
              alt={profile.portrait.alt}
              fill
              priority
              sizes="(min-width: 1024px) 448px, (min-width: 768px) 352px, 304px"
              className="object-cover"
              style={{ objectPosition: profile.portrait.position }}
            />
          }
          book={<BookCover fluid title={reading} seed={reading} />}
          badge={
            <div className="rounded-md surface-raised p-s3 text-ink tablet:p-s4">
              <p className="type-eyebrow uppercase text-ink-faint">Đang đọc</p>
              <p className="type-title mt-s1 line-clamp-1">{reading}</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
