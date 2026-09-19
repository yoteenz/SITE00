/**
 * Concept collision + cousin pair disentanglement + orthogonality gates.
 */

import type { CanonicalNdxbookDirectionName } from '../canonicalCreativeRangeConstants.js';
import { COUSIN_PAIRS } from './conceptTerritoryConstants.js';
import type {
  ConceptCollisionEvidence,
  ConceptOrthogonalityGateResult,
  CousinPairDisentanglement,
  CreativeConceptTerritory,
  VisualOrthogonalityGateResult,
  WorldExpressionSystem,
} from './conceptTerritoryTypes.js';
import { buildConceptTerritorySeed } from './conceptTerritorySeeds.js';

function cousinDisentangle(
  directionA: CanonicalNdxbookDirectionName,
  directionB: CanonicalNdxbookDirectionName,
): CousinPairDisentanglement {
  const a = buildConceptTerritorySeed(directionA).territory;
  const b = buildConceptTerritorySeed(directionB).territory;

  const collision =
    a.primaryVisualMechanism === b.primaryVisualMechanism ||
    (a.conceptualMetaphor.includes('document') && b.conceptualMetaphor.includes('document') &&
      directionA.includes('COPY') &&
      directionB.includes('COPY'));

  return {
    directionA,
    directionB,
    philosophicalDifference: `${a.centralConcept} vs ${b.centralConcept}`,
    viewerRoleDifference: `${a.viewerRole} vs ${b.viewerRole}`,
    worldPremiseDifference: `${a.worldPremise} vs ${b.worldPremise}`,
    contentMechanismDifference: `${a.contentMechanism} vs ${b.contentMechanism}`,
    visualMechanismDifference: `${a.primaryVisualMechanism} vs ${b.primaryVisualMechanism}`,
    artifactFamilyDifference: `${a.primaryArtifactFamily} vs ${b.primaryArtifactFamily}`,
    materialLogicDifference: `${a.primaryVisualMechanism} material vs ${b.primaryVisualMechanism} material`,
    typographicLogicDifference: 'Independently derived post-concept — not shared kit',
    paletteLogicDifference: 'Independently derived post-concept — similarity allowed with rationale',
    compositionLogicDifference: `${a.primaryVisualMechanism} layout vs ${b.primaryVisualMechanism} layout`,
    socialLogicDifference: `${a.contentBehavior} vs ${b.contentBehavior}`,
    motionLogicDifference: 'Concept-derived motion — not shared carousel template',
    neverInABecauseBelongsToB: b.ownedVisualMechanisms.slice(0, 2),
    neverInBBecauseBelongsToA: a.ownedVisualMechanisms.slice(0, 2),
    collisionStatus: collision ? 'COUSIN_BUT_DISTINCT' : 'PASS',
  };
}

export function runCousinPairDisentanglements(): CousinPairDisentanglement[] {
  return COUSIN_PAIRS.map(([a, b]) => cousinDisentangle(a, b));
}

export function detectConceptCollisions(
  territories: CreativeConceptTerritory[],
): ConceptCollisionEvidence[] {
  const collisions: ConceptCollisionEvidence[] = [];
  for (let i = 0; i < territories.length; i += 1) {
    for (let j = i + 1; j < territories.length; j += 1) {
      const a = territories[i]!;
      const b = territories[j]!;
      const shared = a.primaryVisualMechanism === b.primaryVisualMechanism;
      if (shared) {
        collisions.push({
          collisionPair: [a.directionName, b.directionName],
          sharedConceptualCore: a.primaryVisualMechanism,
          meaningfulDifferences: [
            a.viewerRole !== b.viewerRole ? 'viewer role differs' : '',
            a.contentMechanism !== b.contentMechanism ? 'content mechanism differs' : '',
          ].filter(Boolean),
          insufficientDifferences: shared ? ['primary visual mechanism identical'] : [],
          recommendedInterpretiveBoundary: `Separate ${a.ownedVisualMechanisms[0]} from ${b.ownedVisualMechanisms[0]}`,
          result: 'CONCEPT_COLLISION',
        });
      }
    }
  }
  return collisions;
}

export function runConceptOrthogonalityGate(
  territories: CreativeConceptTerritory[],
): ConceptOrthogonalityGateResult {
  const cousinPairs = runCousinPairDisentanglements();
  const collisions = detectConceptCollisions(territories);
  const cousinCollisions = cousinPairs.filter((p) => p.collisionStatus === 'CONCEPT_COLLISION');

  const passed = collisions.length === 0 && cousinCollisions.length === 0;
  return {
    passed,
    result: passed ? 'PASS' : collisions.length ? 'CONCEPT_COLLISION' : 'COUSIN_BUT_DISTINCT',
    collisions,
    cousinPairs,
    notes: passed
      ? ['All six concept territories pass independent concept review']
      : ['Review cousin pairs and collision evidence before hero generation'],
  };
}

function expressionOverlap(a: WorldExpressionSystem, b: WorldExpressionSystem): string[] {
  const overlapping: string[] = [];
  if (a.paletteSystem.toLowerCase().includes('lime') && b.paletteSystem.toLowerCase().includes('lime')) {
    overlapping.push('lime palette');
  }
  if (a.materialSystem.toLowerCase().includes('paper') && b.materialSystem.toLowerCase().includes('paper')) {
    overlapping.push('paper material');
  }
  if (a.typographySystem.toLowerCase().includes('condensed') && b.typographySystem.toLowerCase().includes('condensed')) {
    overlapping.push('condensed typography');
  }
  if (a.compositionSystem === b.compositionSystem) overlapping.push('composition system');
  return overlapping;
}

export function runVisualOrthogonalityGate(
  expressionSystems: WorldExpressionSystem[],
): VisualOrthogonalityGateResult {
  const tooClosePairs: VisualOrthogonalityGateResult['tooClosePairs'] = [];
  const cloneRisks: VisualOrthogonalityGateResult['cloneRisks'] = [];

  for (let i = 0; i < expressionSystems.length; i += 1) {
    for (let j = i + 1; j < expressionSystems.length; j += 1) {
      const a = expressionSystems[i]!;
      const b = expressionSystems[j]!;
      const overlapping = expressionOverlap(a, b);
      if (overlapping.length >= 3) {
        cloneRisks.push({
          pair: [a.directionName, b.directionName],
          reason: `CLONE_RISK: ${overlapping.join(', ')}`,
        });
      } else if (overlapping.length >= 1) {
        tooClosePairs.push({ pair: [a.directionName, b.directionName], overlappingTraits: overlapping });
      }
    }
  }

  const blocksGeneration = cloneRisks.length > 0;
  return {
    passed: !blocksGeneration,
    tooClosePairs,
    cloneRisks,
    blocksGeneration,
    notes: blocksGeneration
      ? ['CLONE_RISK pairs must be reviewed before paid hero generation']
      : ['Visual orthogonality acceptable for Experiment D readiness'],
  };
}
