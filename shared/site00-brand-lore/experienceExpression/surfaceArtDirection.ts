/**
 * SurfaceExperienceArtDirection — per-surface experiential art direction.
 */

import type { ExperienceSurfaceType } from './constants.js';
import type {
  ClientExperienceCanon,
  ExperienceBible,
  ExperienceConcept,
  ExperienceFunctionalCanon,
} from './types.js';

export type SurfaceExperienceArtDirection = {
  surfaceArtDirectionId: string;
  surfaceId: ExperienceSurfaceType;
  pageRoute: string | null;
  experientialRole: string;
  dominantInformation: string;
  dominantVisualBehavior: string;
  compositionalHierarchy: string[];
  artworkRelationship: string;
  clientExpressionIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
  hostVisibility: 'MINIMAL' | 'FRAME' | 'PERSISTENT';
  materialBehavior: string;
  imageBehavior: string;
  typographyBehavior: string;
  motionBehavior: string;
  interactionArtRelationship: string;
  responsiveTransformation: string;
  requiredAssetFamilies: string[];
  prohibitedGenericTemplateBehavior: string[];
  compiledAt: string;
};

const SURFACE_ROUTE_MAP: Partial<Record<ExperienceSurfaceType, string>> = {
  PROJECT_ENTRY: '/projects/ndxbook',
  PROJECT_HOME: '/projects/ndxbook',
  CONCEPT_FORMATION: '/projects/ndxbook/experience-expression',
  FOUNDER_REVIEW: '/projects/ndxbook/experience-expression',
  CONTENT_LIBRARY: '/projects/ndxbook/content',
  CANON: '/projects/ndxbook/canon',
  SYSTEM_INSPECTOR: '/projects/ndxbook/system',
};

function surfaceRole(surface: ExperienceSurfaceType, concept: ExperienceConcept): string {
  const map: Record<ExperienceSurfaceType, string> = {
    PROJECT_ENTRY: `Arrival into ${concept.experienceMetaphor}`,
    PROJECT_HOME: `Primary ${concept.viewerRole} operating surface`,
    CONCEPT_FORMATION: 'Formation and direction review surface',
    FOUNDER_REVIEW: 'Founder judgment and comparison surface',
    CONTENT_LIBRARY: 'Content archive within experience metaphor',
    CANON: 'Locked canon reference within experience metaphor',
    SYSTEM_INSPECTOR: 'Deep inspector — secondary to primary metaphor',
  };
  return map[surface];
}

