/**
 * P0.AIO.CLIENT-MIGRATION-ACTIVATION-AND-OFFICE-PROVISIONING-ARCHITECTURE1 — the AIO mapping of the client lifecycle
 * (migration → prebuilt → invite → review → confirm → active), its proof fixtures and the generated contract docs.
 * The generic mechanics are covered by tests/studioosClientLifecycle1.test.ts.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_CONDITIONS,
  CLIENT_ENTRY_TYPES,
  CLIENT_LIFECYCLE_STATES,
  EXPANSION_PLACEMENTS,
  FOUNDER_CLIENT_SEGMENTS,
  INVITE_MESSAGE_ALLOWED,
  LIFECYCLE_AUDIT_EVENTS,
  aio as brain,
  checkInviteMessage,
  validateExperienceContract,
} from '../shared/studioos-experience-brain/index';
import { AIO_CLIENT_MIGRATION_DOCS_DIR, buildAioClientMigrationExports } from '../scripts/studioos/aio-client-migration-export';

const ROOT = path.resolve(__dirname, '..');
const SC = brain.aioMigrationProofScenarios();
const A = SC.A_BLUELINE;
const WORKSPACE_IDS = brain.AIO_WORKSPACES.map((w) => w.workspace_id);

/** Sprint §37, verbatim and in order. */
const SECTION_37 = [
  'existing client lifecycle defined', 'PREBUILT does not equal ACTIVE', 'client confirmation is required for ACTIVE', 'founder migration intake defined',
  'batch upload defined', 'extraction pipeline defined', 'human review required', 'provenance required', 'duplicate detection defined', 'founder review defined',
  'Vault lineage defined', 'office provisioning defined', 'activation invite defined', 'secure password setup / magic-link contract defined',
  'permanent passwords are never emailed/texted', 'existing-client welcome flow defined', 'WHAT CHANGED flow defined', 'new-client convergence defined',
  'workspace provisioning integrated', 'contextual expansion integrated', 'founder client-status segmentation defined', 'Experience Brain updated',
  'no page implementation', 'no OpenArt', 'current IFTA lane not blocked',
];

describe('lifecycle on AIO’s existing records', () => {
  it('every lifecycle state maps onto AIO status fields; only ACTIVE is counted and only ACTIVE gets accountStatus active', () => {
    expect(brain.AIO_LIFECYCLE_MAPPING.map((m) => m.state)).toEqual([...CLIENT_LIFECYCLE_STATES]);
    expect(brain.AIO_LIFECYCLE_MAPPING.filter((m) => m.counted_active).map((m) => m.state)).toEqual(['ACTIVE']);
    expect(brain.AIO_LIFECYCLE_MAPPING.filter((m) => m.client_account_status === 'active').map((m) => m.state)).toEqual(['ACTIVE']);
    expect(brain.AIO_LIFECYCLE_MAPPING.find((m) => m.state === 'CLIENT_CONFIRMATION_REQUIRED')!.portal_access).not.toContain('YOUR AIO OFFICE');
  });

  it('three entry types and every activation condition have an AIO home', () => {
    expect(brain.AIO_ENTRY_TYPES.map((e) => e.entry_type)).toEqual([...CLIENT_ENTRY_TYPES]);
    for (const e of brain.AIO_ENTRY_TYPES) expect(CLIENT_LIFECYCLE_STATES).toContain(e.starts_at);
    expect(brain.AIO_ENTRY_TYPES.find((e) => e.entry_type === 'EXISTING_KNOWN_NOT_MIGRATED')!.path).toContain('WE KNOW YOUR BUSINESS. YOUR DIGITAL OFFICE IS JUST GETTING STARTED.');
    expect(brain.AIO_ACTIVATION_CONDITION_SOURCES.map((c) => c.condition)).toEqual([...ACTIVATION_CONDITIONS]);
  });

  it('founder segments and audit events are fully mapped; every client-count site adopts the one rule', () => {
    expect(brain.AIO_FOUNDER_SEGMENTS.map((s) => s.segment).sort()).toEqual([...FOUNDER_CLIENT_SEGMENTS].sort());
    expect(brain.AIO_EVENT_MAPPING.map((e) => e.event)).toEqual(LIFECYCLE_AUDIT_EVENTS.slice(0, 16));
    expect(brain.AIO_CLIENT_COUNT_SITES).toHaveLength(6);
    for (const s of brain.AIO_CLIENT_COUNT_SITES) expect(s.fix).toMatch(/isCountedActive|segment|document-vault completeness/);
  });
});

