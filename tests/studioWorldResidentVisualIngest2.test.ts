import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  findActorByCatalogueNumber,
  listStudioWorldResidentTalentActors,
} from '../shared/site00-studio-world/acting-catalogue/index.js';
import {
  assertCastingCardNotNonPrimary,
  getResidentVisualProjection,
  listResidentVisualProjections,
  resolveCastingCardImage,
  STUDIO_WORLD_SEASON1_VISUAL_BASE,
} from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/visualAuthority.js';
import { validateCastRoleOverridesForResident } from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/continuity.js';
import { findResidentDossierById } from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/residents.js';
import { findFabricationActor } from '../shared/site00-character-fabrication/actors.js';

const PUBLIC_ROOT = join(process.cwd(), 'public');

describe('P0.STUDIOOS.PRODUCTION.EXPRESSION.RESIDENT-VISUAL-INGEST2', () => {
  it('projects visual authority for all 8 residents', () => {
    expect(listResidentVisualProjections()).toHaveLength(8);
    for (const v of listResidentVisualProjections()) {
      expect(v.primaryNaturalImage).toMatch(/^\/site00\/studio-world-residents\/season1-v1\//);
      expect(v.cardImage).toBeTruthy();
      expect(v.productionVisuals.castingThumbnail.url).toMatch(/casting-thumbnails-v1/);
    }
  });

  it('primary card images resolve on disk and in actor catalogue', () => {
    for (const a of listStudioWorldResidentTalentActors()) {
      expect(a.headshotPreviewUrl).toBeTruthy();
      const disk = join(PUBLIC_ROOT, a.headshotPreviewUrl!.replace(/^\//, ''));
      expect(existsSync(disk), disk).toBe(true);
    }
  });

  it('Zuri Xu active — no Hale identity assets', () => {
    const zuri = getResidentVisualProjection('SW-RESIDENT-002')!;
    expect(zuri.primaryNaturalImage).toMatch(/zuri-xu/i);
    expect(zuri.primaryNaturalImage).not.toMatch(/hale/i);
    expect(findResidentDossierById('SW-RESIDENT-002')!.canonicalName).toBe('ZURI XU');
  });

  it('Marlowe natural authority uses larger-body off-duty; casting thumb is separate', () => {
    const m = getResidentVisualProjection('SW-RESIDENT-007')!;
    expect(m.primaryNaturalImage).toMatch(/off-duty-cultural-icon/);
    expect(m.productionVisuals.castingThumbnail.url).toMatch(/MARLOWE_SAINT/i);
    expect(m.productionVisuals.castingThumbnail.url).not.toMatch(/grand-cultural-icon/);
    expect(assertCastingCardNotNonPrimary('SW-RESIDENT-007', m.alternateModeRefs[0]!)).toBe(false);
  });

  it('Iona glam is alternate only — casting thumbnail is not full-glam', () => {
    const i = getResidentVisualProjection('SW-RESIDENT-006')!;
    expect(i.productionVisuals.castingThumbnail.url).toMatch(/IONA_WELLS/i);
    expect(i.productionVisuals.castingThumbnail.url).not.toMatch(/full-glam/);
    expect(i.closeupRefs[0]).toMatch(/precision-utilitarian/);
    expect(assertCastingCardNotNonPrimary('SW-RESIDENT-006', i.alternateModeRefs[0]!)).toBe(false);
  });

  it('work uniform cannot become default Casting thumbnail', () => {
    for (const v of listResidentVisualProjections()) {
      const thumb = v.productionVisuals.castingThumbnail.url;
      for (const u of v.uniformRefs) {
        expect(thumb).not.toBe(u);
        expect(assertCastingCardNotNonPrimary(v.sourceResidentId, u)).toBe(false);
      }
    }
  });

  it('preserves client cast SW-017 and excludes from resident talent pool', () => {
    expect(findActorByCatalogueNumber('SW-017')?.stageName).toBe('Maya Okonkwo');
    expect(listStudioWorldResidentTalentActors().some((a) => a.catalogueNumber === 'SW-017')).toBe(false);
  });

  it('Character Fabrication resolves resident actor with portrait URL', () => {
    const rec = findFabricationActor('sw-resident-001');
    expect(rec?.stageName).toBe('ETTA VALE');
    expect(rec?.portraitSlotId).toBe('actor.swresident-001.portrait.primary');
    const url = resolveCastingCardImage('SW-RESIDENT-001');
    expect(listStudioWorldResidentTalentActors()[0].headshotPreviewUrl).toBe(url);
  });

  it('role visual override cannot substitute uniform imagery', () => {
    const iona = findResidentDossierById('SW-RESIDENT-006')!;
    const uniform = getResidentVisualProjection('SW-RESIDENT-006')!.uniformRefs[0]!;
    const res = validateCastRoleOverridesForResident(iona, { faceReplacement: uniform, wardrobe: 'lab coat' });
    expect(res.ok).toBe(false);
  });

  it('manifest base path is registered', () => {
    expect(existsSync(join(PUBLIC_ROOT, STUDIO_WORLD_SEASON1_VISUAL_BASE.replace(/^\//, ''), 'manifest.json'))).toBe(true);
  });
});
