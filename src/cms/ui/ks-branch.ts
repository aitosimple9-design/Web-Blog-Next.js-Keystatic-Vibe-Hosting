// Nhánh đang soạn (chế độ GitHub: địa chỉ có dạng /keystatic/branch/<nhánh>/...; chế độ local không có) để API biết đọc / commit vào đâu
export function branchOf(): string | null {
  const m = location.pathname.match(/\/keystatic\/branch\/([^/]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}
