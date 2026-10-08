/**
 * P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.CREATIVE-DIRECTION-AND-WORKSPACE-RECOVERY1 — the four workspace proofs: exactly four,
 * distinct, each with its states, devices and demonstrations; candidates only; approved roots unchanged; no expansion,
 * no live change, no invented figures; the privacy gaps stay open and separate.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aio as brain } from '../shared/studioos-experience-brain/index.js';
import { AIO_WP_DOCS_DIR, aioWorkspaceProofsQualityGate, buildAioWorkspaceProofsExports } from '../scripts/studioos/aio-office-workspace-proofs-export.js';

describe('Four proofs, no more', () => {
  it('validates clean', () => {
    expect(brain.validateWorkspaceProofs()).toEqual([]);
  });

  it('is exactly VEHICLES & FLEET, BOOKKEEPING, COMPLIANCE and CLIENT 360, each centred on its own subject', () => {
    expect(brain.AIO_WP_PROOFS.map((p) => p.workspace)).toEqual(['VEHICLES & FLEET', 'BOOKKEEPING', 'COMPLIANCE', 'CLIENT 360']);
    expect(brain.AIO_WP_PROOFS.map((p) => p.centered_on)).toEqual(['THE VEHICLE', 'THE PERIOD', 'THE DEADLINE AND ITS RISK', 'THE RELATIONSHIP']);
    expect(new Set(brain.AIO_WP_PROOFS.map((p) => p.signature)).size).toBe(4);
  });

  it('notices a missing state (the check is not vacuous)', () => {
    const p = brain.AIO_WP_PROOFS[1];
    const keep = p.states.context;
    p.states.context = '';
    try {
      expect(brain.validateWorkspaceProofs()).toContain('books: missing context state');
    } finally {
      p.states.context = keep;
    }
  });

  it('keeps DOT / SAFETY, EXPIRATIONS, AUDITS and CORRECTIVE WORK inside the one COMPLIANCE lane', () => {
    const comp = brain.AIO_WP_PROOFS.find((p) => p.id === 'comp')!;
    expect(comp.ia.every((n) => n.startsWith('AIO_OFFICE.WORK.COMPLIANCE'))).toBe(true);
    expect(comp.ia).toContain('AIO_OFFICE.WORK.COMPLIANCE.DOT_SAFETY');
    expect(comp.ia).toContain('AIO_OFFICE.WORK.COMPLIANCE.AUDIT_CORRECTIVE_WORK');
  });

  it('gives every proof a phone, tablet, desktop and ultra-wide composition and at least two TRY demonstrations', () => {
    expect(brain.AIO_WP_DEVICES.map((d) => d.size)).toEqual(['1440 × 900', '834 × 1194', '390 × 844', '2560 × 1440']);
    for (const p of brain.AIO_WP_PROOFS) expect(brain.AIO_WP_DEMOS[p.id].length).toBeGreaterThanOrEqual(2);
    expect(brain.AIO_WP_DEMOS.client[0]).toBe('ABC → INSURANCE → A TRUCK → BACK');
  });
});

describe('Honesty and boundaries', () => {
  it('records the fleet proof as design only and invents no figures', () => {
    expect(brain.AIO_WP_PROOFS.find((p) => p.id === 'fleet')!.live).toMatch(/^DESIGN_ONLY/);
    const books = brain.AIO_WP_PROOFS.find((p) => p.id === 'books')!;
    expect(books.not_invented.join(' ')).toMatch(/No account balances/);
    expect(books.not_invented.join(' ')).toMatch(/No completed reconciliation/);
    expect(books.honest.join(' ')).toMatch(/SAMPLE/);
  });

  it('stays a candidate: no approval, no expansion, roots unchanged, live app unchanged', () => {
    expect(brain.AIO_WP_STATUS.proofs).toMatch(/CANDIDATES, AWAITING FOUNDER APPROVAL$/);
    expect(brain.AIO_WP_STATUS.expansion).toMatch(/^NOT STARTED/);
    expect(brain.AIO_WP_STATUS.approved_roots).toMatch(/^UNCHANGED/);
    expect(brain.AIO_WP_STATUS.live_app).toMatch(/^NOT CHANGED/);
    expect(brain.AIO_WP_STATUS.batch1).toMatch(/FUNCTIONAL STRUCTURE ONLY, NOT APPROVED VISUALS/);
  });

  it('keeps the PREBUILT gate and founder-only boundaries in Client 360', () => {
    const client = brain.AIO_WP_PROOFS.find((p) => p.id === 'client')!;
    expect(client.honest.join(' ')).toMatch(/PREBUILT · NOT ACTIVE YET/);
    expect(brain.AIO_WP_ROLES.find((r) => r.area.startsWith('Client 360'))!.staff).toMatch(/^Not shown/);
  });

  it('uses no generated imagery and the approved lockup only', () => {
    expect(brain.AIO_WP_ASSETS.generated).toMatch(/^NONE/);
    expect(brain.AIO_WP_ASSETS.logo).toBe('The approved lockup only');
  });

  it('lists the twelve privacy gaps as a dependency, not as fixed', () => {
    expect(brain.AIO_WP_STATUS.security).toMatch(/^12 PRIVACY GAPS STILL OPEN/);
    expect(brain.AIO_WP_DEPENDENCIES.find((d) => d.area === 'Security')!.dependency).toMatch(/^The 12 privacy repairs/);
  });

  it('records QA that actually ran with no failures, and the defects found by looking', () => {
    expect(brain.AIO_WP_QA.failures).toBe(0);
    expect(brain.AIO_WP_QA.checks_run).toBeGreaterThan(100);
    expect(brain.AIO_WP_QA.found_and_fixed.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Generated documents', () => {
  it('passes the quality gate without claiming approval', () => {
    const g = aioWorkspaceProofsQualityGate();
    expect(g.problems).toEqual([]);
    expect(g.gate.FOUNDER_APPROVED).toMatch(/^NO/);
    expect(g.gate.EXPANDED_TO_OTHER_LANES).toMatch(/^NO/);
    expect(g.gate.APPROVED_ROOTS_CHANGED).toBe('NO');
  });

  it('keeps docs/aio/office-workspace-proofs in sync with the Brain', () => {
    const files = buildAioWorkspaceProofsExports();
    expect(Object.keys(files)).toHaveLength(11);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(`${AIO_WP_DOCS_DIR}/${name}`, 'utf8'), name).toBe(body);
  });
});
