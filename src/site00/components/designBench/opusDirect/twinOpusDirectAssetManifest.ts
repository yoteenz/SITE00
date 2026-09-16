/**
 * P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — canonical asset authority for
 * `/projects/:projectSlug/design/twin-opus-direct`.
 *
 * This module is the ONLY place the route may learn what a visual slot points
 * at. Both presentation renderers (CANONICAL and LIST) resolve through it, so
 * asset identity cannot fork per view; a renderer may only change crop and
 * framing via CSS.
 *
 * Why this exists: the Grok plate set from GROK-ASSET-OPUS1 was merged into the
 * already-merged feature branch `cursor/twin-opus-direct-e65d` rather than into
 * `main`, so every later sprint branched from a `main` that had never contained
 * the plates. The assets were not "reverted" at runtime — they were never in the
 * mainline tree. Centralising slot identity here plus the file-existence guard
 * in `tests/p0vrOpusAssetPersistence1.test.ts` is what makes that loss loud.
 */

import { TWIN_OPUS_DIRECT_PAPER_TEXTURE } from './twinOpusDirectContent';

/** Bump when slot identity changes so stale caches can be reasoned about. */
export const TWIN_OPUS_DIRECT_ASSET_MANIFEST_VERSION = 'twin-opus-direct-assets-v1';

/**
 * Strict precedence. A lower-ranked source may never overwrite a higher-ranked
 * one; a fallback is consulted only when no approved asset exists for the slot.
 */
export const TWIN_OPUS_DIRECT_ASSET_PRECEDENCE = [
  'FOUNDER_APPROVED',
  'GROK_APPROVED',
  'PROJECT',
  'LEGACY_FALLBACK',
] as const;

export type TwinOpusDirectAssetTier = (typeof TWIN_OPUS_DIRECT_ASSET_PRECEDENCE)[number];

export type TwinOpusDirectAssetSlotId =
  | 'hero'
  | 'authorityMobile'
  | 'authorityDesktop'
  | 'candidatePlate'
  | 'candidateGrain'
  | 'candidateCollage'
  | 'candidateArchive'
  | 'grounding'
  | 'blueprint'
  | 'overlay'
  | 'assetPack'
  | 'functionMap'
  | 'conceptRecord'
  | 'reservePortrait';

export interface TwinOpusDirectAssetEntry {
  readonly slot: TwinOpusDirectAssetSlotId;
  readonly assetId: string;
  readonly version: string;
  /** Approved source of record. `null` means the slot is intentionally imageless. */
  readonly src: string | null;
  readonly role: string;
  readonly tier: TwinOpusDirectAssetTier;
  readonly approved: boolean;
  readonly sourceModel: 'GROK' | 'OPUS' | 'FOUNDER' | 'NONE';
  readonly goldenLineage: string;
  readonly updatedAt: string;
  /** Used only when no approved asset exists for the slot. */
  readonly fallbackSrc: string | null;
  /** True when the slot is declared but not painted by either renderer. */
  readonly rendered: boolean;
}

const GROK_LINEAGE = 'P0.VR.DESIGNBENCH.GROK-ASSET-OPUS1';
const GROK_UPDATED_AT = '2026-09-15';

function grokPlate(
  slot: TwinOpusDirectAssetSlotId,
  assetId: string,
  role: string,
  file: string,
  rendered = true,
): TwinOpusDirectAssetEntry {
  return {
    slot,
    assetId,
    version: 'v1',
    src: `/site00/twin-opus-direct/${file}`,
    role,
    tier: 'GROK_APPROVED',
    approved: true,
    sourceModel: 'GROK',
    goldenLineage: GROK_LINEAGE,
    updatedAt: GROK_UPDATED_AT,
    fallbackSrc: TWIN_OPUS_DIRECT_PAPER_TEXTURE,
    rendered,
  };
}