export function deriveSurfaceArtDirection(params: {
  concept: ExperienceConcept;
  bible: ExperienceBible;
  surfaceId: ExperienceSurfaceType;
  functionalCanon: ExperienceFunctionalCanon;
  client: ClientExperienceCanon;
  revisedWorkbenchDossier?: boolean;
}): SurfaceExperienceArtDirection {
  const { concept, bible, surfaceId, revisedWorkbenchDossier } = params;
  const isWorkbench = concept.name === 'THE ACTIVE WORKBENCH';
  const dossierDepth = revisedWorkbenchDossier && isWorkbench;

  const hierarchy = dossierDepth
    ? [
        'Asymmetric focal zone — active piece or exhibit',
        'Layered evidence cluster with varied weight',
        'Visual interruption band — not equal cards',
        'Supporting metadata rail',
        'Depth via artifact presence not glass panels',
      ]
    : concept.hierarchyBehavior.split(';').map((s) => s.trim()).filter(Boolean);

  const assetFamilies = deriveRequiredAssetFamilies({
    concept,
    surfaceId,
    revisedWorkbenchDossier: dossierDepth,
  });

  return {
    surfaceArtDirectionId: `surface-ad-${concept.experienceConceptId}-${surfaceId}`,
    surfaceId,
    pageRoute: SURFACE_ROUTE_MAP[surfaceId] ?? null,
    experientialRole: surfaceRole(surfaceId, concept),
    dominantInformation: bible.progressiveDisclosure.primaryExperienceRepresentation[0] ?? concept.informationBehavior,
    dominantVisualBehavior: dossierDepth
      ? 'Dossier-weight hierarchy on workbench interaction metaphor — not investigative case file'
      : concept.spatialBehavior,
    compositionalHierarchy: hierarchy,
    artworkRelationship: dossierDepth
      ? 'Client-native visual specimens integrated as active artifacts — not decorative borders'
      : 'Artwork supports metaphor zones — never generic card chrome',
    clientExpressionIntensity: surfaceId === 'PROJECT_HOME' || surfaceId === 'FOUNDER_REVIEW' ? 'HIGH' : 'MEDIUM',
    hostVisibility: surfaceId === 'SYSTEM_INSPECTOR' ? 'PERSISTENT' : 'FRAME',
    materialBehavior: bible.materialBehavior,
    imageBehavior: dossierDepth
      ? 'Specimen fragments, revision layers, lineage crops — not literal workshop photography'
      : 'Client-native graphic interventions required — CSS-only surfaces insufficient',
    typographyBehavior: `${bible.typographyBehavior.clientExpressiveTypography}; host: ${bible.typographyBehavior.hostUiTypography}`,
    motionBehavior: bible.motionBehavior,
    interactionArtRelationship: concept.interactionGrammar,
    responsiveTransformation: concept.responsivePhilosophy,
    requiredAssetFamilies: assetFamilies,
    prohibitedGenericTemplateBehavior: [
      ...concept.genericTemplateAvoidanceStrategy,
      ...(dossierDepth
        ? [
            'No literal wooden desk or carpentry scene',
            'No physical hammer screwdriver workshop lamp',
            'No generic maker-space photography',
          ]
        : []),
      'No stock dashboard imagery',
      'No glass card grid as primary composition',
    ],
    compiledAt: new Date().toISOString(),
  };
}

function deriveRequiredAssetFamilies(params: {
  concept: ExperienceConcept;
  surfaceId: ExperienceSurfaceType;
  revisedWorkbenchDossier?: boolean;
}): string[] {
  const { concept, surfaceId, revisedWorkbenchDossier } = params;
  const base: string[] = [];

  if (surfaceId === 'PROJECT_HOME' || surfaceId === 'PROJECT_ENTRY') {
    base.push('HERO_COMPOSITION', 'ENVIRONMENT_PLATE');
  }
  if (surfaceId === 'FOUNDER_REVIEW' || surfaceId === 'CONCEPT_FORMATION') {
    base.push('VISUAL_SPECIMEN', 'CONCEPT_FRAGMENT');
  }
  if (revisedWorkbenchDossier && concept.name === 'THE ACTIVE WORKBENCH') {
    base.push(
      'ACTIVE_VISUAL_SPECIMEN',
      'REVISION_LAYER',
      'LINEAGE_FRAGMENT',
      'TYPOGRAPHIC_ARTWORK',
      'EDITORIAL_ARTWORK',
    );
  }
  if (surfaceId === 'CONTENT_LIBRARY' || surfaceId === 'CANON') {
    base.push('ARTIFACT_FRAGMENT', 'COMPARISON_SPECIMEN');
  }

  return [...new Set(base)];
}

export function deriveAllSurfaceArtDirections(params: {
  concept: ExperienceConcept;
  bible: ExperienceBible;
  surfaces: ExperienceSurfaceType[];
  functionalCanon: ExperienceFunctionalCanon;
  client: ClientExperienceCanon;
  revisedWorkbenchDossier?: boolean;
}): SurfaceExperienceArtDirection[] {
  return params.surfaces.map((surfaceId) =>
    deriveSurfaceArtDirection({
      concept: params.concept,
      bible: params.bible,
      surfaceId,
      functionalCanon: params.functionalCanon,
      client: params.client,
      revisedWorkbenchDossier: params.revisedWorkbenchDossier,
    }),
  );
}
