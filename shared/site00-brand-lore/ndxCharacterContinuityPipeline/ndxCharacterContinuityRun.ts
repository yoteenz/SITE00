/**
 * P0.5E.5 — Build NDX Character Continuity pipeline run.
 */

import { auditCharacterBible } from '../../site00-studio-world-production/characterContinuityPipeline/bibleAudit.js';
import { ingestCharacterBible } from '../../site00-studio-world-production/characterContinuityPipeline/bibleIngestion.js';
import { compileCharacterContinuityBible } from '../../site00-studio-world-production/characterContinuityPipeline/continuityBible.js';
import { buildEmptyEmbodiedCharacterBible } from '../../site00-studio-world-production/characterContinuityPipeline/embodiedCharacterBible.js';
import { buildDefaultIdentityAnchors, buildDefaultNegativeConstraints } from '../../site00-studio-world-production/characterContinuityPipeline/identityGovernance.js';
import { compileProviderCharacterGenerationContract, selectCharacterGenerationModel } from '../../site00-studio-world-production/characterContinuityPipeline/providerCompiler.js';
import { compileCharacterSceneContract } from '../../site00-studio-world-production/characterContinuityPipeline/sceneContract.js';
import { createCharacterGenerationSnapshot } from '../../site00-studio-world-production/characterContinuityPipeline/generationSnapshot.js';
import { buildEmptyCharacterContinuityPipelineRun } from '../../site00-studio-world-production/characterContinuityPipeline/pipelineRun.js';
import { evaluateReferencePackReadiness } from '../../site00-studio-world-production/characterContinuityPipeline/referencePack.js';
import { buildMockStructuredCharacterFixture } from './mockFixtures.js';
import { NDX_CHARACTER_CONTINUITY_RUN_ID } from './constants.js';
import type { NdxCharacterContinuityPipelineRun } from './types.js';
import type { BibleSourceType } from '../../site00-studio-world-production/characterContinuityPipeline/types.js';

