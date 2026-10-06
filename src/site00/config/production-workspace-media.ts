/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2
 *
 * PANEL ↔ MEDIA GEOMETRY CONTRACT. HUB governs how panels respect their content: functional media influences panel
 * geometry, panels never force functional media into arbitrary heights. This module extends the density contract
 * (production-workspace-density.ts — type scale, panel density, fit modes, slots: unchanged) with:
 *
 *   WORKSPACE_MEDIA_ROLES        asset type → fit, crop policy, semantic aspect, focal, backdrop, text-overlay rule
 *   WORKSPACE_MEDIA_SCALES       CHIP / TILE / PREVIEW / PLATE → legibility minimum + whether it drives panel height
 *   resolveWorkspaceFocal        lightweight focal contract (center / top / face / subject / custom x,y) — no CV
 *   WORKSPACE_APPROVED_ASPECTS   semantic aspect per asset class (never the raw pixel size of a source file)
 *   WORKSPACE_PANEL_MEDIA_MODES  MEDIA_LEAD / MEDIA_INLINE / MEDIA_STACK / AUTHORITY_PREVIEW / PORTRAIT_GRID / REFERENCE_FRAME
 *   WORKSPACE_INTENTIONAL_CROPS  the only crops allowed to exist; any crop not registered here is a failure
 *   WORKSPACE_MOBILE_ESCAPE_ORDER what mobile does when functional media does not fit (never: crop harder)
 *
 * CSS mirror: site00-production-workspace-density.css §8 (data-media-role / -scale / -crop, data-panel-media).
 * Live proof: scripts/production-workspace/media-geometry-{audit,report}.mjs.
 */
import type { ProductionViewportFamily } from './production-authority-registry';
import type { WorkspaceMediaFitMode } from './production-workspace-density';

/* ─────────────────────────────────────────────── roles ─────────────────────────────────────────────── */

export type WorkspaceMediaRole =
  | 'PORTRAIT'
  | 'UI_SCREENSHOT'
  | 'LOGO_MARK'
  | 'LANDSCAPE_EDITORIAL'
  | 'REFERENCE_AUTHORITY'
  | 'DECORATIVE_ART'
  | 'DOCUMENT_PREVIEW'
  | 'VIDEO_FRAME'
  | 'OTHER_FUNCTIONAL'
  | 'OTHER_DECORATIVE';

/**
 * NONE         contain only — any crop is a failure
 * FOCAL_SAFE   cover allowed: the protected focal region stays in frame and each axis keeps ≥ minVisibleAxis
 * CROP_SAFE    cover allowed only where authority metadata registers the crop (intentional crop registry)
 * SLOT_DEFINED decorative — the slot owns the crop (still registered)
 */
export type WorkspaceMediaCropPolicy = 'NONE' | 'FOCAL_SAFE' | 'CROP_SAFE' | 'SLOT_DEFINED';

export type WorkspaceMediaRoleDef = {
  role: WorkspaceMediaRole;
  functional: boolean;
  purpose: string;
  /** Fit used when a call site declares the role only (asset-type-aware default). */
  defaultFit: WorkspaceMediaFitMode;
  /** Fits a call site may choose for this role. A cover fit outside this list is coerced to the default. */
  allowedFits: readonly WorkspaceMediaFitMode[];
  crop: WorkspaceMediaCropPolicy;
  /** Minimum visible share of the source on a cropped axis (cover fits). 1 = no crop. */
  minVisibleAxis: number;
  focal: WorkspaceFocalPoint;
  /** Semantic aspect contract — `SOURCE` = the asset class's approved ratio (WORKSPACE_APPROVED_ASPECTS). */
  aspects: readonly string[];
  backdrop: 'NONE' | 'NEUTRAL' | 'DARK' | 'PAPER';
  /** Text over the media: functional media is never covered unless the composition is explicitly approved. */
  textOverlay: 'NEVER' | 'APPROVED_ONLY' | 'ALLOWED';
  mobile: string;
};

