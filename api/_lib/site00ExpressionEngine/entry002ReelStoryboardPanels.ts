/**
 * Sprint B4.4 — Entry 002 REEL storyboard panel definitions (10 panels).
 */

import type { ReelStoryboardPanel } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import { buildEntry002ReelStoryboardPanelId } from '../../../shared/site00-expression-engine/entry002ReelStoryboardIds.js';

function panel(
  panelNumber: number,
  fields: Omit<
    ReelStoryboardPanel,
    'panelId' | 'panelNumber' | 'storagePath' | 'previewUrl'
  >,
): ReelStoryboardPanel {
  return {
    panelId: buildEntry002ReelStoryboardPanelId(panelNumber),
    panelNumber,
    storagePath: null,
    previewUrl: null,
    ...fields,
  };
}

export function buildEntry002ReelStoryboardPanels(): ReelStoryboardPanel[] {
  return [
    panel(1, {
      argumentBeat: 'CLAIM',
      shotPurpose: 'Present-day nostalgia claim — subject legibility first',
      visualDescription:
        'Phone on black/dark space. Current nostalgia language: 2016 WAS ICONIC. Subject reads immediately as 2016 IG baddie fashion context.',
      characterBehavior: 'Hand with short lime nails holds dark tactile phone; silhouette implied not full portrait',
      phoneRole: 'Evidence device on black — first visual anchor',
      fashionEvidence: ['2016 IG baddie subject implied via typography + phone glow palette'],
      editSuiteBehavior: 'Not yet — pure black void with phone glow only',
      cameraBehavior: 'Static close on phone + hand; black negative space dominant',
      textBehavior: '2016 WAS ICONIC — single controlled line',
      audioFoleyCue: 'Low phone buzz / notification tone into silence',
      transitionToNext: 'Hard cut on glow — archive opens',
      narrativeState: 'CLAIM — present-day nostalgia language stated',
      continuityNotes: 'Black/lime/cream palette; no edit suite yet; no social comment UI',
      keyframeExtractionCandidate: true,
    }),
    panel(2, {
      argumentBeat: 'CLAIM',
      shotPurpose: 'Archive entry — phone becomes portal',
      visualDescription:
        'She interacts with phone. Archived 2016 fashion material opens. Phone functions as portal/evidence device into memory.',
      characterBehavior: 'Thumb swipe / tap; lime nails visible; mid-2010s silhouette when present',
      phoneRole: 'Portal opening — archive evidence layer only',
      fashionEvidence: ['archive thumbnail grid hinting baddie era'],
      editSuiteBehavior: 'Archive UI only — suite world not entered yet',
      cameraBehavior: 'Over-shoulder or POV toward phone screen glow',
      textBehavior: 'Minimal — archive metadata only if needed',
      audioFoleyCue: 'Swipe + soft archive whoosh',
      transitionToNext: 'Zoom/push into fashion memory',
      narrativeState: 'CLAIM deepening — evidence device activated',
      continuityNotes: 'Same phone artifact; same hand/nail continuity',
      keyframeExtractionCandidate: true,
    }),
    panel(3, {
      argumentBeat: 'RECEIPT',
      shotPurpose: 'Fashion memory — period specificity',
      visualDescription:
        'Clear period fashion: choker, bodycon, bomber, overlined lips — curated 2016 IG baddie motifs, not costume parody.',
      characterBehavior: 'Fashion-forward pose or detail crop; character serves fashion evidence',
      phoneRole: 'Frame edge or reflected in screen — secondary',
      fashionEvidence: ['choker', 'bodycon', 'bomber jacket', 'overlined nude lip', 'thigh-high boots optional'],
      editSuiteBehavior: 'None — pure fashion receipt',
      cameraBehavior: 'Medium or detail framing on fashion codes',
      textBehavior: 'None or restrained caption fragment',
      audioFoleyCue: 'Fabric rustle / heel tap / ambient club-adjacent memory',
      transitionToNext: 'Label enters over memory',
      narrativeState: 'RECEIPT — visual fashion evidence mounted',
      continuityNotes: '2016 baddie codes locked; distinct from prior chapter broadcast aesthetic',
      keyframeExtractionCandidate: false,
    }),
    panel(4, {
      argumentBeat: 'RECEIPT',
      shotPurpose: 'Old receipt language — controlled negativity',
      visualDescription:
        'Real-time label enters: TACKY / BASIC / OVERDONE. Controlled typography — not social comment UI.',
      characterBehavior: 'Fashion image persists; character may be cropped out',
      phoneRole: 'Label may originate from phone caption ghost or physical sticker',
      fashionEvidence: ['same fashion image from panel 03'],
      editSuiteBehavior: 'Label typography only — pre-suite',
      cameraBehavior: 'Hold on fashion image with label overlay',
      textBehavior: 'TACKY — single word dominant; BASIC/OVERDONE secondary if needed',
      audioFoleyCue: 'Typewriter tick or label stamp',
      transitionToNext: 'Memory pulled toward edit suite',
      narrativeState: 'RECEIPT — then-language documented',
      continuityNotes: 'Same image as panel 03; label is additive not replacement',
      keyframeExtractionCandidate: false,
    }),
    panel(5, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'Transfer into Nostalgia Edit Suite',
      visualDescription:
        'Memory/image physically pulled out of phone or translated into tactile edit material. Transition into nostalgia edit suite world.',
      characterBehavior: 'Hand pulls timeline strip or lifts image card from phone',
      phoneRole: 'Source plane — image exiting device',
      fashionEvidence: ['same fashion image on emerging strip/card'],
      editSuiteBehavior: 'Edit suite depth reveals — light table, cream tape, lime markers',
      cameraBehavior: 'Pull-back revealing dimensional edit environment',
      textBehavior: 'None during transfer',
      audioFoleyCue: 'Tape peel + dimensional room tone swell',
      transitionToNext: 'Land on physical timeline',
      narrativeState: 'CONTRADICTION setup — world shift to edit suite',
      continuityNotes: 'Phone artifact + fashion image continuity into suite',
      keyframeExtractionCandidate: false,
    }),
    panel(6, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'Same image, opposing labels — contradiction visible',
      visualDescription:
        'Same fashion image on physical timeline. Old label TACKY vs new label ICONIC. Image unchanged — labels conflict.',
      characterBehavior: 'Hands may hold timeline strip at edges; lime nails on edit points',
      phoneRole: 'Peripheral — suite is authority now',
      fashionEvidence: ['unchanged 2016 baddie image on timeline'],
      editSuiteBehavior: 'Dual labels on same frame — timeline strip physical',
      cameraBehavior: 'Top-down or angled on timeline workspace',
      textBehavior: 'TACKY vs ICONIC — side-by-side or stacked',
      audioFoleyCue: 'Dual label tension — low hum',
      transitionToNext: 'Cut action initiated',
      narrativeState: 'CONTRADICTION peak — relabel pressure',
      continuityNotes: 'Image pixel-identical; only labels differ',
      keyframeExtractionCandidate: true,
    }),
    panel(7, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'The cut — old label removed',
      visualDescription:
        'Old label physically removed/spliced. Edit blade, label peel, timeline shift, lime cut mark.',
      characterBehavior: 'Hand operates edit blade or peels label — lime nail accent',
      phoneRole: 'Absent or background prop',
      fashionEvidence: ['same image — label being removed'],
      editSuiteBehavior: 'Active splice — blade, lime cut marker, cream tape',
      cameraBehavior: 'Close on cut action — macro edit detail',
      textBehavior: 'TACKY label peeling away',
      audioFoleyCue: 'Blade slice + tape rip — satisfying cut',
      transitionToNext: 'Reveal reframed memory',
      narrativeState: 'CONTRADICTION resolution in progress',
      continuityNotes: 'Not violent — craft metaphor; lime markers consistent',
      keyframeExtractionCandidate: true,
    }),
    panel(8, {
      argumentBeat: 'CONTRADICTION',
      shotPurpose: 'Reframe — same memory, warmer treatment',
      visualDescription:
        'Same memory now presented as AN ERA / ICONIC / TAKE ME BACK. Visual treatment warmer/romantic without changing fashion image.',
      characterBehavior: 'Optional silhouette appreciating reframed strip',
      phoneRole: 'Resting on light table edge',
      fashionEvidence: ['identical fashion image — grade shift only'],
      editSuiteBehavior: 'Timeline shows ICONIC label filed; warm grade wash',
      cameraBehavior: 'Slow push on reframed strip',
      textBehavior: 'ICONIC or AN ERA — restrained',
      audioFoleyCue: 'Warm pad swell — nostalgia re-edit tone',
      transitionToNext: 'Hold for interjection landing',
      narrativeState: 'CONTRADICTION resolved visually — reframe complete',
      continuityNotes: 'Fashion image unchanged; grade/treatment only',
      keyframeExtractionCandidate: false,
    }),
    panel(9, {
      argumentBeat: 'INTERJECTION',
      shotPurpose: 'NDX observational payoff',
      visualDescription:
        'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND. — observational NDX interjection, not decorative quote.',
      characterBehavior: 'Minimal — text carries beat; optional hand filing card',
      phoneRole: 'Prop on desk — inactive',
      fashionEvidence: ['fashion strip filed in background'],
      editSuiteBehavior: 'Filing action — card slotted into archive drawer',
      cameraBehavior: 'Medium on interjection typography + filing gesture',
      textBehavior: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
      audioFoleyCue: 'Card slide into drawer + punctuation silence',
      transitionToNext: 'Synthesis card',
      narrativeState: 'INTERJECTION — NDX voice lands',
      continuityNotes: 'Not prior chapter broadcast repetition; observational tone',
      keyframeExtractionCandidate: true,
    }),
    panel(10, {
      argumentBeat: 'SYNTHESIS',
      shotPurpose: 'Synthesis + entry filing identity',
      visualDescription:
        'MAYBE CRINGE IS JUST CULTURE BEFORE THE RE-EDIT. Then ENTRY 002 / 2016 IG BADDIE FASHION filing card.',
      characterBehavior: 'Hand files final card — lime nails',
      phoneRole: 'Closed on desk — journey complete',
      fashionEvidence: ['fashion motif on filing card thumbnail'],
      editSuiteBehavior: 'Final filing — drawer close; suite as archive',
      cameraBehavior: 'Wide filing shot narrowing to entry card',
      textBehavior: 'Synthesis line + ENTRY 002 / 2016 IG BADDIE FASHION',
      audioFoleyCue: 'Drawer close + soft resolve tone',
      transitionToNext: 'End — hold on entry card',
      narrativeState: 'SYNTHESIS — entry identity filed',
      continuityNotes: 'Cover annotation authority separate; end card simplified',
      keyframeExtractionCandidate: true,
    }),
  ];
}

export function buildEntry002ReelStoryboardAggregateFields(panels: ReelStoryboardPanel[]) {
  return {
    sceneCount: panels.length,
    sceneOrder: panels.map((p) => p.panelNumber),
    sceneRoles: panels.map((p) => p.shotPurpose),
    sceneDescriptions: panels.map((p) => p.visualDescription),
    visualAction: panels.map((p) => p.visualDescription),
    cameraBehavior: panels.map((p) => p.cameraBehavior),
    characterBehavior: panels.map((p) => p.characterBehavior),
    phoneBehavior: panels.map((p) => p.phoneRole),
    artifactBehavior: panels.map((p) => p.editSuiteBehavior),
    fashionEvidence: panels.flatMap((p) => p.fashionEvidence),
    textBehavior: panels.map((p) => p.textBehavior),
    audioBehavior: panels.map((p) => p.audioFoleyCue),
    transitionBehavior: panels.map((p) => p.transitionToNext),
    narrativeState: panels.map((p) => p.narrativeState),
    continuityNotes: panels.map((p) => p.continuityNotes),
  };
}
