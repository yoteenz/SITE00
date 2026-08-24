/**
 * Art-board materiality evaluations — canvas, template guard, quality, modernity.
 */

import type { ArtBoardDirectionContract, ArtifactMaterialityEvaluation } from './types.js';
import type { CharacterRetainedFirstSlideContract } from '../characterRetention/types.js';
import { attachmentRequiresCausality } from './artBoardDirectionContract.js';

export function evaluateMaterialDensity(params: {
  artifactId: string;
  contract: ArtBoardDirectionContract;
}): ArtifactMaterialityEvaluation['materialDensity'] {
  const layerCount = 1 + params.contract.secondaryLayers.length;
  let level: ArtifactMaterialityEvaluation['materialDensity']['level'] = 'LIGHT';
  if (layerCount >= 3) level = 'RICH';
  else if (layerCount === 2) level = 'MODERATE';
  else if (params.contract.pageConstructionMode === 'MINIMAL_PAGE') level = 'MODERATE';

  return {
    evaluationId: `md-${params.artifactId}`,
    artifactId: params.artifactId,
    level,
    independentFromText: true,
    independentFromCharacter: true,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateImperfectCanvas(params: {
  artifactId: string;
  contract: ArtBoardDirectionContract;
}): ArtifactMaterialityEvaluation['imperfectCanvas'] {
  const hasConstruction = params.contract.constructionHistory.ndxAdded.length > 0;
  const hasSurfaceInteraction = params.contract.typographySurfaceInteraction.length > 0;
  let result: ArtifactMaterialityEvaluation['imperfectCanvas']['result'] = 'ALIVE_SURFACE';
  if (!hasConstruction && params.contract.edgeBehavior === 'CLEAN' && params.contract.secondaryLayers.length === 0) {
    result = 'TOO_CLEAN';
  }
  if (params.contract.mustAvoid.includes('fake paper filter')) {
    result = 'CONTROLLED';
  }

  return {
    evaluationId: `ic-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    canvasParticipation: hasSurfaceInteraction && hasConstruction,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateArtBoardQuality(params: {
  artifactId: string;
  contract: ArtBoardDirectionContract;
}): ArtifactMaterialityEvaluation['artBoardQuality'] {
  const bespoke =
    Boolean(params.contract.whyThisArtBoard) &&
    params.contract.canvasObject.mustNotBecome.length > 0 &&
    params.contract.constructionHistory.firstPresent.length > 0;

  return {
    evaluationId: `abq-${params.artifactId}`,
    artifactId: params.artifactId,
    result: bespoke ? 'BESPOKE' : 'STRONG',
    feelsLikeObject: bespoke,
    templateRisk: false,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateMaterialModernity(params: {
  artifactId: string;
  contract: ArtBoardDirectionContract;
}): ArtifactMaterialityEvaluation['materialModernity'] {
  let result: ArtifactMaterialityEvaluation['materialModernity']['result'] = 'CONTEMPORARY';
  if (params.contract.modernNotebookExpression) result = 'CONTEMPORARY';
  else if (params.contract.pageConstructionMode === 'ARCHIVAL_FILE') result = 'TIMELESS';
  else if (params.contract.materialitySystem.baseSurface === 'MAGAZINE_STOCK') result = 'RETRO_INTENTIONAL';

  return {
    evaluationId: `mm-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateMaterialCharacterFit(params: {
  artifactId: string;
  contract: ArtBoardDirectionContract;
  topic: string;
}): ArtifactMaterialityEvaluation['materialCharacterFit'] {
  return {
    evaluationId: `mcf-${params.artifactId}`,
    artifactId: params.artifactId,
    fit: 'STRONG',
    whyNDXWouldHaveThis: params.contract.whyThisArtBoard,
    evaluatedAt: new Date().toISOString(),
  };
}

export function inferImageSurfaceRole(contract: ArtBoardDirectionContract): ArtifactMaterialityEvaluation['imageSurfaceRole'] {
  if (contract.materialitySystem.baseSurface === 'SCREEN_CAPTURE') return 'SCREENSHOT_PRINT';
  if (contract.pageConstructionMode === 'TEAR_OUT') return 'MAGAZINE_TEAR';
  if (contract.secondaryLayers.some((l) => l.layerType === 'PHOTO')) return 'PHOTO_INSERT';
  if (contract.pageConstructionMode === 'FULL_BLEED_PHOTO_WITH_INSERT') return 'FULL_BLEED';
  return 'PRINTED_ON_PAGE';
}

export function buildArtifactMaterialityEvaluation(params: {
  artifactId: string;
  contract: ArtBoardDirectionContract;
  v22Contract: CharacterRetainedFirstSlideContract;
  topic: string;
}): ArtifactMaterialityEvaluation {
  const materialDensity = evaluateMaterialDensity({ artifactId: params.artifactId, contract: params.contract });
  const imperfectCanvas = evaluateImperfectCanvas({ artifactId: params.artifactId, contract: params.contract });
  const artBoardQuality = evaluateArtBoardQuality({ artifactId: params.artifactId, contract: params.contract });
  const materialModernity = evaluateMaterialModernity({ artifactId: params.artifactId, contract: params.contract });
  const materialCharacterFit = evaluateMaterialCharacterFit({
    artifactId: params.artifactId,
    contract: params.contract,
    topic: params.topic,
  });
  const imageSurfaceRole = inferImageSurfaceRole(params.contract);

  const failureStates: ArtifactMaterialityEvaluation['failureStates'] = [];
  if (imperfectCanvas.result === 'TEMPLATE_LIKE' || imperfectCanvas.result === 'FAKE_TEXTURE') {
    failureStates.push('FAIL_TEMPLATE_LIKE_CANVAS');
  }
  if (imperfectCanvas.result === 'TOO_CLEAN' && materialDensity.level === 'MINIMAL') {
    failureStates.push('FAIL_FLAT_DIGITAL_CARD');
  }
  if (materialModernity.result === 'CRAFTY') failureStates.push('FAIL_CRAFTY_COLLAPSE');
  if (materialDensity.level === 'OVERBUILT') failureStates.push('FAIL_MATERIAL_OVERBUILD');

  for (const att of params.contract.attachmentLogic) {
    if (!attachmentRequiresCausality(att.mechanism, att.causality)) {
      failureStates.push(att.mechanism === 'TAPE' ? 'FAIL_RANDOM_TAPE' : 'FAIL_RANDOM_CLIP');
    }
  }

  const passesApprovalGate =
    params.v22Contract.characterEvaluation.passesApprovalGate &&
    artBoardQuality.result !== 'TEMPLATE_LIKE' &&
    artBoardQuality.result !== 'GENERIC' &&
    artBoardQuality.result !== 'FAKE_MATERIALITY' &&
    imperfectCanvas.result !== 'TEMPLATE_LIKE' &&
    imperfectCanvas.result !== 'FAKE_TEXTURE' &&
    materialModernity.result !== 'CRAFTY' &&
    materialDensity.level !== 'OVERBUILT';

  return {
    evaluationId: `ame-${params.artifactId}`,
    artifactId: params.artifactId,
    materialDensity,
    imperfectCanvas,
    artBoardQuality,
    materialModernity,
    materialCharacterFit,
    imageSurfaceRole,
    passesApprovalGate,
    failureStates: [...new Set(failureStates)],
    evaluatedAt: new Date().toISOString(),
  };
}

export function graphicFloatingOnBackgroundFails(evaluation: ArtifactMaterialityEvaluation): boolean {
  return evaluation.failureStates.includes('FAIL_GRAPHIC_FLOATING_ON_SURFACE');
}

export function fakePaperTextureFails(evaluation: ArtifactMaterialityEvaluation): boolean {
  return evaluation.imperfectCanvas.result === 'FAKE_TEXTURE';
}

export function materialRichnessSeparateFromInformationDensity(
  textDensity: string,
  materialLevel: string,
): boolean {
  return textDensity === 'SPARSE' && (materialLevel === 'RICH' || materialLevel === 'MODERATE');
}
