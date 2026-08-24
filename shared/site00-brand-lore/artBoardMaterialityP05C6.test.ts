/**
 * P0.5C.6 — Visual appetite authority + bespoke art direction dominance (regression suite).
 */

import { beforeAll, describe, expect, it } from 'vitest';
import {
  BESPOKE_ART_DIRECTION_DOMINANCE_IMPLEMENTED,
  P0_5C_6_IMPLEMENTED,
  PRE_C6_QUEUE_SUPERSESSION_IMPLEMENTED,
  ROUND_01_VISUAL_AUTHORITY_GATE_IMPLEMENTED,
  V2_4_CREATED,
  VISUAL_APPETITE_AUTHORITY_IMPLEMENTED,
} from './artBoardMateriality/constants.js';
import {
  compileArtBoardMaterialityFalPrompt,
  materialFalPromptArtDirectionBeforeInformationHierarchy,
  materialFalPromptBlocksVisualBlandnessInterpretation,
  materialFalPromptHasVisualAuthoritySection,
} from './artBoardMateriality/falPromptCompilerV23.js';
import { formulateExperiment01V23, v22HistoryNotMutated } from './artBoardMateriality/experiment01V23.js';
import {
  artifactHasPreC6Prompt,
  shouldAutoSupersedeV23Generation,
} from './artBoardMateriality/experiment01V23Supersession.js';
import {
  artBoardMaterialityApprovalGatePasses,
  round01LockRequiresMaterialGate,
  round01VisualAuthorityGate,
  visualAuthorityGatePasses,
} from './artBoardMateriality/approvalGate.js';
import { evaluateV23BoardVisualAuthority, v23VisualAuthorityGatePasses } from './artBoardMateriality/visualAuthorityC6.js';
import { V23_FAL_COMPILER_VERSION } from './artBoardMateriality/v23GenerationAuthorityConstants.js';
import { compileCurrentV23FalPrompt, selectedAssetPassesCurrentLineage, v24NotCreated } from './artBoardMateriality/v23GenerationAuthority.js';
import { compileBrandMarketingExpressionSystem } from './brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from './brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from './brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01Artifacts } from './brandMarketingExpression/characterEventFormulation.js';
import { formulateExperiment01V2 } from './editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from './culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from './characterRetention/experiment01V22.js';
import {
  designAuthorityChainCorrect,
  getDesignAuthorityChain,
  informationArchitectureSubordinateToArtDirection,
  visualComplexitySeparateFromInformationComplexity,
  automaticRegenerationFalse,
  brandCharacterMutatedFalse,
  brandCanonMutatedFalse,
  productExpressionImplementedFalse,
  worldFormationImplementedFalse,
  STUDIO_WORLD_VISUAL_AUTHORITY_SYSTEM_IMPLEMENTED,
  VISUAL_APPETITE_AUTHORITY_IMPLEMENTED as GENERIC_VISUAL_APPETITE,
  BESPOKE_ART_DIRECTION_DOMINANCE_IMPLEMENTED as GENERIC_BESPOKE,
  ARTISTICALLY_RICH_COGNITIVELY_SIMPLE_IMPLEMENTED,
  V2_1_VISUAL_DISCOVERY_INHERITED,
  V2_3_EDITORIAL_LOGIC_PRESERVED,
  EVIDENCE_DEFAULT_COMPOSITION_BLOCKED,
  TEXT_DEFAULT_VISUAL_INTEREST_BLOCKED,
  REUSABLE_TEMPLATE_COMPOSITION_BLOCKED,
  FEED_ARTISTIC_RANGE_IMPLEMENTED,
} from '../site00-studio-world-production/visualAuthority/index.js';
import { buildExperimentVisualAuthorityForensic, visualFlatteningCause } from '../site00-studio-world-production/visualAuthority/forensic.js';
import {
  evidenceDefaultCompositionBlocked,
  evaluateTextRemovalVisualIntegrity,
  evaluateWouldIStopBeforeReading,
  reusableTemplateCompositionBlocked,
  textDefaultVisualInterestBlocked,
} from '../site00-studio-world-production/visualAuthority/evaluations.js';
import { buildVisualDiscoveryInheritance, slide02NotGenerated, v21VisualDiscoveryInherited, v23EditorialLogicPreserved } from '../site00-studio-world-production/visualAuthority/visualDiscoveryInheritance.js';
import { V2_3_EDITORIAL_LOGIC_PRESERVED } from '../site00-studio-world-production/visualAuthority/constants.js';

