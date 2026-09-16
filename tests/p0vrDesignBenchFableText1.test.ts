/**
 * FABLE-TEXT1 compatibility after Sol R3's measured convergence.
 * Guards the accepted golden copy additions without allowing the superseded text layer
 * to move the final 572×1024 Sol geometry.
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
      '.sol-context { height: 26px',
      '.sol-target-band { height: 69px; display: grid; grid-template-columns: 155px 234px 1fr',
      '.sol-main-stage { height: 305px; display: grid; grid-template-columns: 387px 150px',
      '.sol-gallery { height: 146px',
      'grid-template-columns: 132px 126px 126px 132px',
      '.sol-structured { height: 142px',
      '.sol-review-grid { height: 121px; display: grid; grid-template-columns: 113px 109px 109px 103px 110px',
      '.sol-readiness { height: 113px',
      '.sol-ready-grid { display: grid; grid-template-columns: 122px 123px 117px 1fr; height: 92px',
      '.sol-detail-tabs { position: relative; height: 27px',
      '.sol-detail { height: 65px; display: grid; grid-template-columns: 105px 186px 1fr 70px',
      '.sol-bottom-nav { height: 37px',
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
      "'F01_INDEX_SIGNAL', 'F02_ERROR_REFERENCE', 'F03_ARCHIVAL_LINK', 'F04_CONTEXT_BRIDGE', 'F05_SOURCE_TOGGLE', 'F06_VERIFICATION'",
      // gallery — candidate titles + taglines as read from the golden
      "copy: 'CULTURE AS EVIDENCE.\\nIDEAS AS INDEX.\\nNDXBOOK.'",
      "title: '', copy: 'CULTURE AS\\nEVIDENCE.\\nIDEAS AS INDEX.'",
      "title: 'THE\\nSIGNAL\\nIS THE\\nINDEX'",
      // lower amendment card
      'NAA-R5F1-AUTHORITY-SELECTION-V1',
      'AMENDMENT TYPE:　AUTHORITY SELECTION',
      'EFFECTIVE:　　　2024-05-15',
      'SCOPE:　　　　 DESIGN WORKSPACE',
      'AUTHORITY WORKFLOW: ENABLED',
      '<div className="sol-hero-meta"><span>ENTRY 001</span><span>CULTURAL RECEIPT</span><span>001</span></div>',
    ]) {
      expect(page, copy).toContain(copy);
    }
  });

  it('drops the pre-fidelity placeholder copy', () => {
    expect(page).not.toContain('CULTURE HAS');
    expect(page).not.toContain('A PAPER TRAIL.');
    expect(page).not.toContain('IS IN THE');
    expect(page).not.toContain('F04_CONTEXT_THREAD');
    expect(page).not.toContain('F05_SOURCE_TRACE');
    expect(page).not.toContain('NAA-RSF1');
  });

  it('puts the readiness warning on POSITION MAP as in the golden', () => {
    expect(page).toContain("['POSITION MAP', 'G6-check-function', true]");
    expect(page).toContain("['ACCESSIBILITY', 'G7-check-a11y', false]");
  });
});

describe('P0.VR.DESIGNBENCH.FABLE-TEXT1 — typography + highlight treatments', () => {
  it('uses the calibrated condensed display face for headline and candidates', () => {
    expect(css).toMatch(/\.sol-hero-copy h1 \{[^}]*font-family: Impact/s);
    expect(css).toMatch(/\.sol-candidate strong \{[^}]*font-family: Impact/s);
  });

  it('matches the golden highlight treatments', () => {
    // SELECTED strip: lime text on black, centered under SELECT FOR MOBILE
    expect(css).toMatch(/\.sol-select-mobile small \{[^}]*color: var\(--lime\)[^}]*text-align: center/s);
    // Mobile master preview retains the golden lime selection border.
    expect(css).toContain('.selected-mini { border: 1px solid var(--lime); }');
    // Selected candidate version label: lime outlined box
    expect(css).toContain('.sol-candidate.selected small { padding: 1px 3px; border: 1px solid var(--lime); border-radius: 2px; }');
    // Active concept data and workspace states use the measured red/lime rules.
    expect(css).toMatch(/\.sol-detail-tabs \.active::after \{[^}]*background: #9c302f/s);
    expect(css).toMatch(/\.sol-bottom-nav \.active::before \{[^}]*top: 0/s);
    expect(css).toContain('gap: 10px');
  });
});