describe('migration intake, classes and fields', () => {
  it('extends Physical Archive Migration instead of adding a second tool', () => {
    expect(brain.AIO_MIGRATION_INTAKE.extends.routes).toContain('/office/archive-migration');
    expect(brain.AIO_MIGRATION_INTAKE.must_not.join(' ')).toMatch(/second migration tool/);
    expect(brain.AIO_MIGRATION_INTAKE.workflow[0]).toBe('SELECT / CREATE MIGRATION BATCH');
    expect(brain.AIO_MIGRATION_INTAKE.desktop_flow).toMatch(/No manual pre-classification/);
  });

  it('24 founder classes + OTHER reuse the Vault taxonomy; every extracted field has a canonical rule; every workspace exists', () => {
    expect(brain.AIO_DOCUMENT_CLASSES).toHaveLength(25);
    expect(new Set(brain.AIO_DOCUMENT_CLASSES.map((c) => c.class_id)).size).toBe(25);
    expect(brain.AIO_DOCUMENT_CLASSES.at(-1)!.class_id).toBe('OTHER');
    expect(brain.AIO_DOCUMENT_CLASSES.find((c) => c.class_id === 'MAINTENANCE_DOCUMENT')!.status).toBe('MISSING');
    const fields = new Set(brain.AIO_MIGRATION_FIELD_RULES.map((r) => r.field));
    expect(fields.size).toBe(brain.AIO_MIGRATION_FIELD_RULES.length);
    for (const c of brain.AIO_DOCUMENT_CLASSES) {
      for (const f of c.extracts) expect(fields.has(f), `${c.class_id} → ${f}`).toBe(true);
      if (c.workspace) expect(WORKSPACE_IDS, c.class_id).toContain(c.workspace);
    }
    for (const r of brain.AIO_MIGRATION_FIELD_RULES) expect(r.canonical_target, r.field).toBeTruthy();
    expect(brain.AIO_MIGRATION_FIELD_RULES.filter((r) => r.required_for_prebuilt).map((r) => r.field)).toEqual(['organization.legal_name', 'contacts.primary']);
  });

  it('strong identifiers decide identity; weak ones only support', () => {
    expect(brain.AIO_MATCH_SIGNALS.filter((s) => s.strength === 'STRONG').map((s) => s.kind)).toEqual(['USDOT', 'MC', 'EIN', 'VIN']);
    expect(brain.AIO_EXISTING_MATCHING.find((m) => m.ref.includes('client360Service'))!.status).toBe('CONFLICT');
  });
});

