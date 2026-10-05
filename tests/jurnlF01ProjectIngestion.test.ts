/**
 * P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1 — project registration, project context, family production
 * contract (project-agnostic), asset-first policy, budget contract.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ASSET_CLASSES,
  ASSET_FIRST_PIPELINE,
  ASSET_FIRST_REQUIRED,
  assetPolicyFor,
  isRasterEligibleAssetClass,
} from '../shared/site00-product-families/assetFirstPolicy';
import { evaluateFamilyCompleteness, evaluateFamilyGate, FAMILY_COMPLETENESS_CONTRACT, FAMILY_IMPLEMENTATION_GATE_KEYS } from '../shared/site00-product-families/familyGate';
import { FAMILY_PRODUCTION_CONTRACT_VERSION } from '../shared/site00-product-families/familyProductionContract';
import { buildFamilyBudgetRecord, creditsToUsd, generationCostUsd } from '../shared/site00-product-families/productionBudget';
import { getSite00ManagedProject, listDesignEnabledManagedProjects } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry';
import { resolveLegacyProjectDesignRedirect } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/designRouteAuthority';
import { getIngestedProject, listIngestedProjects } from '../src/projects/registry';
import { projectFamilies } from '../src/projects/families';
import { JURNL_BUDGET_BASELINE, JURNL_F01_CONTRACT } from '../src/projects/jurnl/data/f01/contract';
import { JURNL_F01_COVERAGE } from '../src/projects/jurnl/data/f01/coverage';
import { listHostProductionProjects, projectCoverUrl, projectSwitchPath } from '../src/site00/projectRuntime/projectHostProfile';
import { resolveHubProjectEntry, type HubProjectEntry } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
/** Code only: provenance comments may cite the proof case, code may not depend on it. */
const code = (rel: string) => read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
function walk(dir: string): string[] {
  return readdirSync(path.join(root, dir)).flatMap((f) => {
    const rel = `${dir}/${f}`;
    return statSync(path.join(root, rel)).isDirectory() ? walk(rel) : [rel];
  });
}

describe('JURNL project registration (PERSONAL / FOUNDER)', () => {
  const p = getIngestedProject('jurnl')!;
  it('is a registered ingested project with the sprint record', () => {
    expect(p).toBeTruthy();
    expect(listIngestedProjects().map((x) => x.slug)).toContain('jurnl');
    expect(p).toMatchObject({
      projectId: 'JURNL',
      displayName: 'JURNL',
      projectType: 'PERSONAL',
      ownership: 'FOUNDER',
      relationship: 'PERSONAL',
      productClass: 'PERSONAL FINANCE + LIFESTYLE APPLICATION',
      status: 'ACTIVE_PRODUCTION',
      currentFamily: 'F01_ENTRY',
      currentProductionStage: 'IMPLEMENTATION_PROOF',
      tagline: 'PLAN TODAY. GROW FREELY.',
      voice: 'QUIETLY ASSURED + SMART / HUMAN',
      primaryPlatform: 'MOBILE_APP',
    });
    expect(p.viewport.authority).toEqual({ preset: 'MOBILE', w: 393, h: 852 });
    expect(p.viewport.presets).toEqual({ MOBILE: { w: 393, h: 852 }, TABLET: { w: 834, h: 1194 }, DESKTOP: { w: 1440, h: 900 } });
    expect(p.brand.palette.map((c) => c.label)).toEqual(['BONE / CREAM', 'IVORY', 'GREIGE', 'TAUPE', 'BLUSH', 'MUTED ROSE', 'DEEP EMERALD', 'BURGUNDY / WINE', 'CHAMPAGNE']);
  });
  it('is a selectable, design-enabled managed project (Design routing does not bounce it)', () => {
    const m = getSite00ManagedProject('jurnl');
    expect(m).toMatchObject({ designEnabled: true, ownership: 'FOUNDER', relationship: 'PERSONAL', projectRuntime: true });
    expect(listDesignEnabledManagedProjects().map((x) => x.projectId)).toContain('jurnl');
    expect(resolveLegacyProjectDesignRedirect('jurnl', '?mode=brand').redirect).toBe(false);
  });
  it('appears in the host PROJECT switcher with its own cover (official mark), next to NDXBOOK', () => {
    const list = listHostProductionProjects();
    const j = list.find((x) => x.slug === 'jurnl')!;
    expect(j).toMatchObject({ name: 'JURNL', kind: 'PERSONAL / FOUNDER', cover: '/site00/projects/jurnl/brand/jurnl-cover.png', runtime: true });
    expect(list.some((x) => x.slug === 'ndxbook')).toBe(true);
    expect(list.some((x) => x.slug === 'site00')).toBe(false);
    expect(projectCoverUrl('ndxbook')).toBe('/site00/production-hub/project/ndxbook/cover.webp');
  });
});

