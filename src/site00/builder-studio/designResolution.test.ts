import { describe, expect, it } from 'vitest';
import { emptySelection } from '../builder-experience/samples';
import type { BuilderSelection } from '../builder-experience/types';
import { snapshotFromSpatialState, emptySpatialState } from '../builder-experience/spatialStudio';
import { creativeExpressionSignature, designConflicts, resolveDesignDetails } from './designResolution';
import { pageDepthCopySignature } from './pageValueIntelligence';

const sel = (partial: Partial<BuilderSelection>): BuilderSelection => ({ ...emptySelection(), ...partial });

describe('designResolution — structure independent of aesthetic', () => {
  const editorialBase = {
    build: 'SITE' as const,
    structure: 'EDITORIAL' as const,
    capabilities: ['EDIT_CONTENT', 'SELL', 'PAYMENTS'] as const,
    expression: { primary: 'ARCHITECTURAL_MINIMAL' as const, secondary: null, likedParts: [], edition: 'FULL' as const },
  };

  const configA = sel({
    ...editorialBase,
    type: 'EXPRESSIVE_DISPLAY',
    color: 'HIGH_CONTRAST_MONO',
    imageWorld: 'PHOTOGRAPHIC',
    motion: 'QUIET',
  });

  const configB = sel({
    ...editorialBase,
    expression: { primary: 'POP_EDITORIAL', secondary: null, likedParts: [], edition: 'FULL' },
    type: 'CONDENSED_DISPLAY',
    color: 'SATURATED_EDITORIAL',
    imageWorld: 'EDITORIAL_COLLAGE',
    motion: 'KINETIC',
  });

  const configC = sel({
    ...editorialBase,
    expression: { primary: 'SOFT_ORGANIC', secondary: null, likedParts: [], edition: 'FULL' },
    type: 'HUMANIST_SANS',
    color: 'WARM_MINERAL',
    imageWorld: 'PHOTOGRAPHIC',
    motion: 'QUIET',
  });

  it('keeps the same structure while creative dimensions differ (A / B / C)', () => {
    for (const cfg of [configA, configB, configC]) {
      const structure = resolveDesignDetails(cfg).find((d) => d.key === 'STRUCTURE');
      expect(structure?.value).toBe('EDITORIAL');
      expect(structure?.provenance).toBe('CLIENT_SELECTED');
    }
    const sigs = [configA, configB, configC].map(creativeExpressionSignature);
    expect(new Set(sigs).size).toBe(3);
  });

  it('marks explicit tunables as client selections', () => {
    const type = resolveDesignDetails(configA).find((d) => d.key === 'TYPOGRAPHY');
    expect(type?.provenance).toBe('CLIENT_SELECTED');
    expect(type?.provenanceLabel).toBe('YOUR SELECTION');
  });

  it('marks system defaults as recommendations, not confirmed client choices', () => {
    const spatial = snapshotFromSpatialState(
      { ...emptySpatialState(), placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES'], pace: 'STANDARD', room: 'BLUEPRINT' },
      { computeEstimate: false },
    ).selection;
    const color = resolveDesignDetails(spatial).find((d) => d.key === 'COLOR_DIRECTION');
    expect(color?.provenance).toBe('SITE00_RECOMMENDED');
    expect(color?.provenanceLabel).toBe('OUR RECOMMENDATION');
  });

  it('does not overwrite explicit choices when structure changes', () => {
    const withOverride = sel({ ...configA, structure: 'COMMERCE' });
    const type = resolveDesignDetails(withOverride).find((d) => d.key === 'TYPOGRAPHY');
    expect(type?.value).toBe(resolveDesignDetails(configA).find((d) => d.key === 'TYPOGRAPHY')?.value);
  });

  it('surfaces conflicts without hiding client overrides', () => {
    const conflicts = designConflicts(configA);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts.every((c) => c.recommendation.includes('KEEP YOUR SELECTION'))).toBe(true);
  });
});

describe('pageValueIntelligence — page-specific depth copy', () => {
  it('does not repeat the generic full-depth sentence for every page', () => {
    const selection = sel({
      build: 'SITE',
      structure: 'COMMERCE',
      expression: { primary: 'POP_EDITORIAL', secondary: null, likedParts: [], edition: 'FULL' },
      capabilities: ['SELL', 'PAYMENTS', 'EDIT_CONTENT', 'ACCOUNTS'],
      experiences: [
        { id: 'HOME', depth: 'FULL' },
        { id: 'ABOUT', depth: 'FULL' },
        { id: 'SHOP', depth: 'FULL' },
        { id: 'CHECKOUT', depth: 'FULL' },
      ],
    });
    const copies = pageDepthCopySignature(selection);
    expect(copies.length).toBe(4);
    expect(new Set(copies).size).toBe(4);
    expect(copies.join(' ')).not.toContain('EVERY STATE AND SUB-VIEW PEOPLE MEET');
  });

  it('does not promise checkout without sell', () => {
    const selection = sel({
      build: 'SITE',
      structure: 'EDITORIAL',
      expression: { primary: 'EDITORIAL_OBJECT', secondary: null, likedParts: [], edition: 'ESSENTIAL' },
      capabilities: ['EDIT_CONTENT'],
      experiences: [{ id: 'CHECKOUT', depth: 'FULL' }],
    });
    const copies = pageDepthCopySignature(selection);
    expect(copies[0]).toMatch(/NOT IN THIS BUILD/);
  });
});

