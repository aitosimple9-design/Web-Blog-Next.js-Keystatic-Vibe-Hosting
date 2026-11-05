"use client";

// Lớp trôi theo thanh cuộn (thị sai): dịch chuyển dọc từ `from` tới `to` (px) khi cuộn 0 → 700px.
// Chỉ transform, tắt khi giảm chuyển động. Dùng ở Hero Trang chủ cá nhân: tên trôi lên nhanh hơn người nên có chiều sâu.
// Không dùng thư viện motion (tối ưu tốc độ 2026-11-05): `useScrollDrift` ghi transform qua ref.
import type { ReactNode } from "react";
import { useScrollDrift } from "@/frontend/components/ui/Motion";

export function Drift({
  children,
  from = 0,
  to = -40,
  className = "",
}: {
  children: ReactNode;
  from?: number;
  to?: number;
  className?: string;
}) {
  const ref = useScrollDrift<HTMLDivElement>(from, to);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