export const TWIN_OPUS_DIRECT_ASSET_MANIFEST: readonly TwinOpusDirectAssetEntry[] = [
  grokPlate('hero', 'tod-hand-plate', 'HERO_ARCHIVAL_PLATE', 'tod-hand-plate.jpg'),
  grokPlate('authorityMobile', 'tod-hand-plate', 'AUTHORITY_MOBILE_MASTER_THUMB', 'tod-hand-plate.jpg'),
  grokPlate('authorityDesktop', 'tod-hand-plate', 'AUTHORITY_DESKTOP_MASTER_THUMB', 'tod-hand-plate.jpg'),
  grokPlate('candidatePlate', 'tod-hand-plate', 'CANDIDATE_V13_PLATE', 'tod-hand-plate.jpg'),
  grokPlate('candidateGrain', 'tod-hand-plate', 'CANDIDATE_V12_GRAIN', 'tod-hand-plate.jpg'),
  grokPlate('candidateCollage', 'tod-collage-plate', 'CANDIDATE_V11_COLLAGE', 'tod-collage-plate.jpg'),
  grokPlate('candidateArchive', 'tod-001-split', 'CANDIDATE_V10_ARCHIVE', 'tod-001-split.jpg'),
  grokPlate('grounding', 'tod-form', 'STRUCTURED_OUTPUT_GROUNDING', 'tod-form.png'),
  grokPlate('blueprint', 'tod-blueprint', 'STRUCTURED_OUTPUT_BLUEPRINT', 'tod-blueprint.jpg'),
  grokPlate('overlay', 'tod-overlay-001', 'STRUCTURED_OUTPUT_OVERLAY', 'tod-overlay-001.png'),
  grokPlate('assetPack', 'tod-evidence-pack', 'STRUCTURED_OUTPUT_ASSET_PACK', 'tod-evidence-pack.jpg'),
  grokPlate('conceptRecord', 'tod-hand-plate', 'CONCEPT_RECORD_THUMB', 'tod-hand-plate.jpg'),
  // Delivered by GROK-ASSET-OPUS1 but never wired to a visible slot. Kept
  // approved and tracked so it is not mistaken for an orphan and deleted.
  grokPlate('reservePortrait', 'tod-portrait', 'RESERVE_PLATE', 'tod-portrait.png', false),
  {
    slot: 'functionMap',
    assetId: 'function-map-text',
    version: 'v1',
    src: null,
    role: 'STRUCTURED_OUTPUT_FUNCTION_MAP',
    tier: 'PROJECT',
    approved: true,
    sourceModel: 'NONE',
    goldenLineage: 'P0.VR.DESIGNBENCH.OPUS-DIRECT1',
    updatedAt: '2026-09-15',
    fallbackSrc: null,
    rendered: true,
  },
];

const BY_SLOT = new Map<TwinOpusDirectAssetSlotId, TwinOpusDirectAssetEntry>(
  TWIN_OPUS_DIRECT_ASSET_MANIFEST.map((entry) => [entry.slot, entry]),
);

export function twinOpusDirectAssetEntry(slot: TwinOpusDirectAssetSlotId): TwinOpusDirectAssetEntry {
  const entry = BY_SLOT.get(slot);
  if (!entry) throw new Error(`twin-opus-direct: unknown asset slot "${slot}"`);
  return entry;
}

/**
 * Resolve a slot to the source the renderers should paint. The fallback is
 * reachable only when the slot has no approved asset, which is what stops a
 * legacy texture from reclaiming an approved plate on remount.
 */
export function resolveTwinOpusDirectAsset(slot: TwinOpusDirectAssetSlotId): string | null {
  const entry = twinOpusDirectAssetEntry(slot);
  if (entry.approved && entry.src) return entry.src;
  return entry.fallbackSrc;
}

/**
 * Asset mutation is closed by default. OPUS owns layout, typography, UI and
 * icons; SPARK owns LIST presentation grammar; GROK owns raster imagery. Opus
 * and Spark may read, crop and reframe these plates — replacing a slot's source
 * identity requires a sprint that explicitly sets ASSET_MUTATION_ALLOWED = YES.
 */
export const TWIN_OPUS_DIRECT_ASSET_MUTATION_ALLOWED = false;

export const TWIN_OPUS_DIRECT_ASSET_OWNERSHIP = {
  OPUS: 'READ_ONLY',
  SPARK: 'READ_ONLY',
  GROK: 'MUTATE_WHEN_EXPLICITLY_REQUESTED',
} as const;
