/**
 * B5.0R2 — Founder-supplied storyboard import (first-class production path).
 */

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type {
  FinalCinematicStoryboardPanelManifestEntry,
  FinalCinematicStoryboardRecord,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_VERSION,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_006_ID,
  buildEntry002FinalCinematicStoryboardPublicStripPath,
  buildEntry002FinalCinematicStoryboardStripStoragePath,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from './entry002PreStoryboardFounderApproval.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { recordStoryboardImport } from './storyboardGenerationCostGuard.js';

export const FOUNDER_STORYBOARD_VARIANT_A_PUBLIC_PATH =
  '/assets/expression-engine/entry-002/founder-storyboard/entry-002-storyboard-variant-a.jpg' as const;

export const FOUNDER_STORYBOARD_VARIANT_B_PUBLIC_PATH =
  '/assets/expression-engine/entry-002/founder-storyboard/entry-002-storyboard-variant-b.jpg' as const;

const VARIANT_PATHS = {
  A: FOUNDER_STORYBOARD_VARIANT_A_PUBLIC_PATH,
  B: FOUNDER_STORYBOARD_VARIANT_B_PUBLIC_PATH,
} as const;

export type FounderStoryboardVariant = keyof typeof VARIANT_PATHS;

export function resolveFounderStoryboardVariantPath(variant: FounderStoryboardVariant): string {
  return VARIANT_PATHS[variant];
}

export function buildEntry002FounderSuppliedStoryboard006Record(params: {
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
  stripUrl: string;
  stripPath: string;
  variant: FounderStoryboardVariant;
  structuralQaStatus?: FinalCinematicStoryboardRecord['structuralQaStatus'];
  continuityQaStatus?: FinalCinematicStoryboardRecord['continuityQaStatus'];
  reelCoherenceQaStatus?: FinalCinematicStoryboardRecord['reelCoherenceQaStatus'];
}): FinalCinematicStoryboardRecord {
  const now = new Date().toISOString();
  recordStoryboardImport();

  return {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_ID,
    entryId: 'entry-002',
    version: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_VERSION,
    status: 'AWAITING_FOUNDER_APPROVAL',
    founderJudgment: 'UNREVIEWED',
    canon: false,
    visualAuthority: false,
    referenceOnly: false,
    failureReason: null,
    assetId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_006_ID,
    sourceTreatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001',
    authorityIds: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.map((a) => a.authorityId),
    chapterId: CHAPTER_01_ID,
    worldId: ENTRY_002_WORLD_ID,
    continuityQaStatus: params.continuityQaStatus ?? 'PASS',
    structuralQaStatus: params.structuralQaStatus ?? 'PASS',
    duplicationQaStatus: 'PASS',
    renderModeQaStatus: 'PASS',
    reelCoherenceQaStatus: params.reelCoherenceQaStatus ?? 'PASS',
    boardTypeQaStatus: 'PASS',
    visualAuthorityFidelityQaStatus: 'PASS',
    readinessState: 'VISUAL_REVIEW_READY',
    generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
    panelCount: params.manifest.length,
    panels: [],
    panelManifest: params.manifest,
    storyboardStripPath: params.stripPath,
    storyboardStripUrl: params.stripUrl,
    compiled: true,
    dispatched: false,
    rendered: true,
    assembled: true,
    approved: false,
    provider: null,
    providerRequestId: null,
    storyboardSource: 'FOUNDER_SUPPLIED',
    sourceArtifactOrigin: 'FOUNDER_SUPPLIED',
    telemetry: {
      storyboardCompileCount: 0,
      storyboardDispatchCount: 0,
      storyboardRenderCount: 0,
      panelManifestCount: params.manifest.length,
      panelDispatchCount: 0,
      panelRenderCount: 0,
      storyboardGenerationAttemptCount: 0,
      storyboardProviderDispatchCount: 0,
      storyboardImportedCount: 1,
      storyboardFailedGenerationCount: 0,
      storyboardAutoRetryCount: 0,
      storyboardFounderSuppliedCount: 1,
      assembled: true,
      compiled: true,
      dispatched: false,
      rendered: true,
    },
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
  };
}

export function importFounderStoryboardVariant(params: {
  variant: FounderStoryboardVariant;
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
}): FinalCinematicStoryboardRecord {
  const stripId = ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_006_ID;
  const publicPath = buildEntry002FinalCinematicStoryboardPublicStripPath(stripId);
  const storagePath = buildEntry002FinalCinematicStoryboardStripStoragePath(stripId);
  const variantPath = resolveFounderStoryboardVariantPath(params.variant);

  return buildEntry002FounderSuppliedStoryboard006Record({
    manifest: params.manifest,
    stripUrl: publicPath,
    stripPath: storagePath,
    variant: params.variant,
  });
}

/** Copy bundled founder reference images into public assets (idempotent). */
export function ensureFounderStoryboardAssetsOnDisk(workspaceRoot: string): void {
  const destDir = join(workspaceRoot, 'public/assets/expression-engine/entry-002/founder-storyboard');
  mkdirSync(destDir, { recursive: true });

  const copies: Array<{ src: string; dest: string }> = [
    {
      src: join(workspaceRoot, 'assets/founder-storyboard/entry-002-storyboard-variant-a.jpg'),
      dest: join(destDir, 'entry-002-storyboard-variant-a.jpg'),
    },
    {
      src: join(workspaceRoot, 'assets/founder-storyboard/entry-002-storyboard-variant-b.jpg'),
      dest: join(destDir, 'entry-002-storyboard-variant-b.jpg'),
    },
  ];

  for (const { src, dest } of copies) {
    if (existsSync(src) && !existsSync(dest)) {
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(src, dest);
    }
  }

  const stripPath = join(
    workspaceRoot,
    'public/assets/expression-engine/entry-002/final-cinematic-storyboard',
    `${ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_006_ID.toLowerCase()}.jpg`,
  );
  if (!existsSync(stripPath) && existsSync(copies[0].dest)) {
    mkdirSync(dirname(stripPath), { recursive: true });
    copyFileSync(copies[0].dest, stripPath);
  }
}
