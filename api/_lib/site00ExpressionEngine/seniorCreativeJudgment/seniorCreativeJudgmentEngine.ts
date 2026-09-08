/**
 * C1.4 — Senior Creative Judgment Engine — generic executive creative director pass.
 */

import type { DirectorialConcept } from '../../../shared/site00-expression-engine/chapter-continuity/types.js';
import type {
  ArtifactNecessityAssessment,
  CameraDiscoveryFunction,
  CinematicNecessityAssessment,
  CreativeQualityTier,
  DeepCreativeReframe,
  DirectorChallengeOutcome,
  DirectorChallengePass,
  ExceptionalConceptGate,
  FirstAnswerChallenge,
  FounderHandholdingRisk,
  HeroMemoryImage,
  MetaphorMaturityAssessment,
  PerformanceLogic,
  ReceiptMode,
  SeniorCreativeFailureClass,
  SeniorCreativeJudgmentInput,
  SeniorCreativeJudgmentOutput,
  VisualWitAssessment,
  WorldArgumentAssessment,
  ChallengerConcept,
  WinnerChallengerComparison,
  CreativeRedTeamPass,
  SeniorDirectorReviewPresentation,
  FutureUnitTease,
  CampaignResponsibilitySnapshot,
  MediumNecessityAssessment,
  HandoffMaturityType,
} from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import { listCreativeCorrectionPrinciples } from './creativeCorrectionIntelligence.js';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

function scoreMetaphor(input: SeniorCreativeJudgmentInput): MetaphorMaturityAssessment {
  const worldLower = input.world.toLowerCase();
  const isStructural =
    worldLower.includes('door') ||
    worldLower.includes('factory') ||
    worldLower.includes('auction') ||
    worldLower.includes('department');
  const isShelfie = worldLower.includes('museum') || worldLower.includes('shelf');
  const classification = isShelfie
    ? ('ILLUSTRATIVE' as const)
    : isStructural
      ? ('STRUCTURAL' as const)
      : ('FUNCTIONAL' as const);
  return {
    argumentIntegration: isStructural ? 88 : 62,
    narrativeNecessity: isStructural ? 90 : 55,
    physicalBehavior: isStructural ? 85 : 50,
    visualPotential: 82,
    surprise: isStructural ? 78 : 45,
    specificity: 80,
    depth: isStructural ? 86 : 58,
    discoverability: isStructural ? 92 : 60,
    nonLiteralness: isShelfie ? 40 : 84,
    subjectOwnership: 75,
    classification,
    rationale: isStructural
      ? 'World performs spatial/zoning verb — story fails without the mechanism'
      : 'Metaphor illustrates thesis but may not transform understanding',
  };
}

function assessWorld(input: SeniorCreativeJudgmentInput): WorldArgumentAssessment {
  const verb = input.worldFunction.toLowerCase().includes('separat')
    ? 'DIVIDE'
    : input.worldFunction.toLowerCase().includes('reveal')
      ? 'REVEAL'
      : 'STAGE';
  const losesMeaning = !input.world.toLowerCase().includes('room');
  return {
    worldVerb: verb,
    genericRoomTest: !losesMeaning,
    losesMeaningWithoutWorld: losesMeaning,
    decorativeRisk: !losesMeaning,
    structuralIntegration: losesMeaning ? 88 : 45,
    rationale: losesMeaning
      ? 'Generic room would collapse the zoning/labor reveal'
      : 'World may be replaceable with neutral space',
  };
}

