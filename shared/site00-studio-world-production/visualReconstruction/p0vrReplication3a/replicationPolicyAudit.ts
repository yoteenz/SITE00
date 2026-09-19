/**
 * P0.VR.REPLICATION.3A — Active policy rules with drift risk (replication path).
 */

import type { ReplicationPolicyAuditEntry } from './types.js';

export const REPLICATION_POLICY_AUDIT_ENTRIES: ReplicationPolicyAuditEntry[] = [
  {
    ruleId: 'profile-not-authority-image',
    source: 'p0vrReplication2/authorityShellBlueprint.ts',
    ruleText: 'Shell geometry sourced from pageRegionLayoutProfile, not authority bitmap segmentation',
    effect: 'Macro bands approximate authority; internal hero structure not read from image',
    driftRisk: 'HIGH',
    activeAtRuntime: true,
    recommendation: 'Add authority-image region tracer before blueprint write',
  },
  {
    ruleId: 'no-vision-on-replicate',
    source: 'p0vrReplication2/executeShellFirstNdxReplication.ts',
    ruleText: 'REPLICATE PAGE path does not invoke vision provider — detection is profile heuristic',
    effect: 'VISUAL_DETECTION stage cannot see lime graphic, image slices, CTA',
    driftRisk: 'HIGH',
    activeAtRuntime: true,
    recommendation: 'UPGRADE_VISUAL_MODEL or ADD_LITERAL_REGION_TRACER on authority PNG',
  },
  {
    ruleId: 'static-react-source',
    source: 'ShellFirstNdxOverviewTwin.tsx',
    ruleText: 'Twin source is hand-authored React shell — not generated from blueprint literals',
    effect: 'DECIDE/SOURCE stages collapse hero to single media block + copy',
    driftRisk: 'HIGH',
    activeAtRuntime: true,
    recommendation: 'FIX_SOURCE_GENERATOR to emit per-subregion DOM from blueprint',
  },
  {
    ruleId: 'direct-fallback-compose',
    source: 'p0vrReplication1R1/executeNdxbookReplication.ts',
    ruleText: 'DIRECT_SOURCE_RECONSTRUCTION may bypass blueprint composer on failure',
    effect: 'Policy favors shipping page over literal structure retention',
    driftRisk: 'MEDIUM',
    activeAtRuntime: true,
    recommendation: 'CHANGE_EXECUTION_POLICY — fail closed on literal loss for REPLICATION_MODE',
  },
  {
    ruleId: 'asset-pending-placeholder',
    source: 'ShellFirstNdxOverviewTwin.tsx',
    ruleText: 'Missing hero art falls back to AssetPendingPlaceholder',
    effect: 'Beige/empty slot replaces authority black/lime/slices',
    driftRisk: 'HIGH',
    activeAtRuntime: true,
    recommendation: 'FIX_ASSET_BINDING — bind authority-cropped assets first',
  },
  {
    ruleId: 'legacy-compose-deferred',
    source: 'p0vrUpgrade2/twinBuildPipeline.ts',
    ruleText: 'composeAuthorityFirstTwin deferred in REPLICATION_MODE (not dead — intentionally skipped)',
    effect: 'AuthorityFirstNdxOverviewTwin composer not executed at runtime',
    driftRisk: 'LOW',
    activeAtRuntime: true,
    recommendation: 'Document as IMPLEMENTED_NOT_EXECUTED for replication pilot',
  },
  {
    ruleId: 'browser-loop-synthetic',
    source: 'p0vrReplication1/browserReplicationLoop.ts',
    ruleText: 'Playwright disabled by default — render trace uses structural heuristics',
    effect: 'BROWSER_RENDER evidence may be approximate without live crop',
    driftRisk: 'MEDIUM',
    activeAtRuntime: true,
    recommendation: 'Enable playwright for pilot drift crops when founder QA host available',
  },
];

export function auditAntiReplicationRules(): ReplicationPolicyAuditEntry[] {
  return REPLICATION_POLICY_AUDIT_ENTRIES.filter((e) => e.driftRisk === 'HIGH');
}
