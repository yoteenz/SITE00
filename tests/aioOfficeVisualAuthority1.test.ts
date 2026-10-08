/**
 * P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1 — the founder's approval of the
 * fifteen design decisions, the internal AIO OFFICE creative-direction profile, and the HOME · WORK · REPORTS · MORE
 * visual authority candidates (renders in fsbw, pinned here by sha256).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aio as brain, validateDecisionApprovals } from '../shared/studioos-experience-brain/index.js';
import { AIO_OFFICE_CREATIVE_DIRECTION_PROFILE as PROFILE, AIO_OFFICE_PROFILE_SCOPE as SCOPE, CREATIVE_DIRECTION_PROJECT_COVERAGE, checkCreativeDirectionProfile } from '../shared/studioos-visual-authority/index.js';
import { AIO_VA_DOCS_DIR, aioVisualAuthorityQualityGate, buildAioVisualAuthorityExports } from '../scripts/studioos/aio-office-visual-authority-export.js';

const REC = brain.AIO_DESIGN_RECONCILIATION;
const APPROVALS = brain.AIO_DESIGN_DECISION_APPROVALS;

describe('Founder approval of the fifteen decisions', () => {
  it('records exactly one FOUNDER approval per reconciliation decision, each the recommended option', () => {
    expect(APPROVALS).toHaveLength(15);
    expect(validateDecisionApprovals(REC, APPROVALS)).toEqual([]);
    for (const a of APPROVALS) {
      const d = REC.decisions.find((x) => x.decision_id === a.decision_id)!;
      expect(a.decided_by).toBe('FOUNDER');
      expect(a.chosen_option, a.decision_id).toBe(d.recommended_option);
      expect(a.date).toBe('2026-10-08');
    }
  });

  it('carries the one modification: the profile is for the internal AIO OFFICE only', () => {
    const mods = APPROVALS.filter((a) => a.modification);
    expect(mods.map((a) => a.decision_id)).toEqual(['D-CREATIVE-PROFILE']);
    expect(mods[0].modification).toMatch(/internal AIO OFFICE/);
    expect(mods[0].modification).toMatch(/public website/);
    expect(mods[0].modification).toMatch(/CLIENT OFFICE/);
    expect(mods[0].modification).toMatch(/IFTA and client-migration authorities remain valid and protected/);
  });

  it('keeps the reconciliation as delivered (lineage): its decisions stay OPEN, the approvals live beside it', () => {
    expect(REC.decisions.every((d) => d.status === 'OPEN')).toBe(true);
    expect(validateDecisionApprovals(REC, [...APPROVALS, APPROVALS[0]]).length).toBeGreaterThan(0);
    expect(validateDecisionApprovals(REC, APPROVALS.slice(1)).length).toBeGreaterThan(0);
  });
});

describe('Internal AIO OFFICE creative-direction profile', () => {
  it('is ready, project-specific and scoped as the founder said', () => {
    expect(checkCreativeDirectionProfile(PROFILE)).toEqual({ status: 'PROFILE_READY', missing: [] });
    expect(PROFILE.project_id).toBe('AIO');
    expect(SCOPE.applies_to.join(' ')).toMatch(/AIO OFFICE/);
    expect(SCOPE.does_not_apply_to.join(' ')).toMatch(/PUBLIC/);
    expect(SCOPE.does_not_apply_to.join(' ')).toMatch(/CLIENT OFFICE/);
    expect(SCOPE.protected.join(' ')).toMatch(/IFTA/);
    expect(SCOPE.protected.join(' ')).toMatch(/migration/);
    expect(CREATIVE_DIRECTION_PROJECT_COVERAGE.find((c) => c.project_id === 'AIO')!.status).toBe('PROFILE_READY');
  });

  it('keeps the logo law and the renderer rules', () => {
    expect(PROFILE.logo_system.forbidden.join(' ')).toMatch(/dot above the I/);
    expect(PROFILE.renderer.forbidden_providers).toContain('OpenArt');
    expect(PROFILE.anti_ai_rules.join(' ')).toMatch(/HYBRID_HARD_RULE/);
  });
});

describe('Visual authority candidates', () => {
  it('the record is complete and consistent', () => {
    expect(brain.validateVisualAuthority()).toEqual([]);
  });

  it('covers HOME, WORK, REPORTS and MORE at phone, tablet, desktop and ultra-wide, with staff variants', () => {
    for (const root of ['HOME', 'WORK', 'REPORTS', 'MORE'])
      for (const vp of ['MOBILE', 'TABLET', 'DESKTOP', 'ULTRA_WIDE']) expect(brain.AIO_VA_FRAMES.some((f) => f.root === root && f.viewport === vp), `${root} ${vp}`).toBe(true);
    expect(brain.AIO_VA_FRAMES.filter((f) => f.actor.startsWith('STAFF')).map((f) => f.frame)).toEqual(
      expect.arrayContaining(['AIO-OFFICE-REPORTS-MOBILE-STAFF-NO-ACCESS', 'AIO-OFFICE-REPORTS-DESKTOP-STAFF-GRANTED', 'AIO-OFFICE-MORE-MOBILE-STAFF', 'AIO-OFFICE-HOME-DESKTOP-STAFF']),
    );
  });

  it('pins every render by sha256 and every render passed the visual QA read from the DOM', () => {
    expect(brain.AIO_VA_RENDERS).toHaveLength(38);
    for (const r of brain.AIO_VA_RENDERS) {
      expect(r.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(r.file.startsWith('AIO_OFFICE_VISUAL_AUTHORITY/')).toBe(true);
      expect(r.qa_pass, r.file).toBe(true);
      if (!r.frame.endsWith('ORIGINAL-VS-REVISED')) expect(r.qa_checks, r.file).toContain('UPPERCASE_LAW');
    }
    const check = (frame: string, c: string) => expect(brain.AIO_VA_RENDERS.find((r) => r.frame === frame)!.qa_checks, frame).toContain(c);
    check('AIO-OFFICE-WORK-MOBILE', 'TWELVE_LANES_CANONICAL_ORDER_NO_INTAKE');
    check('AIO-OFFICE-HOME-DESKTOP', 'HOME_TWELVE_LANES_NO_INTAKE');
    check('AIO-OFFICE-HOME-DESKTOP', 'FIVE_ITEM_NAV_WORK_REPLACES_FILING');
    check('AIO-OFFICE-HOME-DESKTOP', 'APPROVED_HEADER_LOCKUP_ONLY');
    check('AIO-OFFICE-MORE-TABLET', 'FOUR_MORE_GROUPS');
    check('AIO-OFFICE-REPORTS-DESKTOP-STAFF-GRANTED', 'NO_FOUNDER_FINANCIALS_FOR_STAFF');
    check('AIO-OFFICE-MORE-DESKTOP-STAFF', 'GRANT_ONLY_ENTRIES_OMITTED');
  });

  it('distinguishes approved decisions from visuals awaiting approval, and authorizes no implementation', () => {
    expect(brain.AIO_VA_STATUS.decisions).toMatch(/^APPROVED/);
    expect(brain.AIO_VA_STATUS.visuals).toMatch(/^GENERATED/);
    expect(brain.AIO_VA_STATUS.approval).toMatch(/^AWAITING FOUNDER APPROVAL/);
    expect(brain.AIO_VA_STATUS.implementation).toMatch(/^NOT AUTHORIZED/);
    expect(brain.AIO_VA_COMPOSER_HANDOFF.status).toMatch(/^DRAFT/);
    expect(brain.AIO_VA_NEXT_GATE).toBe('FOUNDER REVIEW OF COMPLETED AIO OFFICE VISUAL AUTHORITIES');
    const g = aioVisualAuthorityQualityGate();
    expect(g.gate.VISUALS_APPROVED_BY_FOUNDER).toMatch(/^NO/);
    expect(g.gate.LIVE_IMPLEMENTATION_AUTHORIZED).toBe('NO');
    expect(Object.values(g.constraints).every((v) => v === false)).toBe(true);
  });

  it('reports the blocked photo pass honestly, with the fix, and lists every interim image', () => {
    expect(brain.AIO_VA_PHOTOGRAPHY_PASS.status).toBe('BLOCKED');
    expect(brain.AIO_VA_PHOTOGRAPHY_PASS.fix).toMatch(/www\.figma\.com/);
    expect(brain.AIO_VA_MISSING_ASSETS.filter((m) => /lane photograph/.test(m.asset))).toHaveLength(7);
    expect(brain.AIO_VA_ASSET_REUSE.filter((a) => a.status === 'APPROVED_REUSED_SHARED')).toHaveLength(4);
    expect(brain.AIO_VA_ASSET_REUSE.find((a) => /dotted/.test(a.asset))!.status).toBe('NOT_USED');
    expect(brain.AIO_VA_ASSET_REUSE.find((a) => /header lockup/i.test(a.asset))!.path).toBe('all-in-one-enterprises/public/migration/brand-lockup.png');
  });

  it('maps every recorded privacy gap to the visual decision that waits on it', () => {
    const gaps = brain.AIO_VA_PERMISSION_NOTES.flatMap((n) => n.depends_on).filter((d) => d.startsWith('P-'));
    expect(new Set(gaps).size).toBe(12);
  });
});

describe('Docs', () => {
  it(`${AIO_VA_DOCS_DIR} is exactly what the exporter produces`, () => {
    const files = buildAioVisualAuthorityExports();
    expect(Object.keys(files)).toHaveLength(13);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(`${AIO_VA_DOCS_DIR}/${name}`, 'utf8'), name).toBe(body);
  });
});