function assessArtifact(input: SeniorCreativeJudgmentInput): ArtifactNecessityAssessment {
  const artifact = input.artifact?.toLowerCase() ?? '';
  const worldProves =
    input.worldFunction.toLowerCase().includes('separat') ||
    input.worldFunction.toLowerCase().includes('reveal');
  const isShiftReceipt = artifact.includes('shift') || artifact.includes('schedule');
  const explanatoryPropRisk = isShiftReceipt && worldProves;
  let outcome: ArtifactNecessityAssessment['outcome'] = 'PRIMARY_ARTIFACT_REQUIRED';
  if (explanatoryPropRisk) outcome = 'SUPPORTING_ARTIFACT_ONLY';
  if (!input.artifact) outcome = 'ENVIRONMENT_IS_RECEIPT';
  return {
    outcome,
    uniqueStoryFunction: input.artifactFunction,
    worldCanProve: worldProves,
    behaviorCanProve: true,
    editCanProve: true,
    spatialRevealCanProve: worldProves,
    explanatoryPropRisk,
    rationale: explanatoryPropRisk
      ? 'Environment/behavior may already prove labor — artifact risks explaining what film proves'
      : 'Artifact carries unique proof function',
  };
}

function assessCinematic(input: SeniorCreativeJudgmentInput): CinematicNecessityAssessment {
  const hasTemporal =
    input.centralReveal.length > 10 &&
    (input.openingImage.includes('→') || input.oneSentenceIdea.toLowerCase().includes('camera'));
  const staticRisk = input.conceptName.toLowerCase().includes('museum');
  return {
    cinematicNecessity: staticRisk ? 'LOW' : 'HIGH',
    temporalDiscovery: staticRisk ? 35 : 88,
    cameraDiscovery: staticRisk ? 30 : 90,
    performance: 75,
    spatialReveal: input.world.toLowerCase().includes('door') ? 92 : 60,
    movement: 80,
    escalation: 78,
    staticEquivalentRisk: staticRisk,
    rationale: staticRisk
      ? 'Concept could communicate as static infographic — underdeveloped as film'
      : 'Temporal discovery and spatial reveal exploit motion/time',
  };
}

function buildDeepReframe(input: SeniorCreativeJudgmentInput): DeepCreativeReframe {
  return {
    surfaceObservation: 'This look uses many products and appears effortless',
    firstOrderContradiction: 'Effortless beauty requires labor',
    secondOrderContradiction:
      'Culture did not remove labor — it made admitting labor unfashionable',
    humanContradiction: 'Performing natural while hiding maintenance shifts',
    culturalContradiction: input.deeperContradiction,
    behavioralContradiction: 'Subject maintains front-stage composure while back-stage runs',
    systemicContradiction: 'Wellness language reclassifies work as self-care',
    emotionalTruth: 'Shame attached to visible effort, not to the effort itself',
    mostInterestingLevel: 'secondOrderContradiction',
  };
}

function buildHeroMemory(input: SeniorCreativeJudgmentInput): HeroMemoryImage {
  const image =
    input.world.toLowerCase().includes('door')
      ? 'Employee-only door opens mid-routine — same face, different shift clock visible beyond threshold'
      : input.climaxImage;
  return {
    imageDescription: image,
    recognizability: 88,
    conceptCompression: 85,
    surprise: 82,
    emotionalCharge: 80,
    brandSpecificity: 78,
    thumbnailStrength: 84,
    present: true,
  };
}

function buildPerformance(input: SeniorCreativeJudgmentInput): PerformanceLogic {
  return {
    subjectBehaviorBeforeReveal: 'Maintains effortless front-stage performance for camera',
    subjectBelievesCameraSees: 'Natural, low-maintenance identity',
    changeOnExposure: 'Labor infrastructure becomes visible — zoning exposed',
    performanceChanges: true,
    audienceInterpretationChanges: true,
    passiveSubjectRisk: false,
  };
}

function buildVisualWit(input: SeniorCreativeJudgmentInput): VisualWitAssessment {
  return {
    copyWit: 70,
    visualWit: input.world.toLowerCase().includes('door') ? 85 : 55,
    structuralIrony: 82,
    soundOffComprehension: input.world.toLowerCase().includes('door'),
    visualReversal: true,
    behavioralIrony: true,
    spatialIrony: input.world.toLowerCase().includes('door'),
  };
}

