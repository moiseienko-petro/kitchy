import React from "react";

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

/* ---------- Base Icon Wrapper ---------- */

const BaseIcon = ({
  children,
  size = 20,
  strokeWidth = 2,
  className,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "block" }}
  >
    {children}
  </svg>
);

/* ---------- Trash ---------- */

export const TrashIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </BaseIcon>
);

/* ---------- Plus ---------- */

export const PlusIcon = (props: IconProps) => (
  <BaseIcon {...props} strokeWidth={3}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </BaseIcon>
);

/* ---------- Shopping Cart ---------- */

export const CartIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
    <path d="M3 3h2l2 13h11l2-9H6" />
  </BaseIcon>
);

/* ---------- Timer ---------- */

export const TimerIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2" />
    <path d="M9 2h6" />
  </BaseIcon>
);

export function ProductsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* box */}
      <path d="M4 7.5l8-4 8 4" />
      <path d="M4 7.5v9l8 4 8-4v-9" />
      <path d="M12 3.5v17" />

      {/* list marks on the box */}
      <path d="M8 10h2" />
      <path d="M8 13h2" />
      <path d="M8 16h2" />
    </svg>
  );
}

/* ---------- Close (X) ---------- */

export const CloseIcon = (props: IconProps) => (
  <BaseIcon {...props} strokeWidth={3}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </BaseIcon>
);

export const PlayIcon = (props: IconProps) => (
  <BaseIcon {...props} strokeWidth={2.5}>
    <polygon points="8 5 19 12 8 19 8 5" fill="currentColor" stroke="none" />
  </BaseIcon>
);

/* ---------- Pause ---------- */

export const PauseIcon = (props: IconProps) => (
  <BaseIcon {...props} strokeWidth={2.5}>
    <rect x="7" y="5" width="4" height="14" fill="currentColor" stroke="none" />
    <rect x="13" y="5" width="4" height="14" fill="currentColor" stroke="none" />
  </BaseIcon>
);

export function EditIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

/* ---------- Ukraine Flag ---------- */

export const UkraineFlag = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size * 0.66} viewBox="0 0 24 16">
    <rect width="24" height="8" fill="#0057b7" />
    <rect y="8" width="24" height="8" fill="#ffd700" />
  </svg>
);

/* ---------- UK Flag (simplified) ---------- */

export const UKFlag = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size * 0.66} viewBox="0 0 60 30">
    <clipPath id="clip">
      <rect width="60" height="30" />
    </clipPath>
    <g clipPath="url(#clip)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFF" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" />
      <rect x="25" width="10" height="30" fill="#FFF" />
      <rect y="10" width="60" height="10" fill="#FFF" />
      <rect x="27" width="6" height="30" fill="#C8102E" />
      <rect y="12" width="60" height="6" fill="#C8102E" />
    </g>
  </svg>
);