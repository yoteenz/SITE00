/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1
 *
 * HUB is the responsive density authority for the Production Workspace. This module formalizes what HUB
 * already renders (site00-production-hub-reconstruction.css) as one shared contract every tab and child page
 * maps its own internal layers onto:
 *
 *   - WORKSPACE_TYPE_SCALE      T0 micro … T6 display + METRIC, per viewport family, in HUB authority units
 *   - WORKSPACE_PANEL_DENSITY   panel padding / gap / radius / row pitch
 *   - WORKSPACE_MEDIA_FIT_MODES intentional fit modes (cover / contain + default focal position)
 *   - WORKSPACE_MEDIA_SLOTS     media slot types (aspect, size, fit, overflow, radius, frame)
 *
 * Tabs keep their own compositions. Only scale, fit, spacing and constraints are shared.
 * Viewport scope: the type / density LAYER normalization and the slot GEOMETRY defaults are the mobile contract
 * (mobile is the refinement target); tokens, contain-fits and explicit focal metadata apply at every width, so
 * tablet and desktop compositions are untouched unless a slot is explicitly declared there.
 * The CSS mirror of these values is `src/site00/styles/site00-production-workspace-density.css`
 * (tokens `--pw-t0 … --pw-t6`, `--pw-metric`, `--pw-pad`, `--pw-gap`, media slot rules); tests keep both in sync.
 */
import type { ProductionViewportFamily } from './production-authority-registry';

/* ───────────────────────────────────────────── type scale ───────────────────────────────────────────── */

export type WorkspaceTypeTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'METRIC';

export type WorkspaceTypeTierDef = {
  tier: WorkspaceTypeTier;
  /** CSS custom property carrying the computed size. */
  token: string;
  role: string;
  /** Which HUB element proves this tier (forensic source). */
  hubSource: string;
};

export const WORKSPACE_TYPE_TIERS: readonly WorkspaceTypeTierDef[] = [
  { tier: 'T0', token: '--pw-t0', role: 'MICRO / SYSTEM LABEL — timestamps, legends, VIEW ALL, chips, meta', hubSource: '.hubx-viewall, .hubx-legend li, .hubx-feed__list time (--f-sub)' },
  { tier: 'T1', token: '--pw-t1', role: 'SUPPORTING LABEL — kickers, field labels, status captions', hubSource: '.hubx-hero__copy small, .hubx-status__cell small (--f-label / --f-kicker)' },
  { tier: 'T2', token: '--pw-t2', role: 'BODY / CONTROL — row titles, body copy, buttons, tabs, inputs', hubSource: '.hubx-ops__list b, .hubx-status__cell b (--f-main)' },
  { tier: 'T3', token: '--pw-t3', role: 'PANEL TITLE — card / panel heads', hubSource: '.hubx-head h2 (--f-sec)' },
  { tier: 'T4', token: '--pw-t4', role: 'SECTION / FEATURE TITLE — featured item, section lead', hubSource: '.hubx-feature b (--f-feature)' },
  { tier: 'T5', token: '--pw-t5', role: 'WORKSPACE PAGE TITLE — root/child page title outside a hero', hubSource: '.hubx-hero__copy strong (--f-entry)' },
  { tier: 'T6', token: '--pw-t6', role: 'RARE DISPLAY TITLE — one per root hero plate at most', hubSource: '.hubx-hero__copy h1 (--f-title)' },
  { tier: 'METRIC', token: '--pw-metric', role: 'METRIC / NUMBER — counts, percentages, KPI values', hubSource: '.hubx-status__cell strong, .hubx-ring b (--f-num / --f-ring)' },
];

/**
 * HUB authority artboard widths per viewport family. One authority px = container width / artboard.
 * Mobile 9:16 (1125), tablet 4:3 (1792), desktop 16:9 (2000) — the same denominators HUB uses.
 */
export const WORKSPACE_AUTHORITY_ARTBOARD: Record<ProductionViewportFamily, number> = {
  mobile: 1125,
  tablet: 1792,
  desktop: 2000,
};

/** Desktop compositions stop growing at this host width (HUB centres beyond 2200). */
export const WORKSPACE_MAX_SCALE_WIDTH = 2200;

/**
 * Size of each tier in HUB authority px, per family, plus the legibility floor HUB applies on phones.
 * Values are the HUB tokens themselves (mobile block / tablet block / root block of the HUB CSS).
 */
