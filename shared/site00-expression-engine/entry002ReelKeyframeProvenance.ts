/**
 * Sprint B4.3 — authoritative Entry 002 REEL keyframe provenance manifest.
 *
 * Record A (B4.1): gpt-image-2 fallback — superseded, storage overwritten.
 * Record B (B4.2): fal-ai/flux-pro/v1.1 — authoritative executed rasters in storage.
 */

import type { ReelKeyframeRole } from './entry002ReelTypes.js';
import {
  ENTRY_002_REEL_KF_END_001,
  ENTRY_002_REEL_KF_MID_001,
  ENTRY_002_REEL_KF_START_001,
  buildEntry002ReelKeyframeStoragePath,
} from './entry002ReelKeyframeIds.js';

export type ReelKeyframeSupersededExecution = {
  label: 'RECORD_A_B41_GPT_IMAGE_FALLBACK';
  generationReceiptId: string;
  provider: 'fal-gpt-image';
  executedModel: 'openai/gpt-image-2';
  fallbackUsed: true;
  fallbackReason: string;
  status: 'SUPERSEDED';
};

export type ReelKeyframeAuthoritativeProvenance = {
  role: ReelKeyframeRole;
  assetId: string;
  storagePath: string;
  planningReceiptId: string;
  generationReceiptId: string;
  providerRequestId: string;
  provider: 'fal-flux';
  routedProvider: 'fal-flux';
  requestedModel: 'fal-ai/flux-pro/v1.1';
  executedModel: 'fal-ai/flux-pro/v1.1';
  fallbackUsed: false;
  supersededExecutions: ReelKeyframeSupersededExecution[];
  lineageCorrectedInB43: true;
};

export const ENTRY_002_REEL_KF_AUTHORITATIVE_PROVENANCE: ReelKeyframeAuthoritativeProvenance[] = [
  {
    role: 'START',
    assetId: ENTRY_002_REEL_KF_START_001,
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_START_001),
    planningReceiptId: 'b43-plan-kf-start-001',
    generationReceiptId: 'b43-gen-kf-start-001',
    providerRequestId: '01a07d97-a27a-7b41-9c1e-1a7e93418711',
    provider: 'fal-flux',
    routedProvider: 'fal-flux',
    requestedModel: 'fal-ai/flux-pro/v1.1',
    executedModel: 'fal-ai/flux-pro/v1.1',
    fallbackUsed: false,
    supersededExecutions: [
      {
        label: 'RECORD_A_B41_GPT_IMAGE_FALLBACK',
        generationReceiptId: '48a48154-30d0-4a49-acca-e31cefa2eeff',
        provider: 'fal-gpt-image',
        executedModel: 'openai/gpt-image-2',
        fallbackUsed: true,
        fallbackReason:
          'fal-ai/flux-pro rejected output_format webp (422); routed fallback openai/gpt-image-2 produced first-pass raster — later superseded by B4.2 flux-pro/v1.1 re-dispatch',
        status: 'SUPERSEDED',
      },
    ],
    lineageCorrectedInB43: true,
  },
  {
    role: 'MID',
    assetId: ENTRY_002_REEL_KF_MID_001,
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_MID_001),
    planningReceiptId: 'b43-plan-kf-mid-001',
    generationReceiptId: 'b43-gen-kf-mid-001',
    providerRequestId: '01a07d97-b12a-7301-937b-dbab01d58aab',
    provider: 'fal-flux',
    routedProvider: 'fal-flux',
    requestedModel: 'fal-ai/flux-pro/v1.1',
    executedModel: 'fal-ai/flux-pro/v1.1',
    fallbackUsed: false,
    supersededExecutions: [
      {
        label: 'RECORD_A_B41_GPT_IMAGE_FALLBACK',
        generationReceiptId: 'cde8598e-50bf-463e-b06c-2bf88b3ab525',
        provider: 'fal-gpt-image',
        executedModel: 'openai/gpt-image-2',
        fallbackUsed: true,
        fallbackReason:
          'fal-ai/flux-pro rejected output_format webp (422); routed fallback openai/gpt-image-2 produced first-pass raster — later superseded by B4.2 flux-pro/v1.1 re-dispatch',
        status: 'SUPERSEDED',
      },
    ],
    lineageCorrectedInB43: true,
  },
  {
    role: 'END',
    assetId: ENTRY_002_REEL_KF_END_001,
    storagePath: buildEntry002ReelKeyframeStoragePath(ENTRY_002_REEL_KF_END_001),
    planningReceiptId: 'b43-plan-kf-end-001',
    generationReceiptId: 'b43-gen-kf-end-001',
    providerRequestId: '01a07d97-c2ce-7cf1-acef-1d152a82622f',
    provider: 'fal-flux',
    routedProvider: 'fal-flux',
    requestedModel: 'fal-ai/flux-pro/v1.1',
    executedModel: 'fal-ai/flux-pro/v1.1',
    fallbackUsed: false,
    supersededExecutions: [
      {
        label: 'RECORD_A_B41_GPT_IMAGE_FALLBACK',
        generationReceiptId: 'c914b91e-34b8-4fb2-bf92-8d2e36880330',
        provider: 'fal-gpt-image',
        executedModel: 'openai/gpt-image-2',
        fallbackUsed: true,
        fallbackReason:
          'fal-ai/flux-pro rejected output_format webp (422); routed fallback openai/gpt-image-2 produced first-pass raster — later superseded by B4.2 flux-pro/v1.1 re-dispatch',
        status: 'SUPERSEDED',
      },
    ],
    lineageCorrectedInB43: true,
  },
];

export function getAuthoritativeProvenance(role: ReelKeyframeRole): ReelKeyframeAuthoritativeProvenance {
  const record = ENTRY_002_REEL_KF_AUTHORITATIVE_PROVENANCE.find((p) => p.role === role);
  if (!record) throw new Error(`No authoritative provenance for role ${role}`);
  return record;
}
