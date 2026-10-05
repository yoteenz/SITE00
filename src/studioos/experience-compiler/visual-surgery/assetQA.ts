import type { AssetFabricationSpec, AssetQAResult, ImageRequirement } from './visualSurgeryTypes';
import { validateMustIncludeExclude } from './imageRequirements';

export function qaImageRequirement(req: ImageRequirement): AssetQAResult {
  const checks: AssetQAResult['checks'] = [];
  checks.push({ check: 'ASSET_ID', passed: Boolean(req.asset_id), detail: req.asset_id });
  checks.push({ check: 'FAMILY', passed: Boolean(req.family), detail: req.family });
  checks.push({ check: 'CONTINUITY', passed: Boolean(req.continuity_group), detail: req.continuity_group });
  checks.push({
    check: 'DIMENSIONS',
    passed: req.target_output_size.w > 0 && req.target_output_size.h > 0,
    detail: `${req.target_output_size.w}x${req.target_output_size.h}`,
  });
  checks.push({ check: 'ASPECT', passed: Boolean(req.aspect_ratio), detail: req.aspect_ratio });
  checks.push({
    check: 'TRANSPARENCY',
    passed:
      req.asset_type === 'TRANSPARENT_OBJECT'
        ? req.transparency && req.output_format === 'png'
        : !req.transparency || req.output_format === 'webp',
    detail: String(req.transparency),
  });
  const must = validateMustIncludeExclude(req);
  checks.push({ check: 'MUST_INCLUDE', passed: must.ok, detail: must.errors.join('; ') || 'ok' });
  checks.push({ check: 'MUST_EXCLUDE', passed: req.must_exclude.length > 0, detail: `${req.must_exclude.length} rules` });
  checks.push({
    check: 'NO_BAKED_UI',
    passed: !req.must_include.some((m) => /nav|button|header|label/i.test(m)),
    detail: 'must_include free of UI terms',
  });
  checks.push({
    check: 'NO_TEXT',
    passed: req.must_exclude.some((m) => /text|copy|label/i.test(m)),
    detail: 'must_exclude mentions text',
  });
  checks.push({
    check: 'NO_ICON_CONTAMINATION',
    passed: req.must_exclude.some((m) => /icon/i.test(m)),
    detail: 'must_exclude mentions icons',
  });
  checks.push({ check: 'NEGATIVE_SPACE', passed: req.negative_space !== undefined, detail: 'modeled' });
  checks.push({ check: 'CROP_SAFETY', passed: req.safe_zones.length > 0 || req.asset_type !== 'ENVIRONMENT_IMAGE', detail: req.safe_zones.join(',') });
  return {
    asset_id: req.asset_id,
    passed: checks.every((c) => c.passed),
    checks,
  };
}

export function qaFabricationSpec(spec: AssetFabricationSpec): AssetQAResult {
  const checks: AssetQAResult['checks'] = [
    { check: 'ASSET_ID', passed: Boolean(spec.asset_id), detail: spec.asset_id },
    { check: 'MUST_INCLUDE', passed: spec.must_include.length > 0, detail: `${spec.must_include.length}` },
    { check: 'MUST_EXCLUDE', passed: spec.must_exclude.length > 0, detail: `${spec.must_exclude.length}` },
    { check: 'NO_BAKED_UI', passed: spec.must_exclude.some((x) => /navigation|header|text/i.test(x)), detail: 'exclusions' },
  ];
  return { asset_id: spec.asset_id, passed: checks.every((c) => c.passed), checks };
}

export function crossContaminationCheck(req: ImageRequirement): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (req.asset_type === 'ENVIRONMENT_IMAGE') {
    if (req.must_include.some((m) => /icon|button|nav/i.test(m))) issues.push('environment must_include contains UI');
    if (!req.must_exclude.some((m) => /tower|machine|card/i.test(m))) issues.push('environment should exclude foreground objects');
  }
  if (req.asset_type === 'CARD_IMAGE' && !req.must_exclude.some((m) => /title|label|copy/i.test(m))) {
    issues.push('card image should exclude copy');
  }
  return { ok: issues.length === 0, issues };
}

export function previewAssetQA(requirements: ImageRequirement[], specs: AssetFabricationSpec[]): AssetQAResult[] {
  const reqResults = requirements.filter((r) => r.grok_required).map(qaImageRequirement);
  const specResults = specs.map(qaFabricationSpec);
  return [...reqResults, ...specResults.filter((s) => !reqResults.some((r) => r.asset_id === s.asset_id))];
}
