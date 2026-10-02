/**
 * FINAL-ROUTE-COMPLETION1 — the legacy public hubs render inside the public-redesign shell,
 * keep their routing/data, and expose no internal terminology.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Site00Provider } from '../src/site00/state/Site00Context';
import ServicesPage from '../src/site00/pages/ServicesPage';
import SystemPage from '../src/site00/pages/SystemPage';
import AboutPage from '../src/site00/pages/AboutPage';
import JournalPage from '../src/site00/pages/JournalPage';
import SupportPage from '../src/site00/pages/SupportPage';
import SitesPortfolioPage from '../src/site00/pages/SitesPortfolioPage';
import EnterPage from '../src/site00/pages/EnterPage';
import BldrHubPage from '../src/site00/pages/bldr/BldrHubPage';
import MarketingServicesPage from '../src/site00/pages/evolve/marketing/MarketingServicesPage';
import MarketingLandingPage from '../src/site00/pages/evolve/marketing/MarketingLandingPage';
import { SITE00_ROUTES } from '../src/site00/config/routes';
import { SITE00_SERVICES_SEED, SITE00_SYSTEM_LAYERS } from '../src/site00/config/seed/site00-page-seed';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

beforeEach(() => {
  vi.stubGlobal('window', {
    localStorage: memoryStorage(),
    sessionStorage: memoryStorage(),
    location: { pathname: '/', search: '' },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    addEventListener() {},
    removeEventListener() {},
  });
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
});
afterEach(() => vi.unstubAllGlobals());

const render = (url: string, node: ReactElement) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <Site00Provider>{node}</Site00Provider>
    </MemoryRouter>,
  );

const HUBS: Array<[string, string, ReactElement]> = [
  ['/services', 'services', <ServicesPage />],
  ['/system', 'system', <SystemPage />],
  ['/about', 'about', <AboutPage />],
  ['/journal', 'journal', <JournalPage />],
  ['/support', 'support', <SupportPage />],
  ['/sites', 'sites', <SitesPortfolioPage />],
  ['/enter', 'enter', <EnterPage />],
  ['/bldr', 'bldr-hub', <BldrHubPage />],
  ['/evolve/marketing/services', 'evolve-marketing-services', <MarketingServicesPage />],
  ['/evolve/marketing', 'evolve-marketing', <MarketingLandingPage />],
];

const FORBIDDEN = [/STUDIO OS/i, /STUDIO WORLD/i, /EXPERIENCE COMPILER/i, /\bMAP1\b/i, /\bMAP2\b/i];

describe('legacy public hubs inside the public redesign', () => {
  it.each(HUBS)('%s mounts the redesign shell with its hub marker', (url, marker, node) => {
    const html = render(url, node);
    expect(html).toContain('s00pr-shell');
    expect(html).toContain(`data-hub-page="${marker}"`);
    expect(html).not.toContain('site00-public-shell');
  });

  it.each(HUBS)('%s exposes no internal terminology', (url, _m, node) => {
    const html = render(url, node);
    for (const re of FORBIDDEN) expect(html).not.toMatch(re);
  });

  it('SERVICES keeps every seeded service and its destination', () => {
    const html = render('/services', <ServicesPage />);
    for (const s of SITE00_SERVICES_SEED) {
      expect(html).toContain(s.title.replace(/&/g, "&amp;"));
      expect(html).toContain(`href="${s.href}"`);
    }
  });

  it('SYSTEM keeps all four layers', () => {
    const html = render('/system', <SystemPage />);
    for (const l of SITE00_SYSTEM_LAYERS) expect(html).toContain(l.title);
  });

  it('ENTER locks signed-out private rows behind sign-in and keeps public rows direct', () => {
    const html = render('/enter', <EnterPage />);
    expect(html).toContain('href="/sites"');
    expect(html).toMatch(/is-locked/);
    expect(html).toContain('SIGN IN');
  });

  it('BLDR hub keeps START BUILDING → /bldr/start and the command center link', () => {
    const html = render('/bldr', <BldrHubPage />);
    expect(html).toContain(`href="${SITE00_ROUTES.bldrStart}"`);
    expect(html).toContain(`href="${SITE00_ROUTES.bldrState}"`);
  });
});
