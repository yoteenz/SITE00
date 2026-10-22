import { foundationFetch } from './foundationAdminApi';

export type EmailGalleryRow = {
  milestone: string;
  template_id: string;
  trigger: string;
  subject: string;
  html: string;
  cta_label: string;
  cta_destination: string;
  cta_links_resolved: string[];
  sending_status: string;
  provider_message_id: string | null;
  delivery_status: string;
  provider_status_at: string | null;
  timestamp: string | null;
  approval_status: string;
  intent_id: string | null;
};

export type AutomatedEmailRun = {
  run_id: string;
  status: string;
  artifact_id: string | null;
  public_token_masked: string | null;
  personalized_url: string | null;
  contact_email_masked: string;
  started_at: string;
  completed_at: string | null;
  stages: { stage_id: string; ok: boolean; error?: string; intent_ids: string[]; provider_message_ids: string[] }[];
  error: string | null;
};

export type RunStats = {
  triggered: number;
  sent: number;
  delivered: number;
  failed: number;
  duplicated: number;
};

export const foundationEmailJourneyApi = {
  startAutomatedRun: (body: { founder_e2e_authorized: true; test_run_id?: string }) =>
    foundationFetch<{ run: AutomatedEmailRun; stats: RunStats; gallery: EmailGalleryRow[] }>(
      '/api/admin/site00-foundation',
      { method: 'POST', body: { action: 'start-automated-email-journey', ...body } },
    ),
  gallery: (artifactId: string) =>
    foundationFetch<{ gallery: EmailGalleryRow[] }>(
      `/api/admin/site00-foundation?action=email-journey-gallery&id=${encodeURIComponent(artifactId)}`,
    ),
  run: (runId: string) =>
    foundationFetch<{ run: AutomatedEmailRun; stats: RunStats }>(
      `/api/admin/site00-foundation?action=automated-email-run&run_id=${encodeURIComponent(runId)}`,
    ),
};
