/**
 * P0.5C.4B+ — Founder revision notes → contract update → FAL micro-revision prompt.
 */

import { randomUUID } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type {
  ArtBoardRetainedFirstSlideContract,
  Experiment01V23Artifact,
  V23FounderJudgment,
  V23FounderRevisionRecord,
} from './types.js';
import { compileArtBoardMaterialityFalPrompt } from './falPromptCompilerV23.js';
import { NDX_SIGNATURE_LIME } from './signatureLime.js';
import { applyV23SignatureLimeRevision } from './signatureLime.js';

export { V23_APPROVAL_JUDGMENTS, isV23ApprovalJudgment, judgmentRequiresRevisionNote, revisionNotePlaceholder } from './v23FounderRevisionLabels.js';

export const V23_FOUNDER_REVISION_PIPELINE_IMPLEMENTED = true as const;

type V23FounderJudgmentValue = NonNullable<V23FounderJudgment>;

export function buildFounderRevisionDirective(params: {
  judgment: V23FounderJudgmentValue;
  founderNote: string;
  primaryHook: string;
}): string {
  const preserve = [
    'overall composition',
    'portrait / archival subject if present',
    'headline hierarchy and position',
    'art-board materiality and surface',
    'character beat',
    'monochrome / restrained atmosphere unless note says otherwise',
  ];
  const micro = params.judgment === 'MICRO_REVISION_ONLY' || params.judgment === 'KEEP_EVERYTHING_ELSE';
  return [
    `FOUNDER REVISION JUDGMENT: ${params.judgment.replace(/_/g, ' ')}`,
    `FOUNDER REVISION NOTE: ${params.founderNote.trim()}`,
    `PRIMARY HOOK CONTEXT: ${params.primaryHook}`,
    micro
      ? 'REVISION MODE: MICRO — preserve parent artifact fingerprint. Change ONLY what the founder note specifies.'
      : 'REVISION MODE: TARGETED — preserve successful materiality; apply founder correction.',
    `PRESERVE: ${preserve.join('; ')}`,
    `SIGNATURE LIME TOKEN: ${NDX_SIGNATURE_LIME} for all NDX-authored interventions.`,
    'Do not redesign the artifact. Do not add clutter. Do not convert source-authentic colors without justification.',
  ].join('\n');
}