describe('project context switching clears stale project state', () => {
  it('switch keeps workspace + design mode, drops previous-project query state', () => {
    expect(projectSwitchPath('/production/ndxbook/design', '?mode=surfaces&inspect=screens&screen=F01.03&state=locked', 'jurnl')).toBe('/production/jurnl/design?mode=surfaces');
    expect(projectSwitchPath('/production/jurnl/design', '?mode=viewport&preset=TABLET&screen=F01.03', 'ndxbook')).toBe('/production/ndxbook/design?mode=viewport');
    expect(projectSwitchPath('/production/jurnl/experience', '?entry=002', 'ndxbook')).toBe('/production/ndxbook/experience');
    expect(projectSwitchPath('/production/queue', '', 'jurnl')).toBe('/production/jurnl/design');
  });
  it('hub data never substitutes another project for an unknown / newly ingested slug', () => {
    const list: HubProjectEntry[] = [{ projectId: 'frontal-slayer', name: 'FRONTAL SLAYER', productions: [], slotId: 'project.frontal-slayer.cover' }];
    expect(resolveHubProjectEntry(list, 'jurnl')).toMatchObject({ projectId: 'jurnl', name: 'JURNL', productions: [] });
    expect(resolveHubProjectEntry(list, 'frontal-slayer')).toBe(list[0]);
    expect(resolveHubProjectEntry(list, 'brand-new')).toMatchObject({ projectId: 'brand-new', name: 'BRAND NEW' });
  });
  it('hub lists founder PERSONAL projects even before the server index knows them', () => {
    const src = read('src/site00/components/productionHub/useProductionHubData.ts');
    expect(src).toContain("m.relationship === 'PERSONAL'");
    expect(src).not.toMatch(/\?\? projects\[0\]!/);
  });
});

describe('family production contract is project-agnostic', () => {
  it('shared contract modules never mention a specific project', () => {
    for (const f of [...walk('shared/site00-product-families'), ...walk('shared/site00-project-ingestion')]) {
      expect(code(f), f).not.toMatch(/jurnl|ndxbook/i);
    }
    expect(code('src/site00/components/productionAuthority/projectFamilyChamber.ts')).not.toMatch(/JURNL|F01|F02|NDX/);
  });
  it('JURNL F01 instance carries every schema field', () => {
    const c = JURNL_F01_CONTRACT;
    expect(c.contractVersion).toBe(FAMILY_PRODUCTION_CONTRACT_VERSION);
    for (const k of [
      'familyId', 'familyName', 'projectId', 'purpose', 'parentScreen', 'screens', 'states', 'interactions', 'dataObjects', 'globalComponents', 'familyComponents',
      'globalAssets', 'familyAssets', 'iconRequirements', 'brandExpressionLevel', 'generationSettings', 'generationBudget', 'approvalStatus', 'implementationStatus',
      'qaStatus', 'lineage', 'supersession', 'assetPolicy', 'responsive',
    ] as const) {
      expect(c[k], k).toBeDefined();
    }
    expect(c.screens.filter((s) => s.role === 'CHILD')).toHaveLength(13);
    expect(c.screens.find((s) => s.role === 'PARENT')?.approvalStatus).toBe('FOUNDER_APPROVED');
    expect(c.states).toHaveLength(27);
    expect(c.interactions).toHaveLength(74);
    expect(c.screens.find((s) => s.id === 'F01.13')?.bridgeTo).toBe('F02');
  });
  it('gate: SCREEN_COMPLETE != FAMILY_COMPLETE; F01 implementation-ready with LEGACY_EXCEPTION, founder approval still open', () => {
    const g = evaluateFamilyGate(JURNL_F01_CONTRACT, JURNL_F01_COVERAGE);
    expect(FAMILY_IMPLEMENTATION_GATE_KEYS).toEqual(['SCREENS_READY', 'STATES_READY', 'INTERACTIONS_READY', 'COMPONENTS_READY', 'RESPONSIVE_READY', 'ASSET_POLICY_RESOLVED', 'QA_READY']);
    expect(g.gate).toEqual({ SCREENS_READY: 'PASS', STATES_READY: 'PASS', INTERACTIONS_READY: 'PASS', COMPONENTS_READY: 'PASS', RESPONSIVE_READY: 'PASS', ASSET_POLICY_RESOLVED: 'LEGACY_EXCEPTION', QA_READY: 'PASS' });
    expect(g.implementationReady).toBe(true);
    expect(g.familyComplete).toBe(false);
    const done = evaluateFamilyCompleteness(JURNL_F01_CONTRACT, g);
    expect(Object.keys(done)).toEqual([...FAMILY_COMPLETENESS_CONTRACT]);
    expect(done.FOUNDER_APPROVAL).toBe(false);
  });
  it('screens alone never pass the gate', () => {
    const g = evaluateFamilyGate(JURNL_F01_CONTRACT, { ...JURNL_F01_COVERAGE, states: [], interactions: [] });
    expect(g.screenComplete).toBe(true);
    expect(g.implementationReady).toBe(false);
    expect(g.gate.STATES_READY).toBe('FAIL');
    expect(g.missing.INTERACTIONS_READY?.length).toBe(74);
  });
  it('families registry exposes the contract + runtime maps for the host', () => {
    const [f] = projectFamilies('jurnl');
    expect(f!.contract).toBe(JURNL_F01_CONTRACT);
    expect(Object.keys(f!.overlays)).toContain('F01.11');
    expect(f!.claims.length).toBeGreaterThan(5);
    expect(projectFamilies('ndxbook')).toEqual([]);
  });
});

