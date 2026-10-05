/**
 * P0.5C.7 — Canonical Hand-Built Notebook Carousel Grammar
 */

import { beforeAll, describe, expect, it } from 'vitest';
import {
  PHYSICAL_PAGE_LINEAGE_SIGNALS,
  V23C_NOTEBOOK_FOUNDER_JUDGMENTS,
  V2_4_CREATED,
  NOTEBOOK_CAROUSEL_GRAMMAR_IMPLEMENTED,
} from './artBoardMateriality/constants.js';
import {
  P0_5C_7_IMPLEMENTED,
  PHYSICAL_PAGE_OBJECT_CONTRACT_IMPLEMENTED,
  PHYSICAL_PAGE_LINEAGE_REQUIRED,
  LAUNCH_POSTS_REGISTERED_AS_NORTH_STAR_EVIDENCE,
  LAUNCH_POSTS_USED_AS_LITERAL_TEMPLATE,
  V2_3_HISTORICAL_ASSETS_MUTATED,
  FOUNDER_REVIEW_REQUIRED_FOR_REGENERATION,
  AUTOMATIC_PROVIDER_SPEND_DURING_SPRINT,
  allP05C7SuccessCriteria,
  notebookCarouselAuthorityChainCorrect,
  legacyAuthorityChainBlocked,
  NEW_VERSION_V2_4_CREATED,
  NDX_NOTEBOOK_CAROUSEL_AUTHORITY_CHAIN,
  NOTEBOOK_CAROUSEL_GRAMMAR_VERSION,
} from './artBoardMateriality/notebookCarouselGrammarP05C7.js';
import {
  resolveNDXPageObjectContract,
  pageObjectHasPhysicalLineage,
  resolveCarouselSequencePageRole,
  pageObjectContractImplemented,
} from './artBoardMateriality/ndxPageObjectContract.js';
import {
  resolveNDXConstructionHistory,
  constructionHistoryImplemented,
} from './artBoardMateriality/ndxConstructionHistory.js';
import {
  compileArtBoardMaterialityFalPrompt,
  materialFalPromptHasPhysicalPageObjectSection,
  materialFalPromptHasNotebookAuthorityChain,
  materialFalPromptHasConstructionHistorySection,
  materialFalPromptHasUppercaseAuthorshipSection,
  materialFalPromptHasNegativeTemplateConstraints,
  materialFalPromptPageObjectBeforeTypography,
} from './artBoardMateriality/falPromptCompilerV23.js';
import {
  evaluateNDXPhysicalPage,
  evaluateNDXTemplateGrammar,
  evaluateNDXAuthorshipCase,
  evaluateNDXPhotoIntegration,
  evaluateNDXConstructionHistoryGate,
  evaluateNDXPageVariety,
  allNotebookCarouselGatesPass,
  notebookCarouselGatePasses,
} from './artBoardMateriality/notebookCarouselEvaluation.js';
import {
  NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET,
  northStarSetRegistered,
  northStarUsedAsLiteralTemplate,
} from './artBoardMateriality/ndxNotebookCarouselNorthStar.js';
import { auditV23CarouselPaths, auditPromptForNotebookGrammar } from './artBoardMateriality/notebookCarouselMigrationAudit.js';
import {
  NOTEBOOK_PILOT_REGENERATION,
  founderReviewRequiredForRegeneration,
  isNotebookFounderJudgment,
} from './artBoardMateriality/notebookCarouselFounderReview.js';
import { notebookCarouselGrammarGatePasses, round01NotebookCarouselGate } from './artBoardMateriality/approvalGate.js';
import { formulateExperiment01V23 } from './artBoardMateriality/experiment01V23.js';
import { artifactHasPreC7Prompt } from './artBoardMateriality/experiment01V23Supersession.js';
import { V23_FAL_COMPILER_VERSION, V23_METHODOLOGY_VERSIONS, V23_GOVERNANCE_VERSIONS } from './artBoardMateriality/v23GenerationAuthorityConstants.js';
import { v24NotCreated } from './artBoardMateriality/v23GenerationAuthority.js';
import { compileBrandMarketingExpressionSystem } from './brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from './brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from './brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01Artifacts } from './brandMarketingExpression/characterEventFormulation.js';
import { formulateExperiment01V2 } from './editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from './culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from './characterRetention/experiment01V22.js';
import {
  automaticRegenerationFalse,
  brandCharacterMutatedFalse,
  brandCanonMutatedFalse,
} from '../site00-studio-world-production/authoredArtifact/index.js';

