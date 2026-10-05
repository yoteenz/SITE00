/**
 * P0.E.FT4 — AW_VISUAL_FOUNDATION_V1 generation manifest.
 */

import {
  buildAllAstralAssetContracts,
  P0_SLOT_KEYS,
  P1_SLOT_KEYS,
  P2_SLOT_KEYS,
} from './assetSlotRegistry.js';
import type { VisualAssetContract } from './types.js';
import { AW_VISUAL_FOUNDATION_BATCH } from './types.js';

export const AW_GENERATION_MANIFEST_V1 = {
  batchId: AW_VISUAL_FOUNDATION_BATCH,
  projectId: 'astral-world' as const,
  version: 1,
  description: 'Initial Astral World cinematic foundation — P0 environments, P1 people, P2 artifacts',
  priorityOrder: [...P0_SLOT_KEYS, ...P1_SLOT_KEYS, ...P2_SLOT_KEYS],
  maxConcurrentJobs: 2,
  governance: {
    truthLayer: 'CREATIVE_EXPLORATION' as const,
    fastTrackPrototype: true as const,
    autoCanonize: false as const,
  },
};

export function getManifestContracts(): VisualAssetContract[] {
  return buildAllAstralAssetContracts();
}

export function getP0Contracts(): VisualAssetContract[] {
  return buildAllAstralAssetContracts().filter((c) => c.priority === 'P0');
}

export function getP1Contracts(): VisualAssetContract[] {
  return buildAllAstralAssetContracts().filter((c) => c.priority === 'P1');
}

export function getP2Contracts(): VisualAssetContract[] {
  return buildAllAstralAssetContracts().filter((c) => c.priority === 'P2');
}

export function countByPriority(): { p0: number; p1: number; p2: number; total: number } {
  const all = buildAllAstralAssetContracts();
  return {
    p0: all.filter((c) => c.priority === 'P0').length,
    p1: all.filter((c) => c.priority === 'P1').length,
    p2: all.filter((c) => c.priority === 'P2').length,
    total: all.length,
  };
}
