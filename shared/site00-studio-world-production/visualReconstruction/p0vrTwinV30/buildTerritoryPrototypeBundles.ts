import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from '../p0vrTwinV21/constants.js';
import { DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES } from './constants.js';
import { DESIGN_PAGE_V3_TERRITORY_DEFINITIONS, type DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type { DesignPageAuthorityTerritoryBundle, DesignPageAuthorityVisualArtifact } from './types.js';

function prototypePath(territoryId: DesignPageV3TerritoryId, viewport: 'mobile' | 'desktop'): string {
  return DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES[territoryId][viewport];
}

/** Local SVG authority specimens — no FAL / API required (instant gallery on design page). */
export function buildTerritoryPrototypeBundles(input: {
  authoritySessionId: string;
  territoryIds?: DesignPageV3TerritoryId[];
}): DesignPageAuthorityTerritoryBundle[] {
  const territoryIds: DesignPageV3TerritoryId[] = input.territoryIds?.length ? input.territoryIds : ['A', 'B', 'C'];
  const ts = Date.now();
  const mk = (
    territoryId: DesignPageV3TerritoryId,
    viewport: 'mobile' | 'desktop',
    url: string,
  ): DesignPageAuthorityVisualArtifact => ({
    artifactId: `dpa-v3-proto-${territoryId}-${viewport}-${input.authoritySessionId}-${ts}`,
    viewport,
    storageUrl: url,
    widthHintPx: viewport === 'mobile' ? 430 : 1440,
    heightHintPx: viewport === 'mobile' ? 920 : 900,
    provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
    model: TWIN_V2_VISUAL_PROVIDER,
    providerJobRef: `prototype-${territoryId}-${viewport}`,
    representativePrototype: true,
    createdAt: new Date().toISOString(),
  });

  return territoryIds.map((territoryId) => ({
    territoryId,
    territoryName: DESIGN_PAGE_V3_TERRITORY_DEFINITIONS[territoryId].name,
    mobile: mk(territoryId, 'mobile', prototypePath(territoryId, 'mobile')),
    desktop: mk(territoryId, 'desktop', prototypePath(territoryId, 'desktop')),
  }));
}