export const WORKSPACE_MEDIA_ROLES: Record<WorkspaceMediaRole, WorkspaceMediaRoleDef> = {
  PORTRAIT: {
    role: 'PORTRAIT',
    functional: true,
    purpose: 'Actor / cast / character faces — identification. Face, head, hair silhouette and (when needed) upper body.',
    defaultFit: 'PORTRAIT_COVER',
    allowedFits: ['PORTRAIT_COVER', 'THUMBNAIL_CONTAIN'],
    crop: 'FOCAL_SAFE',
    minVisibleAxis: 0.5,
    focal: 'face',
    aspects: ['4 / 5', '3 / 4', '1 / 1'],
    backdrop: 'NEUTRAL',
    textOverlay: 'NEVER',
    mobile: 'portrait slot (never a letterbox strip); tiles may grow and show fewer per row',
  },
  UI_SCREENSHOT: {
    role: 'UI_SCREENSHOT',
    functional: true,
    purpose: 'Screens / captures of an interface — the whole interface, nav / header / footer intact.',
    defaultFit: 'UI_CAPTURE_CONTAIN',
    allowedFits: ['UI_CAPTURE_CONTAIN'],
    crop: 'NONE',
    minVisibleAxis: 1,
    focal: 'top',
    aspects: ['SOURCE', '9 / 16', '16 / 9'],
    backdrop: 'DARK',
    textOverlay: 'NEVER',
    mobile: 'contain inside a dark backdrop; the slot grows to the capture aspect',
  },
  LOGO_MARK: {
    role: 'LOGO_MARK',
    functional: true,
    purpose: 'Logos, marks, monograms, transparent brand assets — never cropped, never stretched, clearspace kept.',
    defaultFit: 'LOGO_CONTAIN',
    allowedFits: ['LOGO_CONTAIN'],
    crop: 'NONE',
    minVisibleAxis: 1,
    focal: 'center',
    aspects: ['SOURCE', '1 / 1'],
    backdrop: 'NONE',
    textOverlay: 'NEVER',
    mobile: 'contain, centred, transparency preserved',
  },
  LANDSCAPE_EDITORIAL: {
    role: 'LANDSCAPE_EDITORIAL',
    functional: true,
    purpose: 'Scene / environment / set / location imagery read as information (what the place or shot is).',
    defaultFit: 'LANDSCAPE_COVER',
    allowedFits: ['LANDSCAPE_COVER', 'THUMBNAIL_COVER', 'WIDE_SCENE_COVER', 'THUMBNAIL_CONTAIN'],
    crop: 'FOCAL_SAFE',
    minVisibleAxis: 0.5,
    focal: 'subject',
    aspects: ['16 / 9', '3 / 2', '16 / 10', '4 / 3', '1 / 1'],
    backdrop: 'NONE',
    textOverlay: 'APPROVED_ONLY',
    mobile: 'cover only while the subject stays visible; otherwise a taller slot',
  },
  REFERENCE_AUTHORITY: {
    role: 'REFERENCE_AUTHORITY',
    functional: true,
    purpose: 'Approved authority / reference boards and node art — must stay inspectable as a whole.',
    defaultFit: 'AUTHORITY_PREVIEW_CONTAIN',
    allowedFits: ['AUTHORITY_PREVIEW_CONTAIN'],
    crop: 'CROP_SAFE',
    minVisibleAxis: 1,
    focal: 'center',
    aspects: ['SOURCE'],
    backdrop: 'NEUTRAL',
    textOverlay: 'NEVER',
    mobile: 'dedicated AUTHORITY_PREVIEW slot at the approved ratio; panel grows; spans the row when too narrow',
  },
  DECORATIVE_ART: {
    role: 'DECORATIVE_ART',
    functional: false,
    purpose: 'Atmosphere plates, hero bands, chamber art — composition, not information.',
    defaultFit: 'WIDE_SCENE_COVER',
    allowedFits: ['WIDE_SCENE_COVER', 'LANDSCAPE_COVER', 'THUMBNAIL_COVER', 'AUTHORITY_PREVIEW_COVER'],
    crop: 'SLOT_DEFINED',
    minVisibleAxis: 0,
    focal: 'subject',
    aspects: ['SLOT'],
    backdrop: 'NONE',
    textOverlay: 'ALLOWED',
    mobile: 'cover / crop allowed (registered); copy sits on a wash, never on raw imagery',
  },
  DOCUMENT_PREVIEW: {
    role: 'DOCUMENT_PREVIEW',
    functional: true,
    purpose: 'Documents, records, sheets — page edge and header identity preserved.',
    defaultFit: 'DOCUMENT_PREVIEW_CONTAIN',
    allowedFits: ['DOCUMENT_PREVIEW_CONTAIN'],
    crop: 'NONE',
    minVisibleAxis: 1,
    focal: 'top',
    aspects: ['SOURCE', '3 / 4', '8.5 / 11'],
    backdrop: 'PAPER',
    textOverlay: 'NEVER',
    mobile: 'contain on a paper frame',
  },
  VIDEO_FRAME: {
    role: 'VIDEO_FRAME',
    functional: true,
    purpose: 'Storyboard frames, keyframes, takes — a shot is read by its full composition.',
    defaultFit: 'VIDEO_FRAME_CONTAIN',
    allowedFits: ['VIDEO_FRAME_CONTAIN', 'LANDSCAPE_COVER', 'THUMBNAIL_COVER'],
    crop: 'FOCAL_SAFE',
    minVisibleAxis: 0.88,
    focal: 'center',
    aspects: ['SOURCE', '16 / 9', '2.39 / 1'],
    backdrop: 'DARK',
    textOverlay: 'APPROVED_ONLY',
    mobile: 'frame at its own aspect; cover only within a 12% trim',
  },
  OTHER_FUNCTIONAL: {
    role: 'OTHER_FUNCTIONAL',
    functional: true,
    purpose: 'Any other image that carries information.',
    defaultFit: 'THUMBNAIL_CONTAIN',
    allowedFits: ['THUMBNAIL_CONTAIN'],
    crop: 'NONE',
    minVisibleAxis: 1,
    focal: 'center',
    aspects: ['SOURCE'],
    backdrop: 'NEUTRAL',
    textOverlay: 'NEVER',
    mobile: 'contain',
  },
  OTHER_DECORATIVE: {
    role: 'OTHER_DECORATIVE',
    functional: false,
    purpose: 'Any other ornament (textures, washes, chips).',
    defaultFit: 'THUMBNAIL_COVER',
    allowedFits: ['THUMBNAIL_COVER', 'WIDE_SCENE_COVER', 'LANDSCAPE_COVER'],
    crop: 'SLOT_DEFINED',
    minVisibleAxis: 0,
    focal: 'center',
    aspects: ['SLOT'],
    backdrop: 'NONE',
    textOverlay: 'ALLOWED',
    mobile: 'slot-defined',
  },
};

