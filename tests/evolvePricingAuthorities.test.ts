/**
 * EVOLVE pricing authorities — reference-fidelity implementation tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EVOLVE_DIRECTED_PLANS,
  EVOLVE_SELF_DIRECTED_PLANS,
  parsePricingModeParam,
  plansForMode,
  pricingModeToParam,
} from '../shared/site00-evolve-pricing/catalog.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Evolve pricing catalog', () => {
  it('includes all self-directed plans from authority', () => {
    expect(EVOLVE_SELF_DIRECTED_PLANS.map((p) => p.name)).toEqual([
      'EVOLVE SOLO',
      'EVOLVE STUDIO',
      'EVOLVE PRO',
      'PROJECT PASS',
      'AGENCY / ENTERPRISE',
    ]);
  });

  it('includes discovery sprint as first directed plan', () => {
    expect(EVOLVE_DIRECTED_PLANS[0]!.name).toBe('DISCOVERY SPRINT');
    expect(EVOLVE_DIRECTED_PLANS[0]!.price).toBe('$750');
    expect(EVOLVE_DIRECTED_PLANS.map((p) => p.name)).toEqual([
      'DISCOVERY SPRINT',
      'DIRECTED BUILD',
      'GROWTH PARTNER',
      'MARKETING RETAINER',
      'CUSTOM / AGENCY',
    ]);
  });

  it('switches plans by pricing mode', () => {
    expect(plansForMode('SELF_DIRECTED')).toHaveLength(5);
    expect(plansForMode('SITE00_DIRECTED')).toHaveLength(5);
    expect(parsePricingModeParam('directed')).toBe('SITE00_DIRECTED');
    expect(pricingModeToParam('SITE00_DIRECTED')).toBe('directed');
  });
});

describe('Evolve pricing page architecture', () => {
  it('routes /evolve/plans to EvolvePricingPage', () => {
    expect(read('src/routes/Site00Routes.tsx')).toContain('EvolvePricingPage');
    expect(read('src/site00/pages/evolve/EvolvePricingPage.tsx')).toContain('EvolvePricingMobileExperience');
    expect(read('src/site00/pages/evolve/EvolvePricingPage.tsx')).toContain('EvolvePricingDesktopExperience');
  });

  it('uses independent mobile and desktop experiences', () => {
    const page = read('src/site00/pages/evolve/EvolvePricingPage.tsx');
    expect(page).toContain('useSite00DesktopArtboardPreview');
    expect(read('src/site00/components/evolve/pricing/mobile/EvolvePricingMobileExperience.tsx')).toContain(
      'site00-evolve-pricing--mobile',
    );
    expect(read('src/site00/components/evolve/pricing/desktop/EvolvePricingDesktopExperience.tsx')).toContain(
      'site00-evolve-pricing--desktop',
    );
  });

  it('implements functional pricing mode toggle', () => {
    expect(read('src/site00/components/evolve/pricing/EvolvePricingModeToggle.tsx')).toContain('role="tablist"');
    expect(read('src/site00/components/evolve/pricing/mobile/EvolvePricingMobileExperience.tsx')).toContain(
      'setSearchParams',
    );
  });

  it('uses reconstructed SVG icons not raster screenshots', () => {
    expect(read('src/site00/components/evolve/pricing/EvolvePricingIcon.tsx')).toContain('<svg');
    expect(read('src/site00/components/evolve/pricing/EvolvePricingIcon.tsx')).not.toContain('.jpg');
    expect(read('src/site00/components/evolve/pricing/EvolvePricingIcon.tsx')).not.toContain('.png');
  });

  it('includes directed CTAs compare packages and book consult', () => {
    const desktop = read('src/site00/components/evolve/pricing/desktop/EvolvePricingDesktopExperience.tsx');
    expect(desktop).toContain('COMPARE PACKAGES');
    expect(desktop).toContain('BOOK A CONSULT');
    expect(read('src/site00/components/evolve/pricing/mobile/EvolvePricingMobileExperience.tsx')).toContain(
      'BOOK A CONSULT',
    );
  });

  it('includes self-directed compare plans and start solo', () => {
    const mobile = read('src/site00/components/evolve/pricing/mobile/EvolvePricingMobileExperience.tsx');
    expect(mobile).toContain('COMPARE PLANS');
    expect(mobile).toContain('START SOLO');
  });

  it('loads dedicated pricing css', () => {
    expect(read('src/routes/Site00Routes.tsx')).toContain('site00-evolve-pricing.css');
    expect(read('src/site00/styles/site00-evolve-pricing.css')).toContain('site00-evolve-pricing-toggle');
    expect(read('src/site00/styles/site00-evolve-pricing.css')).toContain('site00-evolve-pricing__grid--5');
  });

  it('does not use old commercial page on public route', () => {
    expect(read('src/routes/Site00Routes.tsx')).not.toContain('EvolveCommercialPage');
  });
});
