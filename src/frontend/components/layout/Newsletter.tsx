"use client";

// Form đăng ký nhận bài — component DUY NHẤT, dùng ở cả 3 trang (CLAUDE.md mục 6).
// 375: chữ rồi form, mỗi ô một hàng · 768: Họ tên + Số điện thoại cùng hàng · 1024+: chữ trái, form phải.
// Q11 (chưa chốt): form CHƯA gửi dữ liệu đi đâu. Hàm `submitSubscription` là chỗ duy nhất cần nối backend.
//
// Tương tác (docs/design-system/EXTENSIONS.md): nhãn một dòng + "Tùy chọn" tách riêng; icon đầu ô đổi màu và phóng nhẹ khi focus;
// gạch chân nhấn chạy từ trái sang phải khi focus; hover đổi viền; ô lỗi lắc một lần; các vòng trang trí trôi theo con trỏ;
// dấu tích thành công được "vẽ". Tất cả tắt khi giảm chuyển động.
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertIcon, CheckIcon, MailIcon, PhoneIcon, UserIcon } from "@/frontend/components/ui/Icon";
import { Button } from "@/frontend/components/ui/Button";
import { PointerLayer, PointerScene } from "@/frontend/components/ui/Motion";
import { newsletterDefaults, newsletterFormDefaults, type NewsletterForm } from "@/shared/config/site";
import type { NewsletterSettings } from "@/shared/content/settings";

type Fields = { name: string; phone: string; email: string };
type Errors = Partial<Record<keyof Fields, string>>;


function validate(v: Fields, m: NewsletterForm): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = m.errorNameRequired;
  if (!v.email.trim()) e.email = m.errorEmailRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    e.email = m.errorEmailInvalid;
  const phone = v.phone.replace(/[\s.\-()]/g, "");
  if (phone && !/^(\+?84|0)\d{9,10}$/.test(phone))
    e.phone = m.errorPhoneInvalid;
  return e;
}

// TODO(Q11): thay bằng lời gọi thật (Route Handler / dịch vụ email). Hiện chỉ giả lập độ trễ.
async function submitSubscription(data: Fields): Promise<void> {
  void data;
  await new Promise((r) => setTimeout(r, 700));
}

const icons: Record<keyof Fields, ReactNode> = {
  name: <UserIcon size={18} />,
  phone: <PhoneIcon size={18} />,
  email: <MailIcon size={18} />,
};

// Chữ của form lấy từ Cài đặt → Newsletter: nơi gọi (server) truyền `settings={getNewsletterSettings()}`; không truyền thì dùng mặc định.
const defaultSettings: NewsletterSettings = {
  ...newsletterDefaults,
  perks: [...newsletterDefaults.perks],
  form: newsletterFormDefaults,
};