/* ─────────────────────────────────────────────── focal ─────────────────────────────────────────────── */

/** Lightweight focal contract: a named point or a custom x / y (0–1 of the source). No computer vision. */
export type WorkspaceFocalPoint = 'center' | 'top' | 'face' | 'subject' | { x: number; y: number; w?: number; h?: number };

/** [x0, y0, x1, y1] — the part of the source that must stay visible (fractions of the source). */
export type WorkspaceFocalRegion = readonly [number, number, number, number];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

/** Named focal regions ([x0, y0, x1, y1] of the source). */
const FOCAL_REGIONS: Record<'center' | 'top' | 'face' | 'subject', WorkspaceFocalRegion> = {
  center: [0.3, 0.3, 0.7, 0.7],
  top: [0.1, 0, 0.9, 0.18],
  // head-and-shoulders headshots: face + hair silhouette in the upper half
  face: [0.3, 0.12, 0.7, 0.5],
  subject: [0.3, 0.28, 0.7, 0.62],
};

/**
 * Region-anchored position for one axis. With `cover`, position p puts the window at p·(1 − v) for a visible share v.
 * Anchoring p = r0 / (1 − h) (region start r0, size h) keeps the WHOLE region in the window for every v ≥ h — also for
 * a region touching the source edge (a face near the top or bottom), where positioning at the focal point fails.
 */
const anchor = (r0: number, r1: number) => (r1 - r0 >= 1 ? 0.5 : clamp01(r0 / (1 - (r1 - r0))));

/** Resolve a focal point to the CSS position (object-position / background-position) and the protected region. */
export function resolveWorkspaceFocal(focal: WorkspaceFocalPoint): { position: string; region: WorkspaceFocalRegion } {
  let region: WorkspaceFocalRegion;
  if (typeof focal === 'string') region = FOCAL_REGIONS[focal];
  else {
    const w = focal.w ?? 0.36;
    const h = focal.h ?? 0.3;
    const x = clamp01(focal.x);
    const y = clamp01(focal.y);
    region = [clamp01(x - w / 2), clamp01(y - h / 2), clamp01(x + w / 2), clamp01(y + h / 2)];
  }
  return { position: `${pct(anchor(region[0], region[2]))} ${pct(anchor(region[1], region[3]))}`, region };
}

/**
 * CROP GUARD — the source's aspect never sizes a panel, but it decides whether a declared cover still honours the
 * contract in the box it actually got. Returns 'contain' when the cover would show less than `minVisible` of an axis
 * or push the kept focal region / point out of frame; the media primitives then contain that image instead.
 */
export function workspaceCropGuard(a: {
  boxAspect: number;
  sourceAspect: number;
  /** object-position as fractions [x, y]. */
  position: readonly [number, number];
  minVisible: number;
  region: WorkspaceFocalRegion | null;
  keep: 'REGION' | 'POINT' | 'NONE';
}): 'cover' | 'contain' {
  if (!(a.boxAspect > 0) || !(a.sourceAspect > 0)) return 'cover';
  const vx = Math.min(1, a.boxAspect / a.sourceAspect);
  const vy = Math.min(1, a.sourceAspect / a.boxAspect);
  if (Math.min(vx, vy) < a.minVisible - 0.005) return 'contain';
  if (!a.region || a.keep === 'NONE') return 'cover';
  const x0 = a.position[0] * (1 - vx);
  const y0 = a.position[1] * (1 - vy);
  const [r0x, r0y, r1x, r1y] = a.region;
  const t = 0.02;
  const ok =
    a.keep === 'REGION' ?
      r0x >= x0 - t && r1x <= x0 + vx + t && r0y >= y0 - t && r1y <= y0 + vy + t
    : (r0x + r1x) / 2 >= x0 && (r0x + r1x) / 2 <= x0 + vx && (r0y + r1y) / 2 >= y0 && (r0y + r1y) / 2 <= y0 + vy;
  return ok ? 'cover' : 'contain';
}

/* ─────────────────────────────────────────────── scales ─────────────────────────────────────────────── */

/**
 * Media SCALE — how big a role is in its panel, and whether it may drive the panel's height.
 * CHIP     identification thumbnail inline with a list row (HUB ops / feed thumbs). Never drives height.
 * TILE     card / tile media with a caption (rails, grids). Drives its panel: a panel shows at least one whole tile.
 * PREVIEW  the panel's primary media (authority, UI capture, document, frame). Drives its panel: full aspect.
 * PLATE    decorative band / background. Never drives height (decorative; may crop when registered).
 */
export type WorkspaceMediaScale = 'CHIP' | 'TILE' | 'PREVIEW' | 'PLATE';

