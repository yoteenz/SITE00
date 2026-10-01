/**
 * IDNTY / BUILD READY — identity-authority verification capability boundary.
 *
 * HONESTY CONTRACT (public redesign, SONNET-STRUCTURE1):
 *  - The client can only describe what the USER has supplied. It can never establish authority.
 *  - `AUTHORITY_ESTABLISHED` is representable ONLY as a value handed in by a server snapshot.
 *    Nothing in this module (or the UI) produces it from local state.
 *  - BLDR is never unlocked from any status derived here. `isBldrUnlockedByVerification` is true
 *    only for a server snapshot that establishes authority in every domain.
 *  - There is currently NO server verification backend. `IDENTITY_AUTHORITY_VERIFICATION_BACKEND_AVAILABLE`
 *    is false, the default gateway returns null, and submission is reported as unavailable.
 *    Wiring the real capability is a separate backend sprint (see SONNET-OPUS-HANDOFF.md).
 */

export type IdentityAuthorityDomain = 'STRATEGY' | 'VISUAL' | 'VOICE' | 'VALUES' | 'EXPERIENCE';

export const IDENTITY_AUTHORITY_DOMAIN_ORDER: IdentityAuthorityDomain[] = [
  'STRATEGY',
  'VISUAL',
  'VOICE',
  'VALUES',
  'EXPERIENCE',
];

export type IdentityAuthorityStatus =
  | 'NOT_PROVIDED'
  | 'EVIDENCE_RECEIVED'
  | 'REVIEW_REQUIRED'
  | 'GAP_IDENTIFIED'
  | 'PENDING_REVIEW'
  /** Server-only. Never derived on the client. */
  | 'AUTHORITY_ESTABLISHED';

/** Statuses the client is allowed to derive from user-supplied input. */
export type ClientDerivableAuthorityStatus = Exclude<
  IdentityAuthorityStatus,
  'AUTHORITY_ESTABLISHED' | 'PENDING_REVIEW'
>;

export type IdentityEvidenceSource = { id: string; label: string };

export type IdentityAuthorityDomainConfig = {
  id: IdentityAuthorityDomain;
  label: string;
  icon: 'strategy' | 'visual' | 'voice' | 'values' | 'experience';
  /** Source-material types the user can confirm they have. Not file uploads. */
  sources: IdentityEvidenceSource[];
};

export const IDENTITY_AUTHORITY_DOMAINS: IdentityAuthorityDomainConfig[] = [
  {
    id: 'STRATEGY',
    label: 'STRATEGY',
    icon: 'strategy',
    sources: [
      { id: 'brand-strategy', label: 'BRAND STRATEGY' },
      { id: 'positioning', label: 'POSITIONING' },
      { id: 'market-insights', label: 'MARKET INSIGHTS' },
      { id: 'audience-definition', label: 'AUDIENCE DEFINITION' },
      { id: 'competitive-review', label: 'COMPETITIVE REVIEW' },
    ],
  },
  {
    id: 'VISUAL',
    label: 'VISUAL',
    icon: 'visual',
    sources: [
      { id: 'logo-files', label: 'LOGO FILES' },
      { id: 'brand-guidelines', label: 'BRAND GUIDELINES' },
      { id: 'typography', label: 'TYPOGRAPHY' },
      { id: 'palette', label: 'PALETTE' },
      { id: 'imagery', label: 'IMAGERY' },
    ],
  },
  {
    id: 'VOICE',
    label: 'VOICE',
    icon: 'voice',
    sources: [
      { id: 'messaging', label: 'MESSAGING' },
      { id: 'tone-of-voice', label: 'TONE OF VOICE' },
      { id: 'example-content', label: 'EXAMPLE CONTENT' },
      { id: 'written-style-guide', label: 'WRITTEN STYLE GUIDE' },
    ],
  },
  {
    id: 'VALUES',
    label: 'VALUES',
    icon: 'values',
    sources: [
      { id: 'core-values', label: 'CORE VALUES' },
      { id: 'beliefs', label: 'BELIEFS' },
      { id: 'esg-purpose', label: 'ESG / PURPOSE' },
      { id: 'mission-statement', label: 'MISSION STATEMENT' },
    ],
  },
  {
    id: 'EXPERIENCE',
    label: 'EXPERIENCE',
    icon: 'experience',
    sources: [
      { id: 'customer-journey', label: 'CUSTOMER JOURNEY' },
      { id: 'experience-principles', label: 'EXPERIENCE PRINCIPLES' },
      { id: 'touchpoints', label: 'TOUCHPOINTS' },
      { id: 'service-standards', label: 'SERVICE STANDARDS' },
    ],
  },
];

