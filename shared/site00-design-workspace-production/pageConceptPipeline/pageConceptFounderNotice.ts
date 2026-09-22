/**
 * P0.VR.PAGE-CONCEPT-IMPOSSIBLE-BLOCKER-ERADICATION1 +
 * P0.VR.PAGE-CONCEPT-PANEL-WIDTH-AND-ERROR-RECOVERY1 — founder notice model + narrow stale guard.
 */

import type { PageConceptGenerationEligibility } from './pageConceptGenerationEligibility.js';
import { buildFounderErrorPresentation } from './pageConceptFounderReviewPresentation.js';

export const PAGE_CONCEPT_GENERIC_NOT_READY_HEADLINE = 'BLOCKED · GENERATION REQUIREMENTS NOT READY';

export type PageConceptFounderNoticeKind =
  | 'ELIGIBILITY'
  | 'EXECUTION'
  | 'PREFLIGHT'
  | 'PROVIDER'
  | 'SYSTEM';

export type PageConceptFounderNotice = {
  kind: PageConceptFounderNoticeKind;
  code: string | null;
  title: string;
  message: string;
  resolution?: string | null;
  retryable: boolean;
  timestamp?: string | null;
};

/** Pre-generation capture gate copy only — not runtime/payload errors that mention captures. */
export function isPageConceptStaleCaptureEligibilityNotice(notice: string | null | undefined): boolean {
  if (!notice?.trim()) return false;
  const raw = notice.trim();
  if (
    raw === 'BLOCKED_NO_SOURCE_CAPTURE' ||
    raw === 'BLOCKED_NO_MOBILE_CAPTURE' ||
    raw === 'BLOCKED_NO_DESKTOP_CAPTURE'
  ) {
    return true;
  }
  if (/^blocked · source capture required$/i.test(raw)) return true;
  if (/capture the current mobile \+ desktop page before generating concepts/i.test(raw)) return true;
  if (/capture the current mobile page before generating concepts/i.test(raw)) return true;
  if (/capture the current desktop page before generating concepts/i.test(raw)) return true;
  if (/capture the current mobile and desktop page before generating concepts/i.test(raw)) return true;
  if (/BLOCKED_MOBILE_SNAPSHOT/i.test(raw)) return true;
  if (/BLOCKED_DESKTOP_SNAPSHOT/i.test(raw)) return true;
  if (/BLOCKED_.*SNAPSHOT/i.test(raw)) return true;
  return false;
}

export function classifyPageConceptFounderNotice(notice: string): PageConceptFounderNoticeKind {
  const raw = notice.trim();
  if (!raw) return 'SYSTEM';
  if (isPageConceptStaleCaptureEligibilityNotice(raw)) return 'ELIGIBILITY';
  if (/^blocked_no_/i.test(raw) || /^blocked · /i.test(raw)) return 'ELIGIBILITY';
  if (/unauthorized|sign in required/i.test(raw)) return 'PREFLIGHT';
  if (/openai|anthropic|fal|provider|api key|configuration/i.test(raw)) return 'PROVIDER';
  if (/cgpt|gpt2|nbp|generation failed|plan_failed|retry_failed|timeout|500|502|503/i.test(raw)) {
    return 'EXECUTION';
  }
  return 'EXECUTION';
}

export function buildPageConceptFounderNotice(notice: string, timestamp?: string | null): PageConceptFounderNotice {
  const message = notice.trim();
  const kind = classifyPageConceptFounderNotice(message);
  const retryable = kind === 'EXECUTION' || kind === 'PROVIDER' || kind === 'PREFLIGHT';
  return {
    kind,
    code: message.length <= 64 ? message : null,
    title: message.split('. ')[0]?.toUpperCase() ?? message.toUpperCase(),
    message,
    retryable,
    timestamp: timestamp ?? null,
  };
}

export type PageConceptFounderNoticeDisplay = {
  headline: string;
  hint: string | null;
  technicalCode: string | null;
};

/** Founder-primary error copy; raw codes remain in technicalCode. */
export function pageConceptFounderNoticeDisplay(notice: string): PageConceptFounderNoticeDisplay {
  const p = buildFounderErrorPresentation(notice);
  return { headline: p.headline, hint: p.hint, technicalCode: p.technicalCode };
}

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

  if (capturesReady && isPageConceptStaleCaptureEligibilityNotice(trimmed)) {
    if (import.meta.env?.DEV) {
      console.warn('STALE_CAPTURE_ELIGIBILITY_NOTICE_CLEARED', trimmed);
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
