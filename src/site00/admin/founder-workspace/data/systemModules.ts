/**
 * 07 SYSTEM modules — pure mapping from the real founder readiness report onto the OPUS2 console rows.
 * No module ever reads healthy unless the report says so; a missing report makes every module UNVERIFIED.
 */
import type { FounderReadinessReport } from '../../services/foundationReadinessApi';
import type { WsChipKind } from '../shell/wsKit';

export type SystemArea = 'STACK' | 'INTEGRATIONS' | 'SECURITY' | 'TEST LAB';

export type SystemModule = {
  id: string;
  icon: string;
  title: string;
  area: SystemArea;
  chip: [WsChipKind, string, string?];
  detail: string;
  /** Rows shown in the module inspector (OL-16): label · chip kind · chip text. */
  checks: Array<[string, WsChipKind, string]>;
  /** Environment variable NAMES only (never values). */
  envNames: string[];
  /** Attention rank: lower = earlier in ATTENTION ORDER; undefined = nothing to do. */
  attention?: number;
};

const stripeChip = (mode: string): [WsChipKind, string] =>
  mode === 'test' ? ['unver', 'TEST KEY · UNVERIFIED'] : mode === 'live' ? ['fail', 'LIVE KEY ON STAGING'] : mode === 'missing' ? ['req', 'NOT CONFIGURED'] : ['req', 'UNRECOGNIZED KEY'];

const set = (b: boolean): [WsChipKind, string] => (b ? ['ok', 'PRESENT'] : ['req', 'MISSING']);

