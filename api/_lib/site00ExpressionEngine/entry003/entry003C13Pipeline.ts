/**
 * C1.3 — Entry 003 cinematic continuity + master film director pipeline.
 */

import {
  ENTRY_003_C13_GATE_ID,
  ENTRY_003_ID,
  ENTRY_003_RECORD_IDS,
  type Entry003C13BootstrapResult,
  type Entry003C13Package,
  type Entry003EvolvedReviewCandidate,
} from '../../../../shared/site00-expression-engine/entry-003/types.js';
import { bootstrapC12Entry003AutonomousCreativeDirector } from './entry003AutonomousPipeline.js';
import { saveEntry003Package } from './entry003Store.js';
import {
  runCinematicContinuityDirector,
  getCinematicContinuityArchitectureStack,
  getCinematicContinuityExtendedOutputs,
} from '../cinematicContinuity/cinematicContinuityDirector.js';
import { runMarketingPackageMasterDirector } from '../marketingPackageMasterDirector/marketingPackageMasterDirector.js';
import { buildChapter01StoryMap } from '../cinematicContinuity/chapterStoryMapBuilder.js';
import { buildChapterStateAfterEntry002 } from '../cinematicContinuity/chapterContinuityBuilder.js';

function buildVisualAuthorityFromConcept(
  winning: import('../../../../shared/site00-expression-engine/chapter-continuity/types.js').DirectorialConcept,
): import('../../../../shared/site00-expression-engine/creative-director/types.js').VisualAuthorityRequirement[] {
  return [
    {
      authorityId: 'auth-e003-front-stage',
      authorityName: 'FRONT-OF-HOUSE EFFORTLESS AESTHETIC',
      whyRequired: 'Establishes performed simplicity before door reveal',
      whatItControls: 'Lighting, wardrobe, mirror framing — public-facing clean girl',
      laterStagesConsume: ['storyboard', 'keyframe', 'reel opening'],
      continuityRiskIfMissing: 'Reveal lacks contrast — labor infrastructure feels unmotivated',
      priority: 'REQUIRED',
    },
    {
      authorityId: 'auth-e003-employee-door',
      authorityName: 'EMPLOYEE-ONLY DOOR + BACK-OF-HOUSE',
      whyRequired: 'Primary cinematic turn — spatial reveal grammar',
      whatItControls: 'Door signage, corridor depth, shift board, steam/light contrast',
      laterStagesConsume: ['storyboard turn beat', 'match cut from phone notification'],
      continuityRiskIfMissing: 'Handoff from Entry 002 feels disconnected',
      priority: 'REQUIRED',
    },
    {
      authorityId: 'auth-e003-shift-receipt',
      authorityName: 'STAFF SHIFT RECEIPT ARTIFACT',
      whyRequired: 'Receipt without product-count literalism — time/labor as evidence',
      whatItControls: 'Schedule typography, appointment blocks, punch-in timestamps',
      laterStagesConsume: ['interjection beat', 'carousel receipt slides'],
      continuityRiskIfMissing: 'Argument collapses to SKU list — Shelfie Museum failure mode',
      priority: 'REQUIRED',
    },
    {
      authorityId: 'auth-e003-phone-bridge',
      authorityName: 'PHONE NOTIFICATION BRIDGE (NON-PRIMARY)',
      whyRequired: 'Series continuity from Entry 002 — artifact bridge not reuse',
      whatItControls: 'Cracked screen, notification UI, autoplay thumbnail — exits frame before door',
      laterStagesConsume: ['opening match', 'handoff QA'],
      continuityRiskIfMissing: 'Entry 003 reads as isolated post',
      priority: 'RECOMMENDED',
    },
  ];
}

function buildFullStorySpine(
  winning: import('../../../../shared/site00-expression-engine/chapter-continuity/types.js').DirectorialConcept,
  interjection: string,
): string {
  return [
    winning.openingImage,
    'NDX follows notification into pristine front-of-house',
    winning.centralReveal,
    winning.turningPoint,
    interjection,
    winning.climaxImage,
    winning.endingImage,
  ].join(' → ');
}

