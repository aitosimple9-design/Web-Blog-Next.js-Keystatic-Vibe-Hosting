// Menu đầy đủ = menu tĩnh (src/config/site.ts) + danh sách chủ đề (content/topics) làm mục con của "Blog".
// Chạy phía server; client component nhận kết quả qua props (PageShell → HeaderBar → MobileMenu).
import { navGroups, type NavGroup } from "@/config/site";
import { getTopics } from "@/lib/topics";

export function getNavGroups(): NavGroup[] {
  const children = getTopics().map((t) => ({ label: t.name, href: `/blog/${t.slug}` }));
  return navGroups.map((g) => ({
    ...g,
    items: g.items.map((i) => (i.href === "/blog" ? { ...i, children } : i)),
  }));
}
