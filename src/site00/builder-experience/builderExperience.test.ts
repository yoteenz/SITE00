import { describe, expect, it } from 'vitest';
import { DEFAULT_ASSUMPTIONS } from '../../studioos/estimation/assumptions';
import { toClientBlueprintEstimate } from '../../studioos/estimation/clientContract';
import { estimateProject } from '../../studioos/estimation/engine';
import { FIXTURE_LARGE_PRODUCT, FIXTURE_STANDARD_EDITORIAL } from '../../studioos/estimation/fixtures';
import { STRUCTURAL_ARCHETYPES, VISUAL_SYSTEMS, WORLD_ARCHETYPES } from '../../studioos/estimation/registries';
import { ESTIMATOR_VERSION } from '../../studioos/estimation/version';
import {
  BUILDER_SAMPLES,
  CAPABILITIES,
  EXPRESSIONS,
  FORBIDDEN_CLIENT_TERMS,
  STRUCTURES,
  WORLD_FORMS,
  builderBlueprint,
  builderEstimateView,
  builderNotices,
  builderScopeSignal,
  builderSteps,
  deriveBuildLevel,
  effectiveCapabilities,
  emptySelection,
  readableRange,
  scopeImpact,
  toEstimateConfig,
  type BuilderSelection,
} from './index';

const with_ = (base: BuilderSelection, partial: Partial<BuilderSelection>): BuilderSelection => ({ ...base, ...partial });

function clientText(selection: BuilderSelection): string {
  return JSON.stringify([builderEstimateView(selection), builderBlueprint(selection), builderScopeSignal(selection)]).toLowerCase();
}

describe('the Builder consumes the canonical estimator', () => {
  it('leaves estimator math untouched (version and reference fixtures)', () => {
    expect(ESTIMATOR_VERSION).toBe('1.0.0');
    const outcome = estimateProject(FIXTURE_STANDARD_EDITORIAL);
    if (!outcome.ok) throw new Error('fixture failed');
    const client = toClientBlueprintEstimate(FIXTURE_STANDARD_EDITORIAL, outcome.result);
    expect(client.productionWindow).toBe('15–19 WEEKS');
    expect(client.investmentRange).toBe('$17K–$22K');
  });

  it('every sample maps to a config the estimator accepts, using its own review defaults', () => {
    for (const [name, selection] of Object.entries(BUILDER_SAMPLES)) {
      const config = toEstimateConfig(selection);
      expect(estimateProject(config).ok, name).toBe(true);
      expect(config.reviewRounds).toBe(DEFAULT_ASSUMPTIONS.defaultReviewRounds);
      expect(config.clientReviewSlaDays).toBe(DEFAULT_ASSUMPTIONS.clientReviewSlaDays);
      expect(config.documentKind).toBe('ESTIMATE');
    }
  });

  it('shows exactly the canonical window and range for the selection', () => {
    const selection = BUILDER_SAMPLES.SIMPLE_SERVICE;
    const config = toEstimateConfig(selection, 'SELF_SERVE', 'STANDARD');
    const outcome = estimateProject(config);
    if (!outcome.ok) throw new Error('sample failed');
    const canonical = toClientBlueprintEstimate(config, outcome.result);
    const view = builderEstimateView(selection);
    expect(view.productionWindow).toBe(canonical.productionWindow);
    expect(view.investment).toBe(readableRange(canonical.investmentRange));
  });

  it('presents every estimator grammar, world form and visual system', () => {
    expect(STRUCTURES.map((s) => s.id)).toEqual(STRUCTURAL_ARCHETYPES.map((s) => s.id));
    expect(WORLD_FORMS.map((w) => w.id)).toEqual(WORLD_ARCHETYPES.map((w) => w.id));
    expect(EXPRESSIONS.map((e) => e.id)).toEqual(VISUAL_SYSTEMS.map((v) => v.id));
    for (const item of [...STRUCTURES, ...WORLD_FORMS, ...EXPRESSIONS]) {
      expect(item.preview).toEqual({ mobile: null, desktop: null, spatial: null });
    }
  });
});

