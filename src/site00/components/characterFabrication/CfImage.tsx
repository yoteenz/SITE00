/** Semantic asset slot. Renders the approved asset or a deliberate NAMED EMPTY SLOT — never fallback imagery. */
import { useEffect, useState } from 'react';

export function CfImage({ slotId, url, label, className = '' }: { slotId: string; url: string | null; label: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (url && !failed)
    return (
      <span className={`cf-img ${className}`} data-asset-slot={slotId} data-asset-state="filled">
        <img src={url} alt="" draggable={false} onError={() => setFailed(true)} />
      </span>
    );
  return (
    <span className={`cf-img cf-img--slot ${className}`} data-asset-slot={slotId} data-asset-state="missing" title={slotId}>
      <span className="cf-slot__corners" aria-hidden />
      <span className="cf-slot__label">{label}</span>
    </span>
  );
}
