/**
 * P0.5E.4 — Forensic audit of P0.5E.3 seeded character content.
 */

import { auditTrait, buildForensicReport } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/forensicAudit.js';
import type { CharacterForensicAudit } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../ndxEmbodiedCharacterDiscovery/types.js';
import { VISUAL_TENDENCY_HYPOTHESES } from '../ndxEmbodiedCharacterDiscovery/constants.js';

export function auditNdxEmbodiedCharacterFoundation(base: NdxEmbodiedCharacterDiscoveryRun): CharacterForensicAudit {
  const traits = [
    ...base.psychology.whatSheNotices.map((s, i) =>
      auditTrait({ traitId: `psych-notice-${i}`, category: 'PSYCHOLOGY', statement: s }),
    ),
    ...base.psychology.insecurities.map((s, i) =>
      auditTrait({ traitId: `psych-insecurity-${i}`, category: 'PSYCHOLOGY', statement: s }),
    ),
    ...base.intelligence.strongestIntelligences.map((s, i) =>
      auditTrait({ traitId: `intel-strong-${i}`, category: 'INTELLIGENCE', statement: s }),
    ),
    ...base.intelligence.blindSpots.map((s, i) =>
      auditTrait({ traitId: `intel-blind-${i}`, category: 'INTELLIGENCE', statement: s }),
    ),
    ...base.contradictions.majorContradictions.map((s, i) =>
      auditTrait({ traitId: `contradiction-major-${i}`, category: 'CONTRADICTION', statement: s }),
    ),
    auditTrait({
      traitId: 'flaw-annoying',
      category: 'FLAW',
      statement: base.contradictions.traitOthersFindAnnoying,
    }),
    auditTrait({
      traitId: 'embarrassed-likes',
      category: 'PRIVATE_HUMANITY',
      statement: base.contradictions.embarrassedLikes,
    }),
    ...base.humor.whatMakesHerLaugh.map((s, i) =>
      auditTrait({ traitId: `humor-laugh-${i}`, category: 'HUMOR', statement: s }),
    ),
    ...VISUAL_TENDENCY_HYPOTHESES.map((s, i) =>
      auditTrait({ traitId: `visual-hyp-${i}`, category: 'VISUAL_HYPOTHESIS', statement: s }),
    ),
  ];

  return buildForensicReport(traits);
}

export function seededContentRemainsProposalUntilFounderReview(audit: CharacterForensicAudit): boolean {
  return audit.totalSeededTraits > 0 && audit.startingCastingReadiness === 'BLOCKED_FOUNDER_DISCOVERY_REQUIRED';
}
