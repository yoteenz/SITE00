/**
 * P0.AIO.OFFICE.COMPLETE-INTERNAL-OFFICE-AND-UNIFIED-EXPERIENCE1 — the unified internal AIO OFFICE record: every IA node
 * has a page family, the five roots stay five, approved authorities are shown unchanged, roles and the activation gate
 * hold, the twelve privacy gaps stay recorded as OPEN with a separate handoff, and nothing claims the office is complete.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aio as brain } from '../shared/studioos-experience-brain/index.js';
import { AIO_UO_DOCS_DIR, aioUnifiedExperienceQualityGate, buildAioUnifiedExperienceExports } from '../scripts/studioos/aio-office-unified-experience-export.js';

const tree = brain.AIO_UO_PAGE_TREE;
const IA = brain.AIO_OFFICE_IA.nodes;

describe('Coverage of the canonical office IA', () => {
  it('validates clean', () => {
    expect(brain.validateUnifiedExperience()).toEqual([]);
  });

  it('gives every INTAKE section, WORK lane and lane section, REPORTS domain and MORE entry a page family', () => {
    const have = new Set(tree.flatMap((p) => p.ia));
    const needed = IA.filter((n) => n.node_id.startsWith('AIO_OFFICE.') && n.node_id.split('.').length >= 3 && ['SECTION', 'SERVICE_LANE', 'LANE_SECTION', 'REPORT_DOMAIN', 'DIRECTORY_ENTRY'].includes(n.kind));
    expect(needed.length).toBeGreaterThan(70);
    for (const n of needed) expect(have.has(n.node_id), n.node_id).toBe(true);
  });

  it('notices a missing lane (the check is not vacuous)', () => {
    const lanes = brain.AIO_UO_LANES.splice(3, 1);
    try {
      // the tree was built at import; rebuild-free check: drop the lane's pages and re-run the coverage rule
      const have = new Set(tree.filter((p) => !p.route.startsWith('work/vehicles')).flatMap((p) => p.ia));
      expect(have.has('AIO_OFFICE.WORK.VEHICLES_FLEET')).toBe(false);
      expect(brain.validateUnifiedExperience()).toContain('expected twelve WORK lanes');
    } finally {
      brain.AIO_UO_LANES.splice(3, 0, ...lanes);
    }
  });

  it('keeps exactly five roots and never restores FILING', () => {
    expect([...new Set(tree.map((p) => p.root))].sort()).toEqual(['HOME', 'INTAKE', 'MORE', 'REPORTS', 'WORK']);
    expect(tree.some((p) => /^FILING\b/.test(p.family))).toBe(false);
    expect(tree.filter((p) => p.review === 'APPROVED_ROOT').map((p) => p.route).sort()).toEqual(['home', 'more', 'reports', 'work']);
  });

  it('has twelve purpose-built lanes, ten report domains and eleven MORE destinations in four groups', () => {
    expect(brain.AIO_UO_LANES.map((l) => l.slug)).toEqual(['permitting', 'filing', 'compliance', 'vehicles', 'dispatch', 'brokerage', 'insurance', 'factoring', 'bookkeeping', 'drivers', 'maintenance', 'roadready']);
    expect(new Set(brain.AIO_UO_LANES.map((l) => l.landing)).size).toBe(12);
    expect(brain.AIO_UO_REPORT_DOMAINS).toHaveLength(10);
    expect(brain.AIO_UO_MORE).toHaveLength(11);
    expect([...new Set(brain.AIO_UO_MORE.map((m) => m.group))]).toEqual(['CLIENTS & RECORDS', 'BUSINESS', 'PEOPLE & NETWORK', 'SYSTEM']);
  });
});

describe('Approved work is preserved, honesty is kept', () => {
  it('shows the IFTA command and the migration screens as approved authority, unchanged', () => {
    const filing = brain.AIO_UO_LANES.find((l) => l.slug === 'filing')!;
    expect(filing.tabs[0][3]).toBe('APPROVED_AUTHORITY');
    expect(tree.find((p) => p.route === 'intake/flow/:branch/:step')!.review).toBe('APPROVED_AUTHORITY');
    expect(brain.AIO_UO_QA.authority_renders).toMatch(/^38\/38 identical/);
  });

  it('draws product gaps as honest states and keeps brokerage paused', () => {
    for (const r of ['work/permitting/boc3', 'work/compliance/dot_safety', 'work/dispatch/my_loads', 'work/bookkeeping/reconciliation', 'work/drivers/credentials']) expect(tree.find((p) => p.route === r)!.review, r).toBe('HONEST_STATE');
    expect(tree.filter((p) => p.route.startsWith('work/brokerage')).every((p) => p.live === 'PAUSED')).toBe(true);
    expect(tree.filter((p) => p.route.startsWith('work/vehicles')).every((p) => p.live === 'DESIGN_ONLY')).toBe(true);
  });

  it('keeps the activation gate: approval lands on PREBUILT and is founder-only', () => {
    expect(brain.AIO_UO_ROLES.find((r) => r.area === 'INTAKE founder review')!.staff).toBe('SEND FOR FOUNDER REVIEW only');
    expect(brain.AIO_UO_QA.interactions).toContain('migration approval is founder-only and lands on PREBUILT');
  });

  it('never claims the office or the live app complete', () => {
    expect(brain.AIO_UO_STATUS.office).toMatch(/^NOT COMPLETE/);
    expect(brain.AIO_UO_STATUS.live_app).toMatch(/^NOT COMPLETE/);
    expect(brain.AIO_UO_COMPOSER_PLAN.status).toMatch(/^DRAFT/);
    expect(brain.AIO_UO_CONTINUATION.length).toBeGreaterThanOrEqual(5);
  });

  it('uses no new generated imagery and the approved lockup only', () => {
    expect(brain.AIO_UO_ASSETS.created).toEqual([]);
    expect(brain.AIO_UO_ASSETS.generated).toMatch(/^NONE/);
    expect(brain.AIO_UO_ASSETS.still_missing.length).toBe(brain.AIO_VA_MISSING_ASSETS.length);
  });
});

describe('Roles, context and security', () => {
  it('never ties privileges to a name or email', () => {
    expect(brain.AIO_UO_ROLES.find((r) => r.area === 'Identity')!.staff_with_reports).toMatch(/never the name or email/);
    expect(brain.AIO_UO_GRANT_ENFORCEMENT.join(' ')).toMatch(/never by hiding a button, never by name or email/);
  });

  it('lists the same twelve privacy gaps as the contracts sprint, all still OPEN, with nothing patched', () => {
    const contractGaps = brain.AIO_IMPLEMENTATION_GAPS.filter((g) => g.gap_id.startsWith('P-')).map((g) => g.gap_id).sort();
    expect(brain.AIO_UO_SECURITY_HANDOFF.map((g) => g.gap_id).sort()).toEqual(contractGaps);
    expect(brain.AIO_UO_SECURITY_HANDOFF.every((g) => g.status === 'OPEN')).toBe(true);
    expect(brain.AIO_UO_SECURITY_RECHECK.patched_here).toMatch(/^NOTHING/);
  });

  it('records the client context model and the founder-only page families', () => {
    expect(brain.AIO_UO_CLIENT_CONTEXT.length).toBe(5);
    const founderOnly = tree.filter((p) => p.founder_only).map((p) => p.route).sort();
    expect(founderOnly).toEqual(['more/billing', 'more/growth_crm', 'rec/invoice/:id', 'reports/financial_revenue', 'work/brokerage/financials']);
  });

  it('every journey step resolves to a page family', () => {
    expect(brain.AIO_UO_JOURNEYS).toHaveLength(9);
    expect(brain.validateUnifiedExperience().filter((p) => p.startsWith('journey'))).toEqual([]);
  });
});

describe('Generated documents', () => {
  it('passes the quality gate without claiming approval', () => {
    const g = aioUnifiedExperienceQualityGate();
    expect(g.problems).toEqual([]);
    expect(g.gate.FOUNDER_APPROVED).toMatch(/^NO/);
    expect(g.gate.OFFICE_COMPLETE).toMatch(/^NO/);
    expect(g.gate.SECURITY_GAPS_FIXED).toMatch(/^NO/);
  });

  it('keeps docs/aio/office-unified-experience in sync with the Brain', () => {
    const files = buildAioUnifiedExperienceExports();
    expect(Object.keys(files)).toHaveLength(16);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(`${AIO_UO_DOCS_DIR}/${name}`, 'utf8'), name).toBe(body);
  });
});
