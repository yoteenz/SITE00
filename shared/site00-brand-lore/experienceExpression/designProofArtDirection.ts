/**
 * Surface art direction for visual development design proofs — distinct expression problems.
 */

import { buildProjectWorkspaceBible } from '../projectWorkspace/projectWorkspaceBible.js';
import { buildProjectWorkspaceCanon } from '../projectWorkspace/projectWorkspaceCanon.js';
import type { ClientProjectExpressionProfile } from '../projectWorkspace/clientProjectExpressionProfile.js';
import { buildHostExperienceCanon } from './hostExperienceCanon.js';
import type { ExperienceFunctionalCanon } from './types.js';
import type { SurfaceExperienceArtDirection } from './surfaceArtDirection.js';
import { extractSite00ProjectsIndexFunctionalCanon } from './projectsIndexFunctionalCanon.js';
import { extractNdxbookFunctionalCanon } from './functionalCanon.js';

const workspaceBible = buildProjectWorkspaceBible();
const workspaceCanon = buildProjectWorkspaceCanon();

export type DesignProofArtDirectionContext = {
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  functionalCanon: ExperienceFunctionalCanon;
  workspaceCanonFingerprint: string;
  clientExpressionFingerprint: string | null;
  antiDirection: string[];
};

export function deriveProjectsIndexProofArtDirection(): SurfaceExperienceArtDirection & {
  proofConcept: string;
  owner: 'SITE00';
  clientExpressionApplied: false;
} {
  const host = buildHostExperienceCanon();

  return {
    surfaceArtDirectionId: 'surface-ad-site00-projects-index-desktop',
    surfaceId: 'PROJECT_ENTRY',
    pageRoute: '/projects',
    experientialRole: 'Universal SITE 00 project-working environment — Active Workbench + Dossier sophistication',
    dominantInformation: 'Active work, current priority, judgment queue, project artifacts, dossier access',
    dominantVisualBehavior: workspaceBible.workspaceThesis,
    compositionalHierarchy: [
      'Asymmetric active-piece focal zone — dominant visual weight',
      'Bench cluster — varied artifact scale, not equal cards',
      'Review/judgment band — elevated when work awaits founder',
      'Work history trail — receding depth',
      'Dossier depth layer — structural sophistication without literal case file',
      'SITE 00 host frame — persistent recognition',
    ],
    artworkRelationship: 'Environmental artwork + project specimens as working artifacts — authored graphic layer required',
    clientExpressionIntensity: 'LOW',
    hostVisibility: 'PERSISTENT',
    materialBehavior: 'Dimensional surfaces, depth, materiality — not flat white document',
    imageBehavior: 'Generated environmental and specimen artwork materially shapes composition',
    typographyBehavior: `${host.hostUiTypography} for UI; expressive type artifacts optional as generated elements`,
    motionBehavior: 'Implied spatial depth and state transitions — static proof frame',
    interactionArtRelationship: 'Click targets integrated into designed composition — not bordered SaaS cards',
    responsiveTransformation: 'Desktop proof — mobile contract deferred until approval',
    requiredAssetFamilies: [
      'BACKGROUND_OR_ENVIRONMENT',
      'PRIMARY_ARTWORK',
      'SUPPORTING_ARTWORK',
      'GRAPHIC_INTERVENTION',
    ],
    prohibitedGenericTemplateBehavior: [
      'Equal-weight card grid',
      'SaaS dashboard resemblance',
      'Admin portal layout',
      'Renamed sections on white document page',
      'Literal workshop carpentry',
      'Literal detective case file',
      'Client-branded NDXBOOK expression on universal index',
    ],
    compiledAt: new Date().toISOString(),
    proofConcept: 'ACTIVE WORKBENCH + DOSSIER — SITE 00 universal environment',
    owner: 'SITE00',
    clientExpressionApplied: false,
  };
}

