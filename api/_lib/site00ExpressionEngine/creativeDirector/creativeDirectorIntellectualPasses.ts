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

function isBeautyBrief(brief: MinimalCreativeBrief): boolean {
  const s = brief.subject.toLowerCase();
  return s.includes('clean girl') || s.includes('effortless') || s.includes('beauty');
}

export function runCulturalReadPass(brief: MinimalCreativeBrief): CulturalRead {
  if (isBeautyBrief(brief)) {
    return {
      surfaceTopic: brief.topic,
      obviousTake: 'Culture treats minimal makeup as morally superior to glossy looks — while hiding the labor both require.',
      underlyingTension: 'Public claim of low-maintenance conflicts with visible routine escalation.',
      culturalHypocrisy: 'Effortless is marketed as authenticity while GRWM receipts multiply.',
      emotionalTension: 'Vanity dressed as restraint.',
      socialContradiction: brief.thesis,
      uncomfortableTruth: 'The receipt trail shows clean-girl routines requiring more steps than the old glossy era they replaced.',
      historicalContext: 'Post-2016 aesthetic shift from full glam to curated minimal — with opposite labor claims.',
      whyItMattersNow: 'Clean-girl peaked alongside routine content — the contradiction is now countable.',
    };
  }

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
  if (isBeautyBrief(brief)) {
    return {
      categories: [
        'before/after skin comparison',
        'product flat lay carousel',
        'GRWM montage',
        'quote graphic',
        'comment collage',
        'side-by-side era comparison',
        'talking-head explainer',
        'routine screenshot stack',
      ],
      summary: `A generic "${brief.topic}" hot take with before/after skin shots and a caption restating effortless superiority.`,
      whyWeAreNotMakingThat: 'Obvious version moralizes aesthetics without proving labor — no step-count receipt, no earned turn.',
    };
  }

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
  if (isBeautyBrief(brief)) {
    return {
      surfaceTopic: brief.subject,
      deeperInterpretation: culturalRead.uncomfortableTruth,
      creativeReframe: 'Effortless became a product category before it became a confession — culture sells restraint while hiding routine architecture.',
      metaphoricalOpportunity: 'Routine lab / shelfie museum / ingredient index / mirror stages',
      narrativeOpportunity: 'Show public minimal face and hidden product/routine receipts in causal sequence.',
      emotionalOpportunity: 'Move from aspiration (“I want that look”) to arithmetic (“that look costs more than glam”).',
    };
  }

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
  brief: MinimalCreativeBrief,
): RoleSynthesis {
  const beauty = isBeautyBrief(brief);
  return {
    ndxRole: winner.ndxRoleCandidate,
    ndxRationale: beauty
      ? `NDX ${winner.ndxRoleCandidate.toLowerCase()}s the contradiction — frames receipt evidence without becoming the vanity subject.`
      : `NDX ${winner.ndxRoleCandidate.toLowerCase()}s the contradiction — frames evidence without becoming the exhausted subject.`,
    subjectRole: winner.subjectRoleCandidate,
    subjectRationale: beauty
      ? 'Subject carries measurable proof (steps, SKUs, timestamps) — not automatic glam protagonist.'
      : 'Subject carries measurable proof (hours, posts, badges) — not automatic protagonist.',
    audienceRole: beauty
      ? 'Complicit scroller who saved clean-girl routines while believing they were low-maintenance.'
      : 'Complicit scroller who has praised rest content while ignoring labor receipts.',
    worldRole: winner.worldFunction,
    artifactRole: winner.artifactFunction,
    deviceRole: winner.territoryId.includes('metrics') ? 'WELLNESS APP UI' : null,
  };
}

export function runTurningPointPass(winner: CreativeTerritoryCandidate, brief: MinimalCreativeBrief): TurningPointRecord {
  if (isBeautyBrief(brief)) {
    return {
      meaningBefore: 'Clean-girl minimalism feels morally lighter than old glossy glam.',
      turnEvent: `${winner.artifact} reveals ${brief.thesis.toLowerCase()} with countable routine receipts.`,
      meaningAfter: 'Effortless was curated, not casual — the contradiction becomes undeniable.',
    };
  }

  return {
    meaningBefore: 'Rest content feels aspirational and harmless.',
    turnEvent: `${winner.artifact} reveals ${brief.thesis.toLowerCase()} with side-by-side timestamps.`,
    meaningAfter: 'Rest was documented, not experienced — the contradiction becomes undeniable.',
  };
}