export type WorkspaceMediaScaleDef = {
  scale: WorkspaceMediaScale;
  drivesPanelHeight: boolean;
  /** Minimum rendered short side (CHIP / TILE) or block size (PREVIEW), CSS px, per viewport family. */
  minPx: Record<ProductionViewportFamily, number>;
  /**
   * PREVIEW only: an inline size that also counts as legible — a very wide authority (3.5:1) shown whole across its
   * row cannot get taller without cropping, so "as large as its row allows" is the honest minimum.
   */
  minInlinePx?: Record<ProductionViewportFamily, number>;
  /** Largest aspect error tolerated against the contract aspect before the frame reads as a strip / sliver. */
  maxAspectError: number;
  purpose: string;
};

export const WORKSPACE_MEDIA_SCALES: Record<WorkspaceMediaScale, WorkspaceMediaScaleDef> = {
  // minimums are HUB's own: its row chips (--op-thumb, ≈18px at 360) and its smallest card media (feature card ≈49px
  // on phones, overview / entry cards ≈53px on tablet / desktop) — HUB is the thumbnail authority
  CHIP: { scale: 'CHIP', drivesPanelHeight: false, minPx: { mobile: 16, tablet: 16, desktop: 16 }, maxAspectError: 0.35, purpose: 'inline identification chip (HUB --op-thumb scale)' },
  TILE: { scale: 'TILE', drivesPanelHeight: true, minPx: { mobile: 44, tablet: 48, desktop: 48 }, maxAspectError: 0.35, purpose: 'tile / card media with a caption (HUB feature / entry card scale)' },
  PREVIEW: { scale: 'PREVIEW', drivesPanelHeight: true, minPx: { mobile: 120, tablet: 120, desktop: 120 }, minInlinePx: { mobile: 300, tablet: 240, desktop: 240 }, maxAspectError: 0.15, purpose: 'primary media of its panel, inspectable (≥120px tall, or the full row on phones)' },
  PLATE: { scale: 'PLATE', drivesPanelHeight: false, minPx: { mobile: 0, tablet: 0, desktop: 0 }, maxAspectError: Infinity, purpose: 'decorative plate / band / background' },
};

/* ─────────────────────────────────────── approved aspect contract ─────────────────────────────────────── */

/**
 * Semantic aspect per asset class. Panel geometry reads THESE, never the raw pixel dimensions of a source file.
 * Values are the approved authority ratios (receipts / authority packs), not measured at runtime.
 */
export const WORKSPACE_APPROVED_ASPECTS = {
  /** Storyboard frames / keyframes are composed for screen (frames themselves vary — contained, never cropped). */
  STORYBOARD_FRAME: '16 / 10',
  /** Studio World actor headshots (acting catalogue). */
  ACTOR_HEADSHOT: '4 / 5',
  /** Mobile authority captures (9:16 phone screens). */
  MOBILE_CAPTURE: '9 / 16',
  /** Desktop / tablet authority captures. */
  DESKTOP_CAPTURE: '16 / 9',
  /** Document / record page. */
  DOCUMENT_PAGE: '3 / 4',
} as const;
export type WorkspaceApprovedAspect = keyof typeof WORKSPACE_APPROVED_ASPECTS;

/**
 * HUB node art — the approved crop ratio of each node's authority receipt (pixel crops of the founder authority
 * screens, shared/site00-production-hub/assetReceipts.ts). Declared metadata, versioned with the receipts; a test
 * checks it against the receipt files so a re-cut asset cannot silently drift. Panels never read pixel sizes.
 */
export const HUB_NODE_ART_ASPECT = {
  narrative: '138 / 60',
  cast: '272 / 110',
  look: '168 / 60',
  performance: '100 / 62',
  set: '145 / 64',
  storyboard: '640 / 443',
  keyframes: '174 / 50',
} as const;
export type HubNodeArtId = keyof typeof HUB_NODE_ART_ASPECT;

/** Semantic aspect for a production-hub asset slot id (node art / storyboard frame) — from the slot id, never pixels. */
export function workspaceAssetAspect(slotId: string | null | undefined): string | null {
  const node = /\.node\.([a-z]+)\./.exec(slotId ?? '')?.[1];
  if (node && node in HUB_NODE_ART_ASPECT) return `node:${node}`;
  if (/\.storyboard\.frame\./.test(slotId ?? '')) return 'STORYBOARD_FRAME';
  return null;
}

/** Resolve a semantic aspect (approved-aspect key, `node:<id>`, or a literal `a / b`) to a CSS aspect-ratio. */
export function resolveWorkspaceAspect(aspect: string | undefined | null): string | null {
  if (!aspect) return null;
  if (aspect in WORKSPACE_APPROVED_ASPECTS) return WORKSPACE_APPROVED_ASPECTS[aspect as WorkspaceApprovedAspect];
  if (aspect.startsWith('node:')) return HUB_NODE_ART_ASPECT[aspect.slice(5) as HubNodeArtId] ?? null;
  return /^\d+(\.\d+)? \/ \d+(\.\d+)?$/.test(aspect) ? aspect : null;
}

/* ─────────────────────────────────────────── panel media modes ─────────────────────────────────────────── */

export type WorkspacePanelMediaMode = 'MEDIA_LEAD' | 'MEDIA_INLINE' | 'MEDIA_STACK' | 'AUTHORITY_PREVIEW' | 'PORTRAIT_GRID' | 'REFERENCE_FRAME';

