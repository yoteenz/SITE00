import { describe, expect, it } from 'vitest';
import { SUPERSEDED_AUTHORITY_IDS } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { discoverAllPageNodes, discoverStaticPublicRoutes } from '../pageDiscovery';
import { ingestAuthorities, findAuthorityForRoute } from '../authorityRegistry';
import {
  runExperienceCompiler,
  validateProductFamilyFirewall,
} from '../compilerEngine';
import { isBuildReadyVerification, isBldrIntake, isIdntyEvolutionRoute } from '../productFamily';

describe('page graph discovery', () => {
  it('discovers public route constants and flow screens from code', () => {
    const staticRoutes = discoverStaticPublicRoutes();
    expect(staticRoutes.some((r) => r.route === '/idnty/state')).toBe(true);
    expect(staticRoutes.some((r) => r.route === '/bldr/state')).toBe(true);
    const nodes = discoverAllPageNodes();
    expect(nodes.length).toBeGreaterThan(80);
    expect(nodes.some((n) => n.route === '/idnty/starting-at-zero/audience')).toBe(true);
    expect(nodes.some((n) => n.route === '/bldr/site/review')).toBe(true);
  });
});

describe('authority ingestion', () => {
  it('registers 37 active authorities and excludes superseded from approval', () => {
    const { active, superseded } = ingestAuthorities();
    const approved = active.filter((a) => a.approved && !a.superseded);
    expect(approved).toHaveLength(37);
    expect(superseded).toHaveLength(3);
    for (const id of SUPERSEDED_AUTHORITY_IDS) {
      const rec = active.find((a) => a.authority_id === id);
      expect(rec?.superseded).toBe(true);
      expect(rec?.approved).toBe(false);
    }
  });

  it('maps known authority routes', () => {
    expect(findAuthorityForRoute('/idnty/state')?.authority_id).toBe('01_IDNTY_DIAGNOSTIC_OVERVIEW');
    expect(findAuthorityForRoute('/origin/locations')?.family).toBe('LOCATIONS');
  });
});

describe('derivation and batching', () => {
  it('classifies checkout and auth as creative authority required', () => {
    const { nodes } = runExperienceCompiler();
    const checkout = nodes.filter((n) => n.route.startsWith('/checkout'));
    if (checkout.length > 0) {
      for (const c of checkout) expect(c.classification).toBe('CREATIVE_AUTHORITY_REQUIRED');
    }
    for (const route of ['/origin/sign-in', '/origin/create-account']) {
      const n = nodes.find((x) => x.route === route);
      if (n) expect(n.classification).toBe('CREATIVE_AUTHORITY_REQUIRED');
    }
  });

  it('marks authority-backed IDNTY screens as directly covered', () => {
    const { nodes } = runExperienceCompiler();
    const overview = nodes.find((n) => n.route === '/idnty/state');
    expect(overview?.classification).toBe('DIRECTLY_COVERED');
  });

  it('produces sonnet manifests only for sonnet-ready batches', () => {
    const { batches, sonnetManifests } = runExperienceCompiler();
    for (const m of sonnetManifests) {
      const b = batches.find((x) => x.batch_id === m.batch_id);
      expect(b?.sonnet_ready).toBe(true);
    }
  });
});

describe('product family firewall', () => {
  it('passes IDNTY vs public EVOLVE and Build Ready vs BLDR separation', () => {
    const { ok, violations } = validateProductFamilyFirewall();
    expect(violations).toEqual([]);
    expect(ok).toBe(true);
    expect(isIdntyEvolutionRoute('/idnty/ready-for-evolution/goals')).toBe(true);
    expect(isBldrIntake('/bldr/site/audience')).toBe(true);
    expect(isBuildReadyVerification('/idnty/build-ready/verification')).toBe(true);
    expect(isBldrIntake('/idnty/build-ready/verification')).toBe(false);
  });
});