export function deriveNdxbookProjectHomeProofArtDirection(params: {
  clientExpression: ClientProjectExpressionProfile;
}): SurfaceExperienceArtDirection & {
  proofConcept: string;
  owner: 'SITE00_PLUS_NDXBOOK';
  clientExpressionApplied: true;
  typographyProvenance: 'EXPERIMENTAL_VISUAL_DEVELOPMENT';
} {
  const functionalCanon = extractNdxbookFunctionalCanon();

  return {
    surfaceArtDirectionId: 'surface-ad-ndxbook-project-home-desktop',
    surfaceId: 'PROJECT_HOME',
    pageRoute: '/projects/ndxbook',
    experientialRole: 'NDXBOOK inhabiting SITE 00 Project Workspace — host structure + client expression',
    dominantInformation: functionalCanon.items
      .filter((i) => i.classification === 'REQUIRED_FUNCTION' || i.classification === 'REQUIRED_NAVIGATION')
      .slice(0, 4)
      .map((i) => i.label)
      .join('; '),
    dominantVisualBehavior: `${workspaceCanon.bible.workspaceThesis} transformed through NDXBOOK client expression`,
    compositionalHierarchy: [
      'SITE 00 workspace shell and workflow grammar',
      'NDXBOOK environmental transformation — visible client recognition beyond name',
      'Project command focal zone — asymmetric hierarchy',
      'Client artwork and material behavior',
      'Host controls and wayfinding persist',
      'Dossier depth accessible without equal card grid',
    ],
    artworkRelationship: 'Client-native specimens + generated graphic interventions — host/client separation maintained',
    clientExpressionIntensity: 'HIGH',
    hostVisibility: 'FRAME',
    materialBehavior: params.clientExpression.materialBehavior ?? 'Client material behavior — experimental, not historical accident',
    imageBehavior: 'NDXBOOK project imagery and visual specimens — not stock decoration',
    typographyBehavior: 'Expressive typography EXPERIMENTAL_VISUAL_DEVELOPMENT — Martian Mono excluded from client expression',
    motionBehavior: 'Spatial depth implied — static desktop proof',
    interactionArtRelationship: 'Required actions representable within designed composition',
    responsiveTransformation: 'Desktop proof first',
    requiredAssetFamilies: [
      'BACKGROUND_OR_ENVIRONMENT',
      'PRIMARY_ARTWORK',
      'SUPPORTING_ARTWORK',
      'GRAPHIC_INTERVENTION',
      'EXPRESSIVE_TYPE_ARTIFACT',
    ],
    prohibitedGenericTemplateBehavior: [
      'Equal section cards from legacy command grid',
      'NDXBOOK recognition by name label only',
      'SITE 00 host disappearance',
      'Martian Mono as client typography',
      'Automatic lime/cream/correction-mark inheritance',
      'Literal workshop or case-file metaphor',
    ],
    compiledAt: new Date().toISOString(),
    proofConcept: 'SITE 00 WORKSPACE + NDXBOOK CLIENT EXPRESSION',
    owner: 'SITE00_PLUS_NDXBOOK',
    clientExpressionApplied: true,
    typographyProvenance: 'EXPERIMENTAL_VISUAL_DEVELOPMENT',
  };
}

export function buildDesignProofArtDirectionContext(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  clientExpression?: ClientProjectExpressionProfile | null,
): DesignProofArtDirectionContext {
  const workspaceFp = workspaceCanon.canonId;
  const clientFp =
    proofId === 'NDXBOOK_PROJECT_HOME' && clientExpression
      ? clientExpression.profileId
      : null;

  return {
    proofId,
    functionalCanon:
      proofId === 'SITE00_PROJECTS_INDEX'
        ? extractSite00ProjectsIndexFunctionalCanon()
        : extractNdxbookFunctionalCanon(),
    workspaceCanonFingerprint: workspaceFp,
    clientExpressionFingerprint: clientFp,
    antiDirection: [
      'CSS screenshot approximation',
      'DOM rearrangement',
      'Placeholder rectangles',
      'Wireframe',
      'Text-only description',
    ],
  };
}
