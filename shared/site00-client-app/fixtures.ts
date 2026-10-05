import { buildManifestFromScope } from '../site00-client-project-room/manifestTemplates.js';
import { capabilitiesForRole } from '../site00-client-project-room/capabilities.js';
import { buildClientAppExperience } from './manifestBuilder.js';
import type { ClientAppManifest, ClientAppProjectSummary } from './types.js';
import { clientAppPath } from './routes.js';

export const CLIENT_APP_FIXTURE_SLUGS = {
  A_WEBSITE_ONLY: 'fixture-app-website-only',
  B_IDENTITY_WEBSITE: 'fixture-app-identity-website',
  C_NDXBOOK: 'fixture-app-ndxbook',
  D_POST_LAUNCH: 'fixture-app-post-launch',
  D_POST_LAUNCH_OPPORTUNITY: 'fixture-app-post-launch-opportunity',
  E_UNESTABLISHED_COLOR: 'fixture-app-unestablished-color',
  F_ESTABLISHED_COLOR: 'fixture-app-established-color',
  G_MULTI_PROJECT: 'fixture-app-multi-b',
} as const;

function baseFixture(slug: string, scope: 'WEBSITE_ONLY' | 'IDENTITY_PLUS_WEBSITE' | 'NDXBOOK_LIKE', overrides: Partial<Parameters<typeof buildManifestFromScope>[0]> = {}) {
  const manifest = buildManifestFromScope({
    projectId: `fixture-${slug}`,
    projectSlug: slug,
    displayName: slug.includes('ndx') ? 'NDXBOOK' : 'CLIENT PROJECT',
    projectNumber: 'PROJECT 001',
    scope,
    currentPhaseId: 'website',
    attentionState: 'WATCHING',
    startDate: '2025-08-01',
    permissions: capabilitiesForRole('CLIENT_OWNER'),
    ...overrides,
  });
  return {
    ...manifest,
    appExperience: buildClientAppExperience({ manifest }),
  } satisfies ClientAppManifest;
}

export const CLIENT_APP_FIXTURES: Record<string, ClientAppManifest> = {
  [CLIENT_APP_FIXTURE_SLUGS.A_WEBSITE_ONLY]: baseFixture(CLIENT_APP_FIXTURE_SLUGS.A_WEBSITE_ONLY, 'WEBSITE_ONLY'),
  [CLIENT_APP_FIXTURE_SLUGS.B_IDENTITY_WEBSITE]: baseFixture(CLIENT_APP_FIXTURE_SLUGS.B_IDENTITY_WEBSITE, 'IDENTITY_PLUS_WEBSITE', {
    currentPhaseId: 'identity',
    attentionState: 'YOUR_TURN',
  }),
  [CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK]: baseFixture(CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK, 'NDXBOOK_LIKE', {
    displayName: 'NDXBOOK',
    currentPhaseId: 'website',
    attentionState: 'WATCHING',
  }),
  [CLIENT_APP_FIXTURE_SLUGS.D_POST_LAUNCH]: (() => {
    const m = baseFixture(CLIENT_APP_FIXTURE_SLUGS.D_POST_LAUNCH, 'IDENTITY_PLUS_WEBSITE', {
      attentionState: 'LOCKED',
    });
    m.status = 'LIVE';
    m.statusLabel = 'LIVE';
    m.appExperience = buildClientAppExperience({ manifest: m });
    return m;
  })(),
  [CLIENT_APP_FIXTURE_SLUGS.D_POST_LAUNCH_OPPORTUNITY]: (() => {
    const m = baseFixture(CLIENT_APP_FIXTURE_SLUGS.D_POST_LAUNCH_OPPORTUNITY, 'IDENTITY_PLUS_WEBSITE', {
      displayName: 'NDXBOOK',
      attentionState: 'LOCKED',
    });
    m.status = 'LIVE';
    m.statusLabel = 'LIVE';
    m.services = ['WEBSITE', 'IDENTITY'];
    m.appExperience = buildClientAppExperience({ manifest: m });
    return m;
  })(),
  [CLIENT_APP_FIXTURE_SLUGS.E_UNESTABLISHED_COLOR]: baseFixture(CLIENT_APP_FIXTURE_SLUGS.E_UNESTABLISHED_COLOR, 'WEBSITE_ONLY', {
    colorProfileState: 'UNESTABLISHED',
  }),
  [CLIENT_APP_FIXTURE_SLUGS.F_ESTABLISHED_COLOR]: baseFixture(CLIENT_APP_FIXTURE_SLUGS.F_ESTABLISHED_COLOR, 'NDXBOOK_LIKE', {
    accentColor: '#2563eb',
    colorProfileState: 'ESTABLISHED',
  }),
};

export function fixtureToProjectSummary(manifest: ClientAppManifest): ClientAppProjectSummary {
  return {
    id: manifest.projectId,
    slug: manifest.projectSlug,
    displayName: manifest.displayName,
    projectNumber: manifest.projectNumber,
    statusLabel: manifest.statusLabel,
    statusKey: manifest.appExperience.appState,
    accentColor: manifest.accentColor,
    previewImageUrl: manifest.currentMoment.previewImageUrl,
    deepLink: clientAppPath(manifest.projectSlug),
  };
}

export function getMultiProjectFixtureSummaries(): ClientAppProjectSummary[] {
  return [
    fixtureToProjectSummary(CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK]),
    fixtureToProjectSummary(CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.A_WEBSITE_ONLY]),
  ];
}
