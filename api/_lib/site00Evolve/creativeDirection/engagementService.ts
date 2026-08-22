/** EVOLVE Creative Direction engagement service — shared architecture, org-scoped state */

import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../orgRegistry.js';
import { getContentBrainByOrgId, getProfileByOrgId } from '../storeAdapter.js';
import { getPage001Candidate } from '../providers/page001CandidateService.js';
import {
  loadCanonicalIntelligence,
  synthesizeCreativeBrief,
  OPEN_QUESTIONS,
} from './intelligenceBrief.js';
import { brandLoreReadinessGate, shouldEnforceLoreReadinessGate } from '../../site00BrandLore/brandLoreBridge.js';
import { getOrReconcileBrandLoreForOrg } from '../../site00BrandLore/loreService.js';
import { computeBrandLoreFingerprint } from '../../../../shared/site00-brand-lore/fingerprint.js';
import type { BrandLoreProfile } from '../../../../shared/site00-brand-lore/types.js';
import { generateTerritories, buildComparison } from './territories.js';
import {
  emptyVisualDnaContract,
  buildProposedVisualDnaFromTerritory,
  promoteVisualDnaToApproved,
} from './visualDnaContract.js';
import {
  getCreativeIntelligenceInspectorSummary,
  getOrRunCoreDirectionFormation,
  incrementFormationVersion,
  listCoreDirectionFormationRecords,
  resetCoreDirectionFormationMemory,
} from './creativeIntelligence/formationService.js';
import { getCreativeIntelligenceProvider } from './creativeIntelligence/providerRegistry.js';
import type {
  CoreDirectionFormationRecord,
} from './creativeIntelligence/types.js';
import type {
  CreativeDirectionEngagement,
  CreativeDirectionLifecycle,
  FounderDecision,
  FounderDecisionType,
  HybridSelection,
} from './types.js';

const NDXBOOK_UUID = '7681ab75-bddc-43e5-b594-79fcf8168205';
const engagements = new Map<string, CreativeDirectionEngagement>();

export function resetCreativeDirectionMemory(): void {
  engagements.clear();
  resetCoreDirectionFormationMemory();
}

/** Evicts only one org's cached engagement — used after a lore calibration submission so the next
 * read re-resolves readiness, without discarding other orgs' in-flight founder decisions (XXIX). */
export function invalidateCreativeDirectionEngagement(orgSlug: string): void {
  const orgId = orgIdFromSlug(orgSlug);
  if (orgId) engagements.delete(orgId);
}

function assertOrg(orgSlug: string): string {
  const orgId = orgIdFromSlug(orgSlug);
  if (!orgId) throw new Error('Organization not registered');
  if (orgSlug === 'ndxbook' && process.env.EVOLVE_USE_MEMORY !== '1' && process.env.VITEST !== 'true') {
    if (orgId !== NDXBOOK_UUID) throw new Error('NDXbook UUID mismatch');
  }
  return orgId;
}

function buildBrandLoreFormation(
  profile: BrandLoreProfile | null,
  formedAt: string,
): CreativeDirectionEngagement['brandLoreFormation'] {
  if (!profile) return null;
  return {
    brandLoreProfileId: profile.id,
    brandLoreProfileVersion: profile.profileVersion,
    brandLoreFingerprint: computeBrandLoreFingerprint(profile),
    formedAt,
    formationVersion: 1,
  };
}

function page001Gate(visualDnaStatus: string): CreativeDirectionEngagement['page001Gate'] {
  const approved = visualDnaStatus === 'APPROVED';
  return {
    visualDnaApproved: approved,
    productionEligible: approved,
    blockedReason: approved ? null : 'Visual DNA requires founder-approved Creative Direction',
  };
}

