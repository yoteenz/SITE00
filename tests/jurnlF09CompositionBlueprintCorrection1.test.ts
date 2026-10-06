/**
 * P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1 — page composition blueprint, render-layer
 * ownership and composite authority.
 * Proves: the three gates exist and stop the line in order; an image generator can never own precision UI; metaphors are
 * contained; the F09 blueprints and ownership maps pass at 393×852 with data-true geometry; plates are text-free; the
 * contamination guard catches the RUN A phrases; previous renders are recorded as invalid; nothing was generated or
 * implemented; exports are in sync.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { aio as brain } from '../shared/studioos-experience-brain/index';
import {
  COMPOSITE_QA,
  DETERMINISTIC_LAYERS,
  GENERATOR_QA,
  HYBRID_HARD_RULE,
  PRECISION_UI_KINDS,
  RICHNESS_DIMENSIONS,
  aio,
  checkCompositeAuthority,
  checkCompositionBlueprint,
  checkContamination,
  checkRenderOwnership,
  evaluateAuthorityGate,
  jurnlF09,
  jurnlF09BP,
  jurnlF09CD,
  jurnlGrammar,
  type AuthorityGateInput,
  type CompositeAuthority,
  type PageCompositionBlueprint,
  type RenderOwnershipMap,
} from '../shared/studioos-visual-authority/index';
import { buildJurnlF09BlueprintExports } from '../scripts/studioos/jurnl-f09-composition-blueprint-export';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const sha = (b: string | Buffer) => createHash('sha256').update(b).digest('hex');
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const BP = jurnlF09BP.JURNL_F09_BLUEPRINTS;
const OWN = jurnlF09BP.JURNL_F09_RENDER_OWNERSHIP;
const T = jurnlF09.JURNL_F09_TERRITORIES;
const PROFILE = jurnlF09BP.jurnlF09HybridInput().profile;
const G = jurnlGrammar.JURNL_MOBILE_GEOMETRY;

/** A passing composite for a blueprint + ownership pair (fixture only — nothing like this exists for F09 yet). */
function composite(b: PageCompositionBlueprint, o: RenderOwnershipMap, over: Partial<CompositeAuthority> = {}): CompositeAuthority {
  const art = o.layers.filter((l) => l.owner === 'IMAGE_GENERATOR' || l.owner === 'COMPOSITE').map((l) => l.layer);
  return {
    composite_id: `${b.territory_id}.COMPOSITE.fixture`, territory_id: b.territory_id, blueprint_id: b.blueprint_id, ownership_id: o.ownership_id,
    art_layers: [{
      plate_id: 'fixture.plate', layers: art, plate_kind: 'SCENE_PLATE', model: 'gpt-image-2.5-sunburst', provider: 'OpenArt', generation_mode: 'REFERENCE_GUIDED', local_render: false,
      image_path: 'fixture.png', sha256: 'x', generator_qa: Object.fromEntries(GENERATOR_QA.map((q) => [q, true])) as CompositeAuthority['art_layers'][0]['generator_qa'],
      baked_ui: { pass: true, findings: [] }, contamination: { pass: true, found: [] },
    }],
    deterministic_layers: o.layers.filter((l) => l.owner !== 'IMAGE_GENERATOR' && l.owner !== 'NO_RENDER').map((l) => ({ layer: l.layer, source: 'fixture' })),
    composite_qa: Object.fromEntries(COMPOSITE_QA.map((q) => [q, true])) as CompositeAuthority['composite_qa'],
    anti_ai_flags: [],
    richness: Object.fromEntries(RICHNESS_DIMENSIONS.map((d) => [d, 4])) as CompositeAuthority['richness'],
    product_clarity_seconds: 1.5,
    image_path: 'fixture-composite.png',
    ...over,
  };
}
const args = (i: number, c?: CompositeAuthority | null) => ({ blueprint: BP[i], ownership: OWN[i], profile: PROFILE, composite: c, renderer_model: 'gpt-image-2.5-sunburst' });

