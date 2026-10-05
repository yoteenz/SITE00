import type { Site00LineIconProps } from './Site00IconFrame';

const STROKE = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ClientRoomOverviewIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}

export function ClientRoomReviewsIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle {...STROKE} cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function ClientRoomLibraryIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

export function ClientRoomActivityIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 14l3-6 4 8 3-5 6 9" />
    </svg>
  );
}

export function ClientRoomMessagesIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect {...STROKE} x="3" y="6" width="18" height="12" rx="1" />
      <path {...STROKE} d="M3 8l9 6 9-6" />
    </svg>
  );
}

export function ClientRoomDiamondIcon({ size = 10, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <path fill="currentColor" d="M5 0L10 5 5 10 0 5z" />
    </svg>
  );
}

export function ClientRoomCheckIcon({ size = 14, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M5 12l4 4 10-10" />
    </svg>
  );
}

export function ClientRoomArrowIcon({ size = 14, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
