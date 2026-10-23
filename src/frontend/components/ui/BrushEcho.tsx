// Nét "vọng" của nền cọ: một vệt mảnh, nhạt, cùng hình mép cọ nhưng lệch xuống, nằm ngay dưới mép dải tối (lớp mực thứ hai).
// Đặt NGAY SAU phần tử có lớp `brush-bottom` (cùng cấp); phần tử đó phải có `z-10` để che phần nằm dưới nó. Trang trí thuần, ẩn với trình đọc màn hình.
import { brushStyle } from "@/frontend/lib/brush";

export function BrushEcho() {
  return <div aria-hidden className="brush-echo" style={brushStyle} />;
}