describe('methodology: page composition blueprint', () => {
  it('no blueprint → PAGE_COMPOSITION_BLUEPRINT_REQUIRED', () => {
    expect(checkCompositionBlueprint(null, T[0]).status).toBe('PAGE_COMPOSITION_BLUEPRINT_REQUIRED');
  });

  it('the metaphor is contained: WHOLE_PAGE needs a founder decision; an object over half the stage fails', () => {
    const whole = { ...clone(BP[0]!), metaphor_scope: 'WHOLE_PAGE' as const };
    expect(checkCompositionBlueprint(whole).issues).toContain('WHOLE_PAGE metaphor scope needs a founder decision');
    const big = clone(BP[0]!);
    big.zones.find((z) => z.role === 'SIGNATURE_OBJECT')!.rect = { x: 26.5, y: 108, w: 340, h: 520 };
    const r = checkCompositionBlueprint(big);
    expect(r.status).toBe('PAGE_COMPOSITION_BLUEPRINT_REQUIRED');
    expect(r.issues.join(' ')).toMatch(/signature object is \d+ % of the stage/);
  });

  it('product zones may not collide with chrome or nav, and the signal must sit high', () => {
    const b = clone(BP[1]!);
    b.zones.find((z) => z.zone_id === 'T02.CTA')!.rect.y = 740;
    b.zones.find((z) => z.role === 'PRIMARY_SIGNAL')!.rect.y = 560;
    const issues = checkCompositionBlueprint(b).issues.join(' | ');
    expect(issues).toMatch(/T02\.CTA collides with T02\.NAV/);
    expect(issues).toMatch(/primary signal below the upper 60 %/);
  });

  it('a missing required zone (e.g. secondary product) fails', () => {
    const b = clone(BP[2]!);
    b.zones = b.zones.filter((z) => z.role !== 'SECONDARY_PRODUCT');
    expect(checkCompositionBlueprint(b).issues).toContain('missing zone SECONDARY_PRODUCT');
  });
});

describe('methodology: render-layer ownership (hard rule)', () => {
  it('states the hard rule', () => {
    expect(HYBRID_HARD_RULE).toBe('AN IMAGE GENERATOR MAY CONTRIBUTE TO A PRODUCT AUTHORITY, BUT IT MAY NOT BE THE SOLE RENDERER OF PRECISION PRODUCT UI.');
    expect(DETERMINISTIC_LAYERS).toEqual(['L2', 'L4', 'L5', 'L6', 'L7']);
  });

  it('the generator may not own L2 / L4–L7 or the logo, a COMPOSITE must split its parts, and every layer has exactly one owner', () => {
    const swap = (layer: string, patch: object) => ({ ...clone(OWN[0]!), layers: OWN[0]!.layers.map((l) => (l.layer === layer ? { ...l, ...patch } : l)) }) as RenderOwnershipMap;
    expect(checkRenderOwnership(swap('L2', { owner: 'IMAGE_GENERATOR' }), BP[0], PROFILE).issues.join(' ')).toMatch(/L2 \(PRIMARY PRODUCT SIGNAL\) must be deterministic/);
    expect(checkRenderOwnership(swap('L7', { owner: 'IMAGE_GENERATOR' }), BP[0], PROFILE).status).toBe('RENDER_LAYER_OWNERSHIP_REQUIRED');
    expect(checkRenderOwnership(swap('L1', { owner: 'IMAGE_GENERATOR' }), BP[0], PROFILE).issues).toContain('L1 brand frame (logo geometry) may not be generator-owned');
    expect(checkRenderOwnership(swap('L3', { generated_part: '' }), BP[0], PROFILE).issues).toContain('L3 COMPOSITE must split generated_part / deterministic_part');
    const dup = { ...clone(OWN[0]!), layers: [...OWN[0]!.layers, { layer: 'L0', owner: 'NO_RENDER', renders: 'x' }] } as RenderOwnershipMap;
    expect(checkRenderOwnership(dup, BP[0], PROFILE).issues).toContain('L0 has 2 owners (exactly one required)');
    expect(checkRenderOwnership(null, BP[0], PROFILE).status).toBe('RENDER_LAYER_OWNERSHIP_REQUIRED');
  });

  it('a precision slot on a generator-owned layer fails', () => {
    const b = clone(BP[0]!);
    b.zones.find((z) => z.role === 'PERIMETER')!.slots.push({ slot_id: 'oops', kinds: ['EXACT_COPY'], content: 'SAFE TO SPEND' });
    expect(checkRenderOwnership(OWN[0], b, PROFILE).issues.join(' ')).toMatch(/precision slots \(oops\) on a generator-owned layer/);
  });

  it('every project has a render-ownership profile; JURNL is READY, the others are drafts for the founder', () => {
    const profiles = JSON.parse(read('docs/studioos/visual-authority-development/RENDER_LAYER_OWNERSHIP_GATE.json')).profiles as { project_id: string; status: string }[];
    expect(profiles.map((p) => p.project_id)).toEqual(['JURNL', 'AIO', 'FRONTAL_SLAYER', 'ASTRAL_WORLD', 'NDXBOOK', 'SITE00']);
    expect(profiles.find((p) => p.project_id === 'JURNL')!.status).toBe('READY');
    expect(profiles.filter((p) => p.status === 'DRAFT_NEEDS_FOUNDER')).toHaveLength(5);
  });
});

