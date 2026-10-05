import type { CreativeExperienceGraph, ExperienceFamily, FamilySurfaceExpression, ProjectExperienceIntelligence } from '../map2/map2Types';
import { compileIconRequirements } from './iconRequirements';
import { deriveIconExpression } from './iconExpressions';
import { buildIconFamily } from './iconFamilies';
import { compileIconSurfaceVariants } from './iconSurfaceVariants';
import { planIconFamilyAuthority } from './iconAuthorityPlanner';
import { compileMicroAssetFamily } from './microAssetFamilies';
import { compileIconManifest, compileGrokIconHandoff, iconRulesMarkdown } from './iconManifestCompiler';
import { validateIconCoverage } from './iconCoverage';
import type { IconPipelineSlice } from './iconTypes';

export function runIconPipeline(input: {
  project_id: string;
  graph: CreativeExperienceGraph;
  families: ExperienceFamily[];
  surface_expressions: FamilySurfaceExpression[];
  intelligence?: ProjectExperienceIntelligence | null;
  auto_approve_family?: boolean;
}): IconPipelineSlice {
  const icon_requirements = compileIconRequirements(input);
  const icon_expression = deriveIconExpression(input.project_id, input.intelligence);
  let icon_family = buildIconFamily(input.project_id, icon_expression, icon_requirements.requirements);
  if (input.auto_approve_family) icon_family = { ...icon_family, status: 'APPROVED' };
  const icon_surface_variants = compileIconSurfaceVariants(icon_family, icon_requirements.requirements);
  const icon_family_authority = planIconFamilyAuthority(icon_family, icon_requirements.requirements);
  const micro_asset_family = compileMicroAssetFamily(input.project_id, icon_requirements.requirements);
  const icon_manifest = compileIconManifest(input.project_id, icon_family, icon_requirements.requirements);
  const grok_handoff = compileGrokIconHandoff(
    icon_family_authority.authority_id,
    icon_manifest,
    micro_asset_family ? `MICRO_ASSET_${micro_asset_family.micro_asset_family_id}` : null,
  );
  const icon_coverage = validateIconCoverage(icon_requirements.requirements, icon_manifest);
  return {
    icon_requirements,
    icon_expression,
    icon_family,
    icon_surface_variants,
    icon_family_authority,
    micro_asset_family,
    icon_manifest,
    grok_handoff,
    icon_coverage,
    icon_expression_approved: icon_family.status === 'APPROVED',
  };
}

export { iconRulesMarkdown };
