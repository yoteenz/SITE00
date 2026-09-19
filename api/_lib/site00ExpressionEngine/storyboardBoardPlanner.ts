/**
 * Sprint B4.6 — 10-beat outline + 5 structural storyboard boards.
 */

import type { StoryboardBeat, StoryboardBoard } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { buildEntry002StructuralBoardId } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';

export function buildEntry002StoryboardBeatOutline(): StoryboardBeat[] {
  return [
    {
      beatNumber: 1,
      beatId: 'sb-beat-01',
      title: 'Present-day post discovery',
      argumentRole: 'CLAIM',
      description:
        'NDX stumbles upon a woman\'s present-day post. Comments flooding in real time — semi-viral praise for 2016 baddie fashion energy.',
      ndxRole: 'Discovery — partial presence at phone edge',
      subjectWomanRole: 'Present-day post subject — praised aesthetic',
      phoneRole: 'Surface of discovery — live comment energy without comment-graveyard UI',
      fashionEvidence: ['2016 baddie codes visible in present post'],
      continuityNotes: 'Black/lime/cream NDXBOOK palette',
    },
    {
      beatNumber: 2,
      beatId: 'sb-beat-02',
      title: 'Real-time affirmation',
      argumentRole: 'CLAIM',
      description:
        'Present-day cultural affirmation peaks — iconic / an era / we didn\'t know how good we had it energy in comments.',
      ndxRole: 'Observes momentum building',
      subjectWomanRole: 'Same woman being affirmed now',
      phoneRole: 'Live praise surface',
      fashionEvidence: ['bodycon', 'choker', 'bomber visible in post'],
      continuityNotes: 'Present grammar: aestheticized, nostalgized',
    },
    {
      beatNumber: 3,
      beatId: 'sb-beat-03',
      title: 'HOLD ON',
      argumentRole: 'LENS',
      description: 'NDX pauses — HOLD ON. Interrupts the momentum. Investigative beat.',
      ndxRole: 'Interjector pause — hands / silhouette',
      subjectWomanRole: 'Profile target',
      phoneRole: 'NDX taps profile',
      fashionEvidence: [],
      continuityNotes: 'NDX NOT the subject woman',
    },
    {
      beatNumber: 4,
      beatId: 'sb-beat-04',
      title: 'Profile scroll / cultural glitch',
      argumentRole: 'RECEIPT',
      description:
        'NDX scrolls all the way back through years. Cinematic cultural glitch — movement through archived opinion.',
      ndxRole: 'Drives scroll — lime nails on phone',
      subjectWomanRole: 'Archive subject across timeline',
      phoneRole: 'Portal through years',
      fashionEvidence: ['archive thumbnails hint baddie era'],
      continuityNotes: 'Scroll feels like memory breach not generic UI',
    },
    {
      beatNumber: 5,
      beatId: 'sb-beat-05',
      title: '2016 post land',
      argumentRole: 'RECEIPT',
      description:
        'Land on 2016 post — visibly vintage old Instagram. Same woman, similar outfit/styling family.',
      ndxRole: 'Observer at archive landing',
      subjectWomanRole: '2016 self — same person, era-authentic capture',
      phoneRole: 'Archive evidence device',
      fashionEvidence: ['choker', 'bodycon', 'overlined lip', 'bomber'],
      continuityNotes: '2016: flash/mirror selfie grammar, rawer, of-its-time',
    },
    {
      beatNumber: 6,
      beatId: 'sb-beat-06',
      title: '2016 negative labels',
      argumentRole: 'RECEIPT',
      description:
        'Old public reaction: tacky, basic, overdone, doing too much, played out — period receipts surround memory.',
      ndxRole: 'Witnesses archived opinion',
      subjectWomanRole: 'Same woman being mocked then',
      phoneRole: 'Label surface — controlled receipts not comment wall',
      fashionEvidence: ['same outfit as beat 5 unchanged'],
      continuityNotes: 'One receipt energy — not exhaustive comment UI',
    },
    {
      beatNumber: 7,
      beatId: 'sb-beat-07',
      title: 'Contradiction undeniable',
      argumentRole: 'CONTRADICTION',
      description:
        'Same woman, same aesthetic family, same codes — different cultural label. Side-by-side legibility.',
      ndxRole: 'Structures contradiction — not center frame',
      subjectWomanRole: 'Proof object across timelines',
      phoneRole: 'Comparison surface',
      fashionEvidence: ['pixel-same fashion object', 'label swap only'],
      continuityNotes: 'Thesis: outfit did not change — label did',
    },
    {
      beatNumber: 8,
      beatId: 'sb-beat-08',
      title: 'Cultural glitch expansion',
      argumentRole: 'CONTRADICTION',
      description:
        'Memory lifts off phone — holographic / projected / dimensional archive breach. Same woman more dimensional.',
      ndxRole: 'Intervention drives structure',
      subjectWomanRole: 'Memory becomes dimensional proof',
      phoneRole: 'Source plane — memory exiting device',
      fashionEvidence: ['2016 image on emerging strip / projection'],
      editSuiteBehavior: 'Physical edit-suite depth may begin at edges',
      continuityNotes: 'NOT desktop editing software',
    } as StoryboardBeat & { editSuiteBehavior?: string },
    {
      beatNumber: 9,
      beatId: 'sb-beat-09',
      title: 'NDX interjection stitch',
      argumentRole: 'INTERJECTION',
      description:
        'NDX cinematically stitches contradiction. THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
      ndxRole: 'Delivers observational payoff',
      subjectWomanRole: 'Proof filed in background',
      phoneRole: 'Inactive or peripheral',
      fashionEvidence: ['filed memory strip'],
      continuityNotes: 'Mandatory interjection line',
    },
    {
      beatNumber: 10,
      beatId: 'sb-beat-10',
      title: 'Snap-back / Entry 003 hook',
      argumentRole: 'SYNTHESIS',
      description:
        'Phone cracks / glitches / interrupts. Snap back to reality. Handoff energy toward Entry 003 — future device TBD.',
      ndxRole: 'Partial presence at snap-back',
      subjectWomanRole: 'Memory sealed',
      phoneRole: 'Glitch / crack / interruption device',
      fashionEvidence: [],
      continuityNotes: 'HANDOFF hook — do not produce Entry 003',
    },
  ].map((b) => {
    const { editSuiteBehavior, ...rest } = b as StoryboardBeat & { editSuiteBehavior?: string };
    return rest;
  });
}

