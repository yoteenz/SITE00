import type { Site00LineIconProps } from './Site00IconFrame';

const STROKE = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ClientAppHomeIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}

export function ClientAppProjectIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 6h4v12H4zM10 10h4v8h-4zM16 4h4v14h-4z" />
    </svg>
  );
}

export function ClientAppReviewsIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...STROKE} cx="12" cy="12" r="8" />
      <path {...STROKE} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity="0" />
      <path {...STROKE} d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ClientAppInboxIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect {...STROKE} x="3" y="6" width="18" height="12" rx="1" />
      <path {...STROKE} d="M3 8l9 6 9-6" />
    </svg>
  );
}

export function ClientAppLibraryIcon({ size = 22, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...STROKE} d="M4 4h7l2 3h7v13H4V4z" />
    </svg>
  );
}

export { ClientRoomDiamondIcon as ClientAppDiamondIcon } from './ClientProjectRoomNavIcons';