export async function bootstrapC13Entry003CinematicContinuity(): Promise<Entry003C13BootstrapResult> {
  const c12 = await bootstrapC12Entry003AutonomousCreativeDirector();
  const continuity = runCinematicContinuityDirector();
  const extended = getCinematicContinuityExtendedOutputs();
  const masterDirector = runMarketingPackageMasterDirector();
  const winning = extended.winningConcept;
  const topTitle = extended.top3Titles[0]!.title;

  const chapterStoryMap = buildChapter01StoryMap({
    entry003Title: topTitle,
    entry003Question: 'Who gets to look effortless — and who punches in for it?',
    entry003Contradiction: continuity.masterFilmDirectorPass.deeperContradiction,
    entry003World: winning.world,
    entry003Artifact: winning.artifact,
    entry003NdxRole: winning.ndxRole,
    entry003Ending: winning.endingImage,
    entry003Handoff: `↓ ${extended.entry004TeaseSeed.seedLine}`,
    entry004Seed: extended.entry004TeaseSeed,
  });

  const visualAuthorityPlan = buildVisualAuthorityFromConcept(winning);
  const interjection = extended.selectedInterjection;

  const evolvedReview: Entry003EvolvedReviewCandidate = {
    chapterStateBefore: buildChapterStateAfterEntry002(),
    handoffFromEntry002: continuity.selectedHandoff,
    culturalRead:
      'Clean-girl / effortless beauty culture performs natural, maintenance-free identity while hiding appointments, products, treatments, prep, time, and discipline.',
    deeperContradiction: continuity.masterFilmDirectorPass.deeperContradiction,
    directorialConcepts: continuity.masterFilmDirectorPass.concepts,
    winningConcept: winning,
    whyItWins: continuity.masterFilmDirectorPass.whyWinningConceptWins,
    fullStory: buildFullStorySpine(winning, interjection),
    ndxRole: winning.ndxRole,
    subjectRole: winning.subjectRole,
    world: winning.world,
    artifact: winning.artifact,
    turn: winning.turningPoint,
    interjection,
    climaxImage: winning.climaxImage,
    endingImage: winning.endingImage,
    entry004Tease: extended.entry004TeaseSeed,
    visualAuthorityPlan,
    formatImplications: c12.entry003Package.formatImplications,
    selfCritique: [
      'Shelfie Museum superseded — product count no longer primary receipt',
      'step-count supremacy softened — research-sensitive; prefer invisible labor infrastructure',
      'Phone bridges in but is not Entry 003 primary world',
      'Interjection syntax varies from Entry 002 rebrand deadpan',
      'Series continuity STRONG — notification → door handoff',
    ],
  };

  const pkg: Entry003C13Package = {
    ...c12.entry003Package,
    sprint: 'C1.3_CINEMATIC_CONTINUITY_MASTER_DIRECTOR',
    gateId: ENTRY_003_C13_GATE_ID,
    status: 'CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW',
    subjectSelection: {
      ...c12.entry003Package.subjectSelection,
      workingTitle: topTitle,
      thesis: 'WHEN VISIBLE SIMPLICITY HIDES INTENSIFIED LABOR — EFFORTLESS IS A FRONT ENTRANCE',
      whyThisBelongsInChapter01:
        'Escalates chapter from cultural revision (002) to personal maintenance complicity — YOU walk through the employee door.',
    },
    cinematicContinuity: continuity,
    marketingPackageMasterDirector: masterDirector,
    evolvedReview,
    interjectionCandidates: extended.interjectionCandidates,
    titleCandidates: extended.titleCandidates,
    top3Titles: extended.top3Titles,
    chapterStoryMap,
    chapterCohesionQA: continuity.chapterCohesionQA,
    architectureStack: getCinematicContinuityArchitectureStack(),
    shelfieMuseumSuperseded: continuity.masterFilmDirectorPass.shelfieMuseumSuperseded,
    researchClaimsSoftened: true,
    creativeDirectorRun: {
      ...c12.entry003Package.creativeDirectorRun,
      selectedInterjection: interjection,
      winningDirection: {
        ...c12.entry003Package.creativeDirectorRun.winningDirection,
        territoryName: winning.conceptName,
        whyItWins: continuity.masterFilmDirectorPass.whyWinningConceptWins,
      },
      visualAuthorityPlan,
      deeperReframe: {
        ...c12.entry003Package.creativeDirectorRun.deeperReframe,
        deeperInterpretation: continuity.masterFilmDirectorPass.deeperContradiction,
        creativeReframe: continuity.masterFilmDirectorPass.founderChallenge,
      },
    },
    worldRecord: {
      worldName: winning.world,
      worldDescription: winning.oneSentenceFilmIdea,
      worldFunction: winning.worldFunction,
      whyNecessary: 'Spatial reveal makes invisible labor architectural — not product commentary',
      whatWorldPhysicallyDoes: winning.worldFunction,
      whatWorldDoesNotDo: 'Does not count SKUs on a shelf — not Shelfie Museum',
    },
    artifactRecord: {
      artifact: winning.artifact,
      artifactFunction: winning.artifactFunction,
      whyThisObject: 'Shift receipt proves time/labor — robust without fabricated step-count claims',
      howItChangesStory: winning.artifactFunction,
      noPrimaryArtifact: false,
    },
    records: {
      ...c12.entry003Package.records,
      entryStatus: 'CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW',
    },
  };

  saveEntry003Package(pkg);

  return {
    sprint: 'C1.3_CINEMATIC_CONTINUITY_MASTER_DIRECTOR',
    architectureLayer:
      'CHAPTER CONTINUITY → CINEMATIC CONTINUITY DIRECTOR → MASTER FILM DIRECTOR → ENTRY 003 EVOLUTION → FOUNDER REVIEW',
    architectureStack: getCinematicContinuityArchitectureStack(),
    providerDispatchCount: 0,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
    entry003Package: pkg,
    cinematicContinuityDirector: continuity,
    marketingPackageMasterDirector: masterDirector,
    nextAction:
      'FOUNDER REVIEWS THE EVOLVED ENTRY 003 IN THE CONTEXT OF THE ENTIRE CHAPTER 01 STORY ARC',
  };
}

export { ENTRY_003_ID, ENTRY_003_C13_GATE_ID };
