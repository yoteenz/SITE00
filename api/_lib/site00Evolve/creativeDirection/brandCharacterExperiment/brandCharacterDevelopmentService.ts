/**
 * Brand Character Development service — founder-triggered dimensional deepening.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandCharacterFormationRun, BrandCharacterTerritory } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/types.js';
import type {
  BrandCharacterDevelopment,
  BrandCharacterDevelopmentDelta,
} from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/developmentTypes.js';
import { BRAND_CHARACTER_TERRITORY_V1, PROMISING_DEVELOP_JUDGMENTS } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/constants.js';
import { BRAND_CHARACTER_DEVELOPMENT_V1 } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/developmentTypes.js';
import { extractTerritoryDistillation } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/providerSchemaMapping.js';
import { evaluateCharacterProductiveTension } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/productiveTensionEvaluation.js';
import { coerceCharacterPayload } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/characterPayloadNormalization.js';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function nowIso(): string {
  return new Date().toISOString();
}

export function isEligibleForDevelopment(judgment: BrandCharacterTerritory['founderJudgment']): boolean {
  return judgment !== null && (PROMISING_DEVELOP_JUDGMENTS as readonly string[]).includes(judgment);
}

export function buildVitestCharacterDevelopment(params: {
  territory: BrandCharacterTerritory;
  run: BrandCharacterFormationRun;
  founderDelta?: BrandCharacterDevelopmentDelta | null;
}): BrandCharacterDevelopment {
  const distillation = extractTerritoryDistillation(params.territory);
  const sample = coerceCharacterPayload({
    name: params.territory.name,
    core: { characterThesis: distillation.character, characterEssence: distillation.character },
    intellectual: { intelligenceStyle: distillation.intelligence },
    social: { audienceRelationship: distillation.audienceRelationship, conversationalBehavior: distillation.socialEnergy },
    humorWit: { humorLogic: distillation.humor },
    culturalIntelligence: { culturalPosition: distillation.culturalPosition },
    taste: { tasteLogic: distillation.taste },
    artifactRelationship: { makerPresence: distillation.artifactPotential },
    whyItIsNdxbook: distillation.whyThisBrand,
    whatItMustNeverBecome: distillation.mustNeverBecome,
  });
  const core = {
    ...sample.core,
    characterThesis: distillation.character || sample.core.characterThesis,
    characterEssence: distillation.character || sample.core.characterEssence,
    characterContradiction: distillation.coreTension || sample.core.characterContradiction,
    internalTension: distillation.coreTension || sample.core.internalTension,
  };
  const productiveTension = evaluateCharacterProductiveTension(core);

  const id = `bcd-${params.territory.id}-${hash(params.territory.id + (params.founderDelta ? JSON.stringify(params.founderDelta) : ''))}`;

  return {
    id,
    parentTerritoryId: params.territory.id,
    parentTerritoryFingerprint: hash(JSON.stringify(params.territory.name + distillation.character)),
    intelligenceSnapshotFingerprint: params.run.intelligenceSnapshot?.fingerprint ?? 'unknown',
    developmentFingerprint: hash(id + core.characterThesis),
    methodologyVersion: BRAND_CHARACTER_DEVELOPMENT_V1,
    status: 'DEVELOPED',
    founderDevelopmentDelta: params.founderDelta ?? null,
    parentFounderJudgment: params.territory.founderJudgment ?? 'PROMISING_DEVELOP',
    coreCharacter: core,
    intellectualCharacter: sample.intellectual,
    socialCharacter: sample.social,
    emotionalCharacter: sample.emotional,
    humorSystem: {
      ...sample.humorWit,
      humorSource: 'Observational precision',
      humorTarget: 'Institutional pretense',
      humorMechanism: sample.humorWit.witMechanism,
      humorTemperature: sample.humorWit.comedicTemperature,
      timingBehavior: 'Understatement after evidence',
      deadpan: 'Default delivery mode',
      selfAwareness: 'Acknowledges excess without apologizing',
      audienceInclusion: 'Shared recognition humor',
      audienceExclusion: 'Never punches down',
      crueltyBoundary: 'Institutions not individuals',
      seriousnessBoundary: 'No jokes about audience financial pain',
      culturalDependency: 'Humor requires shared context, not reference dropping',
      contextualModulation: 'Reduces heat in high-stakes contexts',
    },
    culturalIntelligence: {
      ...sample.culturalIntelligence,
      culturalMemory: 'Remembers what culture already decided',
      referenceSelection: 'References must change interpretation',
      culturalAssumptions: 'Surfaces unstated consensus',
      subculturalFluency: 'Respects specificity without cosplay',
      generationalFluency: 'Bridges eras through behavior evidence',
      internetFluency: 'Understands meme logic without becoming meme',
      historicalFluency: 'Uses history as behavior evidence',
      highLowCultureMovement: 'High-low fluency without slumming',
      codeSwitchingBehavior: 'Registers shift by context',
      culturalHumor: 'Structural comedy from cultural gaps',
      culturalRestraint: 'Sparse until earned',
      appropriationBoundaries: 'No borrowed pain',
      referenceObsolescence: 'Avoids stale reference as personality',
      trendRelationship: 'Skeptical of trend as identity',
      nostalgiaRelationship: 'Uses past as evidence not costume',
      culturalParticipation: 'Observer-participant',
      culturalObservation: 'Behavior over statement',
      culturalJudgment: 'Judgment through specificity',
    },
    languageCharacter: sample.language,
    tasteCharacter: sample.taste,
    expressiveBehavior: sample.expressiveBehavior,
    artifactBehavior: {
      ...sample.artifactRelationship,
      whatItMarks: 'Claims requiring scrutiny',
      whatItLeavesUntouched: 'Audience dignity',
      whatItCircles: 'Contradictions',
      whatItCrossesOut: 'Vague claims',
      whatItEnlarges: 'Evidence that changes interpretation',
      whatItAnnotates: 'Margin notes as character trace',
      whatItJuxtaposes: 'Official language vs lived behavior',
      whatItCollects: 'Proof that patterns hold',
      whatItPreserves: 'Exceptions that complicate consensus',
      whatItTreatsAsEvidence: 'Behavioral repetition',
      whatItTreatsAsDisposable: 'Performative expertise',
      whatItTreatsAsPrecious: 'Specific observed detail',
    },
    productiveTension,
    allowedRange: [
      'Different emotional temperatures across contexts',
      'Seriousness modulation without character collapse',
    ],
    antiDirections: params.founderDelta?.avoid ?? ['Generic rebel-brand attitude', 'Style-as-character'],
    founderJudgment: null,
    judgmentNote: null,
    providerReceipt: null,
    createdAt: nowIso(),
  };
}

export function developBrandCharacterFromTerritory(params: {
  run: BrandCharacterFormationRun;
  territoryId: string;
  founderDelta?: BrandCharacterDevelopmentDelta | null;
}): BrandCharacterDevelopment {
  const territory = params.run.characters.find((c) => c.id === params.territoryId);
  if (!territory) throw new Error('Character territory not found');
  if (!isEligibleForDevelopment(territory.founderJudgment)) {
    throw new Error('Territory requires LOVE THE CHARACTER or PROMISING — DEVELOP judgment before development');
  }
  const existing = (params.run.developments ?? []).find((d) => d.parentTerritoryId === params.territoryId);
  if (existing) return existing;

  return buildVitestCharacterDevelopment({
    territory,
    run: params.run,
    founderDelta: params.founderDelta ?? null,
  });
}

export function developmentDoesNotMutateTerritory(
  before: BrandCharacterTerritory,
  after: BrandCharacterTerritory,
): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}