describe('identity, invitation and auth', () => {
  it('AIO client ID reuses AIO-CUS-######, never the request-number format and never the email', () => {
    expect(brain.AIO_CLIENT_IDENTITY.business_identity.format).toBe('AIO-CUS-######');
    expect(brain.AIO_CLIENT_IDENTITY.business_identity.rule).toMatch(/never derived from an email/);
    expect(brain.AIO_CLIENT_IDENTITY.business_identity.rule).toMatch(/must not use it/);
    expect(brain.AIO_CLIENT_IDENTITY.alias.rule).toMatch(/Never required to authenticate/);
  });

  it('the invitation carries only allowed fields; passwords are set by the client and never sent', () => {
    expect(Object.keys(brain.AIO_INVITE_TEMPLATE.fields).every((k) => (INVITE_MESSAGE_ALLOWED as readonly string[]).includes(k))).toBe(true);
    expect(checkInviteMessage(brain.AIO_INVITE_TEMPLATE.fields).ok).toBe(true);
    expect(brain.AIO_INVITE_TEMPLATE.subject).toBe('Your AIO office is ready');
    expect(brain.AIO_AUTH_CONTRACT.flow.join(' ')).toMatch(/sets their own password/);
    expect(brain.AIO_AUTH_CONTRACT.proposed.invitation_store).toMatch(/token_sha256/);
    expect(brain.AIO_AUTH_CONTRACT.proposed.route).toMatch(/^\/office-activation\/:token/);
    expect(brain.AIO_AUTH_CONTRACT.must_fix_before_activation.map((m) => m.id)).toEqual(['C11', 'C8', 'C10', 'C9', 'PORTAL']);
  });

  it('provisioning only names AIO workspaces; side effects are held until ACTIVE', () => {
    for (const w of brain.AIO_WORKSPACE_PROVISIONING) expect(WORKSPACE_IDS).toContain(w.workspace_id);
    expect(brain.AIO_PREBUILT_PROVISIONING.does_not).toContain('count the client active');
    expect(brain.AIO_PREBUILT_PROVISIONING.side_effects_held_until_active.join(' ')).toMatch(/deadlines/);
  });
});