describe('methodology: composite authority', () => {
  it('a passing composite is AUTHORITY_READY; none is COMPOSITE_AUTHORITY_REQUIRED', () => {
    expect(checkCompositeAuthority(args(0, composite(BP[0]!, OWN[0]!))).status).toBe('AUTHORITY_READY');
    expect(checkCompositeAuthority(args(0, null)).issues).toEqual(['no composite authority assembled yet']);
  });

  it('local art, baked UI, failed composite QA, a material anti-AI flag, thin richness or slow clarity each block', () => {
    const c = composite(BP[1]!, OWN[1]!);
    const art = (patch: object) => ({ ...c, art_layers: [{ ...c.art_layers[0]!, ...patch }] });
    expect(checkCompositeAuthority(args(1, art({ local_render: true }))).status).toBe('COMPOSITE_AUTHORITY_REQUIRED');
    expect(checkCompositeAuthority(args(1, art({ baked_ui: { pass: false, findings: ['DUPLICATE_BUTTON'] } }))).issues.join(' ')).toMatch(/baked UI DUPLICATE_BUTTON/);
    expect(checkCompositeAuthority(args(1, { ...c, composite_qa: { ...c.composite_qa, EXACT_LOGO: false } })).issues.join(' ')).toMatch(/EXACT_LOGO/);
    expect(checkCompositeAuthority(args(1, { ...c, anti_ai_flags: [{ flag: 'METAPHOR_CONSUMED_PAGE', severity: 'MATERIAL', note: 'n' }] })).status).toBe('COMPOSITE_AUTHORITY_REQUIRED');
    expect(checkCompositeAuthority(args(1, { ...c, richness: { ...c.richness, VISUAL_WIT: 2 } })).issues.join(' ')).toMatch(/richness/);
    expect(checkCompositeAuthority(args(1, { ...c, product_clarity_seconds: 3 })).issues.join(' ')).toMatch(/product clarity 3s/);
  });
});