export function buildSystemModules(r: FounderReadinessReport | null): SystemModule[] {
  if (!r) {
    const unknown = (id: string, icon: string, title: string, area: SystemArea): SystemModule => ({
      id,
      icon,
      title,
      area,
      chip: ['unver', 'UNVERIFIED'],
      detail: 'READINESS REPORT UNAVAILABLE · STATUS UNKNOWN',
      checks: [],
      envNames: [],
    });
    return [
      unknown('stack', 'server', 'STAGING STACK', 'STACK'),
      unknown('persistence', 'database', 'PERSISTENCE', 'STACK'),
      unknown('db', 'security', 'DATABASE SECURITY', 'SECURITY'),
      unknown('email', 'email', 'EMAIL SENDING', 'INTEGRATIONS'),
      unknown('resend', 'domain', 'EMAIL PROVIDER · RESEND', 'INTEGRATIONS'),
      unknown('stripe', 'payment', 'STRIPE', 'INTEGRATIONS'),
      unknown('api', 'api', 'API HEALTH', 'STACK'),
      unknown('e2e', 'checklist', 'E2E TEST MODE', 'TEST LAB'),
    ];
  }
  const ids = r.staging_identities;
  const env = r.env;
  const db = r.database_security;
  const resendOk = env.resend_configured && env.transactional_from_present && env.transactional_reply_to_present;
  const [sk, sl] = stripeChip(ids.stripe_key_mode);
  const modules: SystemModule[] = [
    {
      id: 'stack',
      icon: 'server',
      title: 'STAGING STACK',
      area: 'STACK',
      chip: ids.supabase_staging_isolation_verified ? ['ok', 'ISOLATED'] : ['req', 'NOT STAGING-SAFE'],
      detail: `FRONTEND ${ids.expected_frontend_origin} · API ${ids.expected_api_origin} · SUPABASE REF ${ids.supabase_project_ref ?? 'UNKNOWN'}`,
      checks: [
        ['STAGING ISOLATION', ...((ids.supabase_staging_isolation_verified ? ['ok', 'VERIFIED'] : ['req', 'NOT VERIFIED']) as [WsChipKind, string])],
        ['PUBLIC LINK ORIGIN', ...((ids.configured_public_origin ? ['ok', 'CONFIGURED'] : ['req', 'FALLBACK site00.com']) as [WsChipKind, string])],
        ['DEPLOYMENT', ...((r.activation.deployment_performed ? ['ok', 'PERFORMED'] : ['unver', 'NOT RECORDED']) as [WsChipKind, string])],
      ],
      envNames: [],
      attention: ids.supabase_staging_isolation_verified ? undefined : 1,
    },
    {
      id: 'persistence',
      icon: 'database',
      title: 'PERSISTENCE',
      area: 'STACK',
      chip: ids.persistence_store === 'supabase' ? ['ok', 'SUPABASE'] : ['warn', 'IN-MEMORY'],
      detail: ids.persistence_store === 'supabase' ? 'DURABLE ARTIFACTS + TOKENS (FLAG ON)' : 'IN-MEMORY STORE · LOST ON API RESTART',
      checks: [
        ['SUPABASE PERSISTENCE FLAG', ...set(env.supabase_persistence)],
        ['REMOTE MIGRATION', ...((r.activation.remote_migration_applied ? ['ok', 'APPLIED'] : ['unver', 'NOT RECORDED']) as [WsChipKind, string])],
      ],
      envNames: [],
      attention: ids.persistence_store === 'supabase' ? undefined : 4,
    },
    {
      id: 'db',
      icon: 'security',
      title: 'DATABASE SECURITY',
      area: 'SECURITY',
      chip: !db ? ['unver', 'NOT PROBED'] : db.persistence_safe && db.project_messages_table.anon_select === 'denied' ? ['ok', 'ANON DENIED'] : db.project_messages_table.anon_select === 'not_configured' ? ['unver', 'NOT CONFIGURED'] : ['req', 'REVIEW EXPOSURE'],
      detail: db ? `ANON READ ON PROJECT MESSAGES · ${db.project_messages_table.anon_select.toUpperCase().replace(/_/g, ' ')} · SERVICE ROLE ${db.project_messages_table.service_role_select.toUpperCase().replace(/_/g, ' ')}` : 'NO PROBE IN THE REPORT',
      checks: db
        ? [
            ['ANON SELECT', db.project_messages_table.anon_select === 'denied' ? 'ok' : 'req', db.project_messages_table.anon_select.toUpperCase().replace(/_/g, ' ')],
            ['SERVICE ROLE SELECT', db.project_messages_table.service_role_select === 'allowed_rows' ? 'ok' : 'unver', db.project_messages_table.service_role_select.toUpperCase().replace(/_/g, ' ')],
            ['PERSISTENCE EXPOSURE', db.persistence_safe ? 'ok' : 'req', db.persistence_safe ? 'SAFE' : 'NOT SAFE'],
          ]
        : [],
      envNames: [],
      attention: db && !(db.persistence_safe && db.project_messages_table.anon_select === 'denied') ? 2 : undefined,
    },
    {
      id: 'email',
      icon: 'email',
      title: 'EMAIL SENDING',
      area: 'INTEGRATIONS',
      chip: ids.email_sending_enabled ? ['unver', 'FLAG ON · NOT E2E VERIFIED'] : ['policy', 'DISABLED BY POLICY', 'lock'],
      detail: ids.email_sending_enabled ? 'TRANSACTIONAL SEND FLAG ON · ALLOWLIST ONLY' : 'TRANSACTIONAL SEND FLAG OFF · LIFECYCLE EMAIL RECORDED AS DRY RUN',
      checks: [
        ['SEND FLAG', ...((env.transactional_send_flag ? ['unver', 'ON'] : ['policy', 'OFF']) as [WsChipKind, string])],
        ['FOUNDER ALLOWLIST', ...set(env.allowlist_configured)],
        ['LIVE DELIVERY', 'unver', 'UNVERIFIED'],
      ],
      envNames: ['SITE00_DF_TRANSACTIONAL_EMAIL_SEND', 'SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST'],
    },
    {
      id: 'resend',
      icon: 'domain',
      title: 'EMAIL PROVIDER · RESEND',
      area: 'INTEGRATIONS',
      chip: resendOk ? ['ok', 'CONFIGURED'] : ['req', 'NEEDS FOUNDER'],
      detail: resendOk ? 'API KEY · FROM · REPLY-TO PRESENT · DOMAIN DKIM IS A MANUAL CHECK' : 'RESEND KEY OR SENDER IDENTITY MISSING',
      checks: [
        ['RESEND KEY', ...set(env.resend_configured)],
        ['WEBHOOK SECRET', ...set(env.resend_webhook_secret_present)],
        ['FROM', ...set(env.transactional_from_present)],
        ['REPLY-TO', ...set(env.transactional_reply_to_present)],
        ['GODADDY DKIM + DOMAIN', 'unver', 'MANUAL CHECK'],
      ],
      envNames: ['RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET'],
      attention: resendOk ? undefined : 3,
    },
    {
      id: 'stripe',
      icon: 'payment',
      title: 'STRIPE',
      area: 'INTEGRATIONS',
      chip: [sk, sl],
      detail: `KEY MODE BY PREFIX = ${ids.stripe_key_mode.toUpperCase()} · WEBHOOK PROBE NOT RUN (G-08)`,
      checks: [
        ['SECRET KEY', ...set(env.stripe_secret_present)],
        ['WEBHOOK SECRET', ...set(env.stripe_webhook_secret_present)],
        ['WEBHOOK PROBE', 'unver', 'NOT RUN'],
      ],
      envNames: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
      attention: sk === 'fail' || sk === 'req' ? 0 : 6,
    },
    {
      id: 'api',
      icon: 'api',
      title: 'API HEALTH',
      area: 'STACK',
      chip: ['unver', 'UNVERIFIED'],
      detail: `THE READINESS REPORT RESPONDED · BUILD ${r.deployment.commit_short ?? 'UNKNOWN'} · NO DEDICATED HEALTH PROBE (G-08)`,
      checks: [
        ['REPORT RESPONSE', 'ok', 'RECEIVED'],
        ['HEALTH PROBE', 'unver', 'NOT AVAILABLE'],
        ['FOUNDER SESSION', ...((r.activation.founder_login_verified ? ['ok', 'VERIFIED ON API'] : ['unver', 'UNVERIFIED']) as [WsChipKind, string])],
      ],
      envNames: [],
      attention: 7,
    },
    {
      id: 'e2e',
      icon: 'checklist',
      title: 'E2E TEST MODE',
      area: 'TEST LAB',
      chip: env.founder_test_mode ? ['test', 'SYNTHETIC ONLY'] : ['muted', 'OFF'],
      detail: `${env.founder_test_mode ? 'FOUNDER TEST MODE ON' : 'FOUNDER TEST MODE OFF'} · LIVE E2E ${r.activation.e2e_authorized ? 'AUTHORIZED' : 'NOT AUTHORIZED'} · E2E NOT PASSED`,
      checks: [
        ['SYNTHETIC INTAKE', ...((r.activation.synthetic_intake_ready ? ['ok', 'READY'] : ['req', 'NOT READY']) as [WsChipKind, string])],
        ['LIVE E2E', ...((r.activation.e2e_authorized ? ['unver', 'AUTHORIZED'] : ['policy', 'NOT AUTHORIZED']) as [WsChipKind, string])],
        ['E2E PASSED', 'unver', 'NOT PASSED'],
      ],
      envNames: [],
    },
  ];
  return modules;
}

/** Status-first ordering: fail · req · warn · unver · policy · test · muted · ok. */
const RANK: Record<WsChipKind, number> = { fail: 0, req: 1, warn: 2, unver: 3, gap: 3, policy: 4, test: 5, muted: 6, ok: 7 };
export const sortStatusFirst = (m: SystemModule[]) => [...m].sort((a, b) => RANK[a.chip[0]] - RANK[b.chip[0]]);

export const OVERALL_STATEMENT: Record<FounderReadinessReport['overall_status'], string> = {
  BLOCKED: 'BLOCKED',
  ACTION_REQUIRED: 'ACTION REQUIRED',
  AWAITING_FOUNDER_APPROVAL: 'AWAITING FOUNDER APPROVAL',
  UNVERIFIED: 'UNVERIFIED',
};
