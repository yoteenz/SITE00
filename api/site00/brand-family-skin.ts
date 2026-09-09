/**
 * Brand Family Skin System API.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  approveBrandFamilyAssignment,
  getExperienceSkinManagementPayload,
  initializeBrandFamilyFromOnboarding,
  listBrandFamilySkins,
  processFirstApprovedAuthority,
} from '../../shared/site00-brand-lore/projectSkin/brandFamily/integration.js';
import {
  getProjectBrandFamilyBinding,
  listBrandFamilyProjectBindings,
} from '../../shared/site00-brand-lore/projectSkin/brandFamily/projectBinding.js';
import { brandFamilyInspectorPayload, resolveBrandFamilySkin } from '../../shared/site00-brand-lore/projectSkin/brandFamily/resolver.js';
import {
  approveBrandFamilySkinMigration,
  createBrandFamilySkinMigrationPreview,
  rollbackBrandFamilySkinMigration,
} from '../../shared/site00-brand-lore/projectSkin/brandFamily/migration.js';
import {
  runBrandFamilyHostFirewallQA,
  runBrandFamilySkinConsistencyQA,
  runBrandFamilySkinDistinctivenessQA,
} from '../../shared/site00-brand-lore/projectSkin/brandFamily/qa.js';
import { getStandardScreenPackStatus } from '../../shared/site00-brand-lore/projectSkin/brandFamily/skinPack.js';
import { listScreenAuthoritiesForFamily } from '../../shared/site00-brand-lore/projectSkin/brandFamily/screenAuthority.js';
import type { FieldIndustryTag } from '../../shared/site00-brand-lore/projectSkin/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action ?? req.body?.action ?? 'registry');

  try {
    if (req.method === 'GET') {
      if (action === 'registry') {
        const families = listBrandFamilySkins();
        return res.status(200).json({
          ok: true,
          families,
          screenPackByFamily: Object.fromEntries(
            families.map((f) => [f.brandKey, getStandardScreenPackStatus(f.id)]),
          ),
        });
      }
      if (action === 'get') {
        const projectId = String(req.query.projectId ?? '');
        const binding = getProjectBrandFamilyBinding(projectId);
        const resolved = resolveBrandFamilySkin(projectId, 'OVERVIEW', 'PROJECT_OVERVIEW');
        return res.status(200).json({
          ok: true,
          binding,
          resolved,
          management: getExperienceSkinManagementPayload(projectId),
          inspector: brandFamilyInspectorPayload(projectId),
        });
      }
      if (action === 'authorities') {
        const brandFamilySkinId = String(req.query.brandFamilySkinId ?? '');
        return res.status(200).json({
          ok: true,
          authorities: listScreenAuthoritiesForFamily(brandFamilySkinId),
        });
      }
      if (action === 'qa') {
        const skinA = String(req.query.skinA ?? 'AIO');
        const skinB = String(req.query.skinB ?? 'STUDIO_WORLD');
        return res.status(200).json({
          ok: true,
          distinctiveness: runBrandFamilySkinDistinctivenessQA(skinA, skinB),
          consistencyA: runBrandFamilySkinConsistencyQA(skinA),
          hostFirewall: runBrandFamilyHostFirewallQA(),
        });
      }
      return res.status(400).json({ ok: false, error: 'Unknown GET action' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const body = req.body ?? {};

    switch (action) {
      case 'approve_assignment': {
        const binding = approveBrandFamilyAssignment({
          projectId: String(body.projectId),
          brandFamilySkinId: String(body.brandFamilySkinId),
          selectedBy: String(body.selectedBy ?? 'founder'),
          primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
        });
        if (!binding) return res.status(404).json({ ok: false, error: 'Brand family not found' });
        return res.status(200).json({ ok: true, binding });
      }
      case 'onboarding_complete': {
        const binding = initializeBrandFamilyFromOnboarding({
          projectId: String(body.projectId),
          projectName: body.projectName ? String(body.projectName) : undefined,
          fieldTags: (body.fieldTags ?? ['OTHER']) as FieldIndustryTag[],
          brandFamilySkinId: body.brandFamilySkinId ? String(body.brandFamilySkinId) : undefined,
          founderApproved: body.founderApproved === true,
          selectedBy: String(body.selectedBy ?? 'founder'),
          primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
        });
        return res.status(200).json({ ok: true, binding });
      }
      case 'approve_authority': {
        const result = processFirstApprovedAuthority({
          brandFamilySkinId: String(body.brandFamilySkinId),
          moduleId: String(body.moduleId ?? 'OVERVIEW'),
          screenType: String(body.screenType ?? 'PROJECT_OVERVIEW'),
          viewport: body.viewport === 'DESKTOP' ? 'DESKTOP' : 'MOBILE',
          referenceAssetId: String(body.referenceAssetId),
          projectId: String(body.projectId),
        });
        return res.status(200).json({ ok: true, ...result });
      }
      case 'migration_preview': {
        const migration = createBrandFamilySkinMigrationPreview({
          projectId: String(body.projectId),
          toBrandFamilySkinId: String(body.toBrandFamilySkinId),
        });
        if (!migration) return res.status(404).json({ ok: false, error: 'Migration preview failed' });
        return res.status(200).json({ ok: true, migration });
      }
      case 'migration_approve': {
        const migration = approveBrandFamilySkinMigration(String(body.migrationId), String(body.selectedBy ?? 'founder'));
        if (!migration) return res.status(404).json({ ok: false, error: 'Migration not found' });
        return res.status(200).json({ ok: true, migration });
      }
      case 'migration_rollback': {
        const migration = rollbackBrandFamilySkinMigration(String(body.migrationId));
        if (!migration) return res.status(404).json({ ok: false, error: 'Migration not found' });
        return res.status(200).json({ ok: true, migration });
      }
      case 'list_bindings':
        return res.status(200).json({ ok: true, bindings: listBrandFamilyProjectBindings() });
      default:
        return res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: message });
  }
}
