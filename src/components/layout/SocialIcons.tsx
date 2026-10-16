// 7 icon mạng xã hội. URL cấu hình ở Cài đặt site (Keystatic); mặc định ở src/config/site.ts (Q14; URL demo). Chưa có URL thì hiển thị mờ, chưa bấm được.
// Dạng chip tròn nổi; hover: nhấc lên, nền gradient hiện dần, icon phóng, nhãn tên nền tảng nổi phía trên.
// Mặc định: mỗi chip 44px, hàng tự xuống dòng khi hết chỗ (chân trang).
// `featured` (Hero): MỘT hàng duy nhất, icon được chọn nằm giữa, to nhất và luôn có nền gradient; 6 chip còn lại nhỏ 36px
// (vùng bấm vẫn đủ 44px nhờ lớp mở rộng 5px mỗi phía tính từ mép trong của viền 1px: 34 + 10 = 44; hai vùng bấm kề nhau chạm sát; khoảng cách giữa các vòng 8px).
import type { SocialId } from "@/config/site";
import { getSiteSettings } from "@/lib/settings";
import { SocialIcon } from "@/components/ui/Icon";

export function SocialIcons({
  className = "",
  featured: wanted,
  onDark,
}: {
  className?: string;
  featured?: SocialId;
  /** Đặt trên dải nền tối (inverse): nút nổi bật đảo màu để không chìm vào nền */
  onDark?: boolean;
}) {
  const socialLinks = getSiteSettings().socials;
  // Icon nổi bật không có trong danh sách của Cài đặt site thì lấy icon ở giữa hàng
  const featured = wanted ? (socialLinks.find((l) => l.id === wanted) ?? socialLinks[Math.floor(socialLinks.length / 2)])?.id : undefined;
  // Đưa icon nổi bật vào vị trí chính giữa hàng
  const list = (() => {
    if (!featured) return socialLinks;
    const rest = socialLinks.filter((l) => l.id !== featured);
    const main = socialLinks.find((l) => l.id === featured);
    if (!main) return socialLinks;
    rest.splice(Math.floor(socialLinks.length / 2), 0, main);
    return rest;
  })();
  return (
    <ul
      className={`flex gap-s2 ${featured ? "flex-nowrap items-center" : "flex-wrap"} ${className}`}
      aria-label="Mạng xã hội"
    >
      {list.map((s) => {
        const big = featured === s.id;
        const small = !!featured && !big;
        return (
          <li key={s.id}>
            {s.href ? (
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} (mở trang mới)`}
                className={`group/soc relative isolate inline-flex items-center justify-center rounded-pill border-(length:--border-width) no-underline ${
                  big
                    ? `size-[60px] border-transparent shadow-elevated-md outline-1 outline-offset-4 outline-accent-warm/50 ${onDark ? "bg-on-inverse text-inverse" : "btn-grad-bg text-on-accent"}`
                    : `border-rule-strong bg-paper-raised text-ink-soft shadow-elevated-sm ${small ? "size-9 after:absolute after:-inset-[5px] after:content-['']" : "tap"}`
                }  transition-[transform,box-shadow,color,border-color] duration-(--motion-normal) ease-(--ease-smooth) hover:border-transparent hover:text-on-accent hover:shadow-elevated-md motion-safe:hover:-translate-y-1 active:scale-95`}
              >
                {/* Nền gradient hiện dần khi hover */}
                <span
                  aria-hidden
                  className="btn-grad-bg absolute inset-0 -z-10 rounded-pill opacity-0 transition-opacity duration-(--motion-normal) ease-(--ease-smooth) group-hover/soc:opacity-100 group-focus-visible/soc:opacity-100"
                />
                <SocialIcon
                  id={s.id}
                  size={big ? 32 : small ? 20 : 24}
                  className="transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover/soc:scale-110"
                />
                {/* Nhãn tên nền tảng nổi lên phía trên */}
                <span
                  aria-hidden
                  className="type-caption pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 translate-y-1 rounded-sm bg-ink px-s2 py-s1 whitespace-nowrap text-paper opacity-0 shadow-elevated-sm transition-[opacity,transform] duration-(--motion-fast) ease-(--ease-smooth) group-hover/soc:translate-y-0 group-hover/soc:opacity-100 group-focus-visible/soc:translate-y-0 group-focus-visible/soc:opacity-100"
                >
                  {s.label}
                </span>
              </a>
            ) : (
              <span
                role="img"
                aria-label={`${s.label} (chưa có liên kết)`}
                className="tap inline-flex items-center justify-center rounded-sm opacity-50"
              >
                <SocialIcon id={s.id} />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