describe('gate integration (stand-in experience + brand fixtures; F09 has no Brain contract yet)', () => {
  const input = (over: Partial<AuthorityGateInput> = {}): AuthorityGateInput => ({
    ...jurnlF09.jurnlF09GateInput(),
    experience_contract: brain.AIO_IFTA_CONTRACT,
    brand_context: aio.AIO_BRAND_CONTEXT,
    creative_direction: jurnlF09CD.jurnlF09CreativeGateInput(),
    ...over,
  });

  it('creative direction ready but no blueprint → PAGE_COMPOSITION_BLUEPRINT_REQUIRED (before references)', () => {
    const r = evaluateAuthorityGate(input({ hybrid: null }));
    expect(r.guard).toBe('PAGE_COMPOSITION_BLUEPRINT_REQUIRED');
    expect(r.state).toBe('AUTHORITY_TERRITORIES_REQUIRED');
  });

  it('blueprints ready, generator owns the signal → RENDER_LAYER_OWNERSHIP_REQUIRED', () => {
    const h = jurnlF09BP.jurnlF09HybridInput();
    h.ownership = h.ownership.map((o) => ({ ...o, layers: o.layers.map((l) => (l.layer === 'L2' ? { ...l, owner: 'IMAGE_GENERATOR' as const } : l)) }));
    expect(evaluateAuthorityGate(input({ hybrid: h })).guard).toBe('RENDER_LAYER_OWNERSHIP_REQUIRED');
  });

  it('F09 today: hybrid composite authorities pass the gate (full-screen Sunburst candidates do not count)', () => {
    const r = evaluateAuthorityGate(input({ hybrid: jurnlF09BP.jurnlF09HybridInput() }));
    expect(jurnlF09BP.jurnlF09HybridStatus().gate.status).toBe('COMPOSITES_READY');
    expect(r.state).toBe('AUTHORITY_IN_REVIEW');
    expect(r.conditions.REFERENCE_AUTHORITY_EXISTS).toBe(true);
  });

  it('with passing composites the family reaches founder review', () => {
    const h = { ...jurnlF09BP.jurnlF09HybridInput(), composites: BP.map((b, i) => composite(b, OWN[i]!)) };
    const r = evaluateAuthorityGate(input({ hybrid: h }));
    expect(r.state).toBe('AUTHORITY_IN_REVIEW');
    expect(r.conditions.REFERENCE_AUTHORITY_EXISTS).toBe(true);
  });

  it('the grandfathered AIO IFTA family is unaffected', () => {
    expect(aio.aioIftaGateStatus('CLIENT').guard).not.toMatch(/BLUEPRINT|OWNERSHIP|COMPOSITE/);
  });
});

