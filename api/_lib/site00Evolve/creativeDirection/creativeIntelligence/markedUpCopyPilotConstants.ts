/**
 * Locked pilot constants — THE MARKED-UP COPY single-board production.
 */

import type { BoardArtDirectionSpec, BoardReferenceDecomposition } from './creativeDirectionBoardTypes.js';

export const MARKED_UP_COPY_LOCKED = {
  directionName: 'THE MARKED-UP COPY',
  bigIdea:
    'Every post arrives as though it has already passed through the hands of someone who knew more than you — circled, underlined, flagged, and passed along. The world is a document in active annotation. NDX BOOK doesn\'t publish clean takes; it publishes the working draft with all the margin arguments still visible. Readers don\'t receive information — they inherit it.',
  thesis: 'SOMEONE ALREADY READ THIS. THEY LEFT NOTES.',
  governingBehavior:
    'Content behaves like a document mid-edit: things are crossed out and replaced in real time, emphasis is added after the fact, secondary opinions interrupt the primary voice. The mark-up is the editorial voice — not decoration but evidence of thinking happening out loud. Every piece of content implies a prior reader who cared enough to react.',
  coreBehavior: 'LIVE EDITORIAL REVISION',
} as const;

export const MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS: BoardReferenceDecomposition[] = [
  {
    referenceId: 'ref-editorial-spread-modern',
    label: 'Contemporary independent magazine editorial spread',
    borrow: {
      composition: [
        'asymmetric page balance with dominant photographic column',
        'dense headline zone vs quiet margin',
        'overlap between image bleed and type column',
        'intentional negative space for annotation',
      ],
      material: [
        'matte coated paper',
        'subtle print grain',
        'clean page edge',
        'editor tape fragment at corner',
      ],
      typography: [
        'large display serif/sans contrast',
        'scale jump between headline and body',
        'editorial interruption via replacement line',
      ],
      graphicGrammar: [
        'strike-through as structural device',
        'replacement block taped over claim',
        'margin arrow connecting dispute to evidence',
        'red editor mark vs blue-black primary ink',
      ],
      photography: [
        'documentary editorial crop',
        'controlled grain',
        'subject partially cropped at frame edge',
        'no stock-smile portrait energy',
      ],
    },
    doNotBorrow: [
      'exact third-party headlines',
      'protected logos',
      'literal page reproduction',
      'vintage manuscript yellowing',
    ],
  },
  {
    referenceId: 'ref-live-revision-behavior',
    label: 'Founder manual Editorial direction — live revision behavior',
    borrow: {
      composition: [
        'primary claim interrupted mid-sentence',
        'secondary note breaking grid from margin',
        'visual hierarchy that reads argument before polish',
      ],
      material: ['fresh white editorial paper', 'ink stroke weight variation', 'tape shadow on replacement strip'],
      typography: [
        'exact replacement copy in code-native layer',
        'strike-through on original claim',
        'margin note in contrasting weight',
      ],
      graphicGrammar: [
        'cross-out → replacement → counter-note sequence',
        'visual punctuation via editor marks',
        'issue/page identifier rhythm',
      ],
      photography: ['hero zone reserved for editorial feature crop with annotation-safe quiet zone'],
    },
    doNotBorrow: ['passive pre-read annotation aesthetic (Annotated Copy territory)', 'scrapbook collage grid'],
  },
];

export function buildMarkedUpCopyArtDirectionSpec(): BoardArtDirectionSpec {
  return {
    boardStory:
      'A contemporary editorial spread caught mid-argument — the page is still being decided in public. Clean publication architecture violated by live editorial friction.',
    firstRead: 'Dominant editorial photograph + oversized headline with visible strike-through and replacement.',
    secondRead: 'Margin argument, taped replacement block, and editor marks revealing the editorial voice.',
    editorialTension: 'Center-left typographic interruption — original claim crossed out, replacement pasted, counter-note in margin.',
    quietZone: 'Upper-right and lower-left breathing room — matte paper field without clutter.',
    signatureMoment: 'Live cross-out → replacement → margin rebuttal visible in one glance.',
    boardStructure: {
      heroEditorialSpread: 'Full-bleed contemporary magazine spread — photographic feature with annotation-safe zones.',
      primaryRevisionArtifact: 'Hybrid page fragment — FAL paper substrate + code-native strike/replace/copy.',
      supportingPhotography: 'Secondary documentary crop — editorial evidence, not hero duplicate.',
      physicalEditorObject: 'Isolated pen/marker or editor tape — tactile proof of live revision.',
      typographicInterruption: 'Code-native headline, strike-through, replacement, margin note, issue ID.',
      socialExpression: 'Social-native post frame showing claim under active editorial reaction.',
      motionSeedStrip: 'Five-frame sequence: clean → strike → replace → margin interrupt → final annotated state.',
    },
    antiGenericConstraints: [
      'NO stock-photo aesthetic',
      'NO generic corporate workspace',
      'NO laptop hero',
      'NO smiling business people',
      'NO scrapbook or antique manuscript',
      'NO moodboard grid',
      'NO SaaS dashboard',
      'NO baked-in FAL text or logos',
    ],
    referenceInfluence: MARKED_UP_COPY_REFERENCE_DECOMPOSITIONS.flatMap((r) => [
      ...r.borrow.composition.slice(0, 1),
      ...r.borrow.graphicGrammar.slice(0, 1),
    ]),
  };
}