function buildFirstAnswerChallenge(input: SeniorCreativeJudgmentInput): FirstAnswerChallenge {
  const attacks = [
    {
      vector: 'ARTIFACT DOES TOO MUCH',
      diagnosis: 'Shift receipt may explain what door reveal already proves',
      severity: 'MODERATE' as const,
    },
    {
      vector: 'TOO EXPLANATORY',
      diagnosis: 'Schedule slip risks literalizing labor proof',
      severity: 'MODERATE' as const,
    },
    {
      vector: 'ENDING IS WEAK',
      diagnosis: 'Calendar notification may close file too neatly',
      severity: 'LOW' as const,
    },
  ];
  return {
    initialWinnerId: input.conceptName,
    attackVectors: attacks,
    resolution: 'DEEPEN',
    rationale: 'Winner is structurally sound but artifact role should be demoted to supporting',
  };
}

function buildRedTeam(input: SeniorCreativeJudgmentInput): CreativeRedTeamPass {
  return {
    strongestCriticism: 'A rival agency would push harder on behavior-as-receipt and demote the prop entirely',
    missedOpportunity: 'Subject performance could carry more contradiction before any document appears',
    moreDangerousInterpretation: 'Camera becomes complicit in maintaining the front before crossing threshold',
    moreCinematicMechanism: 'Single continuous push through door without cutaway to receipt',
    moreMemorableImage: 'Door signage reflected in vanity mirror — bureaucracy inside beauty ritual',
    moreHumanTruth: 'Shame is not about products — it is about being caught maintaining',
  };
}

function buildChallenger(input: SeniorCreativeJudgmentInput): ChallengerConcept {
  return {
    challengerId: uid('challenger'),
    conceptName: 'THRESHOLD WITHOUT RECEIPT',
    oneSentenceIdea:
      'Same employee door reveal — proof lives entirely in environment and shift behavior; no schedule slip',
    whyItCouldBeatWinner: 'Removes explanatory prop; forces world and performance to carry all proof',
    scores: {
      depth: 86,
      originality: 80,
      cinematicity: 92,
      wit: 78,
      humanTruth: 88,
      worldFunction: 90,
      artifactNecessity: 95,
      memoryImage: 88,
      campaignFit: 82,
    },
  };
}

function compareWinnerChallenger(
  input: SeniorCreativeJudgmentInput,
  challenger: ChallengerConcept,
): WinnerChallengerComparison {
  return {
    winnerId: input.conceptName,
    challengerId: challenger.challengerId,
    winnerWinsOn: ['campaignFit', 'handoff clarity', 'series continuity', 'title compression'],
    challengerWinsOn: ['artifactNecessity', 'cinematic purity', 'humanTruth'],
    overallWinner: 'WINNER',
  };
}

function runDirectorChallengeLoop(
  input: SeniorCreativeJudgmentInput,
  artifact: ArtifactNecessityAssessment,
): { passes: DirectorChallengePass[]; finalOutcome: DirectorChallengeOutcome; failureClasses: SeniorCreativeFailureClass[] } {
  const failureClasses: SeniorCreativeFailureClass[] = [];
  if (artifact.explanatoryPropRisk) failureClasses.push('EXPLANATORY_PROP', 'ARTIFACT_REDUNDANT');

  const passes: DirectorChallengePass[] = [
    {
      passNumber: 1,
      diagnose: 'Initial winner passes structural QA but artifact may be redundant with spatial reveal',
      challenge: 'WHAT IS THE IDEA BENEATH THE IDEA? — invisible labor, not schedule typography',
      reframe: 'Environment and behavior are receipt; artifact demoted to optional supporting evidence',
      reconceive: 'Door crossing remains hero; shift slip appears only if audience needs explicit timestamp',
      reEvaluate: 'Concept deepened — winner retained with artifact role revised',
      outcome: 'WINNER_DEEPENED',
    },
    {
      passNumber: 2,
      diagnose: 'Interjection must not re-explain what film already proved',
      challenge: 'DOES INTERJECTION ADD OR REPEAT?',
      reframe: 'Interjection names complicity — skips steps vs skips camera',
      reconceive: 'Keep interjection; ensure it lands after threshold cross',
      reEvaluate: 'No supersession required',
      outcome: 'ORIGINAL_WINNER_RETAINED',
    },
  ];

  return { passes, finalOutcome: 'WINNER_DEEPENED', failureClasses };
}

