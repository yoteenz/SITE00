import { Site00LocationsNavIcon } from '../../icons/mobile-nav';

/** Small coordinate target — header accent on access pages. */
export function AccessTargetMark({ className = '' }: { className?: string }) {
  return (
    <span className={`site00-access-target ${className}`.trim()} aria-hidden="true">
      <Site00LocationsNavIcon size={18} className="site00-access-target__svg" />
    </span>
  );
}
