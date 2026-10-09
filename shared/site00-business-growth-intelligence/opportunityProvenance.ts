/** Future opportunity research model — no live programs in V1. */

export type OpportunityVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'STALE' | 'REJECTED';

export type OpportunitySourceRecord = {
  opportunity_id: string;
  title: string;
  issuing_organization: string;
  official_source_url: string;
  program_category: 'GRANT' | 'COMMERCIAL_CONTRACT' | 'GOVERNMENT_PROCUREMENT' | 'CERTIFICATION' | 'FINANCING' | 'PARTNERSHIP';
  eligibility_rules: string;
  geography: string | null;
  industry_restrictions: string | null;
  deadline: string | null;
  application_requirements: string[];
  last_verified_at: string | null;
  verification_status: OpportunityVerificationStatus;
  client_relevance_notes: string | null;
  recommended_next_action: string | null;
  human_review_status: 'NOT_REVIEWED' | 'REVIEWED' | 'BLOCKED';
};

export function assertNoAutomatedSubmissionV1(): { automated_submission_allowed: false; reason: string } {
  return {
    automated_submission_allowed: false,
    reason: 'Business Growth V1 — human-reviewed submissions only; no scraped eligibility overrides.',
  };
}
