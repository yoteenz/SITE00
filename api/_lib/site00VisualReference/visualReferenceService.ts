/**
 * Visual Reference Intelligence service — capture, memory, package compilation.
 */

import { execSync } from 'node:child_process';
import type {
  HostVisualMemory,
  VisualGenerationIntent,
  VisualReferencePackage,
  VisualReferenceRecord,
  ViewportClass,
} from '../../../shared/site00-visual-reference/types.js';
import {
  compileVisualCaptureManifest,
  compileVisualReferencePackage,
  seedDefaultHostVisualMemory,
  seedNdxbookClientVisualMemory,
  createEmptyClientVisualMemory,
  buildStructuralProofReference,
  buildNegativeStyleProofReference,
} from '../../../shared/site00-visual-reference/index.js';
import type { ReferenceSelectionInput } from '../../../shared/site00-visual-reference/referenceSelection.js';
import { captureSite00RouteReference } from './captureService.js';
import * as store from './storeAdapter.js';

function getSourceCommit(): string | null {
  if (process.env.VITEST === 'true') return 'vitest-seed';
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 12);
  } catch {
    return null;
  }
}

function getCaptureBaseUrl(): string {
  return (
    process.env.SITE00_CAPTURE_BASE_URL?.trim() ||
    process.env.VITE_SITE00_CANONICAL_ORIGIN?.trim() ||
    'http://127.0.0.1:5174'
  );
}

export async function initializeVisualReferenceMemory(): Promise<{
  host: HostVisualMemory;
  client: ReturnType<typeof seedNdxbookClientVisualMemory>;
}> {
  const existing = await store.getHostVisualMemory();
  if (existing) {
    const client = (await store.getClientVisualMemory('ndxbook')) ?? seedNdxbookClientVisualMemory();
    await store.saveClientVisualMemory(client);
    return { host: existing, client };
  }

  const sourceCommit = getSourceCommit();
  const host = seedDefaultHostVisualMemory(sourceCommit);
  await store.saveHostVisualMemory(host);
  const client = seedNdxbookClientVisualMemory();
  await store.saveClientVisualMemory(client);
  return { host, client };
}

export async function refreshVisualReferences(params: {
  generationIntent: VisualGenerationIntent;
  targetDevice?: ViewportClass;
}): Promise<{ host: HostVisualMemory; captured: VisualReferenceRecord[]; reused: number }> {
  const manifest = compileVisualCaptureManifest({
    generationIntent: params.generationIntent,
    targetDevice: params.targetDevice,
  });

  let host = (await store.getHostVisualMemory()) ?? seedDefaultHostVisualMemory(getSourceCommit());
  const sourceCommit = getSourceCommit();
  const baseUrl = getCaptureBaseUrl();
  const captured: VisualReferenceRecord[] = [];
  let reused = 0;

  for (const entry of manifest.entries) {
    const result = await captureSite00RouteReference({
      route: entry.route,
      viewportClass: entry.viewportClass,
      captureState: entry.captureState,
      baseUrl,
      sourceCommit,
      referenceRoles: entry.referenceRoles,
      authorityScopes: entry.authorityScopes,
      authority: entry.authority,
      approvalStatus: entry.approvalStatus,
      sourceType: entry.sourceType,
      label: entry.label,
      existingReferences: host.references,
    });

    if (result.ok) {
      if (result.reused) reused += 1;
      else captured.push(result.reference);
      const exists = host.references.some((r) => r.id === result.reference.id);
      if (!exists) {
        host = { ...host, references: [...host.references, result.reference] };
      }
    }
  }

  host = {
    ...host,
    lastRefreshedAt: new Date().toISOString(),
    sourceCommit,
  };
  await store.saveHostVisualMemory(host);
  return { host, captured, reused };
}

export async function classifyExistingProofAsStructuralReference(params: {
  proofRecordId: string;
  storagePath: string;
  publicUrl: string | null;
}): Promise<{ structural: VisualReferenceRecord; negative: VisualReferenceRecord }> {
  const structural = buildStructuralProofReference(params);
  const negative = buildNegativeStyleProofReference(structural);
  await store.saveVisualReference(structural);
  await store.saveVisualReference(negative);
  return { structural, negative };
}

export async function compileReferencePackageForIntent(params: {
  generationIntent: VisualGenerationIntent;
  targetDevice?: ViewportClass;
  structuralProofReference?: VisualReferenceRecord | null;
  negativeProofReference?: VisualReferenceRecord | null;
  excludedReferenceIds?: string[];
  founderAuthorityOverrides?: Record<string, Partial<VisualReferenceRecord['authority']>>;
}): Promise<VisualReferencePackage> {
  const { host, client } = await initializeVisualReferenceMemory();

  const selectionInput: ReferenceSelectionInput = {
    generationIntent: params.generationIntent,
    targetSurface: params.generationIntent === 'SITE00_PROJECTS_INDEX_DESIGN_PROOF' ? '/projects' : '/projects/ndxbook',
    targetDevice: params.targetDevice ?? 'DESKTOP',
    hostMemory: host,
    clientMemory: client,
    structuralProofReference: params.structuralProofReference ?? null,
    negativeProofReference: params.negativeProofReference ?? null,
    excludedReferenceIds: params.excludedReferenceIds,
    founderAuthorityOverrides: params.founderAuthorityOverrides,
  };

  return compileVisualReferencePackage({
    generationIntent: params.generationIntent,
    targetDevice: params.targetDevice,
    selectionInput,
    strictHostVisualConditioning: params.generationIntent === 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
  });
}

export async function excludeVisualReference(referenceId: string): Promise<boolean> {
  const ref = await store.getVisualReferenceById(referenceId);
  if (!ref) return false;
  await store.saveVisualReference({ ...ref, stalenessState: 'SUPERSEDED', updatedAt: new Date().toISOString() });
  return true;
}

export async function approveHostVisualBaseline(referenceId: string): Promise<boolean> {
  const host = await store.getHostVisualMemory();
  if (!host) return false;
  if (!host.references.some((r) => r.id === referenceId)) return false;
  const approvedHostBaselineIds = host.approvedHostBaselineIds.includes(referenceId)
    ? host.approvedHostBaselineIds
    : [...host.approvedHostBaselineIds, referenceId];
  await store.saveHostVisualMemory({ ...host, approvedHostBaselineIds });
  return true;
}

export function resetVisualReferenceServiceMemory(): void {
  store.resetVisualReferenceMemory();
  store.resetVisualReferenceStoreModeCache();
}

export async function getVisualReferenceIntelligenceState(): Promise<{
  host: HostVisualMemory | null;
  client: ReturnType<typeof createEmptyClientVisualMemory> | null;
}> {
  return {
    host: await store.getHostVisualMemory(),
    client: await store.getClientVisualMemory('ndxbook'),
  };
}
