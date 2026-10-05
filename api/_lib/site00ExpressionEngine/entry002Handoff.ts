/**
 * Expression Engine V0 — ENTRY 002 structured handoff (no asset generation).
 */

import {
  ENTRY_002_NUMBER,
  ENTRY_002_SUBJECT,
  ENTRY_002_THESIS,
  ENTRY_002_TITLE,
  NDXBOOK_PROOF_BRAND_ID,
  NDXBOOK_PROOF_PROJECT_KEY,
} from '../../../shared/site00-expression-engine/constants.js';
import { compileAllFormatExpressions } from '../../../shared/site00-expression-engine/formatContracts.js';
import type {
  AudioPlan,
  CreativeEntry,
  CreativeObjective,
  ExpressionProductionPlan,
} from '../../../shared/site00-expression-engine/types.js';
import { routeProductionTool } from './productionRouting.js';

export function resolveEntry002Objective(): CreativeObjective {
  return {
    objectiveId: 'obj-entry-002',
    brandId: NDXBOOK_PROOF_BRAND_ID,
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    title: ENTRY_002_TITLE,
    thesis: ENTRY_002_THESIS,
    subject: ENTRY_002_SUBJECT,
    audienceFrame: 'Cultural revision — when cringe becomes nostalgia',
    createdAt: new Date().toISOString(),
  };
}

export function compileEntry002ProductionPlanSkeleton(): ExpressionProductionPlan {
  const entryId = 'entry-002';
  const formats = ['REEL', 'CAROUSEL', 'STORY', 'CTA_STORY', 'COVER', 'HIGHLIGHT', 'TIKTOK', 'X'] as const;

  return {
    planId: 'pp-entry-002-skeleton',
    entryId,
    status: 'COMPILED',
    compiledAt: new Date().toISOString(),
    tasks: formats.map((format, i) => {
      const taskClass =
        format === 'REEL' || format === 'TIKTOK'
          ? ('VIDEO_CHARACTER_CONTINUITY' as const)
          : format === 'X'
            ? ('TYPOGRAPHY' as const)
            : ('IMAGE_GENERATION' as const);
      const routing = routeProductionTool({ taskClass, format, brandId: NDXBOOK_PROOF_BRAND_ID, entryId });
      return {
        taskId: `t2-${i}`,
        format,
        taskClass,
        description: `${format} production for ENTRY 002 — ${ENTRY_002_THESIS}`,
        why: 'Structured handoff from ENTRY 001 continuity',
        continuityRefs: ['entry-001-tease', 'nar-nostalgia-revision'],
        authoritativeReferences: ['entry-001-seq-reel-arc'],
        exactText: [ENTRY_002_TITLE, ENTRY_002_THESIS],
        variableElements: ['artifact TBD', 'environment TBD'],
        recommendedProviders: routing.recommendedProviders,
        status: 'PLANNED' as const,
      };
    }),
  };
}

export function compileEntry002AudioPlanSkeleton(): AudioPlan {
  return {
    planId: 'audio-entry-002-skeleton',
    entryId: 'entry-002',
    requiredForFormats: ['REEL', 'TIKTOK'],
    status: 'DRAFT',
    layers: [
      { layerId: 'a2-1', type: 'AMBIENCE', purpose: 'Nostalgia-era ambient bed TBD', timingRelationship: 'opening', generatorClass: 'SOUND_EFFECT', sourceState: 'GENERATED', continuityRequirement: 'TBD', mixPriority: 1 },
      { layerId: 'a2-2', type: 'DIALOGUE_VO', purpose: 'Thesis VO — WHEN CRINGE BECOMES NOSTALGIA', timingRelationship: 'hook', generatorClass: 'TTS_DIALOGUE', sourceState: 'GENERATED', continuityRequirement: 'nar-nostalgia-revision', mixPriority: 5 },
    ],
  };
}

export function compileEntry002Handoff(): CreativeEntry {
  const objective = resolveEntry002Objective();
  const formatExpressions = compileAllFormatExpressions();

  return {
    id: 'entry-002',
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    brandId: NDXBOOK_PROOF_BRAND_ID,
    entryNumber: ENTRY_002_NUMBER,
    title: ENTRY_002_TITLE,
    subject: ENTRY_002_SUBJECT,
    objectiveId: objective.objectiveId,
    territoryId: null,
    worldExpressionId: null,
    status: 'DRAFT',
    canonState: 'DRAFT',
    formatExpressions,
    productionPlan: compileEntry002ProductionPlanSkeleton(),
    audioPlan: compileEntry002AudioPlanSkeleton(),
    continuityGraph: null,
    platformTranslations: [
      { translationId: 'pt2-ig', entryId: 'entry-002', platform: 'INSTAGRAM', sourceFormat: 'REEL', targetBehavior: 'Instagram entry filing', mode: 'REGENERATE', thesisPreserved: true, requirements: ['territory lock required'], status: 'REQUIRED' },
      { translationId: 'pt2-tt', entryId: 'entry-002', platform: 'TIKTOK', sourceFormat: 'REEL', targetBehavior: 'TikTok-native nostalgia hook', mode: 'REEDIT', thesisPreserved: true, requirements: ['native pacing'], status: 'REQUIRED' },
      { translationId: 'pt2-x', entryId: 'entry-002', platform: 'X', sourceFormat: 'CAROUSEL', targetBehavior: 'Thread-native revision argument', mode: 'REWRITE', thesisPreserved: true, requirements: ['receipt chain'], status: 'REQUIRED' },
    ],
    artifact: null,
    generationReceipts: [],
    founderJudgments: [],
    assetIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function entry002HasNoGeneratedAssets(): boolean {
  const handoff = compileEntry002Handoff();
  return handoff.generationReceipts.length === 0 && handoff.assetIds.length === 0;
}
