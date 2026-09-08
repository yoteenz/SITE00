/**
 * C1.3 — NDXBOOK adapter for generic campaign narrative system.
 */

import {
  buildEntry001ChapterMapping,
  buildEntry002ChapterMapping,
} from '../chapterEntryMappings.js';
import { CHAPTER_01_ID } from '../chapter01Canon.js';
import { NDXBOOK_PROOF_BRAND_ID } from '../../../../shared/site00-expression-engine/constants.js';
import type {
  CampaignContentUnit,
  CampaignContentUnitFunction,
  CampaignHandoffPlan,
  CampaignMotifSystem,
  CampaignUnitRole,
} from '../../../../shared/site00-expression-engine/campaign-narrative/types.js';
import type {
  EntryFunctionType,
  EntryHandoffPlan,
  EntrySequenceRole,
} from '../../../../shared/site00-expression-engine/chapter-continuity/types.js';
import { buildGenericEscalationPlan } from './campaignNarrativeArcBuilder.js';

const NDX_ENTRY_FUNCTION_MAP: Record<EntryFunctionType, CampaignContentUnitFunction> = {
  OPENING_PROVOCATION: 'OPENING_PROVOCATION',
  FIRST_RECEIPT: 'FIRST_RECEIPT',
  ESCALATION: 'ESCALATION',
  REVERSAL: 'REVERSAL',
  DEEPENING: 'DEEPENING',
  COUNTEREXAMPLE: 'COUNTEREXAMPLE',
  MIRROR: 'MIRROR',
  PAYOFF: 'PAYOFF',
  FALSE_RESOLUTION: 'FALSE_RESOLUTION',
  AFTERSHOCK: 'AFTERSHOCK',
  BRIDGE: 'BRIDGE',
  CHAPTER_CLIMAX: 'CHAPTER_CLIMAX',
  CHAPTER_EXIT: 'CHAPTER_EXIT',
};

export function ndxEntryFunctionToCampaignFunction(entryFn: EntryFunctionType): CampaignContentUnitFunction {
  return NDX_ENTRY_FUNCTION_MAP[entryFn];
}

export function buildNdxbookChapter01CampaignUnits(): CampaignContentUnit[] {
  const e1 = buildEntry001ChapterMapping();
  const e2 = buildEntry002ChapterMapping();
  return [
    {
      unitId: 'entry-001',
      sequenceNumber: 1,
      title: 'WHO TF IS WE?',
      subject: e1.subject,
      unitFunction: 'OPENING_PROVOCATION',
      coreQuestion: e1.contradiction,
      contradiction: e1.contradiction,
      world: e1.world,
      artifact: e1.artifact,
      endingLogic: 'Media/public memory remains unresolved — broadcast shuts off into phone era',
    },
    {
      unitId: 'entry-002',
      sequenceNumber: 2,
      title: 'OH, NOW IT WAS FUN?',
      subject: e2.subject,
      unitFunction: 'DEEPENING',
      coreQuestion: e2.contradiction,
      contradiction: e2.contradiction,
      world: e2.world,
      artifact: e2.artifact,
      endingLogic: 'Phone cracks / glitches / snaps back — forward-facing handoff via device',
    },
  ];
}

export function buildNdxbookEntry001SequenceRole(): EntrySequenceRole {
  const e1 = buildEntry001ChapterMapping();
  return {
    entryId: 'entry-001',
    sequenceNumber: 1,
    chapterId: CHAPTER_01_ID,
    entryFunction: 'OPENING_PROVOCATION',
    whatItInherits: 'Chapter cold open — no prior entry',
    whatItEscalates: 'Collective pronoun accountability vs power asymmetry',
    whatItContradicts: '"We caused this" vs who had power in the system',
    whatItIntroduces: 'Receipt grammar, broadcast interruption world, NDX interjection device',
    whatItResolves: 'Nothing — deliberately unresolved',
    whatItLeavesOpen: 'Who is WE? What does complicity mean when power was unequal?',
    handoffIn: 'Chapter open — no prior handoff',
    handoffOut: 'TV shutoff / phone transition — screen era begins',
    teaserToNext: 'If culture can rewrite memory, what else gets re-edited?',
    artifactCarryover: 'Vintage television → device transition',
    motifCarryover: 'broadcast, screen, archive',
    questionCarryover: 'Can culture admit contradiction without rewriting the record?',
    emotionalCarryover: 'Confrontational unease',
    visualContinuityRules: ['Broadcast grammar', 'No phone-archive scroll yet'],
    differenceFromPrevious: 'N/A — chapter opener',
    differenceFromNextCandidate: 'Investigative vs broadcast; personal device vs collective TV',
  };
}

