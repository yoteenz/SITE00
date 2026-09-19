/**
 * Sprint B4.7 — Final cinematic storyboard compilation contract.
 * Resolves all five approved pre-storyboard visual authority domains.
 */

import type {
  PreStoryboardVisualAuthority,
  PreStoryboardVisualAuthorityPack,
} from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { buildPreStoryboardApprovalState } from './preStoryboardAuthorityGate.js';

export type FinalStoryboardCompilationContract = {
  entryId: 'entry-002';
  treatmentId: string;
  lockedReelStory: true;
  characterSeparation: {
    ndx: 'OBSERVER_INVESTIGATOR_PARTIAL_PRESENCE';
    subjectWoman: 'CULTURAL_RECEIPT_FULLY_VISIBLE';
    rule: 'NDX !== SUBJECT WOMAN';
  };
  nailSeparation: {
    ndx: 'SHORT_LIME_GREEN_NAILS';
    subject: 'FRENCH_TIPS';
  };
  faceContinuity: {
    subjectWoman: 'SAME_FACE_ACROSS_2016_2026';
  };
  fashionContinuity: {
    rule: 'SAME_STYLE_FAMILY_BOTH_ERAS';
    elements: string[];
  };
  phoneContent: {
    framing: 'FULL_BODY_OUTFIT_LED';
    poses: 'VARIED_NOT_REPEATED_IDENTICAL_PORTRAITS';
  };
  ndxVisibility: {
    rule: 'PARTIAL_MYSTERIOUS_NEVER_STANDARD_FULL_PROTAGONIST';
  };
  authorities: {
    ndxPresenceAuthority: PreStoryboardVisualAuthority | null;
    subjectDualEraAuthority: PreStoryboardVisualAuthority | null;
    ndxHandsAuthority: PreStoryboardVisualAuthority | null;
    subjectFashionAuthority: PreStoryboardVisualAuthority | null;
    phoneGlitchAuthority: PreStoryboardVisualAuthority | null;
  };
  continuityFailConditions: string[];
  readyForCompilation: boolean;
  blockedReason: string | null;
};

const FAIL_CONDITIONS = [
  'NDX and subject woman merged',
  'Subject woman given lime nails',
  'NDX given French tips',
  'Subject woman face changes between eras',
  'Subject woman body proportions change materially',
  'Subject hairstyle changes without narrative reason',
  'Repeated identical portrait pose across phone content',
  'Phone feed dominated by face close-ups instead of outfit/full-body evidence',
  '2016 and 2026 outfits become unrelated',
  '2016 visual does not read as older social media',
  'Cultural glitch becomes generic cyberpunk portal',
  'Comment Graveyard world returns',
  'Edit suite replaces the actual phone/profile story',
  'NDX becomes a fully exposed conventional protagonist',
  'Prior cinematic experiment promoted to canon',
  'Start/mid/end keyframes generated before final storyboard approval',
  'Video dispatched before keyframe approval',
];

export function resolveFinalStoryboardCompilationContract(
  pack: PreStoryboardVisualAuthorityPack,
): FinalStoryboardCompilationContract {
  const approval = buildPreStoryboardApprovalState(pack.authorities);
  const byRole = new Map(pack.authorities.map((a) => [a.role, a]));

  const fashion = byRole.get('SUBJECT_FASHION_CONTINUITY');

  return {
    entryId: 'entry-002',
    treatmentId: pack.treatmentId,
    lockedReelStory: true,
    characterSeparation: {
      ndx: 'OBSERVER_INVESTIGATOR_PARTIAL_PRESENCE',
      subjectWoman: 'CULTURAL_RECEIPT_FULLY_VISIBLE',
      rule: 'NDX !== SUBJECT WOMAN',
    },
    nailSeparation: {
      ndx: 'SHORT_LIME_GREEN_NAILS',
      subject: 'FRENCH_TIPS',
    },
    faceContinuity: {
      subjectWoman: 'SAME_FACE_ACROSS_2016_2026',
    },
    fashionContinuity: {
      rule: 'SAME_STYLE_FAMILY_BOTH_ERAS',
      elements: fashion?.requiredVisualElements ?? [
        'black bodycon dress',
        'black choker',
        'bomber jacket',
        'thigh-high boots',
        'French-tip manicure',
      ],
    },
    phoneContent: {
      framing: 'FULL_BODY_OUTFIT_LED',
      poses: 'VARIED_NOT_REPEATED_IDENTICAL_PORTRAITS',
    },
    ndxVisibility: {
      rule: 'PARTIAL_MYSTERIOUS_NEVER_STANDARD_FULL_PROTAGONIST',
    },
    authorities: {
      ndxPresenceAuthority: byRole.get('NDX_PRESENCE') ?? null,
      subjectDualEraAuthority: byRole.get('SUBJECT_WOMAN_DUAL_ERA') ?? null,
      ndxHandsAuthority: byRole.get('NDX_HAND_NAIL_INTERACTION') ?? null,
      subjectFashionAuthority: fashion ?? null,
      phoneGlitchAuthority: byRole.get('PHONE_CULTURAL_GLITCH') ?? null,
    },
    continuityFailConditions: FAIL_CONDITIONS,
    readyForCompilation: approval.allAuthoritiesLoveIt,
    blockedReason: approval.allAuthoritiesLoveIt
      ? null
      : 'All five pre-storyboard visual authorities must be LOVE_IT before final cinematic storyboard compilation',
  };
}

export function assertAllFiveAuthoritiesResolved(
  contract: FinalStoryboardCompilationContract,
): void {
  const { authorities } = contract;
  const missing = (
    [
      ['ndxPresenceAuthority', authorities.ndxPresenceAuthority],
      ['subjectDualEraAuthority', authorities.subjectDualEraAuthority],
      ['ndxHandsAuthority', authorities.ndxHandsAuthority],
      ['subjectFashionAuthority', authorities.subjectFashionAuthority],
      ['phoneGlitchAuthority', authorities.phoneGlitchAuthority],
    ] as const
  ).filter(([, a]) => !a);

  if (missing.length > 0) {
    throw new Error(
      `Storyboard compilation contract missing authorities: ${missing.map(([k]) => k).join(', ')}`,
    );
  }
}

/** Fail closed when any required approved authority is unresolved at compilation time. */
export function assertStoryboardCompilationFailClosed(
  contract: FinalStoryboardCompilationContract,
): void {
  if (!contract.readyForCompilation) {
    throw new Error(
      contract.blockedReason ??
        'Storyboard compilation fail-closed — pre-storyboard authority gate not satisfied',
    );
  }
  assertAllFiveAuthoritiesResolved(contract);
}
