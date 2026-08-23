/**
 * Creative Concept Territory methodology architecture tests.
 */

import { describe, expect, it } from 'vitest';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../canonicalCreativeRangeConstants.js';
import { buildAllConceptTerritorySeeds, buildConceptTerritorySeed } from './conceptTerritorySeeds.js';
import {
  detectConceptCollisions,
  runConceptOrthogonalityGate,
  runCousinPairDisentanglements,
  runVisualOrthogonalityGate,
} from './conceptOrthogonality.js';
import { runForensicVisualConvergenceAudit } from './visualConvergenceAudit.js';
import { buildCrossWorldComparisonMatrix } from './crossWorldComparisonMatrix.js';
import { CONCEPT_TERRITORY_METHODOLOGY_VERSION, EXPERIMENT_D_MAX_HEROES } from './conceptTerritoryConstants.js';

describe('CREATIVE_CONCEPT_TERRITORY_MODEL_TEST', () => {
  it('builds six first-class territories', () => {
    const { territories } = buildAllConceptTerritorySeeds();
    expect(territories).toHaveLength(6);
    expect(territories.every((t) => t.methodologyVersion === CONCEPT_TERRITORY_METHODOLOGY_VERSION)).toBe(true);
    expect(territories.every((t) => t.centralConcept.length > 0)).toBe(true);
  });
});

describe('WORLD_EXPRESSION_SYSTEM_MODEL_TEST', () => {
  it('derives expression systems from territories', () => {
    const { expressionSystems } = buildAllConceptTerritorySeeds();
    expect(expressionSystems).toHaveLength(6);
    expect(expressionSystems.every((e) => e.nativeProofFormat.length > 0)).toBe(true);
  });
});

describe('CONCEPT_BEFORE_STYLE_TEST', () => {
  it('seeds establish concept fields before visual systems', () => {
    const seed = buildConceptTerritorySeed('THE COUNTDOWN ROOM');
    expect(seed.territory.primaryVisualMechanism.toLowerCase()).toContain('temporal');
    expect(seed.expression.materialSystem.toLowerCase()).not.toContain('paper-first');
  });
});

describe('FORMAT_AFTER_WORLD_TEST', () => {
  it('native proof format lives on expression system after concept', () => {
    const seed = buildConceptTerritorySeed('THE INDEX');
    expect(seed.expression.nativeProofFormat).toBe('SAVEABLE_REFERENCE_POST');
  });
});

describe('BRAND_INTELLIGENCE_NOT_VISUAL_KIT_TEST', () => {
  it('forensic audit flags accidental visual constants', () => {
    const audit = runForensicVisualConvergenceAudit(null);
    expect(audit.accidentalBrandConstants.some((t) => t.mustNotBecomeUniversal)).toBe(true);
    expect(audit.trueBrandConstants.some((t) => t.includes('personality'))).toBe(true);
  });
});

describe('CANONICAL_SIX_DIRECTION_NAMES_TEST', () => {
  it('preserves canonical six names', () => {
    const { territories } = buildAllConceptTerritorySeeds();
    expect(territories.map((t) => t.directionName)).toEqual([...CANONICAL_NDXBOOK_DIRECTION_NAMES]);
  });
});

describe('SIX_TERRITORY_FORMATION_TEST', () => {
  it('forms independent territories for all six', () => {
    const { territories, expressionSystems } = buildAllConceptTerritorySeeds();
    const gate = runConceptOrthogonalityGate(territories);
    expect(gate.cousinPairs).toHaveLength(3);
    expect(territories.length).toBe(6);
    expect(expressionSystems.length).toBe(6);
  });
});

describe('CONCEPT_COLLISION_DETECTION_TEST', () => {
  it('reports collision when primary visual mechanism identical', () => {
    const { territories } = buildAllConceptTerritorySeeds();
    const clone = territories.map((t, i) =>
      i === 1 ? { ...t, primaryVisualMechanism: territories[0]!.primaryVisualMechanism } : t,
    );
    expect(detectConceptCollisions(clone).length).toBeGreaterThan(0);
  });
});

