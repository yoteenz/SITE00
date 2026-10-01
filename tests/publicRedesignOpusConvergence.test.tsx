/**
 * OPUS-CONVERGENCE1 contracts — the visual decisions taken from the authorities that must not silently
 * regress: per-family panel heads, plain-zero state numerals, annotation layers on the machines, the
 * verification-only domain nodes, and the scoped viewport-frame reset. Browser proof lives in
 * docs/site00/public-redesign/opus-proof/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { IdentityDiagnosticFlow } from '../src/site00/components/public-redesign/IdentityDiagnosticFlow';
import { StateNumeral } from '../src/site00/components/public-redesign/StateNumeral';
import { IDNTY_ASSESSMENT_STORAGE_KEY, type IdntyAssessmentStateId } from '../src/site00/config/idnty-assessment';

function memoryStorage(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

function seedAnswers(answers: Record<string, Record<string, string | string[]>>) {
  const storage = memoryStorage({
    [IDNTY_ASSESSMENT_STORAGE_KEY]: JSON.stringify({ identityState: null, answers, completedSteps: [] }),
  });
  vi.stubGlobal('window', {
    localStorage: storage,
    sessionStorage: memoryStorage(),
    location: { pathname: '/', search: '' },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    addEventListener() {},
    removeEventListener() {},
  });
  vi.stubGlobal('sessionStorage', memoryStorage());
  vi.stubGlobal('localStorage', storage);
}

beforeEach(() => seedAnswers({}));
afterEach(() => vi.unstubAllGlobals());

const flow = (stateSlug: IdntyAssessmentStateId, segment: string | null) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/idnty/${stateSlug}${segment ? `/${segment}` : ''}`]}>
      <IdentityDiagnosticFlow stateSlug={stateSlug} segment={segment} />
    </MemoryRouter>,
  );

describe('per-family working-panel heads (as each authority draws them)', () => {
  it('FOUNDATION: QUESTION 0N in the head, no secondary progress row, state glyph shown', () => {
    const html = flow('starting-at-zero', 'timeline');
    expect(html).toMatch(/QUESTION 03<span class="s00pr-sr"> OF 04<\/span>/);
    expect(html).not.toContain('s00pr-question__meta');
    expect(html).toContain('data-head-glyph="true"');
  });

  it('REFINE: quote stays in the head, REFINE IDENTITY + QUESTION 0N OF 03 + segments above the title', () => {
    const html = flow('some-pieces-exist', 'assets');
    expect(html).toContain('I HAVE PARTS OF MY BRAND');
    expect(html).toContain('REFINE IDENTITY');
    expect(html).toContain('QUESTION 01 OF 03');
    expect(html).toContain('s00pr-question__segments');
  });

  it('EVOLUTION: QUESTION 0N (no total) with segments; no head glyph', () => {
    const html = flow('ready-for-evolution', 'goals');
    expect(html).toContain('>QUESTION 02<');
    expect(html).not.toContain('QUESTION 02 OF');
    expect(html).toContain('data-head-glyph="false"');
  });

  it('BUILD READY: verification line, no question counter row, AUTHORITY CHECK 03 only on the check step', () => {
    expect(flow('build-ready', 'verification')).not.toContain('s00pr-question__meta');
    expect(flow('build-ready', 'verification')).toContain('IDENTITY AUTHORITY VERIFICATION');
    expect(flow('build-ready', 'authority-check')).toContain('AUTHORITY CHECK 03');
    expect(flow('build-ready', 'verification')).not.toContain('AUTHORITY CHECK 03');
  });

  it('every question title carries its length so it can be set on one line', () => {
    expect(flow('some-pieces-exist', 'cohesion-diagnostic')).toMatch(/s00pr-question__title" style="--qlen:\d+"/);
  });
});

describe('state numerals', () => {
  it('draws the state code as live SVG with plain zeros (never the slashed host-font zero, never raster)', () => {
    const svg = renderToStaticMarkup(<StateNumeral code="03" />);
    expect(svg).toContain('data-state-numeral="03"');
    expect(svg.match(/<path /g)).toHaveLength(2);
    expect(svg).not.toMatch(/<image|<img/);
    expect(flow('some-pieces-exist', null)).toContain('data-state-numeral="01"');
  });
});

describe('machine annotation layers', () => {
  it('BUILD READY: identity-domain nodes only inside the verification flow, rings on the state detail', () => {
    expect(flow('build-ready', null)).not.toContain('data-domain-node');
    const verification = flow('build-ready', 'verification');
    for (const d of ['STRATEGY', 'VISUAL', 'VOICE', 'VALUES', 'EXPERIENCE']) expect(verification).toContain(`data-domain-node="${d}"`);
  });

  it('BUILD READY nodes reflect only what the person supplied (provisional), never a verification', () => {
    seedAnswers({ 'build-ready': { 'evidence-strategy': ['positioning'] } });
    const html = flow('build-ready', 'verification');
    expect(html).toMatch(/data-domain-node="STRATEGY" data-has-evidence="true"/);
    expect(html).toMatch(/data-domain-node="VOICE" data-has-evidence="false"/);
  });

  it('REFINE GAPS: selected gaps are called out on the lattice; other steps carry no callouts', () => {
    seedAnswers({ 'some-pieces-exist': { gaps: ['unclear-messaging', 'no-guidelines'] } });
    const html = flow('some-pieces-exist', 'gaps');
    expect(html.match(/data-gap-callout=/g)).toHaveLength(2);
    expect(flow('some-pieces-exist', 'assets')).not.toContain('data-gap-callout');
  });

  it('EVOLUTION REVIEW: selected areas are bracketed on the waveform', () => {
    seedAnswers({ 'ready-for-evolution': { pathways: ['visual-identity'] } });
    expect(flow('ready-for-evolution', 'review')).toContain('data-area-bracket=');
    expect(flow('ready-for-evolution', 'pathways')).not.toContain('data-area-bracket=');
  });
});

describe('viewport frame + unit system', () => {
  const css = fs.readFileSync(path.join(__dirname, '../src/site00/styles/site00-public-redesign.css'), 'utf8');

  it('removes the default body margin only on pages that mount the redesign shell', () => {
    expect(css).toMatch(/body:has\(\.s00pr-shell\)\s*\{\s*margin:\s*0;/);
  });

  it('keeps the touch zoom guard as a real 16px field (drawn at authority size via transform)', () => {
    expect(css).toMatch(/@media \(hover: none\) and \(pointer: coarse\)[\s\S]*?font-size: 16px;[\s\S]*?transform: scale\(var\(--s\)\)/);
  });

  it('keeps the uppercase contract on the shell', () => {
    expect(css).toMatch(/\.s00pr \*:not\(input\):not\(textarea\)\s*\{\s*text-transform: uppercase;/);
  });
});

describe('OPUS-SURGICAL-CLEANUP1 — family continuity + Build Ready evidence rhythm', () => {
  const css = fs.readFileSync(path.join(__dirname, '../src/site00/styles/site00-public-redesign.css'), 'utf8');

  it('State 00 detail and its questions share ONE geometry: nothing above the panel varies by mode', () => {
    // Founder decision: family continuity outranks the 941-family authority being ~8% larger.
    expect(css).not.toMatch(/data-identity-mode/);
    expect(css).not.toMatch(/\.s00pr-panel--(detail|question|review)[^{]*\.s00pr-(idhero|stage|progression)/);
    const detail = flow('starting-at-zero', null);
    const goal = flow('starting-at-zero', 'goal');
    // Hero + machine markup identical; the rail differs only in function (links on detail, static during questions).
    const heroAndMachine = (html: string) => html.slice(html.indexOf('<section class="s00pr-idhero"'), html.indexOf('<div class="s00pr-progression"'));
    expect(heroAndMachine(detail)).toBe(heroAndMachine(goal));
    const nodes = (html: string) => html.match(/s00pr-progression__node[^"]*/g);
    expect(nodes(detail)).toEqual(nodes(goal));
  });

  it('evidence-step rhythm is scoped to the evidence step only', () => {
    expect(css).toMatch(/\.s00pr-panel__body\[data-body-key='question:evidence'\]\s*\{/);
    expect(flow('build-ready', 'evidence')).toContain('data-body-key="question:evidence"');
    expect(flow('build-ready', 'verification')).not.toContain('data-body-key="question:evidence"');
  });

  it('evidence keeps all five domains, their statuses and the honest wording', () => {
    seedAnswers({ 'build-ready': { 'evidence-strategy': ['positioning'] } });
    const html = flow('build-ready', 'evidence');
    for (const d of ['STRATEGY', 'VISUAL', 'VOICE', 'VALUES', 'EXPERIENCE']) expect(html).toContain(`data-domain="${d}"`);
    expect(html).toContain('data-authority-status="EVIDENCE_RECEIVED"');
    expect(html).not.toMatch(/IDENTITY VERIFIED|AUTHORITY ESTABLISHED|UNLOCKED|\d+\s?%/);
  });
});

