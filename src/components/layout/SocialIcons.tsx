// 7 icon mạng xã hội. URL cấu hình ở src/config/site.ts (Q14). Chưa có URL thì hiển thị mờ, chưa bấm được.
// Mỗi icon là vùng bấm 44x44px, cách nhau 8px; hàng tự xuống dòng khi hết chỗ (7 icon = 356px > 327px ở 375px).
import { socialLinks } from "@/config/site";
import { SocialIcon } from "@/components/ui/Icon";

export function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Mạng xã hội">
      {socialLinks.map((s) => (
        <li key={s.id}>
          {s.href ? (
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="tap inline-flex items-center justify-center rounded-sm transition-colors duration-(--motion-fast) hover:bg-current/10"
            >
              <SocialIcon id={s.id} />
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
      ))}
    </ul>
  );
}
