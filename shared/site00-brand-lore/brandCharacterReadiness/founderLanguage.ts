/**
 * Founder language evidence — preserve raw wording as high-authority character signal.
 */

import { randomUUID } from 'node:crypto';
import type { FounderLanguageEvidence, CharacterReadinessDomain, CharacterEvidenceConfidence } from './types.js';

export function captureFounderLanguageEvidence(params: {
  rawAnswer: string;
  domain: CharacterReadinessDomain;
  sourceQuestionId: string;
  confidence?: CharacterEvidenceConfidence;
}): FounderLanguageEvidence {
  const raw = params.rawAnswer.trim();
  return {
    id: `fle-${randomUUID().slice(0, 8)}`,
    rawAnswer: raw,
    normalizedMeaning: raw.length > 120 ? `${raw.slice(0, 117)}…` : raw,
    domain: params.domain,
    confidence: params.confidence ?? 'DIRECT_FOUNDER_EVIDENCE',
    sourceQuestionId: params.sourceQuestionId,
    capturedAt: new Date().toISOString(),
    provenance: 'BRAND_CHARACTER_DEEPENING',
  };
}

export function rawFounderLanguagePreserved(evidence: FounderLanguageEvidence): boolean {
  return evidence.rawAnswer.length > 0 && evidence.normalizedMeaning.length > 0;
}

export function normalizedDoesNotEraseRaw(evidence: FounderLanguageEvidence): boolean {
  return evidence.rawAnswer.includes(evidence.normalizedMeaning.replace('…', '').slice(0, 20).trim()) ||
    evidence.normalizedMeaning.startsWith(evidence.rawAnswer.slice(0, 20));
}
