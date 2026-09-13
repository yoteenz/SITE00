/**
 * P0.VR.TWINV3.0R3 — Active project atmosphere inside SITE 00 shell (pilot: NDXBOOK).
 */

export type ActiveProjectExpressionContract = {
  projectId: string;
  projectName: string;
  accentPalette: string[];
  secondaryPalette: string[];
  projectTypography: string;
  projectGraphicLanguage: string;
  projectImageLanguage: string;
  projectMaterialLanguage: string;
  artifactFrameStyle: string;
  workspaceHighlightStyle: string;
  workspaceSurfaceBehavior: string;
  projectStatusStyle: string;
  hostOverrideRestrictions: string[];
};

export const NDXBOOK_LIME = '#c6f135' as const;
export const SITE00_HOST_RED = '#e10600' as const;

export function getNdxbookPilotExpressionContract(): ActiveProjectExpressionContract {
  return {
    projectId: 'ndxbook',
    projectName: 'NDXBOOK',
    accentPalette: [NDXBOOK_LIME, '#0a0a0a', '#ffffff'],
    secondaryPalette: ['#1a1a1a', '#f5f5f0', '#888880'],
    projectTypography: 'Editorial contrast + archive rhythm; expressive type inside workspace only',
    projectGraphicLanguage: 'Cultural-intelligence archive · filmstrip · layer stacks · editorial grids',
    projectImageLanguage: 'Project imagery and artifact previews dominate the work surface',
    projectMaterialLanguage: 'Black/white editorial fields with lime emphasis on active artifact states',
    artifactFrameStyle: 'Layers, stacks, filmstrips, trays — not uniform small white cards',
    workspaceHighlightStyle: `${NDXBOOK_LIME} for selected artifact, project status, creative preview emphasis`,
    workspaceSurfaceBehavior: 'Dominant central work surface; host frame stays quiet off-white',
    projectStatusStyle: 'Lime-forward chips and rails inside workspace; never host error semantics',
    hostOverrideRestrictions: [
      'GLOBAL SITE 00 NAVIGATION',
      'GLOBAL SITE 00 IDENTITY',
      'GLOBAL ACCOUNT CONTROLS',
      'HOST ERROR COLORS',
      'HOST WARNING STATES',
      'BREADCRUMB OWNERSHIP',
      'SYSTEM / COMPILER STATE SEMANTICS',
    ],
  };
}

/** Future pilots swap contract; shell stays SITE 00. */
export function resolveActiveProjectExpressionContract(projectId: string): ActiveProjectExpressionContract {
  if (projectId.toLowerCase() === 'ndxbook') return getNdxbookPilotExpressionContract();
  throw new Error(`DESIGN_PAGE_V3_EXPRESSION: unsupported project ${projectId}`);
}
