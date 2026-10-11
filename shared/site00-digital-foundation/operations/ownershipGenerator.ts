import type { DigitalFoundationArtifact, DigitalFoundationIntake, OwnershipRecord } from '../types.js';
import type { DigitalFoundationExecutionTask, DigitalFoundationVerificationResult } from './types.js';

export function generateOwnershipRecordFromOperations(input: {
  artifact: DigitalFoundationArtifact;
  intake: DigitalFoundationIntake;
  tasks: DigitalFoundationExecutionTask[];
  verification_results: DigitalFoundationVerificationResult[];
  project_config: { email_provider_id?: string | null; dns_provider_id?: string | null; domain_registrar_id?: string | null };
}): OwnershipRecord {
  const domain = input.intake.existing_domain ?? (input.tasks.find((t) => t.task_type === 'DOMAIN_REGISTRATION')?.result_metadata.domain as string) ?? null;
  const mxVerified = input.verification_results.some((r) => r.status === 'PASS');
  return {
    business: input.intake.business_name ?? input.intake.legal_business_name ?? 'Business',
    domain,
    registrar: input.project_config.domain_registrar_id ?? null,
    renewal_date: null,
    email_provider: input.project_config.email_provider_id ?? null,
    primary_mailbox: input.intake.current_email ?? null,
    aliases: [],
    dns_status: mxVerified ? 'CONFIGURED' : 'PENDING',
    security_status: mxVerified ? 'PROTECTED' : 'PENDING',
    owner: input.intake.contact_name ?? null,
    administrative_access_model: 'Client-owned account with SITE 00 setup assistance',
  };
}
