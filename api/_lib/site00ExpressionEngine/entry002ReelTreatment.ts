/**
 * Sprint B4.6 — Locked Entry 002 reel treatment authority.
 */

import type { ReelTreatmentAuthority } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { ENTRY_002_REEL_TREATMENT_001 } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';

export function buildEntry002ReelTreatmentAuthority(): ReelTreatmentAuthority {
  return {
    treatmentId: ENTRY_002_REEL_TREATMENT_001,
    entryId: 'entry-002',
    entryTitle: 'OH, NOW IT WAS FUN?',
    subject: '2016 IG BADDIE FASHION',
    chapterId: CHAPTER_01_ID,
    chapterTitle: 'WHICH ONE IS IT?',
    argumentArc: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'INTERJECTION', 'SYNTHESIS'],
    territory: 'THE NOSTALGIA EDIT SUITE',
    world: 'surreal physical editing suite — cultural memory cut, reframed, revised',
    status: 'LOCKED',
    logline:
      'NDX stumbles on a present-day post praising 2016 IG baddie fashion, scrolls back through the same woman\'s archive to 2016 receipts where the same aesthetic was labeled tacky — then delivers the interjection that the clothes never got an apology, just a rebrand, before the phone glitches back toward Entry 003.',
    dramaticEngine:
      'Same woman, same fashion codes, opposite cultural labels across time — real-time praise vs archived mockery — NDX as investigator exposing the contradiction.',
    characterRoles: {
      ndx:
        'Observer / investigator / interjector — NOT the subject woman. Partial presence: silhouette, hands, over-shoulder, shadow. Short lime nails.',
      subjectWoman:
        'The proof — same person in present and 2016. Fashion identity stable. Culture mislabeled her then; nostalgizes her now.',
    },
    coreStory:
      '2026: NDX stumbles on subject woman\'s present-day post going semi-viral — praised for 2016 baddie look. HOLD ON. NDX taps profile, scrolls all the way back through a cinematic cultural glitch. Lands on 2016: same subject woman, similar outfit, old Instagram feel, negative labels (tacky, basic, overdone). Post click triggers memory lifting off phone. Contradiction: look didn\'t change — response did. NDX stitches: THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND. Phone cracks / glitches — snap back to present — Entry 003 handoff hook.',
    visualWorldRules: [
      'Phone is discovery + evidence + interjection surface — not comment graveyard UI',
      '2016: old Instagram grammar, flash/mirror selfie era-authentic, rawer, criticized in real time',
      'Present: admired, aestheticized, nostalgized — iconic / an era framing',
      'Edit-suite metaphor: physical memory cut/relabel — NOT Premiere/Final Cut/desktop NLE',
      'Cultural glitch: profile scroll through years; memory lifts off phone dimensionally',
      'Do not collapse into Entry 001 TV broadcast logic',
    ],
    fashionEvidenceRules: [
      'Chokers, bodycon, thigh-high boots, nude/clear heels, bomber jackets, matching sets, overlined lips',
      'Outfit did not meaningfully change — the label changed',
      '2016 side is not parody; present side is not generic modern fashion content',
    ],
    storyEndingRule:
      'Phone crack / glitch / interruption snaps back to reality — encodes continuation handoff toward Entry 003 (future device may be laptop, tablet, watch, or another screen).',
    entry003HandoffHook:
      'Snap-back from archive breach — reality resumes — next entry discovery surface TBD (not produced this sprint).',
    canonState: 'PRODUCTION_AUTHORITY',
  };
}
