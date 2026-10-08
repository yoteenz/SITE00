import { randomUUID } from 'node:crypto';
import type { DigitalFoundationIntake, DigitalFoundationQuote, IntakeNeedFlag, QuoteLineAddon } from '../types.js';
import type { DigitalFoundationExecutionTask, DigitalFoundationRunbook, DigitalFoundationVerificationRule } from './types.js';
import { computeScopeHash } from './scopeHash.js';

type TaskDraft = Omit<
  DigitalFoundationExecutionTask,
  'task_id' | 'runbook_id' | 'artifact_id' | 'status' | 'attempt_count' | 'started_at' | 'completed_at' | 'verified_at'
> & { task_key: string };

function baseTask(partial: Partial<TaskDraft> & Pick<TaskDraft, 'task_key' | 'task_type' | 'title' | 'project_stage'>): TaskDraft {
  return {
    task_key: partial.task_key,
    task_type: partial.task_type,
    title: partial.title,
    description: partial.description ?? '',
    project_stage: partial.project_stage,
    execution_mode: partial.execution_mode ?? 'ASSISTED',
    provider_category: partial.provider_category ?? 'OTHER',
    provider_id: partial.provider_id ?? null,
    dependency_task_ids: partial.dependency_task_ids ?? [],
    client_action_request_id: null,
    approval_id: null,
    verification_rule_id: null,
    blocker_category: null,
    blocked_reason: null,
    assigned_actor: null,
    visibility: partial.visibility ?? 'INTERNAL_ONLY',
    internal_notes: null,
    result_metadata: partial.result_metadata ?? {},
  };
}

function domainPathTasks(needs: Set<IntakeNeedFlag>): TaskDraft[] {
  const tasks: TaskDraft[] = [];
  if (needs.has('LOST_DOMAIN')) {
    tasks.push(
      baseTask({
        task_key: 'domain_recovery',
        task_type: 'DOMAIN_RECOVERY',
        title: 'Domain recovery workflow',
        project_stage: '02_DOMAIN',
        execution_mode: 'EXTERNAL_MANUAL',
        provider_category: 'DOMAIN_REGISTRAR',
        description: 'Discovery and recovery when registrar access is unknown.',
        visibility: 'INTERNAL_ONLY',
        result_metadata: { manual_review: true },
      }),
    );
  } else if (needs.has('OWN_DOMAIN')) {
    tasks.push(
      baseTask({
        task_key: 'domain_connect',
        task_type: 'DOMAIN_OWNERSHIP',
        title: 'Connect existing domain',
        project_stage: '02_DOMAIN',
        execution_mode: 'CLIENT_ACTION',
        provider_category: 'DOMAIN_REGISTRAR',
        description: 'Client authorizes registrar access or confirms DNS control.',
        visibility: 'CLIENT_ACTIONABLE',
      }),
    );
  } else {
    tasks.push(
      baseTask({
        task_key: 'domain_availability',
        task_type: 'DOMAIN_AVAILABILITY',
        title: 'Domain availability and selection',
        project_stage: '02_DOMAIN',
        execution_mode: 'CLIENT_ACTION',
        provider_category: 'DOMAIN_REGISTRAR',
        description: 'Client chooses preferred domain name(s) for approval.',
        visibility: 'CLIENT_ACTIONABLE',
      }),
      baseTask({
        task_key: 'domain_register',
        task_type: 'DOMAIN_REGISTRATION',
        title: 'Domain registration or connection',
        project_stage: '02_DOMAIN',
        execution_mode: 'ASSISTED',
        provider_category: 'DOMAIN_REGISTRAR',
        dependency_task_ids: [], // wired after ids assigned
        description: 'Founder-assisted registration in client-owned registrar account.',
      }),
    );
  }
  tasks.push(
    baseTask({
      task_key: 'domain_ownership',
      task_type: 'DOMAIN_OWNERSHIP',
      title: 'Domain ownership configured',
      project_stage: '02_DOMAIN',
      execution_mode: 'VERIFICATION',
      provider_category: 'DOMAIN_REGISTRAR',
      description: 'Verify client owns domain and admin access model is documented.',
    }),
    baseTask({
      task_key: 'registrar_security',
      task_type: 'REGISTRAR_SECURITY',
      title: 'Registrar security / 2FA guidance',
      project_stage: '02_DOMAIN',
      execution_mode: 'ASSISTED',
      provider_category: 'DOMAIN_REGISTRAR',
      visibility: 'CLIENT_SAFE',
    }),
  );
  return tasks;
}