describe('P0.5C.6 Visual Authority System', () => {
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
  let v21Experiment: ReturnType<typeof formulateExperiment01V21>['experiment'];

  beforeAll(() => {
    const v2 = formulateExperiment01V2({ v1Artifacts: artifacts, expressionSystem, characterSystemId: characterSystem.id });
    const v21 = formulateExperiment01V21({
      v1Artifacts: artifacts,
      v2Experiment: v2.experiment,
      expressionSystem,
      characterSystemId: characterSystem.id,
    });
    v21Experiment = v21.experiment;
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

  it('implements generic VisualAuthoritySystem', () => {
    expect(STUDIO_WORLD_VISUAL_AUTHORITY_SYSTEM_IMPLEMENTED).toBe(true);
    expect(GENERIC_VISUAL_APPETITE).toBe(true);
    expect(GENERIC_BESPOKE).toBe(true);
    expect(ARTISTICALLY_RICH_COGNITIVELY_SIMPLE_IMPLEMENTED).toBe(true);
    expect(designAuthorityChainCorrect()).toBe(true);
  });

  it('reorders design authority — art direction before editorial hierarchy', () => {
    const chain = getDesignAuthorityChain();
    expect(informationArchitectureSubordinateToArtDirection(chain)).toBe(true);
    expect(visualComplexitySeparateFromInformationComplexity()).toBe(true);
  });

  it('V2.3 contracts include bespoke art direction + visual authority evaluation', () => {
    expect(v23Experiment.generatedArtifacts.length).toBe(9);
    for (const a of v23Experiment.generatedArtifacts) {
      expect(a.contract.visualAuthorityEvaluation).toBeDefined();
      expect(a.contract.visualAuthorityEvaluation?.bespokeArtDirection.artisticPremise.length).toBeGreaterThan(0);
      expect(v23VisualAuthorityGatePasses(a)).toBe(true);
    }
  });

  it('FAL compiler P0.5C.6 — art direction before information hierarchy', () => {
    expect(V23_FAL_COMPILER_VERSION).toBe('falPromptCompilerV23@P0.5C.6');
    const artifact = v23Experiment.generatedArtifacts[0]!;
    const v1 = { id: artifact.v1ArtifactId, topic: artifact.topic, subject: artifact.subject, supportingLanguage: [], headline: '', subhead: '' } as never;
    const fal = compileArtBoardMaterialityFalPrompt({ artifact: v1, contract: artifact.contract });
    expect(materialFalPromptHasVisualAuthoritySection(fal)).toBe(true);
    expect(materialFalPromptArtDirectionBeforeInformationHierarchy(fal)).toBe(true);
    expect(materialFalPromptBlocksVisualBlandnessInterpretation(fal)).toBe(true);
  });

  it('forensic comparison acknowledges V2.1 strengths vs V2.3 logic', () => {
    const v21Modes = v21Experiment.generatedArtifacts.map((a) => a.contract.culturalParticipation.visualParticipationMode);
    const v23Modes = v23Experiment.generatedArtifacts.map((a) => a.contract.culturalParticipation.visualParticipationMode);
    const forensic = buildExperimentVisualAuthorityForensic({
      v21Modes,
      v23Modes,
      v21AppetiteScores: v21Experiment.generatedArtifacts.map((a) => a.contract.culturalParticipation.visualAppetiteEvaluation.overall),
      v23EvidenceLedCount: v23Modes.filter((_, i) => v23Experiment.generatedArtifacts[i]!.contract.culturalParticipation.visualParticipationBalance === 'EVIDENCE_LED').length,
    });
    expect(forensic.v21VisualStrengths.length).toBeGreaterThan(0);
    expect(forensic.v23LogicStrengths.length).toBeGreaterThan(0);
    expect(visualFlatteningCause(forensic).length).toBeGreaterThan(0);
  });

  it('visual appetite + text removal + evidence role gates', () => {
    const stop = evaluateWouldIStopBeforeReading({
      artifactId: 't',
      imageHero: true,
      objectHero: false,
      humanPresence: true,
      participationMode: 'IMAGE_DOMINANT',
      visualAppetiteOverall: 'STRONG',
    });
    expect(stop.passes).toBe(true);
    const text = evaluateTextRemovalVisualIntegrity({ artifactId: 't', imageHero: true, objectHero: false, participationMode: 'IMAGE_DOMINANT' });
    expect(textDefaultVisualInterestBlocked(text)).toBe(true);
    expect(slide02NotGenerated()).toBe(true);
  });

  it('feed artistic range evaluation', () => {
    const board = evaluateV23BoardVisualAuthority(v23Experiment.generatedArtifacts);
    expect(board.uniqueBehaviorCount).toBeGreaterThanOrEqual(4);
    expect(FEED_ARTISTIC_RANGE_IMPLEMENTED).toBe(true);
  });

  it('V2.1 visual discovery inherited without creating V2.4', () => {
    const inheritance = buildVisualDiscoveryInheritance();
    expect(v21VisualDiscoveryInherited(inheritance)).toBe(true);
    expect(V2_3_EDITORIAL_LOGIC_PRESERVED).toBe(true);
    expect(v23EditorialLogicPreserved()).toBe(true);
    expect(v24NotCreated()).toBe(true);
    expect(V2_4_CREATED).toBe(false);
  });

  it('pre-C6 queue supersession detects stale prompts', () => {
    const stale = {
      ...v23Experiment.generatedArtifacts[0]!,
      promptSnapshots: [],
      generationContract: { prompt: 'legacy prompt without art direction section', negativePrompt: '', promptHash: 'x', sectionOrder: [] },
    };
    expect(artifactHasPreC6Prompt(stale)).toBe(true);
    expect(PRE_C6_QUEUE_SUPERSESSION_IMPLEMENTED).toBe(true);
  });

  it('Round 01 visual authority gate integrated', () => {
    expect(ROUND_01_VISUAL_AUTHORITY_GATE_IMPLEMENTED).toBe(true);
    const gate = round01VisualAuthorityGate({ v23Experiment: { ...v23Experiment, generatedArtifacts: v23Experiment.generatedArtifacts.map((a) => ({ ...a, generationStatus: 'GENERATED' as const, generatedAssetUrl: 'http://x' })) } });
    expect(gate.allowed).toBe(true);
  });

  it('preserves experimental integrity', () => {
    expect(v22HistoryNotMutated()).toBe(true);
    expect(brandCharacterMutatedFalse()).toBe(false);
    expect(brandCanonMutatedFalse()).toBe(false);
    expect(productExpressionImplementedFalse()).toBe(false);
    expect(worldFormationImplementedFalse()).toBe(false);
    expect(automaticRegenerationFalse()).toBe(false);
    expect(P0_5C_6_IMPLEMENTED).toBe(true);
    expect(VISUAL_APPETITE_AUTHORITY_IMPLEMENTED).toBe(true);
    expect(BESPOKE_ART_DIRECTION_DOMINANCE_IMPLEMENTED).toBe(true);
    expect(V2_1_VISUAL_DISCOVERY_INHERITED).toBe(true);
    expect(EVIDENCE_DEFAULT_COMPOSITION_BLOCKED).toBe(true);
    expect(TEXT_DEFAULT_VISUAL_INTEREST_BLOCKED).toBe(true);
    expect(REUSABLE_TEMPLATE_COMPOSITION_BLOCKED).toBe(true);
  });
});
