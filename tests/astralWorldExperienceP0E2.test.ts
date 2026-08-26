/**
 * P0.E.2 — Reference ingestion + pixel-fidelity convergence tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ASTRAL_DESKTOP_ANATOMY,
  ASTRAL_MOBILE_ANATOMY,
  ASTRAL_REFERENCE_COLORS,
  ASTRAL_REFERENCE_DESKTOP,
  ASTRAL_REFERENCE_MOBILE,
} from '../shared/site00-astral-world/referenceAssets.js';

describe('P0.E.2 Astral World Reference Convergence', () => {
  it('TEST 1 — Desktop reference file exists and dimensions match registry', () => {
    expect(existsSync(ASTRAL_REFERENCE_DESKTOP.repoPath)).toBe(true);
    expect(ASTRAL_REFERENCE_DESKTOP.width).toBe(1672);
    expect(ASTRAL_REFERENCE_DESKTOP.height).toBe(941);
  });

  it('TEST 2 — Mobile reference file exists and dimensions match registry', () => {
    expect(existsSync(ASTRAL_REFERENCE_MOBILE.repoPath)).toBe(true);
    expect(ASTRAL_REFERENCE_MOBILE.width).toBe(941);
    expect(ASTRAL_REFERENCE_MOBILE.height).toBe(1672);
  });

  it('TEST 3 — Public cinematic assets copied from references', () => {
    expect(existsSync('public/astral-world/bg-desktop-cinematic.png')).toBe(true);
    expect(existsSync('public/astral-world/bg-mobile-cinematic.png')).toBe(true);
  });

  it('TEST 4 — Reference anatomy constants match desktop shell proportions', () => {
    expect(ASTRAL_DESKTOP_ANATOMY.navWidthPx).toBe(248);
    expect(ASTRAL_DESKTOP_ANATOMY.railWidthPx).toBe(328);
    expect(ASTRAL_DESKTOP_ANATOMY.destOrbSizePx).toBe(88);
  });

  it('TEST 5 — Reference color tokens extracted from ingested references', () => {
    expect(ASTRAL_REFERENCE_COLORS.goldPrimary).toBe('#c9a962');
    expect(ASTRAL_REFERENCE_COLORS.tarotSuiteAccent).toBe('#5c3d7a');
    expect(ASTRAL_REFERENCE_COLORS.astralMallAccent).toBe('#4a6fa5');
    expect(ASTRAL_REFERENCE_COLORS.coffeeShopAccent).toBe('#8b5a3c');
  });

  it('TEST 6 — Desktop home uses reference layout component', () => {
    const home = readFileSync('src/site00/astral-world/pages/AstralWorldHomePage.tsx', 'utf8');
    expect(home).toContain('DesktopHomeReferenceLayout');
    expect(home).toContain('MobileHomeReferenceLayout');
    expect(home).not.toContain('aw-hero__bg--pending');
  });

  it('TEST 7 — Bespoke destination icon registry present', () => {
    const icons = readFileSync('src/site00/astral-world/components/AstralDestIcons.tsx', 'utf8');
    expect(icons).toContain('TarotSuiteIcon');
    expect(icons).toContain('AstralMallIcon');
    expect(icons).toContain('CoffeeShopIcon');
  });

  it('TEST 8 — Cinematic background component replaces pending placeholders in destinations', () => {
    for (const page of [
      'src/site00/astral-world/pages/destinations/TarotSuitePage.tsx',
      'src/site00/astral-world/pages/destinations/AstralMallPage.tsx',
      'src/site00/astral-world/pages/destinations/CoffeeShopPage.tsx',
      'src/site00/astral-world/pages/AstralWorldAstreaPage.tsx',
    ]) {
      const src = readFileSync(page, 'utf8');
      expect(src).toContain('AstralCinematicBg');
      expect(src).not.toContain('aw-hero__bg--pending');
    }
  });

  it('TEST 9 — Who\'s Here moved to right rail per REFERENCE A', () => {
    const rail = readFileSync('src/site00/astral-world/components/AstralWorldRightRail.tsx', 'utf8');
    expect(rail).toContain('WhosHerePanel');
    expect(rail).toContain('YourWorldYourWayPanel');
    const desktopHome = readFileSync('src/site00/astral-world/components/DesktopHomeReferenceLayout.tsx', 'utf8');
    expect(desktopHome).not.toContain('WhosHerePanel');
  });

  it('TEST 10 — Founder-facing view hides exploration badge unless debug=1', () => {
    const shell = readFileSync('src/site00/astral-world/components/AstralWorldExperienceShell.tsx', 'utf8');
    expect(shell).toContain('isAstralDebugMode');
    expect(shell).toContain('showDebug');
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).not.toContain('REFERENCE_ASSET_PENDING');
  });

  it('TEST 11 — Shell CSS uses reference nav/rail widths', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('--aw-nav-width: 248px');
    expect(css).toContain('--aw-rail-width: 328px');
    expect(css).toContain('aw-ref-desktop');
    expect(css).toContain('aw-ref-mobile');
  });

  it('TEST 13 — Route suspense fallback avoids Site00Provider on Astral World paths', () => {
    const src = readFileSync('src/site00/components/loader/ReferenceShellSuspenseFallback.tsx', 'utf8');
    expect(src).toContain('isAstralWorldPrototypeRoute');
    expect(src).toContain('ReferenceShellSuspenseFallbackNdx');
    expect(src.indexOf('useSite00')).toBeGreaterThan(src.indexOf('function ReferenceShellSuspenseFallbackNdx'));
  });
});
