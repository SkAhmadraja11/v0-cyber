// V0 Logo Component
export function V0Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="6"
        fill="currentColor"
      />
      <path
        d="M8 12L16 8L24 12L16 16L8 12Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M8 20L16 16L24 20L16 24L8 20Z"
        fill="white"
        opacity="0.7"
      />
      <path
        d="M16 8L16 24"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  )
}

export function V0LogoSmall({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="21"
        rx="4.5"
        fill="currentColor"
      />
      <path
        d="M6 9L12 6L18 9L12 12L6 9Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M6 15L12 12L18 15L12 18L6 15Z"
        fill="white"
        opacity="0.7"
      />
      <path
        d="M12 6L12 18"
        stroke="white"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  )
}

export function V0LogoLarge({ className = "" }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="12"
        fill="currentColor"
      />
      <path
        d="M16 24L32 16L48 24L32 32L16 24Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M16 40L32 32L48 40L32 48L16 40Z"
        fill="white"
        opacity="0.7"
      />
      <path
        d="M32 16L32 48"
        stroke="white"
        strokeWidth="3"
        opacity="0.5"
      />
    </svg>
  )
}
