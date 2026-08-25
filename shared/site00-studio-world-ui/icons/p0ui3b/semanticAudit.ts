import type { NDXIconName } from '../types.js';
import type { SemanticSubstitutionAudit } from './types.js';
import { NDX_ICON_REFERENCE_SILHOUETTE, NDX_ICON_V0_SEMANTIC_SILHOUETTE } from './constants.js';
import { classifyImplementationSilhouette, detectSemanticSubstitution } from './evaluation.js';

export function auditSemanticSubstitution(
  iconName: NDXIconName,
  pathData: string[],
  circleCount = 0,
): SemanticSubstitutionAudit {
  const referenceSilhouette = NDX_ICON_REFERENCE_SILHOUETTE[iconName] ?? 'UNKNOWN';
  const implementationSilhouette = classifyImplementationSilhouette(iconName, pathData, circleCount);
  const v0Semantic = NDX_ICON_V0_SEMANTIC_SILHOUETTE[iconName];
  const isV0Match = v0Semantic && implementationSilhouette === v0Semantic;
  const isRefMismatch = referenceSilhouette !== 'UNKNOWN' && implementationSilhouette !== referenceSilhouette && implementationSilhouette !== 'TRACED';
  const failed = detectSemanticSubstitution(iconName, pathData) || isV0Match || isRefMismatch;

  return {
    iconName,
    referenceSilhouette,
    implementationSilhouette,
    passed: !failed,
    failureCode: failed ? 'FAIL_ICON_SEMANTIC_SUBSTITUTION' : undefined,
  };
}

export function auditAllSemanticSubstitutions(
  icons: Array<{ name: NDXIconName; paths: string[]; circles?: number }>,
): SemanticSubstitutionAudit[] {
  return icons.map(({ name, paths, circles }) => auditSemanticSubstitution(name, paths, circles ?? 0));
}

export function semanticSubstitutionsDetected(audits: SemanticSubstitutionAudit[]): boolean {
  return audits.some((a) => !a.passed);
}
