/**
 * V2.3 founder revision note → contract → FAL prompt pipeline
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  V23_FOUNDER_REVISION_PIPELINE_IMPLEMENTED,
  isV23ApprovalJudgment,
  judgmentRequiresRevisionNote,
  revisionNotePlaceholder,
  buildFounderRevisionDirective,
  applyFounderRevisionToV23Artifact,
  founderRevisionUsesParentReference,
} from './artBoardMateriality/v23FounderRevisionPipeline.js';
import { compileArtBoardMaterialityFalPrompt } from './artBoardMateriality/falPromptCompilerV23.js';
import { formulateExperiment01V23 } from './artBoardMateriality/experiment01V23.js';
import { formulateExperiment01Artifacts } from './brandMarketingExpression/characterEventFormulation.js';
import { compileBrandMarketingExpressionSystem } from './brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from './brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from './brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01V2 } from './editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from './culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from './characterRetention/experiment01V22.js';

describe('V2.3 founder revision pipeline', () => {
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
  let v23Artifact: ReturnType<typeof formulateExperiment01V23>['artifacts'][number];
  let v1Artifact: (typeof artifacts)[number];

  beforeAll(() => {
    const v2 = formulateExperiment01V2({ v1Artifacts: artifacts, expressionSystem, characterSystemId: characterSystem.id });
    const v21 = formulateExperiment01V21({ v1Artifacts: artifacts, v2Experiment: v2.experiment, expressionSystem, characterSystemId: characterSystem.id });
    const v22 = formulateExperiment01V22({ v1Artifacts: artifacts, v21Experiment: v21.experiment, expressionSystem, characterSystemId: characterSystem.id });
    const v23 = formulateExperiment01V23({ v1Artifacts: artifacts, v22Experiment: v22.experiment, expressionSystem });
    v23Artifact = v23.artifacts[0]!;
    v1Artifact = artifacts.find((a) => a.id === v23Artifact.v1ArtifactId)!;
    v23Artifact = {
      ...v23Artifact,
      generatedAssetUrl: 'https://vitest.local/parent.png',
      generationStatus: 'GENERATED',
    };
  });

  it('pipeline is implemented', () => {
    expect(V23_FOUNDER_REVISION_PIPELINE_IMPLEMENTED).toBe(true);
  });

  it('approval judgments do not require revision notes', () => {
    expect(isV23ApprovalJudgment('LIME_PERFECT')).toBe(true);
    expect(judgmentRequiresRevisionNote('LIME_PERFECT')).toBe(false);
  });

  it('revision judgments require notes', () => {
    expect(judgmentRequiresRevisionNote('NEEDS_LIME')).toBe(true);
    expect(judgmentRequiresRevisionNote('MAKE_THIS_WORD_LIME')).toBe(true);
    expect(revisionNotePlaceholder('NEEDS_LIME')).toContain('signature lime');
  });

  it('builds founder revision directive with preserve rules', () => {
    const directive = buildFounderRevisionDirective({
      judgment: 'NEEDS_LIME',
      founderNote: 'APOLOGY word in lime',
      primaryHook: v23Artifact.contract.primaryHook,
    });
    expect(directive).toContain('NEEDS LIME');
    expect(directive).toContain('APOLOGY word in lime');
    expect(directive).toContain('PRESERVE');
  });

  it('applyFounderRevisionToV23Artifact queues generation with history', () => {
    const revised = applyFounderRevisionToV23Artifact({
      artifact: v23Artifact,
      v1Artifact,
      judgment: 'MAKE_THIS_WORD_LIME',
      founderNote: 'Make APOLOGY lime',
    });
    expect(revised.generationStatus).toBe('GENERATING');
    expect(revised.founderJudgment).toBe('MAKE_THIS_WORD_LIME');
    expect(revised.founderJudgmentNote).toBe('Make APOLOGY lime');
    expect(revised.revisionHistory).toHaveLength(1);
    expect(revised.revisionHistory[0]?.status).toBe('GENERATING');
    expect(revised.parentGeneratedAssetUrl).toBe('https://vitest.local/parent.png');
    expect(revised.generationContract?.prompt).toContain('FOUNDER REVISION DIRECTIVE');
  });

  it('FAL prompt includes founder revision directive', () => {
    const directive = buildFounderRevisionDirective({
      judgment: 'NEEDS_LIME',
      founderNote: 'NDX circle in lime',
      primaryHook: v23Artifact.contract.primaryHook,
    });
    const prompt = compileArtBoardMaterialityFalPrompt({
      artifact: v1Artifact,
      contract: v23Artifact.contract,
      founderRevisionDirective: directive,
    });
    expect(prompt.prompt).toContain('FOUNDER REVISION DIRECTIVE');
    expect(prompt.prompt).toContain('NDX circle in lime');
  });

  it('uses parent asset for reference edit when available', () => {
    expect(founderRevisionUsesParentReference('https://vitest.local/parent.png')).toBe(true);
    expect(founderRevisionUsesParentReference(null)).toBe(false);
  });
});
