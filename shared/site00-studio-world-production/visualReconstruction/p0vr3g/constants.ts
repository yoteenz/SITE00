/**
 * P0.VR.3G — ExperiencePage constants.
 */

export const P0_VR_3G_LINEAGE = 'P0.VR.3G' as const;

export const EXPERIENCE_PAGE_TEMPLATES = {
  INFORMATION: {
    templateId: 'site00-information-family-v1',
    family: 'INFORMATION' as const,
    inheritedRegions: ['HEADER', 'INTRO', 'PRIMARY', 'FOOTER'] as const,
    shellComponent: 'Site00ExperiencePage',
    responsiveModel: 'PUBLIC_PAGE' as const,
  },
  AUTH: {
    templateId: 'site00-auth-family-v1',
    family: 'AUTH' as const,
    inheritedRegions: ['AUTH_FORM', 'FOOTER'] as const,
    shellComponent: 'Site00AuthExperiencePage',
    responsiveModel: 'AUTH_SPLIT' as const,
  },
  COMPLEX: {
    templateId: 'site00-complex-shell-v1',
    family: 'COMPLEX' as const,
    inheritedRegions: ['HEADER', 'INTRO', 'PRIMARY', 'SECONDARY', 'PLACEHOLDER'] as const,
    shellComponent: 'Site00ComplexPageShell',
    responsiveModel: 'PUBLIC_PAGE' as const,
  },
  NDXBOOK_WORKSPACE: {
    templateId: 'ndxbook-workspace-shell-v1',
    family: 'NDXBOOK_WORKSPACE' as const,
    inheritedRegions: ['HEADER', 'PRIMARY', 'PLACEHOLDER'] as const,
    shellComponent: 'NdxbookWorkspaceShell',
    responsiveModel: 'WORKSPACE_SHELL' as const,
  },
} as const;
