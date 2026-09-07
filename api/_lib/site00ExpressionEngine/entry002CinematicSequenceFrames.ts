/**
 * Sprint B4.5 — Entry 002 cinematic visual sequence frame definitions (10 frames).
 */

import type { CinematicVisualSequenceFrame } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import { buildEntry002CinematicFrameId } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { ENTRY_002_CONTINUITY_BOARD_IDS } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';

const ALL_BOARDS = Object.values(ENTRY_002_CONTINUITY_BOARD_IDS);
const CHAR_HANDS = [
  ENTRY_002_CONTINUITY_BOARD_IDS.CHARACTER_IDENTITY,
  ENTRY_002_CONTINUITY_BOARD_IDS.HANDS_NAILS,
  ENTRY_002_CONTINUITY_BOARD_IDS.HAIR_SILHOUETTE,
];
const PHONE_WORLD = [
  ENTRY_002_CONTINUITY_BOARD_IDS.PHONE_EDIT_SUITE,
  ENTRY_002_CONTINUITY_BOARD_IDS.HANDS_NAILS,
];
const FASHION = [
  ENTRY_002_CONTINUITY_BOARD_IDS.FASHION_EVIDENCE,
  ENTRY_002_CONTINUITY_BOARD_IDS.CHARACTER_IDENTITY,
];
const SUITE = [
  ENTRY_002_CONTINUITY_BOARD_IDS.PHONE_EDIT_SUITE,
  ENTRY_002_CONTINUITY_BOARD_IDS.FASHION_EVIDENCE,
];

function frame(
  frameNumber: number,
  fields: Omit<
    CinematicVisualSequenceFrame,
    'frameId' | 'frameNumber' | 'storagePath' | 'previewUrl'
  >,
): CinematicVisualSequenceFrame {
  return {
    frameId: buildEntry002CinematicFrameId(frameNumber),
    frameNumber,
    storagePath: null,
    previewUrl: null,
    ...fields,
  };
}

