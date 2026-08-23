/**
 * Resolve the six established NDXBOOK canonical creative directions for Experiment B.
 */

import type {
  ComparisonDirectionCandidate,
  CoreDirectionFormationRecord,
  FormedCoreDirection,
} from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import { applyDirectionCompletionOverlays } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionCompletionService.js';
import { normalizeFormedDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionFieldContract.js';
import {
  CANONICAL_NDXBOOK_DIRECTION_NAMES,
  CANONICAL_SIX_DIRECTION_SPEC,
  NEAR_MISS_DIRECTION_NAMES,
} from './canonicalCreativeRangeConstants.js';
import type { CanonicalNdxbookDirectionName } from './canonicalCreativeRangeConstants.js';
import {
  NDXBOOK_ORG_ID,
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
} from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/founderComparisonSet.js';
import type {
  CanonicalSixDirectionRosterTest,
  DirectionProvenanceReport,
} from './canonicalCreativeRangeTypes.js';

export type CanonicalCreativeRangeRosterEntry = {
  comparisonIndex: number;
  canonicalName: CanonicalNdxbookDirectionName;
  direction: FormedCoreDirection;
  candidate: ComparisonDirectionCandidate;
  formation: CoreDirectionFormationRecord;
  provenance: DirectionProvenanceReport;
};

function normalizeName(name: string): string {
  return name.trim().toUpperCase();
}

function findDirectionInFormation(
  formation: CoreDirectionFormationRecord,
  canonicalName: CanonicalNdxbookDirectionName,
): FormedCoreDirection | null {
  const target = normalizeName(canonicalName);
  return formation.finalDirections.find((d) => normalizeName(d.directionName) === target) ?? null;
}

function mergeWithOverlay(
  formation: CoreDirectionFormationRecord,
  raw: FormedCoreDirection,
): FormedCoreDirection {
  const overlay = formation.directionCompletionOverlays?.find((o) => o.directionId === raw.directionId);
  if (!overlay) return normalizeFormedDirection(raw);
  return applyDirectionCompletionOverlays([raw], [overlay])[0]!;
}

export function runCanonicalSixDirectionRosterTest(params: {
  roster: CanonicalCreativeRangeRosterEntry[];
  shadowRosterUsed?: boolean;
}): CanonicalSixDirectionRosterTest {
  const notes: string[] = [];
  const names = params.roster.map((r) => r.canonicalName);
  const missingDirections = CANONICAL_NDXBOOK_DIRECTION_NAMES.filter((n) => !names.includes(n));
  const duplicateDirections = names.filter((n, i) => names.indexOf(n) !== i);
  const nearMissPresent = params.roster.some((r) =>
    NEAR_MISS_DIRECTION_NAMES.some(
      (near) =>
        normalizeName(r.direction.directionName) === normalizeName(near) &&
        !CANONICAL_NDXBOOK_DIRECTION_NAMES.includes(r.direction.directionName as CanonicalNdxbookDirectionName),
    ),
  );
  if (params.shadowRosterUsed) notes.push('FAIL: shadow formation roster used instead of canonical resolver.');
  if (missingDirections.length) notes.push(`Missing: ${missingDirections.join(', ')}`);
  if (duplicateDirections.length) notes.push(`Duplicates: ${duplicateDirections.join(', ')}`);
  if (nearMissPresent) notes.push('Near-miss direction name detected in roster.');

  const passed =
    params.roster.length === 6 &&
    missingDirections.length === 0 &&
    duplicateDirections.length === 0 &&
    !nearMissPresent &&
    !params.shadowRosterUsed &&
    new Set(names).size === 6;

  return {
    passed,
    directionCount: params.roster.length,
    uniqueCanonicalDirectionCount: new Set(names).size,
    shadowRosterUsed: Boolean(params.shadowRosterUsed),
    nearMissNamesPresent: nearMissPresent,
    missingDirections,
    duplicateDirections,
    notes,
  };
}

export function buildDirectionProvenanceReport(params: {
  entry: CanonicalCreativeRangeRosterEntry;
  approvalState: string;
}): DirectionProvenanceReport {
  const { entry, approvalState } = params;
  const d = entry.direction;
  const missingLayers: string[] = [];
  if (!d.oneLineThesis && !d.bigIdea) missingLayers.push('centralThesis');
  if (!d.governingBehavior) missingLayers.push('governingBehavior');
  if (!d.visualMetaphor && !d.materialImageryLanguage) missingLayers.push('visualWorld');
  if (!d.typographicAttitude?.trim()) missingLayers.push('typographicAttitude');
  if (!d.coreColorLogic?.trim() && !d.colorLogic?.trim()) missingLayers.push('palette');

  return {
    directionId: d.directionId,
    canonicalName: entry.canonicalName,
    sourceRecord: `formation-v${entry.formation.formationVersion}`,
    sourceVersion: entry.formation.formationVersion,
    sourceFormationId: entry.formation.formationId,
    approvalState,
    coreDirectionAvailable: Boolean(d.oneLineThesis || d.bigIdea),
    directionExpressionAvailable: false,
    creativeExpressionAvailable: false,
    identityArtDirectionAvailable: false,
    visualBriefAvailable: false,
    formatLineageAvailable: Boolean(entry.formation.formationInput?.formatLineageSummary),
    personalityLineageAvailable: Boolean(entry.formation.formationInput?.brandPersonalitySummary),
    missingLayers,
  };
}

export function resolveCanonicalCreativeRangeDirectionsFromFormations(params: {
  v1: CoreDirectionFormationRecord;
  v2: CoreDirectionFormationRecord;
}): CanonicalCreativeRangeRosterEntry[] {
  const roster: CanonicalCreativeRangeRosterEntry[] = [];

  for (const spec of CANONICAL_SIX_DIRECTION_SPEC) {
    const formation = spec.formationVersion === 1 ? params.v1 : params.v2;
    const raw = findDirectionInFormation(formation, spec.canonicalName);
    if (!raw) {
      throw new Error(`Canonical direction not found: ${spec.canonicalName} in formation v${spec.formationVersion}`);
    }
    const merged = mergeWithOverlay(formation, raw);
    const candidate: ComparisonDirectionCandidate = {
      ...merged,
      comparisonIndex: spec.comparisonIndex,
      sourceFormationId: formation.formationId,
      sourceFormationVersion: formation.formationVersion,
      sourceDirectionIndex: spec.comparisonIndex,
      brandLoreProfileVersion: formation.brandLoreProfileVersion,
      brandLoreFingerprint: formation.brandLoreFingerprint,
      fieldCompleteness: { complete: true, missingFields: [] },
      completionLineage: formation.directionCompletionOverlays?.find((o) => o.directionId === raw.directionId) ?? null,
    };
    const entry: CanonicalCreativeRangeRosterEntry = {
      comparisonIndex: spec.comparisonIndex,
      canonicalName: spec.canonicalName,
      direction: merged,
      candidate,
      formation,
      provenance: {} as DirectionProvenanceReport,
    };
    entry.provenance = buildDirectionProvenanceReport({ entry, approvalState: formation.status });
    roster.push(entry);
  }

  return roster.sort((a, b) => a.comparisonIndex - b.comparisonIndex);
}

export async function resolveCanonicalCreativeRangeDirections(params: {
  brandSlug: string;
  organizationId?: string;
  brandLoreFingerprint?: string;
  brandLoreProfileVersion?: number;
  v1?: CoreDirectionFormationRecord;
  v2?: CoreDirectionFormationRecord;
}): Promise<CanonicalCreativeRangeRosterEntry[]> {
  if (params.brandSlug !== 'ndxbook') {
    throw new Error('Canonical creative range validation is NDXBOOK-only');
  }

  if (params.v1 && params.v2) {
    return resolveCanonicalCreativeRangeDirectionsFromFormations({ v1: params.v1, v2: params.v2 });
  }

  const { resolveNdxbookFounderComparisonSet } = await import(
    '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/founderComparisonSet.js'
  );
  const { getFormationRecordById } = await import(
    '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationStore/storeAdapter.js'
  );

  const set = await resolveNdxbookFounderComparisonSet({
    orgSlug: 'ndxbook',
    organizationId: params.organizationId ?? NDXBOOK_ORG_ID,
    brandLoreFingerprint: params.brandLoreFingerprint ?? '5e71f429',
    brandLoreProfileVersion: params.brandLoreProfileVersion ?? 24,
  });

  if (!set || set.directions.length !== 6) {
    throw new Error('Canonical founder comparison set unavailable — cannot resolve six directions');
  }

  let v1FormationId = NDXBOOK_V1_FORMATION_ID;
  let v2FormationId = NDXBOOK_V2_FORMATION_ID;
  for (const d of set.directions) {
    if (d.sourceFormationVersion === 1) v1FormationId = d.sourceFormationId;
    if (d.sourceFormationVersion === 2) v2FormationId = d.sourceFormationId;
  }

  const v1 = await getFormationRecordById(v1FormationId);
  const v2 = await getFormationRecordById(v2FormationId);
  if (!v1 || !v2) throw new Error('Canonical v1/v2 formation records not found');

  return resolveCanonicalCreativeRangeDirectionsFromFormations({ v1, v2 });
}
