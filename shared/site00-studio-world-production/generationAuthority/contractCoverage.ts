/**
 * P0.5C.5A — GenerationContractCoverageEvaluation + compile-time assertions.
 */

import { randomUUID } from 'node:crypto';
import type { CompileTimeAssertionResult, GenerationContractCoverageEvaluation, GenerationContractCoverageLayer } from './types.js';
import { GENERATION_CONTRACT_COVERAGE_LAYERS } from './constants.js';

export function evaluateGenerationContractCoverage(params: {
  artifactId: string;
  prompt: string;
  negativePrompt: string;
  contractPresent: Record<string, boolean>;
}): GenerationContractCoverageEvaluation {
  const layers: Record<GenerationContractCoverageLayer, boolean> = {
    CHARACTER: params.contractPresent.character ?? params.prompt.includes('INTERNAL CHARACTER EXPRESSION'),
    EDITORIAL_DECISION: params.contractPresent.editorial ?? params.prompt.includes('INTERNAL THESIS'),
    FIRST_SLIDE_INFORMATION_ARCHITECTURE: params.contractPresent.firstSlide ?? params.prompt.includes('INFORMATION HIERARCHY'),
    TYPOGRAPHIC_GOVERNANCE: params.contractPresent.typography ?? params.prompt.includes('TYPOGRAPHY ROLES'),
    CULTURAL_IMAGE_PARTICIPATION: params.contractPresent.culturalImage ?? params.prompt.includes('CULTURAL PARTICIPATION'),
    VISUAL_SUBJECT_MATTER: params.contractPresent.visualSubject ?? params.prompt.includes('VISUAL SUBJECT'),
    HUMOR_CHARACTER_RETENTION: params.contractPresent.humor ?? params.prompt.includes('HUMOR / HUMAN TRACE'),
    ART_BOARD_MATERIALITY: params.contractPresent.materiality ?? params.prompt.includes('ARTIFACT FORM'),
    CANVAS_AS_OBJECT: params.contractPresent.canvas ?? params.prompt.includes('CANVAS IS AN OBJECT'),
    HUMAN_MADE_MARKS: params.prompt.includes('HUMAN-MADE MARKS'),
    SIGNATURE_LIME: params.prompt.includes('SIGNATURE LIME REQUIREMENT'),
    PUBLIC_AUTHORSHIP: params.prompt.includes('PUBLIC AUTHORSHIP MODE'),
    INTERNAL_LABEL_QUARANTINE: params.prompt.includes('INTERNAL CONTRACT LABELS ARE NOT PUBLIC COPY'),
    CURRENT_COPY: params.prompt.includes('VISIBLE NDX HEADLINE'),
    NEGATIVE_CONSTRAINTS: Boolean(params.negativePrompt?.length) && params.prompt.includes('NEGATIVE CONSTRAINTS'),
  };

  const missingLayers = GENERATION_CONTRACT_COVERAGE_LAYERS.filter((layer) => !layers[layer]);

  return {
    evaluationId: randomUUID(),
    artifactId: params.artifactId,
    layers,
    missingLayers,
    passesGate: missingLayers.length === 0,
    evaluatedAt: new Date().toISOString(),
  };
}

export function runCompileTimeAssertions(params: {
  prompt: string;
  negativePrompt: string;
  contractLoaded: boolean;
  compilerUsed: boolean;
}): CompileTimeAssertionResult[] {
  return [
    { assertion: 'assertCurrentContractLoaded', passed: params.contractLoaded, reason: params.contractLoaded ? null : 'Contract not loaded' },
    { assertion: 'assertCurrentCompilerUsed', passed: params.compilerUsed, reason: params.compilerUsed ? null : 'Compiler not used' },
    { assertion: 'assertHumanMadeMarksActive', passed: params.prompt.includes('HUMAN-MADE MARKS'), reason: null },
    { assertion: 'assertSignatureLimeActive', passed: params.prompt.includes('SIGNATURE LIME REQUIREMENT'), reason: null },
    { assertion: 'assertFirstPersonAuthorshipActive', passed: params.prompt.includes('PUBLIC AUTHORSHIP MODE'), reason: null },
    { assertion: 'assertInternalLabelQuarantineActive', passed: params.prompt.includes('INTERNAL CONTRACT LABELS ARE NOT PUBLIC COPY'), reason: null },
    { assertion: 'assertMaterialityActive', passed: params.prompt.includes('ARTIFACT FORM'), reason: null },
    { assertion: 'assertTypographyGovernanceActive', passed: params.prompt.includes('TYPOGRAPHY ROLES'), reason: null },
    { assertion: 'assertCulturalImageParticipationActive', passed: params.prompt.includes('CULTURAL PARTICIPATION'), reason: null },
    { assertion: 'assertCharacterRetentionActive', passed: params.prompt.includes('INTERNAL CHARACTER EXPRESSION'), reason: null },
  ];
}

export function allCompileTimeAssertionsPass(results: CompileTimeAssertionResult[]): boolean {
  return results.every((r) => r.passed);
}

export function generationBlockedStaleOrIncompleteContract(params: {
  freshnessRecompileRequired: boolean;
  coveragePasses: boolean;
  assertionsPass: boolean;
}): boolean {
  return params.freshnessRecompileRequired || !params.coveragePasses || !params.assertionsPass;
}
