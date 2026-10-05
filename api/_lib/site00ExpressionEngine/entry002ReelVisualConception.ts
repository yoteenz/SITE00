/**
 * Sprint B4.9R3 — Reel-first visual conception before storyboard generation.
 * ONE imagined reel → selected storyboard moments (NOT one beat = one panel).
 */

import type {
  Entry002ReelVisualConception,
  SelectedStoryboardMoment,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID,
  REEL_STORYBOARD_MOMENT_COUNT_TARGET,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import type { FinalCinematicStoryboardPanelManifestEntry } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

const AUTH = {
  ndxPresence: 'NDX-ENTRY-002-PRE-SBA-NDX-PRESENCE-001',
  subjectDualEra: 'NDX-ENTRY-002-PRE-SBA-SUBJECT-DUAL-ERA-001',
  ndxHands: 'NDX-ENTRY-002-PRE-SBA-NDX-HANDS-001',
  subjectFashion: 'NDX-ENTRY-002-PRE-SBA-FASHION-CONTINUITY-001',
  phoneGlitch: 'NDX-ENTRY-002-PRE-SBA-PHONE-GLITCH-001',
} as const;

function moment(
  momentNumber: number,
  momentTitle: string,
  narrativeBeatsCovered: string[],
  seed: Omit<SelectedStoryboardMoment, 'momentId' | 'momentNumber' | 'momentTitle' | 'narrativeBeatsCovered' | 'chronologicalOrder' | 'reorderable'>,
): SelectedStoryboardMoment {
  return {
    momentId: `${ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID}-MOMENT-${String(momentNumber).padStart(2, '0')}`,
    momentNumber,
    momentTitle,
    narrativeBeatsCovered,
    chronologicalOrder: momentNumber,
    reorderable: false,
    ...seed,
  };
}

export function compileEntry002ReelVisualConception(
  narrativeManifest?: FinalCinematicStoryboardPanelManifestEntry[],
): Entry002ReelVisualConception {
  const narrativeBeatCount = narrativeManifest?.length ?? 16;

  const selectedStoryboardMoments: SelectedStoryboardMoment[] = [
    moment(1, 'THE FIND', ['DISCOVERY', 'PRAISE_ARRIVES'], {
      visualDescription:
        'Over NDX shoulder in same dark intimate room. Phone in hand shows 2026 full-body post of subject woman. Praise beginning to accumulate on screen. Same physical environment as opening reality.',
      cameraFraming: 'over-shoulder intimate observer',
      lightingState: 'dark warm-black, subtle phone glow, lime nail accents',
      environmentState: 'same dark room begins — edit suite not yet legible',
    }),
    moment(2, 'WAIT A MINUTE', ['PROFILE_TAP'], {
      visualDescription:
        'Closer angle seconds later. Same room, same NDX position. Lime-nailed thumb hovers. Profile name visible. Recognition posture — not a new scene.',
      cameraFraming: 'close hand insert / partial shoulder',
      lightingState: 'phone glow intensifies slightly on NDX hand',
      environmentState: 'same dark room, same seating/work surface',
    }),
    moment(3, 'THE PROFILE', ['PROFILE_OPEN', 'SCROLL_BEGINS'], {
      visualDescription:
        'Phone/profile dominates foreground. NDX still at edge/shoulder. Same phone, same room. Profile grid: varied full-body posts of SAME woman. Scroll motion begins.',
      cameraFraming: 'phone-forward with NDX partial edge',
      lightingState: 'screen glow beginning to tint environment',
      environmentState: 'same room depth, same table surface',
    }),
    moment(4, 'TIME COLLAPSES', ['TIME_COLLAPSE', 'SCROLL_ACCELERATES'], {
      visualDescription:
        'Same hand, same phone, same room — years streak backward through device. Screen glow changes room. NDX fingers grounded. Frame 03 transforming into Frame 04.',
      cameraFraming: 'kinetic phone insert with observer partial',
      lightingState: 'intermittent temporal glitch light breaks',
      environmentState: 'same room — surreal screen contamination',
    }),
    moment(5, '2016', ['2016_LANDING', 'RECOGNITION'], {
      visualDescription:
        'Temporal movement stops. Older Instagram post — same woman full body, same fashion family, mid-2010s capture. Lime nail hovers. Same room; only phone reality changed.',
      cameraFraming: 'phone insert macro with partial NDX',
      lightingState: 'older IG flash/filter quality on screen',
      environmentState: 'same dark room, 2016 visible only through phone',
    }),
    moment(6, 'THE MEMORY BREAKS THE SCREEN', ['TAP_GLITCH', 'MEMORY_LIFTS'], {
      visualDescription:
        'NDX taps. 2016 photograph physically emerging from phone. Same camera-world. Edit-suite details becoming visible as memory exposes them.',
      cameraFraming: 'medium side observer, shallow depth',
      lightingState: 'warm archival light emerging from extraction',
      environmentState: 'same tabletop — tape/archive fragments becoming legible',
    }),
    moment(7, 'THE RECEIPTS', ['NEGATIVE_RECEIPTS', 'NDX_TAKES_RECEIPT'], {
      visualDescription:
        'Dimensional 2016 memory beside phone. Labels attach: TACKY, BASIC, OVERDONE, DOING TOO MUCH, PLAYED OUT. NDX hand reaches. Nostalgia Edit Suite becoming legible.',
      cameraFraming: 'evidence table angle emerging',
      lightingState: 'light-table underglow, cream tape tones',
      environmentState: 'same work surface — edit suite now partially revealed',
    }),
    moment(8, 'THE STITCH', ['CONTRADICTION_STITCH', 'FULL_CONTRADICTION', 'INTERJECTION'], {
      visualDescription:
        'Climactic tableau. NDX aligns 2016 criticism with 2026 praise. Same woman/same fashion in both evidence states. Cream tape, image strips, lime edit marks. Mandatory line visible: THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
      cameraFraming: 'controlled top-down / medium evidence tableau',
      lightingState: 'edit suite fully legible, dark cinematic tactile',
      environmentState: 'Nostalgia Edit Suite fully revealed — same room mutated',
    }),
    moment(9, 'SNAP BACK', ['SNAP_BACK'], {
      visualDescription:
        'Phone cracks/signal breaks. Evidence collapses. Room loses archival glow. Back to original dark phone-lit reality. Partial NDX freezes. Circular return to Frame 01 environment.',
      cameraFraming: 'abrupt handheld fracture feeling',
      lightingState: 'collapses to opening phone-lit darkness',
      environmentState: 'same environment as FRAME 01 — unresolved ending',
    }),
  ];

  return {
    reelId: 'NDX-ENTRY-002-REEL-TREATMENT-001',
    entryId: 'entry-002',
    visualPremise:
      'ONE continuous cinematic event: NDX in the Nostalgia Edit Suite (initially disguised as dark observer space) uses her phone to investigate one subject woman\'s cultural receipt across 2026 praise and 2016 criticism.',
    physicalWorld:
      'Single dark intimate tactile room with table/work surface, chair, phone, practical amber highlights. Edit-suite elements (cream tape, image strips, lime markers, light-table glow) emerge progressively — never a teleport.',
    startingReality: 'Dark phone-lit observer environment. Edit suite hidden at first.',
    lightingArc:
      'dark warm-black → phone glow intensifies → temporal glitch breaks → archival warm extraction → edit suite underglow → full tactile suite → snap-back to opening darkness',
    cameraLanguage:
      'intimate observational voyeuristic; over-shoulder, close hand inserts, medium side observer, phone POV, slow push-in, shallow rack focus; kinetic during scroll; controlled at contradiction; abrupt fracture at snap-back',
    ndxBehavior:
      'Same physical observer throughout — light-skinned Black woman, high messy 3C bun, dark clothing, short lime nails, partial visibility, one continuous performance',
    subjectBehavior:
      'Exists through phone content and extracted memory only — same woman, same face/body/fashion family; 2016 vs 2026 via capture language not identity drift',
    phoneBehavior: 'Same phone object throughout — entry point, scroll vessel, glitch origin, snap-back anchor',
    temporalProgression:
      '2026 discovery → praise → profile → scroll → time collapse → 2016 landing → tap → extraction → receipts → stitch → snap-back',
    glitchEscalation: 'Screen glow contaminates room; memory physically lifts; environment reveals edit suite',
    editSuiteReveal: 'Gradual — fragments visible from extraction onward, fully legible at stitch climax',
    interjectionTreatment:
      'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND. — integrated into Frame 08 contradiction climax',
    snapBackTreatment: 'Phone fracture returns to Frame 01 environmental reality — circular proof of one reel',
    continuityAnchors: [
      'same dark table/work surface',
      'same phone',
      'same seating position',
      'same practical light source',
      'same background darkness',
      'same NDX clothing',
      'same room depth/palette',
      'edit-suite fragments emerge not teleport',
    ],
    shotFlow: selectedStoryboardMoments.map((m) => m.momentTitle),
    selectedStoryboardMoments,
    authorityRoles: {
      [AUTH.ndxPresence]: 'NDX character + partial visibility authority',
      [AUTH.subjectDualEra]: 'subject identity across 2016/2026 authority',
      [AUTH.ndxHands]: 'NDX hand interaction authority',
      [AUTH.subjectFashion]: 'wardrobe continuity authority',
      [AUTH.phoneGlitch]: 'phone transition/effect authority',
    },
    excludeAuthorityBoardLayouts: true,
  };
}

export function getReelConceptionMomentCount(conception: Entry002ReelVisualConception): number {
  return conception.selectedStoryboardMoments.length;
}

export function assertReelConceptionReady(conception: Entry002ReelVisualConception): void {
  if (conception.selectedStoryboardMoments.length !== REEL_STORYBOARD_MOMENT_COUNT_TARGET) {
    throw new Error(
      `Reel visual conception requires ${REEL_STORYBOARD_MOMENT_COUNT_TARGET} moments, got ${conception.selectedStoryboardMoments.length}`,
    );
  }
  const orders = conception.selectedStoryboardMoments.map((m) => m.chronologicalOrder);
  const sorted = [...orders].sort((a, b) => a - b);
  if (JSON.stringify(orders) !== JSON.stringify(sorted)) {
    throw new Error('Selected storyboard moments must preserve chronological order');
  }
}