export async function ensureCreativeDirectionEngagement(
  orgSlug: string,
  brandLore?: import('../../../shared/site00-brand-lore/types.js').BrandLoreProfile | null,
): Promise<CreativeDirectionEngagement> {
  const orgId = assertOrg(orgSlug);
  const existing = engagements.get(orgId);
  if (existing) {
    await syncEngagementBrandLoreReadiness(existing, orgSlug);
    return existing;
  }

  // No bypass (XXIV): when the caller doesn't explicitly pass a profile, load the real one — for
  // ndxbook this reconciles existing Content Brain intelligence into an honest, possibly-partial
  // Brand Lore profile instead of silently skipping the gate (see loreService.getOrReconcileBrandLoreForOrg).
  const resolvedBrandLore =
    brandLore !== undefined ? brandLore : await getOrReconcileBrandLoreForOrg(orgId, orgSlug);

  const intel = await loadCanonicalIntelligence(orgSlug);
  const entries = await getContentBrainByOrgId(orgId);
  const brief = synthesizeCreativeBrief(orgSlug, intel.sections, entries.length, resolvedBrandLore ?? null);
  const territories = generateTerritories(brief);
  const comparison = buildComparison(territories);

  const readinessGate = brandLoreReadinessGate(resolvedBrandLore ?? null);
  const enforceGate = shouldEnforceLoreReadinessGate(orgSlug, resolvedBrandLore ?? null);
  const formedAt = new Date().toISOString();
  const brandLoreFormation = buildBrandLoreFormation(resolvedBrandLore ?? null, formedAt);

  const engagement: CreativeDirectionEngagement = {
    id: randomUUID(),
    organization_id: orgId,
    organization_slug: orgSlug,
    lifecycle_state: 'PROPOSED',
    lineage: [
      `${orgSlug} organization`,
      'Content Brain',
      ...(resolvedBrandLore ? ['Brand Lore Profile', 'Identity intake answers'] : []),
      'Creative Direction engagement',
      'direction territories',
      'founder decisions (pending)',
      'approved visual DNA (pending)',
      'future Page 001 project',
    ],
    knownIntelligence: intel.sections,
    openQuestions: OPEN_QUESTIONS,
    creativeBrief: brief,
    territories,
    comparison,
    founderDecision: null,
    visualDna: emptyVisualDnaContract(),
    page001Gate: page001Gate('INCOMPLETE'),
    brandLoreReadiness: enforceGate
      ? {
          state: readinessGate.state,
          blocked: readinessGate.blocked,
          message: readinessGate.message,
          missingDomains: readinessGate.missingDomains,
        }
      : null,
    brandLoreFormation,
    intelligenceStatus: brandLoreFormation ? 'CURRENT' : 'UNKNOWN',
    legacyReference: {
      indigoSlate: { status: 'REFERENCE_ONLY', promotedToCanon: false },
      laceMastery: { status: 'REJECTED_MISATTRIBUTED' },
      page001LegacyVisual: { status: 'EXPERIMENTAL_NOT_APPROVED' },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  engagements.set(orgId, engagement);
  return engagement;
}

/** Re-resolve Brand Lore readiness from the durable profile on every read — cached engagements
 * must not keep stale `blocked` after lore calibration writes (XXIX). Also re-evaluates the
 * intelligence-staleness signal (Section IV/V): if the founder's calibration answers have changed
 * since these territories were formed, and no territory has been approved yet, the engagement is
 * truthfully labeled STALE_INTELLIGENCE instead of silently presenting pre-calibration proposals
 * as current. Once a territory is APPROVED the status freezes — approval is a governance boundary
 * and must never be silently relabeled by a later lore change. */
async function syncEngagementBrandLoreReadiness(
  engagement: CreativeDirectionEngagement,
  orgSlug: string,
): Promise<void> {
  const orgId = orgIdFromSlug(orgSlug);
  if (!orgId) return;

  const profile = await getOrReconcileBrandLoreForOrg(orgId, orgSlug);
  const enforceGate = shouldEnforceLoreReadinessGate(orgSlug, profile);
  engagement.brandLoreReadiness = enforceGate
    ? (() => {
        const readinessGate = brandLoreReadinessGate(profile);
        return {
          state: readinessGate.state,
          blocked: readinessGate.blocked,
          message: readinessGate.message,
          missingDomains: readinessGate.missingDomains,
        };
      })()
    : null;

  if (engagement.lifecycle_state === 'APPROVED') return;

  const currentFingerprint = profile ? computeBrandLoreFingerprint(profile) : null;
  if (!engagement.brandLoreFormation) {
    if (profile) {
      engagement.brandLoreFormation = buildBrandLoreFormation(profile, new Date().toISOString());
      engagement.intelligenceStatus = 'CURRENT';
    }
    return;
  }

  engagement.intelligenceStatus =
    currentFingerprint && currentFingerprint !== engagement.brandLoreFormation.brandLoreFingerprint
      ? 'STALE_INTELLIGENCE'
      : 'CURRENT';
}

function clientFormationSurface(record: CoreDirectionFormationRecord | null, providerConfigured: boolean) {
  if (!providerConfigured) {
    return {
      surface: 'PROVIDER_UNAVAILABLE' as const,
      headline: 'YOUR BRAND INTELLIGENCE IS READY.',
      message: 'CREATIVE FORMATION IS WAITING ON THE PRODUCTION ENGINE.',
      staticPreviewLabel: 'LEGACY_PROPOSED_EXPLORATION',
    };
  }
  if (!record) {
    return {
      surface: 'STATIC_PREVIEW' as const,
      headline: null,
      message: null,
      staticPreviewLabel: 'LEGACY_PROPOSED_EXPLORATION',
    };
  }
  if (record.status === 'FORMING' || record.status === 'CRITIQUING' || record.status === 'REVISING') {
    return {
      surface: 'FORMING' as const,
      headline: 'FORMING YOUR DIRECTIONS',
      message: record.status,
      staticPreviewLabel: 'LEGACY_PROPOSED_EXPLORATION',
    };
  }
  if (record.status === 'READY_FOR_VISUAL_PRODUCTION' || record.status === 'NEEDS_HUMAN_REVIEW') {
    return {
      surface: 'PROPOSED_FORMATION' as const,
      headline: 'REVIEWING THE WORLDS',
      message: record.status,
      staticPreviewLabel: 'LEGACY_PROPOSED_EXPLORATION',
    };
  }
  return {
    surface: 'STATIC_PREVIEW' as const,
    headline: null,
    message: record.error,
    staticPreviewLabel: 'LEGACY_PROPOSED_EXPLORATION',
  };
}

export async function getCreativeDirectionPayload(orgSlug: string) {
  const engagement = await ensureCreativeDirectionEngagement(orgSlug);
  await syncEngagementBrandLoreReadiness(engagement, orgSlug);
  const profile = await getProfileByOrgId(engagement.organization_id);
  const page001 = orgSlug === 'ndxbook' ? getPage001Candidate(orgSlug) : null;

  const brandLoreProfile = await getOrReconcileBrandLoreForOrg(engagement.organization_id, orgSlug);
  let formationRecord: CoreDirectionFormationRecord | null = null;
  let formationInspector = getCreativeIntelligenceInspectorSummary(null);
  const provider = getCreativeIntelligenceProvider();
  const providerConfigured = provider.providerId !== 'unavailable';

  if (brandLoreProfile && !engagement.brandLoreReadiness?.blocked) {
    const formationResult = await getOrRunCoreDirectionFormation({
      orgSlug,
      profile: brandLoreProfile,
      formationVersion: engagement.brandLoreFormation?.formationVersion ?? 1,
    });
    formationRecord = formationResult.record;
    formationInspector = getCreativeIntelligenceInspectorSummary(formationRecord);
    engagement.coreDirectionFormationRecordId = formationRecord.formationId;
  } else {
    const existing = listCoreDirectionFormationRecords(engagement.organization_id);
    formationRecord = existing[existing.length - 1] ?? null;
    formationInspector = getCreativeIntelligenceInspectorSummary(formationRecord);
  }

  const formationSurface = clientFormationSurface(formationRecord, providerConfigured);

  return {
    engagement,
    coreDirectionFormation: formationRecord
      ? {
          record: formationRecord,
          inspector: formationInspector,
          legacyStaticTerritoriesPreserved: true,
        }
      : null,
    meta: {
      organization: { slug: orgSlug, uuid: engagement.organization_id },
      duplicateOrgCreated: false,
      visualDnaStatus: engagement.visualDna.status,
      providerBlocksCreativeDirection: false,
      publishingEnabled: false,
      creativeIntelligence: {
        providerConfigured,
        providerId: provider.providerId,
        modelId: provider.capability.modelId,
        formationSurface,
      },
    },
    page001: page001
      ? {
          topic: page001.topic,
          volume: page001.volume,
          publicationApproval: page001.publicationApproval,
          productionStarted: false,
          gate: engagement.page001Gate,
        }
      : null,
    profileVisualDna: (profile?.metadata as Record<string, unknown>)?.visual_dna_status ?? 'INCOMPLETE_REFERENCE_ONLY',
  };
}

export async function recordFounderDecision(
  orgSlug: string,
  input: {
    type: FounderDecisionType;
    selectedTerritoryId?: string;
    hybridSelections?: HybridSelection[];
    refinementNotes?: string;
    rejectedTerritoryIds?: string[];
    by: string;
  },
): Promise<CreativeDirectionEngagement> {
  const orgId = assertOrg(orgSlug);
  const engagement = await ensureCreativeDirectionEngagement(orgSlug);
  const now = new Date().toISOString();

  const decision: FounderDecision = {
    type: input.type,
    at: now,
    by: input.by,
    selectedTerritoryId: input.selectedTerritoryId ?? null,
    hybridSelections: input.hybridSelections ?? [],
    refinementNotes: input.refinementNotes ?? null,
    rejectedTerritoryIds: input.rejectedTerritoryIds ?? [],
    provenance: { source: 'FOUNDER_DECISION', engagementId: engagement.id },
  };

  engagement.founderDecision = decision;
  engagement.updated_at = now;

  if (input.type === 'REJECT') {
    engagement.lifecycle_state = 'REVISION_REQUESTED';
    return engagement;
  }

  if (input.type === 'REFINE') {
    engagement.lifecycle_state = 'REVISION_REQUESTED';
    if (input.selectedTerritoryId) {
      const t = engagement.territories.find((x) => x.id === input.selectedTerritoryId);
      if (t) t.lifecycleState = 'REVISION_REQUESTED';
    }
    return engagement;
  }

  if (input.type === 'HYBRIDIZE' || input.type === 'APPROVE') {
    const territoryId = input.selectedTerritoryId ?? engagement.comparison.evolveRecommendation.territoryId;
    const territory = engagement.territories.find((t) => t.id === territoryId);
    if (!territory) throw new Error('Territory not found');

    if (input.type === 'APPROVE') {
      // Visual DNA / Core Direction Formation approval must respect the same Brand Lore readiness
      // gate as FAL dispatch (XXXI) — CORE_DIRECTION_READY is a prerequisite for approval, not the
      // approval itself. Reviewing/selecting a territory (HYBRIDIZE) remains unaffected.
      if (engagement.brandLoreReadiness?.blocked) {
        throw new Error(
          engagement.brandLoreReadiness.message ?? 'CONTEXT CALIBRATION REQUIRED — cannot approve Creative Direction yet.',
        );
      }
      engagement.lifecycle_state = 'APPROVED';
      territory.lifecycleState = 'APPROVED';
      engagement.visualDna = promoteVisualDnaToApproved(
        buildProposedVisualDnaFromTerritory(territory, input.hybridSelections ?? [], input.by),
        decision,
        territory,
      );
      engagement.page001Gate = page001Gate('APPROVED');

      const profile = await getProfileByOrgId(orgId);
      if (profile) {
        (profile.metadata as Record<string, unknown>).visual_dna_status = 'APPROVED';
        (profile.metadata as Record<string, unknown>).visual_identity_available = true;
      }
    } else {
      engagement.lifecycle_state = 'SELECTED';
      territory.lifecycleState = 'SELECTED';
      engagement.visualDna = buildProposedVisualDnaFromTerritory(
        territory,
        input.hybridSelections ?? [],
        input.by,
      );
    }
  }

  engagements.set(orgId, engagement);
  return engagement;
}

export function getEngagementLifecycle(orgSlug: string): CreativeDirectionLifecycle | null {
  const orgId = orgIdFromSlug(orgSlug);
  if (!orgId) return null;
  return engagements.get(orgId)?.lifecycle_state ?? null;
}

export async function queueFalGenerationJobs(orgSlug: string): Promise<{ queued: number; skipped: boolean; blockedReason?: string }> {
  if (!process.env.FAL_KEY?.trim()) {
    return { queued: 0, skipped: true };
  }
  const engagement = await ensureCreativeDirectionEngagement(orgSlug);
  if (engagement.brandLoreReadiness?.blocked) {
    return {
      queued: 0,
      skipped: true,
      blockedReason: engagement.brandLoreReadiness.message ?? 'CONTEXT CALIBRATION REQUIRED',
    };
  }
  let queued = 0;
  for (const territory of engagement.territories) {
    for (const specimen of territory.specimens) {
      if (specimen.status === 'SPEC_RENDERED') {
        specimen.status = 'GENERATION_QUEUED';
        specimen.generationJobId = randomUUID();
        specimen.provenance = { ...specimen.provenance, falEligible: true, note: 'Job spec preserved — dispatch deferred to governed gateway' };
        queued++;
      }
    }
  }
  return { queued, skipped: false };
}

export async function reformCoreDirections(orgSlug: string) {
  const engagement = await ensureCreativeDirectionEngagement(orgSlug);
  const profile = await getOrReconcileBrandLoreForOrg(engagement.organization_id, orgSlug);
  if (!profile) throw new Error('Brand Lore profile required for reformation');
  const nextVersion = incrementFormationVersion(engagement.brandLoreFormation?.formationVersion ?? 1);
  const result = await getOrRunCoreDirectionFormation({
    orgSlug,
    profile,
    formationVersion: nextVersion,
    forceReform: true,
  });
  if (engagement.brandLoreFormation) {
    engagement.brandLoreFormation.formationVersion = nextVersion;
  }
  engagement.coreDirectionFormationRecordId = result.record.formationId;
  engagements.set(engagement.organization_id, engagement);
  return result;
}

export async function getCoreDirectionFormationInspector(orgSlug: string) {
  const payload = await getCreativeDirectionPayload(orgSlug);
  return {
    inspector: payload.coreDirectionFormation?.inspector ?? getCreativeIntelligenceInspectorSummary(null),
    formation: payload.coreDirectionFormation?.record ?? null,
    creativeIntelligence: payload.meta.creativeIntelligence,
  };
}