describe('spatial feel paths — distinct creative resolution', () => {
  it('MODERN vs BOLD vs EDITORIAL on advanced builds resolve different expression rows', () => {
    const base = { placePath: 'ADVANCED' as const, workModules: ['PAGES', 'SHOP'] as const, pace: 'STANDARD' as const, room: 'BLUEPRINT' as const };
    const sigs = (['MODERN', 'BOLD', 'EDITORIAL'] as const).map((feelVibe) =>
      creativeExpressionSignature(snapshotFromSpatialState({ ...emptySpatialState(), ...base, feelVibe }, { computeEstimate: false }).selection),
    );
    expect(new Set(sigs).size).toBe(3);
  });
});

/* ───────────── sprint acceptance A–O (source level) ───────────── */

import { readFileSync } from 'node:fs';
import { BUILDER_SAMPLES } from '../builder-experience/samples';
import { EXPERIENCES } from '../builder-experience/registry';
import { effectiveCapabilities, toEstimateConfig } from '../builder-experience';
import { parseBuilderSpatialDraft, spatialStateFromEnvelope } from '../builder-experience/spatialStudio/intakeDraft';
import { estimateProject } from '../../studioos/estimation';
import type { CapabilityId, ExperienceDepth } from '../builder-experience/types';
import { designDirectionNote } from './designResolution';
import { resolvePageValue } from './pageValueIntelligence';
import { featuresView, pagesView } from './blueprintTabsModel';

const row = (s: BuilderSelection, key: string) => resolveDesignDetails(s).find((d) => d.key === key)!;
const CREATIVE = ['TYPOGRAPHY', 'COLOR_DIRECTION', 'IMAGE_WORLD', 'MOTION', 'COMPOSITION'] as const;

/** Configurations A / B / C as a client reaches them in the builder: ADVANCED (editorial structure) with three feels. */
const spatialEditorial = (feelVibe: 'IMMERSIVE' | 'BOLD' | 'EDITORIAL') =>
  snapshotFromSpatialState(
    { ...emptySpatialState(), placePath: 'ADVANCED', feelVibe, workModules: ['PAGES', 'SHOP'], pace: 'STANDARD', room: 'BLUEPRINT' },
    { computeEstimate: false },
  ).selection;
const SPATIAL = { A: spatialEditorial('IMMERSIVE'), B: spatialEditorial('BOLD'), C: spatialEditorial('EDITORIAL') };

describe('A — structure and aesthetic are separate', () => {
  it('changing the creative direction leaves the structure row alone, and changing structure leaves the creative rows alone', () => {
    const base = sel({ build: 'SITE', structure: 'EDITORIAL', expression: { primary: 'POP_EDITORIAL', secondary: null, likedParts: [], edition: 'FULL' } });
    const otherLook = sel({ ...base, expression: { ...base.expression, primary: 'SOFT_ORGANIC' } });
    expect(row(otherLook, 'STRUCTURE')).toEqual(row(base, 'STRUCTURE'));
    const otherStructure = sel({ ...base, structure: 'COMMERCE' });
    for (const key of ['TYPOGRAPHY', 'COLOR_DIRECTION', 'IMAGE_WORLD', 'MOTION'] as const) expect(row(otherStructure, key)).toEqual(row(base, key));
  });
});

describe('B — three editorial configurations generate different design details', () => {
  it('differs on every creative dimension, value and explanation, in the real builder flow', () => {
    for (const s of Object.values(SPATIAL)) expect(row(s, 'STRUCTURE').value).toBe('EDITORIAL');
    for (const key of CREATIVE) {
      expect(new Set(Object.values(SPATIAL).map((s) => row(s, key).value)).size, key).toBe(3);
      expect(new Set(Object.values(SPATIAL).map((s) => row(s, key).fitNote)).size, key).toBe(3);
    }
  });

  it('explains each value from what that value is, not with one sentence per dimension', () => {
    expect(row(SPATIAL.A, 'COLOR_DIRECTION').fitNote).toContain('A DARK ROOM WITH ONE LIGHT');
    expect(row(SPATIAL.B, 'COLOR_DIRECTION').fitNote).toContain('A MAGAZINE THAT SHOUTS');
    expect(row(SPATIAL.C, 'COLOR_DIRECTION').fitNote).toContain('SUN ON SANDSTONE');
    expect(row(SPATIAL.C, 'COMPOSITION').fitNote).toContain('LEAD STORY → INDEX → STORY → READ NEXT');
  });
});