export function buildNdxbookEntry002SequenceRole(): EntrySequenceRole {
  const e2 = buildEntry002ChapterMapping();
  return {
    entryId: 'entry-002',
    sequenceNumber: 2,
    chapterId: CHAPTER_01_ID,
    entryFunction: 'DEEPENING',
    whatItInherits: 'Screen/broadcast transition from Entry 001; receipt grammar established',
    whatItEscalates: 'Same object, opposite label — memory edit without object change',
    whatItContradicts: e2.contradiction,
    whatItIntroduces: 'Phone as evidence surface; nostalgia edit suite world',
    whatItResolves: 'Proves cultural label can flip without visual evidence changing',
    whatItLeavesOpen: 'What labor or infrastructure hides behind the re-edit?',
    handoffIn: 'Phone wakes from Entry 001 TV shutoff — device continuity',
    handoffOut: 'Phone crack / glitch / snap-back — notification-ready exit',
    teaserToNext: 'Next contradiction may implicate the viewer’s own maintenance rituals',
    artifactCarryover: 'Phone bridges in; razor timeline primary artifact within entry',
    motifCarryover: 'screen, timeline, edit, glitch, receipt',
    questionCarryover: 'What stays hidden when culture performs simplicity?',
    emotionalCarryover: 'Investigative recognition → snap-back disorientation',
    visualContinuityRules: ['Phone may bridge but Entry 003 world must differ', 'No repeat of timeline scrub as primary mechanic'],
    differenceFromPrevious: 'Personal device vs broadcast; revision vs complicity',
    differenceFromNextCandidate: 'Performative/absurd vs investigative; labor infrastructure vs memory edit',
  };
}

export function buildNdxbookEntry002To003HandoffOptions(): EntryHandoffPlan[] {
  return [
    {
      fromEntryId: 'entry-002',
      toEntryId: 'entry-003',
      handoffType: 'NOTIFICATION',
      handoffObject: 'Phone screen',
      handoffImage: 'Push notification: "5-MINUTE ROUTINE" autoplays over cracked screen',
      handoffSound: 'Notification ping → GRWM audio bleed',
      handoffQuestion: 'If the edit just snapped back, why is effortless already loading?',
      handoffAction: 'NDX dismisses notification; camera holds on screen reflection',
      handoffLine: 'SAME PHONE. NEW PERFORMANCE.',
      continuityStrength: 'STRONG',
      narrativeNecessity: 'REQUIRED',
      reuseRisk: 'LOW',
      whyItWorks: 'Device bridges worlds without forcing phone-as-primary-artifact for Entry 003',
      artifactBridgeNotReuse: true,
    },
    {
      fromEntryId: 'entry-002',
      toEntryId: 'entry-003',
      handoffType: 'DEVICE_CONTINUATION',
      handoffObject: 'Phone',
      handoffImage: 'Screen glow reflects off-screen subject before hard cut',
      handoffSound: 'Glitch tail → ambient room tone shift',
      handoffQuestion: 'What appears on the device after the snap-back?',
      handoffAction: 'Autoplay thumbnail expands into new world doorway',
      handoffLine: 'THE FEED RECOVERED FASTER THAN YOU DID.',
      continuityStrength: 'MODERATE',
      narrativeNecessity: 'RECOMMENDED',
      reuseRisk: 'MODERATE',
      whyItWorks: 'Maintains chapter device lineage while allowing new primary artifact',
      artifactBridgeNotReuse: true,
    },
    {
      fromEntryId: 'entry-002',
      toEntryId: 'entry-003',
      handoffType: 'HARD_CONTRAST',
      handoffObject: 'None — deliberate cut',
      handoffImage: 'Black frame after crack; clean girl aesthetic slams in',
      handoffSound: 'Silence → spa ambient',
      handoffQuestion: 'Why does effortless feel inevitable after disorientation?',
      handoffAction: 'Hard contrast cut — series rhythm breath',
      handoffLine: 'NO TRANSITION. THAT IS THE POINT.',
      continuityStrength: 'WEAK',
      narrativeNecessity: 'OPTIONAL',
      reuseRisk: 'LOW',
      whyItWorks: 'Rhythm option if notification handoff feels too on-the-nose',
      artifactBridgeNotReuse: true,
    },
  ];
}