export function runContradictionPass(brief: MinimalCreativeBrief) {
  if (isBeautyBrief(brief)) {
    return {
      positionA: 'This look is effortless / natural / low-maintenance (public claim).',
      positionB: 'The routine requires more products, steps, and time than the old glossy look (receipt).',
      receiptCollision: 'Step counter / SKU placard / GRWM timestamps against effortless caption language.',
      whyBothCannotSurvive: 'If effortless were true, the receipt column would shrink — it grows instead.',
    };
  }

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
  brief?: MinimalCreativeBrief,
): InterjectionCandidate[] {
  const subjectKey = brief?.subject.toLowerCase() ?? '';
  const isBeauty =
    subjectKey.includes('clean girl') ||
    subjectKey.includes('effortless') ||
    subjectKey.includes('beauty');

  const lines = isBeauty
    ? [
        'YOU CALLED IT EFFORTLESS. THE RECEIPT COUNTED TWELVE STEPS.',
        'MINIMAL FACE. MAXIMAL ROUTINE.',
        'NO-MAKEUP MAKEUP IS STILL MAKEUP WITH A PR STRATEGY.',
        'THE SHELF IS CURATED. THE LABOR IS NOT.',
        'EFFORTLESS IS A TIME EDIT — CHECK THE TIMESTAMP.',
        winner.interjectionPotential.length > 8 ? winner.interjectionPotential.toUpperCase() : 'NATURAL IS A CATEGORY NOT A CONFESSION.',
      ]
    : [
        'YOU POSTED REST. THE RECEIPT POSTED OVERTIME.',
        'THE BREAK WAS CONTENT. THE GRIND WAS REAL.',
        'WELLNESS SCORE UP. SLEEP DEBT UNCHANGED.',
        'YOU CALLED IT BALANCE. THE HOURS CALLED IT LIE.',
        'THE PAUSE WAS STAGED. THE MACHINE WASN\'T.',
        winner.interjectionPotential.length > 8 ? winner.interjectionPotential.toUpperCase() : contradiction.receiptCollision.slice(0, 55).toUpperCase(),
      ];

  return lines.slice(0, 6).map((line) => ({
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
  if (isBeautyBrief(brief)) {
    return {
      visualPayoff: `${winner.world} reveals overflow inventory behind the curated shelf as the placard stack completes.`,
      intellectualPayoff: brief.thesis,
      emotionalPayoff: 'Aspiration turns into arithmetic — audience sees their own saved routines as labor receipts.',
      aftershock: 'Culture queues the next routine drop before the step counter resets.',
    };
  }

  return {
    visualPayoff: `${winner.world} reveals backstage labor continuing as rest curtain closes.`,
    intellectualPayoff: brief.thesis,
    emotionalPayoff: 'Recognition turns into uncomfortable complicity — audience sees their own feed behavior.',
    aftershock: 'Culture prepares the next wellness post before the receipt cools.',
  };
}

export function runDirectorialConceptionPass(
  winner: CreativeTerritoryCandidate,
  brief?: MinimalCreativeBrief,
): DirectorialConception {
  if (brief && isBeautyBrief(brief)) {
    return {
      cameraLanguage: 'Clinical shelf wide → macro product inserts → mirror-stage reveal',
      pacing: 'Calm aesthetic confidence → accelerating SKU/step cuts → hard placard hold',
      visualEscalation: 'Soft minimal warmth gives way to cold inventory typography',
      spatialLogic: 'Front-shelf curation vs back-room overflow in same exhibition frame',
      lightingProgression: 'Bathroom amber → museum white → single spotlight on placard',
      transitions: 'Match cuts between caption language and receipt stack height',
      soundOpportunity: 'Soft vanity ambient under product click/tick SFX',
      worldReveal: winner.worldFunction,
      artifactBehavior: winner.artifactFunction,
      performanceBehavior: 'Subject performs effortless until receipt forces inventory disclosure',
    };
  }

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
      whyRequired: 'Same subject must connect public claim to receipt proof across beats.',
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
