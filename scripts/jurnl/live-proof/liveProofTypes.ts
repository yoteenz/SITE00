export type LiveProofStepResult = {
  id: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  detail?: string;
};

export type LiveProofReport = {
  sprint: string;
  generated_at: string;
  environment: 'PASS' | 'FAIL' | 'SKIP';
  steps: LiveProofStepResult[];
  gate_status: 'PASS' | 'FAIL' | 'NOT_RUN' | 'AWAITING_GITHUB_ACTIONS_LIVE_PROOF';
  supabase_reachable: boolean;
  api_base: string;
  user_a_id?: string;
  user_b_id?: string;
};
