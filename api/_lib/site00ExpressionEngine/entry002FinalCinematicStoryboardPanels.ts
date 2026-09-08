/**
 * Sprint B4.9 — Final cinematic storyboard panel definitions (15 panels).
 */

import type { FinalCinematicStoryboardPanel } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  buildEntry002FinalCinematicStoryboardPanelId,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

function storyboardPanel(
  panelNumber: number,
  fields: Omit<FinalCinematicStoryboardPanel, 'panelId' | 'panelNumber' | 'storagePath' | 'previewUrl'>,
): FinalCinematicStoryboardPanel {
  return {
    panelId: buildEntry002FinalCinematicStoryboardPanelId(
      ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
      panelNumber,
    ),
    panelNumber,
    storagePath: null,
    previewUrl: null,
    ...fields,
  };
}

export function buildEntry002FinalCinematicStoryboardPanels(): FinalCinematicStoryboardPanel[] {
  return [
    storyboardPanel(1, {
      panelTitle: 'Present-day NDX discovery',
      argumentRole: 'CLAIM',
      visualDescription:
        'Over-shoulder partial NDX observes phone. 2026 post visible — subject woman FULL BODY in 2016-coded baddie outfit. Praise accumulating.',
      ndxPresence: 'Over-shoulder silhouette, back of head with high messy bun, partial — never full face reveal',
      subjectWomanPresence: 'Full-body present-day post subject — same woman, black bodycon, choker, bomber language',
      phoneRole: 'Evidence surface — 2026 praised post',
      fashionEvidence: ['black bodycon', 'choker', 'bomber/thigh-high boot language'],
      continuityNotes: ['NDX lime nails on phone edge', 'Subject French-tip nails if hands visible'],
      mandatoryText: null,
    }),
    storyboardPanel(2, {
      panelTitle: '2026 praise accelerating',
      argumentRole: 'CLAIM',
      visualDescription:
        'Closer phone insert. Rapid 2026 praise: 2016 WAS ICONIC / TAKE ME BACK / THIS WAS AN ERA. NDX lime-nailed thumb hovering.',
      ndxPresence: 'Macro hand detail — short lime-green nails only',
      subjectWomanPresence: 'Full-body outfit-led post content on screen',
      phoneRole: 'Live praise surface',
      fashionEvidence: ['same fashion family visible in post'],
      continuityNotes: ['No repeated identical face portrait', 'Full-body dominant'],
      mandatoryText: '2016 WAS ICONIC',
    }),
    storyboardPanel(3, {
      panelTitle: 'Profile entry',
      argumentRole: 'LENS',
      visualDescription:
        'NDX taps profile. Same subject woman grid — varied full-body posts: mirror selfie, standing outfit, nightlife, side angle.',
      ndxPresence: 'Macro hand — lime-nailed tap on profile button',
      subjectWomanPresence: 'Varied full-body grid — same recognizable woman, different poses',
      phoneRole: 'Profile archive entry',
      fashionEvidence: ['bodycon', 'choker', 'bomber', 'boots across varied posts'],
      continuityNotes: ['No identical face pose repeated across grid'],
      mandatoryText: null,
    }),
    storyboardPanel(4, {
      panelTitle: 'Scroll begins',
      argumentRole: 'RECEIPT',
      visualDescription: 'Normal profile scroll behavior starts breaking — UI compression hints.',
      ndxPresence: 'Hand driving scroll — lime nails',
      subjectWomanPresence: 'Archive thumbnails — full-body outfit-led',
      phoneRole: 'Portal opening',
      fashionEvidence: ['archive hints same fashion family'],
      continuityNotes: ['Scroll is memory breach not generic cyberpunk'],
      mandatoryText: null,
    }),
    storyboardPanel(5, {
      panelTitle: 'Temporal acceleration',
      argumentRole: 'RECEIPT',
      visualDescription:
        'Years collapse visually: 2026→2025→2024→2023→2022→2021→2020→2019→2018→2017→2016. Temporal smear, frame skip, RGB separation subtle.',
      ndxPresence: 'Hand accelerating scroll',
      subjectWomanPresence: 'Subject content streaking through years',
      phoneRole: 'Temporal archive tunnel',
      fashionEvidence: ['consistent silhouette through scroll'],
      continuityNotes: ['Not generic cyberpunk glitch art'],
      mandatoryText: null,
    }),
    storyboardPanel(6, {
      panelTitle: '2016 landing',
      argumentRole: 'RECEIPT',
      visualDescription:
        'Older Instagram interface resolves. SAME WOMAN full body — same style family. Mirror selfie / flash / lower polish / mid-2010s capture.',
      ndxPresence: 'Partial observer at edge',
      subjectWomanPresence: 'Full-body 2016 mirror selfie — same face, body, hair identity',
      phoneRole: '2016 old-style IG post',
      fashionEvidence: ['black bodycon', 'choker', 'bomber', 'French-tip nails', 'French-tip pedicure'],
      continuityNotes: ['2016 era-authentic framing', 'Outfit not radically changed from 2026'],
      mandatoryText: null,
    }),
    storyboardPanel(7, {
      panelTitle: 'NDX recognition beat',
      argumentRole: 'LENS',
      visualDescription: 'NDX pauses — HOLD ON energy. Lime-nailed finger over 2016 post. Recognition before tap.',
      ndxPresence: 'Macro lime nail over screen — partial profile shadow optional',
      subjectWomanPresence: '2016 full-body post frozen on screen',
      phoneRole: 'Evidence selection moment',
      fashionEvidence: ['same outfit family as 2026 post'],
      continuityNotes: ['NDX never full protagonist reveal'],
      mandatoryText: null,
    }),
    storyboardPanel(8, {
      panelTitle: 'Tap / first glitch fracture',
      argumentRole: 'CONTRADICTION',
      visualDescription: 'NDX taps 2016 post. Cultural-memory distortion begins — temporal smear, screen depth rupture.',
      ndxPresence: 'Macro lime-nailed tap — hand only, partial presence',
      subjectWomanPresence: '2016 image destabilizing on screen',
      phoneRole: 'Glitch trigger surface',
      fashionEvidence: ['subject image intact during fracture onset'],
      continuityNotes: ['Cultural glitch not sci-fi portal'],
      mandatoryText: null,
    }),
    storyboardPanel(9, {
      panelTitle: 'Memory lifts from phone',
      argumentRole: 'CONTRADICTION',
      visualDescription:
        '2016 full-body image rises dimensionally from phone — physical photograph plane projecting into space.',
      ndxPresence: 'Hands guiding memory extraction — lime nails',
      subjectWomanPresence: 'Subject image leaving screen as tangible memory layer',
      phoneRole: 'Source plane rupture',
      fashionEvidence: ['same 2016 outfit on lifted image'],
      continuityNotes: ['Memory becoming physical — not hologram cliché'],
      mandatoryText: null,
    }),
    storyboardPanel(10, {
      panelTitle: '2016 negative receipts surface',
      argumentRole: 'RECEIPT',
      visualDescription:
        'Negative receipts attach to physicalized memory: TACKY / BASIC / OVERDONE / DOING TOO MUCH / PLAYED OUT.',
      ndxPresence: 'Observer partial — shadow or shoulder',
      subjectWomanPresence: 'Same woman on lifted 2016 memory — full body',
      phoneRole: 'Receipt origin context',
      fashionEvidence: ['unchanged outfit on memory object'],
      continuityNotes: ['Not Comment Graveyard — receipts tied to evidence'],
      mandatoryText: 'TACKY · BASIC · OVERDONE',
    }),
    storyboardPanel(11, {
      panelTitle: 'Contradiction visible',
      argumentRole: 'CONTRADICTION',
      visualDescription:
        'Split visual: 2026 PRAISED vs 2016 MOCKED — same woman, same style family, opposite cultural framing.',
      ndxPresence: 'NDX assembling comparison — hands on light table',
      subjectWomanPresence: 'Same subject in both era framings side-by-side',
      phoneRole: 'Comparison evidence device',
      fashionEvidence: ['black bodycon', 'choker', 'bomber continuity both eras'],
      continuityNotes: ['Label changed — clothes did not'],
      mandatoryText: null,
    }),
    storyboardPanel(12, {
      panelTitle: 'NDX stitches receipts',
      argumentRole: 'SYNTHESIS',
      visualDescription:
        'Edit-suite tactile world: cream date tape, image strips, lime edit marks. NDX aligns 2016 judgment with 2026 praise.',
      ndxPresence: 'Hands stitching evidence — short lime nails, gold ring',
      subjectWomanPresence: 'Subject images as archive prints on light table',
      phoneRole: 'Secondary — phone still present as evidence anchor',
      fashionEvidence: ['fashion continuity visible on prints'],
      continuityNotes: ['Edit suite supports story — does not replace phone narrative'],
      mandatoryText: null,
    }),
    storyboardPanel(13, {
      panelTitle: 'Mandatory interjection',
      argumentRole: 'INTERJECTION',
      visualDescription:
        'Decisive interjection beat. Phone/evidence surface carries weight. NDX partial presence.',
      ndxPresence: 'Partial silhouette or reflection',
      subjectWomanPresence: 'Fashion evidence visible behind interjection',
      phoneRole: 'Interjection surface',
      fashionEvidence: ['bodycon/choker visible in evidence layer'],
      continuityNotes: ['Interjection must land with visual weight'],
      mandatoryText: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
    }),
    storyboardPanel(14, {
      panelTitle: 'Phone crack / signal failure',
      argumentRole: 'HANDOFF',
      visualDescription: 'Phone cracks, signal-breaks, glitches — memory state collapses abruptly.',
      ndxPresence: 'Hand recoiling from device — lime nails',
      subjectWomanPresence: 'Memory layer collapsing',
      phoneRole: 'Cracking interruption surface',
      fashionEvidence: [],
      continuityNotes: ['Interrupted ending — not polished outro'],
      mandatoryText: null,
    }),
    storyboardPanel(15, {
      panelTitle: 'Snap-back to present',
      argumentRole: 'HANDOFF',
      visualDescription:
        'NDX snapped back to present reality. Continuation tension remains — unresolved, abrupt handoff energy.',
      ndxPresence: 'Seated observer or over-shoulder return — partial, mysterious',
      subjectWomanPresence: 'Absent or only on dark phone glow',
      phoneRole: 'Returned present device — damaged/interrupted state',
      fashionEvidence: [],
      continuityNotes: ['Mystery preserved', 'No next-entry invention in frame content'],
      mandatoryText: null,
    }),
  ];
}
