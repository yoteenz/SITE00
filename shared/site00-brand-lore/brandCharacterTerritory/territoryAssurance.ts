/**
 * NDXBOOK territory assurance records — evaluation evidence only, no founder judgments.
 */

import type { BrandCharacterTerritory } from './types.js';
import { evaluateArchetypeCollapse } from './archetypeCollapseEvaluation.js';
import { extractTerritoryDistillation } from './providerSchemaMapping.js';
import { auditTerritoryForensics } from './forensicAudit.js';
import type { BrandCharacterFormationRun } from './types.js';

export type TerritoryStrength = 'STRONG' | 'PROMISING' | 'UNDERDEVELOPED' | 'GENERIC_COLLAPSE' | 'NOT_EVALUATED';
export type ArchetypeRisk = 'LOW' | 'MEDIUM' | 'HIGH';
export type DevelopmentPotential = 'HIGH' | 'MEDIUM' | 'LOW';
export type CharacterVsTrait = 'CHARACTER' | 'PARTIAL_CHARACTER' | 'TRAIT_PROFILE';
export type ArtifactPotentialRating = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_EVALUATED';

export type BrandCharacterTerritoryAssurance = {
  territoryId: string;
  territoryName: string;
  territoryStrength: TerritoryStrength;
  archetypeRisk: ArchetypeRisk;
  developmentPotential: DevelopmentPotential;
  characterVsTrait: CharacterVsTrait;
  artifactPotential: ArtifactPotentialRating;
  majorFinding: string;
  forensicPrimaryRootCause: string;
  recoverableFieldCount: number;
};

function rateArtifactPotential(d: ReturnType<typeof extractTerritoryDistillation>): ArtifactPotentialRating {
  if (!d.artifactPotential) return 'NOT_EVALUATED';
  if (d.artifactPotential.length > 80) return 'HIGH';
  if (d.artifactPotential.length > 30) return 'MEDIUM';
  return 'LOW';
}

function rateCharacterVsTrait(
  d: ReturnType<typeof extractTerritoryDistillation>,
  collapse: ReturnType<typeof evaluateArchetypeCollapse>,
): CharacterVsTrait {
  if (collapse.particularized && d.coreTension.length > 30) return 'CHARACTER';
  if (collapse.flags.includes('FRIENDLY_EXPERT_ARCHETYPE') || collapse.flags.includes('ADJECTIVE_PAIR_AS_CHARACTER')) {
    return 'TRAIT_PROFILE';
  }
  return 'PARTIAL_CHARACTER';
}

export function assureTerritory(
  character: BrandCharacterTerritory,
  run: BrandCharacterFormationRun,
  isLast: boolean,
): BrandCharacterTerritoryAssurance {
  const forensic = auditTerritoryForensics(character, run, isLast);
  const collapse = evaluateArchetypeCollapse(character);
  const d = extractTerritoryDistillation(character);

  let archetypeRisk: ArchetypeRisk = 'LOW';
  if (collapse.flags.length >= 4) archetypeRisk = 'HIGH';
  else if (collapse.flags.length >= 2) archetypeRisk = 'MEDIUM';

  let territoryStrength: TerritoryStrength = 'PROMISING';
  if (collapse.particularized && collapse.hasProductiveTension) territoryStrength = 'STRONG';
  else if (collapse.flags.includes('FRIENDLY_EXPERT_ARCHETYPE') && !collapse.hasProductiveTension) {
    territoryStrength = 'GENERIC_COLLAPSE';
  } else if (forensic.providerTruncated) territoryStrength = 'UNDERDEVELOPED';

  let developmentPotential: DevelopmentPotential = 'MEDIUM';
  if (territoryStrength === 'STRONG' || territoryStrength === 'PROMISING') developmentPotential = 'HIGH';
  if (territoryStrength === 'GENERIC_COLLAPSE') developmentPotential = 'LOW';

  const characterVsTrait = rateCharacterVsTrait(d, collapse);
  const artifactPotential = rateArtifactPotential(d);

  let majorFinding = collapse.notes[0] ?? '';
  if (character.name.toLowerCase().includes('committed contrarian')) {
    majorFinding = collapse.hasProductiveTension
      ? 'Intellectual commitment + public position-holding present; rebel-brand collapse risk if development flattens to edgy challenger'
      : 'Archetypal rebel surface — development must test commitment vs performance';
  } else if (character.name.toLowerCase().includes('devoted observer')) {
    majorFinding =
      'Genuine observational character seed; must not collapse into presentation concept (THE THING THAT KEEPS NOTICING)';
  } else if (character.name.toLowerCase().includes('generous expert')) {
    majorFinding =
      'High generic educational-brand collapse risk (smart/approachable); development must discover specific behavioral character beneath trait profile';
  } else if (character.name.toLowerCase().includes('precise enthusiast')) {
    majorFinding = collapse.hasProductiveTension
      ? 'Precision × enthusiasm tension present as behavioral seed — adjective pair alone insufficient without development'
      : 'Adjective pair risk — precision/enthusiasm must become behavior not label';
  }

  return {
    territoryId: character.id,
    territoryName: character.name,
    territoryStrength,
    archetypeRisk,
    developmentPotential,
    characterVsTrait,
    artifactPotential,
    majorFinding,
    forensicPrimaryRootCause: forensic.primaryRootCause,
    recoverableFieldCount: forensic.summary.recoverable,
  };
}

export function assureAllTerritories(run: BrandCharacterFormationRun): BrandCharacterTerritoryAssurance[] {
  return (run.characters ?? []).map((c, i, arr) => assureTerritory(c, run, i === arr.length - 1));
}