function emailTasks(addons: QuoteLineAddon[]): TaskDraft[] {
  const extraMailboxes = addons.find((a) => a.addon_id === 'ADDITIONAL_MAILBOX')?.quantity ?? 0;
  const tasks: TaskDraft[] = [
    baseTask({
      task_key: 'email_provider_select',
      task_type: 'PROVIDER_SELECTION',
      title: 'Email provider selection',
      project_stage: '03_PROFESSIONAL_EMAIL',
      execution_mode: 'ASSISTED',
      provider_category: 'EMAIL_PROVIDER',
      description: 'Select Google Workspace, Microsoft 365, or other approved provider.',
      visibility: 'CLIENT_SAFE',
    }),
    baseTask({
      task_key: 'primary_mailbox',
      task_type: 'PRIMARY_MAILBOX',
      title: 'Primary mailbox configured',
      project_stage: '03_PROFESSIONAL_EMAIL',
      execution_mode: 'ASSISTED',
      provider_category: 'EMAIL_PROVIDER',
      description: 'Create primary professional mailbox.',
    }),
  ];
  if (extraMailboxes > 0) {
    tasks.push(
      baseTask({
        task_key: 'additional_mailboxes',
        task_type: 'ADDITIONAL_MAILBOXES',
        title: `Additional mailboxes (${extraMailboxes})`,
        project_stage: '03_PROFESSIONAL_EMAIL',
        execution_mode: 'ASSISTED',
        provider_category: 'EMAIL_PROVIDER',
        result_metadata: { quantity: extraMailboxes },
      }),
    );
  }
  tasks.push(
    baseTask({
      task_key: 'aliases',
      task_type: 'ALIASES',
      title: 'Email aliases configured',
      project_stage: '03_PROFESSIONAL_EMAIL',
      execution_mode: 'ASSISTED',
      provider_category: 'EMAIL_PROVIDER',
    }),
    baseTask({
      task_key: 'send_test',
      task_type: 'SEND_TEST',
      title: 'Send test',
      project_stage: '03_PROFESSIONAL_EMAIL',
      execution_mode: 'VERIFICATION',
      provider_category: 'EMAIL_PROVIDER',
    }),
    baseTask({
      task_key: 'receive_test',
      task_type: 'RECEIVE_TEST',
      title: 'Receive test',
      project_stage: '03_PROFESSIONAL_EMAIL',
      execution_mode: 'VERIFICATION',
      provider_category: 'EMAIL_PROVIDER',
    }),
  );
  return tasks;
}

function dnsTasks(): TaskDraft[] {
  return [
    baseTask({
      task_key: 'mx',
      task_type: 'MX_CONFIGURE',
      title: 'MX configured',
      project_stage: '04_DNS_SECURITY',
      execution_mode: 'ASSISTED',
      provider_category: 'DNS_PROVIDER',
    }),
    baseTask({
      task_key: 'spf',
      task_type: 'SPF_CONFIGURE',
      title: 'SPF configured',
      project_stage: '04_DNS_SECURITY',
      execution_mode: 'ASSISTED',
      provider_category: 'DNS_PROVIDER',
    }),
    baseTask({
      task_key: 'dkim',
      task_type: 'DKIM_CONFIGURE',
      title: 'DKIM configured',
      project_stage: '04_DNS_SECURITY',
      execution_mode: 'ASSISTED',
      provider_category: 'DNS_PROVIDER',
    }),
    baseTask({
      task_key: 'dmarc',
      task_type: 'DMARC_CONFIGURE',
      title: 'DMARC configured',
      project_stage: '04_DNS_SECURITY',
      execution_mode: 'ASSISTED',
      provider_category: 'DNS_PROVIDER',
    }),
    baseTask({
      task_key: 'dns_verify',
      task_type: 'DNS_VERIFICATION',
      title: 'DNS + email security verification',
      project_stage: '04_DNS_SECURITY',
      execution_mode: 'VERIFICATION',
      provider_category: 'DNS_PROVIDER',
    }),
  ];
}

