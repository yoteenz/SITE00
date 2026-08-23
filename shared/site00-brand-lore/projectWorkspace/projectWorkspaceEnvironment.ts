/**
 * ProjectWorkspaceEnvironment — client inhabitation of the workbench.
 */

export type ProjectWorkspaceEnvironmentSource =
  | 'GENERATED'
  | 'CLIENT_SUPPLIED'
  | 'APPROVED_EXISTING_ASSET'
  | 'DERIVED_VARIANT'
  | 'HOST_DEFAULT';

export type ProjectWorkspaceEnvironment = {
  environmentId: string;
  projectId: string;
  source: ProjectWorkspaceEnvironmentSource;
  backgroundImagePath: string | null;
  environmentalPlatePath: string | null;
  materialField: string | null;
  atmosphericTreatment: string | null;
  spatialTreatment: string | null;
  hostDefaultFallback: boolean;
  compiledAt: string;
};

export function buildNdxbookWorkspaceEnvironment(params: {
  generatedBackgroundPath?: string | null;
}): ProjectWorkspaceEnvironment {
  return {
    environmentId: 'env-ndxbook-workspace-v1',
    projectId: 'ndxbook',
    source: params.generatedBackgroundPath ? 'GENERATED' : 'HOST_DEFAULT',
    backgroundImagePath: params.generatedBackgroundPath ?? null,
    environmentalPlatePath: params.generatedBackgroundPath ?? null,
    materialField: 'Client-native material field within SITE 00 structural shell',
    atmosphericTreatment: 'NDXBOOK brand atmosphere — not literal room',
    spatialTreatment: 'Same SITE 00 workbench architecture — client environment inhabits surfaces',
    hostDefaultFallback: !params.generatedBackgroundPath,
    compiledAt: new Date().toISOString(),
  };
}

export function hostDefaultWhenNoClientAsset(env: ProjectWorkspaceEnvironment): boolean {
  return env.hostDefaultFallback || env.source === 'HOST_DEFAULT';
}
