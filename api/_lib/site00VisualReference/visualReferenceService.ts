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
import * as store from './visualReferenceMemoryStore.js';

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
  const existing = store.getHostVisualMemory();
  if (existing) {
    const client = store.getClientVisualMemory('ndxbook') ?? seedNdxbookClientVisualMemory();
    store.saveClientVisualMemory(client);
    return { host: existing, client };
  }

  const sourceCommit = getSourceCommit();
  const host = seedDefaultHostVisualMemory(sourceCommit);
  store.saveHostVisualMemory(host);
  const client = seedNdxbookClientVisualMemory();
  store.saveClientVisualMemory(client);
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

  let host = store.getHostVisualMemory() ?? seedDefaultHostVisualMemory(getSourceCommit());
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
  store.saveHostVisualMemory(host);
  return { host, captured, reused };
}

export function classifyExistingProofAsStructuralReference(params: {
  proofRecordId: string;
  storagePath: string;
  publicUrl: string | null;
}): { structural: VisualReferenceRecord; negative: VisualReferenceRecord } {
  const structural = buildStructuralProofReference(params);
  const negative = buildNegativeStyleProofReference(structural);
  store.saveVisualReference(structural);
  store.saveVisualReference(negative);
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

export function excludeVisualReference(referenceId: string): boolean {
  const ref = store.getVisualReferenceById(referenceId);
  if (!ref) return false;
  store.saveVisualReference({ ...ref, stalenessState: 'SUPERSEDED', updatedAt: new Date().toISOString() });
  return true;
}

export function approveHostVisualBaseline(referenceId: string): boolean {
  const host = store.getHostVisualMemory();
  if (!host) return false;
  if (!host.references.some((r) => r.id === referenceId)) return false;
  const approvedHostBaselineIds = host.approvedHostBaselineIds.includes(referenceId)
    ? host.approvedHostBaselineIds
    : [...host.approvedHostBaselineIds, referenceId];
  store.saveHostVisualMemory({ ...host, approvedHostBaselineIds });
  return true;
}

export function resetVisualReferenceServiceMemory(): void {
  store.resetVisualReferenceMemory();
}

export function getVisualReferenceIntelligenceState(): {
  host: HostVisualMemory | null;
  client: ReturnType<typeof createEmptyClientVisualMemory> | null;
} {
  return {
    host: store.getHostVisualMemory(),
    client: store.getClientVisualMemory('ndxbook'),
  };
}
