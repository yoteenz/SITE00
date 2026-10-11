/** Opus-ready invitation entry contract (presentation only). */
export type InvitationEntryPhase =
  | 'SCAN'
  | 'WELCOME'
  | 'ACTIVATE'
  | 'FOUNDATION'
  | 'NEXT_ADDRESS';

export type InvitationResolutionState =
  | 'VALID'
  | 'UNKNOWN'
  | 'EXPIRED'
  | 'PAUSED'
  | 'REVOKED'
  | 'ALREADY_ACTIVATED'
  | 'RETURNING_USER'
  | 'EXISTING_FOUNDATION'
  | 'EXISTING_BLDR'
  | 'VERIFICATION_REQUIRED'
  | 'UNAVAILABLE';

export type InvitationEntryPresentation = {
  phase: InvitationEntryPhase;
  resolution: InvitationResolutionState;
  collection_label: string;
  partner_presented_through: string;
  headline_candidates: readonly string[];
  primary_service: string;
  secondary_expansion: string;
  activation: {
    can_begin: boolean;
    activation_id: string | null;
    requires_identity_verification: boolean;
  };
  foundation: {
    route: string | null;
    artifact_state: string | null;
  };
  next_address: {
    bldr_available: boolean;
  };
  policy_version: string;
  invitation_system_version: string;
};
