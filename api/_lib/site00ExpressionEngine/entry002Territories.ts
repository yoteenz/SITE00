/**
 * Sprint B1 Phase 1 — ENTRY 002 territory candidates (max 3, no asset generation).
 */

import {
  ENTRY_002_SUBJECT,
  ENTRY_002_THESIS,
  ENTRY_002_TITLE,
  NDXBOOK_PROOF_BRAND_ID,
  NDXBOOK_PROOF_PROJECT_KEY,
} from '../../../shared/site00-expression-engine/constants.js';
import type {
  CreativeEntry,
  Entry002TerritoryBrief,
  Entry002TerritoryCandidate,
} from '../../../shared/site00-expression-engine/types.js';
import type { CreativeConceptTerritoryV2 } from '../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';
import { runConceptCollapseGate } from './conceptCollapseGate.js';
import { compileEntry002Handoff, resolveEntry002Objective } from './entry002Handoff.js';

export const ENTRY_002_TERRITORY_CANDIDATES: Entry002TerritoryCandidate[] = [
  {
    territoryId: 'entry-002-territory-vhs-archive',
    name: 'THE VHS REWIND',
    coreIdea: 'Cultural revision visible through magnetic tape degradation — cringe footage re-watched until it becomes fond memory',
    culturalMechanism: 'TIME → DISTANCE → REPLAY → NOSTALGIA via analog playback ritual',
    world: 'Bedroom archive / late-night rewatch — 2016 ephemera stacked like evidence',
    primaryArtifact: 'VHS camcorder with timestamp burn-in',
    visualGrammar: 'Scan lines, tracking errors, pause-frame zooms, handwritten date labels on tape spines',
    whyFitsEntry002:
      'Shows how physical distance (years + format decay) edits emotional response to the same cultural moment',
    differsFromEntry001:
      'ENTRY 001 = broadcast spectatorship + collective WE; ENTRY 002 = personal replay + individual memory edit',
    differsFromOtherTerritories: [
      'Not UI scroll archaeology (Comment Graveyard)',
      'Not editorial timeline manipulation (Nostalgia Edit Suite)',
    ],
  },
  {
    territoryId: 'entry-002-territory-comment-graveyard',
    name: 'THE COMMENT GRAVEYARD',
    coreIdea: 'Deleted, resurfaced, and reframed social comments as archaeological strata of 2016 cringe',
    culturalMechanism: 'DISTANCE → EDITING → REHABILITATION through comment-section revisionism',
    world: 'Infinite vertical scroll of comment UI — notifications as sediment layers',
    primaryArtifact: 'Stacked notification cards / quote-tweet chains',
    visualGrammar: 'UI typography fragments, reply nesting, timestamp gaps, "edited" markers, ratio reversals',
    whyFitsEntry002:
      'Examines how the same internet that mocked 2016 culture now performs nostalgia in public replies',
    differsFromEntry001:
      'ENTRY 001 = television broadcast + anchor WE language; ENTRY 002 = social feed archaeology + reply behavior',
    differsFromOtherTerritories: [
      'Not analog tape materiality (VHS Rewind)',
      'Not non-linear edit timeline room (Nostalgia Edit Suite)',
    ],
  },
  {
    territoryId: 'entry-002-territory-edit-suite',
    name: 'THE NOSTALGIA EDIT SUITE',
    coreIdea: '2016 cringe rehabilitated through deliberate re-authoring — the edit itself is the nostalgia engine',
    culturalMechanism: 'EDITING → REFRAMING → NOSTALGIA — time rewritten in a cutting room',
    world: 'Non-linear edit bay — timeline lanes as cultural memory lanes',
    primaryArtifact: 'Razor blade on timeline + "2016" label tape',
    visualGrammar: 'Timeline blocks, splice marks, before/after wipe transitions, waveform-as-emotion',
    whyFitsEntry002:
      'Makes the contradiction literal: we did not change the past — we changed the cut of the past',
    differsFromEntry001:
      'ENTRY 001 = live broadcast interruption; ENTRY 002 = post-hoc editorial revision of cultural memory',
    differsFromOtherTerritories: [
      'Not consumer replay ritual (VHS Rewind)',
      'Not comment-section UI (Comment Graveyard)',
    ],
  },
];

