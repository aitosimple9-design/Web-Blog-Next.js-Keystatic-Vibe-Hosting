"use client";

// Nút đổi theme Giấy / Đêm. Theme được đặt bằng script chạy TRƯỚC khi vẽ trang (xem layout.tsx) nên không nháy sáng.
import { useCallback, useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/frontend/components/ui/Icon";

type Theme = "light" | "dark";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    // Chưa chọn thủ công: theo hệ điều hành khi hệ điều hành đổi
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("theme")) return;
      } catch {}
      document.documentElement.dataset.theme = e.matches ? "dark" : "light";
      read();
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }, []);

  // Trước khi hydrate: giữ nhãn trung tính để SSR và client khớp nhau
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === null ? "Đổi theme" : dark ? "Chuyển sang theme Giấy (sáng)" : "Chuyển sang theme Đêm (tối)"}
      className={`tap inline-flex items-center justify-center rounded-sm transition-colors duration-(--motion-fast) hover:bg-current/10 ${className}`}
    >
      <span className="relative block size-5">
        <MoonIcon
          className={`absolute inset-0 transition-all duration-200 motion-reduce:transition-none ${
            dark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <SunIcon
          className={`absolute inset-0 transition-all duration-200 motion-reduce:transition-none ${
            dark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
