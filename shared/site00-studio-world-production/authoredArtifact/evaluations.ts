/**
 * P0.5C.6A — Authored artifact evaluations (generation gates).
 */

import type {
  ArtifactGrammarDiversityEvaluation,
  AuthoredArtifactAdapterOutput,
  AuthoredInterventionEvaluation,
  OverResolvedArtifactEvaluation,
  TemplateFrameDetectionEvaluation,
} from './types.js';
import type { AuthoredArtifactFailureState } from './types.js';

export function evaluateTemplateFrameDetection(params: {
  artifactId: string;
  artisticPremiseRequiresFrame: boolean;
  informationInsideArtifactWorld: boolean;
}): TemplateFrameDetectionEvaluation {
  const requiresFrame = params.artisticPremiseRequiresFrame;
  const insideWorld = params.informationInsideArtifactWorld;

  const topHeadlinePanelRisk = !requiresFrame;
  const bottomEvidencePanelRisk = !requiresFrame;
  const headerBodyFooterRisk = !requiresFrame;
  const infographicShellRisk = !requiresFrame;
  const symmetricalZonesRisk = !requiresFrame;
  const presentationBoardRisk = !requiresFrame;
  const posterTemplateRisk = !requiresFrame;
  const contentContainerRisk = !requiresFrame;

  /** Compile-time passes when contract configures information inside artifact world and no frame required. */
  const passes = insideWorld && !requiresFrame;

  const failureStates: TemplateFrameDetectionEvaluation['failureStates'] = [];
  if (!passes) {
    if (topHeadlinePanelRisk) failureStates.push('FAIL_TOP_HEADLINE_PANEL');
    if (bottomEvidencePanelRisk) failureStates.push('FAIL_BOTTOM_EVIDENCE_PANEL');
    if (headerBodyFooterRisk) failureStates.push('FAIL_HEADER_BODY_FOOTER_TEMPLATE');
    if (infographicShellRisk) failureStates.push('FAIL_INFOGRAPHIC_SHELL');
    if (symmetricalZonesRisk) failureStates.push('FAIL_SYMMETRICAL_INFORMATION_ZONES');
    if (presentationBoardRisk) failureStates.push('FAIL_PRESENTATION_BOARD_COMPOSITION');
    if (posterTemplateRisk) failureStates.push('FAIL_POSTER_TEMPLATE_FRAMING');
    if (contentContainerRisk) failureStates.push('FAIL_CONTENT_CONTAINER_AROUND_ARTWORK');
  }

  return {
    evaluationId: `tfd-${params.artifactId}`,
    artifactId: params.artifactId,
    topHeadlinePanelRisk,
    bottomEvidencePanelRisk,
    headerBodyFooterRisk,
    infographicShellRisk,
    symmetricalZonesRisk,
    presentationBoardRisk,
    posterTemplateRisk,
    contentContainerRisk,
    artisticPremiseRequiresFrame: requiresFrame,
    passes,
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateOverResolvedArtifact(params: {
  artifactId: string;
  templateFramePasses: boolean;
  interventionRevealsThinking: boolean;
}): OverResolvedArtifactEvaluation {
  const tooFinalized = !params.interventionRevealsThinking;
  const tooPackaged = !params.templateFramePasses;
  const passes = params.templateFramePasses && params.interventionRevealsThinking;

  return {
    evaluationId: `ora-${params.artifactId}`,
    artifactId: params.artifactId,
    tooFinalized,
    tooPackaged,
    tooPresentationReady: tooPackaged,
    tooEvenlyDistributed: tooPackaged,
    tooCleanlyModular: tooPackaged,
    tooPerfectlyAligned: tooPackaged,
    tooComprehensivelyExplained: tooPackaged,
    passes,
    failureState: passes ? null : 'FAIL_OVER_RESOLVED_GENERATED_GRAPHIC',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateAuthoredIntervention(params: {
  artifactId: string;
  adapter: AuthoredArtifactAdapterOutput;
}): AuthoredInterventionEvaluation {
  const failures: AuthoredArtifactFailureState[] = [];

  if (!params.adapter.intervention.originalIdentifiableWithoutMarks) {
    failures.push('FAIL_NO_AUTHORED_ARTIFACT_HISTORY');
  }
  if (!params.adapter.intervention.interventionsRevealThinking) {
    failures.push('FAIL_NO_AUTHORED_ARTIFACT_HISTORY');
  }
  if (!params.adapter.informationInhabitation.informationInsideArtifactWorld) {
    failures.push('FAIL_INFORMATION_OUTSIDE_ARTIFACT_WORLD');
  }

  const decorativeMarksDetected = params.adapter.intervention.interventionCausality.includes('DECORATIVE');
  const randomAnalogTextureDetected = params.adapter.intervention.interventionCausality.includes('RANDOM_TEXTURE');
  if (decorativeMarksDetected) failures.push('FAIL_DECORATIVE_HUMAN_MARKS');
  if (randomAnalogTextureDetected) failures.push('FAIL_RANDOM_ANALOG_TEXTURE');

  const uniqueFailures = [...new Set(failures)];

  return {
    evaluationId: `aie-${params.artifactId}`,
    artifactId: params.artifactId,
    originalVisualIdentifiable: params.adapter.intervention.originalIdentifiableWithoutMarks,
    authorActionsIdentifiable: Boolean(params.adapter.intervention.authorIntervention),
    interventionsRevealThinking: params.adapter.intervention.interventionsRevealThinking,
    decorativeMarksDetected,
    randomAnalogTextureDetected,
    passes: uniqueFailures.length === 0,
    failureStates: uniqueFailures,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateArtifactGrammarDiversity(params: {
  boardId: string;
  headlinePositions: string[];
  evidencePositions: string[];
}): ArtifactGrammarDiversityEvaluation {
  const uniqueHeadlines = new Set(params.headlinePositions);
  const uniqueEvidence = new Set(params.evidencePositions);
  const templateConvergence =
    uniqueHeadlines.size <= 2 ||
    uniqueEvidence.size <= 2 ||
    (params.headlinePositions.filter((p) => p === 'TOP_PANEL').length >= 5 &&
      params.evidencePositions.filter((p) => p === 'BOTTOM_PANEL').length >= 5);

  return {
    evaluationId: `agd-${params.boardId}`,
    boardId: params.boardId,
    headlinePositions: params.headlinePositions,
    evidencePositions: params.evidencePositions,
    uniqueHeadlinePositionCount: uniqueHeadlines.size,
    uniqueEvidencePositionCount: uniqueEvidence.size,
    templateConvergenceDetected: templateConvergence,
    authorshipContinuityPresent: true,
    passes: !templateConvergence,
    failureState: templateConvergence ? 'FAIL_REPEATED_ARTIFACT_GRAMMAR' : null,
    evaluatedAt: new Date().toISOString(),
  };
}

export function authoredArtifactAuthorityChainCorrect(chain: readonly string[]): boolean {
  const thesis = chain.indexOf('CONTENT_THESIS');
  const raw = chain.indexOf('RAW_VISUAL_ARTIFACT');
  const intervention = chain.indexOf('AUTHOR_INTERVENTION');
  const history = chain.indexOf('HUMAN_HISTORY');
  const editorial = chain.indexOf('EDITORIAL_INFORMATION');
  return thesis < raw && raw < intervention && intervention < history && history < editorial;
}

export function topHeadlinePanelDefaultBlocked(eval_: TemplateFrameDetectionEvaluation): boolean {
  return eval_.passes || !eval_.topHeadlinePanelRisk;
}

export function bottomEvidencePanelDefaultBlocked(eval_: TemplateFrameDetectionEvaluation): boolean {
  return eval_.passes || !eval_.bottomEvidencePanelRisk;
}
