import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  resolveWorkspaceMedia,
  type WorkspaceMediaFitMode,
  type WorkspaceMediaSlotType,
} from '../../config/production-workspace-density';

/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — shared media slot.
 *
 * The SLOT owns the geometry (aspect, size caps, radius); the asset only fills it. Fit is declared
 * (cover = intentional crop with a focal point, contain = never cropped). A missing or failed asset keeps the
 * slot's geometry and shows a named empty state instead of a broken-image icon.
 * Geometry / fit CSS: site00-production-workspace-density.css (§2 MEDIA SLOT CONTRACT).
 */

export type WorkspaceMediaProps = {
  /** Media slot type — defines the box. */
  slot?: WorkspaceMediaSlotType;
  /** Fit mode — defaults to the slot's default fit. */
  fit?: WorkspaceMediaFitMode;
  /** Focal position (object-position / background-position), e.g. `50% 20%`. Overrides the fit default. */
  focal?: string;
};

/** Data attributes + focal style every media-bearing element carries. */
export function workspaceMediaAttrs({ slot, fit, focal }: WorkspaceMediaProps): {
  'data-media-slot'?: WorkspaceMediaSlotType;
  'data-media-fit': WorkspaceMediaFitMode;
  style?: CSSProperties;
} {
  const resolved = resolveWorkspaceMedia(slot ?? 'ROW_THUMB', fit, focal);
  return {
    ...(slot ? { 'data-media-slot': slot } : {}),
    'data-media-fit': resolved.mode,
    ...(focal ? { style: { ['--pw-focal' as string]: focal } } : {}),
  };
}

export function WorkspaceMediaSlot({
  slot,
  fit,
  focal,
  src,
  alt = '',
  label,
  className = '',
  children,
  testId,
}: WorkspaceMediaProps & {
  slot: WorkspaceMediaSlotType;
  src: string | null | undefined;
  /** Alt text — empty for decorative media (existing pattern). */
  alt?: string;
  /** Label for the missing-asset state. */
  label?: string;
  className?: string;
  /** Overlay content (tags / chips) positioned inside the slot. */
  children?: ReactNode;
  testId?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const attrs = workspaceMediaAttrs({ slot, fit, focal });
  const missing = !src || failed;
  return (
    <span className={`pw-media ${className}`.trim()} {...attrs} data-testid={testId} data-media-state={missing ? 'missing' : 'filled'}>
      {missing ?
        <span className="ph-img ph-img--slot" data-asset-state="missing" title={label}>
          <span className="ph-slot__corners" aria-hidden />
          {label ? <span className="ph-slot__label">{label}</span> : null}
        </span>
      : <img src={src} alt={alt} draggable={false} loading="lazy" decoding="async" onError={() => setFailed(true)} />}
      {children}
    </span>
  );
}
