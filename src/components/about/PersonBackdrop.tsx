// Nền Hero Trang chủ cá nhân (dải tối `inverse`, chỉ token màu, aria-hidden). Ngôn ngữ "áp phích lưới": các đường dọc mảnh như cột lưới,
// Nền tĩnh (không chuyển động) để chân dung và tên khổng lồ ở PersonHero là điểm nhấn duy nhất.
export function PersonBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-on-inverse">
      <svg className="absolute inset-0 size-full opacity-[0.07]" focusable="false">
        <defs>
          <pattern id="hero-columns" width="160" height="8" patternUnits="userSpaceOnUse">
            <path d="M0.5 0v8" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-columns)" />
      </svg>

    </div>
  );
}
