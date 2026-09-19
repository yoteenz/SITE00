/**
 * P0.VR.6R1 — Canonical section icons for Design workspace tabs (no emoji).
 */

import {
  Site00CubeIcon,
  Site00DeployIcon,
  Site00LayersIcon,
  Site00MonitorIcon,
  Site00ShieldIcon,
  Site00TokenIcon,
} from '../../icons/Site00HubIcons';
import type { Site00LineIconProps } from '../../icons/Site00IconFrame';

const SIZE = 14;

function Site00DocumentIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4h8l4 4v12H8V4zM16 4v4h4"
      />
    </svg>
  );
}

function Site00DatabaseIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <ellipse cx="12" cy="6" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
      />
    </svg>
  );
}

function Site00ClockIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <path fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" d="M12 8v4l3 2" />
    </svg>
  );
}

function Site00GearIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
      />
    </svg>
  );
}

function Site00PlayIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M9 7l10 5-10 5V7z" />
    </svg>
  );
}

function Site00ListIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

function Site00EyeIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
      />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

function Site00ImageIcon({ size = SIZE, className }: Site00LineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <path fill="none" stroke="currentColor" strokeWidth={1.5} d="M6 16l4-4 3 3 5-6" />
    </svg>
  );
}

export type DesignDwSectionIconId =
  | 'providers'
  | 'spend-guard'
  | 'presets'
  | 'storage'
  | 'output-rules'
  | 'automation'
  | 'quick-actions'
  | 'coverage'
  | 'clock'
  | 'eye'
  | 'image'
  | 'play'
  | 'list'
  | 'gear';

export function DesignDwSectionIcon({ iconId, className }: { iconId: DesignDwSectionIconId; className?: string }) {
  const props = { size: SIZE, className: className ?? 'site00-dw-v3-section-icon' };
  switch (iconId) {
    case 'providers':
      return <Site00CubeIcon {...props} />;
    case 'spend-guard':
      return <Site00ShieldIcon {...props} />;
    case 'presets':
      return <Site00DocumentIcon {...props} />;
    case 'storage':
      return <Site00DatabaseIcon {...props} />;
    case 'output-rules':
      return <Site00GearIcon {...props} />;
    case 'automation':
      return <Site00DeployIcon {...props} />;
    case 'quick-actions':
      return <Site00TokenIcon {...props} />;
    case 'coverage':
      return <Site00LayersIcon {...props} />;
    case 'clock':
      return <Site00ClockIcon {...props} />;
    case 'eye':
      return <Site00EyeIcon {...props} />;
    case 'image':
      return <Site00ImageIcon {...props} />;
    case 'play':
      return <Site00PlayIcon {...props} />;
    case 'list':
      return <Site00ListIcon {...props} />;
    case 'gear':
      return <Site00GearIcon {...props} />;
    default:
      return <Site00MonitorIcon {...props} />;
  }
}
