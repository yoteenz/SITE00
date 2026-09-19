/**
 * Project Presence Accent System — generic Studio World types (P0.UI.1).
 * Host shell diamond inherits active project canonical primary color.
 */

export type ProjectPresenceAccentSource =
  | 'CANONICAL_PRIMARY'
  | 'APPROVED_PRIMARY'
  | 'APPROVED_ACCENT'
  | 'HOST_FALLBACK';

export type ProjectPresenceAccentStatus = 'RESOLVED' | 'RESOLVING' | 'UNRESOLVED';

export type VisualAuthorityClass =
  | 'HOST_CANONICAL'
  | 'PROJECT_PRESENCE'
  | 'CLIENT_EXPRESSION'
  | 'SYSTEM_STATE';

export type ProjectPresenceAccent = {
  projectId: string | null;
  projectName: string | null;
  resolvedColor: string;
  source: ProjectPresenceAccentSource;
  status: ProjectPresenceAccentStatus;
  isCanonical: boolean;
  fallbackUsed: boolean;
};

export type ProjectBrandPresenceEntry = {
  projectId: string;
  projectName: string;
  canonicalPrimary?: string | null;
  approvedPrimary?: string | null;
  approvedAccent?: string | null;
  brandPrimaryStatus?: 'RESOLVED' | 'UNRESOLVED';
};

export type ProjectPresenceContrastOutcome = 'PASS' | 'LOW_CONTRAST' | 'FALLBACK_REQUIRED';

export type ProjectPresenceContrastEvaluation = {
  outcome: ProjectPresenceContrastOutcome;
  contrastRatio: number;
  useKeyline: boolean;
};

export type ProjectAccentBleedEvaluation = {
  passed: boolean;
  failures: string[];
};

export type ProjectPresenceDiamondEvaluation = {
  valid: boolean;
  classification: VisualAuthorityClass;
  failures: string[];
  matchesResolvedAccent: boolean;
};
