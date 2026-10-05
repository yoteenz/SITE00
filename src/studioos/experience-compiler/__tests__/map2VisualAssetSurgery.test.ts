import { describe, expect, it } from 'vitest';
import { runGreenfieldMap2Pipeline } from '../map2/map2Orchestrator';
import { buildSite00IngestFixture } from '../map2/site00Ingest';
import { buildSite00VisualSurgeryFixture } from '../visual-surgery/site00VisualSurgery';
import { ownershipForAssetSlot, isImageOwnership, globalUiExclusions } from '../visual-surgery/layerOwnership';
import { decomposeAuthorityScreen } from '../visual-surgery/sceneDecomposition';
import { validateMustIncludeExclude, compileImageRequirements } from '../visual-surgery/imageRequirements';
import { assignContinuityGroups, validateSameWorld } from '../visual-surgery/continuityGroups';
import { compileImageSurfaceVariants } from '../visual-surgery/imageSurfaceVariants';
import { compileReferenceCrops } from '../visual-surgery/referenceCropCompiler';
import { compileSafeZoneMaps } from '../visual-surgery/safeZoneCompiler';
import { compileAssetDependencies, generationOrder } from '../visual-surgery/assetDependencies';
import { canonicalImageFilename } from '../visual-surgery/canonicalFilenames';
import { compileGrokAssetPack, GROK_ASSET_PACK_FILES } from '../visual-surgery/grokAssetPackCompiler';
import { crossContaminationCheck, qaImageRequirement } from '../visual-surgery/assetQA';
import { PUBLIC_REDESIGN_AUTHORITY_RECORDS } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { PUBLIC_REDESIGN_ASSET_SLOTS, getAssetSlot } from '../../../site00/authority/publicRedesignAssetSlots';
import { runExperienceCompiler } from '../compilerEngine';

describe('MAP1 / MAP2 compatibility', () => {
  it('MAP1 compiler still runs', () => {
    expect(runExperienceCompiler().nodes.length).toBeGreaterThan(10);
  });

  it('MAP2 greenfield pipeline unchanged shape', () => {
    const gf = runGreenfieldMap2Pipeline();
    expect(gf.icon_pipeline).toBeTruthy();
    expect(gf.visual_surgery_pipeline).toBeNull();
  });
});

describe('scene decomposition', () => {
  it('decomposes BLDR command center with live UI and asset layers', () => {
    const auth = PUBLIC_REDESIGN_AUTHORITY_RECORDS.find((a) => a.id === '01_BLDR_COMMAND_CENTER')!;
    const d = decomposeAuthorityScreen(auth);
    expect(d.layers.some((l) => l.ownership_type === 'LIVE_CODE_UI')).toBe(true);
    expect(d.layers.some((l) => l.ownership_type === 'LIVE_SVG')).toBe(true);
    expect(d.layers.some((l) => l.asset_slot_id === 'ENV.BLDR.COMMAND_CENTER')).toBe(true);
    expect(d.layers.some((l) => l.asset_slot_id === 'MACHINE.BLDR.TOWER')).toBe(true);
    expect(d.layers.filter((l) => l.asset_slot_id?.startsWith('CARD.BLDR')).length).toBe(4);
  });
});

describe('layer ownership', () => {
  it('classifies slots and excludes live UI from images', () => {
    const env = getAssetSlot('ENV.BLDR.COMMAND_CENTER')!;
    expect(ownershipForAssetSlot(env)).toBe('ENVIRONMENT_IMAGE');
    const tower = getAssetSlot('MACHINE.BLDR.TOWER')!;
    expect(ownershipForAssetSlot(tower)).toBe('TRANSPARENT_OBJECT');
    expect(globalUiExclusions().length).toBeGreaterThan(5);
    expect(isImageOwnership('LIVE_CODE_UI')).toBe(false);
  });
});