describe('COUSIN_PAIR_DISENTANGLEMENT_TEST', () => {
  it('evaluates three cousin pairs', () => {
    const pairs = runCousinPairDisentanglements();
    expect(pairs.map((p) => p.directionA)).toEqual([
      'THE MARKED-UP COPY',
      'THE COUNTDOWN ROOM',
      'THE PERSONAL ARCHIVE',
    ]);
    expect(pairs.every((p) => p.philosophicalDifference.length > 0)).toBe(true);
  });
});

describe('PALETTE_INDEPENDENCE_TEST', () => {
  it('does not assign universal lime to all territories', () => {
    const { expressionSystems } = buildAllConceptTerritorySeeds();
    const limeCount = expressionSystems.filter((e) => e.paletteSystem.toLowerCase().includes('lime')).length;
    expect(limeCount).toBeLessThan(6);
  });
});

describe('TYPOGRAPHY_INDEPENDENCE_TEST', () => {
  it('derives typography independently per concept', () => {
    const { expressionSystems } = buildAllConceptTerritorySeeds();
    const unique = new Set(expressionSystems.map((e) => e.typographySystem));
    expect(unique.size).toBeGreaterThan(3);
  });
});

describe('MATERIAL_INDEPENDENCE_TEST', () => {
  it('includes non-paper-primary materials', () => {
    const { expressionSystems } = buildAllConceptTerritorySeeds();
    expect(expressionSystems.some((e) => e.materialSystem.toLowerCase().includes('spatial'))).toBe(true);
    expect(expressionSystems.some((e) => e.materialSystem.toLowerCase().includes('digital'))).toBe(true);
  });
});

describe('NO_MECHANICAL_COLOR_ROTATION_TEST', () => {
  it('palette systems are concept-described not rotated labels', () => {
    const { expressionSystems } = buildAllConceptTerritorySeeds();
    expect(expressionSystems.every((e) => e.derivationEvidence.length > 0)).toBe(true);
  });
});

describe('CONCEPT_ORTHOGONALITY_TEST', () => {
  it('passes concept gate for seeded territories', () => {
    const { territories } = buildAllConceptTerritorySeeds();
    const gate = runConceptOrthogonalityGate(territories);
    expect(gate.collisions).toHaveLength(0);
  });
});

describe('VISUAL_ORTHOGONALITY_TEST', () => {
  it('evaluates visual orthogonality before generation', () => {
    const { expressionSystems } = buildAllConceptTerritorySeeds();
    const gate = runVisualOrthogonalityGate(expressionSystems);
    expect(gate.notes.length).toBeGreaterThan(0);
  });
});

describe('CLONE_RISK_BLOCKS_GENERATION_TEST', () => {
  it('blocks when clone risks present', () => {
    const { expressionSystems } = buildAllConceptTerritorySeeds();
    const clones = expressionSystems.map((e) => ({
      ...e,
      paletteSystem: 'lime paper condensed clone kit',
      materialSystem: 'paper paper paper',
      typographySystem: 'condensed condensed condensed',
      compositionSystem: 'same',
    }));
    const gate = runVisualOrthogonalityGate(clones);
    expect(gate.blocksGeneration).toBe(true);
  });
});

describe('EXPERIMENT_D_MAX_SIX_HERO_TEST', () => {
  it('caps hero maximum at six', () => {
    expect(EXPERIMENT_D_MAX_HEROES).toBe(6);
  });
});

describe('CROSS_WORLD_COMPARISON_MATRIX', () => {
  it('builds qualitative pairwise matrix', () => {
    const { territories, expressionSystems } = buildAllConceptTerritorySeeds();
    const matrix = buildCrossWorldComparisonMatrix(territories, expressionSystems);
    expect(matrix.dimensions).toContain('CENTRAL CONCEPT');
    expect(matrix.directions).toHaveLength(6);
  });
});
