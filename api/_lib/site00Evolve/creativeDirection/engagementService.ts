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
import { generateTerritories, buildComparison } from './territories.js';
import {
  emptyVisualDnaContract,
  buildProposedVisualDnaFromTerritory,
  promoteVisualDnaToApproved,
} from './visualDnaContract.js';
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
  if (existing) return existing;

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

export async function getCreativeDirectionPayload(orgSlug: string) {
  const engagement = await ensureCreativeDirectionEngagement(orgSlug);
  const profile = await getProfileByOrgId(engagement.organization_id);
  const page001 = orgSlug === 'ndxbook' ? getPage001Candidate(orgSlug) : null;

  return {
    engagement,
    meta: {
      organization: { slug: orgSlug, uuid: engagement.organization_id },
      duplicateOrgCreated: false,
      visualDnaStatus: engagement.visualDna.status,
      providerBlocksCreativeDirection: false,
      publishingEnabled: false,
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