function extractWordTarget(note: string, hook: string): string | null {
  const trimmed = note.trim();
  if (!trimmed) return null;
  const quoted = trimmed.match(/["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1].toUpperCase();
  const upperWords = trimmed.toUpperCase().split(/\s+/).filter((w) => w.length > 2);
  for (const w of upperWords) {
    if (hook.toUpperCase().includes(w)) return w;
  }
  return upperWords[0] ?? trimmed.split(/\s+/)[0]?.toUpperCase() ?? null;
}

export function applyFounderJudgmentToContract(params: {
  contract: ArtBoardRetainedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
  judgment: V23FounderJudgmentValue;
  founderNote: string;
}): ArtBoardRetainedFirstSlideContract {
  let contract = { ...params.contract };

  const limeJudgments = new Set([
    'NEEDS_LIME',
    'MORE_LIME',
    'WRONG_THING_IS_LIME',
    'MAKE_THIS_WORD_LIME',
    'MAKE_THIS_MARK_LIME',
    'MAKE_PUNCTUATION_LIME',
    'LIME_FEELS_DECORATIVE',
  ]);

  if (limeJudgments.has(params.judgment)) {
    const word = extractWordTarget(params.founderNote, contract.primaryHook);
    const refreshed = applyV23SignatureLimeRevision({
      contract,
      artifact: params.artifact,
      topicIndex: params.topicIndex,
    });
    if (refreshed.signatureLimeEvaluation && word) {
      refreshed.signatureLimeEvaluation = {
        ...refreshed.signatureLimeEvaluation,
        accentSelection: {
          ...refreshed.signatureLimeEvaluation.accentSelection,
          targetText: word,
          reason: `Founder revision (${params.judgment}): ${params.founderNote.trim()}`,
          wordLevelAccent:
            params.judgment === 'MAKE_THIS_WORD_LIME' || params.judgment === 'NEEDS_LIME'
              ? {
                  word,
                  role: 'PUNCHLINE',
                  colorToken: NDX_SIGNATURE_LIME,
                  inHeadline: contract.primaryHook.toUpperCase().includes(word),
                }
              : refreshed.signatureLimeEvaluation.accentSelection.wordLevelAccent,
          punctuationAccent:
            params.judgment === 'MAKE_PUNCTUATION_LIME'
              ? params.founderNote.trim().slice(-1)
              : refreshed.signatureLimeEvaluation.accentSelection.punctuationAccent,
          secondaryAccent:
            params.judgment === 'MAKE_THIS_MARK_LIME'
              ? {
                  targetType: 'NDX_MARK',
                  targetText: params.founderNote.trim() || 'NDX circle / maker mark',
                  reason: 'Founder-directed maker mark in signature lime',
                  colorToken: NDX_SIGNATURE_LIME,
                  wordLevelAccent: null,
                  punctuationAccent: null,
                  secondaryAccent: null,
                }
              : refreshed.signatureLimeEvaluation.accentSelection.secondaryAccent,
        },
      };
    }
    contract = refreshed;
  }

  return contract;
}

export function buildV23RevisionFalContract(params: {
  artifact: BrandMarketingArtifact;
  contract: ArtBoardRetainedFirstSlideContract;
  judgment: V23FounderJudgmentValue;
  founderNote: string;
}) {
  const directive = buildFounderRevisionDirective({
    judgment: params.judgment,
    founderNote: params.founderNote,
    primaryHook: params.contract.primaryHook,
  });
  const base = compileArtBoardMaterialityFalPrompt({
    artifact: params.artifact,
    contract: params.contract,
    founderRevisionDirective: directive,
  });
  return base;
}

export function applyFounderRevisionToV23Artifact(params: {
  artifact: Experiment01V23Artifact;
  v1Artifact: BrandMarketingArtifact;
  judgment: V23FounderJudgmentValue;
  founderNote: string;
}): Experiment01V23Artifact {
  const topicIndex = parseInt(params.artifact.id.replace('bma-exp01-v23-', ''), 10);
  const parentAssetUrl = params.artifact.generatedAssetUrl;
  const updatedContract = applyFounderJudgmentToContract({
    contract: params.artifact.contract,
    artifact: params.v1Artifact,
    topicIndex,
    judgment: params.judgment,
    founderNote: params.founderNote,
  });
  const generationContract = buildV23RevisionFalContract({
    artifact: params.v1Artifact,
    contract: updatedContract,
    judgment: params.judgment,
    founderNote: params.founderNote,
  });

  const revisionRecord: V23FounderRevisionRecord = {
    revisionId: `v23fr-${randomUUID().slice(0, 8)}`,
    judgment: params.judgment,
    founderNote: params.founderNote.trim(),
    appliedAt: new Date().toISOString(),
    parentAssetUrl,
    previousFingerprint: params.artifact.fingerprint,
    revisionDirective: buildFounderRevisionDirective({
      judgment: params.judgment,
      founderNote: params.founderNote,
      primaryHook: params.artifact.contract.primaryHook,
    }),
    falPromptHash: generationContract.promptHash,
    generatedAssetUrl: null,
    status: 'GENERATING',
  };

  return {
    ...params.artifact,
    contract: updatedContract,
    generationContract,
    founderJudgment: params.judgment,
    founderJudgmentNote: params.founderNote.trim(),
    revisionHistory: [...(params.artifact.revisionHistory ?? []), revisionRecord],
    parentGeneratedAssetUrl: parentAssetUrl,
    generationStatus: 'GENERATING',
    updatedAt: new Date().toISOString(),
  };
}

export function founderRevisionUsesParentReference(parentAssetUrl: string | null): boolean {
  return Boolean(parentAssetUrl);
}
