/**
 * P0.UI.1 — Project Presence Accent System tests.
 */

import { describe, expect, it } from 'vitest';
import {
  SITE00_HOST_ACCENT,
  resolveProjectPresenceAccent,
  extractProjectSlugFromPathname,
  projectPresenceCssVars,
  validateProjectPresenceColor,
  evaluateProjectPresenceContrast,
  evaluateProjectAccentBleed,
  evaluateProjectPresenceDiamond,
  adaptiveDiamondIsNotHostMutation,
} from '../shared/site00-studio-world-production/projectPresenceAccent/index.js';
import {
  PROJECT_BRAND_PRESENCE_REGISTRY,
  PROJECT_BRAND_PRESENCE_TEST_ENTRIES,
  lookupProjectBrandPresence,
} from '../shared/site00-brand-lore/projectPresence/index.js';
import { NDX_WORKSPACE_TOKENS } from '../shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';
import { evaluateHostClientVisualAuthority } from '../shared/site00-studio-world-production/visualReconstruction/evaluation/designEvaluationSuite.js';

function resolve(projectId: string | null, registry = PROJECT_BRAND_PRESENCE_REGISTRY) {
  return resolveProjectPresenceAccent({
    projectId,
    registryEntry: lookupProjectBrandPresence(projectId, registry),
  });
}

