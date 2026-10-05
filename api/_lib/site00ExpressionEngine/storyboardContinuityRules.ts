/**
 * Sprint B4.6 — Storyboard continuity rules (NDX vs subject woman).
 */

import type { CharacterAuthoritySet } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';

export function buildEntry002CharacterAuthoritySet(): CharacterAuthoritySet {
  return {
    ndxPresenceProfile: {
      role: 'observer_investigator_interjector',
      visibility: 'partial_only',
      allowedPresence: [
        'silhouette',
        'hands with short lime nails',
        'over-shoulder',
        'shadow',
        'implied body — never full ordinary protagonist reveal',
      ],
      nailAuthority: 'short lime green nails — NDX hand authority when visible',
    },
    subjectWomanContinuityProfile: {
      role: 'proof_same_woman_both_timelines',
      identityLock:
        'Same woman in present-day post and 2016 archive — face, skin tone, body type, hair family must persist',
      fashionStability:
        '2016 IG baddie codes stable across timelines — choker, bodycon, bomber, overlined lip family',
      timelineRule:
        'Present praise and 2016 criticism attach to the SAME person — not two random women',
    },
    handAndNailAuthority:
      'NDX: short lime nails on investigator hands. Subject woman: distinct hand/nail continuity when her hands appear.',
    hairSilhouetteAuthority:
      'Subject woman: long sleek dark hair consistent across 2016 and present. NDX: hair not hero — partial silhouette only.',
    fashionEvidenceAuthority:
      'Repeatable 2016 baddie codes as proof objects — outfit sameness is the thesis',
  };
}