describe('C / F — explicit choices override recommendations, and a changed tunable changes the Blueprint', () => {
  it('shows the explicit value as the client’s own and keeps the other rows as recommendations', () => {
    const recommended = SPATIAL.C;
    const tuned = { ...recommended, type: 'MONO_SYSTEMIC' as const };
    expect(row(recommended, 'TYPOGRAPHY').value).toBe('EDITORIAL SERIF');
    expect(row(tuned, 'TYPOGRAPHY')).toMatchObject({ value: 'MONO / SYSTEMIC', provenanceLabel: 'YOUR SELECTION' });
    expect(row(tuned, 'TYPOGRAPHY').fitNote).not.toBe(row(recommended, 'TYPOGRAPHY').fitNote);
    expect(row(tuned, 'COLOR_DIRECTION')).toEqual(row(recommended, 'COLOR_DIRECTION'));
  });
});

describe('D — brand-sourced values are labelled as the brand’s', () => {
  it('reads colour from an established brand only when no colour was chosen', () => {
    const ready = sel({ ...SPATIAL.C, brand: 'READY' });
    expect(row(ready, 'COLOR_DIRECTION')).toMatchObject({ value: 'YOUR BRAND COLOURS', provenanceLabel: 'FROM YOUR BRAND' });
    const chosen = sel({ ...ready, color: 'HIGH_CONTRAST_MONO' });
    expect(row(chosen, 'COLOR_DIRECTION')).toMatchObject({ value: 'HIGH-CONTRAST MONOCHROME', provenanceLabel: 'YOUR SELECTION' });
    expect(row(SPATIAL.C, 'COLOR_DIRECTION').provenanceLabel).toBe('OUR RECOMMENDATION');
  });
});

describe('E — undecided fields are not invented', () => {
  it('leaves a custom direction’s open dimensions open instead of filling a default', () => {
    const custom = snapshotFromSpatialState(
      { ...emptySpatialState(), placePath: 'CUSTOM', feelVibe: 'MODERN', workModules: ['PAGES'], pace: 'STANDARD', room: 'BLUEPRINT' },
      { computeEstimate: false },
    ).selection;
    for (const key of ['TYPOGRAPHY', 'COLOR_DIRECTION', 'IMAGE_WORLD', 'MOTION'] as const) {
      expect(row(custom, key)).toMatchObject({ value: null, provenanceLabel: 'TO BE REFINED', display: 'SET WITH YOU IN YOUR CUSTOM DIRECTION' });
    }
    expect(row(sel({}), 'STRUCTURE')).toMatchObject({ value: null, provenanceLabel: 'TO BE REFINED' });
  });

  it('never shows machine strings, and writes everything in upper case', () => {
    const all = [...Object.values(SPATIAL), ...Object.values(BUILDER_SAMPLES)];
    for (const s of all) {
      const shown = resolveDesignDetails(s).flatMap((d) => [d.label, d.display, d.provenanceLabel, d.fitNote, d.context ?? '']);
      shown.push(designDirectionNote(s));
      for (const text of shown) {
        expect(text).toBe(text.toUpperCase());
        expect(text).not.toMatch(/SYSTEM_DEFAULT|CLIENT_SELECTED|UNDECIDED|[A-Z]+_[A-Z]+|FULL EDITION|FROM SYSTEM/);
      }
    }
  });
});

const everyCapability = sel({
  build: 'SITE',
  structure: 'COMMERCE',
  capabilities: ['SELL', 'BOOK', 'MEMBERSHIP', 'COMMUNITY', 'TEAM_ROLES', 'MARKETPLACE', 'DASHBOARD', 'DATA_PORTAL', 'DOCUMENTS', 'SEARCH', 'MEASURE', 'EMAIL', 'NOTIFICATIONS', 'LIVE_UPDATES'],
});
const value = (s: BuilderSelection, id: (typeof EXPERIENCES)[number]['id'], depth: ExperienceDepth = 'FULL') => resolvePageValue(s, { id, depth });
const withCaps = (caps: CapabilityId[]) => sel({ build: 'SITE', structure: 'EDITORIAL', capabilities: caps });