describe('fixture proofs', () => {
  it('§37 success criteria: all 25, verbatim, computed and passing', () => {
    expect(SC.CRITERIA.map((c) => c.criterion)).toEqual(SECTION_37);
    for (const c of SC.CRITERIA) expect(c.pass, `${c.criterion}: ${c.evidence}`).toBe(true);
  });

  it('BlueLine: nothing commits before review; the commit yields PREBUILT with full lineage', () => {
    expect(A.batch.state).toBe('PARTIAL');
    expect(A.batch.documents.filter((d) => d.state === 'DUPLICATE')).toHaveLength(1);
    expect(A.conflicts_found).toEqual(['organization.legal_name', 'organization.phone']);
    expect(A.before_review.allowed).toBe(false);
    expect(A.before_review.writes).toBe(0);
    expect(A.match.selected_client).toBe('LIKELY_MATCH');
    expect(A.match.confirmed.class).toBe('MATCH_CONFIRMED');
    expect(A.match.duplicate_create_refused.length).toBeGreaterThan(0);
    expect(A.commit).toMatchObject({ allowed: true, next_lifecycle: 'PREBUILT' });
    expect(A.lineage).toMatchObject({ source_document: 'BlueLine/MC authority letter.pdf', page: 1, fact: 'A02', reviewer: 'founder', decision: 'CONFIRMED' });
    expect(A.vault.find((v) => v.file.includes('COI 2025'))).toMatchObject({ canonical_status: 'SUPERSEDED' });
  });

  it('the activation journey counts the client active only after CONFIRM & ENTER MY OFFICE', () => {
    const steps = SC.ACTIVATION_JOURNEY.steps;
    expect(steps.map((s) => s.lifecycle)).toEqual(['KNOWN_UNMIGRATED', 'MIGRATION_IN_PROGRESS', 'MIGRATION_REVIEW_REQUIRED', 'PREBUILT', 'PREBUILT', 'INVITED', 'CLIENT_CONFIRMATION_REQUIRED', 'CLIENT_CONFIRMATION_REQUIRED', 'ACTIVE']);
    expect(steps.filter((s) => s.counted_active).map((s) => s.step)).toEqual(['CONFIRM & ENTER MY OFFICE']);
    expect(steps.at(-1)!.events).toEqual(['CLIENT_CONFIRMED', 'CLIENT_ACTIVATED']);
    expect(A.refusals.prebuilt_to_active?.code).toBe('NO_SUCH_TRANSITION');
    expect(A.refusals.confirm_before_review?.code).toBe('GUARD_REFUSED');
    expect(A.invite.with_password.ok).toBe(false);
    expect(A.invite.accept.reused.ok).toBe(false);
  });

  it('workspaces: PENDING_SETUP while prebuilt; staff-confirmed only become ACTIVE; documents alone stay REVIEW NEEDED', () => {
    expect(A.workspaces.prebuilt.some((w) => w.state === 'ACTIVE')).toBe(false);
    expect(A.workspaces.active.filter((w) => w.state === 'ACTIVE').map((w) => w.workspace_id)).toEqual(['IFTA', 'DISPATCH', 'FACTORING', 'BROKERAGE']);
    expect(A.workspaces.active.filter((w) => w.state === 'KNOWN_REVIEW_NEEDED').map((w) => w.workspace_id)).toEqual(['TAGS_REGISTRATION', 'INSURANCE', 'COMPLIANCE']);
  });

  it('the first office view: ACTIVE WITH AIO · WE ALSO KNOW ABOUT · WORKSPACES THAT MAY HELP — never before confirmation', () => {
    const o = SC.POST_ACTIVATION_OFFICE;
    expect(o.before_confirmation.composed).toBe(false);
    expect(o.after_activation.composed).toBe(true);
    expect(o.after_activation.we_also_know_about.every((k) => k.label.endsWith('— REVIEW NEEDED'))).toBe(true);
    const known = o.after_activation.we_also_know_about.map((k) => k.workspace_id);
    for (const s of o.after_activation.workspaces_that_may_help) {
      expect(known).not.toContain(s.workspace_id);
      expect(s.rule_id).toBeTruthy();
      expect(s.reasons.length).toBeGreaterThan(0);
    }
    expect(o.during_critical_state?.suppressed_by).toContain('CRITICAL_STATE');
    expect(EXPANSION_PLACEMENTS).toContain('AFTER_ACTIVATION');
    for (const r of brain.AIO_EXPANSION_RULES) expect(r.placements, r.rule_id).toContain('AFTER_ACTIVATION');
  });

  it('ambiguous identity never merges; a new client candidate is created by staff decision', () => {
    expect(SC.B_AMBIGUOUS.weak_only.class).toBe('AMBIGUOUS');
    expect(SC.B_AMBIGUOUS.strong_collision.class).toBe('AMBIGUOUS');
    expect(SC.B_AMBIGUOUS.commit_refused[0]).toMatch(/identity not resolved/);
    expect(SC.C_NEW_CLIENT_CANDIDATE.class).toBe('NEW_CLIENT_CANDIDATE');
    expect(SC.C_NEW_CLIENT_CANDIDATE.created).toMatchObject({ class: 'MATCH_CONFIRMED', client_ref: null });
  });

  it('known-not-migrated: zero documents is not zero profile; prebuilt from staff knowledge and invitable early', () => {
    const d = SC.D_KNOWN_NOT_MIGRATED;
    expect(d).toMatchObject({ lifecycle: 'PREBUILT', counted_active: false, can_invite_now: true, welcome: 'WE KNOW YOUR BUSINESS. YOUR DIGITAL OFFICE IS JUST GETTING STARTED.' });
    expect(SC.COMPLETENESS.document_vault.state).toBe('NOT_STARTED');
    expect(SC.COMPLETENESS.business_profile.pct).toBeGreaterThan(0);
    expect(SC.COMPLETENESS.client_review.state).toBe('REQUIRED');
  });

  it('founder segmentation: one counted-active business out of the roster; a legacy “active” profile is not counted', () => {
    const f = SC.FOUNDER_SEGMENTS;
    expect(f.counted_active).toBe(1);
    expect(f.lifecycle_active_raw).toBe(2);
    expect(f.roster.find((r) => r.client_ref === 'shipper-demo-b')).toMatchObject({ segment: 'WAITING_FOR_CLIENT', counted_active: false });
    expect(SC.AUDIT.missing).toEqual([]);
  });
});

