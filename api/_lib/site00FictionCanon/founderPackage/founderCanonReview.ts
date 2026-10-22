import type { FictionCanonDocumentRecord } from '../../../../shared/site00-fiction-canon/types.js';
import { FOUNDER_VERIFIED_NARROW_SELECTIONS } from './documentMap.js';

export type FounderCanonReviewPack = {
  establishedFounderDecisions: string[];
  strongWorkingDirections: string[];
  illustrativeEpisodeConcepts: string[];
  unresolvedMysteries: string[];
  possibleContradictions: string[];
  missingDevelopmentDecisions: string[];
  eligibleForFounderPromotion: string[];
};

export function buildFounderCanonReviewPack(activeDocs: FictionCanonDocumentRecord[]): FounderCanonReviewPack {
  const unresolvedMysteries: string[] = [];
  const illustrativeEpisodeConcepts: string[] = [];

  for (const doc of activeDocs) {
    if (doc.canonStatus === 'UNRESOLVED') {
      unresolvedMysteries.push(`${doc.stableIdentifier}: ${doc.title}`);
    }
    if (doc.documentType === 'EPISODE_CONCEPT' && doc.canonStatus === 'PROPOSED') {
      illustrativeEpisodeConcepts.push(doc.stableIdentifier);
    }
    if (doc.documentType === 'FAMILY_HISTORY') {
      unresolvedMysteries.push(
        "Mother's final exchange — exact events, mechanism of death, beneficiaries, culpability (explicitly UNRESOLVED in source).",
      );
    }
  }

  return {
    establishedFounderDecisions: [...FOUNDER_VERIFIED_NARROW_SELECTIONS],
    strongWorkingDirections: activeDocs
      .filter((d) => d.canonStatus === 'WORKING_CONCEPT')
      .map((d) => `${d.documentType}: ${d.stableIdentifier}`),
    illustrativeEpisodeConcepts,
    unresolvedMysteries: [...new Set(unresolvedMysteries)],
    possibleContradictions: [
      'Sloane Mercer (Studio World) superseded by Sloane Lockwood — preserve Mercer only as historical superseded reference if imported elsewhere.',
      'Compact JPEG visual package re-encoded from PNG — pixel-exact parity not guaranteed; identity composition retained.',
    ],
    missingDevelopmentDecisions: [
      'Romantic collaborator identity and casting',
      'Final speculative technology rules and naming',
      'Approved production runtimes per part',
      'Commercial pricing and verified revenue',
      'Definitive maternal final exchange outcome',
    ],
    eligibleForFounderPromotion: FOUNDER_VERIFIED_NARROW_SELECTIONS.map(
      (s) => `${s} — eligible for explicit FOUNDER_APPROVED APPROVED_CANON promotion (not auto-promoted).`,
    ),
  };
}