function addonTasks(addons: QuoteLineAddon[], needs: Set<IntakeNeedFlag>): TaskDraft[] {
  const tasks: TaskDraft[] = [];
  for (const line of addons) {
    switch (line.addon_id) {
      case 'ADDITIONAL_DOMAIN':
        tasks.push(
          baseTask({
            task_key: `addon_${line.addon_id}`,
            task_type: 'ADDITIONAL_DOMAIN',
            title: 'Additional domain',
            project_stage: '02_DOMAIN',
            execution_mode: 'ASSISTED',
            provider_category: 'DOMAIN_REGISTRAR',
          }),
        );
        break;
      case 'DOMAIN_TRANSFER':
        tasks.push(
          baseTask({
            task_key: 'domain_transfer',
            task_type: 'DOMAIN_TRANSFER',
            title: 'Domain transfer',
            project_stage: '02_DOMAIN',
            execution_mode: 'CLIENT_ACTION',
            provider_category: 'DOMAIN_REGISTRAR',
            visibility: 'CLIENT_ACTIONABLE',
          }),
        );
        break;
      case 'LEGACY_EMAIL_MIGRATION':
        tasks.push(
          baseTask({
            task_key: 'migration_assess',
            task_type: 'MIGRATION_ASSESS',
            title: 'Legacy email migration — assess',
            project_stage: '03_PROFESSIONAL_EMAIL',
            execution_mode: 'ASSISTED',
            provider_category: 'MIGRATION_PROVIDER',
            result_metadata: { migration_phase: 'ASSESS' },
          }),
          baseTask({
            task_key: 'migration_execute',
            task_type: 'MIGRATION_EXECUTE',
            title: 'Legacy email migration — execute',
            project_stage: '03_PROFESSIONAL_EMAIL',
            execution_mode: 'EXTERNAL_MANUAL',
            provider_category: 'MIGRATION_PROVIDER',
            result_metadata: { migration_phase: 'MIGRATING' },
          }),
        );
        break;
      case 'MULTI_USER_WORKSPACE_SETUP':
        tasks.push(
          baseTask({
            task_key: 'multi_user',
            task_type: 'MULTI_USER_WORKSPACE',
            title: 'Multi-user workspace setup',
            project_stage: '03_PROFESSIONAL_EMAIL',
            execution_mode: 'ASSISTED',
            provider_category: 'EMAIL_PROVIDER',
          }),
        );
        break;
      case 'ADVANCED_DNS_CLEANUP':
      case 'EXISTING_SITE_DOMAIN_CONFLICT':
        tasks.push(
          baseTask({
            task_key: `addon_${line.addon_id}`,
            task_type: line.addon_id,
            title: line.addon_id.replace(/_/g, ' '),
            project_stage: '04_DNS_SECURITY',
            execution_mode: 'ASSISTED',
            provider_category: 'DNS_PROVIDER',
          }),
        );
        break;
      case 'ADDITIONAL_DEVICE_SETUP':
        tasks.push(
          baseTask({
            task_key: 'device_extra',
            task_type: 'DEVICE_SETUP',
            title: 'Additional device setup guidance',
            project_stage: '05_DEVICE_SIGNATURE',
            execution_mode: 'CLIENT_ACTION',
            visibility: 'CLIENT_ACTIONABLE',
            result_metadata: { quantity: line.quantity },
          }),
        );
        break;
      case 'STAFF_SIGNATURE_SYSTEM':
        tasks.push(
          baseTask({
            task_key: 'staff_signatures',
            task_type: 'STAFF_SIGNATURE_SYSTEM',
            title: 'Staff signature system',
            project_stage: '05_DEVICE_SIGNATURE',
            execution_mode: 'ASSISTED',
          }),
        );
        break;
      default:
        break;
    }
  }
  if (needs.has('NEED_DEVICE')) {
    tasks.push(
      baseTask({
        task_key: 'device_primary',
        task_type: 'DEVICE_SETUP',
        title: 'Primary device setup guidance',
        project_stage: '05_DEVICE_SIGNATURE',
        execution_mode: 'CLIENT_ACTION',
        visibility: 'CLIENT_ACTIONABLE',
      }),
    );
  }
  return tasks;
}

