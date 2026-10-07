"use client";

// Ô tìm kiếm trên thanh đầu trang. Dưới 1024px là nút kính lúp mở một hàng nhập; từ 1024px mở rộng sẵn.
// Tìm trong tiêu đề, mô tả, chủ đề và tên sách (không phân biệt dấu). Q12: chức năng cơ bản, nâng cấp sau.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloseIcon, SearchIcon } from "@/components/ui/Icon";

export type SearchItem = { slug: string; title: string; description: string; topic: string; book: string };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

export function SearchBox({ index }: { index: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const term = fold(q.trim());
    if (term.length < 2) return [];
    const words = term.split(/\s+/);
    return index
      .filter((p) => {
        const hay = fold(`${p.title} ${p.description} ${p.topic} ${p.book}`);
        return words.every((w) => hay.includes(w));
      })
      .slice(0, 6);
  }, [q, index]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setFocused(false);
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const close = () => {
    setOpen(false);
    setFocused(false);
    setQ("");
  };
  const showPanel = focused && q.trim().length >= 2;

  return (
    <div ref={root} className="desktop:relative">
      <button
        type="button"
        aria-label={open ? "Đóng tìm kiếm" : "Tìm kiếm"}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="tap inline-flex items-center justify-center rounded-sm transition-colors duration-(--motion-fast) hover:bg-current/10 desktop:hidden"
      >
        {open ? <CloseIcon /> : <SearchIcon />}
      </button>

      <div
        className={`${open ? "block" : "hidden"} absolute inset-x-0 top-full bg-(--hdr-bg) px-(--gutter) py-s3 desktop:static desktop:block desktop:bg-transparent desktop:p-0`}
      >
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (results[0]) {
              router.push(`/bai-viet/${results[0].slug}`);
              close();
            }
          }}
        >
          <label className="tap flex w-full items-center gap-s2 rounded-pill border-(length:--border-width) border-rule-strong bg-paper-raised px-s4 text-ink focus-within:outline-(length:--focus-ring-width) focus-within:outline-accent desktop:w-60">
            <SearchIcon size={18} className="shrink-0 text-ink-faint" />
            <span className="sr-only-x">Tìm bài viết</span>
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
              }}
              placeholder="Tìm bài viết"
              autoComplete="off"
              enterKeyHint="search"
              aria-controls={listId}
              className="type-ui-body min-h-(--touch-target) min-w-0 flex-1 self-stretch bg-transparent outline-none placeholder:text-ink-faint"
            />
          </label>
        </form>

        <div
          id={listId}
          className={`${showPanel ? "block" : "hidden"} mt-s2 max-h-[60vh] overflow-auto rounded-md border-(length:--border-width) border-rule bg-paper-raised shadow-elevated-lg text-ink desktop:absolute desktop:top-[calc(100%+8px)] desktop:right-0 desktop:z-10 desktop:mt-0 desktop:w-96`}
        >
          {results.length ? (
            <ul>
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/bai-viet/${p.slug}`}
                    onClick={close}
                    className="tap block px-s4 py-s3 no-underline hover:bg-paper-sunk"
                  >
                    <span className="type-ui-strong block">{p.title}</span>
                    <span className="type-caption block text-ink-faint">
                      {p.topic} · {p.book}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-ui-body p-s4 text-ink-soft">Không tìm thấy bài phù hợp. Thử một từ khóa khác.</p>
          )}
        </div>
      </div>
    </div>
  );
}
