"use client";

// Menu ngăn kéo cho màn hình dưới 768px: trượt từ trái, chiếm 70% bề ngang (30% bên phải còn thấy nội dung), KHÔNG phủ tối phần bên phải
// để người đọc vẫn thấy nội dung. Dữ liệu lấy từ `getNavGroups()` (src/lib/nav.ts: menu tĩnh ở src/config/site.ts + chủ đề từ content/topics): thêm trang / nhóm ở đó là tự có mặt ở đây,
// đường kẻ ngang giữa các nhóm do component này tự vẽ. Mục có `children` thu gọn sẵn, bấm mới xổ ra.
import { useUiLabels } from "@/frontend/components/ui/UiLabels";
import Link from "next/link";
import { useState } from "react";
import type { NavGroup, NavItem } from "@/shared/config/site";
import { ChevronDownIcon } from "@/frontend/components/ui/Icon";
import { NavIcon } from "@/frontend/components/layout/NavIcon";

const row =
  "type-ui-body tap flex w-full items-center gap-s3 rounded-sm px-s3 text-left no-underline transition-colors duration-(--motion-fast) hover:bg-current/10 aria-[current=page]:bg-current/10 aria-[current=page]:font-semibold";

export function MobileMenu({
  id,
  open,
  pathname,
  groups,
}: {
  id: string;
  open: boolean;
  pathname: string;
  groups: NavGroup[];
}) {
  const ui = useUiLabels();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Đóng menu thì thu gọn mọi mục, lần mở sau luôn thu gọn sẵn
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setExpanded({});
  }
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const renderItem = (item: NavItem) => {
    if (!item.children?.length) {
      return (
        <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={row}>
          <NavIcon id={item.icon} />
          {item.label}
        </Link>
      );
    }
    const isOpen = !!expanded[item.href];
    const subId = `${id}-${item.href.replace(/\W/g, "") || "root"}`;
    return (
      <>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={subId}
          onClick={() => setExpanded((e) => ({ ...e, [item.href]: !e[item.href] }))}
          className={`${row} ${isActive(item.href) ? "font-semibold" : ""}`}
        >
          <NavIcon id={item.icon} />
          <span className="flex-1">{item.label}</span>
          <ChevronDownIcon
            className={`transition-transform duration-(--motion-fast) motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div
          id={subId}
          inert={!isOpen}
          className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          {/* Đường dọc bên trái danh sách con, thẳng hàng với tâm icon của mục cha (12px đệm + 10px nửa icon) */}
          <ul className="ml-[22px] overflow-hidden border-l-(length:--border-width) border-current/25">
            {item.children.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  aria-current={pathname === c.href ? "page" : undefined}
                  className={`${row} pl-[21px]`}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  };

  return (
    <div
      id={id}
      inert={!open}
      className={`absolute top-full left-0 h-[calc(100dvh-var(--header-height))] w-[70vw] group-data-[scrolled=true]/hdr:top-[calc(100%+var(--space-3)+var(--space-4))] group-data-[scrolled=true]/hdr:h-[calc(100dvh-var(--header-height)-var(--space-3)-var(--space-4))] overflow-y-auto overscroll-contain bg-(--hdr-bg) shadow-elevated-md transition-[transform,visibility] duration-(--motion-normal) ease-(--ease-smooth) motion-reduce:transition-none tablet:hidden ${
        open ? "visible translate-x-0" : "invisible -translate-x-full"
      }`}
    >
      <nav aria-label={ui.navMobile} className="px-s3 py-s3">
        {groups.map((g, i) => (
          <ul
            key={g.id}
            className={i > 0 ? "mt-s3 border-t-(length:--border-width) border-current/20 pt-s3" : undefined}
          >
            {g.items.map((item) => (
              <li key={item.href}>{renderItem(item)}</li>
            ))}
          </ul>
        ))}
      </nav>
    </div>
  );
}
