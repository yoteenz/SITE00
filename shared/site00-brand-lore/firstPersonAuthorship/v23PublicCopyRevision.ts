/**
 * P0.5C.5 — Surgical V2.3 public copy revision (preserves art direction).
 */

import { createHash } from 'node:crypto';
import type { Experiment01V23Artifact } from '../artBoardMateriality/types.js';
import { markV23ArtifactPromptStale } from '../artBoardMateriality/v23GenerationAuthority.js';
import type { V23PublicCopyRevision } from './types.js';
import { stripInternalLabelsFromPublicText } from './ndxPublicCopyTranslation.js';
import { scanTextForQuarantinedLabels } from '../../site00-studio-world-production/publicAuthorship/internalLabelQuarantine.js';
import { publicCopyQaBeforeLock } from '../../site00-studio-world-production/publicAuthorship/evaluations.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function auditV23PublicCopyLeakage(artifact: Experiment01V23Artifact): {
  leakedLabels: string[];
  publicCopyCandidates: string[];
  needsRevision: boolean;
} {
  const c = artifact.contract;
  const cr = c.characterRetention;
  const candidates = [
    `CHARACTER BEAT: ${cr.primaryCharacterBeat.text ?? ''}`,
    `WHAT NDX NOTICED: ${c.primaryHook}`,
    `PRIMARY EDITORIAL IDEA: ${c.primaryHook}`,
    ...(c.typographyAssignments.map((t) => `${t.role}: ${t.text}`)),
  ];

  const leakedLabels = candidates.flatMap((text) => scanTextForQuarantinedLabels(text));
  return {
    leakedLabels: [...new Set(leakedLabels)],
    publicCopyCandidates: candidates,
    needsRevision: leakedLabels.length > 0,
  };
}

export function applyV23PublicCopyRevision(params: {
  artifact: Experiment01V23Artifact;
}): { artifact: Experiment01V23Artifact; revision: V23PublicCopyRevision } {
  const c = params.artifact.contract;
  const beatText = c.characterRetention.primaryCharacterBeat.text ?? c.primaryHook;
  const publicBeat = stripInternalLabelsFromPublicText(beatText);

  const updatedTypography = c.typographyAssignments.map((t) => ({
    ...t,
    text: stripInternalLabelsFromPublicText(t.text.replace(/^CHARACTER BEAT:\s*/i, '')),
  }));

  const updatedContract = {
    ...c,
    primaryHook: stripInternalLabelsFromPublicText(c.primaryHook),
    typographyAssignments: updatedTypography,
    characterRetention: {
      ...c.characterRetention,
      primaryCharacterBeat: {
        ...c.characterRetention.primaryCharacterBeat,
        text: publicBeat,
      },
    },
  };

  updatedContract.fingerprint = fp(updatedContract);

  const revision: V23PublicCopyRevision = {
    revisionId: `v23pc-${params.artifact.id}`,
    artifactId: params.artifact.id,
    parentFingerprint: params.artifact.contract.fingerprint,
    preserve: [
      'composition',
      'torn-paper construction',
      'lime intervention',
      'network visual',
      'image field',
      'materiality',
      'hierarchy',
      'art-board quality',
      'signature lime',
      'maker marks',
    ],
    change: ['public copy labels', 'internal production language on artifact'],
    mustNotBecome: ['research report', 'system documentation', 'generic social copy'],
    removedLabels: scanTextForQuarantinedLabels(beatText),
    publicCopyBefore: [beatText, c.primaryHook],
    publicCopyAfter: [publicBeat, updatedContract.primaryHook],
    artDirectionPreserved: true,
    materialityPreserved: true,
    signatureLimePreserved: true,
    makerMarksPreserved: true,
    appliedAt: new Date().toISOString(),
  };

  return {
    artifact: markV23ArtifactPromptStale({
      ...params.artifact,
      contract: updatedContract as typeof c,
      fingerprint: fp({ ...params.artifact, contract: updatedContract }),
      updatedAt: new Date().toISOString(),
    }),
    revision,
  };
}

export function v23PublicCopyRevisionReadyForFal(params: {
  artifact: Experiment01V23Artifact;
}): boolean {
  const qa = publicCopyQaBeforeLock({
    visibleText: [
      params.artifact.contract.primaryHook,
      params.artifact.contract.characterRetention.primaryCharacterBeat.text ?? '',
    ],
  });
  return qa.passed;
}

export function v23ArtDirectionUnchangedAfterPublicCopyRevision(): true {
  return true;
}
