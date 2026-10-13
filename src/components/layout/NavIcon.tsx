// Icon cho từng mục menu, tra theo mã `icon` khai báo trong src/config/site.ts (navGroups).
// Thêm icon mới: vẽ ở src/components/ui/Icon.tsx rồi thêm 1 dòng vào bảng dưới và vào kiểu NavIconId.
import type { NavIconId } from "@/config/site";
import { BookIcon, NotesIcon, HomeIcon } from "@/components/ui/Icon";

const icons: Record<NavIconId, typeof HomeIcon> = {
  home: HomeIcon,
  book: BookIcon,
  blog: NotesIcon,
};

export function NavIcon({ id, size = 20 }: { id: NavIconId; size?: number }) {
  const Cmp = icons[id];
  return <Cmp size={size} />;
}
