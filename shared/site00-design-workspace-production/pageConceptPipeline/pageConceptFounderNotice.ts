/**
 * P0.VR.PAGE-CONCEPT-IMPOSSIBLE-BLOCKER-ERADICATION1 — final render-boundary notice guard.
 */

import { isPageConceptSourceCaptureRelatedNotice } from './pageConceptGenerationBlockingState.js';
import type { PageConceptGenerationEligibility } from './pageConceptGenerationEligibility.js';

export const PAGE_CONCEPT_GENERIC_NOT_READY_HEADLINE = 'BLOCKED · GENERATION REQUIREMENTS NOT READY';

/** Drop any capture-related founder notice when canonical validation says both captures are ready. */
export function sanitizePageConceptFounderNotice(input: {
  notice: string | null | undefined;
  sourceCapturesReady: boolean;
  generationEligibility?: PageConceptGenerationEligibility | null;
}): string | null {
  const trimmed = input.notice?.trim() ?? '';
  if (!trimmed) return null;

  const capturesReady =
    input.sourceCapturesReady ||
    input.generationEligibility?.sourceCaptureValidation.allRequiredReady === true;

  if (capturesReady && isPageConceptSourceCaptureRelatedNotice(trimmed)) {
    if (import.meta.env?.DEV) {
      console.warn('STALE_CONFIRM_NOTICE_CLEARED', trimmed);
    }
    return null;
  }

  if (
    capturesReady &&
    (/source capture required/i.test(trimmed) ||
      /capture the current mobile \+ desktop/i.test(trimmed))
  ) {
    if (import.meta.env?.DEV) {
      console.warn('PAGE_CONCEPT_IMPOSSIBLE_SOURCE_BLOCKER', trimmed);
    }
    return null;
  }

  return trimmed;
}

export function pageConceptDomContradictionProbe(input: {
  sourceCaptureLines: readonly { state: string; label: string; viewport?: string }[];
  renderedText: string;
}): string | null {
  const mobileReady = input.sourceCaptureLines.some(
    (l) => (l.viewport === 'MOBILE' || /MOBILE CAPTURE/i.test(l.label)) && l.state === 'READY',
  );
  const desktopReady = input.sourceCaptureLines.some(
    (l) => (l.viewport === 'DESKTOP' || /DESKTOP CAPTURE/i.test(l.label)) && l.state === 'READY',
  );
  if (!mobileReady || !desktopReady) return null;
  const forbidden = [
    'SOURCE CAPTURE REQUIRED',
    'MOBILE CAPTURE REQUIRED',
    'DESKTOP CAPTURE REQUIRED',
    'CAPTURE THE CURRENT MOBILE',
    'BLOCKED_NO_SOURCE_CAPTURE',
  ];
  for (const needle of forbidden) {
    if (input.renderedText.includes(needle)) {
      return needle;
    }
  }
  return null;
}
