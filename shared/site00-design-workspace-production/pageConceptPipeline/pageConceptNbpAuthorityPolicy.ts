/**
 * NBP dispatch policy — approval lineage, QA single job, current-screenshot omission.
 */

import type { PageConceptRenditionSlotId } from './types.js';

export const PAGE_NBP_PROMPT_VERSION = 'page-concept-nbp-v2-authority-first';

export function pageConceptNbpOmitCurrentScreenshot(): boolean {
  const explicit = process.env.SITE00_PAGE_CONCEPT_NBP_OMIT_CURRENT_SCREENSHOT?.trim().toLowerCase();
  if (explicit === 'false') return false;
  if (explicit === 'true') return true;
  return true;
}

export function pageConceptNbpQaSingleJobOnly(): boolean {
  return process.env.SITE00_PAGE_CONCEPT_NBP_QA_SINGLE?.trim().toLowerCase() === 'true';
}

export function pageConceptNbpRequiresAuthorityApprovalId(): boolean {
  const explicit = process.env.SITE00_PAGE_CONCEPT_NBP_REQUIRE_AUTHORITY_APPROVAL?.trim().toLowerCase();
  if (explicit === 'false') return false;
  return true;
}

export function createPageConceptAuthorityApprovalId(runId: string): string {
  return `pnaa-${runId}-${Date.now()}`;
}

export function pageConceptNbpJobAllowedInQaMode(
  slot: PageConceptRenditionSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): boolean {
  if (!pageConceptNbpQaSingleJobOnly()) return true;
  return slot === 'RENDITION_A' && viewport === 'MOBILE';
}

export function pageConceptNbpSixWayDispatchPreserved(): boolean {
  return !pageConceptNbpQaSingleJobOnly();
}
