import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { findFabricationActor } from '../shared/site00-character-fabrication/actors.js';
import { listStudioWorldResidentTalentActors } from '../shared/site00-studio-world/acting-catalogue/index.js';
import {
  buildCastingThumbnailAuthority,
  listCastingThumbnailResidentIds,
  STUDIO_WORLD_CASTING_THUMBNAIL_BASE,
} from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/castingThumbnailAuthority.js';
import { findResidentDossierById } from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/residents.js';
import {
  getCastingThumbnailAuthority,
  getResidentVisualProjection,
  listResidentVisualProjections,
  resolveCastingCardImage,
} from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/visualAuthority.js';

const PUBLIC_ROOT = join(process.cwd(), 'public');

describe('P0.STUDIOOS.PRODUCTION.EXPRESSION.CASTING-THUMBNAIL-AUTHORITY1', () => {
  it('has exactly 8 CASTING_THUMBNAIL assets on disk', () => {
    expect(listCastingThumbnailResidentIds()).toHaveLength(8);
    for (const id of listCastingThumbnailResidentIds()) {
      const auth = buildCastingThumbnailAuthority(id)!;
      const disk = join(PUBLIC_ROOT, auth.url.replace(/^\//, ''));
      expect(existsSync(disk), disk).toBe(true);
      expect(auth.authorityType).toBe('CASTING_THUMBNAIL');
      expect(auth.scope).toBe('SITE00_PRODUCTION_EXPRESSION_CASTING');
    }
  });

  it('maps each thumbnail to the correct resident ID and dossier name', () => {
    const expected: Record<string, string> = {
      'SW-RESIDENT-001': 'ETTA VALE',
      'SW-RESIDENT-002': 'ZURI XU',
      'SW-RESIDENT-003': 'JULES MERCER',
      'SW-RESIDENT-004': 'NOA KLINE',
      'SW-RESIDENT-005': 'CASPIAN REED',
      'SW-RESIDENT-006': 'IONA WELLS',
      'SW-RESIDENT-007': 'MARLOWE SAINT',
      'SW-RESIDENT-008': 'ELIO "EV" VAHN',
    };
    for (const [id, name] of Object.entries(expected)) {
      expect(findResidentDossierById(id)?.canonicalName).toBe(name);
      expect(getCastingThumbnailAuthority(id)?.sourceResidentId).toBe(id);
      expect(resolveCastingCardImage(id)).toMatch(new RegExp(id.replace(/-/g, '-'), 'i'));
    }
  });

  it('Casting actor list uses CASTING_THUMBNAIL by default', () => {
    for (const a of listStudioWorldResidentTalentActors()) {
      expect(a.headshotPreviewUrl).toMatch(STUDIO_WORLD_CASTING_THUMBNAIL_BASE);
      expect(a.headshotPreviewUrl).toBe(resolveCastingCardImage(a.catalogueNumber));
      expect(getResidentVisualProjection(a.catalogueNumber)?.productionVisuals.castingThumbnail.url).toBe(
        a.headshotPreviewUrl,
      );
    }
  });

  it('does not use monogram-eligible missing URLs for residents', () => {
    for (const a of listStudioWorldResidentTalentActors()) {
      expect(a.headshotPreviewUrl).toBeTruthy();
    }
  });

  it('preserves natural-habitat and closeup authorities separately from casting thumbnail', () => {
    for (const v of listResidentVisualProjections()) {
      const thumb = v.productionVisuals.castingThumbnail.url;
      expect(v.primaryNaturalImage).not.toBe(thumb);
      expect(v.primaryNaturalImage).toMatch(/season1-v1/);
      expect(thumb).toMatch(/casting-thumbnails-v1/);
      for (const u of v.uniformRefs) {
        expect(thumb).not.toBe(u);
      }
      for (const u of v.alternateModeRefs) {
        expect(thumb).not.toBe(u);
      }
    }
  });

  it('Iona casting thumbnail is not full-glam alternate', () => {
    const v = getResidentVisualProjection('SW-RESIDENT-006')!;
    expect(v.productionVisuals.castingThumbnail.url).toMatch(/IONA_WELLS/i);
    expect(v.productionVisuals.castingThumbnail.url).not.toMatch(/full-glam/i);
    expect(v.alternateModeRefs[0]).toMatch(/full-glam/);
  });

  it('Marlowe body canon unchanged — natural authority still off-duty full-body', () => {
    const d = findResidentDossierById('SW-RESIDENT-007')!;
    expect(d.identityConstraints.join(' ')).toMatch(/54|larger-bodied/i);
    const v = getResidentVisualProjection('SW-RESIDENT-007')!;
    expect(v.primaryNaturalImage).toMatch(/off-duty-cultural-icon/);
    expect(v.productionVisuals.castingThumbnail.url).toMatch(/MARLOWE_SAINT/i);
  });

  it('Zuri Xu remains canonical — no Hale in any authority path', () => {
    expect(findResidentDossierById('SW-RESIDENT-002')!.canonicalName).toBe('ZURI XU');
    const v = getResidentVisualProjection('SW-RESIDENT-002')!;
    expect(JSON.stringify(v)).not.toMatch(/hale/i);
  });

  it('Character Fabrication portrait slots are not the casting thumbnail URL', () => {
    const rec = findFabricationActor('sw-resident-001');
    expect(rec?.portraitSlotId).toBe('actor.swresident-001.portrait.primary');
    const castUrl = resolveCastingCardImage('SW-RESIDENT-001')!;
    expect(castUrl).toMatch(/casting-thumbnails-v1/);
    expect(rec?.portraitSlotId).not.toContain('casting-thumbnails');
  });

  it('manifest.json registered beside thumbnails', () => {
    expect(
      existsSync(join(PUBLIC_ROOT, STUDIO_WORLD_CASTING_THUMBNAIL_BASE.replace(/^\//, ''), 'manifest.json')),
    ).toBe(true);
  });
});
