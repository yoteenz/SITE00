/** Decorative upper-right registration mark on Fast Travel UP NEXT primary cards. */
export function FastTravelUpNextRegistrationMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 13V5H13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M19 5H27V13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M27 19V27H19"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0"
      />
      <path
        d="M13 27H5V19"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0"
      />
    </svg>
  );
}
