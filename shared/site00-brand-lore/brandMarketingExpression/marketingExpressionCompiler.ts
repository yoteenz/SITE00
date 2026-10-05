/**
 * Compile BrandMarketingExpressionSystem from BrandCharacterSystem authority.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandCharacterSystem } from '../brandCharacterTerritory/types.js';
import type { BrandMarketingExpressionSystem } from './types.js';
import { NDX_PUBLIC_BEHAVIOR_THESIS } from './constants.js';
import { SEED_BEHAVIORAL_MODES } from './behavioralModes.js';
import { DEFAULT_CHANNEL_MODULATIONS } from './channelModulation.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function compileBrandMarketingExpressionSystem(params: {
  characterSystem: BrandCharacterSystem;
  northStarId: string;
  projectId?: string;
}): BrandMarketingExpressionSystem {
  const now = new Date().toISOString();
  const core = params.characterSystem.characterCore;
  const system: BrandMarketingExpressionSystem = {
    id: `bmexp-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId ?? 'ndxbook',
    brandId: 'ndxbook',
    brandCharacterSystemId: params.characterSystem.id,
    version: 1,
    status: 'COMPILED',
    publicBehaviorThesis: NDX_PUBLIC_BEHAVIOR_THESIS,
    marketingRelationshipToAudience:
      'NDX is somebody in the room — "I noticed this too," "Wait," "Remember this?" — intelligence through behavior, not announcement.',
    attentionBehavior: core.whatItNotices ?? 'Notices contradictions before headlines settle.',
    reactionBehavior: params.characterSystem.socialBehavior.statusBehavior ?? 'Side-eye before hot take.',
    investigationBehavior:
      params.characterSystem.intellectualBehavior.curiosityBehavior ?? 'Follows the annoying second question.',
    judgmentBehavior:
      params.characterSystem.artifactRelationship.judgmentEvidence ?? 'Forms opinion when evidence earns it.',
    memoryBehavior:
      params.characterSystem.intellectualBehavior.relationshipToMemory ?? 'Saves receipts because context may change.',
    connectionBehavior: 'Connects Thing A and Thing B through structure.',
    humorBehavior: params.characterSystem.humorSystem.witMechanism ?? 'Contradiction and specificity — optional, never forced.',
    correctionBehavior:
      params.characterSystem.emotionalBehavior.vulnerabilityBoundary ?? 'Preserves old belief while revising — "I was wrong" is native.',
    culturalParticipationBehavior:
      params.characterSystem.culturalIntelligenceSystem.culturalAuthenticityRules ??
      'Inside shared memory, not trend commentary.',
    evidenceBehavior:
      params.characterSystem.artifactRelationship.selectionEvidence ??
      'Evidence appears because thesis requires it — never for editorial decoration.',
    makerBehavior:
      params.characterSystem.artifactRelationship.makerPresence ?? 'Leaves traces of what NDX did to information.',
    contentInitiationRules: [
      'Content begins because SOMETHING HAPPENED — not "create a post about X."',
      'Character Event precedes Marketing Artifact.',
      'Topic is subject matter; character event creates the content.',
    ],
    contentDevelopmentRules: [
      'Investigation may remain unresolved.',
      'Humor is optional; seriousness may suppress humor.',
      'Self-correction preserves previous-claim lineage.',
    ],
    contentResolutionRules: [
      'REACTION_ONLY, QUESTION_OPEN, INVESTIGATION_IN_PROGRESS, PROVISIONAL_CONCLUSION, STRONG_CONCLUSION, SELF_CORRECTION, CALLBACK, UNRESOLVED are all valid.',
      'Never manufacture certainty for engagement.',
    ],
    behavioralModes: SEED_BEHAVIORAL_MODES,
    channelModulationRules: DEFAULT_CHANNEL_MODULATIONS,
    artifactBehaviorRules: [
      'Design must show what NDX did to the information.',
      'Visual interventions require causality records.',
      'Reject HEADLINE + IMAGE + CAPTION + LOGO as default.',
    ],
    visualFreedomContract:
      'Achieve comparable character presence through behaviorally justified expression — not North Star pixel copying. Lime is FOUNDER_PREFERRED_EXPRESSION_CALIBRATION, not final brand color.',
    northStarCalibrationIds: [params.northStarId],
    negativeCalibrationIds: [],
    mustPreserve: [
      'Character presence',
      'Maker presence',
      'Behavioral causality',
      'Judgment visibility',
      'Expressive range across topics',
    ],
    mustNotRequire: [
      'lime green',
      'cream paper',
      'collage',
      'handwriting',
      'receipts',
      'condensed typography',
    ],
    mustNeverBecome: [
      'Social template library',
      'Final visual identity',
      'Topic-to-template pipeline',
      'Campaign-to-asset shortcut',
    ],
    evaluation: { compiledFrom: params.characterSystem.id },
    fingerprint: '',
    createdAt: now,
    updatedAt: now,
  };
  system.fingerprint = fp(system);
  return system;
}

export function marketingExpressionRequiresBrandCharacterSystem(system: BrandCharacterSystem | null): boolean {
  return system !== null && Boolean(system.characterCore?.characterThesis);
}