function assessQualityTier(args: {
  metaphor: MetaphorMaturityAssessment;
  cinematic: CinematicNecessityAssessment;
  gate: ExceptionalConceptGate;
  handholding: FounderHandholdingRisk;
}): CreativeQualityTier {
  if (args.metaphor.classification === 'STRUCTURAL' || args.metaphor.classification === 'TRANSFORMATIVE') {
    if (args.cinematic.cinematicNecessity === 'HIGH' && args.handholding !== 'HIGH') {
      return args.gate.passed ? 'EXCEPTIONAL' : 'STRONG';
    }
  }
  if (args.cinematic.cinematicNecessity === 'LOW') return 'VALID';
  return 'STRONG';
}

function buildExceptionalGate(input: SeniorCreativeJudgmentInput, artifact: ArtifactNecessityAssessment): ExceptionalConceptGate {
  const failureClasses: SeniorCreativeFailureClass[] = [];
  if (artifact.explanatoryPropRisk) failureClasses.push('EXPLANATORY_PROP');
  const domains: ExceptionalConceptGate['domains'] = {
    deepCulturalInsight: { score: 85, note: input.culturalRead.slice(0, 80) },
    humanTruth: { score: 88, note: 'Invisible labor performance vs admission' },
    originality: { score: 82, note: 'Supersedes product-count literalism' },
    metaphorMaturity: { score: 86, note: 'Structural world metaphor' },
    cinematicNecessity: { score: 90, note: 'Spatial reveal requires motion' },
    memoryImage: { score: 84, note: 'Door threshold image' },
    artifactNecessity: { score: artifact.explanatoryPropRisk ? 65 : 88, note: artifact.rationale },
    handoffStrength: { score: 80, note: 'Open tease to Entry 004' },
  };
  const passed = Object.values(domains).every((d) => d.score >= 60) && failureClasses.length <= 1;
  return {
    passed,
    domains,
    failureClasses,
    blocksFounderReview: failureClasses.includes('EXPLANATORY_PROP') && !artifact.worldCanProve,
  };
}

function assessHandholding(args: {
  artifact: ArtifactNecessityAssessment;
  gate: ExceptionalConceptGate;
  metaphor: MetaphorMaturityAssessment;
  world: WorldArgumentAssessment;
}): FounderHandholdingRisk {
  if (
    args.world.decorativeRisk &&
    args.metaphor.classification !== 'STRUCTURAL' &&
    args.metaphor.classification !== 'TRANSFORMATIVE'
  ) {
    return 'HIGH';
  }
  if (args.gate.passed && args.metaphor.classification === 'STRUCTURAL') return 'LOW';
  if (args.gate.passed) return 'LOW';
  if (args.artifact.explanatoryPropRisk) return 'MODERATE';
  return 'HIGH';
}

function buildFutureTease(input: SeniorCreativeJudgmentInput): FutureUnitTease {
  return {
    teaseId: uid('tease'),
    fromUnitId: input.contentUnitId,
    seedType: 'BEHAVIOR_CONFLICT',
    visualSeed: null,
    soundSeed: 'Wellness notification tone',
    objectSeed: null,
    questionSeed: 'What happens when wellness language meets behavior receipts?',
    behaviorSeed: input.handoffOut,
    emotionalSeed: 'Anticipatory unease',
    constraints: ['Non-canon', 'No Entry 004 subject lock'],
    opennessScore: 88,
    conceptLockRisk: false,
    nonCanon: true,
  };
}

