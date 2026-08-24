/**
 * Match reference regions to repository components and assets.
 */

import type {
  ReferenceAssetAuthority,
  RepositoryComponentMatch,
  RepositoryMatchClassification,
  RepositoryVisualAssetMatch,
  VisualReferenceRegion,
} from '../types.js';
import { SITE00_CANONICAL_COMPONENTS } from '../constants.js';

export type RepositoryAuditCatalog = {
  components: Array<{ id: string; path: string; classification: RepositoryMatchClassification }>;
  assets: Array<{ id: string; path: string; classification: ReferenceAssetAuthority }>;
};

export function buildDefaultSite00RepositoryCatalog(): RepositoryAuditCatalog {
  return {
    components: SITE00_CANONICAL_COMPONENTS.map((id) => ({
      id,
      path: `src/site00/components/**/${id}.tsx`,
      classification: 'EXISTING_CANONICAL_COMPONENT' as RepositoryMatchClassification,
    })),
    assets: [],
  };
}

export function matchRepositoryComponents(
  regions: VisualReferenceRegion[],
  catalog: RepositoryAuditCatalog,
): RepositoryComponentMatch[] {
  const roleToComponent: Partial<Record<string, string>> = {
    GLOBAL_SHELL: 'EcosystemShell',
    BOTTOM_NAV: 'MobileSiteNavigation',
    OWNER_CONTROL: 'ProjectOwnerControlStrip',
    LOCAL_NAV: 'ProjectExperimentsHubNav',
    METHOD_STAGE: 'ExperimentsHubOperateLayer',
    HERO: 'FounderWorkspaceShell',
  };

  return regions.map((region) => {
    const componentId = roleToComponent[region.visualRole] ?? null;
    const found = catalog.components.find((c) => c.id === componentId);
    return {
      regionId: region.regionId,
      classification: found?.classification ?? (componentId ? 'NEW_COMPONENT_REQUIRED' : 'UNKNOWN'),
      componentId,
      confidence: found ? 0.92 : componentId ? 0.6 : 0.3,
    };
  });
}

export function matchRepositoryAssets(
  regions: VisualReferenceRegion[],
  catalog: RepositoryAuditCatalog,
): RepositoryVisualAssetMatch[] {
  return regions
    .filter((r) => r.visualRole === 'IMAGE' || r.visualRole === 'DECORATIVE_OBJECT' || r.visualRole === 'METHOD_STAGE')
    .map((region) => {
      const asset = catalog.assets.find((a) => a.id === region.contentRole);
      return {
        regionId: region.regionId,
        classification: asset
          ? 'EXACT_EXISTING_ASSET'
          : region.visualRole === 'METHOD_STAGE'
            ? 'STRUCTURAL_COMPONENT'
            : 'REFERENCE_ONLY',
        assetPath: asset?.path ?? null,
        confidence: asset ? 0.95 : 0.7,
      };
    });
}

export function preferCanonicalOverReplacement(
  match: RepositoryComponentMatch,
): RepositoryComponentMatch {
  if (match.classification === 'EXISTING_CANONICAL_COMPONENT') return match;
  if (match.componentId && SITE00_CANONICAL_COMPONENTS.includes(match.componentId as (typeof SITE00_CANONICAL_COMPONENTS)[number])) {
    return { ...match, classification: 'EXISTING_CANONICAL_COMPONENT', confidence: 0.98 };
  }
  return match;
}
