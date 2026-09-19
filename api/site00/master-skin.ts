/**
 * Master Skin System API.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  approveProjectSkin,
  consumeIdentityForSkinRecommendation,
  getProjectExperienceSkin,
  initializeProjectSkinFromOnboarding,
  recommendMasterSkins,
  skinInspectorPayload,
} from '../../shared/site00-brand-lore/projectSkin/integration.js';
import { getMasterSkinById, listMasterSkins } from '../../shared/site00-brand-lore/projectSkin/catalog.js';
import { listProjectExperienceSkins } from '../../shared/site00-brand-lore/projectSkin/projectSkinStore.js';
import {
  approveSkinMigration,
  createSkinMigrationPreview,
  getSkinMigration,
  rollbackSkinMigration,
} from '../../shared/site00-brand-lore/projectSkin/migration.js';
import {
  runMasterSkinConsistencyQA,
  runMasterSkinDistinctivenessQA,
  runMasterSkinHostFirewallQA,
} from '../../shared/site00-brand-lore/projectSkin/qa.js';
import { resolveModuleSkin } from '../../shared/site00-brand-lore/projectSkin/resolver.js';
import { addProjectSkinOverride } from '../../shared/site00-brand-lore/projectSkin/projectSkinStore.js';
import type { FieldIndustryTag } from '../../shared/site00-brand-lore/projectSkin/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action ?? req.body?.action ?? 'catalog');

  try {
    if (req.method === 'GET') {
      if (action === 'catalog') {
        return res.status(200).json({ ok: true, skins: listMasterSkins() });
      }
      if (action === 'get') {
        const projectId = String(req.query.projectId ?? '');
        const binding = getProjectExperienceSkin(projectId);
        const skin = binding ? getMasterSkinById(binding.masterSkinId) : null;
        return res.status(200).json({ ok: true, binding, skin, inspector: skinInspectorPayload(projectId) });
      }
      if (action === 'resolve') {
        const projectId = String(req.query.projectId ?? '');
        const moduleId = String(req.query.moduleId ?? 'EVOLVE');
        return res.status(200).json({ ok: true, resolved: resolveModuleSkin(projectId, moduleId) });
      }
      if (action === 'list') {
        return res.status(200).json({ ok: true, bindings: listProjectExperienceSkins() });
      }
      if (action === 'qa') {
        const skinA = String(req.query.skinA ?? 'cultural-editorial');
        const skinB = String(req.query.skinB ?? 'clinical-editorial');
        return res.status(200).json({
          ok: true,
          distinctiveness: runMasterSkinDistinctivenessQA(skinA, skinB),
          consistencyA: runMasterSkinConsistencyQA(skinA),
          hostFirewall: runMasterSkinHostFirewallQA(),
        });
      }
      return res.status(400).json({ ok: false, error: 'Unknown GET action' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const body = req.body ?? {};

    switch (action) {
      case 'recommend': {
        const recommendation = recommendMasterSkins({
          fieldTags: (body.fieldTags ?? ['OTHER']) as FieldIndustryTag[],
          brandPersonality: body.brandPersonality,
          identityPersonalityTags: body.identityPersonalityTags,
          identityPrimaryColor: body.primaryColor,
          audience: body.audience,
          projectType: body.projectType,
        });
        return res.status(200).json({ ok: true, recommendation });
      }
      case 'recommend_from_identity': {
        const recommendation = consumeIdentityForSkinRecommendation({
          fieldTags: body.fieldTags,
          brandPersonality: body.brandPersonality,
          primaryColor: body.primaryColor,
          audience: body.audience,
          projectType: body.projectType,
        });
        return res.status(200).json({ ok: true, recommendation });
      }
      case 'approve': {
        const binding = approveProjectSkin({
          projectId: String(body.projectId),
          selectedSkinId: String(body.selectedSkinId),
          selectedBy: String(body.selectedBy ?? 'founder'),
          primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
        });
        if (!binding) return res.status(404).json({ ok: false, error: 'Skin not found' });
        return res.status(200).json({ ok: true, binding });
      }
      case 'onboarding_complete': {
        const recommendation = recommendMasterSkins({
          fieldTags: (body.fieldTags ?? ['OTHER']) as FieldIndustryTag[],
          brandPersonality: body.brandPersonality,
          audience: body.audience,
        });
        const binding = initializeProjectSkinFromOnboarding({
          projectId: String(body.projectId),
          fieldTags: (body.fieldTags ?? ['OTHER']) as FieldIndustryTag[],
          recommendedSkinId: recommendation.recommendedSkinId,
          selectedSkinId: String(body.selectedSkinId ?? recommendation.recommendedSkinId),
          primaryColor: String(body.primaryColor ?? '#333333'),
          founderApproved: body.founderApproved === true,
          selectedBy: String(body.selectedBy ?? 'founder'),
          recommendation,
        });
        return res.status(200).json({ ok: true, binding, recommendation });
      }
      case 'override': {
        const binding = addProjectSkinOverride(String(body.projectId), {
          moduleId: body.moduleId ?? null,
          panelDensity: body.panelDensity,
          heroTreatment: body.heroTreatment,
          imageRadius: body.imageRadius ? Number(body.imageRadius) : undefined,
          accentCoverage: body.accentCoverage,
        });
        return res.status(200).json({ ok: true, binding });
      }
      case 'migration_preview': {
        const migration = createSkinMigrationPreview({
          projectId: String(body.projectId),
          toSkinId: String(body.toSkinId),
        });
        if (!migration) return res.status(404).json({ ok: false, error: 'Migration preview failed' });
        return res.status(200).json({ ok: true, migration });
      }
      case 'migration_approve': {
        const migration = approveSkinMigration(String(body.migrationId), String(body.selectedBy ?? 'founder'));
        if (!migration) return res.status(404).json({ ok: false, error: 'Migration not found' });
        return res.status(200).json({ ok: true, migration });
      }
      case 'migration_rollback': {
        const migration = rollbackSkinMigration(String(body.migrationId));
        if (!migration) return res.status(404).json({ ok: false, error: 'Migration not found' });
        return res.status(200).json({ ok: true, migration });
      }
      default:
        return res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: message });
  }
}
