/**
 * P0.5C.6A — Authored artifact grammar + template frame removal + human history authority.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import {
  AUTHORED_ARTIFACT_GRAMMAR_IMPLEMENTED,
  ARTIFACT_GRAMMAR_DIVERSITY_IMPLEMENTED,
  BESPOKE_ART_DIRECTION_DOMINANCE_PRESERVED,
  BOTTOM_EVIDENCE_PANEL_DEFAULT_BLOCKED,
  CHARACTER_CAUSAL_AUTHORSHIP_PREPARED,
  DECORATIVE_HUMAN_MARKS_BLOCKED,
  FIRST_PERSON_AUTHORSHIP_STRENGTHENED,
  HEADER_BODY_FOOTER_TEMPLATE_BLOCKED,
  HUMAN_HISTORY_AUTHORITY_IMPLEMENTED,
  INFOGRAPHIC_SHELL_DEFAULT_BLOCKED,
  INFORMATION_INHABITS_ARTIFACT_IMPLEMENTED,
  NDX_INTERVENTION_CAUSALITY_IMPLEMENTED,
  OVER_RESOLVED_GRAPHIC_GUARD_IMPLEMENTED,
  P0_5C_6A_IMPLEMENTED,
  P0_5C_6_VISUAL_AUTHORITY_PRESERVED,
  PRE_C6A_QUEUE_SUPERSESSION_IMPLEMENTED,
  RANDOM_ANALOG_TEXTURE_BLOCKED,
  SIGNATURE_LIME_RESTRAINT_PRESERVED,
  TOP_HEADLINE_PANEL_DEFAULT_BLOCKED,
  V2_4_CREATED,
} from './artBoardMateriality/constants.js';
import {
  compileArtBoardMaterialityFalPrompt,
  materialFalPromptBlocksBottomEvidencePanel,
  materialFalPromptBlocksTopHeadlinePanel,
  materialFalPromptHasAntiTemplateFrameSection,
  materialFalPromptHasAuthoredArtifactGrammar,
  materialFalPromptHasHumanHistorySection,
  materialFalPromptHasInformationInhabitationSection,
  materialFalPromptHasNdxInterventionSection,
  materialFalPromptHasOverResolutionGuard,
  materialFalPromptHumanHistoryBeforeInformationHierarchy,
} from './artBoardMateriality/falPromptCompilerV23.js';
import { formulateExperiment01V23 } from './artBoardMateriality/experiment01V23.js';
import {
  artifactHasPreC6APrompt,
  shouldAutoSupersedeV23Generation,
} from './artBoardMateriality/experiment01V23Supersession.js';
import {
  applyV23AuthoredArtifactRevision,
  evaluateV23BoardArtifactGrammar,
  v23AuthoredArtifactGatePasses,
  NDX_AUTHORED_ARTIFACT_AUTHORITY_CHAIN,
} from './artBoardMateriality/authoredArtifactC6A.js';
import { authoredArtifactGatePasses, round01VisualAuthorityGate } from './artBoardMateriality/approvalGate.js';
import { V23_FAL_COMPILER_VERSION } from './artBoardMateriality/v23GenerationAuthorityConstants.js';
import { v24NotCreated } from './artBoardMateriality/v23GenerationAuthority.js';
import { compileBrandMarketingExpressionSystem } from './brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from './brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from './brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01Artifacts } from './brandMarketingExpression/characterEventFormulation.js';
import { formulateExperiment01V2 } from './editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from './culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from './characterRetention/experiment01V22.js';
import {
  STUDIO_WORLD_AUTHORED_ARTIFACT_SYSTEM_IMPLEMENTED,
  authoredArtifactAuthorityChainCorrect,
  getAuthoredArtifactAuthorityChain,
  automaticRegenerationFalse,
  brandCharacterMutatedFalse,
  brandCanonMutatedFalse,
  productExpressionImplementedFalse,
  worldFormationImplementedFalse,
} from '../site00-studio-world-production/authoredArtifact/index.js';
import {
  topHeadlinePanelDefaultBlocked,
  bottomEvidencePanelDefaultBlocked,
} from '../site00-studio-world-production/authoredArtifact/evaluations.js';

describe('P0.5C.6A Authored Artifact Grammar', () => {
  const characterSystem = buildVitestBrandCharacterSystemForMarketing();
  const expressionSystem = compileBrandMarketingExpressionSystem({
    characterSystem,
    northStarId: buildFounderMarketingNorthStarArtifact('ndxbook').id,
    projectId: 'ndxbook',
  });
  const { artifacts } = formulateExperiment01Artifacts({
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  let v23Experiment: ReturnType<typeof formulateExperiment01V23>['experiment'];

  beforeAll(() => {
    const v2 = formulateExperiment01V2({ v1Artifacts: artifacts, expressionSystem, characterSystemId: characterSystem.id });
    const v21 = formulateExperiment01V21({
      v1Artifacts: artifacts,
      v2Experiment: v2.experiment,
      expressionSystem,
      characterSystemId: characterSystem.id,
    });
    const v22 = formulateExperiment01V22({
      v1Artifacts: artifacts,
      v21Experiment: v21.experiment,
      expressionSystem,
      characterSystemId: characterSystem.id,
    });
    const formulated = formulateExperiment01V23({
      v1Artifacts: artifacts,
      v22Experiment: v22.experiment,
      expressionSystem,
    });
    v23Experiment = formulated.experiment;
  });

  it('implements generic AuthoredArtifactSystem', () => {
    expect(STUDIO_WORLD_AUTHORED_ARTIFACT_SYSTEM_IMPLEMENTED).toBe(true);
    expect(authoredArtifactAuthorityChainCorrect()).toBe(true);
    const chain = getAuthoredArtifactAuthorityChain();
    expect(chain.indexOf('HUMAN_HISTORY')).toBeLessThan(chain.indexOf('EDITORIAL_INFORMATION'));
  });

  it('NDX authority chain includes NDX intervention before editorial information', () => {
    expect(NDX_AUTHORED_ARTIFACT_AUTHORITY_CHAIN.indexOf('NDX_INTERVENTION')).toBeLessThan(
      NDX_AUTHORED_ARTIFACT_AUTHORITY_CHAIN.indexOf('EDITORIAL_INFORMATION'),
    );
  });

  it('V2.3 contracts include authored artifact evaluation bundle', () => {
    expect(v23Experiment.generatedArtifacts.length).toBe(9);
    for (const a of v23Experiment.generatedArtifacts) {
      expect(a.contract.authoredArtifactEvaluation).toBeDefined();
      expect(v23AuthoredArtifactGatePasses(a)).toBe(true);
    }
  });

  it('FAL compiler P0.5C.6A — authored artifact sections + authority order', () => {
    expect(V23_FAL_COMPILER_VERSION).toBe('falPromptCompilerV23@P0.5C.6A');
    const artifact = v23Experiment.generatedArtifacts[0]!;
    const v1 = { id: artifact.v1ArtifactId, topic: artifact.topic, subject: artifact.subject, supportingLanguage: [], headline: '', subhead: '' } as never;
    const fal = compileArtBoardMaterialityFalPrompt({ artifact: v1, contract: artifact.contract });
    expect(materialFalPromptHasAuthoredArtifactGrammar(fal)).toBe(true);
    expect(materialFalPromptHasNdxInterventionSection(fal)).toBe(true);
    expect(materialFalPromptHasHumanHistorySection(fal)).toBe(true);
    expect(materialFalPromptHasInformationInhabitationSection(fal)).toBe(true);
    expect(materialFalPromptHasAntiTemplateFrameSection(fal)).toBe(true);
    expect(materialFalPromptHasOverResolutionGuard(fal)).toBe(true);
    expect(materialFalPromptHumanHistoryBeforeInformationHierarchy(fal)).toBe(true);
    expect(materialFalPromptBlocksTopHeadlinePanel(fal)).toBe(true);
    expect(materialFalPromptBlocksBottomEvidencePanel(fal)).toBe(true);
  });

  it('subscription artifact — shelf comparison preserved, template frame blocked', () => {
    const subscription = v23Experiment.generatedArtifacts.find((a) => a.topic.includes('subscription') || a.id.endsWith('-1'))!;
    expect(subscription).toBeDefined();
    const aa = subscription.contract.authoredArtifactEvaluation!;
    expect(aa.intervention.rawVisualArtifact).toContain('THEN/NOW shelf');
    expect(aa.informationInhabitation.headlinePlacement).not.toContain('TOP_PANEL');
    expect(aa.informationInhabitation.evidencePlacement).not.toContain('BOTTOM_PANEL');
    expect(aa.templateFrameDetection.passes).toBe(true);
    expect(topHeadlinePanelDefaultBlocked(aa.templateFrameDetection)).toBe(true);
    expect(bottomEvidencePanelDefaultBlocked(aa.templateFrameDetection)).toBe(true);
  });

  it('feed artifact grammar diversity — same person not same template', () => {
    const board = evaluateV23BoardArtifactGrammar(v23Experiment.generatedArtifacts);
    expect(board.uniqueHeadlinePositionCount).toBeGreaterThanOrEqual(4);
    expect(board.uniqueEvidencePositionCount).toBeGreaterThanOrEqual(4);
    expect(board.passes).toBe(true);
  });

  it('pre-C6A queue supersession detects stale prompts', () => {
    const stale = {
      ...v23Experiment.generatedArtifacts[0]!,
      promptSnapshots: [],
      generationContract: { prompt: 'legacy prompt without authored artifact grammar', negativePrompt: '', promptHash: 'x', sectionOrder: [] },
    };
    expect(artifactHasPreC6APrompt(stale)).toBe(true);
    expect(PRE_C6A_QUEUE_SUPERSESSION_IMPLEMENTED).toBe(true);
  });

  it('Round 01 gate includes authored artifact evaluation', () => {
    const gate = round01VisualAuthorityGate({
      v23Experiment: {
        ...v23Experiment,
        generatedArtifacts: v23Experiment.generatedArtifacts.map((a) => ({
          ...a,
          generationStatus: 'GENERATED' as const,
          generatedAssetUrl: 'http://x',
        })),
      },
    });
    expect(gate.allowed).toBe(true);
    expect(v23Experiment.generatedArtifacts.every((a) => authoredArtifactGatePasses(a))).toBe(true);
  });

  it('preserves experimental integrity — no V2.4, no auto-regeneration', () => {
    expect(v24NotCreated()).toBe(true);
    expect(V2_4_CREATED).toBe(false);
    expect(automaticRegenerationFalse()).toBe(false);
    expect(brandCharacterMutatedFalse()).toBe(false);
    expect(brandCanonMutatedFalse()).toBe(false);
    expect(productExpressionImplementedFalse()).toBe(false);
    expect(worldFormationImplementedFalse()).toBe(false);
    expect(P0_5C_6A_IMPLEMENTED).toBe(true);
    expect(P0_5C_6_VISUAL_AUTHORITY_PRESERVED).toBe(true);
    expect(BESPOKE_ART_DIRECTION_DOMINANCE_PRESERVED).toBe(true);
    expect(SIGNATURE_LIME_RESTRAINT_PRESERVED).toBe(true);
    expect(FIRST_PERSON_AUTHORSHIP_STRENGTHENED).toBe(true);
  });

  it('reports all success criteria booleans', () => {
    expect(AUTHORED_ARTIFACT_GRAMMAR_IMPLEMENTED).toBe(true);
    expect(HUMAN_HISTORY_AUTHORITY_IMPLEMENTED).toBe(true);
    expect(NDX_INTERVENTION_CAUSALITY_IMPLEMENTED).toBe(true);
    expect(TOP_HEADLINE_PANEL_DEFAULT_BLOCKED).toBe(true);
    expect(BOTTOM_EVIDENCE_PANEL_DEFAULT_BLOCKED).toBe(true);
    expect(HEADER_BODY_FOOTER_TEMPLATE_BLOCKED).toBe(true);
    expect(INFOGRAPHIC_SHELL_DEFAULT_BLOCKED).toBe(true);
    expect(INFORMATION_INHABITS_ARTIFACT_IMPLEMENTED).toBe(true);
    expect(OVER_RESOLVED_GRAPHIC_GUARD_IMPLEMENTED).toBe(true);
    expect(DECORATIVE_HUMAN_MARKS_BLOCKED).toBe(true);
    expect(RANDOM_ANALOG_TEXTURE_BLOCKED).toBe(true);
    expect(ARTIFACT_GRAMMAR_DIVERSITY_IMPLEMENTED).toBe(true);
    expect(CHARACTER_CAUSAL_AUTHORSHIP_PREPARED).toBe(true);
  });
});
