/**
 * P0.5C.6A — NDX adapter for AuthoredArtifactSystem.
 * Defines NDX authorship psychology — not hard-coded into generic infrastructure.
 */

import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { ArtBoardRetainedFirstSlideContract } from './types.js';
import type {
  AuthoredArtifactAdapterInput,
  AuthoredArtifactAdapterOutput,
  AuthoredArtifactEvaluationBundle,
} from '../../site00-studio-world-production/authoredArtifact/types.js';
import {
  evaluateAuthoredArtifactBundle,
  type AuthoredArtifactBrandAdapter,
} from '../../site00-studio-world-production/authoredArtifact/system.js';
import { evaluateArtifactGrammarDiversity } from '../../site00-studio-world-production/authoredArtifact/evaluations.js';
import type { ArtifactGrammarDiversityEvaluation } from '../../site00-studio-world-production/authoredArtifact/types.js';

export const NDX_AUTHORED_ARTIFACT_ADAPTER_ID = 'ndx-book-authored-artifact-v1' as const;

/** NDX-specific authority chain — extends generic with NDX intervention naming. */
export const NDX_AUTHORED_ARTIFACT_AUTHORITY_CHAIN = [
  'CONTENT_THESIS',
  'VISUAL_SUBJECT_ARTISTIC_PREMISE',
  'RAW_VISUAL_ARTIFACT',
  'BESPOKE_COMPOSITION',
  'NDX_INTERVENTION',
  'HUMAN_HISTORY',
  'EDITORIAL_INFORMATION',
  'CHARACTER_TRACE',
  'SIGNATURE_LIME',
  'FINAL_QA',
] as const;

const TOPIC_HEADLINE_PLACEMENTS: Record<number, string> = {
  1: 'HANDWRITTEN_ON_SHELF_EDGE',
  2: 'MARGIN_ELAPSED_TIME',
  3: 'CORRECTION_SLIP_OVERLAY',
  4: 'CROSSED_OUT_ON_TEAR',
  5: 'NOTEBOOK_MARGIN_JUDGMENT',
  6: 'RECEIPT_EDGE_ANNOTATION',
  7: 'INDEX_CARD_CORNER',
  8: 'SCREEN_CAPTURE_MARGIN',
  9: 'CONTACT_SHEET_MARK',
};

const TOPIC_EVIDENCE_PLACEMENTS: Record<number, string> = {
  1: 'TAPED_SOURCE_CLIPPING',
  2: 'TIMING_SCRAP_ATTACHED',
  3: 'ARCHIVAL_INSERT',
  4: 'MAGAZINE_SOURCE_EDGE',
  5: 'NOTEBOOK_PAGE_FOLD',
  6: 'THERMAL_RECEIPT_FRAGMENT',
  7: 'CLIPPED_MEMO',
  8: 'UI_SCREENSHOT_ANNOTATION',
  9: 'PHOTO_STRIP_LABEL',
};

