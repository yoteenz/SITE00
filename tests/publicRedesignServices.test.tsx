/**
 * Origin / BLDR / EVOLVE / LOCATIONS structure + boundary contracts (server-rendered).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Site00Provider } from '../src/site00/state/Site00Context';
import { BuilderStateExperience, EvolveStateExperience } from '../src/site00/components/public-redesign/PublicServicePages';
import { PublicOriginMobile } from '../src/site00/components/public-redesign/PublicOrigin';
import { PublicLocationsDirectory } from '../src/site00/components/public-redesign/PublicLocationsDirectory';
import { BUILDER_PANEL_ORDER, EVOLVE_PATH_ORDER } from '../src/site00/config/public-redesign-content';

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

const page = (url: string, node: ReactElement) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <Site00Provider>{node}</Site00Provider>
    </MemoryRouter>,
  );

describe('ORIGIN', () => {
  const transition = {
    goToLocations: () => {},
    transitioning: false,
    locationsBg: '',
    swipeHandlers: {} as never,
  };
  const origin = (mode: 'origin' | 'idnty-expanded' | 'bldr-expanded' | 'evolve-expanded') =>
    page('/', <PublicOriginMobile homeMode={mode} onExpand={() => {}} onCollapse={() => {}} locationsTransition={transition} />);

  it('offers exactly IDNTY / BLDR / EVOLVE — no worlds, no library, no fourth service', () => {
    const html = origin('origin');
    expect(html.match(/s00pr-origincard"/g)).toHaveLength(3);
    for (const label of ['EXPAND IDNTY', 'EXPAND BLDR', 'EXPAND EVOLVE']) expect(html).toContain(label);
    // Navigation links: only destinations that exist (CHARACTERS / WORLDS / LIBRARY have no route).
    const navLinks = [...html.matchAll(/class="s00pr-header__link" href="[^"]+">([A-Z]+)</g)].map((m) => m[1]);
    expect(navLinks).toEqual(['EXPLORE', 'BUILD', 'EVOLVE', 'ABOUT']);
    expect(html).not.toMatch(/ENTER WORLDS|ENTER LIBRARY|EXPAND (WORLDS|LIBRARY)/);
    expect(html).toContain('SITE 00');
    expect(html).toContain('WHERE DIGITAL PLACES BEGIN.');
    expect(html).toContain('SWIPE UP TO ENTER');
    expect(html).toContain('s00pr-origin-swipe-surface');
    expect(html).toContain('data-swipe-up-zone');
  });

  it('removes the full-screen swipe capture when a panel is expanded', () => {
    const html = origin('idnty-expanded');
    expect(html).not.toContain('s00pr-origin-swipe-surface');
  });

  it('keeps the approved landmark environment mounted (existing CLEAN asset, not the baked-panel image)', () => {
    const html = origin('origin');
    expect(html).toContain('data-environment="ENV.ORIGIN.COLLAPSED"');
    expect(html).toContain('EBAEDB3E-D0FE-463D-9B41-1C8BF43E44A3'); // ORIGIN_MOBILE_CLEAN
    expect(html).not.toContain('4729B1A3-3E3C-4F2C-9F49-E8AB3C9C46E7'); // ORIGIN_MOBILE_WITH_PANELS
  });

  it('expands the three panels with their canonical content and routes', () => {
    const idnty = origin('idnty-expanded');
    expect(idnty).toContain('IDENTITY');
    expect(idnty).toContain('DEFINE MY BRAND.');
    expect(idnty).toContain('WHAT WE DEFINE');
    expect(idnty).toContain('THE IDENTITY FRAMEWORK');
    expect(idnty).toContain('BEGIN IDENTITY');

    const bldr = origin('bldr-expanded');
    expect(bldr).toContain('BUILDER');
    expect(bldr).toContain('START MY BUILD.');
    expect(bldr).toContain('BEGIN BLDR');

    const evolve = origin('evolve-expanded');
    expect(evolve).toContain('ENHANCE. INTEGRATE. TRANSFORM WHAT EXISTS.');
    expect(evolve).toContain('START EVOLVE');
    expect(evolve.match(/s00pr-framework__title/g)).toHaveLength(3);
    for (const html of [idnty, bldr, evolve]) {
      expect(html).toContain('data-asset-slot="ENV.ORIGIN.EXPANDED"');
      expect(html).not.toMatch(/STUDIO OS|STUDIO WORLD/);
    }
  });
});

describe('BLDR', () => {
  it('command center sits above the four paths, in order', () => {
    const html = page('/bldr/state', <BuilderStateExperience />);
    expect(html).toContain('COMMAND CENTER');
    expect(html).toContain('TURN IDEAS');
    const order = ['SITE', 'WORLD', 'SYSTEMS', 'EXTENSIONS'].map((t) => html.indexOf(`>${t}</span><span class="s00pr-svccard__tagline"`));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(html).toContain('ENTER SITE');
    expect(html).toContain('ENTER EXTENSIONS');
    expect(html).toContain('TAKE THE BUILDER ASSESSMENT');
    expect(html).toContain('>BUILDER<'); // contextual bottom-nav bay
  });

  it.each(BUILDER_PANEL_ORDER)('panel ?path=%s renders its own content and keeps current function routes', (id) => {
    const html = page(`/bldr/state?path=${id}`, <BuilderStateExperience />);
    expect(html).toContain(`data-environment="ENV.BLDR.PATH.${id.toUpperCase()}"`);
    expect(html).toContain('OVERVIEW');
    expect(html).toContain(id === 'overview' ? 'BEGIN BUILDER' : `BEGIN ${id.toUpperCase()}`);
    const target = { overview: '/bldr/start', site: '/bldr/site', world: '/bldr/world', systems: '/bldr/enterprise', extensions: '/bldr/not-sure' }[id];
    expect(html).toContain(`href="${target}"`);
    expect(html).toContain('href="/bldr/state"'); // BACK → command center
  });

  it('is honest that EXTENSIONS has no dedicated assessment yet', () => {
    expect(page('/bldr/state?path=extensions', <BuilderStateExperience />)).toContain('NO DEDICATED ASSESSMENT YET');
  });

  it('does not leak IDNTY state semantics or EVOLVE paths', () => {
    const all = BUILDER_PANEL_ORDER.map((id) => page(`/bldr/state?path=${id}`, <BuilderStateExperience />)).join('');
    expect(all).not.toMatch(/STARTING AT ZERO|SOME PIECES|BUILD READY|CHOOSE (REFINE|INSTALL|TRANSFORM)|INTERVENTION CENTER/);
  });

  it('falls back to the command center for an unknown path', () => {
    expect(page('/bldr/state?path=bogus', <BuilderStateExperience />)).toContain('COMMAND CENTER');
  });
});

describe('PUBLIC EVOLVE', () => {
  it('intervention center offers exactly REFINE / INSTALL / TRANSFORM', () => {
    const html = page('/evolve/state', <EvolveStateExperience />);
    expect(html).toContain('INTERVENTION');
    expect(html.match(/s00pr-svccard"/g)).toHaveLength(3);
    for (const cta of ['ENTER REFINE', 'ENTER INSTALL', 'ENTER TRANSFORM']) expect(html).toContain(cta);
    expect(html).toContain('SURFACE / EXPERIENCE LAYER');
    expect(html).toContain('FOUNDATION / ARCHITECTURE LAYER');
    expect(html).toContain('>EVOLVE<'); // contextual bottom-nav bay
  });

  it.each(EVOLVE_PATH_ORDER)('panel ?path=%s keeps assessment routing', (id) => {
    const html = page(`/evolve/state?path=${id}`, <EvolveStateExperience />);
    expect(html).toContain(`CHOOSE ${id.toUpperCase()}`);
    expect(html).toContain(`href="/evolve/${id}/property"`);
    expect(html).toContain('INCLUDES');
    expect(html).toContain('IDEAL FOR');
    expect(html).toContain('DELIVERABLES');
    expect(html).toContain('TYPICAL ENGAGEMENT');
  });

  it('never imports IDNTY states into EVOLVE', () => {
    const all = [undefined, ...EVOLVE_PATH_ORDER].map((id) => page(id ? `/evolve/state?path=${id}` : '/evolve/state', <EvolveStateExperience />)).join('');
    expect(all).not.toMatch(/STARTING AT ZERO|SOME PIECES EXIST|READY FOR EVOLUTION|BUILD READY|IDENTITY DIAGNOSTIC/);
  });
});

describe('LOCATIONS', () => {
  it('lists the supplied seven destinations in order, then the existing signed-in space', () => {
    const html = page('/origin/locations', <PublicLocationsDirectory />);
    const titles = ['BLDR', 'EVOLVE', 'SITES', 'SERVICES', 'SYSTEM', 'ABOUT', 'JOURNAL'].map((t) => html.indexOf(`s00pr-locrow__title">${t}<`));
    expect(titles.every((i) => i > 0)).toBe(true);
    expect([...titles].sort((a, b) => a - b)).toEqual(titles);
    expect(html).toContain('WHERE DO YOU NEED TO GO?');
    expect(html).toContain('YOUR SPACE'); // existing function preserved
    expect(html).toContain('EXIT 00');
    expect(html).toContain('SIGN IN TO ENTER'); // auth locks preserved when signed out
    expect(html).toContain('CONTINUE EXPLORING');
  });

  it('numbers rows uniquely (the authority image repeats 05)', () => {
    const html = page('/origin/locations', <PublicLocationsDirectory />);
    const indexes = [...html.matchAll(/s00pr-locrow__index">(\d\d)</g)].map((m) => m[1]);
    expect(new Set(indexes).size).toBe(indexes.length);
  });
});