describe('P0.5C.7 Notebook Carousel Grammar', () => {
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
    v23Experiment = formulateExperiment01V23({
      v1Artifacts: artifacts,
      v22Experiment: v22.experiment,
      expressionSystem,
    }).experiment;
  });

  it('implements amended visual authority chain — PAGE OBJECT first', () => {
    expect(notebookCarouselAuthorityChainCorrect()).toBe(true);
    expect(legacyAuthorityChainBlocked()).toBe(true);
    expect(NDX_NOTEBOOK_CAROUSEL_AUTHORITY_CHAIN[0]).toBe('CONTENT_THESIS');
    expect(NDX_NOTEBOOK_CAROUSEL_AUTHORITY_CHAIN[1]).toBe('PAGE_OBJECT');
    expect(NDX_NOTEBOOK_CAROUSEL_AUTHORITY_CHAIN.indexOf('PAGE_MATERIAL')).toBeLessThan(
      NDX_NOTEBOOK_CAROUSEL_AUTHORITY_CHAIN.indexOf('TYPOGRAPHY'),
    );
  });

  it('NDXPageObjectContract resolves with physical lineage', () => {
    expect(pageObjectContractImplemented()).toBe(true);
    expect(PHYSICAL_PAGE_LINEAGE_SIGNALS.length).toBeGreaterThanOrEqual(18);
    for (let i = 1; i <= 9; i++) {
      const artifact = v23Experiment.generatedArtifacts[i - 1]!;
      const pageObject = resolveNDXPageObjectContract(artifact.contract, i);
      expect(pageObjectHasPhysicalLineage(pageObject)).toBe(true);
      expect(pageObject.physicalLineageSignals.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('NDXConstructionHistory preserves assembly evidence', () => {
    expect(constructionHistoryImplemented()).toBe(true);
    const artifact = v23Experiment.generatedArtifacts[0]!;
    const history = resolveNDXConstructionHistory(artifact.contract, 1);
    expect(history.preservesAssemblyEvidence).toBe(true);
    expect(history.modificationActions.length).toBeGreaterThanOrEqual(1);
    expect(history.survivingEvidence.length).toBeGreaterThanOrEqual(1);
  });

  it('FAL compiler P0.5C.7 — notebook grammar sections', () => {
    expect(V23_FAL_COMPILER_VERSION).toBe('falPromptCompilerV23@P0.5C.7');
    expect(V23_METHODOLOGY_VERSIONS[0]).toBe('NOTEBOOK_CAROUSEL_GRAMMAR@P0.5C.7');
    expect(V23_GOVERNANCE_VERSIONS).toContain('NOTEBOOK_CAROUSEL_GRAMMAR@P0.5C.7');
    const artifact = v23Experiment.generatedArtifacts[0]!;
    const v1 = {
      id: artifact.v1ArtifactId,
      topic: artifact.topic,
      subject: artifact.subject,
      supportingLanguage: [],
      headline: '',
      subhead: '',
    } as never;
    const fal = compileArtBoardMaterialityFalPrompt({ artifact: v1, contract: artifact.contract, topicIndex: 1 });
    expect(materialFalPromptHasPhysicalPageObjectSection(fal)).toBe(true);
    expect(materialFalPromptHasNotebookAuthorityChain(fal)).toBe(true);
    expect(materialFalPromptHasConstructionHistorySection(fal)).toBe(true);
    expect(materialFalPromptHasUppercaseAuthorshipSection(fal)).toBe(true);
    expect(materialFalPromptHasNegativeTemplateConstraints(fal)).toBe(true);
    expect(materialFalPromptPageObjectBeforeTypography(fal)).toBe(true);
    const audit = auditPromptForNotebookGrammar({ artifact: v1, contract: artifact.contract });
    expect(audit.passes).toBe(true);
    expect(audit.missingSections).toEqual([]);
  });

  it('notebook carousel QA gates pass for V2.3 board', () => {
    for (let i = 0; i < v23Experiment.generatedArtifacts.length; i++) {
      const a = v23Experiment.generatedArtifacts[i]!;
      expect(evaluateNDXPhysicalPage(a, i + 1).passes).toBe(true);
      expect(evaluateNDXTemplateGrammar(a).passes).toBe(true);
      expect(evaluateNDXAuthorshipCase(a).passes).toBe(true);
      expect(evaluateNDXPhotoIntegration(a, i + 1).passes).toBe(true);
      expect(evaluateNDXConstructionHistoryGate(a, i + 1).passes).toBe(true);
      expect(notebookCarouselGatePasses(a, i + 1)).toBe(true);
    }
    const variety = evaluateNDXPageVariety(v23Experiment.generatedArtifacts);
    expect(variety.uniqueMaterials).toBeGreaterThanOrEqual(3);
    expect(variety.uniqueEdgeBehaviors).toBeGreaterThanOrEqual(3);
    expect(variety.uniqueLineageSignals).toBeGreaterThanOrEqual(5);
    expect(variety.passes).toBe(true);
    expect(allNotebookCarouselGatesPass(v23Experiment.generatedArtifacts)).toBe(true);
  });

  it('north star launch posts registered — not literal templates', () => {
    expect(northStarSetRegistered()).toBe(true);
    expect(LAUNCH_POSTS_REGISTERED_AS_NORTH_STAR_EVIDENCE).toBe(true);
    expect(northStarUsedAsLiteralTemplate()).toBe(false);
    expect(LAUNCH_POSTS_USED_AS_LITERAL_TEMPLATE).toBe(false);
    expect(NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET.map((n) => n.title)).toEqual([
      'MEET NDX',
      'EVERYBODY HAS A PERSONAL BRAND',
      'THINGS I SAVED THIS WEEK',
    ]);
    for (const ns of NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET) {
      expect(ns.usedAsLiteralTemplate).toBe(false);
    }
  });

  it('migration audit identifies paths and plan', () => {
    const audit = auditV23CarouselPaths();
    expect(audit.grammarVersion).toBe(NOTEBOOK_CAROUSEL_GRAMMAR_VERSION);
    expect(audit.migrationPlan.length).toBeGreaterThanOrEqual(4);
    expect(audit.entries.some((e) => e.status === 'MIGRATED')).toBe(true);
  });

  it('founder review labels + pilot regeneration config', () => {
    expect(V23C_NOTEBOOK_FOUNDER_JUDGMENTS).toContain('THIS_FEELS_LIKE_THE_BOOK');
    expect(V23C_NOTEBOOK_FOUNDER_JUDGMENTS).toContain('LOWERCASE_ERROR');
    expect(isNotebookFounderJudgment('TOO_TEMPLATE')).toBe(true);
    expect(founderReviewRequiredForRegeneration()).toBe(true);
    expect(NOTEBOOK_PILOT_REGENERATION.autoLock).toBe(false);
    expect(NOTEBOOK_PILOT_REGENERATION.automaticProviderSpend).toBe(false);
    expect(FOUNDER_REVIEW_REQUIRED_FOR_REGENERATION).toBe(true);
    expect(AUTOMATIC_PROVIDER_SPEND_DURING_SPRINT).toBe(false);
  });

  it('pre-C7 prompt supersession detection', () => {
    const stale = {
      ...v23Experiment.generatedArtifacts[0]!,
      promptSnapshots: [],
      generationContract: {
        prompt: 'legacy v23 prompt without notebook grammar sections',
        negativePrompt: '',
        promptHash: 'x',
        sectionOrder: [],
      },
    };
    expect(artifactHasPreC7Prompt(stale)).toBe(true);
    expect(artifactHasPreC7Prompt(v23Experiment.generatedArtifacts[0]!)).toBe(false);
  });

  it('approval gate includes notebook carousel grammar', () => {
    expect(notebookCarouselGrammarGatePasses(v23Experiment.generatedArtifacts[0]!, 1)).toBe(true);
    const gate = round01NotebookCarouselGate({
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
  });

  it('sequence page roles vary across carousel', () => {
    const roles = new Set(v23Experiment.generatedArtifacts.map((_, i) => resolveCarouselSequencePageRole(i + 1)));
    expect(roles.size).toBeGreaterThanOrEqual(4);
  });

  it('preserves experimental integrity — no V2.4, no historical mutation', () => {
    expect(v24NotCreated()).toBe(true);
    expect(V2_4_CREATED).toBe(false);
    expect(NEW_VERSION_V2_4_CREATED).toBe(false);
    expect(V2_3_HISTORICAL_ASSETS_MUTATED).toBe(false);
    expect(automaticRegenerationFalse()).toBe(false);
    expect(AUTOMATIC_PROVIDER_SPEND_DURING_SPRINT).toBe(false);
    expect(brandCharacterMutatedFalse()).toBe(false);
    expect(brandCanonMutatedFalse()).toBe(false);
    expect(P0_5C_7_IMPLEMENTED).toBe(true);
    expect(PHYSICAL_PAGE_OBJECT_CONTRACT_IMPLEMENTED).toBe(true);
    expect(PHYSICAL_PAGE_LINEAGE_REQUIRED).toBe(true);
  });

  it('all success criteria booleans match spec', () => {
    const criteria = allP05C7SuccessCriteria();
    const mustBeTrue = Object.entries(criteria).filter(
      ([key]) =>
        ![
          'LAUNCH_POSTS_USED_AS_LITERAL_TEMPLATE',
          'V2_3_HISTORICAL_ASSETS_MUTATED',
          'NEW_VERSION_V2_4_CREATED',
          'AUTOMATIC_PROVIDER_SPEND_DURING_SPRINT',
          'BRAND_CHARACTER_MUTATED',
          'BRAND_CANON_MUTATED',
          'HISTORICAL_LINEAGE_MUTATED',
        ].includes(key),
    );
    for (const [key, value] of mustBeTrue) {
      expect(value, key).toBe(true);
    }
    expect(criteria.LAUNCH_POSTS_USED_AS_LITERAL_TEMPLATE).toBe(false);
    expect(criteria.V2_3_HISTORICAL_ASSETS_MUTATED).toBe(false);
    expect(criteria.NEW_VERSION_V2_4_CREATED).toBe(false);
    expect(criteria.AUTOMATIC_PROVIDER_SPEND_DURING_SPRINT).toBe(false);
    expect(criteria.BRAND_CHARACTER_MUTATED).toBe(false);
    expect(criteria.BRAND_CANON_MUTATED).toBe(false);
    expect(criteria.HISTORICAL_LINEAGE_MUTATED).toBe(false);
  });
});