function buildNdxAuthorshipPsychology(input: AuthoredArtifactAdapterInput): AuthoredArtifactAdapterOutput {
  const topicIndex = input.topicIndex;
  const isSubscription = topicIndex === 1;

  const rawVisualArtifact = isSubscription
    ? `Physical THEN/NOW shelf comparison — owned objects versus subscription-access objects — the shelf experiment IS the artifact, nearly full-frame, no infographic shell`
    : `${input.dominantVisualSubject} as the primary visual object — ${input.artisticPremise}`;

  const authorIntervention = isSubscription
    ? `NDX constructed the shelf comparison, circled the ownership contradiction, added THEN/NOW labels directly on shelf objects, taped a source clipping — NOT a designed headline panel`
    : `NDX handled ${input.dominantVisualSubject}, marked what she noticed, corrected her first read`;

  const interventionCausality = isSubscription
    ? `Circled because ownership-to-subscription shift IS the contradiction; THEN/NOW belongs on objects not masthead; source taped because she found updated evidence mid-thought`
    : `Marks reveal what NDX noticed, doubted, or corrected — each intervention answers WHY SHE DID THAT`;

  const humanHistory = isSubscription
    ? {
        whatExistedFirst: 'Empty retail shelf photographed or assembled for comparison experiment',
        whatAuthorDid: 'Arranged owned vs subscription objects, labeled columns on the shelf itself, circled pivot category',
        whatChangedAfterReview: 'Added handwritten thesis along shelf edge after noticing subscription creep pattern',
        survivingProcessTrace: 'Pen circle on pivot object + faint crossed-out earlier label + taped subscription receipt fragment',
        traceType: 'PEN_CIRCLE' as const,
        causalReason: 'She circled it because that is the contradiction between ownership and access',
      }
    : {
        whatExistedFirst: input.artifactForm,
        whatAuthorDid: `NDX interpreted ${input.dominantVisualSubject} and marked what mattered`,
        whatChangedAfterReview: 'Added correction or highlight after second look',
        survivingProcessTrace: 'Handwritten margin note or overwritten caption showing reconsideration',
        traceType: 'HANDWRITING' as const,
        causalReason: `She marked it because ${input.primaryHook}`,
      };

  const headlinePlacement = isSubscription
    ? 'Handwritten along shelf edge or squeezed beside circled object — NOT top headline panel'
    : TOPIC_HEADLINE_PLACEMENTS[topicIndex] ?? 'INTEGRATED_IN_ARTIFACT_WORLD';

  const evidencePlacement = isSubscription
    ? 'Tiny taped source clipping or margin calculation — NOT bottom evidence module'
    : TOPIC_EVIDENCE_PLACEMENTS[topicIndex] ?? 'ATTACHED_TO_EVIDENCE_OBJECT';

  return {
    humanHistory,
    intervention: {
      rawVisualArtifact,
      authorIntervention,
      interventionCausality,
      originalIdentifiableWithoutMarks: true,
      interventionsRevealThinking: true,
    },
    informationInhabitation: {
      headlinePlacement,
      evidencePlacement,
      inhabitationMode: isSubscription ? 'EVIDENCE_ATTACHMENT' : 'MARGIN_HANDWRITTEN',
      whyThisPlacement: isSubscription
        ? 'Thesis discovered THROUGH the shelf — headline is something NDX added after constructing the experiment'
        : `Text belongs where NDX would actually put this thought on ${input.artifactForm}`,
      informationInsideArtifactWorld: true,
    },
    templateFrameArtisticPremiseRequiresFrame: false,
  };
}

export const ndxAuthoredArtifactAdapter: AuthoredArtifactBrandAdapter = {
  brandId: NDX_AUTHORED_ARTIFACT_ADAPTER_ID,
  buildAuthorshipPsychology: buildNdxAuthorshipPsychology,
};

export function applyV23AuthoredArtifactRevision(params: {
  contract: ArtBoardRetainedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
}): ArtBoardRetainedFirstSlideContract {
  const va = params.contract.visualAuthorityEvaluation?.bespokeArtDirection;
  const ab = params.contract.artBoardDirection;

  const bundle = evaluateAuthoredArtifactBundle({
    input: {
      artifactId: params.artifact.id,
      topic: params.artifact.topic,
      subject: params.artifact.subject,
      primaryHook: params.contract.primaryHook,
      artisticPremise: va?.artisticPremise ?? params.contract.primaryHook,
      dominantVisualSubject: va?.dominantVisualSubject ?? params.artifact.subject,
      artifactForm: ab.artifactForm,
      topicIndex: params.topicIndex,
    },
    adapter: ndxAuthoredArtifactAdapter,
  });

  return {
    ...params.contract,
    authoredArtifactEvaluation: bundle,
  };
}

export function evaluateV23BoardArtifactGrammar(
  artifacts: Array<{ contract: ArtBoardRetainedFirstSlideContract }>,
): ArtifactGrammarDiversityEvaluation {
  const headlinePositions = artifacts.map(
    (a) => a.contract.authoredArtifactEvaluation?.informationInhabitation.headlinePlacement ?? 'UNKNOWN',
  );
  const evidencePositions = artifacts.map(
    (a) => a.contract.authoredArtifactEvaluation?.informationInhabitation.evidencePlacement ?? 'UNKNOWN',
  );
  return evaluateArtifactGrammarDiversity({
    boardId: 'exp01-v23',
    headlinePositions,
    evidencePositions,
  });
}

export function v23AuthoredArtifactGatePasses(artifact: { contract: ArtBoardRetainedFirstSlideContract }): boolean {
  const bundle = artifact.contract.authoredArtifactEvaluation;
  if (!bundle) return false;
  return bundle.authoredArtifactGatePasses;
}

export type { AuthoredArtifactEvaluationBundle };
