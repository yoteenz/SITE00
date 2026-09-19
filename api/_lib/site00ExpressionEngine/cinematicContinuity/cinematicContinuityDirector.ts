/**
 * C1.3 — Cinematic Continuity Director — sits above individual Entry creative direction.
 */

import type { CinematicContinuityDirectorOutput } from '../../../../shared/site00-expression-engine/chapter-continuity/types.js';
import { CHAPTER_CONTINUITY_VERSION } from '../../../../shared/site00-expression-engine/chapter-continuity/types.js';
import {
  buildChapter01NarrativeContinuity,
  buildEntry003NarrativeResponsibility,
} from './chapterContinuityBuilder.js';
import {
  runMasterFilmDirectorPass,
  generateEntry003InterjectionCandidates,
  selectEntry003Interjection,
  generateEntry003TitleCandidates,
  selectTop3Titles,
} from './entry003MasterFilmDirectorPass.js';
import { buildChapter01StoryMap, buildEntry004TeaseSeed } from './chapterStoryMapBuilder.js';
import {
  buildNdxbookEntry002To003HandoffOptions,
  selectEntry002To003Handoff,
  buildNdxbookChapter01MotifSystem,
  buildNdxbookChapter01Escalation,
  buildNdxbookChapter01CampaignUnits,
  entrySequenceRoleToCampaignUnitRole,
  buildNdxbookEntry001SequenceRole,
  buildNdxbookEntry002SequenceRole,
  entryHandoffToCampaignHandoff,
} from '../campaignNarrative/ndxbookCampaignNarrativeAdapter.js';
import { runCampaignNarrativeCohesionQA } from '../campaignNarrative/campaignCohesionQA.js';
import { buildCampaignContentSequence } from '../campaignNarrative/campaignNarrativeArcBuilder.js';

export function runCinematicContinuityDirector(): CinematicContinuityDirectorOutput {
  const chapterContinuity = buildChapter01NarrativeContinuity();
  const entry003Responsibility = buildEntry003NarrativeResponsibility();
  const handoffOptions = buildNdxbookEntry002To003HandoffOptions();
  const selectedHandoff = selectEntry002To003Handoff(handoffOptions);
  const masterFilmDirectorPass = runMasterFilmDirectorPass();
  const winning = masterFilmDirectorPass.concepts.find(
    (c) => c.conceptName === masterFilmDirectorPass.winningConceptId,
  )!;

  const interjectionCandidates = generateEntry003InterjectionCandidates();
  const titleCandidates = generateEntry003TitleCandidates();
  const top3Titles = selectTop3Titles(titleCandidates);
  const entry004Seed = buildEntry004TeaseSeed(winning);

  const chapterStoryMap = buildChapter01StoryMap({
    entry003Title: top3Titles[0]!.title,
    entry003Question: 'Who gets to look effortless — and who punches in for it?',
    entry003Contradiction: masterFilmDirectorPass.deeperContradiction,
    entry003World: winning.world,
    entry003Artifact: winning.artifact,
    entry003NdxRole: winning.ndxRole,
    entry003Ending: winning.endingImage,
    entry003Handoff: `↓ ${entry004Seed.seedLine}`,
    entry004Seed,
  });

  const artifactBridgeLogic =
    'Phone from Entry 002 = EXIT DEVICE / bridge only. Entry 003 opens via notification → employee door → new primary artifact STAFF SHIFT RECEIPT. ARTIFACT_BRIDGE ≠ ARTIFACT_REUSE.';

  const e1Role = buildNdxbookEntry001SequenceRole();
  const e2Role = buildNdxbookEntry002SequenceRole();
  const units = [
    ...buildNdxbookChapter01CampaignUnits(),
    {
      unitId: 'entry-003',
      sequenceNumber: 3,
      title: top3Titles[0]!.title,
      subject: 'CLEAN GIRL / EFFORTLESS BEAUTY',
      unitFunction: 'ESCALATION' as const,
      coreQuestion: entry003Responsibility.whatEntryMustAdd,
      contradiction: masterFilmDirectorPass.deeperContradiction,
      world: winning.world,
      artifact: winning.artifact,
      endingLogic: winning.endingImage,
      nonCanon: true,
    },
  ];

  const sequence = buildCampaignContentSequence({
    campaignId: 'ndxbook-chapter-01',
    units,
    unitRoles: [entrySequenceRoleToCampaignUnitRole(e1Role), entrySequenceRoleToCampaignUnitRole(e2Role)],
  });

  const cohesionQA = runCampaignNarrativeCohesionQA({
    campaignId: 'ndxbook-chapter-01',
    sequence,
    handoffs: [entryHandoffToCampaignHandoff(selectedHandoff)],
    escalation: buildNdxbookChapter01Escalation(),
    motifSystem: buildNdxbookChapter01MotifSystem(),
  });

  return {
    directorId: `CCD-CH01-${Date.now()}`,
    layer: 'CINEMATIC_CONTINUITY_DIRECTOR',
    chapterContinuity,
    chapterStoryMap,
    entry003Responsibility,
    selectedHandoff,
    handoffOptions,
    artifactBridgeLogic,
    masterFilmDirectorPass,
    chapterCohesionQA: cohesionQA,
    version: CHAPTER_CONTINUITY_VERSION,
  };
}

export function getCinematicContinuityExtendedOutputs() {
  const masterFilmDirectorPass = runMasterFilmDirectorPass();
  const winning = masterFilmDirectorPass.concepts.find(
    (c) => c.conceptName === masterFilmDirectorPass.winningConceptId,
  )!;
  const interjectionCandidates = generateEntry003InterjectionCandidates();
  const titleCandidates = generateEntry003TitleCandidates();
  return {
    interjectionCandidates,
    titleCandidates,
    top3Titles: selectTop3Titles(titleCandidates),
    selectedInterjection: selectEntry003Interjection(interjectionCandidates),
    entry004TeaseSeed: buildEntry004TeaseSeed(winning),
    winningConcept: winning,
  };
}

export function getCinematicContinuityArchitectureStack(): string[] {
  return [
    'BRAND TRUTH',
    '→ CAMPAIGN THESIS',
    '→ CHAPTER / ACT STRUCTURE',
    '→ ENTRY DISCOVERY',
    '→ CREATIVE DIRECTOR',
    '→ NARRATIVE SYNTHESIS',
    '→ CINEMATIC CONTINUITY DIRECTOR',
    '→ DIRECTORIAL TREATMENT',
    '→ VISUAL AUTHORITY PLAN',
    '→ PRODUCTION INTELLIGENCE',
  ];
}