export const WORKSPACE_TYPE_SCALE: Record<ProductionViewportFamily, Record<WorkspaceTypeTier, { au: number; floorPx: number }>> = {
  mobile: {
    T0: { au: 17, floorPx: 6.5 },
    T1: { au: 19, floorPx: 7 },
    T2: { au: 19, floorPx: 7 },
    T3: { au: 24, floorPx: 8.5 },
    T4: { au: 28, floorPx: 9.5 },
    T5: { au: 38, floorPx: 12 },
    T6: { au: 58, floorPx: 18 },
    METRIC: { au: 34, floorPx: 11 },
  },
  tablet: {
    T0: { au: 18.5, floorPx: 8 },
    T1: { au: 19, floorPx: 8.5 },
    T2: { au: 22, floorPx: 9.5 },
    T3: { au: 28, floorPx: 11 },
    T4: { au: 28, floorPx: 12 },
    T5: { au: 50, floorPx: 20 },
    T6: { au: 74, floorPx: 30 },
    METRIC: { au: 38, floorPx: 16 },
  },
  desktop: {
    T0: { au: 16.5, floorPx: 10 },
    T1: { au: 17, floorPx: 10.5 },
    T2: { au: 20, floorPx: 12 },
    T3: { au: 24, floorPx: 14 },
    T4: { au: 26, floorPx: 15 },
    T5: { au: 44, floorPx: 24 },
    T6: { au: 66, floorPx: 36 },
    METRIC: { au: 34, floorPx: 20 },
  },
};

/** Computed px of a tier at a given host width (mirrors the CSS `max(floor, au * width / artboard)`). */
export function workspaceTypePx(family: ProductionViewportFamily, tier: WorkspaceTypeTier, width: number): number {
  const { au, floorPx } = WORKSPACE_TYPE_SCALE[family][tier];
  const w = Math.min(width, WORKSPACE_MAX_SCALE_WIDTH);
  return Math.max(floorPx, (au * w) / WORKSPACE_AUTHORITY_ARTBOARD[family]);
}

/**
 * Material-deviation threshold: a measured text layer more than this factor above its HUB-equivalent tier is
 * an exception that needs a documented functional / creative reason.
 */
export const WORKSPACE_TYPE_DEVIATION_LIMIT = 1.15;

/* ─────────────────────────────────────────── panel density ─────────────────────────────────────────── */

export type WorkspacePanelDensity = {
  /** Inner padding of a panel / card (authority px). */
  pad: number;
  /** Gap between panels in a stack (authority px). */
  gap: number;
  /** Gap between rows inside a panel (authority px). */
  rowGap: number;
  /** Panel corner radius (CSS px — HUB cards keep a fixed small radius). */
  radiusPx: number;
  /** Minimum touch-target height for interactive rows / controls (CSS px). */
  minTargetPx: number;
};

export const WORKSPACE_PANEL_DENSITY: Record<ProductionViewportFamily, WorkspacePanelDensity> = {
  // HUB mobile: --pad 38 · --row-gap 15 · --card-pad 17
  mobile: { pad: 38, gap: 15, rowGap: 15, radiusPx: 6, minTargetPx: 28 },
  tablet: { pad: 47, gap: 22, rowGap: 14, radiusPx: 6, minTargetPx: 32 },
  desktop: { pad: 65, gap: 30, rowGap: 14, radiusPx: 6, minTargetPx: 32 },
};

/* ─────────────────────────────────────────── media framing ─────────────────────────────────────────── */

export type WorkspaceMediaFitMode =
  | 'THUMBNAIL_COVER'
  | 'THUMBNAIL_CONTAIN'
  | 'PORTRAIT_COVER'
  | 'LANDSCAPE_COVER'
  | 'LOGO_CONTAIN'
  | 'UI_CAPTURE_CONTAIN'
  | 'AUTHORITY_PREVIEW_COVER'
  | 'WIDE_SCENE_COVER'
  | 'DOCUMENT_PREVIEW_CONTAIN';

export type WorkspaceMediaFitDef = {
  fit: 'cover' | 'contain';
  /** Default focal position (object-position / background-position). Overridable per asset. */
  focal: string;
  /** Whether cropping is part of the contract (cover) or forbidden (contain). */
  crop: 'INTENTIONAL' | 'NONE';
  /** Backdrop shown in the unused area of a contain fit. */
  backdrop: 'NONE' | 'NEUTRAL' | 'DARK';
  purpose: string;
};

