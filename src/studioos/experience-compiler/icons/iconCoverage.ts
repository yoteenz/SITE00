import type { IconManifest, IconRequirement, IconCoverageReport } from './iconTypes';

export function validateIconCoverage(requirements: IconRequirement[], manifest: IconManifest): IconCoverageReport {
  const missing: string[] = [];
  const counts = { total: requirements.length, live_svg: 0, brand_icon: 0, micro_asset: 0, external: 0, existing: 0 };
  for (const r of requirements) {
    if (r.implementation_class === 'LIVE_CODE_SVG') counts.live_svg++;
    else if (r.implementation_class === 'BRAND_ICON') counts.brand_icon++;
    else if (r.implementation_class === 'ILLUSTRATIVE_MICRO_ASSET') counts.micro_asset++;
    else if (r.implementation_class === 'EXTERNAL_PLATFORM_ICON') counts.external++;
    else if (r.implementation_class === 'EXISTING_BRAND_ASSET') counts.existing++;
    const covered = manifest.entries.some((e) => e.semantic_id === r.icon_semantic_id);
    if (!covered) missing.push(r.icon_semantic_id);
  }
  return { complete: missing.length === 0, missing, counts };
}

export function assertIconCoverageBeforeAuthorityComplete(report: IconCoverageReport): void {
  if (!report.complete) {
    throw new Error(`ICON_COVERAGE_INCOMPLETE: ${report.missing.join(', ')}`);
  }
}

export function projectVisualIsolation(projectA: string, projectB: string, familyIdA: string, familyIdB: string): boolean {
  return projectA !== projectB && familyIdA !== familyIdB;
}
