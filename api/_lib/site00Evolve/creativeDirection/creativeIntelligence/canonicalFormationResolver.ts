/**
 * Canonical Core Direction Formation selection.
 *
 * Selection rule (deterministic, documented):
 * 1. Scope: organizationId + optional projectId + current Brand Lore fingerprint.
 * 2. Exclude records from other orgs/projects/fingerprints.
 * 3. Status priority (highest wins): READY_FOR_VISUAL_PRODUCTION > NEEDS_HUMAN_REVIEW > in-progress > FAILED > NOT_READY.
 * 4. Among tied status: highest formationVersion wins.
 * 5. Among tied version: latest completedAt, else updatedAt, else createdAt.
 *
 * Never prefer: stale fingerprint, legacy static territories, arbitrary list order, or in-memory over durable when both match.
 */

import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import { computeBrandLoreFingerprint } from '../../../../../shared/site00-brand-lore/fingerprint.js';
import {
  buildCoreDirectionFormationInput,
  buildFormationIdempotencyKey,
} from './formationInputBuilder.js';
import { CREATIVE_INTELLIGENCE_PROMPT_VERSION } from './config.js';
import {
  getFormationRecordByIdempotencyKey,
  listFormationRecordsByOrganizationId,
} from './formationStore/storeAdapter.js';
import { normalizeFormedDirections } from './directionFieldContract.js';
import type { CoreDirectionFormationRecord, CoreDirectionFormationStatus } from './types.js';

const STATUS_RANK: Record<CoreDirectionFormationStatus, number> = {
  READY_FOR_VISUAL_PRODUCTION: 100,
  NEEDS_HUMAN_REVIEW: 80,
  REVISING: 60,
  CRITIQUING: 55,
  FORMING: 50,
  READY_TO_FORM: 20,
  FAILED: 10,
  NOT_READY: 0,
};

export type ResolveCanonicalCoreDirectionFormationParams = {
  organizationId: string;
  projectId?: string | null;
  brandLoreProfile?: BrandLoreProfile | null;
  currentBrandLoreFingerprint?: string;
  /** When set, prefer this formation version if it matches fingerprint and is complete enough. */
  preferredFormationVersion?: number;
};

export type CanonicalFormationResolution = {
  record: CoreDirectionFormationRecord | null;
  selectionReason: string;
  candidatesConsidered: number;
  idempotencyKeyForPreferredVersion: string | null;
};

function timestampMs(iso: string | null | undefined): number {
  if (!iso) return 0;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

function recordSortKey(record: CoreDirectionFormationRecord): [number, number, number, number] {
  return [
    STATUS_RANK[record.status] ?? 0,
    record.formationVersion,
    timestampMs(record.completedAt ?? record.updatedAt ?? record.createdAt),
    timestampMs(record.createdAt),
  ];
}

function compareRecords(a: CoreDirectionFormationRecord, b: CoreDirectionFormationRecord): number {
  const ka = recordSortKey(a);
  const kb = recordSortKey(b);
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return kb[i] - ka[i];
  }
  return 0;
}

function matchesScope(
  record: CoreDirectionFormationRecord,
  organizationId: string,
  projectId: string | null | undefined,
  fingerprint: string,
): boolean {
  if (record.organizationId !== organizationId) return false;
  if (fingerprint && record.brandLoreFingerprint !== fingerprint) return false;
  if (projectId != null && record.projectId != null && record.projectId !== projectId) return false;
  return true;
}

function normalizeRecordDirections(record: CoreDirectionFormationRecord): CoreDirectionFormationRecord {
  return {
    ...record,
    candidateDirections: normalizeFormedDirections(record.candidateDirections),
    finalDirections: normalizeFormedDirections(record.finalDirections),
  };
}

/**
 * Resolve the canonical formation for founder-facing Core Direction review.
 */
export async function resolveCanonicalCoreDirectionFormation(
  params: ResolveCanonicalCoreDirectionFormationParams,
): Promise<CanonicalFormationResolution> {
  const {
    organizationId,
    projectId = null,
    brandLoreProfile = null,
    preferredFormationVersion,
  } = params;

  const fingerprint =
    params.currentBrandLoreFingerprint ??
    (brandLoreProfile ? computeBrandLoreFingerprint(brandLoreProfile) : '');

  let idempotencyKeyForPreferredVersion: string | null = null;
  if (brandLoreProfile && preferredFormationVersion != null) {
    const input = buildCoreDirectionFormationInput({
      profile: brandLoreProfile,
      projectId,
      formationVersion: preferredFormationVersion,
    });
    idempotencyKeyForPreferredVersion = buildFormationIdempotencyKey(
      input,
      CREATIVE_INTELLIGENCE_PROMPT_VERSION,
    );
    const byKey = await getFormationRecordByIdempotencyKey(idempotencyKeyForPreferredVersion);
    if (
      byKey &&
      matchesScope(byKey, organizationId, projectId, fingerprint) &&
      byKey.status === 'READY_FOR_VISUAL_PRODUCTION'
    ) {
      return {
        record: normalizeRecordDirections(byKey),
        selectionReason: `idempotency_exact_match_v${preferredFormationVersion}_READY_FOR_VISUAL_PRODUCTION`,
        candidatesConsidered: 1,
        idempotencyKeyForPreferredVersion,
      };
    }
  }

  const all = await listFormationRecordsByOrganizationId(organizationId);
  const scoped = fingerprint
    ? all.filter((r) => matchesScope(r, organizationId, projectId, fingerprint))
    : all.filter((r) => r.organizationId === organizationId);

  if (!scoped.length) {
    return {
      record: null,
      selectionReason: 'no_formation_records_for_scope',
      candidatesConsidered: 0,
      idempotencyKeyForPreferredVersion,
    };
  }

  const sorted = [...scoped].sort(compareRecords);
  const winner = sorted[0]!;

  return {
    record: normalizeRecordDirections(winner),
    selectionReason: `status_rank_${winner.status}_v${winner.formationVersion}_fingerprint_${winner.brandLoreFingerprint}`,
    candidatesConsidered: scoped.length,
    idempotencyKeyForPreferredVersion,
  };
}

export function syncEngagementFormationVersionFromCanonical(
  engagementFormationVersion: number | undefined,
  canonical: CoreDirectionFormationRecord | null,
): number {
  if (!canonical) return engagementFormationVersion ?? 1;
  if (canonical.formationVersion > (engagementFormationVersion ?? 1)) {
    return canonical.formationVersion;
  }
  return engagementFormationVersion ?? canonical.formationVersion;
}