export const WORKSPACE_MEDIA_FIT_MODES: Record<WorkspaceMediaFitMode, WorkspaceMediaFitDef> = {
  THUMBNAIL_COVER: { fit: 'cover', focal: '50% 50%', crop: 'INTENTIONAL', backdrop: 'NONE', purpose: 'Row / strip thumbnails (HUB ops + feed thumbs).' },
  THUMBNAIL_CONTAIN: { fit: 'contain', focal: '50% 50%', crop: 'NONE', backdrop: 'NEUTRAL', purpose: 'Small previews whose whole subject must stay visible.' },
  PORTRAIT_COVER: { fit: 'cover', focal: '50% 22%', crop: 'INTENTIONAL', backdrop: 'NONE', purpose: 'Cast / actor / character portraits — keeps the face in frame.' },
  LANDSCAPE_COVER: { fit: 'cover', focal: '50% 45%', crop: 'INTENTIONAL', backdrop: 'NONE', purpose: 'Landscape tiles and card media (HUB entry / feature).' },
  LOGO_CONTAIN: { fit: 'contain', focal: '50% 50%', crop: 'NONE', backdrop: 'NONE', purpose: 'Logos, marks, transparent brand assets — never cropped, never stretched.' },
  UI_CAPTURE_CONTAIN: { fit: 'contain', focal: '50% 0%', crop: 'NONE', backdrop: 'NEUTRAL', purpose: 'UI screenshots / authority captures — nav, title and key state stay visible.' },
  AUTHORITY_PREVIEW_COVER: { fit: 'cover', focal: '50% 0%', crop: 'INTENTIONAL', backdrop: 'NONE', purpose: 'Authority previews framed from the top so the title band survives.' },
  WIDE_SCENE_COVER: { fit: 'cover', focal: '50% 42%', crop: 'INTENTIONAL', backdrop: 'NONE', purpose: 'Environment / hero plates — crops to the visual anchor, never squashes.' },
  DOCUMENT_PREVIEW_CONTAIN: { fit: 'contain', focal: '50% 50%', crop: 'NONE', backdrop: 'NEUTRAL', purpose: 'Documents / records — page bounds preserved.' },
};

export type WorkspaceMediaSlotType =
  | 'ROW_THUMB'
  | 'STRIP_THUMB'
  | 'CARD_MEDIA'
  | 'PORTRAIT'
  | 'FEATURE_MEDIA'
  | 'HERO_PLATE'
  | 'LOGO_MARK'
  | 'UI_CAPTURE'
  | 'DOCUMENT'
  | 'BOARD_PREVIEW';

export type WorkspaceMediaSlotDef = {
  type: WorkspaceMediaSlotType;
  /** CSS aspect-ratio of the slot, or 'COMPOSED' when the parent composition owns the box (board previews). */
  aspect: string;
  defaultFit: WorkspaceMediaFitMode;
  /**
   * Mobile slot size: a fixed inline size (row thumbs) or a max block size (cards / plates). A max block size is
   * enforced THROUGH the inline size (`min(100%, maxBlock × aspect)`) so the aspect always holds — a cap never
   * crushes the frame into an undeclared strip.
   */
  mobile: { inline?: string; maxBlock?: string };
  overflow: 'CLIP_TO_SLOT';
  radius: string;
  frame: 'NONE' | 'HAIRLINE' | 'DARK_BACKDROP';
  responsive: string;
  hubSource: string;
};

