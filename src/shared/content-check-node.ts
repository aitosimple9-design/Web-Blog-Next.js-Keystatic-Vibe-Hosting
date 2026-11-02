// NGUỒN dữ liệu cho bộ luật src/shared/content-check.ts khi chạy bằng Node trên máy có ổ đĩa (và git):
//   - fsSource: đọc thư mục dự án; - gitBase: bản gốc (vd. main) qua git để so slug.
// Dùng chung cho scripts/check-content.mjs (npm run check-content, CI) và /api/kiem-tra ở chế độ local. Chỉ chạy phía server.
// KHÔNG import alias `@/` (script chạy bằng Node đọc thẳng .ts).
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BaseSource, CheckSource } from "./content-check.ts";

/** Nguồn = ổ đĩa ở thư mục `root` */
export function fsSource(root: string): CheckSource {
  return {
    list: (dir, ext) => {
      const abs = resolve(root, dir);
      try {
        return existsSync(abs) ? readdirSync(abs).filter((f) => f.endsWith(ext)) : [];
      } catch {
        return [];
      }
    },
    read: (rel) => {
      try {
        return readFileSync(resolve(root, rel), "utf8");
      } catch {
        return null;
      }
    },
    exists: (rel) => existsSync(resolve(root, rel)),
  };
}

/** Bản gốc `baseRef` (vd. "main", "origin/main") qua git ở `root`. `prBase` (GITHUB_BASE_REF trên CI): lấy thêm nhánh đích vì CI chỉ checkout 1 commit.
 *  Không có git / không có lịch sử của bản gốc thì trả `info` giải thích và base = null. */
export function gitBase(root: string, baseRef: string, opts: { prBase?: string; explicit?: boolean } = {}): { base: BaseSource | null; info?: string } {
  const git = (...a: string[]) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
  try {
    if (!opts.explicit && opts.prBase) {
      try {
        git("fetch", "--quiet", "--depth=1", "origin", opts.prBase); // checkout của CI chỉ lấy 1 commit nên phải lấy thêm nhánh đích
      } catch {
        /* thử dùng ref sẵn có */
      }
    }
    let ref = baseRef;
    try {
      git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
    } catch {
      if (!opts.explicit) ref = "FETCH_HEAD";
    }
    git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
    return {
      base: {
        label: baseRef,
        list: (dir, ext) => {
          try {
            return git("ls-tree", "--name-only", `${ref}:${dir}`)
              .split(/\r?\n/)
              .map((n) => n.trim())
              .filter((n) => n.endsWith(ext));
          } catch {
            return []; // thư mục không có ở bản gốc
          }
        },
        read: (rel) => {
          try {
            return git("show", `${ref}:${rel}`);
          } catch {
            return null;
          }
        },
      },
    };
  } catch {
    return { base: null, info: `Không so được slug với ${baseRef} (chưa có lịch sử git của nhánh đó); bỏ qua.` };
  }
}
