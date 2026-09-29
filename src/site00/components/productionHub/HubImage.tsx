/**
 * Asset-slot renderer. Renders the approved asset for a slot, or a deliberate NAMED EMPTY SLOT.
 * There is no fallback imagery of any kind: a missing asset is shown as missing.
 */
import { useEffect, useState } from 'react';

export function HubImage({
  slotId,
  url,
  label,
  className = '',
}: {
  slotId: string | null;
  url: string | null;
  /** Short human label for the empty state, e.g. "CAST PORTRAIT". */
  label: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (url && !failed) {
    return (
      <span className={`ph-img ${className}`} data-asset-slot={slotId ?? undefined} data-asset-state="filled">
        <img src={url} alt="" draggable={false} onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={`ph-img ph-img--slot ${className}`} data-asset-slot={slotId ?? undefined} data-asset-state="missing" title={slotId ?? label}>
      <span className="ph-slot__corners" aria-hidden />
      <span className="ph-slot__label">{label}</span>
    </span>
  );
}