export function buildEntry002CinematicVisualSequenceFrames(): CinematicVisualSequenceFrame[] {
  return [
    frame(1, {
      argumentBeat: 'CLAIM',
      shotPurpose: 'The claim — phone as first light, subject arrives immediately',
      visualDescription:
        'Black environment. Her phone is the first light source. Hand with short lime nails. On phone: 2016 WAS ICONIC. A 2016 IG baddie image/post visible. Intimate camera.',
      cameraBehavior: 'Close intimate — hand and phone glow on black',
      characterPresence: 'Hand with short lime nails — partial presence',
      phoneRole: 'First light source — evidence device',
      fashionEvidence: ['2016 baddie post visible on phone screen'],
      editSuiteBehavior: 'Not yet — pure black void',
      textBehavior: '2016 WAS ICONIC on phone only',
      transitionLogic: 'Cut to her reaction',
      continuityNotes: 'Black/cream/dark neutrals — lime on nails and phone edge only',
      referenceBoardIds: [...PHONE_WORLD, ENTRY_002_CONTINUITY_BOARD_IDS.CHARACTER_IDENTITY],
      priorFrameReference: false,
      keyframeExtractionCandidate: true,
    }),
    frame(2, {
      argumentBeat: 'CLAIM',
      shotPurpose: 'Her reaction — observational cinematic moment',
      visualDescription:
        'We see her — not a glamour portrait. Cinematic observational moment. She reads the claim. Small look / pause / side-eye. NDX has noticed something.',
      cameraBehavior: 'Medium close — observational not posed',
      characterPresence: 'Full face — same NDXBOOK woman',
      phoneRole: 'Phone glow on face from below',
      fashionEvidence: ['black choker visible', '2016 glam makeup'],
      editSuiteBehavior: 'None',
      textBehavior: 'None',
      transitionLogic: 'Push into archive swipe',
      continuityNotes: 'Same woman — face, skin, hair locked from character authority',
      referenceBoardIds: CHAR_HANDS,
      priorFrameReference: true,
      keyframeExtractionCandidate: false,
    }),
    frame(3, {
      argumentBeat: 'RECEIPT',
      shotPurpose: 'The archive — 2016 fashion evidence on phone',
      visualDescription:
        'She swipes through 2016 fashion evidence. Close detail: phone, short lime nail, chokers, bodycon, bomber, overlined lips. Phone remains evidence device.',
      cameraBehavior: 'Over-shoulder / POV close on phone screen',
      characterPresence: 'Hand + thumb with lime nails',
      phoneRole: 'Archive evidence device',
      fashionEvidence: ['choker', 'bodycon', 'bomber', 'overlined nude lip'],
      editSuiteBehavior: 'None',
      textBehavior: 'Minimal archive UI only',
      transitionLogic: 'Label enters on same image',
      continuityNotes: 'Not comment graveyard — curated archive',
      referenceBoardIds: [...FASHION, ...PHONE_WORLD],
      priorFrameReference: true,
      keyframeExtractionCandidate: false,
    }),
    frame(4, {
      argumentBeat: 'RECEIPT',
      shotPurpose: 'The old opinion — period receipt label',
      visualDescription:
        'Same archived image. One old cultural label: TACKY or BASIC. Period receipt — not comment wall.',
      cameraBehavior: 'Hold on image with label overlay',
      characterPresence: 'Optional hand edge',
      phoneRole: 'Label origin ghost',
      fashionEvidence: ['same 2016 image unchanged'],
      editSuiteBehavior: 'Label typography only',
      textBehavior: 'TACKY — single word',
      transitionLogic: 'Memory begins leaving phone',
      continuityNotes: 'One receipt only — controlled',
      referenceBoardIds: FASHION,
      priorFrameReference: true,
      keyframeExtractionCandidate: false,
    }),
    frame(5, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'The transition — memory becomes physical material',
      visualDescription:
        '2016 image/memory leaving phone. Becomes physical image strip / transparency / film frame. Short lime nails physically guide it out. Portal between digital record and Nostalgia Edit Suite.',
      cameraBehavior: 'Dynamic medium — pull motion from phone',
      characterPresence: 'Hands with lime nails guiding strip',
      phoneRole: 'Source plane — image exiting',
      fashionEvidence: ['same fashion image on emerging strip'],
      editSuiteBehavior: 'Suite depth beginning to reveal at edges',
      textBehavior: 'None',
      transitionLogic: 'Reveal edit suite world',
      continuityNotes: 'NOT desktop NLE software — physical surreal transfer',
      referenceBoardIds: [...PHONE_WORLD, ...SUITE],
      priorFrameReference: true,
      keyframeExtractionCandidate: false,
    }),
    frame(6, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'The edit suite — surreal physical world revealed',
      visualDescription:
        'Surreal dark tactile physical edit suite. Same 2016 image on light table / memory timeline. Old label TACKY. New label ICONIC waiting nearby. Character may be partial: hand, shadow, silhouette.',
      cameraBehavior: 'Wide environmental reveal — top-down or angled workspace',
      characterPresence: 'Partial — hand, shadow, or silhouette',
      phoneRole: 'Peripheral prop on table edge',
      fashionEvidence: ['unchanged 2016 image on timeline'],
      editSuiteBehavior: 'Light table, cream tape, lime cut markers — surreal physical world only',
      textBehavior: 'TACKY and ICONIC labels visible',
      transitionLogic: 'Macro cut action',
      continuityNotes: 'NOT computer workstation — surreal physical metaphor',
      referenceBoardIds: SUITE,
      priorFrameReference: true,
      keyframeExtractionCandidate: true,
    }),
    frame(7, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'The cut — visual punctuation',
      visualDescription:
        'Macro close cinematic shot. Short lime nails. Edit blade. Old label being removed. Lime cut mark. Craft metaphor not violence.',
      cameraBehavior: 'Macro close on cut action',
      characterPresence: 'Hands with lime nails only',
      phoneRole: 'Absent',
      fashionEvidence: ['same image under blade'],
      editSuiteBehavior: 'Blade, lime cut marker, label peel',
      textBehavior: 'TACKY label peeling',
      transitionLogic: 'Reveal reframe',
      continuityNotes: 'Lime nails NON-NEGOTIABLE in macro',
      referenceBoardIds: [
        ENTRY_002_CONTINUITY_BOARD_IDS.HANDS_NAILS,
        ENTRY_002_CONTINUITY_BOARD_IDS.PHONE_EDIT_SUITE,
      ],
      priorFrameReference: true,
      keyframeExtractionCandidate: true,
    }),
    frame(8, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'The reframe — same image, new label',
      visualDescription:
        'Exact same 2016 image. Now labeled ICONIC. Image visibly unchanged — only presentation/label/emotional grade shifts warmer.',
      cameraBehavior: 'Slow push on reframed strip',
      characterPresence: 'Optional silhouette at edge',
      phoneRole: 'Resting on light table',
      fashionEvidence: ['pixel-identical fashion image'],
      editSuiteBehavior: 'ICONIC label filed — warm grade wash',
      textBehavior: 'ICONIC',
      transitionLogic: 'Return to character for interjection',
      continuityNotes: 'Show contradiction visually — do NOT explain with wall text',
      referenceBoardIds: SUITE,
      priorFrameReference: true,
      keyframeExtractionCandidate: true,
    }),
    frame(9, {
      argumentBeat: 'INTERJECTION',
      shotPurpose: 'NDX interjection — observational payoff',
      visualDescription:
        'Return to her / phone / physical memory. THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND. Entry-specific surface — not random room text.',
      cameraBehavior: 'Medium on character + interjection typography',
      characterPresence: 'Full or three-quarter — observational',
      phoneRole: 'Inactive prop',
      fashionEvidence: ['filed memory strip in background'],
      editSuiteBehavior: 'Filing gesture',
      textBehavior: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
      transitionLogic: 'Quiet resolution',
      continuityNotes: 'NDX voice — not decorative quote',
      referenceBoardIds: CHAR_HANDS,
      priorFrameReference: true,
      keyframeExtractionCandidate: true,
    }),
    frame(10, {
      argumentBeat: 'SYNTHESIS',
      shotPurpose: 'Resolution — quiet visual payoff',
      visualDescription:
        'Quiet visual payoff. Altered 2016 memory filed / placed / completed. Entry 002 identity may land. Still a film frame not a graphic poster.',
      cameraBehavior: 'Wide quiet filing shot',
      characterPresence: 'Hand filing final card — lime nails',
      phoneRole: 'Closed on desk',
      fashionEvidence: ['fashion motif on filing card thumbnail'],
      editSuiteBehavior: 'Drawer close — archive complete',
      textBehavior: 'ENTRY 002 / 2016 IG BADDIE FASHION — restrained',
      transitionLogic: 'End hold',
      continuityNotes: 'Film frame not marketing art',
      referenceBoardIds: ALL_BOARDS,
      priorFrameReference: true,
      keyframeExtractionCandidate: true,
    }),
  ];
}
