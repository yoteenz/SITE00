/**
 * Sprint B4.6 follow-up — Five pre-storyboard visual authority board definitions.
 */

import type { PreStoryboardVisualAuthority } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { buildEntry002PreStoryboardAuthorityId } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';

function authority(
  boardNumber: number,
  fields: Omit<
    PreStoryboardVisualAuthority,
    'boardId' | 'boardNumber' | 'storagePath' | 'previewUrl' | 'founderJudgment'
  >,
): PreStoryboardVisualAuthority {
  return {
    boardId: buildEntry002PreStoryboardAuthorityId(boardNumber),
    boardNumber,
    storagePath: null,
    previewUrl: null,
    founderJudgment: 'UNREVIEWED',
    ...fields,
  };
}

export function buildEntry002PreStoryboardVisualAuthorities(): PreStoryboardVisualAuthority[] {
  return [
    authority(1, {
      boardTitle: 'NDX PRESENCE AUTHORITY',
      role: 'NDX_PRESENCE',
      purpose: 'Define how NDX may be seen without revealing her — spectator / investigator energy',
      continuityRules: [
        'Partial presence only — over-shoulder, back/silhouette, hands, shadow, cropped body',
        'Never full conventional character portrait or model sheet',
        'Do not use subject-woman face as NDX',
      ],
      requiredVisualElements: [
        'over-shoulder framing',
        'silhouette or shadow',
        'mysterious present-day spectator energy',
        'phone interaction at edge of frame',
      ],
      forbiddenElements: [
        'full glamour portrait',
        'front/side/back model sheet',
        'fully exposed NDX identity',
        'subject woman face labeled as NDX',
      ],
      visualDescription:
        'Rough structured previsualization authority — NDX as ambiguous investigator: over-shoulder toward phone, silhouette in dark space, partial profile or shadow. Mysterious spectator energy. NOT a full visible protagonist.',
    }),
    authority(2, {
      boardTitle: 'SUBJECT WOMAN DUAL-ERA AUTHORITY',
      role: 'SUBJECT_WOMAN_DUAL_ERA',
      purpose: 'Lock the same subject woman across 2016 and 2026 — cultural receipt identity',
      continuityRules: [
        'Same woman in 2016 and 2026 — face, skin tone, body proportions, hair, core makeup',
        'Immediately identifiable as one person across eras',
        'Subject woman is NOT NDX',
      ],
      requiredVisualElements: [
        '2016 version',
        '2026 version',
        'side-by-side or matched angles',
        'recognizable silhouette continuity',
      ],
      forbiddenElements: ['two different women', 'random model swap', 'NDX face as subject'],
      visualDescription:
        'Dual-era authority board — subject woman 2016 vs 2026 side by side. Same face, skin tone, body, hair identity locked. 2016: era-authentic capture. 2026: cleaner admired presentation. Clearly the same person.',
    }),
    authority(3, {
      boardTitle: 'NDX HAND / NAIL / INTERACTION AUTHORITY',
      role: 'NDX_HAND_NAIL_INTERACTION',
      purpose: 'Lock recurring NDX hand identity and reel interaction grammar',
      continuityRules: [
        'Short lime green square/soft-square nails — NON-NEGOTIABLE',
        'This board belongs to NDX — not subject woman hands',
        'Consistent nail length and shape across interactions',
      ],
      requiredVisualElements: [
        'holding phone',
        'tapping profile',
        'rapid scroll gesture',
        'selecting 2016 post',
        'guiding memory out of phone',
      ],
      forbiddenElements: ['long nails', 'subject woman nail design', 'random hand identity'],
      visualDescription:
        'NDX hand authority — short lime green nails on investigator hands performing: hold phone, tap profile, rapid scroll back through years, select 2016 post, touch/stitch archive material. Belongs to NDX only.',
    }),
    authority(4, {
      boardTitle: 'SUBJECT FASHION CONTINUITY — 2016 VS 2026',
      role: 'SUBJECT_FASHION_CONTINUITY',
      purpose: 'Same fashion language, different cultural framing across years',
      continuityRules: [
        '2016 and 2026 looks close enough that contradiction is obvious',
        '2026 may be cleaner/better photographed but NOT different fashion language',
        'Use choker, bodycon, thigh-high boots, nude/clear heels, bomber, matching set, overlined lips',
      ],
      requiredVisualElements: ['2016 baddie look', '2026 praised look', 'side-by-side comparison'],
      forbiddenElements: ['completely different fashion era', 'generic modern influencer look', 'parody 2016'],
      visualDescription:
        'Fashion continuity authority — 2016 IG baddie look vs 2026 nostalgized look. Choker, bodycon, bomber family visible in both. Outfit essentially same language; 2026 cleaner/reverent framing. Label changed — not the clothes.',
    }),
    authority(5, {
      boardTitle: 'PHONE / CULTURAL GLITCH AUTHORITY',
      role: 'PHONE_CULTURAL_GLITCH',
      purpose: 'Define phone states and temporal glitch transition system for the reel',
      continuityRules: [
        'Old vs new Instagram distinction legible',
        'Profile-scroll language — years collapsing backward',
        'Memory projection off phone — not generic sci-fi portal',
        'Snap-back crack/interruption at end',
      ],
      requiredVisualElements: [
        '2026 viral praised post',
        'profile view',
        'rapid scroll through years',
        '2016 old-style Instagram post',
        'post click cultural glitch',
        'memory leaving screen dimensionally',
        'phone crack / snap-back',
      ],
      forbiddenElements: ['comment graveyard UI', 'generic social dashboard', 'random sci-fi portal'],
      visualDescription:
        'Phone authority sequence: A) 2026 praised post B) profile view C) rapid scroll back D) 2016 old Instagram E) post click glitch F) subject memory lifting off screen G) final crack/snap-back. Temporal glitch and memory portal — not generic UI.',
    }),
  ];
}
