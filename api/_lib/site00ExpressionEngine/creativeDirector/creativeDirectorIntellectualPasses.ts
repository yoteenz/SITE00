/**
 * C1.1 — Intellectual passes 01–03, 07–13 (deterministic + optional LLM enhancement).
 */

import type {
  CreativeTerritoryCandidate,
  CulturalRead,
  DeeperReframe,
  DirectorialConception,
  InterjectionCandidate,
  MinimalCreativeBrief,
  ObviousVersion,
  PayoffAftershock,
  RoleSynthesis,
  TurningPointRecord,
  VisualAuthorityRequirement,
  WinningCreativeDirection,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';

export function runCulturalReadPass(brief: MinimalCreativeBrief): CulturalRead {
  return {
    surfaceTopic: brief.topic,
    obviousTake: `Culture celebrates ${brief.topic.toLowerCase()} while ignoring contradictory receipts.`,
    underlyingTension: 'Public language about balance conflicts with private metrics of exhaustion.',
    culturalHypocrisy: 'Rest is marketed as virtue while output expectations intensify.',
    emotionalTension: 'Exhaustion dressed as optimization.',
    socialContradiction: brief.thesis,
    uncomfortableTruth: 'The receipt trail shows rest content rising as actual recovery windows shrink.',
    historicalContext: 'Post-pandemic wellness industrial complex + hustle posting normalization.',
    whyItMattersNow: 'Quiet-quitting backlash and productivity theater collide in the feed.',
  };
}

export function runObviousVersionPass(brief: MinimalCreativeBrief): ObviousVersion {
  return {
    categories: [
      'generic montage',
      'before/after post',
      'quote graphic',
      'timeline',
      'comment screenshots',
      'talking-head explainer',
      'comparison collage',
      'wellness tip carousel',
    ],
    summary: `A generic "${brief.topic}" hot take with stock wellness imagery and a caption restating the thesis.`,
    whyWeAreNotMakingThat: 'Obvious version explains the thesis without proving it — no receipt collision, no earned turn.',
  };
}

export function runDeeperReframePass(brief: MinimalCreativeBrief, culturalRead: CulturalRead): DeeperReframe {
  return {
    surfaceTopic: brief.subject,
    deeperInterpretation: culturalRead.uncomfortableTruth,
    creativeReframe: 'Rest became content before it became recovery — culture invoices pause without stopping production.',
    metaphoricalOpportunity: 'Rest receipt / sleep debt archive / staged recovery theater',
    narrativeOpportunity: 'Show posted rest and hidden labor metrics in causal sequence.',
    emotionalOpportunity: 'Move from recognition (“I do this too”) to disbelief (“the receipts cannot both be true”).',
  };
}

export function runRoleSynthesisPass(
  winner: CreativeTerritoryCandidate,
  _brief: MinimalCreativeBrief,
): RoleSynthesis {
  return {
    ndxRole: winner.ndxRoleCandidate,
    ndxRationale: `NDX ${winner.ndxRoleCandidate.toLowerCase()}s the contradiction — frames evidence without becoming the exhausted subject.`,
    subjectRole: winner.subjectRoleCandidate,
    subjectRationale: 'Subject carries measurable proof (hours, posts, badges) — not automatic protagonist.',
    audienceRole: 'Complicit scroller who has praised rest content while ignoring labor receipts.',
    worldRole: winner.worldFunction,
    artifactRole: winner.artifactFunction,
    deviceRole: winner.territoryId.includes('metrics') ? 'WELLNESS APP UI' : null,
  };
}

export function runTurningPointPass(winner: CreativeTerritoryCandidate, brief: MinimalCreativeBrief): TurningPointRecord {
  return {
    meaningBefore: 'Rest content feels aspirational and harmless.',
    turnEvent: `${winner.artifact} reveals ${brief.thesis.toLowerCase()} with side-by-side timestamps.`,
    meaningAfter: 'Rest was documented, not experienced — the contradiction becomes undeniable.',
  };
}

export function runContradictionPass(brief: MinimalCreativeBrief) {
  return {
    positionA: 'I prioritize balance / recovery / self-care (public claim).',
    positionB: 'My output, hours, and availability metrics keep climbing (private receipt).',
    receiptCollision: 'Wellness posts timestamped against overtime logs / sleep debt ledger.',
    whyBothCannotSurvive: 'If rest were real, the receipt column would flatten — it accelerates instead.',
  };
}

export function generateInterjectionCandidates(
  winner: CreativeTerritoryCandidate,
  contradiction: ReturnType<typeof runContradictionPass>,
): InterjectionCandidate[] {
  const lines = [
    'YOU POSTED REST. THE RECEIPT POSTED OVERTIME.',
    'THE BREAK WAS CONTENT. THE GRIND WAS REAL.',
    'WELLNESS SCORE UP. SLEEP DEBT UNCHANGED.',
    'YOU CALLED IT BALANCE. THE HOURS CALLED IT LIE.',
    winner.interjectionPotential.length > 8 ? winner.interjectionPotential.toUpperCase() : 'THE PAUSE WAS STAGED. THE MACHINE WASN\'T.',
  ];
  return lines.map((line) => ({
    line,
    sharpness: line.length < 60 ? 0.9 : 0.75,
    specificity: line.includes('RECEIPT') || line.includes('HOUR') ? 0.92 : 0.8,
    wit: 0.78,
    earnedness: 0.85,
    quotability: 0.88,
    brandVoice: 0.86,
    totalScore: 0.86,
  }));
}

export function selectInterjection(candidates: InterjectionCandidate[]): string {
  return [...candidates].sort((a, b) => b.totalScore - a.totalScore)[0]!.line;
}

export function runPayoffAftershockPass(
  winner: CreativeTerritoryCandidate,
  interjection: string,
  brief: MinimalCreativeBrief,
): PayoffAftershock {
  return {
    visualPayoff: `${winner.world} reveals backstage labor continuing as rest curtain closes.`,
    intellectualPayoff: brief.thesis,
    emotionalPayoff: 'Recognition turns into uncomfortable complicity — audience sees their own feed behavior.',
    aftershock: 'Culture prepares the next wellness post before the receipt cools.',
  };
}

export function runDirectorialConceptionPass(winner: CreativeTerritoryCandidate): DirectorialConception {
  return {
    cameraLanguage: 'Observational wide → invasive receipt close-ups → staged rest tableau',
    pacing: 'Slow confidence in opening claim → accelerating receipt cuts → hard turn hold',
    visualEscalation: 'Wellness aesthetic warmth gives way to cold metric typography',
    spatialLogic: 'Front-stage rest vs backstage production zones in same frame',
    lightingProgression: 'Spa amber → fluorescent truth → single spotlight on artifact',
    transitions: 'Match cuts between posted rest and logged hours',
    soundOpportunity: 'Notification pings under serene wellness audio',
    worldReveal: winner.worldFunction,
    artifactBehavior: winner.artifactFunction,
    performanceBehavior: 'Subject performs rest until receipt forces stillness',
  };
}

export function deriveVisualAuthorityPlan(
  winner: CreativeTerritoryCandidate,
  roles: RoleSynthesis,
): VisualAuthorityRequirement[] {
  const base: VisualAuthorityRequirement[] = [
    {
      authorityId: 'auth-ndx-presence',
      authorityName: 'NDX PRESENCE',
      whyRequired: 'Observer/witness grammar must stay consistent for interjection credibility.',
      whatItControls: 'Framing, hand presence, editorial interjection surfaces',
      laterStagesConsume: ['STORYBOARD', 'KEYFRAMES', 'REEL'],
      continuityRiskIfMissing: 'Interjection reads as disembodied caption — loses NDXBOOK voice.',
      priority: 'REQUIRED',
    },
    {
      authorityId: 'auth-subject-identity',
      authorityName: 'SUBJECT IDENTITY',
      whyRequired: 'Same subject must connect wellness posts to labor receipts.',
      whatItControls: 'Face, posture, exhaustion tells across rest vs grind states',
      laterStagesConsume: ['STORYBOARD', 'REEL', 'CAROUSEL'],
      continuityRiskIfMissing: 'Proof chain breaks — audience cannot track contradiction holder.',
      priority: 'REQUIRED',
    },
    {
      authorityId: 'auth-world-environment',
      authorityName: `${winner.world} ENVIRONMENT`,
      whyRequired: 'World must perform argument — not decorative backdrop.',
      whatItControls: winner.worldFunction,
      laterStagesConsume: ['STORYBOARD', 'KEYFRAMES'],
      continuityRiskIfMissing: 'Metaphor collapses into generic office b-roll.',
      priority: 'REQUIRED',
    },
    {
      authorityId: 'auth-artifact-receipt',
      authorityName: winner.artifact.toUpperCase(),
      whyRequired: 'Artifact holds measurable proof of contradiction.',
      whatItControls: winner.artifactFunction,
      laterStagesConsume: ['STORYBOARD', 'REEL'],
      continuityRiskIfMissing: 'Contradiction becomes assertion without receipt.',
      priority: 'REQUIRED',
    },
  ];

  if (roles.deviceRole) {
    base.push({
      authorityId: 'auth-device-ui',
      authorityName: roles.deviceRole,
      whyRequired: 'Device UI shows public wellness performance vs private metrics.',
      whatItControls: 'Screen content, notification behavior, timestamp legibility',
      laterStagesConsume: ['STORYBOARD', 'CAROUSEL'],
      continuityRiskIfMissing: 'Digital receipt layer becomes ambiguous.',
      priority: 'RECOMMENDED',
    });
  }

  if (winner.visualMechanism.toLowerCase().includes('light')) {
    base.push({
      authorityId: 'auth-lighting-grammar',
      authorityName: 'LIGHTING / TONE SHIFT',
      whyRequired: 'Warm rest aesthetic must contrast cold receipt reveal.',
      whatItControls: 'Color temperature arc across turn',
      laterStagesConsume: ['KEYFRAMES', 'REEL'],
      continuityRiskIfMissing: 'Turn lacks visual semantic shift.',
      priority: 'RECOMMENDED',
    });
  }

  return base;
}

export function buildWinningDirectionRecord(
  direction: WinningCreativeDirection,
  obvious: ObviousVersion,
): WinningCreativeDirection {
  return { ...direction, whyNotObviousVersion: direction.whyNotObviousVersion || obvious.whyWeAreNotMakingThat };
}
