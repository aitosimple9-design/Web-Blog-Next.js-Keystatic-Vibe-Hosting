// Menu đầy đủ = menu ở Cài đặt → Header (mặc định src/config/site.ts) + danh sách chủ đề (content/topics) làm mục con của "Blog".
// Chạy phía server; client component nhận kết quả qua props (PageShell → HeaderBar → MobileMenu).
import type { NavGroup } from "@/shared/config/site";
import { getHeaderSettings } from "@/shared/content/settings";
import { getTopics } from "@/shared/content/topics";

export function getNavGroups(): NavGroup[] {
  const children = getTopics().map((t) => ({ label: t.name, href: `/blog/${t.slug}` }));
  // Chỉ mục "/blog" ĐẦU TIÊN nhận danh sách chủ đề (menu có 2 mục /blog thì không lặp danh sách, tránh trùng key)
  let given = false;
  return getHeaderSettings().navGroups.map((g) => ({
    ...g,
    items: g.items.map((i) => {
      if (i.href !== "/blog" || given) return i;
      given = true;
      return { ...i, children };
    }),
  }));
}
