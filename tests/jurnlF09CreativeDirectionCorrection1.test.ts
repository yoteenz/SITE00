/**
 * P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1 — creative-direction + brand-expression gates.
 * Proves: the gate layer exists and is project-specific; the three F09 structural territories are preserved and translated;
 * every translation is CREATIVE_DIRECTION_READY + BRAND_EXPRESSION_READY; directions are artistically distinct; prompts carry
 * all required sections and only locked text; local renders can never be final; AIO IFTA is the only grandfathered family;
 * nothing is generated, implemented or decided yet; exports are in sync.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BRAND_EXPRESSION_CHECKLIST,
  CREATIVE_DIRECTION_FIELDS,
  CREATIVE_DIRECTION_GRANDFATHERED,
  GENERATION_LOCKS,
  JURNL_CREATIVE_DIRECTION_PROFILE,
  checkCandidateAuthority,
  checkCreativeDirection,
  checkCreativeDirectionProfile,
  checkCreativeDistinctness,
  creativeDirectionRequired,
  evaluateAuthorityGate,
  jurnlF09,
  jurnlF09CD,
  type CreativeDirectionProfile,
  type GeneratedCandidate,
} from '../shared/studioos-visual-authority/index';
import { buildJurnlF09CreativeExports } from '../scripts/studioos/jurnl-f09-creative-direction-export';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const T = jurnlF09.JURNL_F09_TERRITORIES;
const CD = jurnlF09CD.JURNL_F09_CREATIVE_DIRECTIONS;

describe('methodology gate', () => {
  it('JURNL has a project-specific profile; a universal or foreign profile fails', () => {
    expect(checkCreativeDirectionProfile(JURNL_CREATIVE_DIRECTION_PROFILE).status).toBe('PROFILE_READY');
    const generic: CreativeDirectionProfile = { ...JURNL_CREATIVE_DIRECTION_PROFILE, profile_id: 'GENERIC.LUXURY' };
    expect(checkCreativeDirectionProfile(generic).status).toBe('PROFILE_REQUIRED');
    const foreign: CreativeDirectionProfile = { ...JURNL_CREATIVE_DIRECTION_PROFILE, project_id: 'AIO' };
    expect(checkCreativeDirection(CD[0], T[0]!, foreign).status).toBe('CREATIVE_DIRECTION_REQUIRED');
  });

  it('only AIO IFTA is grandfathered; JURNL F09 must pass the layer', () => {
    expect(CREATIVE_DIRECTION_GRANDFATHERED.map((g) => `${g.project_id}:${g.feature_id}`)).toEqual(['AIO:AIO.IFTA']);
    expect(creativeDirectionRequired('JURNL', 'JURNL.SAFE_TO_SPEND')).toBe(true);
    expect(creativeDirectionRequired('AIO', 'AIO.IFTA')).toBe(false);
  });

  it('a structurally complete family without creative direction stops at CREATIVE_DIRECTION_REQUIRED (gate integration)', () => {
    const contract = { ...jurnlF09.jurnlF09GateInput() };
    // Exercise the creative step directly: territories + references exist, translation absent.
    const status = jurnlF09CD.jurnlF09CreativeStatus().previous_round_gate;
    expect(status.status).toBe('CREATIVE_DIRECTION_REQUIRED');
    expect(evaluateAuthorityGate(contract).state).toBe('EXPERIENCE_REQUIRED'); // F09 still has no Brain contract
  });

  it('a local HTML/CSS render can never be the final candidate', () => {
    const local: GeneratedCandidate = { ...jurnlF09CD.PREVIOUS_ROUND_CANDIDATES[0]!, translation_id: CD[0]!.translation_id };
    const r = checkCandidateAuthority({ territory: T[0]!, profile: JURNL_CREATIVE_DIRECTION_PROFILE, translation: CD[0], brand_expression: jurnlF09CD.JURNL_F09_BRAND_EXPRESSION[0], candidate: local, audit: { candidate_id: local.candidate_id, territory_id: local.territory_id, flags: [], typography_defects: [] } });
    expect(r.status).toBe('RENDERER_MISMATCH');
  });

  it('a material anti-AI flag or an unrepaired typography defect blocks authority', () => {
    const c: GeneratedCandidate = { candidate_id: 'x', territory_id: T[0]!.territory_id, translation_id: CD[0]!.translation_id, model: 'gpt-image-2.5-sunburst', quality: '4K', aspect_ratio: '9:16', auto_enhance: false, generation_mode: 'REFERENCE_GUIDED', provider: 'OpenArt', local_render: false, image_path: 'x.png', prompt_path: CD[0]!.prompt_path };
    const base = { territory: T[0]!, profile: JURNL_CREATIVE_DIRECTION_PROFILE, translation: CD[0], brand_expression: jurnlF09CD.JURNL_F09_BRAND_EXPRESSION[0], candidate: c };
    expect(checkCandidateAuthority({ ...base, audit: { candidate_id: 'x', territory_id: c.territory_id, flags: [{ flag: 'CARD_STACK_DRIFT', severity: 'MATERIAL', note: 'n' }], typography_defects: [] } }).status).toBe('ANTI_AI_FAILURE');
    expect(checkCandidateAuthority({ ...base, audit: { candidate_id: 'x', territory_id: c.territory_id, flags: [], typography_defects: [{ defect: 'MUTATED_WORDMARK', text: 'JRUNL', repaired: false, repair: '' }] } }).status).toBe('TYPOGRAPHY_FAILURE');
    expect(checkCandidateAuthority({ ...base, audit: { candidate_id: 'x', territory_id: c.territory_id, flags: [{ flag: 'GENERIC_MEDITERRANEAN', severity: 'MINOR', note: 'n' }], typography_defects: [{ defect: 'MUTATED_WORDMARK', text: 'JRUNL', repaired: true, repair: 'official logo composited' }] } }).status).toBe('REFERENCE_AUTHORITY_READY');
    expect(checkCandidateAuthority({ ...base, candidate: { ...c, quality: '2048px' }, audit: { candidate_id: 'x', territory_id: c.territory_id, flags: [], typography_defects: [] } }).status).toBe('RENDERER_MISMATCH');
  });
});

describe('F09 translations', () => {
  it('preserve the three structural territories (same ids and primary objects)', () => {
    expect(CD.map((c) => c.territory_id)).toEqual(T.map((t) => t.territory_id));
    CD.forEach((c, i) => expect(c.primary_object).toBe(T[i]!.primary_object));
  });

  it('are CREATIVE_DIRECTION_READY and BRAND_EXPRESSION_READY with a recorded bespoke idea', () => {
    const s = jurnlF09CD.jurnlF09CreativeStatus();
    expect(s.creative_direction.map((c) => c.status)).toEqual(['CREATIVE_DIRECTION_READY', 'CREATIVE_DIRECTION_READY', 'CREATIVE_DIRECTION_READY']);
    expect(s.brand_expression.map((c) => c.status)).toEqual(['BRAND_EXPRESSION_READY', 'BRAND_EXPRESSION_READY', 'BRAND_EXPRESSION_READY']);
    for (const c of CD) {
      expect(c.bespoke_visual_idea.length).toBeGreaterThan(80);
      expect(Object.keys(c.fields).sort()).toEqual([...CREATIVE_DIRECTION_FIELDS].sort());
      expect(Object.keys(c.locks).sort()).toEqual([...GENERATION_LOCKS].sort());
    }
    for (const b of jurnlF09CD.JURNL_F09_BRAND_EXPRESSION) expect(Object.keys(b.items).sort()).toEqual([...BRAND_EXPRESSION_CHECKLIST].sort());
  });

  it('differ artistically on all ten creative dimensions', () => {
    const d = checkCreativeDistinctness(jurnlF09CD.JURNL_F09_CREATIVE_DISTINCTNESS);
    expect(d.status).toBe('CREATIVE_DIRECTIONS_DISTINCT');
    for (const p of d.pairs) expect(p.differing).toHaveLength(10);
  });

  it('keep JURNL hard rules in every translation: uppercase locked text, no circular controls, nav preserved, logo never in the chrome', () => {
    for (const c of CD) {
      for (const t of c.text_must_render) expect(t).toBe(t.toUpperCase());
      expect(c.text_must_render).toEqual(expect.arrayContaining(['HOME', 'MONEY', 'PLAN', 'CREDIT', 'SAFE TO SPEND', '$24,885', 'SEE THE FULL BREAKDOWN']));
      expect(c.forbidden_elements.join(' ')).toMatch(/circular/i);
      expect(c.fields.logo_behavior).toMatch(/never in the chrome/i);
    }
  });
});

describe('Sunburst prompts', () => {
  it('carry every required section and the exact locked text, and the renderer settings', () => {
    for (const c of CD) {
      const p = jurnlF09CD.buildSunburstPrompt(c);
      for (const s of jurnlF09CD.SUNBURST_PROMPT_SECTIONS) expect(p).toContain(`## ${s}\n`);
      for (const t of c.text_must_render) expect(p).toContain(`"${t}"`);
      expect(p).toMatch(/gpt-image-2\.5-sunburst · quality 4K · aspect ratio 9:16 · auto-enhance OFF/);
      expect(p.indexOf('## IMAGE')).toBe(0);
    }
  });
});

describe('state of the round', () => {
  it('nothing generated, nothing decided, nothing implemented; corrected round waits only on candidates', () => {
    expect(jurnlF09CD.JURNL_F09_CORRECTED_CANDIDATES).toHaveLength(0);
    expect(jurnlF09CD.JURNL_F09_CD_GENERATION_LEDGER.primary_generations).toBe(0);
    expect(jurnlF09CD.JURNL_F09_CD_GENERATION_LEDGER.openart_accessed).toBe(false);
    expect(jurnlF09CD.jurnlF09CreativeStatus().gate.status).toBe('CANDIDATE_REQUIRED');
    for (const t of T) expect(t.founder_decision).toBeNull();
    for (const f of ['README.md', 'COMPOSITION_LOCKS/F09_COMPOSITION_LOCK_BOARD.png', 'COMPOSITION_LOCKS/F09_T01_SURVEYED_COURTYARD_VALUE_STUDY_9x16.png']) {
      expect(existsSync(path.join(ROOT, jurnlF09CD.JURNL_F09_CD_DIR, f)), f).toBe(true);
    }
    const runtime = read('src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx');
    expect(runtime).not.toContain('CREATIVE_DIRECTION_CORRECTION1');
  });

  it('exports are in sync with the TypeScript source', () => {
    for (const [name, body] of Object.entries(buildJurnlF09CreativeExports())) expect(read(`${jurnlF09CD.JURNL_F09_CD_DIR}/${name}`), name).toBe(body);
  });
});
