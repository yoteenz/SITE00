/**
 * P0.VR.REPLICATION.3B — Literal replication policy (REPLICATION_MODE).
 */

export type ReplicationLiteralPolicyRule = {
  ruleId: string;
  text: string;
  activeInReplicationMode: boolean;
};

export const REPLICATION_LITERAL_POLICY_RULES: ReplicationLiteralPolicyRule[] = [
  { ruleId: 'visible-structure-wins', text: 'VISIBLE STRUCTURE WINS', activeInReplicationMode: true },
  { ruleId: 'visible-geometry-wins', text: 'VISIBLE GEOMETRY WINS', activeInReplicationMode: true },
  { ruleId: 'visible-asset-placement-wins', text: 'VISIBLE ASSET PLACEMENT WINS', activeInReplicationMode: true },
  { ruleId: 'function-after-structure', text: 'CURRENT FUNCTION BINDS AFTER VISUAL STRUCTURE', activeInReplicationMode: true },
  { ruleId: 'no-generic-substitution', text: 'DO NOT SUBSTITUTE GENERIC COMPONENT WHEN AUTHORITY CAN BE RECONSTRUCTED', activeInReplicationMode: true },
  { ruleId: 'uncertainty-reported', text: 'UNCERTAINTY MUST BE REPORTED — NOT CREATIVELY FILLED', activeInReplicationMode: true },
];

export const SUSPENDED_INTERPRETATION_RULE_IDS = [
  'profile-not-authority-image',
  'no-vision-on-replicate',
  'shell-first-static-source',
  'generic-hero-placeholder',
];

export function antiInterpretationPolicyActive(): boolean {
  return REPLICATION_LITERAL_POLICY_RULES.every((r) => r.activeInReplicationMode);
}
