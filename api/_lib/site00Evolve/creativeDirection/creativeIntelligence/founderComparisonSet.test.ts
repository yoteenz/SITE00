import { describe, expect, it, beforeEach, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  isNdxbookSixDirectionComparisonEnabled,
  NDXBOOK_ORG_ID,
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
  resolveNdxbookFounderComparisonSet,
} from './founderComparisonSet.js';
import { resetFormationMemoryStore, saveFormationRecord } from './formationStore/storeAdapter.js';
import { listMissingProductionFields } from './directionCompletionService.js';
import type { CoreDirectionFormationInput, CoreDirectionFormationRecord, FormedCoreDirection } from './types.js';

function direction(name: string, partial: Partial<FormedCoreDirection> = {}): FormedCoreDirection {
  return {
    directionId: partial.directionId ?? randomUUID(),
    directionName: name,
    bigIdea: partial.bigIdea ?? `${name} big idea`,
    oneLineThesis: partial.oneLineThesis ?? `${name} thesis`,
    brandConnection: partial.brandConnection ?? '',
    loreLineage: partial.loreLineage ?? [],
    conceptualAncestor: partial.conceptualAncestor ?? '',
    culturalReference: partial.culturalReference ?? '',
    emotionalPromise: partial.emotionalPromise ?? '',
    audienceRole: partial.audienceRole ?? '',
    brandRole: partial.brandRole ?? '',
    visualMetaphor: partial.visualMetaphor ?? '',
    governingBehavior: partial.governingBehavior ?? `${name} governing behavior`,
    materialImageryLanguage: partial.materialImageryLanguage ?? '',
    imageryLanguage: partial.imageryLanguage ?? '',
    typographicAttitude: partial.typographicAttitude ?? '',
    coreColorLogic: partial.coreColorLogic ?? '',
    colorLogic: partial.colorLogic ?? '',
    signatureDevices: partial.signatureDevices ?? [],
    primaryBrandArtifact: partial.primaryBrandArtifact ?? '',
    motionSeed: partial.motionSeed ?? '',
    socialExpressionHypothesis: partial.socialExpressionHypothesis ?? '',
    proprietaryQuality: partial.proprietaryQuality ?? '',
    antiDirection: partial.antiDirection ?? [],
    risks: partial.risks ?? [],
    qualityConfidence: partial.qualityConfidence ?? 'MEDIUM',
  };
}

function completeDirection(name: string): FormedCoreDirection {
  return direction(name, {
    brandConnection: 'Brand Lore grounded',
    loreLineage: ['worldMetaphor: editorial room'],
    visualMetaphor: 'Visual metaphor',
    conceptualAncestor: 'Ancestor',
    primaryBrandArtifact: 'Artifact',
    materialImageryLanguage: 'Paper',
    imageryLanguage: 'Editorial',
    typographicAttitude: 'Sans headlines',
    colorLogic: 'Ink and accent',
    motionSeed: 'Scan line',
    socialExpressionHypothesis: 'Feed card',
    risks: ['Drift risk'],
  });
}

