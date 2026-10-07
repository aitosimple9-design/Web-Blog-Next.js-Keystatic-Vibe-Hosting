"use client";

// Form đăng ký nhận bài — component DUY NHẤT, dùng ở cả 3 trang (CLAUDE.md mục 6).
// 375: chữ rồi form, mỗi ô một hàng · 768: Họ tên + Số điện thoại cùng hàng · 1024+: chữ trái, form phải.
// Q11 (chưa chốt): form CHƯA gửi dữ liệu đi đâu. Hàm `submitSubscription` là chỗ duy nhất cần nối backend.
import { useId, useRef, useState, type FormEvent } from "react";
import { AlertIcon, CheckIcon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

type Fields = { name: string; phone: string; email: string };
type Errors = Partial<Record<keyof Fields, string>>;

const perks = ["Ý chính, ví dụ và cách áp dụng", "Đọc trong khoảng 10 phút", "Hủy đăng ký bất cứ lúc nào"];

function validate(v: Fields): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Nhập họ tên của bạn để chúng tôi biết cách xưng hô.";
  if (!v.email.trim()) e.email = "Nhập email để nhận bài mới.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    e.email = "Email chưa đúng định dạng, ví dụ: ban@example.com.";
  const phone = v.phone.replace(/[\s.\-()]/g, "");
  if (phone && !/^(\+?84|0)\d{9,10}$/.test(phone))
    e.phone = "Số điện thoại chưa đúng, ví dụ: 0912 345 678. Bạn có thể bỏ trống ô này.";
  return e;
}

// TODO(Q11): thay bằng lời gọi thật (Route Handler / dịch vụ email). Hiện chỉ giả lập độ trễ.
async function submitSubscription(data: Fields): Promise<void> {
  void data;
  await new Promise((r) => setTimeout(r, 700));
}

export function Newsletter({ className = "" }: { className?: string }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Fields>({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    const first = (["name", "phone", "email"] as const).find((k) => errs[k]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    await submitSubscription(values);
    setStatus("success");
  }

  const field = (
    k: keyof Fields,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
    span?: boolean,
  ) => {
    const id = `${uid}-${k}`;
    const err = errors[k];
    return (
      <div className={span ? "tablet:col-span-2" : ""}>
        <label htmlFor={id} className="type-label mb-s2 block">
          {label}
        </label>
        <input
          id={id}
          name={k}
          value={values[k]}
          onChange={set(k)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-err` : undefined}
          className={`type-ui-body tap block w-full rounded-sm bg-paper-raised px-s4 text-ink placeholder:text-ink-faint ${
            err
              ? "border-(length:--border-width-strong) border-accent-strong"
              : "border-(length:--border-width) border-rule-strong"
          }`}
          {...props}
        />
        {err ? (
          <p id={`${id}-err`} className="type-caption mt-s2 flex items-start gap-s2 text-ink">
            <AlertIcon className="mt-[2px] shrink-0" />
            <span>{err}</span>
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <section aria-labelledby={`${uid}-title`} className={`bg-paper text-ink ${className}`}>
      <div className="wrap py-s7 tablet:py-s9">
        <div className="relative overflow-hidden rounded-lg bg-paper-sunk p-s5 tablet:p-s6 desktop:grid desktop:grid-cols-[1fr_1.05fr] desktop:items-center desktop:gap-s8 desktop:p-s8">
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="pointer-events-none absolute -top-16 -right-16 size-56 text-rule-strong opacity-35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="100" cy="100" r="96" />
            <circle cx="100" cy="100" r="72" />
            <circle cx="100" cy="100" r="48" />
          </svg>

          <div className="relative">
            <p className="type-eyebrow uppercase text-ink-soft">Bản tin</p>
            <h2 id={`${uid}-title`} className="type-display-md mt-s2">
              Nhận bài mới qua email
            </h2>
            <p className="type-dek mt-s3 text-ink-soft">
              Mỗi tuần một bài ghi chép sau khi đọc sách, gửi thẳng vào hộp thư của bạn.
            </p>
            <ul className="mt-s5 grid gap-s3">
              {perks.map((p) => (
                <li key={p} className="type-ui-body flex items-center gap-s3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-accent text-on-accent">
                    <CheckIcon size={14} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-s6 rounded-md bg-paper-raised p-s5 desktop:mt-0">
            {status === "success" ? (
              <div role="status" className="animate-fade-up py-s4 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-pill bg-accent text-on-accent">
                  <CheckIcon size={24} />
                </span>
                <h3 className="type-display-sm mt-s4">Đã nhận đăng ký</h3>
                <p className="type-ui-body mt-s2 text-ink-soft">
                  Cảm ơn {values.name.trim() || "bạn"}. Bài mới sẽ được gửi tới {values.email.trim()}.
                </p>
                {process.env.NODE_ENV !== "production" ? (
                  <p className="type-caption mt-s3 text-ink-faint">
                    Chế độ thử: dữ liệu chưa được lưu hay gửi đi (chờ quyết định Q11).
                  </p>
                ) : null}
                <Button
                  variant="secondary"
                  className="mt-s5"
                  onClick={() => {
                    setValues({ name: "", phone: "", email: "" });
                    setStatus("idle");
                  }}
                >
                  Đăng ký email khác
                </Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={status === "sending"}>
                <p className="type-ui-strong mb-s4">Đăng ký nhận bài</p>
                <div className="grid gap-s4 tablet:grid-cols-2">
                  {field("name", "Họ tên", { type: "text", autoComplete: "name", placeholder: "Nguyễn Văn A" })}
                  {field("phone", "Số điện thoại (không bắt buộc)", {
                    type: "tel",
                    autoComplete: "tel",
                    inputMode: "tel",
                    placeholder: "09xx xxx xxx",
                  })}
                  {field(
                    "email",
                    "Email",
                    { type: "email", autoComplete: "email", inputMode: "email", placeholder: "ban@example.com" },
                    true,
                  )}
                </div>
                <Button type="submit" wide className="mt-s5" disabled={status === "sending"}>
                  {status === "sending" ? "Đang gửi…" : "Đăng ký"}
                </Button>
                <p className="type-caption mt-s3 text-ink-faint">Chỉ gửi bài mới, không quảng cáo.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
