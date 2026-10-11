/**
 * P0.JURNL.CREATIVE-WORLD.BESPOKE-COMPOSITION-GRAMMAR-LOCK1
 * The five-level grammar is locked, inherited by every JURNL family, and matches the manifest.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { jurnlCreativeGrammar as G } from '../shared/studioos-visual-authority/index';

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'JURNL/MANIFEST/JURNL_CREATIVE_GRAMMAR.json');

describe('JURNL bespoke composition grammar', () => {
  it('locks every creative flag', () => {
    expect(G.checkJurnlCreativeGrammar().status).toBe('GRAMMAR_LOCKED');
    expect(G.JURNL_CREATIVE_GRAMMAR.flags).toEqual({
      composition_driven: true,
      environment_driven: true,
      artifact_driven: true,
      material_collision_required: true,
      graphic_expression_required: true,
      centered_card_default_forbidden: true,
      mediterranean_only_not_sufficient: true,
      art_history_as_structure_not_decoration: true,
      bespoke_object_system_required: true,
      asymmetry_required: true,
      unexpected_object_relationship_required: true,
      official_brand_asset_required: true,
      alternate_logo_invention_forbidden: true,
      five_level_creative_grammar_required: true,
      family_world_required: true,
      multiple_spatial_stations_required: true,
      composition_rotation_required: true,
      campaign_image_without_ui_test_required: true,
      blur_distinctness_test_required: true,
      artifact_only_interpretation_forbidden: true,
      generic_stationery_drift_forbidden: true,
      contrast_anchor_required: true,
      parent_first_only: true,
      unapproved_parent_sidekick_generation_forbidden: true,
      unapproved_parent_component_generation_forbidden: true,
      unapproved_parent_overlay_extraction_forbidden: true,
      unapproved_parent_descendant_generation_forbidden: true,
      plate_derives_from_approved_parent: true,
      components_derive_from_approved_parent: true,
      overlays_derive_from_approved_parent: true,
      founder_lock_required_before_explosion: true,
      courtroom_or_masculine_study_drift_forbidden: true,
    });
    expect(G.JURNL_CREATIVE_GRAMMAR.official_brand_asset).toBe('public/site00/projects/jurnl/brand/jurnl-logo-official.png');
  });

  it('inherits across the product families and keeps ENTRY descendants blocked', () => {
    expect(G.JURNL_CREATIVE_GRAMMAR.families).toEqual([
      'ENTRY', 'SETUP', 'TODAY', 'ACTIVITY', 'MONEY', 'INCOME', 'UPCOMING', 'PLAN',
      'SAFE TO SPEND', 'PURCHASES', 'TRIPS', 'CREDIT', 'PAYDOWN', 'GOALS', 'AHEAD', 'RECORDS',
    ]);
    expect(G.JURNL_CREATIVE_GRAMMAR.levels.map((level) => level.id)).toEqual([
      'COMPOSITION', 'ENVIRONMENT', 'ARTIFACT', 'MATERIAL_RELATIONSHIP', 'GRAPHIC_EXPRESSION',
    ]);
    expect(G.JURNL_CREATIVE_GRAMMAR.entry.retain).toHaveLength(7);
    expect(G.JURNL_CREATIVE_GRAMMAR.entry.rework.map((screen) => screen.screen_id)).toEqual([
      '08_BIOMETRIC_SETUP', '09_DEVICE_TRUST', '10_FORGOT_PASSWORD', '11_RESET_PASSWORD',
      '12_PRIVACY_PRIMER', '13_SECURITY_PRIMER', '14_ENTRY_COMPLETE',
    ]);
    expect(G.JURNL_CREATIVE_GRAMMAR.entry.descendant_generation).toBe('BLOCKED_PENDING_FOUNDER_APPROVAL');
  });

  it('matches the committed manifest', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    expect(manifest).toEqual(G.JURNL_CREATIVE_GRAMMAR);
  });
});
