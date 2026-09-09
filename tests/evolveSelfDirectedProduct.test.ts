/**
 * Evolve service page + self-directed client product sprint tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EVOLVE_SERVICE_AREAS,
  EVOLVE_SERVICE_EVOLUTION_PATHS,
  EVOLVE_SERVICE_PROCESS_STEPS,
  EVOLVE_SERVICE_PAGE_COMPLETION_CONTRACTS,
  resolveEnterPathRoute,
  resolveStartEvolveRoute,
} from '../shared/site00-evolve-service/index.js';
import {
  ALL_SELF_DIRECTED_CONTRACTS,
  SELF_DIRECTED_PAGE_IDS,
} from '../shared/site00-self-directed/index.js';
import { SELF_DIRECTED_NAV } from '../shared/site00-self-directed/nav.js';
import {
  builderRequiredForScope,
  formatMetricCount,
  marketingOnlyScope,
} from '../shared/site00-self-directed/types.js';
import { CLIENT_APP_NAV } from '../shared/site00-client-app/client.js';
import { buildClientAppExperience } from '../shared/site00-client-app/manifestBuilder.js';
import { buildManifestFromScope } from '../shared/site00-client-project-room/manifestTemplates.js';
import { capabilitiesForRole } from '../shared/site00-client-project-room/capabilities.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Evolve service page — digital evolution', () => {
  it('public evolve route resolves to EvolveHubPage', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain("import('../site00/pages/EvolvePage')");
    expect(read('src/site00/pages/EvolvePage.tsx')).toContain('EvolveHubPage');
  });

  it('implements five-step service process from reference', () => {
    expect(EVOLVE_SERVICE_PROCESS_STEPS).toHaveLength(5);
    expect(EVOLVE_SERVICE_PROCESS_STEPS.map((s) => s.title)).toEqual([
      'PROPERTY',
      'DIAGNOSE',
      'SYSTEM PLAN',
      'BUILD',
      'LAUNCH / MEASURE',
    ]);
  });

  it('implements five service areas from reference', () => {
    expect(EVOLVE_SERVICE_AREAS.map((a) => a.id)).toEqual([
      'EXPERIENCE',
      'COMMERCE',
      'OPERATIONS',
      'INTELLIGENCE',
      'CONNECTIONS',
    ]);
  });

  it('implements three evolution paths', () => {
    expect(EVOLVE_SERVICE_EVOLUTION_PATHS.map((p) => p.id)).toEqual(['refine', 'install', 'transform']);
  });

  it('uses independent mobile and desktop hub experiences', () => {
    const hub = read('src/site00/pages/evolve/EvolveHubPage.tsx');
    expect(hub).toContain('EvolveHubMobileExperience');
    expect(hub).toContain('EvolveHubDesktopExperience');
    expect(read('src/site00/styles/site00-evolve-hub-desktop.css')).toContain('site00-evolve-hub-desktop');
  });

  it('uses new SVG icon system not old EvolvePathIcon on service hub', () => {
    const mobilePaths = read('src/site00/components/evolve/hub-mobile/EvolveHubPathCard.tsx');
    expect(mobilePaths).toContain('EvolveServiceIcon');
    expect(mobilePaths).not.toContain('EvolvePathIcon');
    const desktop = read('src/site00/components/evolve/hub-desktop/EvolveHubDesktopExperience.tsx');
    expect(desktop).toContain('EvolveServiceIcon');
    expect(desktop).not.toContain('EvolvePathIcon');
    expect(read('src/site00/components/evolve/service/EvolveServiceIcon.tsx')).toContain('evolve-service-svg-v1');
  });

  it('path enter buttons resolve to assessment routes', () => {
    const refine = resolveEnterPathRoute('refine', false);
    expect(refine.route).toBe('/evolve/refine/property');
    expect(refine.reason).toBe('PATH_ASSESSMENT');
  });

  it('start evolve routes auth when signed out', () => {
    const dest = resolveStartEvolveRoute({
      isSignedIn: false,
      hasEvolveProject: false,
      evolveProjectSlug: null,
      serviceMode: 'DIGITAL_EVOLUTION',
      isDesktop: false,
    });
    expect(dest.reason).toBe('AUTH_REQUIRED');
    expect(dest.route).toContain('/origin/sign-in');
  });

  it('start evolve opens app home when project exists', () => {
    const dest = resolveStartEvolveRoute({
      isSignedIn: true,
      hasEvolveProject: true,
      evolveProjectSlug: 'nocturne-drop',
      serviceMode: 'DIGITAL_EVOLUTION',
      isDesktop: false,
    });
    expect(dest.route).toBe('/app/projects/nocturne-drop');
  });

  it('registers page completion contracts for evolve service', () => {
    expect(EVOLVE_SERVICE_PAGE_COMPLETION_CONTRACTS.length).toBeGreaterThan(5);
    expect(EVOLVE_SERVICE_PAGE_COMPLETION_CONTRACTS.every((c) => c.status === 'IMPLEMENTED')).toBe(true);
  });
});

describe('Self-directed client product shell', () => {
  it('defines five-tab nav HOME PROJECTS REVIEWS INBOX PROFILE', () => {
    expect(CLIENT_APP_NAV.map((n) => n.label)).toEqual(['HOME', 'PROJECTS', 'REVIEWS', 'INBOX', 'PROFILE']);
    expect(SELF_DIRECTED_NAV.map((n) => n.label)).toEqual(['HOME', 'PROJECTS', 'REVIEWS', 'INBOX', 'PROFILE']);
  });

  it('does not use founder host nav in client shell', () => {
    const shell = read('src/site00/components/clientApp/Site00ClientAppShell.tsx');
    expect(shell).not.toContain('ORIGIN');
    expect(shell).not.toContain('CTRL ROOM');
  });

  it('registers self-directed tab routes', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('AppProjectsTabPage');
    expect(routes).toContain('AppProfilePage');
    expect(routes).toContain('path="projects"');
    expect(routes).toContain('path="profile"');
  });

  it('uses self-directed home view not legacy pulse on home tab', () => {
    expect(read('src/site00/pages/clientApp/AppHomePage.tsx')).toContain('SelfDirectedHomeView');
  });

  it('supports marketing-only project scope without builder', () => {
    expect(marketingOnlyScope('MARKETING_ONLY')).toBe(true);
    expect(builderRequiredForScope('MARKETING_ONLY')).toBe(false);
    expect(builderRequiredForScope('FULL_SITE')).toBe(true);
  });

  it('does not show fake zero for unknown metrics', () => {
    expect(formatMetricCount(null)).toBe('—');
    expect(formatMetricCount(undefined)).toBe('—');
    expect(formatMetricCount(0)).toBe('0');
  });

  it('builds client app modules for self-directed shell', () => {
    const manifest = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'test',
      displayName: 'TEST',
      projectNumber: 'P001',
      scope: 'MARKETING_ONLY',
      currentPhaseId: 'strategy',
      attentionState: 'WATCHING',
      startDate: '2025-01-01',
      permissions: capabilitiesForRole('CLIENT_OWNER'),
    });
    const exp = buildClientAppExperience({ manifest });
    expect(exp.modules).toEqual(['home', 'projects', 'reviews', 'inbox', 'profile']);
  });

  it('registers page completion on all primary self-directed tabs', () => {
    expect(Object.keys(SELF_DIRECTED_PAGE_IDS)).toEqual(['home', 'projects', 'reviews', 'inbox', 'profile']);
    expect(ALL_SELF_DIRECTED_CONTRACTS.length).toBeGreaterThan(8);
  });
});

describe('Build integrity', () => {
  it('imports evolve hub desktop css in routes', () => {
    expect(read('src/routes/Site00Routes.tsx')).toContain('site00-evolve-hub-desktop.css');
    expect(read('src/routes/Site00Routes.tsx')).toContain('site00-self-directed-client.css');
  });

  it('preserves Martian Mono host typography classes', () => {
    expect(read('src/site00/styles/site00-self-directed-client.css')).toContain('--site00-font-label');
  });
});