function toConceptTerritoryV2(candidate: Entry002TerritoryCandidate): CreativeConceptTerritoryV2 {
  return {
    id: candidate.territoryId,
    conceptName: candidate.name,
    conceptThesis: candidate.coreIdea,
    coreCreativeIdea: candidate.culturalMechanism,
    worldPremiseSeed: candidate.world,
    viewerRole: 'cultural observer noticing revision in real time',
    audienceRelationship: 'complicit in nostalgia rewrite',
    contentMechanism: candidate.culturalMechanism,
    informationBehavior: candidate.visualGrammar,
    emotionalTension: 'cringe vs fondness — same artifact, different year',
    participationLogic: 'audience recognizes their own revision behavior',
    spatialTemporalLogic: candidate.world,
    artifactLogic: candidate.primaryArtifact,
    narrativeLogic: ENTRY_002_THESIS,
    whyThisIsNdxbook: 'NDXBOOK observes cultural contradiction without moralizing',
    whyThisIsAConceptNotDirection: `Distinct mechanism: ${candidate.primaryArtifact} — not cosmetic palette swap`,
    possibleDirectionRange: [{ directionSeed: candidate.visualGrammar, explanation: candidate.whyFitsEntry002 }],
    possibleNativeFormats: ['REEL', 'CAROUSEL', 'STORY', 'X'],
    antiCollapseRules: candidate.differsFromOtherTerritories,
    provenance: 'EXPRESSION_ENGINE_B1_PHASE_1',
    formationReceipt: null,
    conceptVsDirection: null,
    founderJudgment: 'UNREVIEWED',
    judgmentNote: null,
    methodologyVersion: 'CONCEPT_TERRITORY_V2',
    createdAt: new Date().toISOString(),
  };
}

export function compileEntry002TerritoryCandidates(): Entry002TerritoryCandidate[] {
  return [...ENTRY_002_TERRITORY_CANDIDATES];
}

export function runEntry002ConceptCollapseGate(): ReturnType<typeof runConceptCollapseGate> {
  const concepts = ENTRY_002_TERRITORY_CANDIDATES.map(toConceptTerritoryV2);
  return runConceptCollapseGate(concepts);
}

export function compileEntry002TerritoryBrief(): Entry002TerritoryBrief {
  const collapseGate = runEntry002ConceptCollapseGate();
  return {
    entryId: 'entry-002',
    objective: resolveEntry002Objective(),
    candidates: compileEntry002TerritoryCandidates(),
    collapseGate,
    status: 'AWAITING_TERRITORY_JUDGMENT',
    assetsGenerated: 0,
  };
}

export function prepareEntry002ForTerritoryJudgment(): CreativeEntry {
  const handoff = compileEntry002Handoff();
  return {
    ...handoff,
    title: ENTRY_002_TITLE,
    subject: ENTRY_002_SUBJECT,
    status: 'AWAITING_TERRITORY_JUDGMENT',
    territoryId: null,
    worldExpressionId: null,
    generationReceipts: [],
    assetIds: [],
    metadata: {
      territoryBrief: compileEntry002TerritoryBrief(),
      sprint: 'B1_PHASE_1',
      productionDispatch: 'BLOCKED_PENDING_TERRITORY_JUDGMENT',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function entry002TerritoryCountIsMaxThree(): boolean {
  return ENTRY_002_TERRITORY_CANDIDATES.length === 3;
}

export function entry002HasNoGeneratedAssets(): boolean {
  const entry = prepareEntry002ForTerritoryJudgment();
  return entry.generationReceipts.length === 0 && entry.assetIds.length === 0;
}

export function entry002ProductionDispatchBlocked(): boolean {
  const brief = compileEntry002TerritoryBrief();
  return brief.status === 'AWAITING_TERRITORY_JUDGMENT' && !brief.collapseGate.blocking;
}
