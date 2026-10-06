import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  resolveWorkspaceMedia,
  type WorkspaceMediaFitMode,
  type WorkspaceMediaSlotType,
} from '../../config/production-workspace-density';
import {
  resolveWorkspaceAspect,
  resolveWorkspaceMediaRole,
  workspaceCropGuard,
  type WorkspaceFocalRegion,
  type WorkspaceFocalPoint,
  type WorkspaceMediaRole,
  type WorkspaceMediaScale,
} from '../../config/production-workspace-media';

/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — shared media slot.
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — media ROLE (asset type) + SCALE.
 *
 * The SLOT owns the geometry (aspect, size caps, radius); the asset only fills it. The ROLE decides the fit:
 * functional media that must stay whole (UI, logo, document, authority) contains; portraits / scenes / frames may
 * cover only focal-safe; decorative art crops only where the intentional crop registry says so. A missing or failed
 * asset keeps the slot's geometry and shows a named empty state instead of a broken-image icon.
 * Geometry / fit CSS: site00-production-workspace-density.css (§2 MEDIA SLOT CONTRACT, §8 MEDIA GEOMETRY).
 */

export type WorkspaceMediaProps = {
  /** Media slot type — defines the box. */
  slot?: WorkspaceMediaSlotType;
  /** Fit mode — defaults to the role's (or the slot's) default fit. */
  fit?: WorkspaceMediaFitMode;
  /** Focal position: CSS `x% y%` or a focal contract point (`face`, `top`, `{ x, y }` …). Overrides the default. */
  focal?: string | WorkspaceFocalPoint;
  /** Media role (asset type) — decides fit, crop policy, focal region and backdrop. */
  role?: WorkspaceMediaRole;
  /** Media scale — CHIP / TILE / PREVIEW / PLATE: legibility minimum and whether it drives its panel's height. */
  scale?: WorkspaceMediaScale;
  /** Semantic aspect: an approved-aspect key, `node:<hub node>`, or `a / b`. Never the source's pixel size. */
  aspect?: string;
  /** Intentional crop registry id (cover fits only). */
  crop?: string;
};

type MediaAttrs = {
  'data-media-slot'?: WorkspaceMediaSlotType;
  'data-media-fit': WorkspaceMediaFitMode;
  'data-media-role'?: WorkspaceMediaRole;
  'data-media-scale'?: WorkspaceMediaScale;
  'data-media-crop'?: string;
  'data-media-focal-region'?: string;
  /** `<min visible share> <REGION|POINT|NONE>` — the bound the crop guard enforces for a functional cover. */
  'data-media-guard'?: string;
  style?: CSSProperties;
};

/** Data attributes + focal / aspect style every media-bearing element carries. */
export function workspaceMediaAttrs({ slot, fit, focal, role, scale, aspect, crop }: WorkspaceMediaProps): MediaAttrs {
  const ratio = resolveWorkspaceAspect(aspect);
  const style: Record<string, string> = {};
  if (ratio) style['--pw-media-aspect'] = ratio;
  if (!role) {
    const resolved = resolveWorkspaceMedia(slot ?? 'ROW_THUMB', fit, typeof focal === 'string' ? focal : undefined);
    if (typeof focal === 'string') style['--pw-focal'] = focal;
    return {
      ...(slot ? { 'data-media-slot': slot } : {}),
      'data-media-fit': resolved.mode,
      ...(scale ? { 'data-media-scale': scale } : {}),
      ...(Object.keys(style).length ? { style: style as CSSProperties } : {}),
    };
  }
  const r = resolveWorkspaceMediaRole({ role, fit, focal, crop });
  if (r.focalPosition) style['--pw-focal'] = r.focalPosition;
  return {
    ...(slot ? { 'data-media-slot': slot } : {}),
    'data-media-fit': r.fit,
    'data-media-role': role,
    ...(scale ? { 'data-media-scale': scale } : {}),
    ...(r.cropId ? { 'data-media-crop': r.cropId } : {}),
    ...(r.focalRegion ? { 'data-media-focal-region': r.focalRegion.join(' ') } : {}),
    ...(r.guard ? { 'data-media-guard': `${r.guard.minVisible} ${r.guard.keep}` } : {}),
    ...(Object.keys(style).length ? { style: style as CSSProperties } : {}),
  };
}

function applyCropGuard(img: HTMLImageElement) {
  const slot = img.closest<HTMLElement>('[data-media-guard]');
  if (!slot || !img.naturalWidth || !img.naturalHeight || !img.clientWidth || !img.clientHeight) return;
  const [min, keep] = (slot.dataset.mediaGuard ?? '').split(' ');
  const region = slot.dataset.mediaFocalRegion?.split(' ').map(Number) as WorkspaceFocalRegion | undefined;
  const [px = 0.5, py = 0.5] = getComputedStyle(img)
    .objectPosition.split(/\s+/)
    .map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
  const verdict = workspaceCropGuard({
    boxAspect: img.clientWidth / img.clientHeight,
    sourceAspect: img.naturalWidth / img.naturalHeight,
    position: [px, py],
    minVisible: Number(min) || 0,
    region: region?.length === 4 ? region : null,
    keep: keep === 'POINT' || keep === 'NONE' ? keep : 'REGION',
  });
  if (verdict === 'contain') img.dataset.cropGuard = 'contain';
  else delete img.dataset.cropGuard;
}

/**
 * Crop guard for a declared functional cover: re-checked on load and whenever the rendered box changes. When the
 * cover would cut the source past its contract (role / registry bound, focal region or point), the image is
 * contained instead (`data-crop-guard="contain"`). The source never sizes the panel — it can only stop a crop.
 */
export function useWorkspaceCropGuard(): (img: HTMLImageElement | null) => void {
  const observer = useRef<ResizeObserver | null>(null);
  useEffect(() => () => observer.current?.disconnect(), []);
  return useCallback((img: HTMLImageElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!img || typeof ResizeObserver === 'undefined' || !img.closest('[data-media-guard]')) return;
    const check = () => applyCropGuard(img);
    img.addEventListener('load', check);
    observer.current = new ResizeObserver(check);
    observer.current.observe(img);
    if (img.complete) check();
  }, []);
}

export function WorkspaceMediaSlot({
  slot,
  fit,
  focal,
  role,
  scale,
  aspect,
  crop,
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
  const guard = useWorkspaceCropGuard();
  const attrs = workspaceMediaAttrs({ slot, fit, focal, role, scale, aspect, crop });
  const missing = !src || failed;
  return (
    <span className={`pw-media ${className}`.trim()} {...attrs} data-testid={testId} data-media-state={missing ? 'missing' : 'filled'}>
      {missing ?
        <span className="ph-img ph-img--slot" data-asset-state="missing" title={label}>
          <span className="ph-slot__corners" aria-hidden />
          {label ? <span className="ph-slot__label">{label}</span> : null}
        </span>
      : <img ref={guard} src={src} alt={alt} draggable={false} loading="lazy" decoding="async" onError={() => setFailed(true)} />}
      {children}
    </span>
  );
}
