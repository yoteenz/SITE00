/**
 * P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1 — prompt forensics + creative-logic audit (analysis only).
 * Proves: the lineage covers all six F09 sprints from primary sources; the cited evidence exists and says what the audit
 * claims; the measurements reproduce from the source files; contradictions and root causes are complete, ranked and
 * classed; the survival verdicts and architecture are recorded; nothing was generated; the exports are in sync.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ASSET_QUALITY_GATE,
  ANTI_GENERIC_TEST,
  DEVICE_CHROME_RULE,
  GENERATOR_PROMPT_BUDGET,
  INSTRUCTION_CATEGORIES,
  PROMPT_ARCHITECTURE,
  PROMPT_FAILURE_CLASSES,
  assessAssetQuality,
  classifyInstruction,
  jurnlF09Forensics as F,
} from '../shared/studioos-visual-authority/index';
import {
  F09_FORENSICS_AUDIT_BRIEF,
  F09_FORENSICS_BRIEFS,
  F09_FORENSICS_GENERATOR_PROMPTS,
  buildF09DensityMeasurement,
  buildF09FinalReport,
  buildF09InstructionInventory,
  buildF09PromptForensicsExports,
} from '../scripts/studioos/jurnl-f09-prompt-forensics-export';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p: string) => existsSync(path.join(ROOT, p));

describe('lineage + sources', () => {
  it('covers all six F09 sprints, marks the two Composer sprints as reconstructed', () => {
    const sprints = new Set(F.F09_PROMPT_LINEAGE.map((l) => l.sprint));
    for (const s of ['VISUAL-AUTHORITY-3-TERRITORY-PROOF1', 'CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1', 'COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1', 'HYBRID-COMPOSITE-AUTHORITY-EXECUTION1', 'THREE-DISTINCT-COMPOSITE-AUTHORITY-RERUN1', 'THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1']) expect(sprints.has(s), s).toBe(true);
    expect(F.F09_PROMPT_LINEAGE.filter((l) => l.reconstructed).map((l) => l.id)).toEqual(['L04', 'L05']);
    expect(new Set(F.F09_PROMPT_LINEAGE.map((l) => l.id)).size).toBe(F.F09_PROMPT_LINEAGE.length);
  });

  it('the verbatim founder briefs and every generator prompt are on disk', () => {
    for (const b of F09_FORENSICS_BRIEFS) {
      expect(exists(b.file), b.file).toBe(true);
      const sprint = F.F09_PROMPT_LINEAGE.find((l) => l.id === b.lineage)!.sprint;
      expect(read(b.file).slice(0, 200)).toContain(sprint);
    }
    expect(read(F09_FORENSICS_AUDIT_BRIEF)).toContain(F.F09_FORENSICS_SPRINT);
    expect(F09_FORENSICS_GENERATOR_PROMPTS).toHaveLength(12);
    for (const p of F09_FORENSICS_GENERATOR_PROMPTS) expect(exists(p.file), p.file).toBe(true);
  });
});

describe('evidence says what the audit claims', () => {
  it('approved JURNL images are image2image from the approved world; the text-only attempt was invalidated', () => {
    const SR = F.F09_STRONGEST_REFERENCES;
    for (const p of [SR.approved_world, SR.design_system, ...SR.same_world_family_parents.map((x) => x.replace(/ \(.*\)$/, ''))]) expect(exists(p), p).toBe(true);
    expect(read('src/projects/jurnl/families/F03_TODAY/MANIFEST/F03_GENERATION_LEDGER.json')).toMatch(/REFERENCE_BINDING_FAILURE_F02_F03_2026[\s\S]*TEXT ONLY\. NOT THE REFERENCE WORLD\.|TEXT ONLY\. NOT THE REFERENCE WORLD\.[\s\S]*REFERENCE_BINDING_FAILURE_F02_F03_2026/);
  });

  it('the world was excluded and its signature banned (RC01, RC03)', () => {
    expect(read('JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1/F09_RENDER_CONTAMINATION_GUARD.json')).toContain('JURNL F01 entry / journal / onboarding references');
    const t01 = read('JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/SUNBURST_PROMPTS/T01_OPEN_FLOOR.txt');
    expect(t01).toContain('arched panels or arches');
    expect(t01).toContain('sea-view balconies');
    expect(t01).toContain('a single justified plant');
    expect(t01).toContain('iPhone status bar');
  });

  it('the plate generator saw only the agent-drawn guide (RC02) and the assemblies used app chrome (RC05, RC07)', () => {
    expect(read('scripts/jurnl/f09-scene-plate-generate-one.py')).toContain('The attached image is the ONLY geometry authority');
    expect(exists('JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1/PLATE_GUIDES/F09_T01_PLATE_GUIDE_9x16.png')).toBe(true);
    expect(read('scripts/jurnl/f09-three-distinct-composite-rerun.mjs')).toMatch(/border-style:dashed/);
    expect(read('scripts/jurnl/f09-hybrid-composite-assemble.mjs')).toContain('9:41');
  });

  it('self-certified QA passed while the founder rejected (RC06)', () => {
    expect(JSON.parse(read('JURNL/F09_SAFE/THREE_DISTINCT_COMPOSITE_AUTHORITY_RERUN1/RERUN1_REPORT.json')).pass).toBe(true);
    expect(read('JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/README.md')).toContain('19/19');
  });
});

describe('measurements reproduce from the sources', () => {
  const m = buildF09DensityMeasurement();

  it('brief creative shares and process / QA / render / negative shares', () => {
    expect(m.summary.briefs_creative_share).toEqual(F.F09_DENSITY.briefs_creative_share);
    for (const [k, v] of Object.entries(F.F09_DENSITY.briefs_process_qa_render_negative_share)) {
      const s = m.briefs[k]!.share;
      expect((s.PROCESS ?? 0) + (s.QA_GATES ?? 0) + (s.RENDER_MECHANICS ?? 0) + (s.NEGATIVE ?? 0), k).toBeCloseTo(v, 1);
    }
  });

  it('generator shares and polarity', () => {
    expect(m.summary.sunburst_avg_share.creative).toBe(F.F09_DENSITY.sunburst_prompt.creative_share);
    expect(m.summary.sunburst_avg_share.product_ui_text_logo).toBe(F.F09_DENSITY.sunburst_prompt.product_ui_text_logo_share);
    expect(m.summary.plate_avg_share.placeholder).toBe(F.F09_DENSITY.plate_prompt.placeholder_share);
    expect(m.summary.scene_avg_share.creative).toBe(F.F09_DENSITY.regen_scene_prompt.creative_share);
    for (const [k, v] of Object.entries(F.F09_NEGATIVE_SATURATION.founder_briefs)) {
      const p = m.briefs[k]!.line_polarity;
      expect(v.match(/\d+/g)!.map(Number), k).toEqual([p.creative_positive_lines, p.negative_lines]);
    }
    const sb = m.generators['JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/SUNBURST_PROMPTS/T01_OPEN_FLOOR.txt']!.clause_polarity;
    expect(F.F09_NEGATIVE_SATURATION.sunburst_prompt).toBe(`${sb.negative_clauses} of ${sb.clauses} clauses negative (${Math.round(sb.negative_share * 100)} %); ${sb.negation_tokens} negation tokens`);
  });

  it('the instruction inventory is complete, unmerged and classified into the 21 categories', () => {
    const inv = buildF09InstructionInventory();
    expect(INSTRUCTION_CATEGORIES).toHaveLength(21);
    expect(inv.items.length).toBeGreaterThan(2000);
    for (const i of inv.items) expect(INSTRUCTION_CATEGORIES).toContain(i.category);
    for (const [f, c] of Object.entries(inv.counts)) expect(c.instructions, f).toBeGreaterThan(0);
    // three near-identical Sunburst prompts each keep their own items
    const sunburst = inv.items.filter((i) => i.lineage === 'L02b');
    expect(new Set(sunburst.map((i) => i.file)).size).toBe(3);
    expect(classifyInstruction('- use OpenArt', 'DO NOT:')).toBe('ANTI_FAILURE');
    expect(classifyInstruction('[ ] three territories authored')).toBe('QA');
    expect(classifyInstruction('Deterministic UI owns product truth.')).toBe('DETERMINISTIC_UI');
  });
});

describe('findings', () => {
  const lineageIds = new Set(F.F09_PROMPT_LINEAGE.map((l) => l.id));

  it('21 contradictions with severity, all citing real lineage entries', () => {
    expect(F.F09_CONTRADICTIONS).toHaveLength(21);
    const sev = (s: string) => F.F09_CONTRADICTIONS.filter((c) => c.severity === s).length;
    expect([sev('CRITICAL'), sev('HIGH'), sev('MEDIUM'), sev('LOW')]).toEqual([2, 13, 5, 1]);
    for (const c of F.F09_CONTRADICTIONS) for (const s of c.sources.filter((x) => /^L\d/.test(x))) expect(lineageIds.has(s), `${c.id} ${s}`).toBe(true);
    for (const r of F.F09_FORENSICS_TABLE) for (const c of r.contradictions) expect(F.F09_CONTRADICTIONS.some((x) => x.id === c), `${r.prompt} ${c}`).toBe(true);
  });

  it('root causes are ranked, classed and carry confidence; the failure map points at them', () => {
    expect(F.F09_ROOT_CAUSES.map((r) => r.rank)).toEqual(F.F09_ROOT_CAUSES.map((_, i) => i + 1));
    for (const r of F.F09_ROOT_CAUSES) {
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(r.confidence);
      expect(r.evidence.length).toBeGreaterThan(0);
      for (const c of r.classes) expect(Object.keys(PROMPT_FAILURE_CLASSES)).toContain(c);
    }
    expect(F.F09_ROOT_CAUSES[0]!.classes).toContain('PROMPT_OMISSION');
    expect(F.F09_ROOT_CAUSES.some((r) => r.classes.includes('MODEL_RENDERER_LIMITATION') && r.rank <= 5)).toBe(false);
    const ids = new Set(F.F09_ROOT_CAUSES.map((r) => r.id));
    for (const [k, v] of Object.entries(F.F09_FAILURE_MAP)) for (const id of v) expect(ids.has(id), `${k} ${id}`).toBe(true);
  });

  it('survival verdicts, freedom budget and rule dispositions', () => {
    expect(F.F09_SURVIVAL.three_territory_model.verdict).toBe('REFINE');
    expect(F.F09_SURVIVAL.plates.verdict).toBe('REMOVE');
    expect(F.F09_SURVIVAL.deterministic_ui.verdict).toBe('NARROW');
    expect(F.F09_SURVIVAL.sunburst.verdict).toBe('NO');
    expect(F.F09_FREEDOM_BUDGET.environment!.level).toBe('LOCKED');
    expect(F.F09_FREEDOM_BUDGET.nav!.level).toBe('LOCKED');
    expect(F.F09_FREEDOM_BUDGET.primary_object!.level).toBe('FREE');
    const rules = F.F09_RULE_DISPOSITIONS.map((r) => r.rule);
    for (const r of ['REFERENCE = DESIGN AUTHORITY', 'THREE TERRITORIES', 'RAW PLATES', 'DETERMINISTIC UI', 'COMPOSITE AUTHORITY', 'NO DEVICE CHROME', 'BLUR TEST', 'ANTI-TEMPLATE TEST', 'METAPHOR CONTAINMENT', 'FIXED PRODUCT PAYLOAD']) expect(rules, r).toContain(r);
    expect(F.F09_RULE_DISPOSITIONS.find((r) => r.rule === 'CENTER_STAGE for F09')!.disposition).toBe('FOUNDER_DECISION');
  });

  it('architecture, device chrome and next-sprint spec', () => {
    expect(PROMPT_ARCHITECTURE.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(PROMPT_ARCHITECTURE[0]!.id).toBe('REFERENCE_AUTHORITY');
    expect(GENERATOR_PROMPT_BUDGET.max_words).toBeLessThanOrEqual(300);
    expect(DEVICE_CHROME_RULE.excluded.join(' ')).toMatch(/status bar[\s\S]*home indicator/);
    expect(F.F09_NEXT_SPRINT_SPEC.must_not.join(' ')).toMatch(/status bar/);
    expect(F.F09_NEXT_SPRINT_SPEC.must.join(' ')).toMatch(/F01\.00 WELCOME APPROVED/);
    expect(F.F09_MISSING_LOGIC.length).toBeGreaterThanOrEqual(10);
    expect(F.F09_FOUNDER_DECISIONS_REQUIRED.map((d) => d.id)).toEqual(['D-F09-COMPOSITION-MODE', 'D-F09-WORLD-AUTHORITY', 'D-F09-AVAILABLE-DATE-FORMULA']);
  });
});

describe('addendum: the regen run as evidence', () => {
  const REGEN = 'JURNL/F09_SAFE/THREE_CONCEPT_ART_DIRECTION_REGEN_CORRECTION1';

  it('the degraded-asset facts are on disk: previews → canvas-size proofs under a founder-review name', () => {
    const report = JSON.parse(read(`${REGEN}/LAYOUT_PROOF/ASSEMBLY_REPORT.json`));
    expect(report.proof).toBe(true);
    expect(report.territories.map((t: { scene_px: string }) => t.scene_px)).toEqual(['144×256', '144×256', '144×256']);
    const asm = read('scripts/jurnl/f09-art-direction-regen-assemble.mjs');
    expect(asm).toContain('_preview_144x256.jpg');
    expect(asm).toContain('THREE CONCEPT CANDIDATES');
    expect(exists(`${REGEN}/LAYOUT_PROOF/F09_FOUNDER_REVIEW_BOARD.png`)).toBe(true);
    expect(JSON.parse(read(`${REGEN}/REGEN_RENDER_LEDGER.json`)).resolution_exception).toMatch(/×1\.66/);
    expect(read('shared/studioos-visual-authority/creative-direction.ts')).toMatch(/without a recorded exception/);
  });

  it('the asset quality gate blocks what the run did and passes the canonical JURNL 4K', () => {
    const [proof, review, internal, canonical] = F.F09_ASSET_QUALITY_CASES.map((c) => c.result);
    expect(proof).toMatchObject({ upscale: 9.98, highest_permitted: 'WIREFRAME_ONLY', verdict: 'BLOCK' });
    expect(review).toMatchObject({ upscale: 1.66, verdict: 'BLOCK' });
    expect(internal).toMatchObject({ highest_permitted: 'LAYOUT_PROOF', verdict: 'PASS' });
    expect(canonical).toMatchObject({ upscale: 0.71, highest_permitted: 'AUTHORITY_CANDIDATE', verdict: 'PASS' });
    expect(F.F09_REFERENCE_INPUT_CASES.map((c) => c.passes)).toEqual([true, false]);
    // an approved exception admits 1.66× only when the founder sets the ceiling before compositing
    expect(assessAssetQuality({ source_px: { w: 864, h: 1536 }, covers_pt: { w: 393, h: 852 }, review_scale: 3, provenance: 'FULL_RENDER', purpose: 'FOUNDER_REVIEW_EXCEPTION', founder_facing: true, founder_exception: { approved: true, max_upscale: 1.7 } }).verdict).toBe('PASS');
    for (const k of ['SOURCE_RESOLUTION_RULE', 'UPSCALE_RULE', 'FOUNDER_REVIEW_THRESHOLD', 'LAYOUT_PROOF_THRESHOLD', 'BLOCK_CONDITION', 'NO_DEGRADED_ASSET_RULE']) expect(ASSET_QUALITY_GATE).toHaveProperty(k);
    expect(F.F09_PREVIEW_ACCEPTANCE_ANSWER.not_the_answer).toMatch(/network/);
    expect(F.F09_PREVIEW_ACCEPTANCE_ANSWER.missing_rule).toMatch(/NO-DEGRADED-ASSET RULE/);
  });

  it('the shared product skeleton is real: same logo, CTA, purchase and nav coordinates; full-stage CTA from one helper', () => {
    const asm = read('scripts/jurnl/f09-art-direction-regen-assemble.mjs');
    for (const x of ['logo(22, 24, 50)', 'logo(x, 24, 50)', 'cta(628)', 'cta(620)', 'purchase(686', 'purchase(678', 'nav(770', 'nav(772']) expect(asm, x).toContain(x);
    const bp = read('shared/studioos-visual-authority/projects/jurnl/f09-composition-blueprint.ts');
    expect(bp).toMatch(/zone_id: `\$\{t\}\.CTA`, role: 'CTA', layer: 'L5', rect: r\(G\.stage\.x, y, G\.stage\.w, h\)/);
    expect(bp).toContain('identical on every F09 page');
    expect(F.F09_DETERMINISTIC_SCOPE_AUDIT.expanded).toBe(true);
    expect(F.F09_ELEMENT_FREEDOM_MATRIX.find((e) => e.element === 'nav')!.move).toBe('NO');
    expect(F.F09_ELEMENT_FREEDOM_MATRIX.find((e) => e.element === 'primary CTA')!.move).not.toBe('NO');
    expect(ANTI_GENERIC_TEST.map((t) => t.id)).toContain('CONCEPT_SKELETON');
  });

  it('new root causes are ranked into the map with the requested categories', () => {
    const ids = F.F09_ROOT_CAUSES.map((r) => r.id);
    expect(ids.slice(0, 5)).toEqual(['RC01', 'RC02', 'RC03', 'RC04', 'RC13']);
    expect(ids).toEqual(expect.arrayContaining(['RC14', 'RC15']));
    expect(F.F09_REGEN_ROOT_CAUSE_MAP.map((r) => r.category)).toEqual(['PROMPT CONTRADICTION', 'PROMPT OMISSION', 'OVER-CONSTRAINT', 'RENDER-OWNERSHIP ERROR', 'ASSET-QUALITY GUARD FAILURE', 'PIPELINE ORDER FAILURE', 'REFERENCE / BRAND-WORLD UNDER-SPECIFICATION']);
    for (const r of F.F09_REGEN_ROOT_CAUSE_MAP) for (const ref of r.refs) expect(ids.includes(ref) || F.F09_CONTRADICTIONS.some((c) => c.id === ref), ref).toBe(true);
    expect(F.F09_JURNL_WORLD_GRAMMAR.grammar.map((g) => g.id)).toEqual(expect.arrayContaining(['ONE_PLACE', 'INSIDE_VIEWPOINT', 'SPLIT_FRAME', 'CURATED_STILL_LIFE', 'COUNTER_COLOUR']));
    expect(F.F09_BLOCKED_RUN_AUDIT.should_have_produced_visual).toMatch(/^NO founder-facing visual/);
  });
});

describe('analysis only', () => {
  it('nothing generated or implemented; generation paused; not ready to rewrite before founder decisions', () => {
    expect(F.F09_FORENSICS_VERDICT.generation_performed).toBe(false);
    expect(F.F09_FORENSICS_VERDICT.implementation_performed).toBe(false);
    expect(F.F09_FORENSICS_VERDICT.PROMPT_SYSTEM_ROOT_CAUSE_IDENTIFIED).toBe(true);
    expect(F.F09_FORENSICS_VERDICT.READY_TO_REWRITE_F09_GENERATION_PROMPT).toBe(false);
    expect(F.F09_GENERATION_PAUSED.paused).toBe(true);
    const files = readdirSync(path.join(ROOT, F.F09_FORENSICS_DIR), { recursive: true }).map(String);
    expect(files.filter((f) => /\.(png|jpe?g|webp|zip)$/i.test(f))).toEqual([]);
  });
});

describe('exports', () => {
  it('are in sync and the report covers sections 1–51', () => {
    const files = buildF09PromptForensicsExports();
    for (const [name, body] of Object.entries(files)) expect(read(`${F.F09_FORENSICS_DIR}/${name}`), name).toBe(body);
    const report = files['F09_PROMPT_FORENSICS_REPORT.md']!;
    for (let n = 1; n <= 51; n++) expect(report, `§${n}`).toMatch(new RegExp(`^## ${n}\\. `, 'm'));
    expect(buildF09FinalReport()).toMatch(/ASSET QUALITY GATING:\nSOURCE_RESOLUTION_RULE[\s\S]*NO-DEGRADED-ASSET RULE[\s\S]*WHY WAS A 144×256 PREVIEW ACCEPTED\?/);
    expect(buildF09FinalReport()).toMatch(/PROMPT_SYSTEM_ROOT_CAUSE_IDENTIFIED YES\nREADY_TO_REWRITE_F09_GENERATION_PROMPT NO/);
    expect(read(`${F.F09_FORENSICS_DIR}/README.md`)).toMatch(/F09 visual generation is paused/);
  });
});