describe('client language', () => {
  it('never exposes family units, lanes, raw weeks, decimals, or quote language', () => {
    for (const [name, selection] of Object.entries(BUILDER_SAMPLES)) {
      const text = clientText(selection);
      for (const term of FORBIDDEN_CLIENT_TERMS) {
        expect(new RegExp(`\\b${term.trim()}\\b`).test(text), `${name}: ${term}`).toBe(false);
      }
      expect(/\d+\.\d+\s*(weeks|months)/.test(text), name).toBe(false);
      expect(builderEstimateView(selection).binding).toBe(false);
    }
  });

  it('uses ranges and client confidence labels, never the raw enums', () => {
    const early = builderEstimateView(BUILDER_SAMPLES.ADVANCED_EDITORIAL, 'SELF_SERVE');
    const reviewed = builderEstimateView(BUILDER_SAMPLES.ADVANCED_EDITORIAL, 'FOUNDER_REVIEWED');
    expect(early.confidence.label).toBe('INITIAL RANGE');
    expect(reviewed.confidence.label).toBe('REFINED RANGE');
    expect(early.productionWindow).toMatch(/^\d+–\d+ (WEEKS|MONTHS)$/);
    expect(early.investment).toMatch(/^\$\d+K–\$\d+K$/);
    expect(early.document).toBe('BLUEPRINT ESTIMATE');
  });

  it('reads a collapsed range as one figure', () => {
    expect(readableRange('$3K–$3K')).toBe('AROUND $3K');
    expect(readableRange('$5K–$7K')).toBe('$5K–$7K');
  });
});

describe('paths', () => {
  it('SIMPLE stays simple: no tuning steps unless asked, simple build level', () => {
    const selection = BUILDER_SAMPLES.SIMPLE_SERVICE;
    expect(deriveBuildLevel(selection).level).toBe('SIMPLE');
    const steps = builderSteps(selection);
    expect(steps.primary).not.toContain('TYPE');
    expect(steps.optional).toEqual(['TYPE', 'COLOR', 'IMAGE_WORLD', 'MOTION']);
    expect(toEstimateConfig(selection).visualComplexity).toBe('TEMPLATE_LED');
    expect(builderScopeSignal(selection).signal).toBe('LIGHT');
  });

  it('ADVANCED opens deeper configuration', () => {
    const selection = BUILDER_SAMPLES.ADVANCED_EDITORIAL;
    expect(deriveBuildLevel(selection).level).toBe('ADVANCED');
    expect(builderSteps(selection).primary).toEqual(expect.arrayContaining(['TYPE', 'COLOR', 'IMAGE_WORLD', 'MOTION']));
  });

  it('CUSTOM exists and is a direction, not a failure', () => {
    const selection = BUILDER_SAMPLES.CUSTOM_COMMERCE;
    expect(deriveBuildLevel(selection).level).toBe('CUSTOM');
    const view = builderEstimateView(selection);
    expect(view.included.direction).toMatch(/custom creative direction/i);
    expect(builderBlueprint(selection).lines.find((l) => l.key === 'EXPRESSION')?.value).toBe('CUSTOM CREATIVE DIRECTION');
  });

  it('WORLD transforms the Builder and maps world scope instead of pages', () => {
    const selection = BUILDER_SAMPLES.WORLD_SHOWROOM;
    const steps = builderSteps(selection).primary;
    expect(steps).toContain('WORLD');
    expect(steps).not.toContain('STRUCTURE');
    const config = toEstimateConfig(selection);
    expect(config.projectType).toBe('WORLD');
    expect(config.families).toHaveLength(0);
    expect(config.worldScopes).toHaveLength(1);
    expect(config.responsiveMode).toBe('SPATIAL_RESPONSIVE');
  });

  it('a world inside a site becomes a hybrid build', () => {
    const selection = with_(BUILDER_SAMPLES.SIMPLE_SERVICE, { capabilities: ['WORLD'], keepItSimple: false });
    expect(toEstimateConfig(selection).projectType).toBe('HYBRID');
    expect(builderNotices(selection).some((n) => n.id === 'site-plus-world')).toBe(true);
  });
});

