/**
 * P0.5C.7 — Notebook carousel QA gates + evaluations.
 */

import type { Experiment01V23Artifact } from './types.js';
import {
  resolveNDXPageObjectContract,
  pageObjectHasPhysicalLineage,
} from './ndxPageObjectContract.js';
import { resolveNDXConstructionHistory } from './ndxConstructionHistory.js';
import type { NotebookCarouselFailureState } from './constants.js';
import { ndxAuthoredCopyIsUppercase } from '../editorialInformationArchitecture/typographyGovernance.js';

export type NDXPhysicalPageEvaluation = {
  passes: boolean;
  result: 'PASS_PHYSICAL_PAGE' | 'FAIL_NOT_PHYSICAL_PAGE';
  failureStates: NotebookCarouselFailureState[];
  questions: {
    existsAsPageObject: boolean;
    explainableAssembly: boolean;
    bindingEdgeMaterialEvidence: boolean;
    photoBelongsToConstruction: boolean;
    feelsHandled: boolean;
    feelsEdited: boolean;
    feelsPassedAround: boolean;
  };
};

export type NDXTemplateGrammarEvaluation = {
  passes: boolean;
  result: 'PASS' | 'FAIL_DIGITAL_TEMPLATE_GRAMMAR';
  failureStates: NotebookCarouselFailureState[];
  triggers: string[];
};

export type NDXAuthorshipCaseEvaluation = {
  passes: boolean;
  result: 'PASS' | 'FAIL_NDX_AUTHORSHIP_CASE';
  failureStates: NotebookCarouselFailureState[];
  lowercaseViolations: string[];
  authenticSourceExempt: boolean;
};

export type NDXPhotoIntegrationEvaluation = {
  passes: boolean;
  result: 'PASS' | 'FAIL_PHOTO_INTEGRATION';
  failureStates: NotebookCarouselFailureState[];
  photoMode: string;
};

export type NDXConstructionHistoryEvaluation = {
  passes: boolean;
  result: 'PASS' | 'FAIL_NO_CONSTRUCTION_HISTORY';
  failureStates: NotebookCarouselFailureState[];
  actionsFound: string[];
};

export type NDXPageVarietyEvaluation = {
  passes: boolean;
  uniqueMaterials: number;
  uniqueEdgeBehaviors: number;
  uniquePhotoModes: number;
  uniqueLineageSignals: number;
  failureStates: NotebookCarouselFailureState[];
};

export function evaluateNDXPhysicalPage(
  artifact: Experiment01V23Artifact,
  topicIndex: number,
): NDXPhysicalPageEvaluation {
  const pageObject = resolveNDXPageObjectContract(artifact.contract, topicIndex);
  const history = resolveNDXConstructionHistory(artifact.contract, topicIndex, pageObject);
  const failureStates: NotebookCarouselFailureState[] = [];

  const existsAsPageObject = pageObject.layerDepth >= 1 && String(pageObject.pageMaterial).length > 0;
  const explainableAssembly = history.preservesAssemblyEvidence;
  const bindingEdgeMaterialEvidence = pageObjectHasPhysicalLineage(pageObject);
  const photoBelongsToConstruction =
    pageObject.photoIntegrationMode === 'NONE' ||
    artifact.contract.artBoardDirection.imageSurfaceInteraction.length > 0;
  const feelsHandled = pageObject.pageAge !== 'FRESH';
  const feelsEdited = history.modificationActions.length >= 1;
  const feelsPassedAround = pageObject.surfaceMarks.length >= 1 || history.survivingEvidence.length >= 1;

  if (!existsAsPageObject) failureStates.push('FAIL_NOT_PHYSICAL_PAGE');
  if (!bindingEdgeMaterialEvidence) failureStates.push('FAIL_NOT_PHYSICAL_PAGE');
  if (!explainableAssembly) failureStates.push('FAIL_NO_CONSTRUCTION_HISTORY');

  const passes =
    existsAsPageObject &&
    explainableAssembly &&
    bindingEdgeMaterialEvidence &&
    photoBelongsToConstruction &&
    feelsHandled &&
    feelsEdited;

  return {
    passes,
    result: passes ? 'PASS_PHYSICAL_PAGE' : 'FAIL_NOT_PHYSICAL_PAGE',
    failureStates,
    questions: {
      existsAsPageObject,
      explainableAssembly,
      bindingEdgeMaterialEvidence,
      photoBelongsToConstruction,
      feelsHandled,
      feelsEdited,
      feelsPassedAround,
    },
  };
}

export function evaluateNDXTemplateGrammar(artifact: Experiment01V23Artifact): NDXTemplateGrammarEvaluation {
  const aa = artifact.contract.authoredArtifactEvaluation;
  const va = artifact.contract.visualAuthorityEvaluation;
  const failureStates: NotebookCarouselFailureState[] = [];
  const triggers: string[] = [];

  if (aa && !aa.templateFrameDetection.passes) {
    failureStates.push('FAIL_DIGITAL_TEMPLATE_GRAMMAR');
    triggers.push('template frame detected');
  }
  if (aa?.informationInhabitation.headlinePlacement.includes('TOP_PANEL')) {
    failureStates.push('FAIL_DIGITAL_TEMPLATE_GRAMMAR');
    triggers.push('top headline panel');
  }
  if (aa?.informationInhabitation.evidencePlacement.includes('BOTTOM_PANEL')) {
    failureStates.push('FAIL_DIGITAL_TEMPLATE_GRAMMAR');
    triggers.push('bottom evidence panel');
  }
  if (va?.bespokeArtDirection.compositionBehavior === 'SYMMETRICAL_GRID') {
    failureStates.push('FAIL_DIGITAL_TEMPLATE_GRAMMAR');
    triggers.push('symmetrical grid');
  }

  const passes = failureStates.length === 0;
  return {
    passes,
    result: passes ? 'PASS' : 'FAIL_DIGITAL_TEMPLATE_GRAMMAR',
    failureStates,
    triggers,
  };
}

