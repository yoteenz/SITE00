/**
 * C1.1 — Generate divergent creative territory candidates (Pass 04).
 */

import type {
  CreativeTerritoryCandidate,
  MinimalCreativeBrief,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { scoreTerritorySimilarityToPriorEntries } from './creativeDirectorDivergenceGate.js';

function baseTerritories(brief: MinimalCreativeBrief): Omit<
  CreativeTerritoryCandidate,
  'similarityToEntry001' | 'similarityToEntry002'
>[] {
  const subjectKey = brief.subject.toLowerCase();
  const isCleanGirl =
    subjectKey.includes('clean girl') ||
    subjectKey.includes('effortless') ||
    subjectKey.includes('beauty');
  const isWellness =
    subjectKey.includes('wellness') ||
    subjectKey.includes('rest') ||
    subjectKey.includes('hustle') ||
    subjectKey.includes('work');

  if (isCleanGirl) {
    return [
      {
        territoryId: 'territory-routine-lab',
        name: 'THE ROUTINE LAB',
        coreIdea: 'Effortless beauty staged as a laboratory where each step adds another receipt.',
        world: 'THE ROUTINE LAB',
        worldFunction: 'Quantifies invisible labor behind minimal aesthetics.',
        artifact: 'STEP COUNTER / PRODUCT LINE RECEIPT',
        artifactFunction: 'Shows step count rising while look stays minimal.',
        ndxRoleCandidate: 'WITNESS',
        subjectRoleCandidate: 'PERFORMER / PROOF',
        narrativeMechanism: 'Routine escalation contradicts effortless claim',
        visualMechanism: 'Counter ticks, products multiply, face stays calm',
        emotionalTemperature: 'Calm vanity → uncomfortable arithmetic',
        revealPotential: 'Same look requires more steps than old glossy era',
        turnPotential: 'Effortless redefined as hidden labor budget',
        interjectionPotential: 'Names the step-count lie',
        payoffPotential: 'Counter resets — next trend already loading',
        formatStrength: 'Reel counter escalation + carousel SKU receipts',
        whyItIsDistinct: 'Labor-quantification world — not nostalgia or broadcast.',
      },
      {
        territoryId: 'territory-shelfie-museum',
        name: 'THE SHELFIE MUSEUM',
        coreIdea: 'Curated minimal shelves as exhibition of restraint that requires excess inventory.',
        world: 'THE SHELFIE MUSEUM',
        worldFunction: 'Museumizes minimalism so excess becomes visible by curation choices.',
        artifact: 'CURATION PLACARD / SKU LIST',
        artifactFunction: 'Placard lists every product removed to achieve the shelf shot.',
        ndxRoleCandidate: 'ARCHIVIST',
        subjectRoleCandidate: 'CURATOR',
        narrativeMechanism: 'What was removed to look effortless',
        visualMechanism: 'White shelves, placards, behind-the-scenes overflow room',
        emotionalTemperature: 'Aesthetic calm → archival embarrassment',
        revealPotential: 'Back room overflow contradicts front shelf',
        turnPotential: 'Minimalism requires maximal sorting',
        interjectionPotential: 'The shelf is a edit not a lifestyle',
        payoffPotential: 'Next exhibit: new routine drop',
        formatStrength: 'Carousel placards + reel reveal',
        whyItIsDistinct: 'Museum grammar applied to beauty — orthogonal to prior Entries.',
      },
      {
        territoryId: 'territory-grwm-clock',
        name: 'THE GRWM CLOCK',
        coreIdea: 'Get-ready-with-me timestamps prove effortless takes longer than it admits.',
        world: 'THE GRWM CLOCK',
        worldFunction: 'Time becomes receipt layer for beauty claims.',
        artifact: 'TIMESTAMP STRIP / DURATION RECEIPT',
        artifactFunction: 'Logs minutes per look while caption says quick routine.',
        ndxRoleCandidate: 'OBSERVER',
        subjectRoleCandidate: 'SUBJECT ON CLOCK',
        narrativeMechanism: 'Duration contradicts caption language',
        visualMechanism: 'Clock overlay, sped-up vs real-time split',
        emotionalTemperature: 'Casual pace → time betrayal',
        revealPotential: 'Quick routine timestamp exceeds old glam prep',
        turnPotential: 'Effortless is a time edit',
        interjectionPotential: 'Calls out duration vs caption',
        payoffPotential: 'Clock rolls to next upload slot',
        formatStrength: 'Reel time-receipt native',
        whyItIsDistinct: 'Temporal receipt world — not phone archive scroll.',
      },
      {
        territoryId: 'territory-ingredient-index',
        name: 'THE INGREDIENT INDEX',
        coreIdea: 'Natural/no-makeup language indexed against ingredient lists and tool counts.',
        world: 'THE INGREDIENT INDEX',
        worldFunction: 'Forensic index cross-references clean language with chemical/tool receipts.',
        artifact: 'INDEX CARD STACK',
        artifactFunction: 'Each card matches a claim word to a product receipt.',
        ndxRoleCandidate: 'DISRUPTOR',
        subjectRoleCandidate: 'INDEXED SUBJECT',
        narrativeMechanism: 'Language index vs material list',
        visualMechanism: 'Card flips, highlight marks, stack height',
        emotionalTemperature: 'Clinical → incriminating',
        revealPotential: 'Natural label maps to long ingredient column',
        turnPotential: 'Clean is a vocabulary not a formula',
        interjectionPotential: 'Index names the mismatch',
        payoffPotential: 'New index entry queued',
        formatStrength: 'Carousel index cards + reel stack',
        whyItIsDistinct: 'Forensic index — not edit suite or TV.',
      },
      {
        territoryId: 'territory-mirror-stages',
        name: 'THE MIRROR STAGES',
        coreIdea: 'Multiple mirror panels show different stages of the same effortless look being constructed.',
        world: 'THE MIRROR STAGES',
        worldFunction: 'Spatially separates public face from construction stages.',
        artifact: 'STAGE MARKER / ROUTINE MAP',
        artifactFunction: 'Maps which mirror stage is allowed on camera.',
        ndxRoleCandidate: 'INTERJECTOR',
        subjectRoleCandidate: 'PERFORMER',
        narrativeMechanism: 'Visible vs hidden construction stages',
        visualMechanism: 'Split mirrors, stage lights, curtain between panels',
        emotionalTemperature: 'Intimate vanity → staged disclosure',
        revealPotential: 'Back mirror shows full routine',
        turnPotential: 'Effortless is front-mirror only',
        interjectionPotential: 'Names the mirror split',
        payoffPotential: 'Curtain closes on back mirror',
        formatStrength: 'Cinematic reel reveal',
        whyItIsDistinct: 'Theater-of-vanity — strong turn without Entry 002 devices.',
      },
    ];
  }

  if (!isWellness) {
    return [
      {
        territoryId: 'territory-argument-lab',
        name: 'THE ARGUMENT LAB',
        coreIdea: 'Culture tests contradictory claims under one roof.',
        world: 'THE ARGUMENT LAB',
        worldFunction: 'Holds competing claims until receipts force resolution.',
        artifact: 'CONTRADICTION LEDGER',
        artifactFunction: 'Surfaces incompatible positions side by side.',
        ndxRoleCandidate: 'WITNESS',
        subjectRoleCandidate: 'CASE STUDY',
        narrativeMechanism: 'Claim vs receipt collision',
        visualMechanism: 'Split-screen evidence panels',
        emotionalTemperature: 'Cool analytical → sharp realization',
        revealPotential: 'Receipts destabilize the opening claim',
        turnPotential: 'Audience realizes both positions cannot coexist',
        interjectionPotential: 'Names the contradiction without explaining it away',
        payoffPotential: 'Ending reframes the opening claim as incomplete',
        formatStrength: 'Reel escalation + carousel receipts',
        whyItIsDistinct: 'Generic argument architecture — not tied to prior Entry surfaces.',
      },
    ];
  }

  return [
    {
      territoryId: 'territory-metrics-wellness-lab',
      name: 'THE METRICS WELLNESS LAB',
      coreIdea: 'Biometric dashboards aestheticize rest while output KPIs keep climbing.',
      world: 'THE METRICS WELLNESS LAB',
      worldFunction: 'Quantifies recovery as performance while hiding labor intensity.',
      artifact: 'RECOVERY SCORE DASHBOARD',
      artifactFunction: 'Makes rest legible as content without stopping production.',
      ndxRoleCandidate: 'WITNESS',
      subjectRoleCandidate: 'EMPLOYEE CASE STUDY',
      narrativeMechanism: 'Metrics contradict lived exhaustion',
      visualMechanism: 'Glowing wellness UI vs dim overtime logs',
      emotionalTemperature: 'Clinical calm masking fatigue',
      revealPotential: 'Dashboard green while hours tell another story',
      turnPotential: 'Rest score peaks as actual sleep debt widens',
      interjectionPotential: 'Names the metric theater',
      payoffPotential: 'Audience sees optimization as the new overwork',
      formatStrength: 'Reel UI contrast + static receipt posts',
      whyItIsDistinct: 'Data/dashboard world — not broadcast, phone portal, or edit suite.',
    },
    {
      territoryId: 'territory-break-room-confessional',
      name: 'THE BREAK ROOM CONFESSIONAL',
      coreIdea: 'Corporate lounge becomes a stage where rest is performed for peers.',
      world: 'THE BREAK ROOM CONFESSIONAL',
      worldFunction: 'Turns private recovery into visible virtue signaling.',
      artifact: 'MICROWAVE TIMER / LUNCH RECEIPT',
      artifactFunction: 'Proof that “break” time is still measured and judged.',
      ndxRoleCandidate: 'OBSERVER',
      subjectRoleCandidate: 'PERFORMER',
      narrativeMechanism: 'Public rest vs private grind',
      visualMechanism: 'Fluorescent break room intimacy',
      emotionalTemperature: 'Awkward comedy → uncomfortable recognition',
      revealPotential: 'Break room posts vs calendar density',
      turnPotential: 'Confession that rest was content, not recovery',
      interjectionPotential: 'Calls out performance of pause',
      payoffPotential: 'Break room silence after the contradiction lands',
      formatStrength: 'Story frames + reel performance beat',
      whyItIsDistinct: 'Workplace interior sociology — no celebrity or nostalgia frame.',
    },
    {
      territoryId: 'territory-sleep-debt-archive',
      name: 'THE SLEEP DEBT ARCHIVE',
      coreIdea: 'A physical archive of unpaid rest where every “self-care Sunday” adds a ledger line.',
      world: 'THE SLEEP DEBT ARCHIVE',
      worldFunction: 'Materializes rest debt as tangible records culture tries to aestheticize away.',
      artifact: 'REST RECEIPT STRIP / TIME-CLOCK ROLL',
      artifactFunction: 'Shows hours logged, hours posted, hours actually recovered.',
      ndxRoleCandidate: 'ARCHIVIST',
      subjectRoleCandidate: 'DEBTOR / CASE STUDY',
      narrativeMechanism: 'Posted rest vs accumulated debt',
      visualMechanism: 'Paper receipts spooling from wellness posts',
      emotionalTemperature: 'Archival dread → lucid anger',
      revealPotential: 'Wellness posts stack while sleep debt column grows',
      turnPotential: 'Same person praised for balance while debt receipt overflows',
      interjectionPotential: 'Rest was invoiced, never forgiven',
      payoffPotential: 'Archive implies culture keeps rolling the debt forward',
      formatStrength: 'Strong reel proof sequence + carousel ledger',
      whyItIsDistinct: 'Tactile archive metaphor — not phone scroll or TV broadcast.',
    },
    {
      territoryId: 'territory-grind-scoreboard',
      name: 'THE GRIND SCOREBOARD',
      coreIdea: 'Gamified productivity arena where rest badges unlock while the scoreboard never stops.',
      world: 'THE GRIND SCOREBOARD',
      worldFunction: 'Gamification makes overwork feel winnable while rest becomes a collectible.',
      artifact: 'STREAK BADGE / LEADERBOARD TILE',
      artifactFunction: 'Rewards visible hustle; hides cumulative cost.',
      ndxRoleCandidate: 'DISRUPTOR',
      subjectRoleCandidate: 'PLAYER',
      narrativeMechanism: 'Achievement language vs bodily cost',
      visualMechanism: 'Arena lighting, score ticks, badge pops',
      emotionalTemperature: 'Adrenaline → hollow victory',
      revealPotential: 'Badge unlocked on zero sleep',
      turnPotential: 'High score coincides with health receipt collapse',
      interjectionPotential: 'You won the game and lost the week',
      payoffPotential: 'Scoreboard resets — cycle continues',
      formatStrength: 'TikTok-native motion + X quote post',
      whyItIsDistinct: 'Sports/gaming grammar applied to labor — orthogonal to prior Entries.',
    },
    {
      territoryId: 'territory-recovery-theater',
      name: 'THE RECOVERY THEATER',
      coreIdea: 'A spa-like stage where rest is lit, filmed, and applauded while production continues backstage.',
      world: 'THE RECOVERY THEATER',
      worldFunction: 'Stages recovery as spectacle without stopping the machine.',
      artifact: 'REST STAGE CURTAIN / WELLNESS SPOTLIGHT',
      artifactFunction: 'Separates performed rest from ongoing labor.',
      ndxRoleCandidate: 'WITNESS',
      subjectRoleCandidate: 'PERFORMER / PROOF',
      narrativeMechanism: 'Front-stage rest vs backstage grind',
      visualMechanism: 'Warm spa light vs cold backstage monitors',
      emotionalTemperature: 'Serene surface → backstage reveal',
      revealPotential: 'Curtain lifts to ongoing deliverables',
      turnPotential: 'Applause for rest while Slack pings continue',
      interjectionPotential: 'The massage was real. The pause wasn’t.',
      payoffPotential: 'Curtain closes — next act is another hustle post',
      formatStrength: 'Cinematic reel turn + story interjection frame',
      whyItIsDistinct: 'Theater/spa staging — strong turn without Entry 001/002 devices.',
    },
  ];
}

export function generateCreativeTerritoryCandidates(brief: MinimalCreativeBrief): CreativeTerritoryCandidate[] {
  const raw = baseTerritories(brief);
  return raw.map((t) => {
    const sim = scoreTerritorySimilarityToPriorEntries(t, brief);
    return {
      ...t,
      similarityToEntry001: sim.entry001,
      similarityToEntry002: sim.entry002,
    };
  });
}
