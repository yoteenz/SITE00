/**
 * NDX public copy translation — first-person character authorship.
 */

import { createHash } from 'node:crypto';
import type { ArtBoardRetainedFirstSlideContract } from '../artBoardMateriality/types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { FounderLanguageEvidence } from '../brandCharacterReadiness/types.js';
import { translateInternalToPublic, analyticalToPersonalReaction } from '../../site00-studio-world-production/publicAuthorship/publicCopyTranslation.js';
import { scanTextForQuarantinedLabels } from '../../site00-studio-world-production/publicAuthorship/internalLabelQuarantine.js';
import type { NdxPublicCopyLayer } from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

const INTERNAL_LABEL_TRANSLATIONS: Record<string, string> = {
  'WHAT NDX NOTICED': 'WAIT.',
  'CHARACTER BEAT': '',
  'PRIMARY EDITORIAL IDEA': '',
  'WHAT HAPPENED': '',
  'WHY NOW': '',
  'CONTROLLED MISBEHAVIOR': '',
  'ADDED': '',
};

export function translateNdxContractToPublicCopy(params: {
  artifact: BrandMarketingArtifact;
  contract: ArtBoardRetainedFirstSlideContract;
  founderLanguage?: FounderLanguageEvidence[];
}): NdxPublicCopyLayer {
  const cr = params.contract.characterRetention;
  const translations = [];

  const beatText = cr.primaryCharacterBeat.text ?? params.contract.primaryHook;
  translations.push(
    translateInternalToPublic({
      internalText: beatText,
      internalLabel: 'CHARACTER BEAT',
      voiceMode: 'CHARACTER_VOICE',
    }),
  );

  const noticed = params.artifact.supportingLanguage[0] ?? params.contract.primaryHook;
  const noticedPublic =
    scanTextForQuarantinedLabels(noticed).length > 0
      ? analyticalToPersonalReaction({ internalObservation: noticed })
      : translateInternalToPublic({
          internalText: noticed,
          internalLabel: 'WHAT NDX NOTICED',
          voiceMode: 'CHARACTER_VOICE',
        }).publicExpression;

  translations.push(
    translateInternalToPublic({
      internalText: noticed,
      internalLabel: 'WHAT NDX NOTICED',
      voiceMode: 'CHARACTER_VOICE',
    }),
  );

  const hookPublic = translateInternalToPublic({
    internalText: params.contract.primaryHook,
    internalLabel: 'PRIMARY EDITORIAL IDEA',
    voiceMode: 'CHARACTER_VOICE',
  });

  const visiblePublicCopy = [
    hookPublic.publicExpression,
    translations[0]!.publicExpression !== hookPublic.publicExpression ? translations[0]!.publicExpression : null,
    noticedPublic !== hookPublic.publicExpression ? noticedPublic : null,
  ].filter(Boolean) as string[];

  const deduped = [...new Set(visiblePublicCopy.map((s) => s.trim()).filter(Boolean))];

  const layer: NdxPublicCopyLayer = {
    layerId: `ndxpcl-${params.artifact.id}`,
    artifactId: params.artifact.id,
    publicAuthorshipMode: 'FIRST_PERSON_CHARACTER_AUTHORSHIP',
    translations,
    visiblePublicCopy: deduped,
    sourceVoiceSegments: params.contract.primaryEvidence.filter((e) => !deduped.includes(e.toUpperCase())),
    ndxVoiceSegments: deduped,
    uppercaseGoverned: true,
    exportEvaluationId: null,
    fingerprint: '',
  };
  layer.fingerprint = fp(layer);
  return layer;
}

export function stripInternalLabelsFromPublicText(text: string): string {
  let result = text;
  for (const [label, replacement] of Object.entries(INTERNAL_LABEL_TRANSLATIONS)) {
    const pattern = new RegExp(`${label}\\s*:?\\s*`, 'gi');
    result = result.replace(pattern, replacement ? `${replacement} ` : '');
  }
  return result
    .replace(/\(SELF_AWARE_COMMENT\)/gi, '')
    .replace(/\(ANNOTATION\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function ndxPublicCopyUsesUppercase(text: string): boolean {
  return text === text.toUpperCase();
}

export function founderLanguageInformsCaption(params: {
  founderLanguage: FounderLanguageEvidence[];
  thesisSummary: string;
}): string {
  if (!params.founderLanguage.length) return params.thesisSummary.slice(0, 120).toUpperCase();
  const phrase = params.founderLanguage[0]?.normalizedMeaning ?? params.thesisSummary;
  return phrase.slice(0, 160).toUpperCase();
}
