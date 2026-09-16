/**
 * P0.VR.DESIGNBENCH.OPUS-DIRECT1 — inline SVG icon set for the isolated Opus
 * direct reconstruction. Real DOM/SVG only; no sliced reference raster.
 */

type IconProps = { readonly className?: string };

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function TodIconMenu({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={2}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </g>
    </svg>
  );
}

export function TodIconCaretDown({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 9h14l-7 7.5z" fill="currentColor" />
    </svg>
  );
}

export function TodIconChevronUp({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 15 12 8 19 15" {...STROKE} strokeWidth={2} />
    </svg>
  );
}

export function TodIconChevronRight({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9.5 5 16.5 12 9.5 19" {...STROKE} strokeWidth={2.4} />
    </svg>
  );
}

export function TodIconEllipsisVertical({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <circle cx="12" cy="5" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="12" cy="19" r="1.7" />
      </g>
    </svg>
  );
}

/* Handset outline traced from the golden: 13 x 22 body, speaker slot, home mark. */
export function TodIconPhone({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 13 22" aria-hidden="true" focusable="false">
      <rect x="0.75" y="0.75" width="11.5" height="20.5" rx="1.8" {...STROKE} strokeWidth={1.5} />
      <path d="M4.9 3.05h3.2" {...STROKE} strokeWidth={1.1} />
      <path d="M5.2 19.1h2.6" {...STROKE} strokeWidth={1.3} />
    </svg>
  );
}

/* Tablet: same construction, wider body, no home mark. */
export function TodIconTablet({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 22" aria-hidden="true" focusable="false">
      <rect x="0.75" y="0.75" width="16.5" height="20.5" rx="1.8" {...STROKE} strokeWidth={1.5} />
      <path d="M7 3.05h4" {...STROKE} strokeWidth={1.1} />
    </svg>
  );
}

/* Monitor traced from the golden: 34 x 20 bezel, 6-wide neck, 12-wide base. */
export function TodIconDesktop({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 34 23" aria-hidden="true" focusable="false">
      <rect x="0.7" y="0.7" width="32.6" height="18.6" rx="1" {...STROKE} strokeWidth={1.4} />
      <path d="M17 19.3v3.1" {...STROKE} strokeWidth={5} />
      <path d="M11 22.4h12" {...STROKE} strokeWidth={1.6} />
    </svg>
  );
}

export function TodIconLock({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.6" y="10.6" width="16.8" height="11.4" rx="1.8" {...STROKE} strokeWidth={2.1} />
      <path d="M7.3 10.6V6.9a4.7 4.7 0 0 1 9.4 0v3.7" {...STROKE} strokeWidth={2.1} />
      <circle cx="12" cy="15.1" r="1.7" fill="currentColor" />
      <path d="M12 15.6v3" {...STROKE} strokeWidth={2.1} />
    </svg>
  );
}

export function TodIconLockOpen({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" {...STROKE} />
      <path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7" {...STROKE} />
    </svg>
  );
}

export function TodIconCheck({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 12.8 9.5 18 19.5 6.5" {...STROKE} strokeWidth={2.4} />
    </svg>
  );
}

export function TodIconCheckCircle({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M7 12.4 10.6 16 17.2 8.6" fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TodIconWarnCircle({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 6.4v7.2" fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.35" fill="#ffffff" />
    </svg>
  );
}

export function TodIconDot({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
    </svg>
  );
}

export function TodIconSliders({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.8}>
        <path d="M2.5 6.5h19M2.5 12h19M2.5 17.5h19" />
        <circle cx="9" cy="6.5" r="2.4" fill="#ffffff" />
        <circle cx="16" cy="12" r="2.4" fill="#ffffff" />
        <circle cx="10.5" cy="17.5" r="2.4" fill="#ffffff" />
      </g>
    </svg>
  );
}

export function TodIconCycle({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.9}>
        <path d="M4 10.5a8 8 0 0 1 13.4-3.6L20 9.4" />
        <path d="M20 4.6v4.8h-4.8" />
        <path d="M20 13.5a8 8 0 0 1-13.4 3.6L4 14.6" />
        <path d="M4 19.4v-4.8h4.8" />
      </g>
    </svg>
  );
}