describe('ASSET-FIRST methodology (F02+) recorded', () => {
  it('registers the policy, 11 asset classes and the 17-stage pipeline', () => {
    expect(ASSET_FIRST_REQUIRED).toBe(true);
    expect([...ASSET_CLASSES]).toEqual([
      'GLOBAL_INHERITED', 'FAMILY_BACKGROUND', 'ARCHITECTURAL_LAYER', 'ISOLATED_OBJECT', 'BOTANICAL', 'MATERIAL_TEXTURE', 'LIGHT_OVERLAY', 'ICON',
      'IMPLEMENTATION_COMPONENT', 'DATA_VISUALIZATION', 'NO_ASSET_REQUIRED',
    ]);
    expect(ASSET_FIRST_PIPELINE).toHaveLength(17);
    expect(isRasterEligibleAssetClass('IMPLEMENTATION_COMPONENT')).toBe(false);
    expect(isRasterEligibleAssetClass('BOTANICAL')).toBe(true);
  });
  it('legacy exception needs a reason; every later family is asset-first and unresolved until proven', () => {
    expect(() => assetPolicyFor({ legacyPilot: true })).toThrow(/reason/);
    expect(assetPolicyFor({ legacyPilot: false })).toMatchObject({ assetFirstRequired: true, resolution: 'UNRESOLVED' });
    expect(JURNL_F01_CONTRACT.assetPolicy).toMatchObject({ resolution: 'LEGACY_EXCEPTION', assetFirstRequired: false });
    expect(JURNL_F01_CONTRACT.assetPolicy.excludedSources).toContain('JURNL/F01_ENTRY/ASSETS/**');
    expect(JURNL_F01_CONTRACT.familyAssets.find((a) => a.id === 'ENTRY.UI.CONTROLS')?.assetClass).toBe('IMPLEMENTATION_COMPONENT');
  });
});

describe('budget contract', () => {
  it('baseline matches the founder budget note', () => {
    expect(JURNL_BUDGET_BASELINE.generation).toEqual({ model: 'GPT IMAGE 2.5 SUNBURST', resolution: '2K', aspect: '9:16', autoEnhance: false, creditsPerGeneration: 170 });
    expect(generationCostUsd(JURNL_BUDGET_BASELINE)).toBeCloseTo(0.51, 2);
    expect(creditsToUsd(JURNL_BUDGET_BASELINE, 60000)).toBe(180);
    expect(JURNL_BUDGET_BASELINE.purchaseUnit).toEqual({ credits: 5000, usd: 15 });
  });
  it('F02+ records are TRACKED (before/after required) and accumulate against the safe ceiling', () => {
    const f01 = JURNL_F01_CONTRACT.generationBudget!;
    expect(f01.tracking).toBe('LEGACY_PARTIAL');
    expect(() =>
      buildFamilyBudgetRecord(JURNL_BUDGET_BASELINE, [f01], { familyId: 'F02', tracking: 'TRACKED', creditsBefore: null, creditsAfter: 1000, assetGenerations: 0, screenGenerations: 0, interactionGenerations: 0, recoveryGenerations: 0 }),
    ).toThrow(/TRACKED/);
    const f02 = buildFamilyBudgetRecord(JURNL_BUDGET_BASELINE, [f01], { familyId: 'F02', tracking: 'TRACKED', creditsBefore: 20000, creditsAfter: 15240, assetGenerations: 12, screenGenerations: 10, interactionGenerations: 6, recoveryGenerations: 0 });
    expect(f02.familyCredits).toBe(4760);
    expect(f02.cumulativeCredits).toBe(f01.familyCredits + 4760);
    expect(f02.safeCeilingRemaining).toBe(60000 - f02.cumulativeCredits);
  });
});