export function Newsletter({
  className = "",
  settings = defaultSettings,
}: {
  className?: string;
  settings?: NewsletterSettings;
}) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Fields>({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  // Ghi nhận người dùng đang dùng chuột hay bàn phím để CSS (.field-premium) ẩn / hiện vòng focus cho đúng
  useEffect(() => {
    const root = document.documentElement;
    const onPointer = () => (root.dataset.modality = "pointer");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key.startsWith("Arrow")) root.dataset.modality = "keyboard";
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(values, settings.form);
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
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-s4 -translate-y-1/2 text-input-icon-color opacity-60 transition-[color,transform,opacity] duration-200 ease-in-out group-focus-within/field:scale-110 group-focus-within/field:text-accent group-focus-within/field:opacity-100 group-hover/field:opacity-80"
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
            className={`field-premium type-ui-body block h-11 w-full rounded-sm bg-paper-raised pl-11 text-ink placeholder:text-transparent focus:placeholder:text-ink-faint ${"pr-s4"} ${
              err
                ? "border-(length:--border-width-strong) border-accent-strong"
                : "border-(length:--border-width) border-rule-strong hover:border-ink-soft focus:border-accent"
            }`}
            {...props}
          />
          {/* Nhãn nổi: nằm trong ô như placeholder; khi focus hoặc đã nhập thì thu nhỏ, bay lên đè viền trên (chỉ transform) */}
          <label
            htmlFor={id}
            className={`type-label pointer-events-none absolute top-0 left-0 flex h-11 origin-left items-center whitespace-nowrap transition-[transform,color] duration-200 ease-in-out group-focus-within/field:text-ink ${
              values[k] ? "text-ink [&>span]:bg-paper-raised" : "text-ink-soft"
            } ${values[k] ? "translate-x-3 -translate-y-[22px] scale-[0.82]" : "translate-x-[40px] group-focus-within/field:translate-x-3 group-focus-within/field:-translate-y-[22px] group-focus-within/field:scale-[0.82] group-focus-within/field:[&>span]:bg-paper-raised"}`}
          >
            <span className="rounded-sm px-1 leading-none">{label}</span>
          </label>
          {opts?.optional ? (
            <span
              className={`type-caption pointer-events-none absolute top-0 right-3 -translate-y-1/2 rounded-sm bg-paper-raised px-1 leading-none whitespace-nowrap text-ink-faint transition-opacity duration-200 ease-in-out group-focus-within/field:opacity-100 ${values[k] ? "opacity-100" : "opacity-0"}`}
            >
              {settings.form.optionalTag}
            </span>
          ) : null}
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
        <PointerScene className="group/news relative overflow-hidden rounded-lg bg-paper-sunk shadow-elevated-lg p-s5 tablet:p-s6 desktop:grid desktop:grid-cols-[1fr_1.05fr] desktop:items-center desktop:gap-s8 desktop:p-s8">
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
            <p className="type-eyebrow uppercase text-ink-soft">{settings.eyebrow}</p>
            <h2 id={`${uid}-title`} className="type-display-md mt-s2">
              {settings.title}
            </h2>
            <p className="type-dek mt-s3 text-ink-soft">
              {settings.description}
            </p>
            <ul className="mt-s5 grid gap-s3">
              {settings.perks.map((p) => (
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

          <div className="relative mt-s6 rounded-md surface-raised surface-float border-(length:--border-width) border-rule p-s5 transition-[border-color] duration-(--motion-normal) hover:border-rule-strong focus-within:border-rule-strong desktop:mt-0">
            {status === "success" ? (
              <div role="status" className="animate-fade-up py-s4 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-pill bg-accent text-on-accent">
                  <span className="draw-check">
                    <CheckIcon size={26} />
                  </span>
                </span>
                <h3 className="type-display-sm mt-s4">{settings.form.successTitle}</h3>
                <p className="type-ui-body mt-s2 text-ink-soft">
                  {settings.form.successMessage
                    .replace("{name}", values.name.trim() || "bạn")
                    .replace("{email}", values.email.trim())}
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
                  {settings.form.resetLabel}
                </Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={status === "sending"}>
                <p className="type-ui-strong mb-s4">{settings.form.formTitle}</p>
                <div className="grid items-start gap-s4 tablet:grid-cols-2">
                  {field("name", settings.form.nameLabel, {
                    type: "text",
                    autoComplete: "name",
                    placeholder: settings.form.namePlaceholder,
                  })}
                  {field(
                    "phone",
                    settings.form.phoneLabel,
                    { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: settings.form.phonePlaceholder },
                    { optional: true },
                  )}
                  {field(
                    "email",
                    settings.form.emailLabel,
                    { type: "email", autoComplete: "email", inputMode: "email", placeholder: settings.form.emailPlaceholder },
                    { span: true },
                  )}
                </div>
                <Button type="submit" wide className="mt-s5" disabled={status === "sending"}>
                  {status === "sending" ? settings.form.sendingLabel : settings.submitLabel}
                </Button>
                <p className="type-caption mt-s3 text-ink-faint">{settings.form.note}</p>
              </form>
            )}
          </div>
        </PointerScene>
      </div>
    </section>
  );
}