/** Answer keys under the IDNTY `build-ready` `evidence` step (stored via the existing intake path). */
export const BUILD_READY_EVIDENCE_STEP_ID = 'evidence';
export const BUILD_READY_REVIEW_FLAGS_KEY = 'review-flags';

export function evidenceAnswerKey(domain: IdentityAuthorityDomain): string {
  return `evidence-${domain.toLowerCase()}`;
}

export type IdentityEvidenceState = {
  /** Source ids the user says they can provide, per domain. */
  sourcesByDomain: Record<IdentityAuthorityDomain, string[]>;
  /** Domains the user asked SITE 00 to look at again. */
  reviewFlags: IdentityAuthorityDomain[];
};

export function emptyIdentityEvidence(): IdentityEvidenceState {
  return {
    sourcesByDomain: { STRATEGY: [], VISUAL: [], VOICE: [], VALUES: [], EXPERIENCE: [] },
    reviewFlags: [],
  };
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string' && value) return [value];
  return [];
}

/** Rebuild evidence state from persisted step answers (shape-tolerant). */
export function identityEvidenceFromAnswers(
  answers: Record<string, string | string[]> | undefined,
): IdentityEvidenceState {
  const state = emptyIdentityEvidence();
  if (!answers) return state;
  for (const domain of IDENTITY_AUTHORITY_DOMAIN_ORDER) {
    const allowed = new Set(
      IDENTITY_AUTHORITY_DOMAINS.find((d) => d.id === domain)?.sources.map((s) => s.id) ?? [],
    );
    state.sourcesByDomain[domain] = asStringArray(answers[evidenceAnswerKey(domain)]).filter((id) =>
      allowed.has(id),
    );
  }
  state.reviewFlags = asStringArray(answers[BUILD_READY_REVIEW_FLAGS_KEY]).filter(
    (id): id is IdentityAuthorityDomain =>
      (IDENTITY_AUTHORITY_DOMAIN_ORDER as string[]).includes(id),
  );
  return state;
}

export function identityEvidenceToAnswers(
  evidence: IdentityEvidenceState,
): Record<string, string[]> {
  const answers: Record<string, string[]> = {
    [BUILD_READY_REVIEW_FLAGS_KEY]: evidence.reviewFlags,
  };
  for (const domain of IDENTITY_AUTHORITY_DOMAIN_ORDER) {
    answers[evidenceAnswerKey(domain)] = evidence.sourcesByDomain[domain];
  }
  return answers;
}

/** Client-side, provisional description of what the user has supplied for one domain. */
export function deriveClientAuthorityStatus(
  evidence: IdentityEvidenceState,
  domain: IdentityAuthorityDomain,
): ClientDerivableAuthorityStatus {
  if (evidence.reviewFlags.includes(domain)) return 'REVIEW_REQUIRED';
  if (evidence.sourcesByDomain[domain].length > 0) return 'EVIDENCE_RECEIVED';
  return 'NOT_PROVIDED';
}

/** A server-owned verification result. No producer exists yet — see the capability flag below. */
export type ServerIdentityAuthoritySnapshot = {
  intakeId: string;
  /** Domain → status as decided server-side. */
  domains: Record<IdentityAuthorityDomain, IdentityAuthorityStatus>;
  reviewedAt: string | null;
};

