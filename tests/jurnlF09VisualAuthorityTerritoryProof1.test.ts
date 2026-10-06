/**
 * P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1 — three F09 composition territories for founder review.
 * Proves: exactly three territories, structurally distinct, zero legacy visual leak, one six-proof mobile reference each
 * (no paid generation), nothing locked, no founder verdict, no production wiring, export in sync.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { REFERENCE_AUTHORITY_MUST_SHOW, jurnlF09, legacyClassOf } from '../shared/studioos-visual-authority/index';
import { JURNL_F09_PROOF_FILE, buildJurnlF09ProofExport } from '../scripts/studioos/jurnl-f09-territory-proof-export';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, jurnlF09.JURNL_F09_PACKAGE_DIR);
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');

function pngSize(file: string): { w: number; h: number } {
  const b = readFileSync(file);
  expect(b.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

describe('F09 territories', () => {
  const ts = jurnlF09.JURNL_F09_TERRITORIES;

  it('exactly three, all in review, none decided', () => {
    expect(ts.map((t) => t.territory_id)).toEqual(['JURNL.F09.T01', 'JURNL.F09.T02', 'JURNL.F09.T03']);
    for (const t of ts) {
      expect(t.status).toBe('IN_REVIEW');
      expect(t.founder_decision).toBeNull();
      expect(t.project_id).toBe('JURNL');
      expect(t.family_id).toBe('F09');
    }
  });

  it('differ in page logic on every structural dimension (not paint)', () => {
    const s = jurnlF09.jurnlF09ProofStatus().territories;
    expect(s.status).toBe('TERRITORIES_DISTINCT');
    expect(s.pairs).toHaveLength(3);
    for (const p of s.pairs) {
      expect(p.distinct).toBe(true);
      expect(p.differing).toContain('spatial_logic');
      expect(p.differing).toContain('primary_zone');
      expect(p.differing.length).toBe(6);
    }
    expect(new Set(ts.map((t) => t.primary_object)).size).toBe(3);
    expect(new Set(ts.map((t) => t.metaphor)).size).toBe(3);
  });

  it('never reuse the legacy F09 composition vocabulary', () => {
    const legacyComposition = /threshold|hatched|arched panel|\barch\b/i;
    for (const t of ts) expect(JSON.stringify(t.structure)).not.toMatch(legacyComposition);
  });
});

describe('legacy firewall', () => {
  it('LEGACY_VISUAL_LEAK = 0', () => {
    const s = jurnlF09.jurnlF09ProofStatus();
    expect(s.legacy.status).toBe('LEGACY_STATUS_KNOWN');
    expect(s.legacy_visual_leak_count).toBe(0);
  });

  it('every F09 legacy surface is functional reference only; only the preserved nav / stage contract is promoted', () => {
    for (const surface of jurnlF09.JURNL_F09_LEGACY_SURFACES) {
      if (surface.surface_id === 'JURNL.GLOBAL.CENTER_STAGE_NAV_CHROME') {
        expect(legacyClassOf(surface)).toBe('PARTIAL_AUTHORITY');
        expect(surface.promoted_dimensions).toEqual(['NAV_VISUALS', 'GEOMETRY']);
      } else {
        expect(legacyClassOf(surface)).toBe('FUNCTIONAL_REFERENCE_ONLY');
      }
    }
  });
});

describe('reference authority candidates', () => {
  const refs = jurnlF09.JURNL_F09_REFERENCES;

  it('one mobile six-proof candidate per territory, no paid generation', () => {
    expect(refs).toHaveLength(3);
    expect(refs.map((r) => r.territory_id)).toEqual(jurnlF09.JURNL_F09_TERRITORIES.map((t) => t.territory_id));
    for (const r of refs) {
      expect(r.viewport).toBe('MOBILE');
      expect(r.paid_generation).toBe(false);
      expect([...r.shows].sort()).toEqual([...REFERENCE_AUTHORITY_MUST_SHOW].sort());
    }
    expect(jurnlF09.jurnlF09ProofStatus().references.status).toBe('REFERENCES_COMPLETE');
  });

  it('candidates exist at 393×852 (device scale 3) and nothing else is a candidate', () => {
    for (const r of refs) {
      const [png, html] = r.reference_paths;
      expect(pngSize(path.join(ROOT, png!))).toEqual({ w: 393 * 3, h: 852 * 3 });
      expect(existsSync(path.join(ROOT, html!))).toBe(true);
    }
    const candidates = readdirSync(path.join(PKG, 'REFERENCE_CANDIDATES')).filter((f) => /_MOBILE_393x852\.png$/.test(f));
    expect(candidates).toHaveLength(3);
    expect(walk(PKG).some((f) => /TABLET|DESKTOP|834x1194|1440x900/i.test(path.basename(f)))).toBe(false);
  });

  it('reference sources keep JURNL hard rules: uppercase copy, no circular controls', () => {
    for (const r of refs) {
      const html = read(r.reference_paths[1]!);
      const visible = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<(style|script)[\s\S]*?<\/\1>/g, '')
        .replace(/<[^>]+>/g, ' ');
      expect(visible).not.toMatch(/[a-z]/);
      expect(html).not.toMatch(/border-radius:\s*50%/);
    }
    expect(read(`${jurnlF09.JURNL_F09_PACKAGE_DIR}/REFERENCE_CANDIDATES/source/f09-frame.css`)).not.toMatch(/border-radius:\s*50%/);
  });

  it('authorities are not runtime assets: production JURNL never references the package', () => {
    const runtime = walk(path.join(ROOT, 'src')).filter((f) => /\.(ts|tsx|css)$/.test(f));
    for (const f of runtime) expect(readFileSync(f, 'utf8')).not.toContain('VISUAL_AUTHORITY_3_TERRITORY_PROOF1');
  });
});

describe('gate + upstream verdict', () => {
  it('holds at EXPERIENCE_REQUIRED: no JURNL experience contract exists in the Brain; nothing implementation-ready', () => {
    const g = jurnlF09.jurnlF09ProofStatus().gate;
    expect(g.state).toBe('EXPERIENCE_REQUIRED');
    expect(g.guard).toBe('VISUAL_AUTHORITY_REQUIRED');
    expect(g.implementation_ready).toBe(false);
    expect(jurnlF09.jurnlF09GateInput().authority).toBeNull();
    expect(jurnlF09.jurnlF09GateInput().founder_decision).toBeNull();
  });

  it('records the brand gap instead of inventing it (audience is not encoded)', () => {
    const b = jurnlF09.jurnlF09ProofStatus().brand;
    expect(b.status).toBe('BRAND_CONTEXT_REQUIRED');
    expect(b.missing).toEqual(['audience']);
  });

  it('scorecard covers the eight contracts and the verdict is PARTIAL', () => {
    expect(jurnlF09.JURNL_F09_UPSTREAM_SCORECARD.map((r) => r.contract)).toEqual([
      'BRAND DNA', 'EXPERIENCE CONTRACT', 'FAMILY CONTRACT', 'STATE CONTRACT', 'INTERACTION CONTRACT', 'DATA CONTRACT', 'RESPONSIVE CONTRACT', 'EXPRESSION GUIDANCE',
    ]);
    expect(jurnlF09.JURNL_F09_UPSTREAM_VERDICT.answer).toBe('PARTIAL');
  });
});

describe('package', () => {
  it('holds every deliverable', () => {
    for (const f of [
      'README.md',
      'F09_SOURCE_MAP.md',
      'F09_EXPERIENCE_SUMMARY.md',
      'F09_LEGACY_VISUAL_FIREWALL.md',
      'F09_TERRITORY_01_CONTRACT.md',
      'F09_TERRITORY_02_CONTRACT.md',
      'F09_TERRITORY_03_CONTRACT.md',
      'F09_TERRITORY_DISTINCTNESS_MATRIX.md',
      'F09_UPSTREAM_CONTRACT_SCORECARD.md',
      'F09_FOUNDER_REVIEW_PACK.md',
      'F09_GENERATION_LEDGER.json',
      'RENDER_LOG.json',
      'BLUR_TEST/F09_BLUR_TEST_BOARD.png',
      'REFERENCE_CANDIDATES/F09_TERRITORY_BOARD.png',
    ]) expect(existsSync(path.join(PKG, f)), f).toBe(true);
  });

  it('the export is in sync with the TypeScript source', () => {
    expect(read(JURNL_F09_PROOF_FILE)).toBe(buildJurnlF09ProofExport());
  });

  it('older F09 artifacts are preserved, not overwritten', () => {
    for (const f of ['F09_FAMILY_EXPRESSION_BRIEF.json', 'F09_EXPRESSION_TREE.json', 'F09_PARENT_AUTHORITY_MANIFEST.json', 'F09_PLATE_OCCUPANCY.json']) {
      expect(existsSync(path.join(ROOT, 'JURNL/F09_SAFE/MANIFEST', f))).toBe(true);
    }
    expect(JSON.parse(read('JURNL/F09_SAFE/MANIFEST/F09_PARENT_AUTHORITY_MANIFEST.json')).founder_status).toBe('UNREVIEWED');
  });
});
