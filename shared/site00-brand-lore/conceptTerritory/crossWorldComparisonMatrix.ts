/**
 * Cross-world comparison matrix — qualitative evidence per dimension.
 */

import type { CanonicalNdxbookDirectionName } from '../canonicalCreativeRangeConstants.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../canonicalCreativeRangeConstants.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from './conceptTerritoryTypes.js';

export type ComparisonMatrixDimension =
  | 'CENTRAL CONCEPT'
  | 'VIEWER ROLE'
  | 'CONTENT MECHANISM'
  | 'TYPOGRAPHY'
  | 'COLOR'
  | 'MATERIAL'
  | 'IMAGERY'
  | 'COMPOSITION'
  | 'GRAPHICS'
  | 'ARTIFACT'
  | 'MOTION'
  | 'FORMAT';

export type CrossWorldComparisonMatrix = {
  dimensions: ComparisonMatrixDimension[];
  directions: CanonicalNdxbookDirectionName[];
  cells: Record<ComparisonMatrixDimension, Record<CanonicalNdxbookDirectionName, string>>;
};

function territoryCell(territory: CreativeConceptTerritory, dimension: ComparisonMatrixDimension): string {
  switch (dimension) {
    case 'CENTRAL CONCEPT':
      return territory.centralConcept;
    case 'VIEWER ROLE':
      return territory.viewerRole;
    case 'CONTENT MECHANISM':
      return territory.contentMechanism;
    case 'GRAPHICS':
      return territory.primaryVisualMechanism;
    case 'ARTIFACT':
      return territory.primaryArtifactFamily;
    case 'MOTION':
      return territory.emotionalMechanism;
    default:
      return territory.bigCreativeIdea;
  }
}

function expressionCell(expression: WorldExpressionSystem, dimension: ComparisonMatrixDimension): string {
  switch (dimension) {
    case 'TYPOGRAPHY':
      return expression.typographySystem;
    case 'COLOR':
      return expression.paletteSystem;
    case 'MATERIAL':
      return expression.materialSystem;
    case 'IMAGERY':
      return expression.imagerySystem;
    case 'COMPOSITION':
      return expression.compositionSystem;
    case 'GRAPHICS':
      return expression.graphicGrammar;
    case 'ARTIFACT':
      return expression.artifactSystem;
    case 'MOTION':
      return expression.motionSystem;
    case 'FORMAT':
      return expression.nativeProofFormat;
    default:
      return expression.conceptAlignment;
  }
}

export function buildCrossWorldComparisonMatrix(
  territories: CreativeConceptTerritory[],
  expressionSystems: WorldExpressionSystem[],
): CrossWorldComparisonMatrix {
  const dimensions: ComparisonMatrixDimension[] = [
    'CENTRAL CONCEPT',
    'VIEWER ROLE',
    'CONTENT MECHANISM',
    'TYPOGRAPHY',
    'COLOR',
    'MATERIAL',
    'IMAGERY',
    'COMPOSITION',
    'GRAPHICS',
    'ARTIFACT',
    'MOTION',
    'FORMAT',
  ];

  const cells = {} as CrossWorldComparisonMatrix['cells'];
  for (const dimension of dimensions) {
    cells[dimension] = {} as Record<CanonicalNdxbookDirectionName, string>;
    for (const name of CANONICAL_NDXBOOK_DIRECTION_NAMES) {
      const territory = territories.find((t) => t.directionName === name);
      const expression = expressionSystems.find((e) => e.directionName === name);
      if (!territory || !expression) {
        cells[dimension][name] = 'NOT_FORMED';
        continue;
      }
      if (['TYPOGRAPHY', 'COLOR', 'MATERIAL', 'IMAGERY', 'COMPOSITION', 'FORMAT'].includes(dimension)) {
        cells[dimension][name] = expressionCell(expression, dimension);
      } else if (dimension === 'MOTION') {
        cells[dimension][name] = expression.motionSystem;
      } else {
        cells[dimension][name] = territoryCell(territory, dimension);
      }
    }
  }

  return { dimensions, directions: [...CANONICAL_NDXBOOK_DIRECTION_NAMES], cells };
}
