import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { NDX_ICON_REGISTRY } from '../shared/site00-studio-world-ui/icons/registry.js';
import {
  BOTTOM_NAV_ICON_FAMILY_V1,
  BOTTOM_NAV_ICON_MEMBERS_V1,
  BOTTOM_NAV_ICON_ORDER,
  VISUAL_FAMILY_REGISTRY,
  assetsInFamily,
  detectGenericFamilyDrift,
  evaluateInkMeasurements,
  inheritanceBrief,
} from '../shared/site00-studio-world-ui/icons/families/index.js';
import type { IconInkMeasurement } from '../shared/site00-studio-world-ui/icons/families/types.js';

const require = createRequire(import.meta.url);
const sharp = require('sharp') as typeof import('sharp');
const ROOT = join(import.meta.dirname, '..');

describe('BOTTOM_NAV_ICON_FAMILY V1', () => {
  it('registers seven founder-review members in order and does not mark them canonical', () => {
    expect(BOTTOM_NAV_ICON_FAMILY_V1.familyId).toBe('BOTTOM_NAV_ICON_FAMILY');
    expect(BOTTOM_NAV_ICON_FAMILY_V1.version).toBe('V1');
    expect(BOTTOM_NAV_ICON_FAMILY_V1.status).toBe('FOUNDER_REVIEW');
    expect(BOTTOM_NAV_ICON_FAMILY_V1.lastApprovedAt).toBeNull();
    expect(BOTTOM_NAV_ICON_MEMBERS_V1.map((row) => row.semanticRole)).toEqual([...BOTTOM_NAV_ICON_ORDER]);
    expect(BOTTOM_NAV_ICON_MEMBERS_V1.every((row) => row.canonStatus === 'FOUNDER_REVIEW')).toBe(true);
    expect(assetsInFamily('BOTTOM_NAV_ICON_FAMILY', 'SUPERSEDED')).toHaveLength(7);
  });

  it('points at the existing NDX registry instead of copying its geometry', () => {
    expect(VISUAL_FAMILY_REGISTRY.NDX_ICON_FAMILY.canonicalExamples.length).toBe(Object.keys(NDX_ICON_REGISTRY).length);
    expect(VISUAL_FAMILY_REGISTRY.NDX_ICON_FAMILY.referenceAssets[0]).toContain('icons/registry.ts');
  });

  it('flags generic icon-library drift and accepts this family construction', () => {
    const drifted = detectGenericFamilyDrift({
      linecap: 'round',
      linejoin: 'round',
      strokeWidths: [1.5, 2.4],
      cornerMode: 'MIXED_UNRELATED',
      bakedRed: true,
      innerCore: false,
      silhouette: 'GENERIC_LIBRARY',
    });
    expect(drifted.code).toBe('GENERIC_FAMILY_DRIFT');
    expect(drifted.verdict).toBe('FAIL');
    const family = detectGenericFamilyDrift({
      linecap: BOTTOM_NAV_ICON_FAMILY_V1.geometryRules.linecap,
      linejoin: BOTTOM_NAV_ICON_FAMILY_V1.geometryRules.linejoin,
      strokeWidths: [BOTTOM_NAV_ICON_FAMILY_V1.geometryRules.strokeWidth],
      cornerMode: BOTTOM_NAV_ICON_FAMILY_V1.geometryRules.cornerMode,
      bakedRed: BOTTOM_NAV_ICON_FAMILY_V1.geometryRules.bakedRed,
      innerCore: BOTTOM_NAV_ICON_FAMILY_V1.geometryRules.innerCoreRequired,
      silhouette: 'FAMILY_OBJECT',
    });
    expect(family.flagged).toBe(false);
  });

  it('measures transparent charcoal masters and passes family QA', async () => {
    const measured = JSON.parse(
      readFileSync(join(ROOT, 'docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1/qa/measurements.json'), 'utf8'),
    ) as { icons: Record<string, IconInkMeasurement> };
    for (const member of BOTTOM_NAV_ICON_MEMBERS_V1) {
      const png = sharp(join(ROOT, member.file));
      const meta = await png.metadata();
      expect(meta.width).toBe(512);
      expect(meta.height).toBe(512);
      const { data, info } = await png.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect(data[3]).toBe(0);
      let red = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        if (data[i + 3] > 16 && data[i] > 160 && data[i + 1] < 100 && data[i + 2] < 100) red += 1;
      }
      expect(red).toBe(0);
    }
    const qa = evaluateInkMeasurements(BOTTOM_NAV_ICON_FAMILY_V1, measured.icons, [...BOTTOM_NAV_ICON_ORDER]);
    expect(qa.overall).toBe('PASS');
  });

  it('inheritance starts from the family and does not create a canonical asset', () => {
    const brief = inheritanceBrief(BOTTOM_NAV_ICON_FAMILY_V1, 'HUB');
    expect(brief.steps[0]).toBe('SELECT_FAMILY');
    expect(brief.canonStatusOnCreate).toBe('DRAFT');
    expect(brief.closestExamples).toHaveLength(7);
  });

  it('does not change the live production nav icons', () => {
    const nav = readFileSync(join(ROOT, 'src/site00/components/productionHub/icons.tsx'), 'utf8');
    expect(nav).toContain('export function IcHome');
    expect(nav).toContain('export function IcClock');
    expect(nav.includes('BOTTOM_NAV_ICON_FAMILY_V1')).toBe(false);
  });
});