export function evaluateNDXAuthorshipCase(artifact: Experiment01V23Artifact): NDXAuthorshipCaseEvaluation {
  const typography = artifact.contract.typographyAssignments ?? [];
  const passes = ndxAuthoredCopyIsUppercase(typography);
  const lowercaseViolations: string[] = [];

  if (!passes) {
    for (const t of typography) {
      if (t.isNdxAuthored && t.uppercaseRequired && t.text !== t.text.toUpperCase()) {
        lowercaseViolations.push(`${t.role}: "${t.text.slice(0, 40)}"`);
      }
    }
  }

  const failureStates: NotebookCarouselFailureState[] = passes ? [] : ['FAIL_NDX_AUTHORSHIP_CASE'];

  return {
    passes,
    result: passes ? 'PASS' : 'FAIL_NDX_AUTHORSHIP_CASE',
    failureStates,
    lowercaseViolations,
    authenticSourceExempt: true,
  };
}

export function evaluateNDXPhotoIntegration(
  artifact: Experiment01V23Artifact,
  topicIndex: number,
): NDXPhotoIntegrationEvaluation {
  const pageObject = resolveNDXPageObjectContract(artifact.contract, topicIndex);
  const cp = artifact.contract.culturalParticipation;
  const failureStates: NotebookCarouselFailureState[] = [];

  const hasPhotoParticipation = cp.visualParticipationMode.includes('PHOTO');
  const noSurfaceInteraction = !artifact.contract.artBoardDirection.imageSurfaceInteraction.length;
  if (hasPhotoParticipation && pageObject.photoIntegrationMode === 'NONE' && noSurfaceInteraction) {
    failureStates.push('FAIL_PHOTO_INTEGRATION');
  }

  const passes = failureStates.length === 0;
  return {
    passes,
    result: passes ? 'PASS' : 'FAIL_PHOTO_INTEGRATION',
    failureStates,
    photoMode: pageObject.photoIntegrationMode,
  };
}

export function evaluateNDXConstructionHistoryGate(
  artifact: Experiment01V23Artifact,
  topicIndex: number,
): NDXConstructionHistoryEvaluation {
  const history = resolveNDXConstructionHistory(artifact.contract, topicIndex);
  const failureStates: NotebookCarouselFailureState[] = [];
  const actionsFound = [history.originAction, ...history.modificationActions];
  const passes = history.preservesAssemblyEvidence && actionsFound.length >= 1;

  if (!passes) failureStates.push('FAIL_NO_CONSTRUCTION_HISTORY');

  return {
    passes,
    result: passes ? 'PASS' : 'FAIL_NO_CONSTRUCTION_HISTORY',
    failureStates,
    actionsFound,
  };
}

export function evaluateNDXPageVariety(artifacts: Experiment01V23Artifact[]): NDXPageVarietyEvaluation {
  const materials = new Set<string>();
  const edges = new Set<string>();
  const photoModes = new Set<string>();
  const lineage = new Set<string>();
  const failureStates: NotebookCarouselFailureState[] = [];

  artifacts.forEach((a, i) => {
    const po = resolveNDXPageObjectContract(a.contract, i + 1);
    materials.add(String(po.pageMaterial));
    edges.add(String(po.edgeBehavior));
    photoModes.add(po.photoIntegrationMode);
    po.physicalLineageSignals.forEach((s) => lineage.add(s));
  });

  const uniqueMaterials = materials.size;
  const uniqueEdgeBehaviors = edges.size;
  const uniquePhotoModes = photoModes.size;
  const uniqueLineageSignals = lineage.size;

  if (uniqueMaterials < 3) failureStates.push('FAIL_ALL_POSTS_SAME_CANVAS');
  if (uniqueEdgeBehaviors < 3) failureStates.push('FAIL_ALL_POSTS_TORN');
  if (uniqueLineageSignals < 5) failureStates.push('FAIL_ALL_POSTS_NOTEBOOK');

  return {
    passes: failureStates.length === 0,
    uniqueMaterials,
    uniqueEdgeBehaviors,
    uniquePhotoModes,
    uniqueLineageSignals,
    failureStates,
  };
}

export function notebookCarouselGatePasses(artifact: Experiment01V23Artifact, topicIndex: number): boolean {
  return (
    evaluateNDXPhysicalPage(artifact, topicIndex).passes &&
    evaluateNDXTemplateGrammar(artifact).passes &&
    evaluateNDXAuthorshipCase(artifact).passes &&
    evaluateNDXPhotoIntegration(artifact, topicIndex).passes &&
    evaluateNDXConstructionHistoryGate(artifact, topicIndex).passes
  );
}

export function allNotebookCarouselGatesPass(artifacts: Experiment01V23Artifact[]): boolean {
  const individual = artifacts.every((a, i) => notebookCarouselGatePasses(a, i + 1));
  const variety = evaluateNDXPageVariety(artifacts).passes;
  return individual && variety;
}