describe('G / H — page purposes are distinct and depth is page-specific', () => {
  it('gives every page its own purpose, value and depth contents', () => {
    const ids = EXPERIENCES.map((e) => e.id);
    for (const field of ['purpose', 'whyItMatters', 'depthProvides'] as const) {
      expect(new Set(ids.map((id) => value(everyCapability, id)[field])).size, field).toBe(ids.length);
    }
  });

  it('lets each depth include more of that page, and never falls back to the generic depth sentence', () => {
    for (const { id } of EXPERIENCES) {
      const [e, f, x] = (['ESSENTIAL', 'FULL', 'EXTENSIVE'] as const).map((d) => value(everyCapability, id, d).depthProvides);
      expect(f.startsWith(e) && x.startsWith(f) && f !== e && x !== f, id).toBe(true);
      expect(x).not.toMatch(/EVERY STATE AND SUB-VIEW|MAIN VIEWS PLUS/);
    }
  });
});

describe('I / J — feature dependencies change the copy, and unsupported features are not promised', () => {
  const cases: { page: (typeof EXPERIENCES)[number]['id']; base: CapabilityId[]; add: CapabilityId; promise: RegExp }[] = [
    { page: 'SHOP', base: ['SELL'], add: 'SEARCH', promise: /SEARCH AND FILTERING/ },
    { page: 'ACCOUNT', base: ['ACCOUNTS'], add: 'SELL', promise: /ORDER HISTORY/ },
    { page: 'CONTACT', base: [], add: 'BOOK', promise: /BOOKING/ },
    { page: 'DASHBOARD', base: ['DASHBOARD'], add: 'MEASURE', promise: /INSIGHT/ },
    { page: 'RECORDS', base: ['DATA_PORTAL'], add: 'DOCUMENTS', promise: /DOCUMENTS/ },
  ];
  for (const c of cases) {
    it(`${c.page}: ${c.add} changes what is promised`, () => {
      const without = value(withCaps(c.base), c.page);
      const withIt = value(withCaps([...c.base, c.add]), c.page);
      expect(without.depthProvides).not.toMatch(c.promise);
      expect(withIt.depthProvides).toMatch(c.promise);
      expect(without.limitation).toMatch(/^NOT IN THIS BUILD:/);
      expect(withIt.featuresNote).not.toBe(without.featuresNote);
    });
  }

  it('names only features the build has, by the names the FEATURES tab uses', () => {
    for (const s of [...Object.values(SPATIAL), ...Object.values(BUILDER_SAMPLES)]) {
      const names = new Set(featuresView(s).items.map((i) => i.verb));
      for (const g of pagesView(s).groups) {
        for (const p of g.pages) {
          const named = p.featuresNote?.replace('RUNS ON THESE FEATURES: ', '').split(' · ') ?? [];
          for (const name of named) expect(names, `${p.id}: ${name}`).toContain(name);
        }
      }
    }
  });
});

describe('K — legacy saved configurations still resolve', () => {
  it('reads every legacy builder sample and a pre-feel spatial draft without inventing values', () => {
    for (const s of Object.values(BUILDER_SAMPLES)) {
      expect(() => resolveDesignDetails(s)).not.toThrow();
      expect(() => pagesView(s)).not.toThrow();
    }
    expect(row(BUILDER_SAMPLES.CUSTOM_COMMERCE, 'MOTION')).toMatchObject({ value: 'CINEMATIC', provenanceLabel: 'YOUR SELECTION' });
    expect(row(BUILDER_SAMPLES.ADVANCED_EDITORIAL, 'TYPOGRAPHY').provenanceLabel).toBe('YOUR SELECTION');
    const envelope = parseBuilderSpatialDraft({ schemaVersion: 'builder-spatial-v1', spatialStudio: { placePath: 'ADVANCED', room: 'WORK' } });
    const legacy = snapshotFromSpatialState(spatialStateFromEnvelope(envelope!), { computeEstimate: false }).selection;
    for (const key of CREATIVE) expect(row(legacy, key).value, key).toBeNull();
  });
});

describe('L — estimates stay source-grounded', () => {
  it('reading the design and page copy changes nothing the estimator reads', () => {
    for (const s of [...Object.values(SPATIAL), ...Object.values(BUILDER_SAMPLES)]) {
      const before = JSON.stringify(estimateProject(toEstimateConfig(s)));
      const frozen = structuredClone(s);
      resolveDesignDetails(s);
      pagesView(s);
      expect(s).toEqual(frozen);
      expect(JSON.stringify(estimateProject(toEstimateConfig(s)))).toBe(before);
    }
    for (const file of ['./designResolution.ts', './pageValueIntelligence.ts']) {
      expect(readFileSync(new URL(file, import.meta.url), 'utf8')).not.toMatch(/studioos\/estimation|estimateProject|toEstimateConfig/);
    }
  });
});