describe('F09 blueprints at 393×852', () => {
  const s = jurnlF09BP.jurnlF09HybridStatus();

  it('all three blueprints, ownership maps and densities pass; hybrid composites are COMPOSITES_READY', () => {
    expect(s.blueprints.map((b) => b.status)).toEqual(['BLUEPRINT_READY', 'BLUEPRINT_READY', 'BLUEPRINT_READY']);
    expect(s.ownership.map((o) => o.status)).toEqual(['OWNERSHIP_READY', 'OWNERSHIP_READY', 'OWNERSHIP_READY']);
    expect(s.density.map((d) => d.status)).toEqual(['DENSITY_BALANCED', 'DENSITY_BALANCED', 'DENSITY_BALANCED']);
    expect(s.gate.status).toBe('COMPOSITES_READY');
  });

  it('keep the three territories; metaphors are contained (T01 OBJECT · T02 ZONE · T03 OBJECT)', () => {
    expect(BP.map((b) => b.territory_id)).toEqual(T.map((t) => t.territory_id));
    expect(BP.map((b) => b.translation_id)).toEqual(jurnlF09CD.JURNL_F09_CREATIVE_DIRECTIONS.map((c) => c.translation_id));
    expect(BP.map((b) => b.metaphor_scope)).toEqual(['OBJECT', 'ZONE', 'OBJECT']);
  });

  it('share the JURNL frame: 393×852, chrome row, five-cell nav, stage 340 pt; product zones inside the stage', () => {
    for (const b of BP) {
      expect(b.frame).toMatchObject({ width: 393, height: 852, unit: 'pt', generated_aspect: '9:16' });
      expect(b.zones.find((z) => z.role === 'NAV')!.rect).toEqual(G.nav);
      expect(b.zones.find((z) => z.role === 'NAV')!.slots.map((x) => x.slot_id)).toEqual(['home', 'money', 'add', 'plan', 'credit']);
      expect(b.zones.find((z) => z.role === 'SYSTEM_CHROME')!.slots.map((x) => x.slot_id)).toEqual(['back', 'account', 'ask']);
      expect(b.safe_areas.stage).toEqual({ x: 26.5, w: 340 });
    }
  });

  it('no precision content on a generator layer; L2 and L4–L7 deterministic; L1 never generated', () => {
    for (const [i, o] of OWN.entries()) {
      for (const l of o.layers) if (DETERMINISTIC_LAYERS.includes(l.layer)) expect(['DETERMINISTIC_UI', 'NO_RENDER']).toContain(l.owner);
      expect(o.layers.find((l) => l.layer === 'L1')!.owner).not.toBe('IMAGE_GENERATOR');
      for (const z of BP[i]!.zones.filter((zz) => zz.layer === 'L0')) for (const sl of z.slots) expect(sl.kinds.some((k) => (PRECISION_UI_KINDS as readonly string[]).includes(k))).toBe(false);
    }
  });

  it('data geometry is computed from the formula, not drawn by eye', () => {
    const g = jurnlF09BP.JURNL_F09_COMPOSITE_ASSEMBLY_CONTRACT.data_geometry;
    const clear = 24885 / 30960;
    const c = g['JURNL.F09.T01'].courtyard;
    expect((c.floor.w * c.floor.h) / (c.room.w * c.room.h)).toBeCloseTo(clear, 2);
    const len = Object.fromEntries(c.courses.map((k) => [k.course, k.length]));
    expect(len.PLAN! / len.BILLS!).toBeCloseTo(2400 / 1875, 2);
    expect(len.GOALS).toBeCloseTo(len.TRIPS!, 5);
    expect(g['JURNL.F09.T02'].rule.clear.w).toBeCloseTo(300 * clear, 1);
    const env = Object.fromEntries(g['JURNL.F09.T03'].rack.slots.filter((x) => x.plate_label).map((x) => [x.item, x.envelope_thickness]));
    expect(env.PLAN).toBe(12);
    expect(env.BILLS! / env.PLAN!).toBeCloseTo(1875 / 2400, 2);
    expect(g['JURNL.F09.T03'].rack.slots[0]!.envelope_thickness).toBe(0);
  });

  it('copy is canonical; open founder decisions stay open', () => {
    const runtime = read('src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx');
    const C = jurnlF09BP.F09_CANONICAL_COPY;
    for (const t of [C.FUNCTION_LABEL, C.STATE_LINE_COMPLETE, C.CLEAR, C.OVER, C.PRIMARY_ACTION, C.SECONDARY_ACTION]) expect(runtime).toContain(t);
    expect(jurnlF09BP.F09_PENDING_DECISIONS.map((d) => d.id)).toEqual(['D-F09-PRIMARY-ACTION-LABEL', 'D-F09-PURCHASES-BRIDGE', 'D-F09-AVAILABLE-DATE']);
    const cta = BP.flatMap((b) => b.zones).filter((z) => z.zone_id.endsWith('.CTA')).map((z) => z.slots[0]!);
    for (const sl of cta) expect(sl).toMatchObject({ content: 'SEE THE FULL BREAKDOWN', decision: 'D-F09-PRIMARY-ACTION-LABEL' });
    const all = JSON.stringify(BP);
    for (const invented of ['WHY THIS AMOUNT', 'CHECK A PURCHASE', 'AVAILABLE THROUGH']) expect(all).not.toContain(invented);
  });
});