export function selectEntry002To003Handoff(options: EntryHandoffPlan[]): EntryHandoffPlan {
  const strong = options.find((o) => o.continuityStrength === 'STRONG' && o.artifactBridgeNotReuse);
  return strong ?? options[0]!;
}

export function entryHandoffToCampaignHandoff(h: EntryHandoffPlan): CampaignHandoffPlan {
  return { ...h, handoffType: h.handoffType as CampaignHandoffPlan['handoffType'] };
}

export function buildNdxbookChapter01MotifSystem(): CampaignMotifSystem {
  return {
    motifsUsed: ['screen', 'broadcast', 'archive', 'annotation', 'phone', 'timeline', 'reflection', 'crack', 'glitch', 'receipt'],
    motifsRepeated: [],
    motifsRetired: ['broadcast'],
    motifsAvailable: ['maintenance', 'shift schedule', 'employee door', 'wellness language', 'notification'],
    motifRecords: [
      { motif: 'broadcast', firstUsedInUnitId: 'entry-001', meaningAtIntroduction: 'Collective spectatorship', evolutionNotes: 'Retired after TV shutoff', status: 'RETIRED' },
      { motif: 'phone', firstUsedInUnitId: 'entry-002', meaningAtIntroduction: 'Personal evidence surface', evolutionNotes: 'May bridge as notification only in Entry 003', status: 'EVOLVED' },
      { motif: 'glitch', firstUsedInUnitId: 'entry-002', meaningAtIntroduction: 'Snap-back disorientation', evolutionNotes: 'Do not repeat as primary trick in Entry 003', status: 'USED' },
    ],
    repetitionRiskNotes: ['Avoid third consecutive receipt-syntax interjection', 'Glitch cannot be primary turn again'],
  };
}

export function buildNdxbookChapter01Escalation(): ReturnType<typeof buildGenericEscalationPlan> {
  return {
    ...buildGenericEscalationPlan({
      escalationModel: 'Collective complicity → cultural revision → personal maintenance complicity',
      unitIds: ['entry-001', 'entry-002', 'entry-003'],
    }),
    personalToSystemic: false,
    discomfortCurve: 'Systemic media → cultural memory edit → YOU benefit from invisible labor',
    whatEachUnitMustAdd: {
      'entry-001': 'Prove collective language blurs accountability',
      'entry-002': 'Prove labels change without objects changing',
      'entry-003': 'Prove visible simplicity hides intensified labor — implicate viewer maintenance rituals',
    },
    repetitionGuard: 'Contradiction grammar repeats; stakes must move from THEY → CULTURE → YOU.',
  };
}

export function getNdxbookCampaignGrammar(): {
  brandId: string;
  chapterId: string;
  argumentGrammar: string[];
  interjectionBehavior: string;
  receiptLogic: string;
  entryNaming: string;
} {
  return {
    brandId: NDXBOOK_PROOF_BRAND_ID,
    chapterId: CHAPTER_01_ID,
    argumentGrammar: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'INTERJECTION', 'SYNTHESIS'],
    interjectionBehavior: 'NDX names the contradiction — rhetorical variety required across entries',
    receiptLogic: 'NO_FABRICATED_RECEIPTS — pattern-level or verified only',
    entryNaming: 'ENTRY NNN — chapter sequence units',
  };
}

export function entrySequenceRoleToCampaignUnitRole(role: EntrySequenceRole): CampaignUnitRole {
  return {
    unitId: role.entryId,
    sequenceNumber: role.sequenceNumber,
    unitFunction: ndxEntryFunctionToCampaignFunction(role.entryFunction),
    whatItInherits: role.whatItInherits,
    whatItEscalates: role.whatItEscalates,
    whatItContradicts: role.whatItContradicts,
    whatItIntroduces: role.whatItIntroduces,
    whatItResolves: role.whatItResolves,
    whatItLeavesOpen: role.whatItLeavesOpen,
    handoffIn: role.handoffIn,
    handoffOut: role.handoffOut,
    teaserToNext: role.teaserToNext,
    artifactCarryover: role.artifactCarryover,
    motifCarryover: role.motifCarryover,
    questionCarryover: role.questionCarryover,
    emotionalCarryover: role.emotionalCarryover,
    visualContinuityRules: role.visualContinuityRules,
    differenceFromPrevious: role.differenceFromPrevious,
    differenceFromNextCandidate: role.differenceFromNextCandidate,
  };
}
