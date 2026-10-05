/**
 * Sprint B4.6 follow-up — Five pre-storyboard visual authority board definitions.
 * Sprint B4.7 — Founder-approved visual authority canon from attached boards.
 */

import type { PreStoryboardVisualAuthority } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { buildEntry002PreStoryboardAuthorityId } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';

function authority(
  boardNumber: number,
  fields: Omit<
    PreStoryboardVisualAuthority,
    'boardId' | 'boardNumber' | 'storagePath' | 'previewUrl' | 'founderJudgment' | 'record'
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
      purpose: 'Define how NDX may be seen without revealing her — observer / investigator, never the subject',
      continuityRules: [
        'Partial presence only — over-shoulder, shadow, reflection, partial profile, cropped body, seated observer',
        'Light-skinned Black woman — high messy bun with 3C curls — dark cinematic noir styling',
        'Never full conventional protagonist portrait or model sheet',
        'NDX is the observer / receipt-puller — NOT the subject woman',
      ],
      requiredVisualElements: [
        'over-shoulder framing toward phone',
        'silhouette or shadow presence',
        'reflection in glass/window',
        'partial profile crop',
        'seated observer framing',
        'mysterious present-day spectator energy',
      ],
      forbiddenElements: [
        'full glamour portrait',
        'fully exposed NDX identity',
        'subject woman face labeled as NDX',
        'NDX as standard full protagonist',
      ],
      visualDescription:
        'Founder-approved authority — NDX as ambiguous investigator: over-shoulder toward phone grid, silhouette in dark window, partial profile, reflection with city lights. High messy bun, 3C curls, black turtleneck/leather jacket. Present but unseen. Observer, not subject.',
    }),
    authority(2, {
      boardTitle: 'SUBJECT WOMAN DUAL-ERA AUTHORITY',
      role: 'SUBJECT_WOMAN_DUAL_ERA',
      purpose: 'Lock the same subject woman across 2016 and 2026 — cultural receipt identity',
      continuityRules: [
        'Same woman in 2016 and 2026 — face, skin tone, body proportions, hair identity, makeup family',
        'Sleek dark straight hair — polished low-back / straight identity',
        'Glossy overlined nude lips — full lashes — defined brows',
        'French-tip manicure and French-tip pedicure — NOT lime nails',
        'Subject woman is NOT NDX',
      ],
      requiredVisualElements: [
        '2016 era version',
        '2026 era version',
        'side-by-side or matched continuity',
        'recognizable silhouette and face continuity',
        'black bodycon dress and black choker in both eras',
      ],
      forbiddenElements: [
        'two different women',
        'lime nails on subject woman',
        'NDX face as subject',
        'random model swap',
      ],
      visualDescription:
        'Dual-era authority — subject woman 2016 vs 2026. Same face, body, hair, makeup. 2016: mirror selfie, olive bomber, strappy heels, bathroom flash. 2026: cinematic city night, leather jacket, thigh-high boots. French tips always. Same woman — different year — different public judgment.',
    }),
    authority(3, {
      boardTitle: 'NDX HANDS / NAILS / INTERACTIONS AUTHORITY',
      role: 'NDX_HAND_NAIL_INTERACTION',
      purpose: 'Lock NDX hand identity and investigative interaction grammar',
      continuityRules: [
        'Short lime-green manicure — NON-NEGOTIABLE — not French tips, not long acrylics',
        'Light-skinned Black / biracial hand proportions — thick gold ring optional',
        'This board belongs to NDX — not subject woman hands',
        'Phone is archive portal — digital to physical evidence transition',
      ],
      requiredVisualElements: [
        'holding phone with short lime nails',
        'tapping profile to enter archive',
        'fast scroll back through years to 2016',
        'selecting 2016 post',
        'pulling physical receipt/memory from phone',
        'stitching / aligning cultural evidence on light table',
        'lime edit marks / date tape on evidence',
      ],
      forbiddenElements: [
        'long nails',
        'French tips on NDX hands',
        'subject woman nail design on NDX',
        'random hand identity',
      ],
      visualDescription:
        'NDX hand authority — short lime green nails performing: hold phone, tap profile, scroll years 2026→2016, select 2016 post, pull polaroid receipt from screen, stitch contradiction on dark surface with lime tape marks. Observer hands only.',
    }),
    authority(4, {
      boardTitle: 'SUBJECT FASHION CONTINUITY AUTHORITY',
      role: 'SUBJECT_FASHION_CONTINUITY',
      purpose: 'Same fashion language, different cultural framing across 2016 and 2026',
      continuityRules: [
        'Black bodycon mini-dress and black choker in BOTH eras — mandatory constants',
        '2016: olive bomber jacket, strappy heels, mirror selfie framing',
        '2026: black leather jacket, thigh-high boots, cinematic city night',
        'French-tip manicure and pedicure always on subject woman',
        'Same silhouette, same elements, same energy — judgment changes, clothes do not',
      ],
      requiredVisualElements: [
        'black bodycon dress continuity grid',
        'black choker detail',
        'bomber jacket language',
        'thigh-high boot language',
        'nude/clear heel language',
        'statement bag',
        'overlined lips detail',
        'French-tip nail detail',
      ],
      forbiddenElements: [
        'completely different fashion era between 2016 and 2026',
        'lime nails on subject woman',
        'generic modern influencer look unrelated to 2016 baddie codes',
        'parody 2016',
      ],
      visualDescription:
        'Fashion continuity authority — SAME OUTFIT FAMILY BOTH ERAS. 2016 mirror selfie baddie vs 2026 cinematic praised look. Choker, bodycon, bomber/thigh-high boot codes persist. French tips. Cultural label changed — not the clothes.',
    }),
    authority(5, {
      boardTitle: 'PHONE / CULTURAL GLITCH AUTHORITY',
      role: 'PHONE_CULTURAL_GLITCH',
      purpose: 'Phone archive portal, temporal scroll, cultural glitch, and snap-back interruption',
      continuityRules: [
        'Phone content predominantly FULL-BODY / OUTFIT-LED — varied poses, not repeated identical portraits',
        '2026 praised post → profile entry → year scroll 2026→2016 → old IG state → tap glitch',
        'Memory lifts dimensionally — negative 2016 receipts: TACKY, BASIC, OVERDONE, DOING TOO MUCH, PLAYED OUT',
        'Snap-back crack/interruption — not polished ending',
        'NDX lime-nailed hand continuity through all interactions',
        'Not generic cyberpunk portal — cultural memory extraction',
      ],
      requiredVisualElements: [
        '2026 viral praised semi-viral post — full-body subject woman',
        'profile grid with varied full-body posts',
        'vertical year scroll collapsing to 2016',
        '2016 old-style Instagram post',
        'cultural glitch on tap — temporal blur, RGB separation',
        'memory lifting off screen with negative reaction scraps',
        'phone crack / signal break snap-back',
      ],
      forbiddenElements: [
        'comment graveyard UI',
        'repeated identical face portrait grid',
        'phone feed dominated by face close-ups',
        'generic sci-fi portal',
        'edit suite replacing phone story',
      ],
      visualDescription:
        'Phone authority sequence: 2026 praised post → profile archive → scroll years → 2016 old IG → tap cultural glitch → memory exits screen with negative receipts → snap-back crack. Full-body outfit-led phone content. NDX lime nails on device. Phone is portal, not the world.',
    }),
  ];
}
