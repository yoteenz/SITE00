/**
 * P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.MATERIAL-MOTION-AND-DETAIL-POLISH1 — the AIO OFFICE WORKSPACE STYLE: the locked
 * language stays inside the brief (type, motion, gold, drawers, reduced motion, overflow); defects A–J are recorded with
 * their fixes; the founder recording is not claimed; nothing expands, the roots and the public site stay separate, and
 * the privacy gaps stay open.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aio as brain } from '../shared/studioos-experience-brain/index.js';
import { AIO_WSS_DOCS_DIR, aioWorkspaceStyleQualityGate, buildAioWorkspaceStyleExports } from '../scripts/studioos/aio-office-workspace-style-export.js';

describe('The locked style', () => {
  it('validates clean', () => {
    expect(brain.validateWorkspaceStyle()).toEqual([]);
  });

  it('keeps the type scale at 9 / 10 / 12 / 13 / 17 px, inside the brief, never below 9', () => {
    expect(brain.AIO_WSS_TYPE.map((t) => t.value)).toEqual(['9px', '10px', '12px', '13px', '17px']);
    for (const t of brain.AIO_WSS_TYPE) expect(parseFloat(t.value), t.name).toBeGreaterThanOrEqual(Math.max(9, t.min!));
  });

  it('keeps every duration inside its range and the easing without bounce', () => {
    expect(brain.AIO_WSS_MOTION.map((t) => [t.name, t.value])).toEqual([['--m-micro', '130ms'], ['--m-select', '190ms'], ['--m-panel', '260ms'], ['--m-context', '320ms'], ['--m-out', '200ms']]);
    for (const t of brain.AIO_WSS_MOTION) {
      expect(parseFloat(t.value), t.name).toBeGreaterThanOrEqual(t.min!);
      expect(parseFloat(t.value), t.name).toBeLessThanOrEqual(t.max!);
    }
    expect(brain.AIO_WSS_EASING[0].value).toBe('cubic-bezier(0.22, 0.9, 0.28, 1)');
  });

  it('notices a duration outside the brief (the check is not vacuous)', () => {
    const t = brain.AIO_WSS_MOTION[2];
    const keep = t.value;
    t.value = '900ms';
    try {
      expect(brain.validateWorkspaceStyle()).toContain('--m-panel 900ms outside 200–300');
    } finally {
      t.value = keep;
    }
  });

  it('covers every section the brief asked for and keeps gold to its five meanings', () => {
    expect(brain.AIO_WS_STYLE.map((s) => s.id)).toEqual(['layout', 'hierarchy', 'responsive', 'type', 'spacing', 'surfaces', 'gold', 'states', 'panels', 'drawers', 'motion', 'reduced', 'overflow', 'a11y', 'scope']);
    const gold = brain.AIO_WS_STYLE.find((s) => s.id === 'gold')!.rules.join(' ');
    expect(gold).toMatch(/ACTIVE · SELECTED · READY · NEXT · FOCUSED/);
    expect(gold).toMatch(/Glow is never the only signal/);
    for (const s of ['hover', 'focus', 'pressed', 'loading', 'disabled', 'success']) expect(brain.AIO_WS_STYLE.find((x) => x.id === 'states')!.rules.join(' ').toLowerCase()).toContain(s);
  });

  it('specifies drawers that never cover a title and behave like a dialog', () => {
    const d = brain.AIO_WS_STYLE.find((s) => s.id === 'drawers')!.rules.join(' ');
    expect(d).toMatch(/close button never sits on a title/);
    for (const k of ['Escape', 'Tab and Shift\\+Tab', 'inert', 'focus returns', 'safe area']) expect(d).toMatch(new RegExp(k));
    expect(brain.AIO_WS_STYLE.find((s) => s.id === 'reduced')!.rules.join(' ')).toMatch(/prefers-reduced-motion/);
  });

  it('is a grammar, not a template, and stays out of the public website', () => {
    const scope = brain.AIO_WS_STYLE.find((s) => s.id === 'scope')!.rules.join(' ');
    expect(scope).toMatch(/not identical layouts/);
    expect(scope).toMatch(/public AIO website keeps its own/);
    expect(brain.AIO_WSS_STATUS.public_site).toMatch(/^SEPARATE/);
  });
});

describe('The pass', () => {
  it('records defects A–J, each with its fix', () => {
    expect(brain.AIO_WSS_DEFECTS.map((d) => d.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
    for (const d of brain.AIO_WSS_DEFECTS) expect(d.fix.length, d.id).toBeGreaterThan(20);
  });

  it('does not claim to have inspected the founder recording', () => {
    expect(brain.AIO_WSS_FOUNDER_FEEDBACK.recording).toMatch(/^NOT AVAILABLE — .*not inspected/);
    expect(brain.AIO_WSS_KNOWN_REMAINING[0]).toMatch(/not inspected/);
  });

  it('records QA that ran clean, the text audit before and after, and twelve recordings', () => {
    const q = brain.AIO_WSS_QA;
    expect(q.failures).toBe(0);
    expect(q.checks_run).toBe(brain.AIO_WP_QA.checks_run);
    expect(q.screenshots).toBe(brain.AIO_WP_QA.screenshots);
    expect(Object.values(q.text_audit.this_pass).every((n) => n === 0)).toBe(true);
    expect(Object.values(q.text_audit.last_pass).some((n) => n > 0)).toBe(true);
    expect(q.recordings.list).toHaveLength(12);
    expect(q.recordings.list[11]).toBe('12 REDUCED MOTION');
    expect(q.found_and_fixed.length).toBeGreaterThanOrEqual(5);
  });

  it('stays a candidate: no expansion, roots unchanged, live app unchanged, privacy gaps open', () => {
    expect(brain.AIO_WSS_STATUS.proofs).toMatch(/CANDIDATES, AWAITING FOUNDER REVIEW$/);
    expect(brain.AIO_WSS_STATUS.expansion).toMatch(/^NOT STARTED/);
    expect(brain.AIO_WSS_STATUS.approved_roots).toMatch(/^UNCHANGED/);
    expect(brain.AIO_WSS_STATUS.live_app).toMatch(/^NOT CHANGED/);
    expect(brain.AIO_WSS_STATUS.security).toMatch(/^12 PRIVACY GAPS STILL OPEN/);
    expect(brain.AIO_WSS_NEXT_GATE).toBe('FOUNDER REVIEW OF AIO OFFICE MATERIAL, MOTION AND DETAIL POLISH');
  });
});

describe('Generated documents', () => {
  it('passes the quality gate without claiming approval', () => {
    const g = aioWorkspaceStyleQualityGate();
    expect(g.problems).toEqual([]);
    expect(g.gate.FOUNDER_APPROVED).toMatch(/^NO/);
    expect(g.gate.FOUNDER_RECORDING_INSPECTED).toMatch(/^NO/);
    expect(g.gate.SECURITY_GAPS_FIXED).toMatch(/^NO/);
    expect(g.gate.DEFECTS_A_TO_J).toBe('FIXED — all ten');
  });

  it('keeps docs/aio/office-workspace-style in sync with the Brain', () => {
    const files = buildAioWorkspaceStyleExports();
    expect(Object.keys(files)).toHaveLength(5);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(`${AIO_WSS_DOCS_DIR}/${name}`, 'utf8'), name).toBe(body);
  });
});
