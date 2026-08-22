import { describe, expect, it, beforeEach, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../../orgRegistry.js';
import {
  getCreativeDirectionPayload,
  recordFounderDecision,
  resetCreativeDirectionMemory,
} from '../engagementService.js';
import { resetCoreDirectionFormationMemory } from './formationService.js';
import { saveFormationRecord } from './formationStore/storeAdapter.js';
import {
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
} from './founderComparisonSet.js';
import type { CoreDirectionFormationRecord, FormedCoreDirection } from './types.js';

function dir(name: string, complete = false): FormedCoreDirection {
  const base: FormedCoreDirection = {
    directionId: randomUUID(),
    directionName: name,
    bigIdea: `${name} idea`,
    oneLineThesis: `${name} thesis`,
    brandConnection: complete ? 'connected' : '',
    loreLineage: complete ? ['lore'] : [],
    conceptualAncestor: complete ? 'ancestor' : '',
    culturalReference: '',
    emotionalPromise: '',
    audienceRole: '',
    brandRole: '',
    visualMetaphor: complete ? 'metaphor' : '',
    governingBehavior: `${name} behavior`,
    materialImageryLanguage: complete ? 'material' : '',
    imageryLanguage: complete ? 'imagery' : '',
    typographicAttitude: complete ? 'type' : '',
    coreColorLogic: complete ? 'color' : '',
    colorLogic: complete ? 'color' : '',
    signatureDevices: [],
    primaryBrandArtifact: complete ? 'artifact' : '',
    motionSeed: complete ? 'motion' : '',
    socialExpressionHypothesis: complete ? 'social' : '',
    proprietaryQuality: '',
    antiDirection: [],
    risks: complete ? ['risk'] : [],
    qualityConfidence: 'MEDIUM',
  };
  return base;
}

function record(
  formationId: string,
  version: number,
  names: string[],
  complete: boolean,
): CoreDirectionFormationRecord {
  const orgId = orgIdFromSlug('ndxbook')!;
  const now = new Date().toISOString();
  return {
    formationId,
    organizationId: orgId,
    projectId: null,
    brandLoreProfileId: 'profile',
    brandLoreProfileVersion: 24,
    brandLoreFingerprint: '5e71f429',
    formationVersion: version,
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    promptVersion: 'v1',
    status: version === 2 ? 'READY_FOR_VISUAL_PRODUCTION' : 'NEEDS_HUMAN_REVIEW',
    idempotencyKey: `k-${version}`,
    formationInput: {
      organizationId: orgId,
      brandLoreProfileId: 'profile',
      brandLoreProfileVersion: 24,
      brandLoreFingerprint: '5e71f429',
      brandExpressionContext: 'SOCIAL_FIRST_EDITORIAL',
      referenceEvidence: [],
      formationVersion: version,
    } as never,
    candidateDirections: names.map((n) => dir(n, complete)),
    criticResult: null,
    revisionRounds: 0,
    finalDirections: names.map((n) => dir(n, complete)),
    visualProofPlans: [],
    legacyStaticPreview: 'PRESERVED',
    proposedFormationLabel: 'PROPOSED_FORMATION',
    providerAccounting: {
      providerId: 'anthropic',
      modelId: 'claude-sonnet-4-6',
      requestCount: 1,
      revisionCount: 0,
      formationRequests: 1,
      critiqueRequests: 0,
      reviseRequests: 0,
      tokenUsage: {},
    },
    error: null,
    createdAt: now,
    startedAt: now,
    completedAt: now,
    updatedAt: now,
  };
}

describe('NDX BOOK six-direction comparison payload', () => {
  beforeEach(async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    resetCreativeDirectionMemory();
    resetCoreDirectionFormationMemory();

    await saveFormationRecord(
      record(
        NDXBOOK_V1_FORMATION_ID,
        1,
        ['THE MARKED-UP COPY', 'THE COUNTDOWN ROOM', 'THE PERSONAL ARCHIVE'],
        false,
      ),
    );
    await saveFormationRecord(
      record(
        NDXBOOK_V2_FORMATION_ID,
        2,
        ['THE ANNOTATED COPY', 'THE ROOM WHERE IT HAPPENS', 'THE INDEX'],
        true,
      ),
    );
  });

  it('includes six-direction comparison set for ndxbook without changing canonical v2', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook', { runFormation: false });
    const comparison = (payload as { founderComparisonSet?: { directionCount: number; canonicalFormationVersion: number; directions: Array<{ directionName: string; comparisonIndex: number }> } }).founderComparisonSet;

    expect(comparison?.directionCount).toBe(6);
    expect(comparison?.canonicalFormationVersion).toBe(2);
    expect(comparison?.canonicalFormationId).toBe(NDXBOOK_V2_FORMATION_ID);
    expect(comparison?.directions.map((d) => d.directionName)).toEqual([
      'THE MARKED-UP COPY',
      'THE COUNTDOWN ROOM',
      'THE PERSONAL ARCHIVE',
      'THE ANNOTATED COPY',
      'THE ROOM WHERE IT HAPPENS',
      'THE INDEX',
    ]);
  });

  it('records founder selection lineage from v1 direction without promoting v1 formation', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook', { runFormation: false });
    const comparison = (payload as { founderComparisonSet?: { directions: Array<{ directionId: string; sourceFormationVersion: number }> } }).founderComparisonSet;
    const v1Direction = comparison!.directions[0]!;

    const engagement = await recordFounderDecision('ndxbook', {
      type: 'REFINE',
      by: 'founder@test.com',
      selectedComparisonDirectionId: v1Direction.directionId,
      refinementNotes: 'Testing v1 direction lineage capture',
    });

    expect(engagement.founderDecision?.selectedDirectionLineage?.sourceFormationVersion).toBe(1);
    expect(engagement.founderDecision?.selectedDirectionLineage?.comparisonIndex).toBe(1);
    expect(comparison?.canonicalFormationVersion).toBe(2);
  });
});
