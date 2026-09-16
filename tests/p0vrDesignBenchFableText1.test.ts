/**
 * P0.VR.DESIGNBENCH.FABLE-TEXT1 — Fable live-text / highlight fidelity layer on top of the
 * frozen Sol direct structure. Guards: Sol geometry untouched, golden live copy present
 * slot-by-slot, highlight treatments (lime / black / red underline) and asset firewall.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const page = readFileSync(join(root, 'src/site00/pages/NdxbookSolDirectPage.tsx'), 'utf8');
const css = readFileSync(join(root, 'src/site00/styles/site00-ndxbook-sol-direct.css'), 'utf8');

describe('P0.VR.DESIGNBENCH.FABLE-TEXT1 — Sol structure frozen', () => {
  it('keeps every Sol major geometry declaration', () => {
    for (const rule of [
      'max-width: 572px',
      'min-height: 1024px',
      '.sol-hostbar {\n  height: 31px',
      '.sol-primary-nav { height: 26px',
      '.sol-context { height: 25px',
      '.sol-target-band { height: 70px; display: grid; grid-template-columns: 155px 235px 1fr',
      '.sol-main-stage { height: 305px; display: grid; grid-template-columns: 386px 150px',
      '.sol-gallery { height: 147px',
      'grid-template-columns: 131px 126px 126px 132px',
      '.sol-structured { height: 142px',
      '.sol-review-grid { height: 121px; display: grid; grid-template-columns: repeat(5, 1fr)',
      '.sol-readiness { height: 113px',
      '.sol-ready-grid { display: grid; grid-template-columns: 125px 120px 120px 1fr; height: 92px',
      '.sol-detail-tabs { position: relative; height: 27px',
      '.sol-detail { height: 65px; display: grid; grid-template-columns: 105px 194px 1fr 70px',
      '.sol-bottom-nav { height: 38px',
    ]) {
      expect(css, rule).toContain(rule);
    }
  });

  it('does not touch image plates, icon marks or their slots', () => {
    for (const asset of [
      '/site00/twin-sol-direct/sol-hand-plate.jpg',
      '/site00/twin-sol-direct/sol-blueprint.jpg',
      '/site00/twin-sol-direct/sol-001-news.jpg',
      '/site00/twin-sol-direct/sol-001-split.jpg',
      '/site00/twin-grok-direct/tgd-form.png',
      '/site00/twin-grok-direct/tgd-overlay-001.png',
      '/site00/twin-grok-direct/tgd-portrait.png',
    ]) {
      expect(page).toContain(asset);
    }
    expect(page).toContain('function Mark');
    expect(page).toContain('function DeviceMark');
    expect(css).not.toMatch(/background(?:-image)?:\s*url\(/);
  });
});

describe('P0.VR.DESIGNBENCH.FABLE-TEXT1 — golden live copy', () => {
  it('carries the corrected golden copy slot-by-slot', () => {
    for (const copy of [
      // structured output — golden lowercase "v1" suffixes + six function rows
      'ANNOTATION_LAYER_v1',
      'FUNCTION_MAP_v1',
      "'F01_INDEX_SIGNAL', 'F02_ERROR_REFERENCE', 'F03_ARCHIVAL_LINK', 'F04_CONTEXT_THREAD', 'F05_SOURCE_TRACE', 'F06_VERIFICATION'",
      // gallery — candidate titles + taglines as read from the golden
      "copy: 'CULTURE AS EVIDENCE.\\nIDEAS AS INDEX.\\nNDXBOOK.'",
      "title: '', copy: 'CULTURE AS\\nEVIDENCE.\\nIDEAS AS INDEX.'",
      "title: 'THE\\nSIGNAL\\nIS THE\\nINDEX'",
      // lower amendment card
      'NAA-RSF1-AUTHORITY-SELECTION-V1',
      '<dt>AMENDMENT TYPE:</dt><dd>AUTHORITY SELECTION</dd>',
      '<dt>EFFECTIVE:</dt><dd>2024-05-15</dd>',
      '<dt>SCOPE:</dt><dd>DESIGN WORKSPACE</dd>',
      '<dt>AUTHORITY WORKFLOW:</dt><dd>ENABLED</dd>',
      // hero meta emphasis
      '<span className="sol-hero-meta-right"><span>CULTURAL RECEIPT</span><b>001</b></span>',
    ]) {
      expect(page, copy).toContain(copy);
    }
  });

  it('drops the pre-fidelity placeholder copy', () => {
    expect(page).not.toContain('CULTURE HAS');
    expect(page).not.toContain('A PAPER TRAIL.');
    expect(page).not.toContain('IS IN THE');
    expect(page).not.toContain('F04_CONTEXT_BRIDGE');
    expect(page).not.toContain('F05_SOURCE_TOGGLE');
    expect(page).not.toContain('NAA-R5F1');
    expect(page).not.toContain('\u3000');
  });

  it('puts the readiness warning on FUNCTION MAP as in the golden', () => {
    expect(page).toContain("['FUNCTION MAP', 'G6-check-function', true]");
    expect(page).toContain("['ACCESSIBILITY', 'G7-check-a11y', false]");
  });
});

describe('P0.VR.DESIGNBENCH.FABLE-TEXT1 — typography + highlight treatments', () => {
  it('uses the project display face for the hero headline and candidate titles', () => {
    expect(css).toContain("--display: \"Anton\", Impact, \"Arial Narrow\", sans-serif");
    expect(css).toMatch(/\.sol-hero-copy h1 \{[^}]*font-family: var\(--display\)/s);
    expect(css).toMatch(/\.sol-candidate strong \{[^}]*font-family: var\(--display\)/s);
  });

  it('matches the golden highlight treatments', () => {
    // SELECTED strip: lime text on black, centered under SELECT FOR MOBILE
    expect(css).toMatch(/\.sol-select-mobile small \{[^}]*color: var\(--lime\)[^}]*text-align: center/s);
    // Mobile master row: black block with lime border + lime label
    expect(css).toMatch(/\.sol-master-row-mobile \{[^}]*border: 1px solid var\(--lime\)[^}]*background: #050505/s);
    expect(css).toContain('.sol-master-row-mobile > small { color: var(--lime); }');
    // Selected candidate version label: lime outlined box
    expect(css).toContain('.sol-candidate.selected small { padding: 1px 3px; border: 1px solid var(--lime); border-radius: 2px; }');
    // Active concept-data tab: red underline, bold, no grey rule under inactive tabs
    expect(css).toContain('.sol-detail-tabs .active { border-bottom: 2px solid #9c302f; font-weight: 600; }');
    expect(css).toMatch(/\.sol-detail-tabs span \{[^}]*border-bottom: 0/s);
    // Bottom dock active: lime underline at the bottom edge, bold label
    expect(css).toContain('.sol-bottom-nav .active { font-weight: 700; }');
    expect(css).toMatch(/\.sol-bottom-nav \.active::before \{[^}]*top: auto; bottom: 6px/s);
    // Host bar crumbs stay tight; only the compiler status floats right
    expect(css).toContain('.sol-hostbar > .sol-icon { width: 6px; height: 6px; margin-left: 0; }');
  });
});