function board(
  boardNumber: number,
  fields: Omit<StoryboardBoard, 'boardId' | 'boardNumber' | 'storagePath' | 'previewUrl' | 'founderJudgment'>,
): StoryboardBoard {
  return {
    boardId: buildEntry002StructuralBoardId(boardNumber),
    boardNumber,
    storagePath: null,
    previewUrl: null,
    founderJudgment: 'UNREVIEWED',
    ...fields,
  };
}

export function buildEntry002StructuralStoryboardBoards(): StoryboardBoard[] {
  return [
    board(1, {
      boardTitle: 'CLAIM — Present-day post discovery',
      storyFunction: 'Establish present-day praise and viral comment energy on 2016 baddie aesthetic',
      argumentGrammarRole: 'CLAIM',
      beatNumbers: [1, 2],
      visualDescription:
        'NDX discovers present-day post. Real-time comments flood in praising 2016 IG baddie fashion energy. Phone is discovery surface. Semi-viral affirmation legible immediately.',
      continuityNotes: 'NDX partial presence only. Subject woman is post subject — not NDX.',
      requiredVisualElements: ['phone glow', 'present-day post', 'praise energy', '2016 baddie codes in frame'],
      transitionIn: 'Cold open on phone in dark space',
      transitionOut: 'NDX pause — HOLD ON',
      ndxPresence: 'NDX edge presence — discovers post',
      subjectWomanPresence: 'Present-day post subject — affirmed aesthetic',
      keyframeExtractionRole: 'START',
    }),
    board(2, {
      boardTitle: 'HOLD ON — Profile dive / cultural glitch',
      storyFunction: 'NDX interrupts momentum and scrolls back through years',
      argumentGrammarRole: 'LENS',
      beatNumbers: [3, 4],
      visualDescription:
        'NDX: HOLD ON. Taps the woman\'s profile on the phone. Scrolls all the way back — cinematic cultural glitch through archived years and opinions.',
      continuityNotes: 'Scroll must feel like movement through memory not generic feed UI',
      requiredVisualElements: ['profile tap', 'lime nails', 'year-scroll glitch', 'archive motion'],
      transitionIn: 'From praise flood to investigative interrupt',
      transitionOut: 'Land on 2016 post',
      ndxPresence: 'Hands + silhouette driving scroll',
      subjectWomanPresence: 'Archive target — same identity',
      keyframeExtractionRole: null,
    }),
    board(3, {
      boardTitle: '2016 RECEIPT — Old Instagram negative labels',
      storyFunction: 'Same woman in 2016 with period-authentic capture and negative cultural labels',
      argumentGrammarRole: 'RECEIPT',
      beatNumbers: [5, 6],
      visualDescription:
        '2016 post — old Instagram legible. Same woman, similar outfit. Flash/mirror selfie era grammar. Labels: tacky, basic, overdone.',
      continuityNotes: 'Same woman as present — single identity lock. Not parody.',
      requiredVisualElements: ['2016 IG aesthetic', 'same woman', 'negative labels', 'fashion codes', 'phone archive surface'],
      transitionIn: 'Archive landing from scroll',
      transitionOut: 'Contradiction setup',
      ndxPresence: 'NDX observer at archive landing',
      subjectWomanPresence: '2016 self — full proof subject',
      keyframeExtractionRole: null,
    }),
    board(4, {
      boardTitle: 'CONTRADICTION — Cultural glitch / same woman proof',
      storyFunction: 'Most important dramatic board — same aesthetic, different label across time',
      argumentGrammarRole: 'CONTRADICTION',
      beatNumbers: [7, 8],
      visualDescription:
        'Contradiction undeniable. Same woman / same style reframed across timelines. Memory expands off phone — projected / holographic / dimensional breach. NDX drives structure, not center.',
      continuityNotes: 'Outfit unchanged — labels and reception change. Edit-suite metaphor physical not software.',
      requiredVisualElements: ['side-by-side or overlaid timelines', 'same fashion object', 'dimensional memory lift'],
      transitionIn: 'From 2016 receipt to contradiction peak',
      transitionOut: 'NDX interjection',
      ndxPresence: 'Partial — structures contradiction',
      subjectWomanPresence: 'Proof across both timelines',
      keyframeExtractionRole: 'MID',
    }),
    board(5, {
      boardTitle: 'INTERJECTION / SYNTHESIS — Snap-back hook',
      storyFunction: 'Mandatory thesis + phone glitch snap-back toward Entry 003',
      argumentGrammarRole: 'SYNTHESIS',
      beatNumbers: [9, 10],
      visualDescription:
        'NDX cinematically stitches the contradiction. THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND. Phone cracks / glitches. Snap back to reality. Entry 003 handoff encoded.',
      continuityNotes: 'Not graphic poster — structured previsualization board',
      requiredVisualElements: ['interjection typography', 'phone glitch/crack', 'snap-back', 'handoff energy'],
      transitionIn: 'From contradiction resolution',
      transitionOut: 'Reality resume — Entry 003 hook (not produced)',
      ndxPresence: 'NDX delivers interjection — partial presence',
      subjectWomanPresence: 'Subject woman memory filed / sealed — same-woman proof retained',
      keyframeExtractionRole: 'END',
    }),
  ];
}