export const IDENTITY_AUTHORITY_VERIFICATION_BACKEND_AVAILABLE = false as const;

export type IdentityAuthorityVerificationGateway = {
  readonly available: boolean;
  fetchSnapshot(intakeId: string): Promise<ServerIdentityAuthoritySnapshot | null>;
  submitForVerification(input: {
    intakeId: string;
    evidence: IdentityEvidenceState;
  }): Promise<{ ok: true } | { ok: false; reason: 'BACKEND_UNAVAILABLE' | 'REJECTED' | 'NETWORK' }>;
};

/** Default gateway: there is no verification service. Always reports unavailable, never fakes success. */
export const unavailableIdentityAuthorityGateway: IdentityAuthorityVerificationGateway = {
  available: IDENTITY_AUTHORITY_VERIFICATION_BACKEND_AVAILABLE,
  async fetchSnapshot() {
    return null;
  },
  async submitForVerification() {
    return { ok: false, reason: 'BACKEND_UNAVAILABLE' };
  },
};

/** Status to display: a server snapshot always wins; otherwise the provisional client status. */
export function resolveDisplayedAuthorityStatus(
  evidence: IdentityEvidenceState,
  domain: IdentityAuthorityDomain,
  snapshot: ServerIdentityAuthoritySnapshot | null,
): IdentityAuthorityStatus {
  if (snapshot) return snapshot.domains[domain];
  return deriveClientAuthorityStatus(evidence, domain);
}

/** Only a server snapshot that establishes every domain can ever unlock BLDR. */
export function isBldrUnlockedByVerification(snapshot: ServerIdentityAuthoritySnapshot | null): boolean {
  if (!snapshot) return false;
  return IDENTITY_AUTHORITY_DOMAIN_ORDER.every((d) => snapshot.domains[d] === 'AUTHORITY_ESTABLISHED');
}

export type IdentityEvidenceSummary = {
  provided: number;
  requireReview: number;
  notProvided: number;
};

/** Counts of user-supplied evidence — descriptive only, never a score or percentage. */
export function summarizeIdentityEvidence(evidence: IdentityEvidenceState): IdentityEvidenceSummary {
  let provided = 0;
  let requireReview = 0;
  let notProvided = 0;
  for (const domain of IDENTITY_AUTHORITY_DOMAIN_ORDER) {
    const status = deriveClientAuthorityStatus(evidence, domain);
    if (status === 'EVIDENCE_RECEIVED') provided += 1;
    else if (status === 'REVIEW_REQUIRED') requireReview += 1;
    else notProvided += 1;
  }
  return { provided, requireReview, notProvided };
}

/** Visible label for a status. Uppercase by contract. */
export const IDENTITY_AUTHORITY_STATUS_LABEL: Record<IdentityAuthorityStatus, string> = {
  NOT_PROVIDED: 'ADD EVIDENCE',
  EVIDENCE_RECEIVED: 'EVIDENCE RECEIVED',
  REVIEW_REQUIRED: 'REVIEW REQUIRED',
  GAP_IDENTIFIED: 'GAP IDENTIFIED',
  PENDING_REVIEW: 'PENDING REVIEW',
  AUTHORITY_ESTABLISHED: 'AUTHORITY ESTABLISHED',
};

/**
 * Authority-check screen label. With no server review, supplied evidence is "PENDING REVIEW"
 * (nobody has reviewed it) and missing evidence is a "GAP IDENTIFIED" — never "ESTABLISHED".
 */
export function authorityCheckStatus(
  evidence: IdentityEvidenceState,
  domain: IdentityAuthorityDomain,
  snapshot: ServerIdentityAuthoritySnapshot | null,
): IdentityAuthorityStatus {
  if (snapshot) return snapshot.domains[domain];
  const status = deriveClientAuthorityStatus(evidence, domain);
  if (status === 'EVIDENCE_RECEIVED') return 'PENDING_REVIEW';
  if (status === 'NOT_PROVIDED') return 'GAP_IDENTIFIED';
  return status;
}