describe('selection rules', () => {
  it('surfaces dependencies instead of allowing an impossible project', () => {
    const membership = with_(emptySelection(), { build: 'SITE', structure: 'SERVICE', capabilities: ['MEMBERSHIP'] });
    expect(effectiveCapabilities(membership)).toContain('ACCOUNTS');
    expect(builderNotices(membership).some((n) => n.kind === 'COMES_WITH' && n.message.startsWith('ACCOUNTS'))).toBe(true);
    const payments = with_(emptySelection(), { build: 'SITE', structure: 'SERVICE', capabilities: ['PAYMENTS'] });
    expect(builderNotices(payments).some((n) => n.id === 'payments-for-what')).toBe(true);
    const commerce = with_(emptySelection(), { build: 'SITE', structure: 'COMMERCE' });
    expect(effectiveCapabilities(commerce)).toEqual(expect.arrayContaining(['SELL', 'PAYMENTS']));
    const orphan = with_(emptySelection(), { build: 'SITE', structure: 'SERVICE', experiences: [{ id: 'CHECKOUT', depth: 'ESSENTIAL' }] });
    expect(builderNotices(orphan).some((n) => n.id === 'exp-needs-CHECKOUT')).toBe(true);
  });

  it('a marketplace is a custom build', () => {
    const selection = with_(emptySelection(), { build: 'SITE', structure: 'COMMERCE', capabilities: ['MARKETPLACE'] });
    expect(deriveBuildLevel(selection).level).toBe('CUSTOM');
  });

  it('limits hybridisation: one secondary influence is advanced, three systems become custom', () => {
    const base = with_(emptySelection(), { build: 'SITE', structure: 'SERVICE' });
    const one = with_(base, { expression: { primary: 'ARCHITECTURAL_MINIMAL', secondary: 'EDITORIAL_OBJECT', likedParts: [], edition: 'ESSENTIAL' } });
    expect(deriveBuildLevel(one).level).toBe('ADVANCED');
    const three = with_(base, {
      expression: {
        primary: 'ARCHITECTURAL_MINIMAL',
        secondary: 'EDITORIAL_OBJECT',
        likedParts: [{ system: 'POP_EDITORIAL', facet: 'TYPE' }, { system: 'POP_EDITORIAL', facet: 'COLOR' }],
        edition: 'ESSENTIAL',
      },
    });
    expect(deriveBuildLevel(three).level).toBe('CUSTOM');
    expect(builderScopeSignal(three).customDirection).toBe(true);
    const liked = with_(base, { expression: { primary: 'ARCHITECTURAL_MINIMAL', secondary: null, likedParts: [{ system: 'SOFT_ORGANIC', facet: 'COLOR' }], edition: 'ESSENTIAL' } });
    expect(deriveBuildLevel(liked).level).toBe('SIMPLE');
    expect(builderNotices(liked).some((n) => n.kind === 'NOTED')).toBe(true);
  });

  it('keep-it-simple turns a level raise into a decision, never a silent bump', () => {
    const selection = with_(BUILDER_SAMPLES.SIMPLE_SERVICE, { capabilities: ['SELL'] });
    expect(deriveBuildLevel(selection).level).toBe('ADVANCED');
    expect(builderNotices(selection).filter((n) => n.kind === 'NEEDS_DECISION').length).toBeGreaterThan(0);
  });

  it('describes scope change in words', () => {
    const impact = scopeImpact(BUILDER_SAMPLES.SIMPLE_SERVICE, with_(BUILDER_SAMPLES.SIMPLE_SERVICE, { capabilities: ['EDIT_CONTENT', 'BOOK'] }));
    expect(['SMALL', 'MEDIUM', 'LARGE']).toContain(impact.size);
    expect(scopeImpact(BUILDER_SAMPLES.SIMPLE_SERVICE, BUILDER_SAMPLES.SIMPLE_SERVICE).size).toBe('NONE');
  });

  it('every capability maps to estimator features', () => {
    for (const capability of CAPABILITIES) expect(capability.features.length, capability.id).toBeGreaterThan(0);
  });
});