describe('raw plates + contamination', () => {
  const raw = jurnlF09BP.JURNL_F09_RAW_GENERATION_CONTRACT;

  it('one text-free scene plate per territory; prompts carry no product, brand or copy words', () => {
    expect(raw.plates).toHaveLength(3);
    expect(raw.generations_this_sprint.primary).toBe(3);
    expect(raw.generations_this_sprint.paid).toBe(3);
    for (const p of raw.plates) {
      expect(p.prompt).toMatch(/no text, no logo, no buttons, no nav/i);
      for (const w of ['JURNL', 'SAFE TO SPEND', 'BILLS', 'GOALS', 'TRIPS', 'HOME', 'MONEY', 'CREDIT', 'BREAKDOWN', '$', 'T01', 'T02', 'T03', 'NAV', 'CTA']) expect(p.prompt, w).not.toContain(w);
      expect(p.materials.length).toBeLessThanOrEqual(jurnlGrammar.JURNL_DENSITY_RULE.max_material_families);
      expect(existsSync(path.join(ROOT, p.plate_guide))).toBe(true);
    }
    for (const sizes of Object.values(jurnlF09BP.JURNL_F09_COMPOSITE_ASSEMBLY_CONTRACT.type_scale)) expect(sizes.length).toBeLessThanOrEqual(jurnlGrammar.JURNL_DENSITY_RULE.max_type_sizes);
  });

  it('the guard catches the RUN A T03 phrases, allows the approved tagline, and rejects any text in a plate', () => {
    const guards = jurnlF09BP.buildF09ContaminationGuards(sha, (p) => (existsSync(path.join(ROOT, p)) ? sha(readFileSync(path.join(ROOT, p))) : null));
    const g3 = guards[2]!;
    expect(checkContamination(g3, ['A QUIETER YOU'], false).status).toBe('INVALIDATED');
    expect(checkContamination(g3, ['BEGIN YOUR JOURNEY'], false).status).toBe('INVALIDATED');
    expect(checkContamination(g3, ['PLAN TODAY. GROW FREELY.', 'SAFE TO SPEND', '$24,885'], false).status).toBe('CLEAN');
    expect(checkContamination(g3, ['A FULL READING'], false).found).toEqual(['off-contract copy: A FULL READING']);
    expect(checkContamination(g3, ['PLAN'], true).status).toBe('INVALIDATED');
    for (const [i, g] of guards.entries()) {
      const plate = raw.plates[i]!;
      expect(g.prompt_hashes[plate.plate_id]).toBe(sha(plate.prompt));
      expect(g.blueprint_hash).toBe(sha(JSON.stringify(BP[i])));
      expect(g.allowed_reference_assets[0]!.sha256).toBe(sha(readFileSync(path.join(ROOT, plate.plate_guide))));
      expect(g.allowed_reference_assets[1]!.sha256).toBe(sha(readFileSync(path.join(ROOT, 'public/site00/projects/jurnl/brand/jurnl-logo-official.png'))));
      expect(g.forbidden_reference_assets.join(' ')).toMatch(/REFERENCE_CANDIDATES_4K/);
    }
  });
});

describe('previous renders', () => {
  const L = jurnlF09BP.JURNL_F09_INVALID_RENDER_LEDGER;

  it('T03 is INVALID_RENDER in both runs; every RUN B file hash matches the committed image', () => {
    for (const run of L.runs) expect(run.entries.find((e) => e.territory_id === 'JURNL.F09.T03')!.status).toBe('INVALID_RENDER');
    expect(jurnlF09BP.F09_T03_PREVIOUS_RENDER_STATUS).toBe('INVALID_RENDER');
    const b = L.runs.find((r) => r.run_id.endsWith('OPENART_COMPOSER'))!;
    for (const e of b.entries) expect(sha(readFileSync(path.join(ROOT, e.image_path!)))).toBe(e.sha256);
    const a = L.runs.find((r) => r.run_id.endsWith('CHATGPT_FOUNDER'))!;
    expect(a.ingested).toBe(false);
    expect(JSON.stringify(a.entries[2])).toMatch(/A QUIETER YOU.*BEGIN YOUR JOURNEY/);
  });

  it('the render sprint’s empty audits are corrected with the visible defects', () => {
    const audits = jurnlF09CD.JURNL_F09_CORRECTED_AUDITS;
    expect(audits[0]!.typography_defects.map((d) => d.defect)).toEqual(['MUTATED_WORDMARK', 'MUTATED_MARK']);
    expect(audits[0]!.typography_defects[0]!.text).toMatch(/JURL/);
    expect(audits[1]!.typography_defects.map((d) => d.defect)).toContain('MISSING_COPY');
    expect(audits.every((a) => a.typography_defects.some((d) => d.defect === 'MUTATED_MARK'))).toBe(true);
    expect(L.superseded_prompts.status).toBe('SUPERSEDED');
  });
});

