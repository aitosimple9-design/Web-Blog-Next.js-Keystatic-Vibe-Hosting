"use client";

// Form đăng ký nhận bài — component DUY NHẤT, dùng ở cả 3 trang (CLAUDE.md mục 6).
// 375: chữ rồi form, mỗi ô một hàng · 768: Họ tên + Số điện thoại cùng hàng · 1024+: chữ trái, form phải.
// Q11 (chưa chốt): form CHƯA gửi dữ liệu đi đâu. Hàm `submitSubscription` là chỗ duy nhất cần nối backend.
//
// Tương tác (docs/design-system/EXTENSIONS.md): nhãn một dòng + "Tùy chọn" tách riêng; icon đầu ô đổi màu và phóng nhẹ khi focus;
// gạch chân nhấn chạy từ trái sang phải khi focus; hover đổi viền; ô lỗi lắc một lần; các vòng trang trí trôi theo con trỏ;
// dấu tích thành công được "vẽ". Tất cả tắt khi giảm chuyển động.
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertIcon, CheckIcon, MailIcon, PhoneIcon, UserIcon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PointerLayer, PointerScene } from "@/components/ui/Motion";

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

const icons: Record<keyof Fields, ReactNode> = {
  name: <UserIcon />,
  phone: <PhoneIcon />,
  email: <MailIcon />,
};

export function Newsletter({ className = "" }: { className?: string }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Fields>({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [shakeKey, setShakeKey] = useState(0);
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
      setShakeKey((n) => n + 1);
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
    opts?: { span?: boolean; optional?: boolean },
  ) => {
    const id = `${uid}-${k}`;
    const err = errors[k];
    return (
      <div key={`${k}-${err ? shakeKey : 0}`} className={`group/field ${opts?.span ? "tablet:col-span-2" : ""} ${err ? "anim-shake" : ""}`}>
        <div className="mb-s2 flex items-baseline justify-between gap-s3">
          <label
            htmlFor={id}
            className="type-label whitespace-nowrap text-ink-soft transition-colors duration-(--motion-fast) group-focus-within/field:text-ink"
          >
            {label}
          </label>
          {opts?.optional ? <span className="type-caption whitespace-nowrap text-ink-faint">Tùy chọn</span> : null}
        </div>
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-s4 -translate-y-1/2 text-ink-faint transition-[color,transform] duration-(--motion-normal) ease-(--ease-smooth) group-focus-within/field:scale-110 group-focus-within/field:text-accent group-hover/field:text-ink-soft"
          >
            {icons[k]}
          </span>
          <input
            id={id}
            name={k}
            value={values[k]}
            onChange={set(k)}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? `${id}-err` : undefined}
            className={`type-ui-body tap block w-full rounded-sm bg-paper-raised pr-s4 pl-11 text-ink transition-[border-color,background-color] duration-(--motion-fast) placeholder:text-ink-faint hover:bg-paper focus:bg-paper-raised ${
              err
                ? "border-(length:--border-width-strong) border-accent-strong"
                : "border-(length:--border-width) border-rule-strong hover:border-ink-soft focus:border-accent"
            }`}
            {...props}
          />
          {/* Gạch nhấn chạy từ trái sang phải khi focus */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-1 bottom-0 h-[2px] origin-left scale-x-0 rounded-pill bg-accent transition-transform duration-(--motion-normal) ease-(--ease-smooth) group-focus-within/field:scale-x-100"
          />
        </div>
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
        <PointerScene className="group/news relative overflow-hidden rounded-lg bg-paper-sunk p-s5 tablet:p-s6 desktop:grid desktop:grid-cols-[1fr_1.05fr] desktop:items-center desktop:gap-s8 desktop:p-s8">
          {/* Vòng trang trí trôi theo con trỏ */}
          <PointerLayer depth={16} className="pointer-events-none absolute -top-16 -right-16">
            <svg aria-hidden viewBox="0 0 200 200" className="size-56 text-rule-strong opacity-35" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="100" cy="100" r="96" />
              <circle cx="100" cy="100" r="72" />
              <circle cx="100" cy="100" r="48" />
            </svg>
          </PointerLayer>
          <PointerLayer depth={-12} className="pointer-events-none absolute -bottom-20 -left-16 hidden tablet:block">
            <svg aria-hidden viewBox="0 0 200 200" className="size-48 text-rule-strong opacity-25" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="100" cy="100" r="96" />
              <circle cx="100" cy="100" r="64" />
            </svg>
          </PointerLayer>

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
                <li
                  key={p}
                  className="group/perk type-ui-body flex items-center gap-s3 transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:hover:translate-x-1"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-accent text-on-accent transition-transform duration-(--motion-normal) ease-(--ease-smooth) motion-safe:group-hover/perk:scale-125">
                    <CheckIcon size={14} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-s6 rounded-md border-(length:--border-width) border-transparent bg-paper-raised p-s5 transition-[border-color] duration-(--motion-normal) hover:border-rule-strong focus-within:border-rule-strong desktop:mt-0">
            {status === "success" ? (
              <div role="status" className="animate-fade-up py-s4 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-pill bg-accent text-on-accent">
                  <span className="draw-check">
                    <CheckIcon size={26} />
                  </span>
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
                <div className="grid items-start gap-s4 tablet:grid-cols-2">
                  {field("name", "Họ tên", { type: "text", autoComplete: "name", placeholder: "Nguyễn Văn A" })}
                  {field(
                    "phone",
                    "Số điện thoại",
                    { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "09xx xxx xxx" },
                    { optional: true },
                  )}
                  {field(
                    "email",
                    "Email",
                    { type: "email", autoComplete: "email", inputMode: "email", placeholder: "ban@example.com" },
                    { span: true },
                  )}
                </div>
                <Button type="submit" wide className="mt-s5" disabled={status === "sending"}>
                  {status === "sending" ? "Đang gửi…" : "Đăng ký"}
                </Button>
                <p className="type-caption mt-s3 text-ink-faint">Chỉ gửi bài mới, không quảng cáo.</p>
              </form>
            )}
          </div>
        </PointerScene>
      </div>
    </section>
  );
}
