/**
 * C1.2 — Entry 003 evidence research plan (no fabricated receipts).
 */

import type {
  Entry003EvidenceResearchPlan,
  Entry003SubjectSelection,
} from '../../../../shared/site00-expression-engine/entry-003/types.js';
import { ENTRY_003_ID } from '../../../../shared/site00-expression-engine/entry-003/types.js';

export function buildEntry003EvidenceResearchPlan(
  selection: Entry003SubjectSelection,
): Entry003EvidenceResearchPlan {
  const items = selection.researchRequired.map((req, i) => ({
    claim: selection.thesis,
    evidenceNeeded: req,
    researchStatus: req.includes('RESEARCH_REQUIRED')
      ? ('RESEARCH_REQUIRED' as const)
      : ('NOT_REQUIRED' as const),
    sourceRequirement: req.includes('fabricat')
      ? 'Primary sources only — no invented quotes or statistics'
      : 'Verified public record, aggregate patterns, or licensed archival reference',
    productionImportance: i === 0 ? ('CRITICAL' as const) : ('IMPORTANT' as const),
  }));

  items.push({
    claim: selection.lockedPremiseCandidate,
    evidenceNeeded: 'Pattern-level receipts supporting contradiction (product counts, timestamps, routine steps)',
    researchStatus: 'RESEARCH_REQUIRED',
    sourceRequirement: 'Documented content patterns — not fabricated individual posts',
    productionImportance: 'CRITICAL',
  });

  return {
    planId: `NDX-E003-EVIDENCE-PLAN-001`,
    entryId: ENTRY_003_ID,
    items,
    fabricationPolicy: 'NO_FABRICATED_RECEIPTS',
  };
}