export function TodIconInspect({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.8}>
        <circle cx="10.8" cy="10.8" r="7.3" />
        <circle cx="10.8" cy="10.8" r="3" />
        <path d="M16.2 16.2 21 21" strokeWidth={2.2} />
      </g>
    </svg>
  );
}

export function TodIconExpand({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={2}>
        <path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15" />
        <path d="M3.5 3.5 9.5 9.5M20.5 3.5 14.5 9.5M20.5 20.5 14.5 14.5M3.5 20.5 9.5 14.5" strokeWidth={1.5} />
      </g>
    </svg>
  );
}

export function TodIconCompare({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.8}>
        <path d="M2.5 8h19M2.5 16h19" />
        <circle cx="8" cy="8" r="2.3" fill="#ffffff" />
        <circle cx="16" cy="16" r="2.3" fill="#ffffff" />
      </g>
    </svg>
  );
}

export function TodIconDoc({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.7}>
        <path d="M6 2.8h8.2L19 7.6V21.2H6z" />
        <path d="M13.8 2.8v5h5" />
        <path d="M9 12.5h7M9 15.5h7M9 18.2h4.5" strokeWidth={1.4} />
      </g>
    </svg>
  );
}

export function TodIconDocGear({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.7}>
        <path d="M6 2.8h8.2L19 7.6V21.2H6z" />
        <path d="M13.8 2.8v5h5" />
        <path d="M9.4 13.4h5.2M9.4 16.6h5.2" strokeWidth={1.4} />
      </g>
    </svg>
  );
}

export function TodIconGrid({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <rect x="3" y="3" width="7.6" height="7.6" rx="1.4" />
        <rect x="13.4" y="3" width="7.6" height="7.6" rx="1.4" />
        <rect x="3" y="13.4" width="7.6" height="7.6" rx="1.4" />
        <rect x="13.4" y="13.4" width="7.6" height="7.6" rx="1.4" />
      </g>
    </svg>
  );
}

export function TodIconHistory({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.7}>
        <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1L3.4 8.6" />
        <path d="M3.2 4.4v4.4h4.4" />
        <path d="M12 7.6V12l3.1 1.9" />
      </g>
    </svg>
  );
}

export function TodIconDocArrow({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.7}>
        <rect x="3.2" y="3.2" width="13" height="17.6" rx="2" />
        <path d="M6.6 8.4h6.2M6.6 12h4" strokeWidth={1.4} />
        <circle cx="17.4" cy="16.4" r="4.2" fill="currentColor" stroke="none" />
        <path d="M15.6 16.4h3.6M17.9 15.1l1.3 1.3-1.3 1.3" stroke="#ffffff" strokeWidth={1.3} />
      </g>
    </svg>
  );
}

export function TodIconShieldCheck({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g {...STROKE} strokeWidth={1.7}>
        <circle cx="12" cy="12" r="9.2" />
        <path d="M7.8 12.4 10.8 15.4 16.4 9" strokeWidth={1.9} />
      </g>
    </svg>
  );
}

export function TodIconBolt({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.2 1.6 4.6 14.1h5.9l-1 8.3 9.9-12.8h-6.1z" fill="currentColor" />
    </svg>
  );
}

/** Archival ink silhouette used in place of the founder's pointing-hand plate photograph. */
export function TodPointingHandPlate({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 120 210" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <g fill="#111010">
        <path d="M54.5 8c5.6 0 9.4 4.2 9.6 10l1.4 63.4 4.6-2.6c4.2-2.4 9-2.2 12.2.6 2.5 2.2 3.4 5.2 2.9 8.6l5.1 1.2c5.3 1.3 8.3 5.5 7.6 10.8l-.2 1.3 3.2 1.8c4.5 2.6 6.2 7.4 4.6 12.4l-8.6 26.8c-4.4 13.8-11.4 24.8-21.4 33.2l-2.4 2v14.2H36.2V176l-3.6-3.4c-8.4-8-13.6-17.2-16.6-27.8L9.4 120c-1.8-6.4 1-11.8 6.6-13.6 5-1.6 9.8.4 12.6 5l6.8 11 .8-52.6.6-51.2C36.8 12.4 40.6 8 46.2 8z" />
      </g>
    </svg>
  );
}
