/**
 * Generic public copy translation — internal meaning → public expression.
 */

import { createHash } from 'node:crypto';
import type { PublicAuthorshipMode, PublicCopyTranslation } from './types.js';
import { evaluateThirdPersonSelfReference, evaluatePersonalAuthorship } from './evaluations.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function translateInternalToPublic(params: {
  internalText: string;
  internalLabel?: string | null;
  voiceMode: PublicAuthorshipMode;
  platform?: string;
  preserveSourceText?: string[];
}): PublicCopyTranslation {
  let publicExpression = params.internalText.trim();

  if (params.internalLabel) {
    const labelUpper = params.internalLabel.toUpperCase().replace(/:$/, '').trim();
    const textUpper = publicExpression.toUpperCase();
    if (textUpper.startsWith(labelUpper)) {
      publicExpression = publicExpression.slice(params.internalLabel.length).replace(/^:\s*/, '').trim();
    }
    publicExpression = publicExpression.replace(new RegExp(`^${labelUpper}\\s*:?\\s*`, 'i'), '').trim();
  }

  publicExpression = publicExpression
    .replace(/\(SELF_AWARE_COMMENT\)/gi, '')
    .replace(/\(ANNOTATION\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  const personEval = evaluateThirdPersonSelfReference(publicExpression);
  const authorshipEval = evaluatePersonalAuthorship(publicExpression);

  return {
    translationId: `pct-${fp({ internal: params.internalText, label: params.internalLabel })}`,
    internalMeaning: params.internalText,
    publicExpression,
    voiceMode: params.voiceMode,
    characterFaculty: null,
    emotionalTemperature: null,
    humorMechanism: null,
    personReference: personEval.state,
    informationPreserved: [params.internalText],
    informationDeferred: [],
    sourceTextPreserved: params.preserveSourceText ?? [],
    translationEvaluation: authorshipEval.classification,
    fingerprint: '',
  };
}

export function analyticalToPersonalReaction(params: {
  internalObservation: string;
  reactions?: string[];
}): string {
  const options = params.reactions ?? [
    'WAIT.',
    'I KEEP SEEING THE SAME THING.',
    'OKAY, THIS IS A PATTERN NOW.',
  ];
  const obs = params.internalObservation.toLowerCase();
  if (obs.includes('pattern') || obs.includes('same')) return options[2] ?? 'OKAY, THIS IS A PATTERN NOW.';
  if (obs.includes('contradiction') || obs.includes('wrong')) return 'I WAS WRONG.';
  return options[0] ?? 'WAIT.';
}

export function translationPreservesMeaning(internal: string, translated: string): boolean {
  if (!translated.trim()) return false;
  if (internal.trim().toUpperCase() === translated.trim().toUpperCase()) return true;
  const internalWords = internal.toUpperCase().split(/\W+/).filter((w) => w.length > 3);
  const translatedWords = new Set(translated.toUpperCase().split(/\W+/));
  const overlap = internalWords.filter((w) => translatedWords.has(w)).length;
  return overlap >= 1 || translated.length >= 3;
}

export function sourceVoiceDistinctFromNdxVoice(sourceText: string, ndxText: string): boolean {
  return sourceText.trim().toUpperCase() !== ndxText.trim().toUpperCase();
}
