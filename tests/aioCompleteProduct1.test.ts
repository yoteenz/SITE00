/**
 * P0.AIO.COMPLETE-PRODUCT-VISUAL-CONVERGENCE.INTERNAL-OFFICE-AND-PUBLIC-WEBSITE1 — the complete AIO OFFICE and the public
 * website design: twelve lanes each built around its own object, REPORTS ten and MORE eleven, the approved roots and the
 * live app untouched, Brokerage paused; the public homepage held to the recovered founder reference with what differs
 * recorded, nothing missing substituted, no prices; the exported docs in sync.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aio as brain } from '../shared/studioos-experience-brain/index.js';
import { AIO_CP_DOCS_DIR, aioCompleteProductQualityGate, buildAioCompleteProductExports } from '../scripts/studioos/aio-complete-product-export.js';

describe('The complete office', () => {
  it('validates clean', () => {
    expect(brain.validateCompleteProduct()).toEqual([]);
  });

  it('has all twelve lanes, in order, each built around its own object', () => {
    const lanes = brain.AIO_CP_OFFICE.filter((p) => /^\d\d$/.test(p.no));
    expect(lanes.map((l) => l.name)).toEqual(['PERMITTING & AUTHORITIES', 'FILING & FUEL TAXES', 'COMPLIANCE', 'VEHICLES & FLEET', 'DISPATCH', 'BROKERAGE', 'INSURANCE', 'FACTORING', 'BOOKKEEPING', 'DRIVERS & CARRIERS', 'MECHANIC / MAINTENANCE', 'ROAD READY']);
    expect(new Set(brain.AIO_CP_OFFICE.map((p) => p.built_around)).size).toBe(brain.AIO_CP_OFFICE.length);
  });

  it('notices a cloned composition (the check is not vacuous)', () => {
    const p = brain.AIO_CP_OFFICE.find((x) => x.id === 'dispatch')!;
    const keep = p.built_around;
    p.built_around = 'A TRUCK';
    try {
      expect(brain.validateCompleteProduct()).toContain('every page is built around its own object (no clones)');
    } finally {
      p.built_around = keep;
    }
  });

  it('covers HOME, INTAKE, REPORTS (ten areas), MORE (eleven destinations) and reuses Client 360', () => {
    for (const id of ['home', 'intake', 'reports', 'more', 'client']) expect(brain.AIO_CP_OFFICE.find((p) => p.id === id), id).toBeTruthy();
    expect(brain.AIO_CP_REPORTS_AREAS).toHaveLength(10);
    expect(brain.AIO_CP_MORE_DESTINATIONS).toHaveLength(11);
  });

  it('keeps the roots, the live app and Brokerage where they were', () => {
    expect(brain.AIO_CP_STATUS.approved_roots).toMatch(/^UNCHANGED/);
    expect(brain.AIO_CP_STATUS.live_app).toMatch(/^NOT CHANGED/);
    expect(brain.AIO_CP_STATUS.brokerage).toMatch(/^PAUSED/);
    expect(brain.AIO_CP_STATUS.security).toMatch(/PRIVACY GAPS STILL OPEN/);
  });
});

describe('The public website', () => {
  it('holds the homepage to panel 04 and records what differs and why', () => {
    expect(brain.AIO_CP_PUBLIC_HOME.reference).toMatch(/panel 04/);
    expect(brain.AIO_CP_PUBLIC_HOME.differs.join(' ')).toMatch(/unverified/);
    expect(brain.AIO_CP_PUBLIC_RECOVERY.decision).toMatch(/Nothing was substituted/);
    expect(brain.AIO_CP_PUBLIC_RECOVERY.not_found.join(' ')).toMatch(/13-screen/);
  });

  it('designs the whole recovered tree and is not deployed', () => {
    expect(brain.AIO_CP_PUBLIC_TREE.reduce((n, g) => n + g.pages, 0)).toBe(brain.AIO_CP_QA.public.pages);
    expect(brain.AIO_CP_STATUS.public_site).toMatch(/NOT DEPLOYED$/);
  });

  it('shows no price and says why', () => {
    expect(JSON.stringify([brain.AIO_CP_PUBLIC_HOME, brain.AIO_CP_PUBLIC_FAMILY, brain.AIO_CP_PUBLIC_TREE])).not.toMatch(/\$\s?\d/);
    expect(brain.AIO_CP_PUBLIC_RULES.join(' ')).toMatch(/No prices/);
  });

  it('reuses assets only — nothing generated', () => {
    expect(brain.AIO_CP_ASSETS.length).toBeGreaterThan(5);
    for (const a of brain.AIO_CP_ASSETS) expect(a.provenance.length, a.asset).toBeGreaterThan(5);
  });
});

describe('Exports', () => {
  it('the quality gate passes and the docs on disk match the record', () => {
    const g = aioCompleteProductQualityGate();
    expect(g.problems).toEqual([]);
    expect(g.gate.FOUNDER_APPROVED).toMatch(/^NO/);
    const files = buildAioCompleteProductExports();
    expect(Object.keys(files).sort()).toEqual(['01_OFFICE.md', '02_PUBLIC_WEBSITE.md', '03_QA_AND_SIZES.md', '04_ASSETS.md', '05_COMPOSER_HANDOFF.md', '06_GAPS_AND_DECISIONS.md', 'COMPLETE_PRODUCT.json', 'QUALITY_GATE.json', 'README.md']);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(`${AIO_CP_DOCS_DIR}/${name}`, 'utf8'), name).toBe(body);
  });
});