export function buildNdxCharacterContinuityPipelineRun(
  projectId = 'ndxbook',
): NdxCharacterContinuityPipelineRun {
  const shell = buildEmptyCharacterContinuityPipelineRun({
    runId: NDX_CHARACTER_CONTINUITY_RUN_ID,
    projectId,
    brandId: 'ndxbook',
    characterId: 'ndx-embodied-character',
  });

  const emptyBible = buildEmptyEmbodiedCharacterBible({
    projectId,
    brandId: 'ndxbook',
    characterId: 'ndx-embodied-character',
  });

  return {
    ...shell,
    runId: NDX_CHARACTER_CONTINUITY_RUN_ID,
    ndxBookTerminologyIntegrated: true,
    ndxMotionBehaviorIntegrated: true,
    bible: emptyBible,
    bibleAudit: auditCharacterBible({
      bible: emptyBible,
      referencePack: shell.referencePack,
      preCastingMode: true,
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function ingestNdxCharacterBibleFromSource(
  run: NdxCharacterContinuityPipelineRun,
  params: {
    rawSource: string;
    sourceType: BibleSourceType;
    normalized: Partial<import('../../site00-studio-world-production/characterContinuityPipeline/types.js').EmbodiedCharacterBible>;
  },
): NdxCharacterContinuityPipelineRun {
  const bible = run.bible ?? buildEmptyEmbodiedCharacterBible({
    projectId: run.projectId,
    brandId: 'ndxbook',
    characterId: 'ndx-embodied-character',
  });

  const { bible: ingested, receipt } = ingestCharacterBible({
    bible,
    rawSource: params.rawSource,
    sourceType: params.sourceType,
    normalized: {
      ...params.normalized,
      identityAnchors: params.normalized.identityAnchors ?? buildDefaultIdentityAnchors(),
      negativeIdentityConstraints: params.normalized.negativeIdentityConstraints ?? buildDefaultNegativeConstraints(),
    },
  });

  const referencePack = evaluateReferencePackReadiness(run.referencePack);
  const continuityBible = compileCharacterContinuityBible(ingested);
  const bibleAudit = auditCharacterBible({ bible: ingested, referencePack, preCastingMode: true });

  return {
    ...run,
    bible: ingested,
    ingestionReceipts: [...run.ingestionReceipts, receipt],
    continuityBible,
    referencePack,
    bibleAudit,
    updatedAt: new Date().toISOString(),
  };
}

export function ingestNdxDiscoverySynthesisPreview(
  run: NdxCharacterContinuityPipelineRun,
  synthesis: { whoSheIs: string; bookMeaning: string; whatMakesHerAnnoying: string },
): NdxCharacterContinuityPipelineRun {
  return ingestNdxCharacterBibleFromSource(run, {
    rawSource: JSON.stringify(synthesis),
    sourceType: 'DISCOVERY_SYNTHESIS',
    normalized: {
      characterEssence: synthesis.whoSheIs,
      psychologicalLogic: synthesis.whoSheIs,
      bookOrArtifactRelationship: { meaning: synthesis.bookMeaning },
      flaws: [synthesis.whatMakesHerAnnoying],
      contradictions: [],
      behaviorAuthority: 'PARTIAL',
    },
  });
}

export function compileNdxPipelinePreview(
  run: NdxCharacterContinuityPipelineRun,
): NdxCharacterContinuityPipelineRun {
  if (!run.bible || !run.continuityBible) return run;

  const scene = compileCharacterSceneContract({
    bible: run.bible,
    continuityBible: run.continuityBible,
    referencePack: run.referencePack,
    scene: {
      sceneId: 'preview-scene',
      platform: 'REEL',
      emotionalState: 'curious',
      motionBehavior: 'research posture',
      bookBehavior: 'flips back to prior Page',
      environment: 'desk at night',
    },
  });

  const selection = selectCharacterGenerationModel({
    scene,
    capabilities: run.capabilityRegistry,
    needsVideo: true,
    needsAudio: false,
    identitySensitive: true,
  });

  const capability =
    run.capabilityRegistry.find((c) => c.endpoint === selection.selectedEndpoint) ??
    run.capabilityRegistry[0]!;

  const contract = compileProviderCharacterGenerationContract({
    scene,
    capability,
    negativeConstraints: run.bible.negativeIdentityConstraints.map((c) => c.description),
    previewOnly: true,
    productionBlocked: run.productionGenerationBlocked,
  });

  const snapshot = createCharacterGenerationSnapshot({
    characterBibleVersion: run.bible.version,
    continuityBibleVersion: run.continuityBible.bibleVersion,
    sceneContractVersion: scene.contractId,
    referencePackVersion: run.referencePack.packId,
    contract,
  });

  return {
    ...run,
    sceneContracts: [...run.sceneContracts, scene],
    modelSelections: [...run.modelSelections, selection],
    providerContracts: [...run.providerContracts, contract],
    generationSnapshots: [...run.generationSnapshots, snapshot],
    updatedAt: new Date().toISOString(),
  };
}

export function runNdxMockFixturePipelineTest(
  run: NdxCharacterContinuityPipelineRun,
): NdxCharacterContinuityPipelineRun {
  const fixture = buildMockStructuredCharacterFixture(run.projectId);
  let next = ingestNdxCharacterBibleFromSource(run, {
    rawSource: fixture.rawSource,
    sourceType: 'MOCK_FIXTURE',
    normalized: fixture.normalized,
  });
  next = compileNdxPipelinePreview(next);
  return next;
}

export function forensicAuditExistingArchitecture(): {
  p05e2MotionCharacter: true;
  p05e3EmbodiedDiscovery: true;
  p05e4FounderDiscovery: true;
  existingProviderRegistry: true;
  falReferenceToVideoArchitecturallySupported: true;
  missingLayersBeforeP05E5: string[];
} {
  return {
    p05e2MotionCharacter: true,
    p05e3EmbodiedDiscovery: true,
    p05e4FounderDiscovery: true,
    existingProviderRegistry: true,
    falReferenceToVideoArchitecturallySupported: true,
    missingLayersBeforeP05E5: [
      'character_bible_ingestion',
      'continuity_bible_compilation',
      'provider_aware_character_compiler',
      'generation_snapshot_lineage',
    ],
  };
}