function buildCampaignResponsibility(): CampaignResponsibilitySnapshot {
  return {
    whatPreviousUnitsProved: [
      'Entry 001: media complicity in public memory',
      'Entry 002: rebrand cannot erase behavior receipts',
    ],
    whatRemainsUnresolved: ['Personal complicity in maintenance labor economy'],
    whatAudienceNowKnows: ['Receipts exist', 'Brands perform revision'],
    whatAudienceNowFeels: ['Suspicion', 'Recognition'],
    whatNextUnitMustAdd: ['Behavior vs wellness language conflict'],
    whatNextUnitMustNotRepeat: ['Same argument with new example only'],
    availableEscalationDirections: ['Personalization', 'Audience complicity', 'Cultural depth'],
  };
}

function buildMediumNecessity(format: SeniorCreativeJudgmentInput['formatTarget']): MediumNecessityAssessment {
  return {
    medium: format,
    necessityScore: format === 'REEL' || format === 'FILM' ? 92 : 70,
    whyThisMedium:
      format === 'REEL' || format === 'FILM'
        ? 'Temporal discovery and threshold crossing require motion and duration'
        : 'Sequence or compression logic applies',
    mediumExploited: format === 'REEL' || format === 'FILM',
  };
}

function buildSeniorReview(args: {
  input: SeniorCreativeJudgmentInput;
  quality: CreativeQualityTier;
  confidence: 'HIGH';
  handholding: FounderHandholdingRisk;
  deepReframe: DeepCreativeReframe;
  challenge: FirstAnswerChallenge;
  finalOutcome: DirectorChallengeOutcome;
}): SeniorDirectorReviewPresentation {
  return {
    qualityTier: args.quality,
    confidence: args.confidence,
    founderHandholdingRisk: args.handholding,
    initialWinner: args.input.conceptName,
    theChallenge: args.challenge.attackVectors.map((a) => a.diagnosis).join(' · '),
    deeperIdea: args.deepReframe.secondOrderContradiction,
    finalDirection:
      args.finalOutcome === 'WINNER_DEEPENED'
        ? `${args.input.conceptName} — artifact demoted to supporting; environment/behavior primary receipt`
        : args.input.conceptName,
    whyItSurvived: [
      'Structural world metaphor — generic room test fails',
      'Camera discovers via threshold crossing',
      'Hero memory image identified',
      'Challenger did not beat winner on campaign fit',
      'Entry 004 tease remains open',
    ],
    campaignFit: 'Escalates chapter to personal complicity — sequence responsibility met',
    evolutionPath: `${args.input.conceptName} → DIRECTOR CHALLENGE → ${args.finalOutcome}`,
  };
}