export type WorkspacePanelMediaModeDef = {
  mode: WorkspacePanelMediaMode;
  scale: WorkspaceMediaScale;
  /** CONTENT_DRIVEN: the panel's block size is at least its media + copy + controls (never the reverse). */
  height: 'CONTENT_DRIVEN' | 'COMPOSITION';
  geometry: string;
  mobile: string;
  tablet: string;
  desktop: string;
};

export const WORKSPACE_PANEL_MEDIA_MODES: Record<WorkspacePanelMediaMode, WorkspacePanelMediaModeDef> = {
  MEDIA_LEAD: { mode: 'MEDIA_LEAD', scale: 'PREVIEW', height: 'CONTENT_DRIVEN', geometry: 'media first at full panel width and its own aspect, copy below', mobile: 'stack, panel grows', tablet: 'stack or side-by-side by container width', desktop: 'side-by-side allowed' },
  MEDIA_INLINE: { mode: 'MEDIA_INLINE', scale: 'CHIP', height: 'COMPOSITION', geometry: 'chip thumbnail inline with a row (HUB row grammar: thumb · text · action)', mobile: 'fixed chip from the HUB unit; the grid is content-driven so whole rows show (never a row sliced by a short pane)', tablet: 'rows scroll inside their authored pane', desktop: 'same as tablet' },
  MEDIA_STACK: { mode: 'MEDIA_STACK', scale: 'TILE', height: 'CONTENT_DRIVEN', geometry: 'media beside copy while the panel is wide enough, stacked above it below the stack width', mobile: 'stacked (container query)', tablet: 'side-by-side when ≥ 300px', desktop: 'side-by-side' },
  AUTHORITY_PREVIEW: { mode: 'AUTHORITY_PREVIEW', scale: 'PREVIEW', height: 'CONTENT_DRIVEN', geometry: 'dedicated authority slot: whole frame at the approved ratio (contain), inspectable', mobile: 'spans the full row, panel grows to the preview', tablet: 'keeps its span; grows to the preview', desktop: 'keeps its span; grows to the preview' },
  PORTRAIT_GRID: { mode: 'PORTRAIT_GRID', scale: 'TILE', height: 'CONTENT_DRIVEN', geometry: 'portrait tiles (4:5) with caption; rail or grid', mobile: 'fewer, larger tiles per view; the rail stays a horizontal carousel; panel shows one whole tile row', tablet: 'more tiles per row', desktop: 'denser, never cropped' },
  REFERENCE_FRAME: { mode: 'REFERENCE_FRAME', scale: 'TILE', height: 'CONTENT_DRIVEN', geometry: 'frames / references at their own aspect (contain or ≤12% trim)', mobile: 'fewer columns, panel grows', tablet: 'multi-column', desktop: 'denser grid' },
};

/** What mobile does when functional media does not fit cleanly — in this order. Never: crop harder, shrink until unreadable, hide overflow. */
export const WORKSPACE_MOBILE_ESCAPE_ORDER = [
  'INCREASE_PANEL_HEIGHT',
  'STACK_MEDIA_ABOVE_COPY',
  'TALLER_MEDIA_SLOT',
  'REDUCE_COLUMNS',
  'MOVE_SECONDARY_CONTENT_TO_NEXT_ROW',
  'CONTINUATION_OR_DETAIL_VIEW',
] as const;

/** Content priority when panel space is constrained (secondary copy collapses before functional media). */
export const WORKSPACE_PANEL_CONTENT_PRIORITY = ['FUNCTIONAL_MEDIA', 'PRIMARY_LABEL', 'PRIMARY_STATUS', 'PRIMARY_ACTION', 'SECONDARY_METADATA'] as const;

/* ─────────────────────────────────────────── intentional crops ─────────────────────────────────────────── */

export type WorkspaceIntentionalCrop = {
  id: string;
  role: WorkspaceMediaRole;
  /** Fits this crop may use (cover modes). */
  fits: readonly WorkspaceMediaFitMode[];
  /** Media scales the crop is registered for. */
  scales: readonly WorkspaceMediaScale[];
  /** Where the crop lives (selectors the audit matches when an element carries no data-media-crop id). */
  where: readonly string[];
  reason: string;
  /** Smallest visible share of the source per axis this crop may reach. */
  minVisibleAxis: number;
  /**
   * What must stay in frame: REGION = the role's protected focal region; POINT = the focal point itself (chips:
   * identification at HUB chip scale); NONE = decorative (the slot owns the crop).
   */
  focal: 'REGION' | 'POINT' | 'NONE';
  /** Authority for the crop (HUB treatment, decorative composition, authority metadata). */
  authority: string;
};

/**
 * The only crops allowed to exist. A cropped element that matches no entry here — or exceeds its entry's bounds —
 * is a failure. Functional NONE-policy roles (UI, logo, document, other-functional) can never be registered.
 */