export function generateRunbookFromScope(input: {
  artifact_id: string;
  quote: DigitalFoundationQuote;
  intake: DigitalFoundationIntake;
  project_config: Record<string, unknown>;
  runbook_version: number;
}): {
  runbook: DigitalFoundationRunbook;
  tasks: DigitalFoundationExecutionTask[];
  verification_rules: DigitalFoundationVerificationRule[];
} {
  const needs = new Set(input.intake.needs ?? []);
  const scope_hash = computeScopeHash({
    quote: input.quote,
    intake: input.intake,
    project_config: input.project_config,
  });

  const runbook: DigitalFoundationRunbook = {
    runbook_id: randomUUID(),
    artifact_id: input.artifact_id,
    project_id: input.artifact_id,
    quote_id: input.quote.quote_id,
    quote_version: input.quote.quote_version,
    runbook_version: input.runbook_version,
    status: 'DRAFT',
    generated_from_scope_hash: scope_hash,
    created_at: new Date().toISOString(),
    activated_at: null,
    completed_at: null,
  };

  const drafts: TaskDraft[] = [
    baseTask({
      task_key: 'business_details',
      task_type: 'BUSINESS_DETAILS_VERIFIED',
      title: 'Business details verified',
      project_stage: '01_DETAILS_RECEIVED',
      execution_mode: 'ASSISTED',
    }),
    baseTask({
      task_key: 'domain_path',
      task_type: 'DOMAIN_PATH_DETERMINED',
      title: 'Domain path determined',
      project_stage: '02_DOMAIN',
      execution_mode: 'ASSISTED',
    }),
    ...domainPathTasks(needs),
    ...emailTasks(input.quote.selected_addons),
    ...dnsTasks(),
    ...addonTasks(input.quote.selected_addons, needs),
    baseTask({
      task_key: 'signature_create',
      task_type: 'SIGNATURE_CREATED',
      title: 'Email signature created',
      project_stage: '05_DEVICE_SIGNATURE',
      execution_mode: 'ASSISTED',
      visibility: 'CLIENT_SAFE',
    }),
    baseTask({
      task_key: 'signature_approve',
      task_type: 'SIGNATURE_APPROVED',
      title: 'Email signature approved',
      project_stage: '05_DEVICE_SIGNATURE',
      execution_mode: 'CLIENT_ACTION',
      visibility: 'CLIENT_ACTIONABLE',
    }),
    baseTask({
      task_key: 'ownership_record',
      task_type: 'OWNERSHIP_RECORD',
      title: 'Ownership record generated',
      project_stage: '06_FINAL_VERIFICATION',
      execution_mode: 'ASSISTED',
      visibility: 'CLIENT_SAFE',
    }),
    baseTask({
      task_key: 'final_verification',
      task_type: 'FINAL_VERIFICATION',
      title: 'Final verification',
      project_stage: '06_FINAL_VERIFICATION',
      execution_mode: 'VERIFICATION',
    }),
    baseTask({
      task_key: 'foundation_completion',
      task_type: 'FOUNDATION_COMPLETION',
      title: 'Foundation completion',
      project_stage: '07_FOUNDATION_COMPLETE',
      execution_mode: 'VERIFICATION',
    }),
  ];

  const keyToId = new Map<string, string>();
  const tasks: DigitalFoundationExecutionTask[] = drafts.map((d) => {
    const task_id = randomUUID();
    keyToId.set(d.task_key, task_id);
    return {
      task_id,
      runbook_id: runbook.runbook_id,
      artifact_id: input.artifact_id,
      project_stage: d.project_stage,
      task_type: d.task_type,
      title: d.title,
      description: d.description,
      execution_mode: d.execution_mode,
      provider_category: d.provider_category,
      provider_id: d.provider_id,
      dependency_task_ids: [],
      client_action_request_id: d.client_action_request_id,
      approval_id: d.approval_id,
      verification_rule_id: d.verification_rule_id,
      status: 'NOT_READY',
      blocker_category: d.blocker_category,
      blocked_reason: d.blocked_reason,
      attempt_count: 0,
      started_at: null,
      completed_at: null,
      verified_at: null,
      assigned_actor: d.assigned_actor,
      visibility: d.visibility,
      internal_notes: d.internal_notes,
      result_metadata: d.result_metadata,
    };
  });

  // Resolve dependency keys → ids
  const draftByKey = new Map(drafts.map((d, i) => [d.task_key, { draft: d, task: tasks[i]! }]));
  const depMap: Record<string, string[]> = {
    domain_register: ['domain_availability'],
    domain_ownership: ['domain_register', 'domain_connect', 'domain_recovery'],
    mx: ['primary_mailbox'],
    spf: ['mx'],
    dkim: ['primary_mailbox'],
    dmarc: ['spf'],
    dns_verify: ['mx', 'spf', 'dkim', 'dmarc'],
    send_test: ['mx'],
    receive_test: ['send_test'],
    signature_approve: ['signature_create'],
    final_verification: ['dns_verify', 'send_test', 'receive_test', 'domain_ownership'],
    foundation_completion: ['final_verification', 'ownership_record', 'signature_approve'],
    migration_execute: ['migration_assess', 'primary_mailbox'],
  };
  for (const [key, deps] of Object.entries(depMap)) {
    const entry = draftByKey.get(key);
    if (!entry) continue;
    entry.task.dependency_task_ids = deps
      .map((k) => keyToId.get(k))
      .filter((id): id is string => Boolean(id));
  }

  const verification_rules: DigitalFoundationVerificationRule[] = [];
  for (const task of tasks) {
    if (task.execution_mode !== 'VERIFICATION' && task.task_type !== 'DNS_VERIFICATION') continue;
    const checks: Array<{ kind: DigitalFoundationVerificationRule['check_kind']; expected?: string }> = [];
    if (task.task_type === 'DOMAIN_OWNERSHIP') checks.push({ kind: 'DOMAIN_OWNERSHIP_CONFIRMED' });
    if (task.task_type === 'MX_CONFIGURE' || task.task_type === 'DNS_VERIFICATION') {
      checks.push({ kind: 'MX_MATCHES_EXPECTED' }, { kind: 'SPF_MATCHES_EXPECTED' }, { kind: 'DKIM_MATCHES_EXPECTED' }, { kind: 'DMARC_PRESENT' });
    }
    if (task.task_type === 'SEND_TEST') checks.push({ kind: 'SEND_TEST_PASS' });
    if (task.task_type === 'RECEIVE_TEST') checks.push({ kind: 'RECEIVE_TEST_PASS' });
    if (task.task_type === 'FINAL_VERIFICATION') {
      checks.push({ kind: 'DOMAIN_OWNERSHIP_CONFIRMED' }, { kind: 'MAILBOX_ACTIVE' });
    }
    for (const c of checks) {
      const rule_id = randomUUID();
      verification_rules.push({
        rule_id,
        task_id: task.task_id,
        artifact_id: input.artifact_id,
        check_kind: c.kind,
        expected_value: c.expected ?? null,
        current_value: null,
        match_state: 'UNKNOWN',
        required: true,
      });
      if (!task.verification_rule_id) task.verification_rule_id = rule_id;
    }
  }

  return { runbook, tasks, verification_rules };
}