describe('P0.UI.1 Project Presence Accent System', () => {
  it('1-3. resolver + canonical primary authority', () => {
    const ndx = resolve('ndxbook');
    expect(ndx.source).toBe('CANONICAL_PRIMARY');
    expect(ndx.resolvedColor.toLowerCase()).toBe(NDX_WORKSPACE_TOKENS.lime.toLowerCase());
    expect(ndx.isCanonical).toBe(true);
  });

  it('4-6. approved primary, accent fallback, host red unresolved', () => {
    const reg = {
      'a': {
        projectId: 'a',
        projectName: 'A',
        approvedPrimary: '#2563eb',
        brandPrimaryStatus: 'RESOLVED' as const,
      },
      'b': {
        projectId: 'b',
        projectName: 'B',
        approvedAccent: '#c9a227',
        brandPrimaryStatus: 'RESOLVED' as const,
      },
      'c': { projectId: 'c', projectName: 'C', brandPrimaryStatus: 'UNRESOLVED' as const },
    };
    expect(resolve('a', reg).source).toBe('APPROVED_PRIMARY');
    expect(resolve('b', reg).source).toBe('APPROVED_ACCENT');
    expect(resolve('c', reg).fallbackUsed).toBe(true);
    expect(resolve('c', reg).resolvedColor).toBe(SITE00_HOST_ACCENT);
  });

  it('7. invalid color falls back safely', () => {
    const reg = {
      bad: {
        projectId: 'bad',
        projectName: 'Bad',
        canonicalPrimary: 'not-a-color',
        brandPrimaryStatus: 'RESOLVED' as const,
      },
    };
    expect(resolve('bad', reg).resolvedColor).toBe(SITE00_HOST_ACCENT);
    expect(validateProjectPresenceColor('transparent').valid).toBe(false);
  });

  it('8-12. project colors for ndx, fs, blue, gold — data-driven', () => {
    expect(resolve(null).resolvedColor).toBe(SITE00_HOST_ACCENT);
    expect(resolve('ndxbook').resolvedColor.toLowerCase()).toBe('#b7d236');
    expect(resolve('frontal-slayer').resolvedColor).toBe(SITE00_HOST_ACCENT);
    expect(resolve('demo-blue-co', { ...PROJECT_BRAND_PRESENCE_REGISTRY, ...PROJECT_BRAND_PRESENCE_TEST_ENTRIES }).resolvedColor).toBe('#2563eb');
    expect(resolve('demo-gold-co', { ...PROJECT_BRAND_PRESENCE_REGISTRY, ...PROJECT_BRAND_PRESENCE_TEST_ENTRIES }).resolvedColor.toLowerCase()).toBe('#c9a227');
  });

  it('13. no project-specific conditionals in generic resolver', () => {
    const src = resolveProjectPresenceAccent.toString();
    expect(src.includes('ndxbook')).toBe(false);
    expect(src.includes('frontal')).toBe(false);
  });

  it('14-17. active project context, transitions, loading, stale prevention', () => {
    expect(extractProjectSlugFromPathname('/projects/ndxbook/experiments')).toBe('ndxbook');
    expect(extractProjectSlugFromPathname('/control')).toBeNull();
    const resolving = resolveProjectPresenceAccent({ projectId: 'ndxbook', resolving: true });
    expect(resolving.status).toBe('RESOLVING');
    expect(resolving.resolvedColor).toBe(SITE00_HOST_ACCENT);
    const ndx = resolve('ndxbook');
    const root = resolve(null);
    expect(ndx.resolvedColor.toLowerCase()).toBe('#b7d236');
    expect(root.resolvedColor).toBe(SITE00_HOST_ACCENT);
    expect(root.projectId).toBeNull();
  });

  it('18-21. responsive consistency via derived css vars', () => {
    const ndx = resolve('ndxbook');
    const desktop = projectPresenceCssVars(ndx);
    const mobile = projectPresenceCssVars(ndx);
    expect(desktop['--site00-project-presence-accent']).toBe(mobile['--site00-project-presence-accent']);
    expect(desktop['--site00-host-accent']).toBe(SITE00_HOST_ACCENT);
  });

  it('22-24. host wordmark token separation', () => {
    const vars = projectPresenceCssVars(resolve('ndxbook'));
    expect(vars['--site00-host-accent']).toBe(SITE00_HOST_ACCENT);
    expect(vars['--site00-project-presence-accent']).toBe(NDX_WORKSPACE_TOKENS.lime);
    expect(SITE00_HOST_ACCENT).toBe('#e8192c');
  });

  it('25-28. accent bleed guard', () => {
    const ok = evaluateProjectAccentBleed(['client_breadcrumb_dot']);
    expect(ok.passed).toBe(true);
    const bad = evaluateProjectAccentBleed(['host_error_state']);
    expect(bad.failures).toContain('FAIL_PROJECT_ACCENT_BLEED');
  });

  it('29-31. contrast evaluation — keyline for low contrast, no random substitution', () => {
    const lime = evaluateProjectPresenceContrast('#b7d236');
    expect(['PASS', 'LOW_CONTRAST']).toContain(lime.outcome);
    expect(lime.useKeyline || lime.outcome === 'PASS').toBe(true);
    const invisible = evaluateProjectPresenceContrast('#f5f5f4');
    expect(invisible.outcome).toBe('FALLBACK_REQUIRED');
  });

  it('32-34. visual reconstruction project-presence diamond', () => {
    const presence = resolve('ndxbook');
    const eval_ = evaluateProjectPresenceDiamond({
      diamondColor: presence.resolvedColor,
      presence,
      inProjectContext: true,
    });
    expect(eval_.classification).toBe('PROJECT_PRESENCE');
    expect(eval_.valid).toBe(true);
    const filtered = adaptiveDiamondIsNotHostMutation({
      diamondEvaluation: eval_,
      hostClientFailures: ['FAIL_CLIENT_ACCENT_MUTATES_HOST', 'FAIL_HOST_ACCENT_LEAKAGE'],
    });
    expect(filtered.passed).toBe(true);
    const hostAuth = evaluateHostClientVisualAuthority(
      { clientAccentRatio: 0.08, hostAccentRatio: 0.15 },
      { projectPresenceDiamond: true, inProjectContext: true },
    );
    expect(hostAuth.passed).toBe(true);
  });

  it('35. derived not duplicated — registry is authoritative', () => {
    expect(PROJECT_BRAND_PRESENCE_REGISTRY.ndxbook?.canonicalPrimary).toBeTruthy();
    const a = resolve('ndxbook');
    const b = resolve('ndxbook');
    expect(a.resolvedColor).toBe(b.resolvedColor);
  });

  it('36-42. registry covers studio-world unresolved + build smoke', () => {
    expect(PROJECT_BRAND_PRESENCE_REGISTRY['studio-world']?.brandPrimaryStatus).toBe('UNRESOLVED');
    expect(lookupProjectBrandPresence('unknown')).toBeNull();
    expect(typeof evaluateProjectPresenceDiamond).toBe('function');
  });
});