export const WORKSPACE_INTENTIONAL_CROPS: readonly WorkspaceIntentionalCrop[] = [
  {
    id: 'HERO_PLATE_BAND',
    role: 'DECORATIVE_ART',
    fits: ['WIDE_SCENE_COVER'],
    scales: ['PLATE'],
    where: ["[data-media-slot='HERO_PLATE']"],
    reason: 'Hero / atmosphere bands follow the HUB hero band (--hero-h): composition, not information; copy sits on a wash.',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'HUB hero grammar (.hubx-hero)',
  },
  {
    id: 'LIBRARY_PLATE',
    role: 'DECORATIVE_ART',
    fits: ['LANDSCAPE_COVER', 'THUMBNAIL_COVER'],
    scales: ['PLATE'],
    where: [],
    reason: 'Library category / lineage covers use the abstract red-geometry library plates (no subject) — composition only; real records carry their own node art.',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'LIBRARY authority (production-library-red-geometry plates)',
  },
  {
    id: 'STAGE_FLOOR_CROP',
    role: 'DECORATIVE_ART',
    fits: ['WIDE_SCENE_COVER'],
    scales: ['PLATE'],
    where: [],
    reason: 'EXPRESSION floors with no node art frame their own part of the one stage plate (art-directed --pw-focal per floor).',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'EXPRESSION root authority (stage floors)',
  },
  {
    id: 'DESIGN_CHAMBER_ART',
    role: 'DECORATIVE_ART',
    fits: ['WIDE_SCENE_COVER'],
    scales: ['PLATE'],
    where: ['.pxa-chamber__atrium-art', '.pxa-core'],
    reason: 'DESIGN chamber atmosphere (atrium / corridor plate, project core): the room the floating panels sit in.',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'DESIGN chamber authority (approved production world)',
  },
  {
    id: 'DESIGN_CHAMBER_MINIATURE',
    role: 'DECORATIVE_ART',
    fits: ['AUTHORITY_PREVIEW_COVER', 'THUMBNAIL_COVER'],
    scales: ['PLATE'],
    where: ['.pxa-vis', '.pxa-panel__viswrap', '.pxa-overview-panel__strip'],
    reason:
      'Miniatures inside the floating chamber panels (board strips, swatches, device outlines, authority strips) illustrate what each panel holds — 12–80px composition, never the inspectable object. The boards / screens themselves are inspected in DESIGN → ASSETS / VIEWPORT and the project inspector.',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'DESIGN chamber authority — re-reviewed: the 23 prior "decorative-art" chamber crops are all of this class and stay intentional',
  },
  {
    id: 'DESIGN_TABLE_PLATE',
    role: 'DECORATIVE_ART',
    fits: ['LANDSCAPE_COVER'],
    scales: ['PLATE'],
    where: ['.pxa-tcard__img:not(.pxa-pf-tcard__img)'],
    reason:
      'ON YOUR TABLE cards carry an illustrative plate, reused across items (the same row plate illustrates BRAND APPLICATIONS, STATE FAMILY, MOBILE EXPRESSION, SAFE AREA CHECK) — not the reviewed object, which opens in the workspace.',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'designChamberConfig table plates (PW_IMG.designRows)',
  },
  {
    id: 'OVERVIEW_BACKDROP',
    role: 'DECORATIVE_ART',
    fits: ['WIDE_SCENE_COVER'],
    scales: ['PLATE'],
    where: ['.pxa-pf-overview__art img'],
    reason: 'Project overview panel backdrop: the parent authority framed behind the lede (art-directed, gradient-washed); the screen itself is inspected whole in the project inspector and the live viewport.',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'Project-family chamber overview grammar',
  },
  {
    id: 'EXPERIENCE_WORLD_CROP',
    role: 'DECORATIVE_ART',
    fits: ['WIDE_SCENE_COVER'],
    scales: ['PLATE'],
    where: ['.pw-plate', '.pw-scroll__hero'],
    reason: 'Each EXPERIENCE sub-workspace frames a different part of the one Experience world plate (art-directed WORLD_CROP zoom + focal).',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'ExperienceProductionShellPage WORLD_CROP',
  },
  {
    id: 'NODE_ART_CHIP',
    role: 'REFERENCE_AUTHORITY',
    fits: ['THUMBNAIL_COVER', 'LANDSCAPE_COVER', 'PORTRAIT_COVER'],
    scales: ['CHIP'],
    where: [],
    reason: 'Node art as an identification chip inside a row (ops / feed / activity / library rows). The whole node art stays inspectable on its node and authority preview.',
    minVisibleAxis: 0.28,
    focal: 'POINT',
    authority: 'HUB ops / feed row thumbs (--op-thumb) — authority crop metadata: CROP_SAFE at chip scale',
  },
  {
    id: 'NODE_ART_CARD',
    role: 'REFERENCE_AUTHORITY',
    fits: ['THUMBNAIL_COVER', 'LANDSCAPE_COVER', 'PORTRAIT_COVER'],
    scales: ['TILE'],
    where: [],
    reason: 'Node art framing a card / strip (HUB feature + entry cards, library strips, decision cards): the centre region stays in frame and at least half of each axis shows.',
    minVisibleAxis: 0.5,
    focal: 'REGION',
    authority: 'HUB feature / entry card media (--feature-h, --entry-img)',
  },
  {
    id: 'HUB_MACHINE_FRAME',
    role: 'VIDEO_FRAME',
    fits: ['THUMBNAIL_COVER', 'LANDSCAPE_COVER'],
    scales: ['CHIP', 'TILE'],
    where: ['.ph-artifact__img', '.ph-artifact__timg', '.ph-film__img', '.ph-auth__img', '.ph-cmp__img'],
    reason:
      'HUB machine view: storyboard frames sit in HUB’s own artifact / filmstrip / authority cells (portrait and square cells around 16:10 frames). HUB is the media authority and is not changed; the whole frame opens in the HUB lightbox (contained).',
    minVisibleAxis: 0.5,
    focal: 'REGION',
    authority: 'HUB machine view (.ph-artifact / .ph-film / .ph-auth) — authority, unchanged',
  },
  {
    id: 'HUB_ATMOSPHERE',
    role: 'DECORATIVE_ART',
    fits: ['WIDE_SCENE_COVER'],
    scales: ['PLATE'],
    where: ['.ph-chamber__atmo'],
    reason: 'HUB machine chamber atmosphere plate behind the machine — composition, not information.',
    minVisibleAxis: 0,
    focal: 'NONE',
    authority: 'HUB machine view (.ph-chamber__atmo) — authority, unchanged',
  },
  {
    id: 'PORTRAIT_FACE_SAFE',
    role: 'PORTRAIT',
    fits: ['PORTRAIT_COVER'],
    scales: ['CHIP', 'TILE', 'PREVIEW'],
    where: [],
    reason: 'Portraits fill their portrait slot with the face, head and hair silhouette (face region) in frame — never a letterbox strip.',
    minVisibleAxis: 0.5,
    focal: 'REGION',
    authority: 'PORTRAIT role contract (focal: face)',
  },
  {
    id: 'SCENE_SUBJECT_SAFE',
    role: 'LANDSCAPE_EDITORIAL',
    fits: ['LANDSCAPE_COVER', 'THUMBNAIL_COVER', 'WIDE_SCENE_COVER'],
    scales: ['CHIP', 'TILE', 'PREVIEW'],
    where: [],
    reason: 'Scene / environment imagery may cover while the subject region stays visible and at least half of each axis shows.',
    minVisibleAxis: 0.5,
    focal: 'REGION',
    authority: 'LANDSCAPE_EDITORIAL role contract (focal: subject)',
  },
  {
    id: 'FRAME_TRIM',
    role: 'VIDEO_FRAME',
    fits: ['LANDSCAPE_COVER', 'THUMBNAIL_COVER'],
    scales: ['CHIP', 'TILE'],
    where: [],
    reason: 'A frame may lose at most a 12% trim to sit in its tile; otherwise it is contained on a dark ground.',
    minVisibleAxis: 0.88,
    focal: 'REGION',
    authority: 'VIDEO_FRAME role contract',
  },
];