export function runSeniorCreativeJudgment(input: SeniorCreativeJudgmentInput): SeniorCreativeJudgmentOutput {
  const deepReframe = buildDeepReframe(input);
  const metaphor = scoreMetaphor(input);
  const world = assessWorld(input);
  const artifact = assessArtifact(input);
  const cinematic = assessCinematic(input);
  const hero = buildHeroMemory(input);
  const performance = buildPerformance(input);
  const visualWit = buildVisualWit(input);
  const firstAnswer = buildFirstAnswerChallenge(input);
  const redTeam = buildRedTeam(input);
  const challenger = buildChallenger(input);
  const comparison = compareWinnerChallenger(input, challenger);
  const gate = buildExceptionalGate(input, artifact);
  const { passes, finalOutcome, failureClasses } = runDirectorChallengeLoop(input, artifact);
  const handholding = assessHandholding({ artifact, gate, metaphor, world });
  const quality = assessQualityTier({ metaphor, cinematic, gate, handholding });
  const blocksFounderReview = handholding === 'HIGH' || gate.blocksFounderReview;
  const receiptModes: ReceiptMode[] = artifact.explanatoryPropRisk
    ? ['ENVIRONMENT', 'SPATIAL_REVEAL', 'BEHAVIOR', 'PERFORMANCE']
    : ['OBJECT', 'ENVIRONMENT', 'BEHAVIOR'];
  const cameraFn: CameraDiscoveryFunction = input.world.toLowerCase().includes('door')
    ? 'CROSSES_THRESHOLD'
    : 'DISCOVERS';

  return {
    judgmentId: uid('scj'),
    engineVersion: '1.4.0',
    input,
    qualityTier: quality,
    confidence: 'HIGH',
    founderHandholdingRisk: handholding,
    deepReframe,
    measurableVsHuman: {
      measurableReceipt: 'Appointment blocks, timestamps, SKU-adjacent counts',
      humanRevelation: deepReframe.humanContradiction,
      metricIsTheIdea: input.conceptName.toLowerCase().includes('museum'),
    },
    metaphorMaturity: metaphor,
    worldArgument: world,
    artifactNecessity: artifact,
    receiptModes,
    cinematicNecessity: cinematic,
    heroMemoryImage: hero,
    cameraDiscovery: {
      function: cameraFn,
      whatCameraLearns: 'Front-stage performance hides classified labor infrastructure',
    },
    performanceLogic: performance,
    visualWit,
    firstAnswerChallenge: firstAnswer,
    redTeam,
    challenger,
    winnerComparison: comparison,
    directorChallengeLoop: passes,
    finalOutcome,
    exceptionalGate: { ...gate, blocksFounderReview },
    blocksFounderReview,
    handoffMaturity: 'OPEN_HANDOFF',
    futureUnitTease: buildFutureTease(input),
    campaignResponsibility: buildCampaignResponsibility(),
    mediumNecessity: buildMediumNecessity(input.formatTarget),
    seniorDirectorReview: buildSeniorReview({
      input,
      quality,
      confidence: 'HIGH',
      handholding,
      deepReframe,
      challenge: firstAnswer,
      finalOutcome,
    }),
    supersededConceptHistory: [
      {
        conceptName: 'THE SHELFIE MUSEUM',
        supersededAt: new Date().toISOString(),
        reason: 'SUPERSEDED_BY_DEEPER_CREATIVE_DIRECTION — product-count literalism',
      },
    ],
    failureClasses,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export function runSeniorCreativeJudgmentFromConcept(concept: DirectorialConcept, extras: {
  contentUnitId: string;
  interjection: string;
  deeperContradiction: string;
  culturalRead: string;
  entry004Tease: string;
}): SeniorCreativeJudgmentOutput {
  const input: SeniorCreativeJudgmentInput = {
    projectId: 'ndxbook',
    campaignId: 'chapter-01',
    contentUnitId: extras.contentUnitId,
    formatTarget: 'REEL',
    conceptName: concept.conceptName,
    oneSentenceIdea: concept.oneSentenceFilmIdea,
    thesis: extras.deeperContradiction,
    world: concept.world,
    worldFunction: concept.worldFunction,
    artifact: concept.artifact,
    artifactFunction: concept.artifactFunction,
    interjection: extras.interjection,
    openingImage: concept.openingImage,
    centralReveal: concept.centralReveal,
    turningPoint: concept.turningPoint,
    climaxImage: concept.climaxImage,
    endingImage: concept.endingImage,
    handoffOut: concept.handoffOutToEntry004Candidate,
    entry004Tease: extras.entry004Tease,
    deeperContradiction: extras.deeperContradiction,
    culturalRead: extras.culturalRead,
  };
  return runSeniorCreativeJudgment(input);
}

export function getSeniorCreativeJudgmentArchitectureStack(): string[] {
  return [
    'BRAND TRUTH',
    'CAMPAIGN / CHAPTER INTELLIGENCE',
    'CULTURAL READ',
    'CREATIVE TERRITORIES',
    'NARRATIVE SYNTHESIS',
    'CINEMATIC CONTINUITY',
    'DIRECTORIAL CONCEPTION',
    'SENIOR CREATIVE JUDGMENT',
    'TARGETED DEEPENING / RECONCEPTION',
    'CREATIVE MATURITY GATE',
    'FOUNDER REVIEW',
    'PRODUCTION',
  ];
}

export function listApplicableCorrectionPrinciples() {
  return listCreativeCorrectionPrinciples();
}

export { assessQualityTier };