describe('image requirements', () => {
  it('SITE 00 discovers grok-required assets with must include/exclude', () => {
    const fx = buildSite00VisualSurgeryFixture();
    const reqs = fx.pipeline.image_requirements.requirements;
    expect(reqs.length).toBeGreaterThan(40);
    expect(reqs.every((r) => r.must_include.length && r.must_exclude.length)).toBe(true);
    for (const r of reqs.slice(0, 5)) {
      expect(validateMustIncludeExclude(r).ok).toBe(true);
    }
  });

  it('canonical filenames are deterministic', () => {
    const slot = getAssetSlot('ENV.ORIGIN.COLLAPSED')!;
    expect(canonicalImageFilename(slot)).toBe('img-env-origin-collapsed-master.webp');
    expect(canonicalImageFilename(getAssetSlot('MACHINE.BLDR.TOWER')!)).toContain('transparent.png');
  });
});

describe('continuity and multi-surface', () => {
  it('assigns BLDR and EVOLVE continuity groups', () => {
    const fx = buildSite00VisualSurgeryFixture();
    expect(fx.validation.bldr_continuity).toBe(true);
    expect(fx.validation.evolve_continuity).toBe(true);
    const bldr = fx.pipeline.continuity_groups.find((c) => c.continuity_group_id === 'BLDR_WORLD_SYSTEM_V1')!;
    expect(validateSameWorld(bldr, {})).toBe(true);
  });

  it('surface derivation includes extended canvas for environments', () => {
    const fx = buildSite00VisualSurgeryFixture();
    const variants = fx.pipeline.surface_variants;
    expect(variants.some((v) => v.derivation === 'EXTENDED_CANVAS')).toBe(true);
    expect(variants.some((v) => v.derivation === 'SAME_ASSET_DIFFERENT_CROP')).toBe(true);
  });
});

describe('reference crops and safe zones', () => {
  it('creates reference crop and safe zone metadata', () => {
    const fx = buildSite00VisualSurgeryFixture();
    expect(fx.pipeline.reference_crops.length).toBe(fx.pipeline.image_requirements.requirements.length);
    expect(fx.pipeline.safe_zone_maps.length).toBeGreaterThan(10);
  });
});

describe('asset dependencies and grok pack', () => {
  it('models BLDR lineage and generation order', () => {
    const fx = buildSite00VisualSurgeryFixture();
    const deps = fx.pipeline.asset_dependencies;
    expect(deps.some((d) => d.parent_asset === 'ENV.BLDR.COMMAND_CENTER')).toBe(true);
    expect(generationOrder(deps).length).toBeGreaterThan(0);
  });

  it('compiles grok asset pack structure', () => {
    const fx = buildSite00VisualSurgeryFixture();
    const pack = fx.pipeline.grok_asset_pack;
    expect(pack.files.length).toBeGreaterThan(50);
    expect(GROK_ASSET_PACK_FILES.every((f) => pack.files.some((p) => p.includes(f)))).toBe(true);
  });
});

describe('QA and contamination', () => {
  it('passes requirement QA and blocks environment icon bake', () => {
    const fx = buildSite00VisualSurgeryFixture();
    const env = fx.pipeline.image_requirements.requirements.find((r) => r.asset_id === 'ENV.BLDR.COMMAND_CENTER')!;
    expect(qaImageRequirement(env).passed).toBe(true);
    expect(crossContaminationCheck(env).ok).toBe(true);
  });
});

describe('SITE 00 ingest fixture wiring', () => {
  it('attach visual surgery to ingest pipeline sketch', () => {
    const ingest = buildSite00IngestFixture();
    expect(ingest.pipeline_sketch.visual_surgery_pipeline).toBeTruthy();
    expect(ingest.pipeline_sketch.visual_surgery_pipeline!.screens_analyzed).toBe(PUBLIC_REDESIGN_AUTHORITY_RECORDS.length);
  });
});

describe('greenfield placeholder', () => {
  it('supports empty authority list without throw', () => {
    const manifest = compileImageRequirements({
      project_id: 'lumina',
      authorities: [],
      decompositions: [],
    });
    expect(manifest.requirements).toEqual([]);
  });
});
