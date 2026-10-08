/**
 * P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.EXISTING-DESIGN-RECONCILIATION1 — the founder's four-screen AIO OFFICE
 * design reconciled against the IA and the root authority contracts. The coverage is computed from the inventory; the
 * proposals must close every gap; nothing is decided or generated; export sync.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DESIGN_VIEWPORTS,
  aio as brain,
  drawnFigures,
  iaRootNav,
  referenceCoverage,
  validateDesignReconciliation,
  type DesignReconciliation,
} from '../shared/studioos-experience-brain/index';
import { ANTI_AI_FLAGS, TYPOGRAPHY_DEFECTS } from '../shared/studioos-visual-authority/index';
import { AIO_DESIGN_RECON_DOCS_DIR, aioDesignReconciliationQualityGate, buildAioDesignReconciliationExports, referenceSha256 } from '../scripts/studioos/aio-office-design-reconciliation-export';

const ROOT = path.resolve(__dirname, '..');
const REC = brain.AIO_DESIGN_RECONCILIATION;
const C = brain.AIO_OFFICE_CONTRACTS;
const IA = brain.AIO_OFFICE_IA;
const W = 'AIO_OFFICE.WORK';
const page = (root: string) => REC.pages.find((p) => p.root_id === root)!;
const cov = (id: string) => referenceCoverage(REC, C, IA).find((c) => c.root_id === id)!;
const tail = (ids: string[]) => ids.map((x) => x.split('.').pop());
const clone = (): DesignReconciliation => structuredClone(REC);
const v = (r: DesignReconciliation) => validateDesignReconciliation(r, C, IA).join('\n');

describe('The reference is the founder’s image, inspected', () => {
  it('is stored byte for byte and is the 1536 × 1024 four-screen composite', () => {
    const file = path.join(ROOT, REC.reference.file.path);
    expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(brain.AIO_DESIGN_RECON_REFERENCE_SHA256);
    const png = readFileSync(file);
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1536, 1024]);
    expect(REC.reference.screens.map((s) => s.root_id)).toEqual(['AIO_OFFICE.HOME', W, 'AIO_OFFICE.REPORTS', 'AIO_OFFICE.MORE']);
    for (const s of REC.reference.screens) expect(s.elements.length, s.root_id).toBeGreaterThan(10);
  });

  it('draws exactly the five AIO OFFICE roots in the dock', () => {
    expect(REC.reference.drawn_nav).toEqual(iaRootNav(IA, 'AIO_OFFICE'));
  });

  it('flags its AI artifacts with the studio anti-AI vocabulary', () => {
    const vocab = new Set<string>([...ANTI_AI_FLAGS, ...TYPOGRAPHY_DEFECTS]);
    const flags = REC.reference.screens.flatMap((s) => s.elements.flatMap((e) => e.anti_ai));
    for (const f of flags) expect(vocab.has(f.flag), f.flag).toBe(true);
    expect(flags.filter((f) => f.severity === 'MATERIAL').map((f) => f.flag).sort()).toEqual(['DATA_NOT_ENCODED', 'DUPLICATED_NAV_ITEM', 'MUTATED_WORDMARK']);
  });

  it('validates', () => {
    expect(validateDesignReconciliation(REC, C, IA)).toEqual([]);
  });
});

describe('Coverage, computed from the drawing', () => {
  it('HOME draws 6 of 8 regions; WORK ACROSS AIO draws 7 of 12 lanes plus INTAKE', () => {
    expect(tail(cov('AIO_OFFICE.HOME').missing)).toEqual(['QUICK_ACTIONS', 'BUSINESS_PULSE']);
    const wa = cov('AIO_OFFICE.HOME.WORK_ACROSS_AIO');
    expect(tail(wa.missing)).toEqual(['VEHICLES_FLEET', 'FACTORING', 'DRIVERS_CARRIERS', 'MECHANIC_MAINTENANCE', 'ROAD_READY']);
    expect(wa.extra).toEqual(['AIO_OFFICE.INTAKE']);
  });
  it('WORK draws 11 of 12 lanes — VEHICLES & FLEET missing, INTAKE drawn as a lane', () => {
    expect(tail(cov(W).missing)).toEqual(['VEHICLES_FLEET']);
    expect(cov(W).extra).toEqual(['AIO_OFFICE.INTAKE']);
  });
  it('REPORTS reaches 6 of 10 domains; MORE draws 8 of 11 entries', () => {
    expect(tail(cov('AIO_OFFICE.REPORTS').missing)).toEqual(['COMPLIANCE', 'DISPATCH_BROKERAGE', 'BOOKKEEPING', 'MIGRATION']);
    expect(tail(cov('AIO_OFFICE.MORE').missing)).toEqual(['GROWTH_CRM', 'BILLING', 'ACCOUNT']);
  });
  it('no drawn figure is production-backed — every one is a design example', () => {
    const f = drawnFigures(REC, C);
    expect(f.reduce((n, x) => n + x.figures.length, 0)).toBeGreaterThan(40);
    expect(f.filter((x) => x.production_backed)).toEqual([]);
  });
});

describe('The proposals close every gap without discarding the design', () => {
  it('WORK proposes exactly the 12 lanes in canonical order, no INTAKE, on the same 3 × 4 grid', () => {
    const lanes = page(W).proposed.filter((s) => s.maps_to.kind === 'LANE').map((s) => s.maps_to.id);
    expect(lanes).toEqual(C.lanes.map((l) => l.lane_id));
    expect(page(W).proposed.some((s) => s.maps_to.id === 'AIO_OFFICE.INTAKE')).toBe(false);
    expect(page(W).proposed.find((s) => s.maps_to.id === `${W}.VEHICLES_FLEET`)).toMatchObject({ asset: 'plate-fleet-yard' });
    expect(page(W).proposed.find((s) => s.maps_to.id === `${W}.VEHICLES_FLEET`)!.treatment).toMatch(/NO STAFF SCREEN YET/);
  });
  it('MORE proposes 11 entries, each in exactly one group; ADDITIONAL TOOLS goes', () => {
    const grouped = brain.AIO_MORE_PROPOSED_GROUPS.flatMap((g) => g.entries.map((e) => `AIO_OFFICE.MORE.${e}`));
    expect([...grouped].sort()).toEqual(C.more_entries.map((e) => e.entry_id).sort());
    expect(new Set(grouped).size).toBe(11);
    expect(page('AIO_OFFICE.MORE').proposed.filter((s) => s.maps_to.kind === 'MORE_ENTRY')).toHaveLength(11);
  });
  it('HOME proposes the 8 contract regions in contract order and owns nothing', () => {
    expect(page('AIO_OFFICE.HOME').proposed.filter((s) => s.maps_to.kind === 'REGION').map((s) => s.maps_to.id)).toEqual(C.roots[0].regions.map((r) => r.region_id));
  });
  it('REPORTS places all ten domains and shows unsupported figures only as honest states', () => {
    expect(brain.AIO_REPORT_DOMAIN_PLACEMENT.map((d) => `AIO_OFFICE.REPORTS.${d.domain}`)).toEqual(C.roots[2].regions.map((r) => r.region_id));
    const slots = page('AIO_OFFICE.REPORTS').proposed.filter((s) => s.maps_to.kind === 'METRIC');
    for (const s of slots) {
      const m = C.metrics.find((x) => x.metric_id === s.maps_to.id)!;
      if (m.classification === 'DERIVED_UNSUPPORTED' || m.classification === 'NOT_IMPLEMENTED') expect(s.treatment, s.slot_id).toMatch(/not connected/i);
      expect(s.treatment, s.slot_id).not.toMatch(/estimated|\(est\.\)/i);
    }
    expect(slots.find((s) => s.maps_to.id === 'financial.collected')!.treatment).toMatch(/founder/i);
  });
  it('keeps most of the drawing: only the INTAKE lane tile and card are removed', () => {
    const els = REC.reference.screens.flatMap((s) => s.elements);
    expect(els.filter((e) => e.verdict === 'REMOVE').map((e) => e.element_id)).toEqual(['home.tile.intake', 'work.card.intake']);
    for (const p of REC.pages) expect(p.preserve.length, p.root_id).toBeGreaterThan(2);
  });
});

describe('Brand, roles, responsive, decisions', () => {
  it('keeps the approved header lockup and keeps the dotted lockup out', () => {
    expect(REC.assets.find((a) => a.asset_id === 'logo-header')).toMatchObject({ path: 'all-in-one-enterprises/public/migration/brand-lockup.png' });
    expect(REC.assets.find((a) => a.asset_id === 'logo-global-dotted')).toMatchObject({ status: 'DO_NOT_USE' });
    expect(REC.assets.find((a) => a.asset_id === 'reference-composite')).toMatchObject({ status: 'DO_NOT_USE' });
  });
  it('founder and staff differ by role or grant, never by name', () => {
    for (const r of REC.roles) expect(`${r.decided_by} ${r.founder} ${r.staff}`, r.area).not.toMatch(/JORDAN|ALEX/i);
    for (const r of C.roots) expect(REC.roles.some((x) => x.root_id === r.root_id), r.root_id).toBe(true);
  });
  it('plans every page for mobile, tablet, desktop and wide, each with its own layout', () => {
    for (const r of C.roots) {
      const plans = REC.responsive.filter((p) => p.root_id === r.root_id);
      expect(plans.map((p) => p.viewport)).toEqual([...DESIGN_VIEWPORTS]);
      expect(new Set(plans.map((p) => p.layout)).size).toBe(4);
      expect(plans.find((p) => p.viewport === 'DESKTOP')!.nav).toMatch(/left menu HOME · INTAKE · WORK · REPORTS · MORE/);
    }
  });
  it('leaves every decision open for the founder; nine block regeneration', () => {
    expect(REC.decisions.every((d) => d.status === 'OPEN' && d.options.length >= 2 && d.recommendation.length > 0)).toBe(true);
    expect(REC.decisions.filter((d) => d.priority === 'BEFORE_REGENERATION').map((d) => d.decision_id)).toEqual(['D-HERO-SCALE', 'D-HOME-ATTENTION', 'D-WORK-CARD-SIGNALS', 'D-PHOTOGRAPHY', 'D-REPORTS-OVERVIEW', 'D-REPORTS-STAFF', 'D-MORE-GROUPS', 'D-DESKTOP-SHELL', 'D-CREATIVE-PROFILE']);
  });
  it('records the uppercase law and the privacy touchpoints', () => {
    expect(REC.cross_cutting.find((x) => x.topic === 'Uppercase law')!.verdict).toBe('CORRECT');
    for (const p of REC.privacy_touchpoints) expect(C.gaps.find((g) => g.gap_id === p.gap_id)!.kind, p.gap_id).toBe('PRIVACY');
  });
});

describe('Validator rejects what the reconciliation forbids', () => {
  it('a decision taken inside the reconciliation, an unknown asset, a missing viewport, a lane that does not exist, an unpathed DO_NOT_USE', () => {
    const a = clone(); a.decisions[0].status = 'DECIDED';
    expect(v(a)).toMatch(/only the founder decides/);
    const b = clone(); b.pages[1].proposed[0].asset = 'hero-nope';
    expect(v(b)).toMatch(/unknown asset hero-nope/);
    const c = clone(); c.responsive = c.responsive.filter((p) => !(p.root_id === W && p.viewport === 'WIDE'));
    expect(v(c)).toMatch(/AIO_OFFICE.WORK WIDE: no plan/);
    const d = clone(); d.reference.screens[1].elements[3].maps_to = [{ kind: 'LANE', id: `${W}.TRUCKING` }];
    expect(v(d)).toMatch(/LANE AIO_OFFICE.WORK.TRUCKING does not exist/);
    const e = clone(); e.assets.find((x) => x.asset_id === 'logo-global-dotted')!.path = null;
    expect(v(e)).toMatch(/DO_NOT_USE without a path/);
  });
});

describe('Quality gate and export sync', () => {
  it('passes the gate', () => {
    const g = aioDesignReconciliationQualityGate(referenceSha256(ROOT));
    expect(g.violations).toEqual([]);
    expect(Object.fromEntries(g.checks.map((c) => [c.key, c.value]))).toEqual({
      ATTACHMENT_INSPECTED: 'YES',
      EXISTING_DESIGN_PRESERVED: 'YES',
      PAGES_MATCH_CONTRACTS: 'YES',
      WORK_TWELVE_LANES: 'YES',
      MORE_ELEVEN_ENTRIES: 'YES',
      HOME_NO_SERVICE_OWNERSHIP: 'YES',
      REPORTS_NO_INVENTED_FIGURES: 'YES',
      FOUNDER_STAFF_VISIBILITY_DEFINED: 'YES',
      RESPONSIVE_PLAN_INTENTIONAL: 'YES',
      BRANDING_PRESERVED: 'YES',
      PRODUCTION_CODE_CHANGED: 'NO',
      IMAGES_GENERATED: '0',
      EXISTING_WORK_DISCARDED: 'NO',
      FOUNDER_APPROVAL_REQUIRED: 'YES',
      READY_FOR_FOUNDER_REVIEW: 'YES',
    });
  });
  it('docs/aio/office-design-reconciliation is in sync with the source', () => {
    const files = buildAioDesignReconciliationExports(referenceSha256(ROOT));
    expect(Object.keys(files).filter((f) => /^\d\d_/.test(f))).toEqual(['01_EXISTING_FOUR_SCREEN_AUDIT.md', '02_HOME_RECONCILIATION.md', '03_WORK_RECONCILIATION.md', '04_REPORTS_RECONCILIATION.md', '05_MORE_RECONCILIATION.md', '06_EXISTING_VS_REQUIRED.md', '07_RECOMMENDED_CHANGES.md', '08_FOUNDER_DECISIONS.md', '09_RESPONSIVE_DESIGN_PLAN.md', '10_ASSET_PRESERVATION_PLAN.md']);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(path.join(ROOT, `${AIO_DESIGN_RECON_DOCS_DIR}/${name}`), 'utf8'), name).toBe(body);
  });
});
