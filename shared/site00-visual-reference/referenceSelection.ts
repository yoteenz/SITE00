/**
 * Smart visual reference selection — minimal authoritative package, not all screenshots.
 */

import type {
  HostVisualMemory,
  ClientVisualMemory,
  VisualGenerationIntent,
  VisualReferenceRecord,
  VisualReferenceRole,
  ViewportClass,
} from './types.js';
import { deprioritizeStaleReferences } from './staleness.js';
import { rankReferenceForSelection } from './referenceConflictResolution.js';
import { validateReferenceForPackage } from './contaminationGuards.js';

export type ReferenceSelectionInput = {
  generationIntent: VisualGenerationIntent;
  targetSurface: string;
  targetDevice: ViewportClass;
  hostMemory: HostVisualMemory;
  clientMemory: ClientVisualMemory | null;
  structuralProofReference: VisualReferenceRecord | null;
  negativeProofReference: VisualReferenceRecord | null;
  excludedReferenceIds?: string[];
  founderAuthorityOverrides?: Record<string, Partial<VisualReferenceRecord['authority']>>;
};

function roleScore(ref: VisualReferenceRecord, desiredRoles: VisualReferenceRole[]): number {
  const matches = ref.referenceRoles.filter((r) => desiredRoles.includes(r)).length;
  return matches;
}

function viewportScore(ref: VisualReferenceRecord, targetDevice: ViewportClass): number {
  if (ref.viewportClass === targetDevice) return 0;
  if (targetDevice === 'DESKTOP' && ref.viewportClass === 'WIDE_DESKTOP') return 1;
  return 5;
}

function scoreReference(ref: VisualReferenceRecord, input: ReferenceSelectionInput, desiredRoles: VisualReferenceRole[]): number {
  const guard = validateReferenceForPackage(ref, {
    targetProjectId: input.clientMemory?.projectId ?? 'site00',
    targetDevice: input.targetDevice,
    targetScope: ref.authorityScopes.includes('CLIENT') ? 'CLIENT' : 'HOST',
  });
  if (!guard.allowed) return Infinity;
  if (input.excludedReferenceIds?.includes(ref.id)) return Infinity;
  return rankReferenceForSelection(ref) + viewportScore(ref, input.targetDevice) - roleScore(ref, desiredRoles) * 10;
}

function pickBest(
  pool: VisualReferenceRecord[],
  input: ReferenceSelectionInput,
  desiredRoles: VisualReferenceRole[],
  usedIds: Set<string>,
): VisualReferenceRecord | null {
  const candidates = deprioritizeStaleReferences(pool).filter((r) => !usedIds.has(r.id));
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => scoreReference(a, input, desiredRoles) - scoreReference(b, input, desiredRoles));
  const best = sorted[0];
  if (!best || scoreReference(best, input, desiredRoles) === Infinity) return null;
  return best;
}

const SITE00_PROJECTS_INDEX_ROLES: Record<string, VisualReferenceRole[]> = {
  hostShell: ['HOST_SHELL', 'HOST_NAVIGATION'],
  hostEnvironment: ['HOST_SPATIAL_ATMOSPHERE', 'HOST_COLOR_BEHAVIOR'],
  hostTypography: ['HOST_TYPOGRAPHY'],
  functionalSurface: ['CURRENT_FUNCTIONAL_SURFACE', 'CURRENT_INFORMATION_HIERARCHY'],
  structural: ['STRUCTURAL_HIERARCHY', 'SPATIAL_BEHAVIOR', 'ARTWORK_PARTICIPATION'],
  negative: ['NEGATIVE_REFERENCE', 'ANTI_DIRECTION'],
};

export function selectVisualReferencesForIntent(input: ReferenceSelectionInput): VisualReferenceRecord[] {
  const usedIds = new Set<string>();
  const selected: VisualReferenceRecord[] = [];
  const hostPool = input.hostMemory.references;

  const hostShell = pickBest(hostPool, input, SITE00_PROJECTS_INDEX_ROLES.hostShell!, usedIds);
  if (hostShell) {
    usedIds.add(hostShell.id);
    selected.push(hostShell);
  }

  const hostEnv = pickBest(hostPool, input, SITE00_PROJECTS_INDEX_ROLES.hostEnvironment!, usedIds);
  if (hostEnv) {
    usedIds.add(hostEnv.id);
    selected.push(hostEnv);
  }

  const functional = pickBest(hostPool, input, SITE00_PROJECTS_INDEX_ROLES.functionalSurface!, usedIds);
  if (functional) {
    usedIds.add(functional.id);
    selected.push(functional);
  }

  if (input.structuralProofReference) {
    usedIds.add(input.structuralProofReference.id);
    selected.push(input.structuralProofReference);
  }

  if (input.negativeProofReference && input.negativeProofReference.id !== input.structuralProofReference?.id) {
    usedIds.add(input.negativeProofReference.id);
    selected.push(input.negativeProofReference);
  }

  if (input.generationIntent === 'NDXBOOK_PROJECT_HOME_DESIGN_PROOF' && input.clientMemory) {
    const clientRef = pickBest(input.clientMemory.references, input, ['CLIENT_VISUAL_IDENTITY'], usedIds);
    if (clientRef) {
      usedIds.add(clientRef.id);
      selected.push(clientRef);
    }
  }

  return selected;
}

export function hostAndClientMemoriesRemainSeparate(
  host: HostVisualMemory,
  client: ClientVisualMemory | null,
): boolean {
  if (!client) return true;
  const hostIds = new Set(host.references.map((r) => r.id));
  return !client.references.some((r) => hostIds.has(r.id) && r.brandId !== client.brandId);
}

export function selectionDoesNotIncludeEveryScreenshot(
  selected: VisualReferenceRecord[],
  totalAvailable: number,
): boolean {
  return selected.length > 0 && selected.length < totalAvailable;
}

export function applyFounderAuthorityOverride(
  ref: VisualReferenceRecord,
  override: Partial<VisualReferenceRecord['authority']> | undefined,
): VisualReferenceRecord {
  if (!override) return ref;
  return { ...ref, authority: { ...ref.authority, ...override }, updatedAt: new Date().toISOString() };
}

export function applyFounderExclusions(
  references: VisualReferenceRecord[],
  excludedIds: string[] | undefined,
): VisualReferenceRecord[] {
  if (!excludedIds?.length) return references;
  const excluded = new Set(excludedIds);
  return references.filter((r) => !excluded.has(r.id));
}
