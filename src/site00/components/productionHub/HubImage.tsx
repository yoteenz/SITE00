/**
 * Asset-slot renderer. Renders the approved asset for a slot, or a deliberate NAMED EMPTY SLOT.
 * There is no fallback imagery of any kind: a missing asset is shown as missing.
 */
import { useEffect, useState } from 'react';
import { useWorkspaceCropGuard, workspaceMediaAttrs, type WorkspaceMediaProps } from '../productionAuthority/WorkspaceMediaSlot';

/**
 * HUB machine view media declarations (PANEL-MEDIA-GEOMETRY-REFINEMENT2). HUB is the media authority: these name the
 * asset type and HUB's own crop class (WORKSPACE_INTENTIONAL_CROPS) — they carry no geometry, HUB renders unchanged.
 */
export const HUB_MEDIA = {
  nodeChip: { role: 'REFERENCE_AUTHORITY', scale: 'CHIP', fit: 'THUMBNAIL_COVER', crop: 'NODE_ART_CHIP' },
  nodeCard: { role: 'REFERENCE_AUTHORITY', scale: 'TILE', fit: 'THUMBNAIL_COVER', crop: 'NODE_ART_CARD' },
  frameChip: { role: 'VIDEO_FRAME', scale: 'CHIP', fit: 'THUMBNAIL_COVER', crop: 'HUB_MACHINE_FRAME' },
  frameCard: { role: 'VIDEO_FRAME', scale: 'TILE', fit: 'LANDSCAPE_COVER', crop: 'HUB_MACHINE_FRAME' },
} as const satisfies Record<string, WorkspaceMediaProps>;

export function HubImage({
  slotId,
  url,
  label,
  className = '',
  slot,
  fit,
  focal,
  role,
  scale,
  aspect,
  crop,
}: {
  slotId: string | null;
  url: string | null;
  /** Short human label for the empty state, e.g. "CAST PORTRAIT". */
  label: string;
  className?: string;
} & WorkspaceMediaProps) {
  // media slot contract: only declared when the caller declares it (existing callers render unchanged)
  const media = slot || fit || focal || role ? workspaceMediaAttrs({ slot, fit, focal, role, scale, aspect, crop }) : {};
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  // a declared functional cover (here or on the wrapping Thumb / Img slot) never crops past its contract
  const guard = useWorkspaceCropGuard();
  if (url && !failed) {
    return (
      <span className={`ph-img ${className}`} {...media} data-asset-slot={slotId ?? undefined} data-asset-state="filled">
        <img ref={guard} src={url} alt="" draggable={false} onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={`ph-img ph-img--slot ${className}`} {...media} data-asset-slot={slotId ?? undefined} data-asset-state="missing" title={slotId ?? label}>
      <span className="ph-slot__corners" aria-hidden />
      <span className="ph-slot__label">{label}</span>
    </span>
  );
}