describe('delivery', () => {
  it('does not offer priority where it would not shorten the project', () => {
    const view = builderEstimateView(with_(BUILDER_SAMPLES.SIMPLE_SERVICE, { delivery: 'PRIORITY' }));
    expect(view.delivery.priority.available).toBe(false);
    expect(view.notices.some((n) => n.id === 'priority-not-available')).toBe(true);
    expect(view.investment).toBe(view.delivery.standard.investment);
  });

  it('priority on a large project is sooner but never half the time', () => {
    const view = builderEstimateView(BUILDER_SAMPLES.LARGE_HYBRID);
    expect(view.delivery.priority.available).toBe(true);
    const standard = estimateProject(toEstimateConfig(BUILDER_SAMPLES.LARGE_HYBRID, 'SELF_SERVE', 'STANDARD'));
    const priority = estimateProject(toEstimateConfig(BUILDER_SAMPLES.LARGE_HYBRID, 'SELF_SERVE', 'PRIORITY'));
    if (!standard.ok || !priority.ok) throw new Error('estimate failed');
    expect(priority.result.expectedWeeks).toBeLessThan(standard.result.expectedWeeks);
    expect(priority.result.expectedWeeks).toBeGreaterThan(standard.result.expectedWeeks / 2);
    if (view.delivery.priority.available) expect(view.delivery.priority.whyNotHalf).toMatch(/without halving/);
  });

  it('the canonical 16-family fixture still compresses by about a third under priority', () => {
    const outcome = estimateProject({ ...FIXTURE_LARGE_PRODUCT, deliveryMode: 'PRIORITY' });
    if (!outcome.ok) throw new Error('fixture failed');
    expect(outcome.result.priorityFeasible).toBe(true);
    expect(outcome.result.priorityCompression).toBeGreaterThan(0.25);
    expect(outcome.result.priorityCompression).toBeLessThan(0.5);
  });
});

describe('Blueprint', () => {
  it('assembles every required line and marks what is still open', () => {
    const blueprint = builderBlueprint(BUILDER_SAMPLES.ADVANCED_EDITORIAL);
    expect(blueprint.lines.map((l) => l.key)).toEqual([
      'BUILD', 'LEVEL', 'STRUCTURE', 'EXPRESSION', 'TYPE', 'COLOR', 'IMAGE', 'MOTION', 'DELIVERY',
      'COMMERCE', 'PLATFORM', 'PLATFORM_USAGE', 'PAYMENT_PROCESSING', 'ONGOING_SUPPORT',
    ]);
    expect(blueprint.lines.find((l) => l.key === 'PLATFORM_USAGE')?.value).toBe('2.00% OF ELIGIBLE TRANSACTIONS');
    expect(builderEstimateView(BUILDER_SAMPLES.ADVANCED_EDITORIAL).investment).not.toContain('2.00%');
    expect(builderEstimateView(BUILDER_SAMPLES.SIMPLE_SERVICE).platformUsage.applicable).toBe(false);
    expect(blueprint.complete).toBe(true);
    const empty = builderBlueprint(with_(emptySelection(), { build: 'SITE' }));
    expect(empty.lines.find((l) => l.key === 'STRUCTURE')?.open).toBe(true);
    expect(empty.complete).toBe(false);
  });
});

describe('docs export', () => {
  it('the generated mapping and pricing evidence match the source', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const { BUILDER_DOCS_DIR, buildBuilderExports } = await import('../../../scripts/site00/builder-experience-export');
    const root = path.resolve(__dirname, '../../..');
    for (const [name, body] of Object.entries(buildBuilderExports())) {
      expect(readFileSync(path.join(root, BUILDER_DOCS_DIR, name), 'utf8'), name).toBe(body);
    }
  });
});
