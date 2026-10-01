/**
 * Server-rendered contract tests for the redesigned IDNTY family and the verification surfaces.
 * (Visual fidelity is proven in a real browser — see docs/site00/public-redesign/SONNET-VISUAL-QA.md.)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Site00Provider } from '../src/site00/state/Site00Context';
import { IdentityDiagnosticFlow } from '../src/site00/components/public-redesign/IdentityDiagnosticFlow';
import { IdentityDiagnosticOverview } from '../src/site00/components/public-redesign/IdentityDiagnosticOverview';
import {
  BuildReadyAuthorityCheckList,
  BuildReadyEvidenceList,
  BuildReadyReview,
  BuildReadyVerificationList,
} from '../src/site00/components/public-redesign/BuildReadyVerification';
import { IDNTY_ASSESSMENT_STORAGE_KEY, type IdntyAssessmentStateId } from '../src/site00/config/idnty-assessment';
import {
  emptyIdentityEvidence,
  evidenceAnswerKey,
  identityEvidenceFromAnswers,
} from '../src/site00/lib/identityAuthorityVerification';

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

describe('IDNTY continuity — hero, machine, progression and shell persist; only the panel transforms', () => {
  const modes: [IdntyAssessmentStateId, string | null, string][] = [
    ['starting-at-zero', null, 'detail'],
    ['starting-at-zero', 'goal', 'question'],
    ['starting-at-zero', 'review', 'review'],
    ['some-pieces-exist', 'assets', 'question'],
    ['ready-for-evolution', 'pathways', 'question'],
    ['build-ready', 'evidence', 'question'],
  ];

  it.each(modes)('%s / %s keeps the Diagnostic family and sets panel mode %s', (slug, segment, mode) => {
    const html = flow(slug, segment);
    expect(html).toContain('IDENTITY');
    expect(html).toContain('DIAGNOSTIC');
    expect(html).toContain('IDENTITY STATE PROGRESSION');
    expect(html).toContain(`data-identity-state="${slug}"`);
    expect(html).toContain(`data-panel-mode="${mode}"`);
    expect(html).toContain('data-identity-machine=');
    expect(html).toContain('site00-mobile-nav'); // shell + bottom navigation family
    expect(html).toContain('data-asset-slot="ENV.IDNTY.ATRIUM"');
  });

  it('uses the same machine for every screen of a state', () => {
    const machines = ['goal', 'audience', 'timeline', 'budget', 'review', null].map((seg) =>
      /data-identity-machine="(\w+)"/.exec(flow('starting-at-zero', seg))?.[1],
    );
    expect(new Set(machines).size).toBe(1);
    expect(machines[0]).toBe('foundation');
  });

  it('gives each state its own functional machine', () => {
    const byState = (['starting-at-zero', 'some-pieces-exist', 'ready-for-evolution', 'build-ready'] as const).map(
      (s) => /data-identity-machine="(\w+)"/.exec(flow(s, null))?.[1],
    );
    expect(byState).toEqual(['foundation', 'partial', 'evolution', 'authority']);
  });

  it('marks exactly the selected 00–03 node and renders a single state rail (no second progress rail)', () => {
    const html = flow('some-pieces-exist', 'gaps');
    expect(html.match(/s00pr-progression__node--active/g)).toHaveLength(1);
    expect(html.match(/IDENTITY STATE PROGRESSION/g)!.length).toBeGreaterThanOrEqual(1);
    expect(html.match(/class="s00pr-progression"/g)).toHaveLength(1);
    expect(html).toContain('QUESTION 03 OF 03');
    expect(html).toContain('s00pr-question__segments'); // compact, inside the panel
  });
});

describe('FOUNDATION working surface', () => {
  it('asks Primary goal first and never asks WHAT ARE YOU BUILDING?', () => {
    const goal = flow('starting-at-zero', 'goal');
    expect(goal).toContain('WHAT IS THE PRIMARY GOAL?');
    expect(goal).toContain('QUESTION 01 OF 04');
    for (const seg of ['goal', 'audience', 'timeline', 'budget', 'review', null]) {
      expect(flow('starting-at-zero', seg)).not.toMatch(/WHAT ARE YOU BUILDING/);
    }
  });

  it('renders audience as a textarea with counter, timeline as radio rows, budget as tiles', () => {
    expect(flow('starting-at-zero', 'audience')).toMatch(/<textarea[^>]+maxLength="500"|maxlength="500"/i);
    expect(flow('starting-at-zero', 'audience')).toContain('0 / 500');
    expect(flow('starting-at-zero', 'timeline')).toContain('role="radiogroup"');
    expect(flow('starting-at-zero', 'budget')).toContain('$5,000');
    expect(flow('starting-at-zero', 'budget')).toContain('REVIEW ASSESSMENT');
  });

  it('retired step ids fall back to state detail instead of a dead intake screen', () => {
    // Navigate element renders nothing server-side — it must NOT render the old question.
    const html = flow('starting-at-zero', 'project');
    expect(html).not.toContain('WHAT ARE YOU BUILDING');
    expect(html).not.toContain('data-panel-mode="question"');
  });
});

describe('REFINE conditional OTHER', () => {
  it('hides the OTHER field until OTHER is selected, then expands it inside the same panel', () => {
    expect(flow('some-pieces-exist', 'assets')).not.toContain('data-conditional-other');
    seedAnswers({ 'some-pieces-exist': { assets: ['logo', 'other'], 'other-specify': 'Packaging' } });
    const html = flow('some-pieces-exist', 'assets');
    expect(html).toContain('data-conditional-other="true"');
    expect(html).toContain('Packaging');
    expect(html).toContain('data-panel-mode="question"'); // same panel, not a new screen
  });

  it('has no standalone screen for OTHER', () => {
    const html = flow('some-pieces-exist', 'other-specify');
    expect(html).not.toContain('data-panel-mode="question"');
  });
});

describe('review stays inside the selected state', () => {
  it('summarises captured inputs with truthful CTA labels', () => {
    seedAnswers({
      'starting-at-zero': { goal: 'launch-brand', audience: 'Founders', timeline: '3-4', budget: '5k-10k' },
      'some-pieces-exist': { assets: ['logo'], 'cohesion-diagnostic': 'mostly-cohesive', gaps: ['no-guidelines'] },
      'ready-for-evolution': { pathways: ['visual-identity'], goals: 'Evolve', timeline: '3-4' },
    });
    const foundation = flow('starting-at-zero', 'review');
    expect(foundation).toContain('SUBMIT IDENTITY ASSESSMENT');
    expect(foundation).toContain('LAUNCH A NEW BRAND');
    expect(foundation).toContain('3–4 MONTHS');
    expect(foundation).toContain('$5,000 – $10,000');
    expect(foundation).toContain('data-panel-mode="review"');
    expect(foundation).not.toMatch(/CONTINUE TO BRAND WORLD|VIEW RECOMMENDATION/);

    const refine = flow('some-pieces-exist', 'review');
    expect(refine).toContain('SUBMIT IDENTITY ASSESSMENT');
    expect(refine).toContain('MOSTLY COHESIVE');
    expect(refine).toContain('NO BRAND GUIDELINES');
    expect(refine.match(/s00pr-review__meter-seg--on/g)).toHaveLength(3);

    const evolve = flow('ready-for-evolution', 'review');
    expect(evolve).toContain('SUBMIT IDENTITY ASSESSMENT');
    expect(evolve).toContain('VISUAL IDENTITY');
    expect(evolve).not.toMatch(/INSTALL|TRANSFORM|GROWTH SYSTEMS/);
  });

  it('BUILD READY review submits FOR VERIFICATION and never claims verified', () => {
    seedAnswers({ 'build-ready': { [evidenceAnswerKey('STRATEGY')]: ['positioning'], [evidenceAnswerKey('VISUAL')]: ['logo-files'] } });
    const html = flow('build-ready', 'review');
    expect(html).toContain('SUBMIT FOR VERIFICATION');
    expect(html).toContain('REVIEW VERIFICATION');
    expect(html).toContain('2 DOMAINS PROVIDED');
    expect(html).toContain('3 DOMAINS REQUIRE REVIEW');
    expect(html).not.toMatch(/IDENTITY VERIFIED|AUTHORITY ESTABLISHED|ENTER BLDR|UNLOCKED|\d+\s?%/);
  });
});

describe('BUILD READY screens are honest', () => {
  const ev = identityEvidenceFromAnswers({ [evidenceAnswerKey('STRATEGY')]: ['positioning'], 'review-flags': ['EXPERIENCE'] });
  const render = (node: React.ReactElement) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);

  it('verification list: 5 domains, provisional statuses only', () => {
    const html = render(<BuildReadyVerificationList evidence={ev} snapshot={null} onOpenDomain={() => {}} />);
    for (const d of ['STRATEGY', 'VISUAL', 'VOICE', 'VALUES', 'EXPERIENCE']) expect(html).toContain(d);
    expect(html).toContain('EVIDENCE RECEIVED');
    expect(html).toContain('REVIEW REQUIRED');
    expect(html).toContain('ADD EVIDENCE');
    expect(html).not.toContain('AUTHORITY ESTABLISHED');
  });

  it('evidence list: confirms source material, not uploads', () => {
    const html = render(<BuildReadyEvidenceList evidence={emptyIdentityEvidence()} snapshot={null} onToggleSource={() => {}} onToggleReviewFlag={() => {}} />);
    expect(html).toContain('BRAND STRATEGY');
    expect(html).toContain('role="checkbox"');
    expect(html).not.toMatch(/type="file"|UPLOAD/i);
  });

  it('authority check: PENDING REVIEW / GAP IDENTIFIED, with a provisional disclaimer', () => {
    const html = render(<BuildReadyAuthorityCheckList evidence={ev} snapshot={null} onOpenDomain={() => {}} />);
    expect(html).toContain('PENDING REVIEW');
    expect(html).toContain('GAP IDENTIFIED');
    expect(html).toContain('REVIEW REQUIRED');
    expect(html).toContain('NOTHING HAS BEEN REVIEWED OR VERIFIED BY SITE 00 YET');
    expect(html).not.toContain('AUTHORITY ESTABLISHED');
    expect(html).not.toMatch(/BLDR CAN UNLOCK|UNLOCKED/);
  });

  it('review: counts only', () => {
    const html = render(<BuildReadyReview evidence={ev} snapshot={null} />);
    expect(html).toContain('1 DOMAIN PROVIDED');
    expect(html).toContain('4 DOMAINS REQUIRE REVIEW');
  });
});

describe('Diagnostic overview', () => {
  it('shows all four states, the 00–03 rail and an investment disclosure', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Site00Provider>
          <IdentityDiagnosticOverview />
        </Site00Provider>
      </MemoryRouter>,
    );
    for (const t of ['STARTING AT ZERO', 'SOME PIECES EXIST', 'READY FOR EVOLUTION', 'BUILD READY']) expect(html).toContain(t);
    for (const c of ['FOUNDATION STATE', 'PARTIAL STATE', 'EVOLUTION STATE', 'BUILD-READY STATE']) expect(html).toContain(c);
    expect(html).toContain('IDENTITY INVESTMENT');
    expect(html).toContain('YOUR BRAND STATE DETERMINES THE SCOPE.');
    expect(html.match(/SELECT STATE<\/button>|SELECT STATE\s*<span/g)!.length).toBeGreaterThanOrEqual(4);
    expect(html).not.toMatch(/IDENTITY VERIFIED|ENTER BLDR/);
  });
});