function makeFormation(
  partial: Partial<CoreDirectionFormationRecord> & {
    finalDirections: FormedCoreDirection[];
  },
): CoreDirectionFormationRecord {
  const now = new Date().toISOString();
  const formationVersion = partial.formationVersion ?? 1;
  return {
    formationId: partial.formationId ?? randomUUID(),
    organizationId: partial.organizationId ?? NDXBOOK_ORG_ID,
    projectId: null,
    engagementId: null,
    brandLoreProfileId: '3c8be0f0-03ef-424b-946d-9d527dba0e6e',
    brandLoreProfileVersion: 24,
    brandLoreFingerprint: '5e71f429',
    formationVersion,
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    promptVersion: 'core-direction-formation-v1',
    status: partial.status ?? 'READY_FOR_VISUAL_PRODUCTION',
    idempotencyKey: `key-v${formationVersion}`,
    formationInput: (partial.formationInput ?? {
      organizationId: NDXBOOK_ORG_ID,
      brandExpressionContext: 'SOCIAL_FIRST_EDITORIAL',
      referenceEvidence: [],
    }) as CoreDirectionFormationInput,
    candidateDirections: partial.finalDirections,
    criticResult: null,
    revisionRounds: 0,
    finalDirections: partial.finalDirections,
    visualProofPlans: partial.visualProofPlans ?? [],
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

describe('founderComparisonSet', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetFormationMemoryStore();
  });

  it('enables comparison set only for ndxbook', () => {
    expect(isNdxbookSixDirectionComparisonEnabled('ndxbook')).toBe(true);
    expect(isNdxbookSixDirectionComparisonEnabled('other')).toBe(false);
  });

  it('builds six directions with lineage from v1 then v2', async () => {
    await saveFormationRecord(
      makeFormation({
        formationId: NDXBOOK_V1_FORMATION_ID,
        formationVersion: 1,
        status: 'NEEDS_HUMAN_REVIEW',
        finalDirections: [
          direction('THE MARKED-UP COPY'),
          direction('THE COUNTDOWN ROOM'),
          direction('THE PERSONAL ARCHIVE'),
        ],
      }),
    );
    const v2 = makeFormation({
      formationId: NDXBOOK_V2_FORMATION_ID,
      formationVersion: 2,
      finalDirections: [
        completeDirection('THE ANNOTATED COPY'),
        completeDirection('THE ROOM WHERE IT HAPPENS'),
        completeDirection('THE INDEX'),
      ],
    });
    await saveFormationRecord(v2);

    const set = await resolveNdxbookFounderComparisonSet({
      orgSlug: 'ndxbook',
      organizationId: NDXBOOK_ORG_ID,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      canonicalFormation: v2,
    });

    expect(set).not.toBeNull();
    expect(set!.directionCount).toBe(6);
    expect(set!.directions.map((d) => d.directionName)).toEqual([
      'THE MARKED-UP COPY',
      'THE COUNTDOWN ROOM',
      'THE PERSONAL ARCHIVE',
      'THE ANNOTATED COPY',
      'THE ROOM WHERE IT HAPPENS',
      'THE INDEX',
    ]);
    expect(set!.directions[0]!.comparisonIndex).toBe(1);
    expect(set!.directions[0]!.sourceFormationVersion).toBe(1);
    expect(set!.directions[3]!.comparisonIndex).toBe(4);
    expect(set!.directions[3]!.sourceFormationVersion).toBe(2);
    expect(set!.canonicalFormationId).toBe(NDXBOOK_V2_FORMATION_ID);
    expect(set!.canonicalFormationVersion).toBe(2);
    expect(set!.persistent).toBe(true);
  });

  it('prepares visual proof plans for all six directions', async () => {
    await saveFormationRecord(
      makeFormation({
        formationId: NDXBOOK_V1_FORMATION_ID,
        formationVersion: 1,
        finalDirections: [
          direction('THE MARKED-UP COPY'),
          direction('THE COUNTDOWN ROOM'),
          direction('THE PERSONAL ARCHIVE'),
        ],
      }),
    );
    const v2 = makeFormation({
      formationId: NDXBOOK_V2_FORMATION_ID,
      formationVersion: 2,
      finalDirections: [
        completeDirection('THE ANNOTATED COPY'),
        completeDirection('THE ROOM WHERE IT HAPPENS'),
        completeDirection('THE INDEX'),
      ],
    });
    await saveFormationRecord(v2);

    const set = await resolveNdxbookFounderComparisonSet({
      orgSlug: 'ndxbook',
      organizationId: NDXBOOK_ORG_ID,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      canonicalFormation: v2,
    });

    expect(set!.visualProofPlans).toHaveLength(6);
    expect(set!.visualProofPlans.every((p) => p.heroWorld && p.primaryArtifact)).toBe(true);
  });

  it('reports v1 missing fields without fabricating values', async () => {
    const v1Dir = direction('THE MARKED-UP COPY');
    expect(listMissingProductionFields(v1Dir).length).toBeGreaterThan(0);

    await saveFormationRecord(
      makeFormation({
        formationId: NDXBOOK_V1_FORMATION_ID,
        formationVersion: 1,
        finalDirections: [
          v1Dir,
          direction('THE COUNTDOWN ROOM'),
          direction('THE PERSONAL ARCHIVE'),
        ],
      }),
    );
    const v2 = makeFormation({
      formationId: NDXBOOK_V2_FORMATION_ID,
      formationVersion: 2,
      finalDirections: [
        completeDirection('THE ANNOTATED COPY'),
        completeDirection('THE ROOM WHERE IT HAPPENS'),
        completeDirection('THE INDEX'),
      ],
    });
    await saveFormationRecord(v2);

    const set = await resolveNdxbookFounderComparisonSet({
      orgSlug: 'ndxbook',
      organizationId: NDXBOOK_ORG_ID,
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      canonicalFormation: v2,
    });

    expect(set!.v1CompletionStatus.required).toBe(true);
    expect(set!.directions[0]!.fieldCompleteness.complete).toBe(false);
    expect(set!.directions[3]!.fieldCompleteness.complete).toBe(true);
  });

  it('returns null for non-ndxbook orgs', async () => {
    const result = await resolveNdxbookFounderComparisonSet({
      orgSlug: 'other',
      organizationId: 'other-org',
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      canonicalFormation: makeFormation({
        formationVersion: 2,
        finalDirections: [completeDirection('A'), completeDirection('B'), completeDirection('C')],
      }),
    });
    expect(result).toBeNull();
  });
});
