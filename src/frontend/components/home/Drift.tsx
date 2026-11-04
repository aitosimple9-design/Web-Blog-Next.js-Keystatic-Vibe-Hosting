"use client";

// Lớp trôi theo thanh cuộn (thị sai): dịch chuyển dọc từ `from` tới `to` (px) khi cuộn 0 → 700px.
// Chỉ transform, tắt khi giảm chuyển động. Dùng ở Hero Trang chủ cá nhân: tên trôi lên nhanh hơn người nên có chiều sâu.
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/frontend/lib/reduced-motion";
import type { ReactNode } from "react";

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
  const reduce = useReducedMotionSafe();
  const still = useMotionValue(from);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [from, to]);
  return (
    <motion.div className={className} style={{ y: reduce ? still : y }}>
      {children}
    </motion.div>
  );
}