/* ───────────────────────────────────────────── resolution ───────────────────────────────────────────── */

export type WorkspaceMediaDeclaration = {
  role: WorkspaceMediaRole;
  fit?: WorkspaceMediaFitMode;
  /** CSS position string (`50% 20%`) or focal contract point. */
  focal?: string | WorkspaceFocalPoint;
  crop?: string;
};

const NAMED_FOCAL: ReadonlySet<string> = new Set(['center', 'top', 'face', 'subject']);
const parseFocal = (focal: string): WorkspaceFocalPoint | null => {
  const m = /^(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/.exec(focal.trim());
  return m ? { x: Number(m[1]) / 100, y: Number(m[2]) / 100 } : null;
};

export const workspaceCrop = (id: string | undefined | null) => (id ? (WORKSPACE_INTENTIONAL_CROPS.find((c) => c.id === id) ?? null) : null);

/**
 * Role → effective fit / focal / crop. Asset type decides: a fit the role does not allow is replaced by the role's
 * default; a cover on a CROP_SAFE role needs a registered crop for that role, else it contains. The focal region
 * travels with the element (data-media-focal-region) so the live audit can prove it stays in frame.
 */
export function resolveWorkspaceMediaRole(d: WorkspaceMediaDeclaration): {
  role: WorkspaceMediaRole;
  fit: WorkspaceMediaFitMode;
  focalPosition: string | null;
  focalRegion: WorkspaceFocalRegion | null;
  cropId: string | null;
  /** For a functional cover: the bound and focal rule the crop guard enforces in the rendered box. */
  guard: { minVisible: number; keep: 'REGION' | 'POINT' | 'NONE' } | null;
  coerced: null | 'FIT_NOT_ALLOWED_FOR_ROLE' | 'CROP_NOT_REGISTERED';
} {
  const def = WORKSPACE_MEDIA_ROLES[d.role];
  let fit = d.fit ?? def.defaultFit;
  let coerced: null | 'FIT_NOT_ALLOWED_FOR_ROLE' | 'CROP_NOT_REGISTERED' = null;
  const entry = workspaceCrop(d.crop);
  if (fit.endsWith('_COVER') && def.crop === 'CROP_SAFE') {
    // authority media crops only where the registry (authority metadata) says so, with the fits it names
    if (entry?.role !== d.role || !entry.fits.includes(fit)) {
      fit = def.defaultFit;
      coerced = 'CROP_NOT_REGISTERED';
    }
  } else if (!def.allowedFits.includes(fit)) {
    fit = def.defaultFit;
    coerced = 'FIT_NOT_ALLOWED_FOR_ROLE';
  }
  const named = typeof d.focal === 'string' && NAMED_FOCAL.has(d.focal) ? (d.focal as WorkspaceFocalPoint) : null;
  const point: WorkspaceFocalPoint | null = named ?? (typeof d.focal === 'string' ? parseFocal(d.focal) : (d.focal ?? null));
  const resolved = resolveWorkspaceFocal(point ?? def.focal);
  return {
    role: d.role,
    fit,
    // a CSS position string passes through; a named / custom focal point resolves to its position
    focalPosition: d.focal == null ? null : typeof d.focal === 'string' && !named ? d.focal : resolved.position,
    focalRegion: def.functional ? resolved.region : null,
    cropId: fit.endsWith('_COVER') ? (d.crop ?? null) : null,
    guard:
      fit.endsWith('_COVER') && def.functional ?
        entry && entry.role === d.role ?
          { minVisible: entry.minVisibleAxis, keep: entry.focal }
        : { minVisible: def.minVisibleAxis, keep: 'REGION' }
      : null,
    coerced,
  };
}

/* ───────────────────────────────────────────── inference ───────────────────────────────────────────── */

type MediaHints = { slot?: string | null; fit?: string | null; cls?: string; ariaHidden?: boolean; isBg?: boolean; hub?: boolean; alt?: string | null; src?: string | null; role?: WorkspaceMediaRole; box?: { w: number; h: number } };

/**
 * Role for an element that declares none (audit of undeclared / legacy markup). Declared roles always win. Asset type
 * is read the way a reviewer would: what the source is (node art, storyboard frame, authority screen, logo) first,
 * then the slot / fit the markup declared.
 */
export function inferWorkspaceMediaRole(h: MediaHints): WorkspaceMediaRole {
  const fit = h.fit ?? '';
  const src = h.src ?? '';
  const cls = h.cls ?? '';
  if (fit === 'LOGO_CONTAIN' || h.slot === 'LOGO_MARK' || /(^|[\s/])(icons?|logo|mark)[/._-]/i.test(src)) return 'LOGO_MARK';
  if (h.slot === 'HERO_PLATE' || fit === 'WIDE_SCENE_COVER' || /hero|atrium|atmosphere|corridor|canon-hero|stage-hero/i.test(src)) return 'DECORATIVE_ART';
  if (/pxa-vis|pxa-panel__viswrap|pxa-overview-panel__strip|pxa-chamber|pxa-core|pxa-stage|pxa-pf-overview/.test(cls)) return 'DECORATIVE_ART';
  if (/red-geometry|library-plate|design-board|row-|plates\/crop/i.test(src)) return 'DECORATIVE_ART';
  if (/(^|\/)storyboard\/frame\//.test(src)) return 'VIDEO_FRAME';
  if (/(^|\/)node\//.test(src)) return 'REFERENCE_AUTHORITY';
  if (/authorities\/|_APPROVED|SCREEN|capture/i.test(src) || fit === 'UI_CAPTURE_CONTAIN' || h.slot === 'UI_CAPTURE') return 'UI_SCREENSHOT';
  if (fit === 'DOCUMENT_PREVIEW_CONTAIN' || h.slot === 'DOCUMENT') return 'DOCUMENT_PREVIEW';
  if (/cover\.webp|headshot|portrait|actor/i.test(src) || fit === 'PORTRAIT_COVER' || h.slot === 'PORTRAIT') return 'PORTRAIT';
  if (fit.startsWith('AUTHORITY_PREVIEW')) return 'REFERENCE_AUTHORITY';
  if (fit === 'VIDEO_FRAME_CONTAIN') return 'VIDEO_FRAME';
  if (h.slot === 'BOARD_PREVIEW') return 'DECORATIVE_ART';
  if (fit === 'LANDSCAPE_COVER' || fit === 'THUMBNAIL_COVER') return 'LANDSCAPE_EDITORIAL';
  if (fit === 'THUMBNAIL_CONTAIN') return 'OTHER_FUNCTIONAL';
  return h.isBg ? 'OTHER_DECORATIVE' : 'OTHER_FUNCTIONAL';
}

/** Scale for an element that declares none. */
export function inferWorkspaceMediaScale(h: MediaHints): WorkspaceMediaScale {
  const role = h.role ?? inferWorkspaceMediaRole(h);
  if (!WORKSPACE_MEDIA_ROLES[role].functional) return 'PLATE';
  const short = Math.min(h.box?.w ?? 0, h.box?.h ?? 0);
  if (h.slot === 'ROW_THUMB' || h.slot === 'LOGO_MARK' || (short && short < 40)) return 'CHIP';
  if (h.slot === 'UI_CAPTURE' || h.slot === 'DOCUMENT' || /exf-fill|ibx-dcard__art|ibx-focus__art|ibx-preview__art/.test(h.cls ?? '')) return 'PREVIEW';
  return 'TILE';
}

/**
 * Crop class an UNDECLARED crop would need under this contract (audit of legacy markup): the registry entry for the
 * role at that scale, or a decorative entry whose `where` matched. Declared crops always carry their own id.
 */
export function inferWorkspaceCrop(role: WorkspaceMediaRole, scale: WorkspaceMediaScale, matched: readonly string[] = []): string | null {
  const byWhere = matched.map((id) => workspaceCrop(id)).find((c) => c && c.role === role);
  if (byWhere) return byWhere.id;
  const entry = WORKSPACE_INTENTIONAL_CROPS.find((c) => c.role === role && c.where.length === 0 && c.scales.includes(scale));
  return entry?.id ?? null;
}