describe('F09 three-distinct composite rerun1', () => {
  it('canonical founder payload locked; plate prompts forbid finished-app / device chrome language', () => {
    const payload = JSON.parse(read(jurnlF09BP.F09_FOUNDER_REVIEW_PAYLOAD_PATH));
    expect(payload.amount).toBe('$1,284');
    expect(payload.primary_action).toBe('SEE WHY THIS AMOUNT');
    expect(payload.held_categories).toEqual(['BILLS', 'PLANS', 'GOALS', 'BUFFER']);
    expect(payload.purchase_bridge.cta).toBe('CHECK A PURCHASE');
    expect(jurnlF09BP.DEVICE_CHROME_FORBIDDEN).toBe(true);
    const log = JSON.parse(read(`${jurnlF09BP.JURNL_F09_RERUN_DIR}/ASSEMBLE_LOG.json`));
    const hashes = log.results.map((r: { payload_hash: string }) => r.payload_hash);
    expect(new Set(hashes).size).toBe(1);
    expect(hashes[0]).toBe(jurnlF09BP.JURNL_F09_RERUN_RENDER_LEDGER.payload_hash);
    const plate = jurnlF09BP.JURNL_F09_RAW_GENERATION_CONTRACT.plates[0]!;
    expect(plate.prompt.toLowerCase()).not.toMatch(/finished mobile app screen/);
    expect(plate.prompt).toMatch(/NOT a finished app screen/i);
    expect(plate.prompt).toMatch(/home indicator/i);
  });

  it('three rerun composites on disk; QA pass; no device chrome in work HTML', () => {
    for (const c of jurnlF09BP.JURNL_F09_RERUN_COMPOSITES) expect(existsSync(path.join(ROOT, c.image_path)), c.image_path).toBe(true);
    const qa = JSON.parse(read(`${jurnlF09BP.JURNL_F09_RERUN_DIR}/COMPOSITE_QA.json`));
    expect(qa.pass).toBe(true);
    expect(qa.device_chrome.IOS_STATUS_BAR).toBe('ABSENT');
    expect(qa.distinctness.anti_template_test.pass).toBe(true);
    for (const t of ['T01', 'T02', 'T03']) {
      const html = read(`${jurnlF09BP.JURNL_F09_RERUN_DIR}/WORK/${t}.html`);
      expect(html).not.toMatch(/9:41|home-ind|class="status"/);
    }
  });
});

describe('state of the sprint', () => {
  it('hybrid composites ready; no production F09 runtime change', () => {
    expect(jurnlF09BP.jurnlF09HybridInput().composites).toHaveLength(3);
    expect(jurnlF09BP.jurnlF09HybridStatus().gate.status).toBe('COMPOSITES_READY');
    for (const c of jurnlF09BP.JURNL_F09_RERUN_COMPOSITES) expect(existsSync(path.join(ROOT, c.image_path)), c.image_path).toBe(true);
    for (const f of ['src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx', 'src/projects/jurnl/data/f09/safeToSpend.ts']) expect(read(f)).not.toMatch(/COMPOSITION_BLUEPRINT|hybrid-authority/);
    for (const t of T) expect(t.founder_decision).toBeNull();
  });

  it('exports are in sync with the TypeScript source; zone maps and plate guides exist', () => {
    for (const [name, body] of Object.entries(buildJurnlF09BlueprintExports())) expect(read(`${jurnlF09BP.JURNL_F09_BP_DIR}/${name}`), name).toBe(body);
    for (const t of ['T01', 'T02', 'T03']) {
      expect(existsSync(path.join(ROOT, jurnlF09BP.JURNL_F09_BP_DIR, `ZONE_MAPS/F09_${t}_BLUEPRINT_ZONE_MAP.png`))).toBe(true);
      expect(existsSync(path.join(ROOT, jurnlF09BP.JURNL_F09_BP_DIR, `PLATE_GUIDES/F09_${t}_PLATE_GUIDE_9x16.png`))).toBe(true);
    }
    expect(existsSync(path.join(ROOT, jurnlF09BP.JURNL_F09_BP_DIR, 'README.md'))).toBe(true);
  });
});