export const WORKSPACE_MEDIA_SLOTS: Record<WorkspaceMediaSlotType, WorkspaceMediaSlotDef> = {
  ROW_THUMB: { type: 'ROW_THUMB', aspect: '1 / 1', defaultFit: 'THUMBNAIL_COVER', mobile: { inline: 'var(--pw-thumb-row)' }, overflow: 'CLIP_TO_SLOT', radius: 'var(--pw-media-radius)', frame: 'NONE', responsive: 'fixed square that scales with the HUB unit; never grows with the source', hubSource: '.hubx-ops__list .pxa-thumb (--op-thumb 58)' },
  STRIP_THUMB: { type: 'STRIP_THUMB', aspect: '16 / 10', defaultFit: 'LANDSCAPE_COVER', mobile: { maxBlock: 'var(--pw-thumb-strip)' }, overflow: 'CLIP_TO_SLOT', radius: 'var(--pw-media-radius)', frame: 'NONE', responsive: 'fills its cell up to the cap; block size from the aspect (aspect holds under the cap)', hubSource: '.hubx-entry .pxa-thumb (--entry-img 98)' },
  CARD_MEDIA: { type: 'CARD_MEDIA', aspect: '16 / 9', defaultFit: 'LANDSCAPE_COVER', mobile: { maxBlock: 'var(--pw-media-card)' }, overflow: 'CLIP_TO_SLOT', radius: 'var(--pw-media-radius)', frame: 'NONE', responsive: 'media on top of a card; capped (aspect holds) so text stays the primary read', hubSource: '.hubx-feature .pxa-thumb (--feature-h 140)' },
  PORTRAIT: { type: 'PORTRAIT', aspect: '4 / 5', defaultFit: 'PORTRAIT_COVER', mobile: { maxBlock: 'var(--pw-media-portrait)' }, overflow: 'CLIP_TO_SLOT', radius: 'var(--pw-media-radius)', frame: 'NONE', responsive: 'portrait slot with upper-third focal point', hubSource: 'HUB cast thumbs (face-led crops)' },
  FEATURE_MEDIA: { type: 'FEATURE_MEDIA', aspect: '3 / 2', defaultFit: 'LANDSCAPE_COVER', mobile: { maxBlock: 'var(--pw-media-feature)' }, overflow: 'CLIP_TO_SLOT', radius: 'var(--pw-media-radius)', frame: 'NONE', responsive: 'side media of a featured panel; stacks above text on narrow phones', hubSource: '.hubx-feature (feature card media)' },
  HERO_PLATE: { type: 'HERO_PLATE', aspect: '1125 / 315', defaultFit: 'WIDE_SCENE_COVER', mobile: { maxBlock: 'var(--pw-hero-h)' }, overflow: 'CLIP_TO_SLOT', radius: '0', frame: 'NONE', responsive: 'band height from the HUB hero (--hero-h); copy sits on a wash, never on raw imagery', hubSource: '.hubx-hero (--hero-h 315)' },
  LOGO_MARK: { type: 'LOGO_MARK', aspect: '1 / 1', defaultFit: 'LOGO_CONTAIN', mobile: { inline: 'var(--pw-thumb-row)' }, overflow: 'CLIP_TO_SLOT', radius: '0', frame: 'NONE', responsive: 'contain, centred, transparency preserved', hubSource: 'host project mark' },
  UI_CAPTURE: { type: 'UI_CAPTURE', aspect: '9 / 16', defaultFit: 'UI_CAPTURE_CONTAIN', mobile: { maxBlock: 'var(--pw-media-capture)' }, overflow: 'CLIP_TO_SLOT', radius: 'var(--pw-media-radius)', frame: 'DARK_BACKDROP', responsive: 'contain inside a backdrop; whole capture legible', hubSource: 'DESIGN viewport device frames' },
  BOARD_PREVIEW: { type: 'BOARD_PREVIEW', aspect: 'COMPOSED', defaultFit: 'AUTHORITY_PREVIEW_COVER', mobile: {}, overflow: 'CLIP_TO_SLOT', radius: 'composition', frame: 'NONE', responsive: 'miniature board / plate preview inside the DESIGN chamber; the chamber composition owns the box, the slot owns the fit', hubSource: 'DESIGN chamber authority panels' },
  DOCUMENT: { type: 'DOCUMENT', aspect: '3 / 4', defaultFit: 'DOCUMENT_PREVIEW_CONTAIN', mobile: { maxBlock: 'var(--pw-media-portrait)' }, overflow: 'CLIP_TO_SLOT', radius: 'var(--pw-media-radius)', frame: 'HAIRLINE', responsive: 'contain; page edges always visible', hubSource: 'narrative / document records' },
};

/**
 * Frame ownership. The slot GEOMETRY above drives the shared primitive (WorkspaceMediaSlot / WorkspacePanel).
 * Existing tab compositions keep their authored media frame (HUB is the authority for those frames); for them the
 * contract governs fit, focal, radius, missing-state and source independence — and forbids any shared rule from
 * changing the authored frame's aspect.
 */
export const WORKSPACE_MEDIA_FRAME_OWNERSHIP = {
  primitive: 'SLOT — aspect + capped size from WORKSPACE_MEDIA_SLOTS (mobile), panel layout at every width',
  composition: 'COMPOSITION — authored frame (tab CSS / density layer per tab); fit, focal, radius and missing state from the slot contract',
} as const;

/** Resolve the effective fit + focal for a slot (explicit fit mode wins; explicit focal wins over the mode). */
export function resolveWorkspaceMedia(slot: WorkspaceMediaSlotType, fitMode?: WorkspaceMediaFitMode, focal?: string) {
  const mode = fitMode ?? WORKSPACE_MEDIA_SLOTS[slot].defaultFit;
  const def = WORKSPACE_MEDIA_FIT_MODES[mode];
  return { slot, mode, fit: def.fit, focal: focal ?? def.focal, crop: def.crop, backdrop: def.backdrop, aspect: WORKSPACE_MEDIA_SLOTS[slot].aspect };
}