describe('Experience Brain registration', () => {
  it('AIO.CLIENT_MIGRATION and AIO.CLIENT_ACTIVATION are registered, in their families, and EXPERIENCE_COMPLETE', () => {
    const ids = brain.AIO_EXPERIENCE_CONTRACTS.map((c) => c.feature_id);
    expect(ids).toHaveLength(30);
    expect(ids.slice(-2)).toEqual(['AIO.CLIENT_MIGRATION', 'AIO.CLIENT_ACTIVATION']);
    expect(brain.AIO_FAMILY_MAP['F18 ACCOUNT']).toContain('AIO.CLIENT_ACTIVATION');
    expect(brain.AIO_FAMILY_MAP['ROLE: AIO OFFICE']).toContain('AIO.CLIENT_MIGRATION');
    for (const c of [brain.AIO_CLIENT_MIGRATION, brain.AIO_CLIENT_ACTIVATION]) expect(validateExperienceContract(c).earned_completion, c.feature_id).toBe('EXPERIENCE_COMPLETE');
  });

  it('future families are structure only: each needs its own visual authority', () => {
    expect(brain.AIO_FUTURE_AUTHORITY_FAMILIES.map((f) => f.family_id)).toEqual(['AIO.MIGRATION_INTAKE', 'AIO.MIGRATION_REVIEW', 'AIO.EXISTING_CLIENT_WELCOME', 'AIO.WHAT_CHANGED', 'AIO.CLIENT_OFFICE_ACTIVATION', 'AIO.CLIENT_OFFICE_HUB']);
    for (const f of brain.AIO_FUTURE_AUTHORITY_FAMILIES) expect(f.authority_status).toBe('VISUAL_AUTHORITY_REQUIRED');
  });
});

describe('exports stay generated from the TypeScript source', () => {
  it('the 12 docs/aio/client-migration artifacts match the generator', () => {
    const files = buildAioClientMigrationExports();
    expect(Object.keys(files).sort()).toEqual([
      'AIO_CLIENT_IDENTITY_AND_ACTIVATION.json', 'AIO_CLIENT_LIFECYCLE.json', 'AIO_CLIENT_MIGRATION_ARCHITECTURE.md', 'AIO_CLIENT_MIGRATION_EVENTS_AND_EXCEPTIONS.json',
      'AIO_CLIENT_MIGRATION_PROOF.md', 'AIO_EXISTING_CLIENT_FIRST_LOGIN.md', 'AIO_FOUNDER_CLIENT_STATUS_SURFACES.json', 'AIO_MIGRATION_PIPELINE_CONTRACT.json',
      'AIO_MIGRATION_REVIEW_CONTRACT.json', 'AIO_OFFICE_PROVISIONING_CONTRACT.json', 'AIO_VAULT_MIGRATION_LINEAGE.json', 'FUTURE_AUTHORITY_FAMILIES.md',
    ]);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(path.join(ROOT, `${AIO_CLIENT_MIGRATION_DOCS_DIR}/${name}`), 'utf8'), name).toBe(body);
    expect(JSON.parse(files['AIO_CLIENT_LIFECYCLE.json']).constraints).toEqual({ page_implementation: false, new_paid_generations: 0, openart_accessed: false, ifta_lane_blocked: false, aio_code_changed: false });
  });

  it('no sprint source or output uses OpenArt (only the §37 prohibition names it)', () => {
    const sources = [
      'shared/studioos-experience-brain/client-lifecycle.ts', 'shared/studioos-experience-brain/projects/aio/client-migration.ts',
      'shared/studioos-experience-brain/projects/aio/migration.ts', 'scripts/studioos/aio-client-migration-export.ts',
    ].map((f) => readFileSync(path.join(ROOT, f), 'utf8'));
    for (const body of [...sources, ...Object.values(buildAioClientMigrationExports())]) expect(body.replace(/no OpenArt( access)?/g, '')).not.toMatch(/\bopen\s?art\b/i);
  });
});
