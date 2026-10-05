import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FAMILY1_PARENT_ASSETS } from '../src/site00/pages/jurnl/family1ParentAssetRegistry';

const page = readFileSync(
  new URL('../src/site00/pages/jurnl/JurnlF01ParentAssemblyPage.tsx', import.meta.url),
  'utf8',
);

const layerMap = JSON.parse(
  readFileSync(
    new URL(
      '../JURNL/F01_ENTRY/ASSET_FIRST_TEST1/FAMILY1_PARENT_LAYER_MAP.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as { regions: { region_id: string; semantic_role: string; needs_generation: boolean }[] };

describe('Family 1 semantic isolation assembly', () => {
  it('mounts the environment plate and logo only', () => {
    expect(FAMILY1_PARENT_ASSETS.map((row) => row.asset_id)).toEqual([
      'ENTRY.ENVIRONMENT.PLATE.001',
      'ENTRY.LOGO.OFFICIAL.001',
    ]);
    expect(page).toContain('ENTRY.ENVIRONMENT.PLATE.001');
    expect(page).toContain('GET STARTED');
    expect(page).not.toContain('ENTRY.OBJECT.BOOKS.001');
    expect(page).not.toContain('ENTRY.BOTANICAL.FOREGROUND.001');
    expect(page).not.toContain('F01.00_WELCOME_GENERATED');
  });

  it('classifies the parent before any new image generation', () => {
    const byId = Object.fromEntries(layerMap.regions.map((row) => [row.region_id, row]));
    expect(byId.hero_scene.semantic_role).toBe('ENVIRONMENT_PLATE');
    expect(byId.hero_headline.semantic_role).toBe('LIVE_TEXT');
    expect(byId.hero_tagline.semantic_role).toBe('LIVE_TEXT');
    expect(byId.cta_get_started.semantic_role).toBe('LIVE_CONTROL');
    expect(byId.cta_sign_in.semantic_role).toBe('LIVE_CONTROL');
    expect(byId.brand_mark.semantic_role).toBe('INDEPENDENT_VISUAL_ASSET');
    expect(layerMap.regions.every((row) => row.needs_generation === false)).toBe(true);
    expect(layerMap.regions.some((row) => row.semantic_role === 'LAYERED_DECORATIVE_ASSET')).toBe(
      false,
    );
  });
});
