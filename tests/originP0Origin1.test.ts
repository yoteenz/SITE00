/**
 * P0.ORIGIN.1-SITE00 — Origin environment background + built-in panel integration.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SITE00_ORIGIN_BACKGROUND_FILES,
  resolveOriginBackgroundAsset,
  resolveOriginBackgroundByViewport,
  originBackgroundRole,
} from '../src/site00/config/origin-background-assets.js';
import {
  deriveOriginBackgroundVariant,
  deriveOriginExpandedPanel,
  deriveOriginPanelState,
  resolveOriginPanelBackgroundUrl,
  originBackgroundPreloadUrls,
} from '../src/site00/config/origin-panel-state.js';
import { SITE00_ENVIRONMENTS } from '../src/site00/config/environments.js';
import { SITE00_ASSET_REGISTRY } from '../src/site00/config/assets.js';

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('P0.ORIGIN.1 Origin environment backgrounds', () => {
  it('1. mobile default uses mobile WITH_PANELS asset', () => {
    const url = resolveOriginPanelBackgroundUrl('origin', 'mobile');
    expect(url).toContain(SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_MOBILE_WITH_PANELS);
    expect(url).toContain('3D%20images/BG/');
  });

  it('2. desktop default uses desktop WITH_PANELS asset', () => {
    const url = resolveOriginPanelBackgroundUrl('origin', 'desktop');
    expect(url).toContain(SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_WITH_PANELS);
  });

  it('3–5. collapsed teaser surfaces use transparent origin-teaser class (not glass)', () => {
    const cards = readSource('src/site00/components/homepage/OriginCards.tsx');
    expect(cards).toContain('site00-origin-teaser');
    expect(cards).not.toContain('site00-glass-panel');
    expect(cards).not.toMatch(/background:\s*['"]var\(--site-surface-glass\)/);
  });

  it('6. old acrylic teaser styling removed from OriginCards inline styles', () => {
    const cards = readSource('src/site00/components/homepage/OriginCards.tsx');
    expect(cards).not.toContain('backdrop-filter');
    expect(cards).not.toContain('box-shadow');
    expect(cards).not.toMatch(/border:\s*['"]1px solid rgba\(255,255,255,0\.8\)/);
  });

  it('7. teaser click functionality preserved via button onClick handlers', () => {
    const cards = readSource('src/site00/components/homepage/OriginCards.tsx');
    expect(cards).toContain('onClick={onExpand}');
    expect(cards).toContain('type="button"');
    expect(cards).toContain('aria-label');
  });

  it('8. Identity expansion uses CLEAN asset', () => {
    const url = resolveOriginPanelBackgroundUrl('idnty-expanded', 'desktop');
    expect(url).toContain(SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_CLEAN);
  });

  it('9. BLDR expansion uses CLEAN asset', () => {
    const url = resolveOriginPanelBackgroundUrl('bldr-expanded', 'mobile');
    expect(url).toContain(SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_MOBILE_CLEAN);
  });

  it('10. Evolve expansion uses CLEAN asset', () => {
    const url = resolveOriginPanelBackgroundUrl('evolve-expanded', 'desktop');
    expect(url).toContain(SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_CLEAN);
  });

  it('11–13. expanded states hide collapsed teasers via OriginPage conditional render', () => {
    const page = readSource('src/site00/pages/OriginPage.tsx');
    expect(page).toMatch(/state\.homeMode === 'origin'[\s\S]*OriginCards/);
    expect(page).toContain("site00-origin-page--panel-expanded");
  });

  it('14–16. expanded panel content remains mounted when expanded', () => {
    const page = readSource('src/site00/pages/OriginPage.tsx');
    expect(page).toContain('IdntyExpandedPanel');
    expect(page).toContain('BldrExpandedPanel');
    expect(page).toContain('EvolveExpandedPanel');
    expect(page).toMatch(/state\.homeMode !== 'origin'/);
  });

  it('17. close restores WITH_PANELS asset derivation', () => {
    expect(deriveOriginBackgroundVariant('origin')).toBe('WITH_PANELS');
    expect(resolveOriginPanelBackgroundUrl('origin', 'desktop')).toContain(
      SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_WITH_PANELS,
    );
  });

  it('18. close restores teaser visibility condition', () => {
    const page = readSource('src/site00/pages/OriginPage.tsx');
    expect(page).toMatch(/\{state\.homeMode === 'origin' \? \([\s\S]*OriginCards/);
  });

  it('19–20. expanded deep-link / refresh uses CLEAN from first derive', () => {
    expect(deriveOriginPanelState('bldr-expanded')).toEqual({
      expandedPanel: 'BLDR',
      backgroundVariant: 'CLEAN',
    });
    expect(deriveOriginPanelState('evolve-expanded').backgroundVariant).toBe('CLEAN');
  });

  it('21. rapid expanded switching stays on CLEAN background', () => {
    expect(deriveOriginBackgroundVariant('idnty-expanded')).toBe('CLEAN');
    expect(deriveOriginBackgroundVariant('bldr-expanded')).toBe('CLEAN');
    expect(deriveOriginBackgroundVariant('evolve-expanded')).toBe('CLEAN');
  });

  it('22–23. responsive default/expanded swaps only matching viewport variant pair', () => {
    expect(originBackgroundRole('desktop', 'WITH_PANELS')).toBe('ORIGIN_DESKTOP_WITH_PANELS');
    expect(originBackgroundRole('mobile', 'CLEAN')).toBe('ORIGIN_MOBILE_CLEAN');
    const [a, b] = originBackgroundPreloadUrls('origin', 'desktop');
    expect(a).toContain(SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_WITH_PANELS);
    expect(b).toContain(SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_CLEAN);
  });

  it('24–25. mobile/desktop composition tokens define hit zone dimensions', () => {
    const composition = readSource('src/site00/config/origin-home-composition.ts');
    expect(composition).toContain('SITE00_ORIGIN_MOBILE_COMPOSITION');
    expect(composition).toContain('teaserMinWidthPx');
    expect(composition).toContain('SITE00_ORIGIN_DESKTOP_COMPOSITION');
  });

  it('26. keyboard accessibility preserved on transparent teasers', () => {
    const css = readSource('src/site00/styles/site00.css');
    expect(css).toMatch(/button\.site00-origin-teaser:focus-visible[\s\S]*outline.*site-red/);
  });

  it('27. no duplicate baked/CSS panel surfaces on collapsed teasers', () => {
    const css = readSource('src/site00/styles/site00.css');
    expect(css).toMatch(/button\.site00-origin-teaser[\s\S]*background: transparent/);
    expect(css).toMatch(/button\.site00-origin-teaser[\s\S]*backdrop-filter: none/);
  });

  it('28. background container uses stable environment layer geometry', () => {
    const bg = readSource('src/site00/components/environment/Site00EnvironmentViewportBackground.tsx');
    expect(bg).toContain('backgroundSize: size');
    expect(bg).toContain('site00-environment-viewport-bg');
    const shell = readSource('src/site00/components/environment/EnvironmentShell.tsx');
    expect(shell).toContain('inset: 0');
  });

  it('29–30. four approved assets registered with canonical roles', () => {
    expect(Object.keys(SITE00_ORIGIN_BACKGROUND_FILES)).toHaveLength(4);
    expect(resolveOriginBackgroundAsset('ORIGIN_DESKTOP_WITH_PANELS')).toContain('C505E8E2');
    expect(resolveOriginBackgroundAsset('ORIGIN_MOBILE_WITH_PANELS')).toContain('4729B1A3');
    expect(resolveOriginBackgroundAsset('ORIGIN_DESKTOP_CLEAN')).toContain('A3EDBC2C');
    expect(resolveOriginBackgroundAsset('ORIGIN_MOBILE_CLEAN')).toContain('EBAEDB3E');
  });

  it('31. other SITE 00 environments unaffected — workflow still uses site00 bucket', () => {
    const workflow = SITE00_ENVIRONMENTS.WORKFLOW_ENVIRONMENT;
    expect(workflow.desktopAssetPath).toBe('3A2AC3AD-7192-45E8-B4B3-B811CB0DD792.png');
    expect(workflow.notes).toContain('live-preview/site00');
  });

  it('32. no FAL references in origin background module', () => {
    const assets = readSource('src/site00/config/origin-background-assets.ts');
    expect(assets.toLowerCase()).not.toContain('fal');
    expect(assets).toContain('do not regenerate');
  });

  it('33. asset manifest registers all four origin roles', () => {
    const ids = SITE00_ASSET_REGISTRY.map((a) => a.id);
    expect(ids).toContain('env-origin-desktop-with-panels');
    expect(ids).toContain('env-origin-mobile-with-panels');
    expect(ids).toContain('env-origin-desktop-clean');
    expect(ids).toContain('env-origin-mobile-clean');
  });

  it('viewport background reads homeMode for ORIGIN variant swap', () => {
    const bg = readSource('src/site00/components/environment/Site00EnvironmentViewportBackground.tsx');
    expect(bg).toContain("environmentId === 'ORIGIN_ENVIRONMENT'");
    expect(bg).toContain('resolveOriginPanelBackgroundPresentation');
    expect(bg).toContain('data-origin-background-variant');
  });

  it('EnvironmentShell resolves Origin desktop/mobile URLs from panel state', () => {
    const shell = readSource('src/site00/components/environment/EnvironmentShell.tsx');
    expect(shell).toContain('resolveOriginPanelBackgroundPresentation');
  });

  it('Origin preload hook loads both variants for active viewport', () => {
    const hook = readSource('src/site00/hooks/useOriginBackgroundPreload.ts');
    expect(hook).toContain('originBackgroundPreloadUrls');
    expect(hook).toContain('preloadSite00LoaderBackground');
  });

  it('loader route preload fetches Origin WITH_PANELS + CLEAN pair', () => {
    const preload = readSource('src/site00/components/loader/site00LoaderRoutePreload.ts');
    expect(preload).toContain("environmentId === 'ORIGIN_ENVIRONMENT'");
    expect(preload).toContain("resolveOriginBackgroundByViewport");
  });

  it('expanded panel enum derivation', () => {
    expect(deriveOriginExpandedPanel('origin')).toBe('NONE');
    expect(deriveOriginExpandedPanel('idnty-expanded')).toBe('IDENTITY');
    expect(deriveOriginExpandedPanel('bldr-expanded')).toBe('BLDR');
    expect(deriveOriginExpandedPanel('evolve-expanded')).toBe('EVOLVE');
  });

  it('resolveOriginBackgroundByViewport maps roles correctly', () => {
    expect(resolveOriginBackgroundByViewport('desktop', 'WITH_PANELS')).toBe(
      resolveOriginBackgroundAsset('ORIGIN_DESKTOP_WITH_PANELS'),
    );
    expect(resolveOriginBackgroundByViewport('mobile', 'CLEAN')).toBe(
      resolveOriginBackgroundAsset('ORIGIN_MOBILE_CLEAN'),
    );
  });
});
