// Biểu tượng SVG một màu (currentColor), cỡ 16–20px theo Design System. Không dùng thư viện icon ngoài.
import type { SVGProps } from "react";
import type { SocialId } from "@/config/site";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, p: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...p,
});

export const MoonIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
);

export const SunIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const SearchIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

export const MenuIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronDownIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const HomeIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="m4 11 8-6.5 8 6.5M6 9.8V19h12V9.8" />
    <path d="M10 19v-5h4v5" />
  </svg>
);

export const ArrowRightIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const CheckIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2.25, ...p })}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const AlertIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.4v.1" />
  </svg>
);

export function SocialIcon({ id, size = 20, ...p }: P & { id: SocialId }) {
  switch (id) {
    case "youtube":
      return (
        <svg {...base(size, p)}>
          <rect x="3" y="6.5" width="18" height="11" rx="3.5" />
          <path d="m10.4 9.6 4.2 2.4-4.2 2.4z" fill="currentColor" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...base(size, p)}>
          <path d="M14 4v9.6a3.3 3.3 0 1 1-3.3-3.3" />
          <path d="M14 4c.4 2.3 1.9 3.8 4.3 4.1" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...base(size, p)}>
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.6" />
          <circle cx="16.8" cy="7.2" r=".7" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...base(size, p)} fill="currentColor" stroke="none">
          <path d="M13.6 21v-7.6h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.1H8v3h2.5V21z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...base(size, p)}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
          <path d="M8.2 10.5v5.8M8.2 7.9v.01M12 16.3v-5.8m0 2.6c0-1.6 1-2.7 2.5-2.7s2.2 1.1 2.2 2.7v3.1" />
        </svg>
      );
    case "x":
      // Logo X: hai nét chéo (đặc), vẽ theo logo chính thức
      return (
        <svg {...base(size, p)} fill="currentColor" stroke="none">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "zalo":
      // Logo Zalo: bong bóng chat đặc, chữ "Zalo" khoét rỗng bên trong
      return (
        <svg {...base(size, p)} fill="currentColor" stroke="none">
          <mask id="zalo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <rect width="24" height="24" fill="white" />
            <text x="12" y="13.6" textAnchor="middle" fontSize="7.4" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" fill="black">
              Zalo
            </text>
          </mask>
          <path mask="url(#zalo-mask)" d="M12 2.5c5.3 0 9.5 3.6 9.5 8.2s-4.2 8.2-9.5 8.2c-1 0-2-.1-2.9-.4L5 20.6l.9-3.6C3.9 15.6 2.5 13.3 2.5 10.7 2.5 6.1 6.7 2.5 12 2.5Z" />
        </svg>
      );
  }
}

export const UserIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.4-5.5 7-5.5s6.2 1.9 7 5.5" />
  </svg>
);

export const PhoneIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6.5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2 2A14 14 0 0 1 4.5 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const MailIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
  </svg>
);
