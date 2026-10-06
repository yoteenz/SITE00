/**
 * P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1 — export the F09 prompt-forensics audit.
 * Single sources: shared/studioos-visual-authority/prompt-forensics.ts (method) and
 * shared/studioos-visual-authority/projects/jurnl/f09-prompt-forensics.ts (findings). The instruction inventory and the
 * density / polarity measurements are computed here from the verbatim briefs (SOURCES/) and the generator prompt files.
 *
 *   npx tsx scripts/studioos/jurnl-f09-prompt-forensics-export.ts
 *
 * Analysis only: nothing here generates an image or touches the JURNL runtime.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  ANTI_ASSEMBLY_TEST,
  ANTI_GENERIC_TEST,
  CONCEPT_DELIVERY_CONTRACT,
  DEVICE_CHROME_RULE,
  FULLY_AUTHORED_DEFINITION,
  GENERATOR_PROMPT_BUDGET,
  INSTRUCTION_CATEGORIES,
  PROMPT_ARCHITECTURE,
  PROMPT_FAILURE_CLASSES,
  PROMPT_FORENSICS_PROCEDURE,
  PROMPT_PRIORITY_TIERS,
  REFERENCE_CONSUMPTION_TEST,
  RENDERER_BLAME_RULE,
  classifyInstruction,
  jurnlF09Forensics as F,
  type InstructionCategory,
} from '../../shared/studioos-visual-authority/index.js';

const DIR = F.F09_FORENSICS_DIR;
const SRC = `${DIR}/SOURCES`;
const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, sprint: F.F09_FORENSICS_SPRINT, generated_by: 'scripts/studioos/jurnl-f09-prompt-forensics-export.ts', analysis_only: true });
const read = (p: string) => readFileSync(p, 'utf8');
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const isUpper = (s: string) => /[A-Za-z]/.test(s) && s === s.toUpperCase();
const onlyRule = (s: string) => /^=+$/.test(s);
const round2 = (n: number) => Math.round(n * 100) / 100;

/* ─────────────── sources ─────────────── */

export const F09_FORENSICS_BRIEFS = [
  { lineage: 'L01', file: `${SRC}/01_VISUAL-AUTHORITY-3-TERRITORY-PROOF1.founder-brief.txt` },
  { lineage: 'L02', file: `${SRC}/02_CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1.founder-brief.txt` },
  { lineage: 'L03', file: `${SRC}/03_COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1.founder-brief.txt` },
  { lineage: 'L06', file: `${SRC}/06_THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1.founder-brief.txt` },
] as const;
/** The audit's own brief: kept for traceability, not part of the F09 generation lineage. */
export const F09_FORENSICS_AUDIT_BRIEF = `${SRC}/07_PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1.founder-brief.txt`;

const T = ['T01', 'T02', 'T03'] as const;
export const F09_FORENSICS_GENERATOR_PROMPTS = [
  ...['T01_OPEN_FLOOR', 'T02_PLAIN_ANSWER', 'T03_OPEN_ENVELOPE'].map((n) => ({ lineage: 'L02b', format: 'SECTIONS' as const, file: `JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/SUNBURST_PROMPTS/${n}.txt` })),
  ...['T01_OPEN_FLOOR', 'T02_PLAIN_ANSWER', 'T03_OPEN_ENVELOPE'].map((n) => ({ lineage: 'L02d', format: 'SECTIONS' as const, file: `JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/CHATGPT_PROMPTS/${n}_CHATGPT.txt` })),
  ...T.map((t) => ({ lineage: 'L03a', format: 'SECTIONS' as const, file: `JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1/PLATE_PROMPTS/${t}_SCENE_PLATE.txt` })),
  ...['T01_SURVEYED_COURTYARD', 'T02_ANSWER_IN_RAKING_LIGHT', 'T03_SORTING_RACK'].map((n) => ({ lineage: 'L06a', format: 'LABELS' as const, file: `JURNL/F09_SAFE/THREE_CONCEPT_ART_DIRECTION_REGEN_CORRECTION1/SCENE_PROMPTS/${n}.txt` })),
];

/* ─────────────── 3. instruction inventory ─────────────── */

/** Brief 06 uses standalone uppercase headings (no rules); same list as the density measurement. */
const BRIEF_06_HEADINGS = ['CONVERSATION CONTEXT', 'FOUNDER DECISION', 'SUPERSEDES', 'DO NOT REGRESS', 'KNOWN FAILURE', 'MOTHERBOARD INTENT', 'OBJECTIVE', 'THE 3 TERRITORIES', 'QUALITY BAR', 'STRICT CREATIVE REQUIREMENTS', 'GLOBAL', 'VISUAL WORLD', 'TYPOGRAPHY / LOGO', 'PRODUCT EXPRESSION', 'CONCEPT-SPECIFIC INTENT', 'RENDERER / EXECUTION RULE', 'CRITICAL PIPELINE RULE', 'DELIVERABLES', 'SUCCESS CRITERIA', 'FAIL CONDITIONS'];
const CONTEXT_SECTION = /CONVERSATION CONTEXT|KNOWN FAILURE|SUPERSEDES|WHY THIS SPRINT/i;

export type InventoryItem = { id: string; lineage: string; file: string; section: string; subsection: string; kind: 'INSTRUCTION' | 'CONTEXT'; category: InstructionCategory; text: string };

function briefItems(lineage: string, file: string): InventoryItem[] {
  const lines = read(file).split(/\r?\n/);
  const out: InventoryItem[] = [];
  let section = 'PREAMBLE';
  let subsection = '';
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i]!.trim();
    if (!s || onlyRule(s)) continue;
    const prev = (lines[i - 1] ?? '').trim();
    const next = (lines[i + 1] ?? '').trim();
    if ((onlyRule(prev) && onlyRule(next)) || (lineage === 'L06' && isUpper(s) && s.length < 45 && BRIEF_06_HEADINGS.some((h) => s.startsWith(h)))) {
      section = s;
      subsection = '';
      continue;
    }
    if (isUpper(s) && words(s) < 9 && s.endsWith(':') && !/^[-[]/.test(s)) {
      subsection = s.replace(/:$/, '');
      continue;
    }
    const kind = CONTEXT_SECTION.test(section) ? 'CONTEXT' : 'INSTRUCTION';
    out.push({ id: `${lineage}-${String(out.length + 1).padStart(3, '0')}`, lineage, file, section, subsection, kind, category: classifyInstruction(s, `${section} ${subsection}`), text: s });
  }
  return out;
}

const SENTENCE = /(?<=[.!?])\s+(?=[A-Z0-9"“(])/;

function promptItems(lineage: string, file: string, format: 'SECTIONS' | 'LABELS', start: number): InventoryItem[] {
  const out: InventoryItem[] = [];
  const tag = file.split('/').pop()!.replace(/\.txt$/, '');
  const push = (section: string, text: string) => {
    for (const t of text.split(SENTENCE).map((x) => x.trim()).filter((x) => words(x) >= 2)) {
      out.push({ id: `${lineage}-${tag}-${String(start + out.length + 1).padStart(3, '0')}`, lineage, file, section, subsection: '', kind: 'INSTRUCTION', category: classifyInstruction(t, section), text: t });
    }
  };
  let section = 'PREAMBLE';
  for (const raw of read(file).split(/\r?\n/)) {
    const s = raw.trim();
    if (!s) continue;
    const h = /^## (.+)$/.exec(s);
    if (h) { section = h[1]!.trim(); continue; }
    const label = format === 'LABELS' ? /^([A-Z][A-Z ,]+):\s*(.*)$/.exec(s) : null;
    if (label) { section = label[1]!.trim(); if (label[2]) push(section, label[2]); continue; }
    push(section, s.replace(/^-\s*/, ''));
  }
  return out;
}

export function buildF09InstructionInventory() {
  const items: InventoryItem[] = [
    ...F09_FORENSICS_BRIEFS.flatMap((b) => briefItems(b.lineage, b.file)),
    ...F09_FORENSICS_GENERATOR_PROMPTS.flatMap((p) => promptItems(p.lineage, p.file, p.format, 0)),
  ];
  const files = [...F09_FORENSICS_BRIEFS.map((b) => b.file), ...F09_FORENSICS_GENERATOR_PROMPTS.map((p) => p.file)];
  const counts = Object.fromEntries(files.map((f) => {
    const own = items.filter((i) => i.file === f && i.kind === 'INSTRUCTION');
    return [f, { instructions: own.length, context_lines: items.filter((i) => i.file === f && i.kind === 'CONTEXT').length, by_category: Object.fromEntries(INSTRUCTION_CATEGORIES.map((c) => [c, own.filter((i) => i.category === c).length]).filter(([, n]) => n)) }];
  }));
  const totals = Object.fromEntries(INSTRUCTION_CATEGORIES.map((c) => [c, items.filter((i) => i.kind === 'INSTRUCTION' && i.category === c).length]));
  return { items, counts, totals };
}

/* ─────────────── 9 + 20. density and polarity measurements ─────────────── */

const [Cr, Pt, Rm, Qg, Ng, Pr] = ['CREATIVE', 'PRODUCT_TRUTH', 'RENDER_MECHANICS', 'QA_GATES', 'NEGATIVE', 'PROCESS'] as const;
/** Section → bucket judgments for briefs 01–03 (first matching prefix wins; unmatched → PROCESS). */
export const F09_BRIEF_SECTION_BUCKETS: Record<'01' | '02' | '03', [string, string][]> = {
  '01': [['CONVERSATION', Pr], ['FOUNDER DECISION', Pr], ['SUPERSEDES', Pr], ['DO NOT REGRESS', Ng], ['KNOWN FAILURE', Pr], ['MOTHERBOARD', Pr], ['1.', Pr], ['2.', Ng], ['3.', Cr], ['4.', Pt], ['5.', Pr], ['6.', Cr], ['7.', Qg], ['8.', Pt], ['9.', Pt], ['10.', Pt], ['11.', Qg], ['12.', Pt], ['13.', Cr], ['14.', Pr], ['15.', Pr], ['16.', Rm], ['17.', Rm], ['18.', Cr], ['19.', Pr], ['20.', Pr], ['21.', Pr], ['22.', Ng], ['23.', Pr], ['24.', Qg], ['25.', Pr]],
  '02': [['CONVERSATION', Pr], ['FOUNDER DECISION', Cr], ['SUPERSEDES', Pr], ['DO NOT REGRESS', Ng], ['KNOWN FAILURE', Pr], ['MOTHERBOARD', Pr], ['1.', Pr], ['2.', Cr], ['3.', Cr], ['4.', Cr], ['5.', Cr], ['6.', Cr], ['7.', Ng], ['8.', Rm], ['9.', Rm], ['10.', Rm], ['11.', Qg], ['12.', Cr], ['13.', Cr], ['14.', Cr], ['15.', Cr], ['16.', Qg], ['17.', Qg], ['18.', Rm], ['19.', Rm], ['20.', Pr], ['21.', Qg], ['22.', Pr], ['23.', Cr], ['24.', Pr], ['25.', Pr], ['26.', Pr], ['27.', Qg], ['28.', Pr]],
  '03': [['CONVERSATION', Pr], ['FOUNDER DECISION', Pr], ['SUPERSEDES', Rm], ['DO NOT REGRESS', Ng], ['KNOWN FAILURE', Pr], ['MOTHERBOARD', Pr], ['1.', Qg], ['2.', Cr], ['3.', Rm], ['4.', Rm], ['5.', Rm], ['6.', Rm], ['7.', Rm], ['8.', Cr], ['9.', Cr], ['10.', Cr], ['11.', Cr], ['12.', Cr], ['13.', Cr], ['14.', Ng], ['15.', Ng], ['16.', Rm], ['17.', Rm], ['18.', Rm], ['19.', Pt], ['20.', Cr], ['21.', Qg], ['22.', Qg], ['23.', Rm], ['24.', Pr], ['25.', Qg], ['26.', Qg], ['27.', Ng], ['28.', Rm], ['29.', Pr], ['30.', Pr], ['31.', Qg], ['32.', Pr]],
};
export const F09_BRIEF_06_BUCKETS: [string, string][] = [['CONVERSATION CONTEXT', Pr], ['FOUNDER DECISION', Cr], ['SUPERSEDES', Pr], ['DO NOT REGRESS', Ng], ['KNOWN FAILURE', Pr], ['MOTHERBOARD INTENT', Pr], ['OBJECTIVE', Cr], ['THE 3 TERRITORIES', Cr], ['QUALITY BAR', Cr], ['STRICT CREATIVE REQUIREMENTS', Cr], ['GLOBAL', Pt], ['VISUAL WORLD', Cr], ['TYPOGRAPHY / LOGO', Cr], ['PRODUCT EXPRESSION', Pt], ['CONCEPT-SPECIFIC INTENT', Cr], ['RENDERER / EXECUTION RULE', Rm], ['CRITICAL PIPELINE RULE', Rm], ['DELIVERABLES', Pr], ['SUCCESS CRITERIA', Qg], ['FAIL CONDITIONS', Ng]];
export const F09_GENERATOR_SECTION_BUCKETS: Record<string, string> = {
  IMAGE: Cr, 'RENDER SETTINGS': Rm, 'JURNL BRAND WORLD': Cr, 'F09 PRODUCT JOB': Pt, 'TERRITORY STRUCTURE': Cr, 'PRIMARY OBJECT': Cr, 'MOBILE COMPOSITION': 'GEOMETRY_CHROME', 'LOGO / LOCKUP PLACEMENT': 'LOGO', 'SAFE TO SPEND SIGNAL': Pt, 'SECONDARY BREAKDOWN': Pt, ENVIRONMENT: Cr, MATERIALS: Cr, LIGHTING: Cr, 'GRAPHIC DESIGN ELEMENTS': Cr, 'TACTILE OBJECTS': Cr, 'BOTTOM NAV': 'PRODUCT_UI', CTA: 'PRODUCT_UI', 'ANTI-GENERIC RULES': Ng, 'ANTI-AI RULES': Ng, 'TEXT THAT MUST RENDER': 'EXACT_TEXT', 'TEXT THAT MAY BE REPRESENTATIONAL': 'EXACT_TEXT', 'FORBIDDEN ELEMENTS': Ng,
  PLATE: Rm, VIEW: Cr, SCENE: Cr, LIGHT: Cr, 'MATERIALS (no others)': Cr, 'BLANK SURFACES (left empty; exact typography and the real logo are added later)': 'PLACEHOLDER', GEOMETRY: 'GEOMETRY_CHROME', 'QUIET REGIONS (material and light only)': 'GEOMETRY_CHROME', 'MUST NOT CONTAIN': Ng,
};
const SCENE_LABEL_BUCKETS: Record<string, string> = { SUBJECT: Cr, COMPOSITION: Cr, 'COMPOSITION, TOP TO BOTTOM': Cr, LIGHT: Cr, PALETTE: Cr, MATERIALS: Cr, 'DO NOT INCLUDE': Ng };

const add = (o: Record<string, number>, k: string, n: number) => { o[k] = (o[k] ?? 0) + n; };
const shares = (o: Record<string, number>) => { const t = Object.values(o).reduce((a, b) => a + b, 0); return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, round2(v / t)])); };

function briefBuckets(file: string, sp: string): Record<string, number> {
  const t = read(file);
  const tot: Record<string, number> = {};
  if (sp === '06') {
    let cur: string = Pr;
    for (const line of t.split(/\r?\n/)) {
      const s = line.trim();
      const hit = F09_BRIEF_06_BUCKETS.find(([k]) => s === k) ?? (isUpper(s) && s.length < 45 ? F09_BRIEF_06_BUCKETS.find(([k]) => s.startsWith(k)) : undefined);
      if (hit) { cur = F09_BRIEF_06_BUCKETS.find(([k]) => s.startsWith(k))![1]; continue; }
      add(tot, cur, words(s));
    }
    return tot;
  }
  const parts = t.split(/\n=+\n(.+?)\n=+\n/);
  for (let i = 1; i < parts.length; i += 2) {
    const h = parts[i]!.trim();
    const b = F09_BRIEF_SECTION_BUCKETS[sp as '01'][(F09_BRIEF_SECTION_BUCKETS[sp as '01'].findIndex(([k]) => h.startsWith(k)))]?.[1] ?? Pr;
    add(tot, b, words(parts[i + 1]!));
  }
  return tot;
}

function generatorBuckets(file: string, format: 'SECTIONS' | 'LABELS'): Record<string, number> {
  const t = read(file);
  const tot: Record<string, number> = {};
  if (format === 'LABELS') {
    for (const para of t.split('\n\n')) add(tot, SCENE_LABEL_BUCKETS[para.split(':')[0]!.trim()] ?? Cr, words(para));
    return tot;
  }
  const secs = t.split(/^## (.+)$/m);
  for (let i = 1; i < secs.length; i += 2) add(tot, F09_GENERATOR_SECTION_BUCKETS[secs[i]!.trim()] ?? `OTHER:${secs[i]!.trim()}`, words(secs[i + 1]!));
  return tot;
}

const NEG_TOKEN = /\b(no|not|never|without|avoid|forbidden|don't|must not)\b/gi;
const CREATIVE_LINE = /(compos|environment|material|light|architect|mediterranean|editorial|typograph|logo|lockup|object|depth|texture|botanical|plaster|travertine|scene|world|wit|bespoke|artistic|graphic|space|tactile|richness|art direct)/i;

function clausePolarity(file: string) {
  const t = read(file);
  const clauses = t.split(/[.;\n·]/).map((c) => c.trim()).filter((c) => words(c) >= 3);
  const neg = clauses.filter((c) => new RegExp(NEG_TOKEN.source, 'i').test(c)).length;
  return { clauses: clauses.length, negative_clauses: neg, negative_share: round2(neg / clauses.length), negation_tokens: (t.match(NEG_TOKEN) ?? []).length };
}

function briefLinePolarity(file: string) {
  const lines = read(file).split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !onlyRule(l));
  let inBlock = false;
  let neg = 0;
  let pos = 0;
  for (const l of lines) {
    if (['DO NOT', 'FAIL CONDITIONS', 'Avoid:', 'Flag:', 'JURNL MUST NOT', 'The final result must not'].some((p) => l.startsWith(p))) { inBlock = true; continue; }
    if (isUpper(l) && words(l) < 9 && !l.startsWith('-') && !l.startsWith('[')) inBlock = false;
    const isNeg = inBlock || /^(-\s*)?(do not|don't|no |not |never|avoid)/i.test(l) || ` ${l} `.includes(' DO NOT ');
    if (isNeg) neg++;
    else if (CREATIVE_LINE.test(l) && !l.startsWith('[ ]')) pos++;
  }
  return { creative_positive_lines: pos, negative_lines: neg };
}

export function buildF09DensityMeasurement() {
  const briefs = Object.fromEntries(F09_FORENSICS_BRIEFS.map((b) => {
    const sp = b.file.split('/').pop()!.slice(0, 2);
    const buckets = briefBuckets(b.file, sp);
    return [b.lineage, { file: b.file, words_by_bucket: buckets, share: shares(buckets), line_polarity: briefLinePolarity(b.file) }];
  }));
  const generators = Object.fromEntries(F09_FORENSICS_GENERATOR_PROMPTS.filter((p) => p.lineage !== 'L02d').map((p) => {
    const buckets = generatorBuckets(p.file, p.format);
    return [p.file, { lineage: p.lineage, words: words(read(p.file)), words_by_bucket: buckets, share: shares(buckets), clause_polarity: clausePolarity(p.file) }];
  }));
  const avg = (lineage: string, k: string) => {
    const rows = Object.values(generators).filter((g) => g.lineage === lineage);
    return round2(rows.reduce((a, g) => a + (g.share[k] ?? 0), 0) / rows.length);
  };
  return {
    method: {
      briefs: 'Each founder-brief section is assigned one bucket (CREATIVE / PRODUCT_TRUTH / RENDER_MECHANICS / QA_GATES / NEGATIVE / PROCESS; the section → bucket tables are exported below as audit judgments) and its words counted.',
      generators: 'Each generator-prompt section (## heading, or LABEL: paragraph for scene prompts) is bucketed by its heading and its words counted. ChatGPT prompts duplicate the Sunburst sections and are not measured twice.',
      line_polarity: 'Brief lines inside DO NOT / FAIL / Avoid blocks or opening with a negation count as negative; other lines that name a creative subject (composition, environment, material, light, world …) count as creative-positive.',
      clause_polarity: 'Generator text split into clauses on . ; newline ·; a clause with no / not / never / without / avoid / forbidden / don’t / must not is negative.',
      bucket_tables: { briefs_01_03: F09_BRIEF_SECTION_BUCKETS, brief_06: F09_BRIEF_06_BUCKETS, generator_sections: F09_GENERATOR_SECTION_BUCKETS, scene_labels: SCENE_LABEL_BUCKETS },
    },
    briefs,
    generators,
    summary: {
      briefs_creative_share: Object.fromEntries(Object.entries(briefs).map(([k, v]) => [k, v.share[Cr] ?? 0])),
      sunburst_avg_share: { creative: avg('L02b', Cr), product_ui_text_logo: round2(avg('L02b', Pt) + avg('L02b', 'PRODUCT_UI') + avg('L02b', 'EXACT_TEXT') + avg('L02b', 'LOGO')), geometry_chrome: avg('L02b', 'GEOMETRY_CHROME'), negative: avg('L02b', Ng) },
      plate_avg_share: { creative: avg('L03a', Cr), geometry: avg('L03a', 'GEOMETRY_CHROME'), placeholder: avg('L03a', 'PLACEHOLDER'), negative: avg('L03a', Ng), render: avg('L03a', Rm) },
      scene_avg_share: { creative: avg('L06a', Cr), negative: avg('L06a', Ng) },
    },
  };
}

/* ─────────────── report ─────────────── */

const cell = (s: unknown) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (cols: string[], rows: unknown[][]) => [`| ${cols.join(' | ')} |`, `| ${cols.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)].join('\n');
const list = (xs: readonly string[]) => xs.map((x) => `- ${x}`).join('\n');
const sevCount = () => (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((s) => [s, F.F09_CONTRADICTIONS.filter((c) => c.severity === s).length] as const);
const byLevel = (lvl: string) => Object.entries(F.F09_FREEDOM_BUDGET).filter(([, v]) => v.level === lvl).map(([k]) => k);
const disp = (d: string) => F.F09_RULE_DISPOSITIONS.filter((r) => r.disposition === d).map((r) => r.rule);

/** §48 final report (also returned in chat). */
export function buildF09FinalReport(): string {
  const S = F.F09_SURVIVAL;
  const generatorFiles = F09_FORENSICS_GENERATOR_PROMPTS.length;
  const lines = [
    `SPRINT: ${F.F09_FORENSICS_SPRINT}`,
    'STATUS: COMPLETE — ANALYSIS ONLY',
    '',
    'PROMPTS AUDITED:',
    `COUNT: ${F.F09_PROMPT_LINEAGE.length} lineage entries across 6 sprints (4 founder briefs verbatim, 2 Composer sprints reconstructed, ${generatorFiles} generator prompt files, 2 generator input-image sets, 2 rulesets)`,
    'LIST:',
    ...F.F09_PROMPT_LINEAGE.map((l) => `  ${l.id} ${l.sprint} · ${l.kind}${l.reconstructed ? ' (reconstructed)' : ''}`),
    '',
    'CURRENT PIPELINE:',
    `SUMMARY: ${F.F09_PIPELINE.actual.join(' ')}`,
    `  Approved JURNL method: ${F.F09_PIPELINE.approved_jurnl_pipeline.join(' ')}`,
    '',
    'TOP ROOT CAUSES:',
    ...F.F09_ROOT_CAUSES.slice(0, 5).map((r) => `${String(r.rank).padStart(2, '0')} ${r.id} [${r.confidence}] ${r.cause.split(':')[0]!.split('.')[0]}`),
    '',
    'PROMPT CONTRADICTIONS:',
    `COUNT: ${F.F09_CONTRADICTIONS.length}`,
    `SEVERITY: ${sevCount().map(([s, n]) => `${n} ${s}`).join(' · ')}`,
    '',
    'OVER-CONSTRAINT:',
    `RESULT: YES — ${F.F09_OVER_CONSTRAINT.filter((a) => !a.sufficient).map((a) => a.area).join(', ')} locked; the only free variable was the background.`,
    '',
    'UNDER-SPECIFICATION:',
    `RESULT: YES — ${F.F09_UNDER_SPECIFIED.length} quality words with no visual minimum (${F.F09_UNDER_SPECIFIED.map((u) => u.word).join(', ')}).`,
    '',
    'ART-DIRECTION DENSITY:',
    `RESULT: ${F.F09_DENSITY.verdict}`,
    '',
    'MEDITERRANEAN SPECIFICITY:',
    `RESULT: WEAK — arches, view out, botanicals and architectural depth were FORBIDDEN in the Sunburst prompts and ABSENT from the plates; only palette, plaster and light were mandatory.`,
    '',
    'ENVIRONMENTAL RICHNESS:',
    `RESULT: MISSING — ${F.F09_RICHNESS_WHY}`,
    '',
    'ROLE COLLAPSE:',
    `RESULT: ${F.F09_ROLE_COLLAPSE.verdict} — ${F.F09_ROLE_COLLAPSE.effect}`,
    '',
    'REFERENCE USAGE:',
    `RESULT: ${F.F09_REFERENCE_VERDICT}`,
    '',
    'THREE-TERRITORY MODEL:',
    `${S.three_territory_model.verdict} — ${S.three_territory_model.why}`,
    '',
    'PLATE METHODOLOGY:',
    `${S.plates.verdict} — ${S.plates.why}`,
    '',
    'DETERMINISTIC UI:',
    `${S.deterministic_ui.verdict} — ${S.deterministic_ui.why}`,
    '',
    'SUNBURST:',
    `BOTTLENECK ${S.sunburst.verdict} — ${S.sunburst.why}`,
    '',
    'DEVICE CHROME RULE:',
    `CANONICAL RULE: ${DEVICE_CHROME_RULE.canvas} Excluded: ${DEVICE_CHROME_RULE.excluded.join(', ')}. Included: ${DEVICE_CHROME_RULE.included.join('; ')}. ${DEVICE_CHROME_RULE.geometry} ${DEVICE_CHROME_RULE.term}`,
    '',
    'NEW PROMPT ARCHITECTURE:',
    `SUMMARY: ${[...PROMPT_ARCHITECTURE].sort((a, b) => a.order - b.order).map((l) => `${l.order}.${l.id}`).join(' → ')}. Priority tiers ${PROMPT_PRIORITY_TIERS.map((t) => t.id).join(' > ')}. Generator prompt ≤ ${GENERATOR_PROMPT_BUDGET.max_words} words, ≤ ${GENERATOR_PROMPT_BUDGET.max_negatives} negatives, references attached first. Generate the whole; correct the parts.`,
    '',
    'CREATIVE FREEDOM BUDGET:',
    `LOCKED: ${byLevel('LOCKED').join(', ')}`,
    `GUIDED: ${byLevel('GUIDED').join(', ')}`,
    `FREE: ${byLevel('FREE').join(', ')}`,
    '',
    'MANDATORY VISUAL EVIDENCE:',
    ...F.F09_MANDATORY_EVIDENCE.map((e) => `- ${e.category}: ${e.minimum}`),
    '',
    'MISSING LOGIC WE MUST ADD:',
    ...F.F09_MISSING_LOGIC.map((m) => `- ${m}`),
    '',
    'EXISTING RULES:',
    `KEEP: ${disp('KEEP').join(' · ')}`,
    `REWRITE: ${disp('REWRITE').join(' · ')}`,
    `REMOVE: ${disp('REMOVE').join(' · ')}`,
    `FOUNDER DECISION: ${disp('FOUNDER_DECISION').join(' · ')}`,
    '',
    'NEXT SPRINT MUST:',
    ...F.F09_NEXT_SPRINT_SPEC.must.map((m) => `- ${m}`),
    '',
    'NEXT SPRINT MUST NOT:',
    ...F.F09_NEXT_SPRINT_SPEC.must_not.map((m) => `- ${m}`),
    '',
    'GENERATION PERFORMED:',
    F.F09_FORENSICS_VERDICT.generation_performed ? 'YES' : 'NO',
    '',
    'IMPLEMENTATION PERFORMED:',
    F.F09_FORENSICS_VERDICT.implementation_performed ? 'YES' : 'NO',
    '',
    'FINAL VERDICT:',
    `PROMPT_SYSTEM_ROOT_CAUSE_IDENTIFIED ${F.F09_FORENSICS_VERDICT.PROMPT_SYSTEM_ROOT_CAUSE_IDENTIFIED ? 'YES' : 'NO'}`,
    `READY_TO_REWRITE_F09_GENERATION_PROMPT ${F.F09_FORENSICS_VERDICT.READY_TO_REWRITE_F09_GENERATION_PROMPT ? 'YES' : 'NO'} — ${F.F09_FORENSICS_VERDICT.why_not_ready}`,
  ];
  return lines.join('\n');
}

export function buildF09ForensicsReport(inv = buildF09InstructionInventory(), m = buildF09DensityMeasurement()): string {
  const L = F.F09_PROMPT_LINEAGE;
  const out: string[] = [];
  const h = (n: number | string, t: string) => out.push('', `## ${n}. ${t}`, '');
  out.push(
    '# JURNL F09 SAFE TO SPEND — Prompt forensics and creative-logic audit',
    '',
    `> ${F.F09_FORENSICS_SPRINT} · ANALYSIS ONLY · no image generated · no implementation · no concept round started.`,
    '> GENERATED by `scripts/studioos/jurnl-f09-prompt-forensics-export.ts` from `shared/studioos-visual-authority/projects/jurnl/f09-prompt-forensics.ts` and the verbatim sources in `SOURCES/`. Edit the TypeScript, never this file.',
    '',
    '**Question:** what is the current prompt logic actually asking the model to do, why does it keep producing generic, under-art-directed, assembled F09 outputs, and what should the canonical prompt architecture be?',
    '',
    '**Answer in one line:** the renderer was never shown the JURNL world. Every approved JURNL screen is image-to-image from the approved F01 Welcome world; F09 excluded that image, banned its signature elements in words, and from round 3 fed the renderer an agent-drawn diagram as “the only reference” — then laid flat app UI on top.',
  );

  h(1, 'Full F09 prompt lineage');
  out.push(table(['ID', 'Sprint', 'Kind', 'Author', 'Source', 'Reached the model as', 'Output'], L.map((l) => [l.id, l.sprint, l.kind, l.author, `${l.source}${l.reconstructed ? ' **(reconstructed)**' : ''}`, l.reached_model, l.output])));

  h(2, 'Intended vs actual pipeline');
  out.push(`**Believed:** ${F.F09_PIPELINE.believed.join(' → ')}`, '', `**Actual:** ${F.F09_PIPELINE.actual.join(' ')}`, '', `**Approved JURNL method:** ${F.F09_PIPELINE.approved_jurnl_pipeline.join(' ')}`, '', `**Coherent:** ${F.F09_PIPELINE.coherent ? 'YES' : 'NO'} — ${F.F09_PIPELINE.why}`);

  h(3, 'Prompt-instruction inventory');
  out.push(`${inv.items.filter((i) => i.kind === 'INSTRUCTION').length} instruction items (+ ${inv.items.filter((i) => i.kind === 'CONTEXT').length} context lines) extracted without merging, classified into the ${INSTRUCTION_CATEGORIES.length} categories by \`classifyInstruction\`. Full list: \`F09_INSTRUCTION_INVENTORY.json\`.`, '');
  out.push(table(['Lineage', 'Source', 'Instructions', 'Top categories'], Object.entries(inv.counts).map(([f, c]) => [inv.items.find((i) => i.file === f)?.lineage, f.split('/').pop(), c.instructions, Object.entries(c.by_category).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => `${k} ${n}`).join(' · ')])));
  out.push('', table(['Category', 'Count'], Object.entries(inv.totals).map(([k, n]) => [k, n])));

  h(4, 'Contradictions');
  out.push(`${F.F09_CONTRADICTIONS.length} contradictions — ${sevCount().map(([s, n]) => `${n} ${s}`).join(' · ')}.`, '');
  out.push(table(['ID', 'Instruction A', 'Instruction B', 'Why they conflict', 'Output failure', 'Severity'], F.F09_CONTRADICTIONS.map((c) => [c.id, c.a, c.b, c.why, c.failure, c.severity])));

  h(5, 'Over-constraint');
  out.push(table(['Area', 'Locked', 'Free', 'Sufficient freedom', 'Failure'], F.F09_OVER_CONSTRAINT.map((a) => [a.area, a.locked.join('; '), a.free.join('; '), a.sufficient ? 'YES' : 'NO', a.failure])));

  h(6, 'Under-specification');
  out.push(table(['Word', 'Visual meaning', 'Minimum evidence', 'Structural consequence', 'Satisfied badly by'], F.F09_UNDER_SPECIFIED.map((u) => [u.word, u.visual, u.minimum, u.structure, u.satisfied_badly_by])));

  h(7, '“Mediterranean” specificity');
  out.push(table(['Cue', 'Sunburst prompts (L02b)', 'Plates (L03a)', 'Regen scenes (L06a)', 'Approved benchmark'], F.F09_MEDITERRANEAN_AUDIT.map((r) => [r.cue, r.L02_sunburst, r.L03_plates, r.L06_scenes, r.benchmark])));

  h(8, 'Environmental richness');
  out.push(table(['Element', 'F09 prompts', 'Approved benchmark'], F.F09_RICHNESS_AUDIT.map((r) => [r.element, r.status, r.benchmark])), '', F.F09_RICHNESS_WHY);

  h(9, 'Art-direction density (measured)');
  out.push(table(['Brief', 'Creative', 'Product truth', 'Process', 'Render', 'QA', 'Negative', 'Creative-positive : negative lines'], Object.entries(m.briefs).map(([k, v]) => [k, v.share.CREATIVE ?? 0, v.share.PRODUCT_TRUTH ?? 0, v.share.PROCESS ?? 0, v.share.RENDER_MECHANICS ?? 0, v.share.QA_GATES ?? 0, v.share.NEGATIVE ?? 0, `${v.line_polarity.creative_positive_lines} : ${v.line_polarity.negative_lines}`])));
  out.push('', `Sunburst prompts (avg): ${JSON.stringify(m.summary.sunburst_avg_share)} · plate prompts (avg): ${JSON.stringify(m.summary.plate_avg_share)} · regen scene prompts (avg): ${JSON.stringify(m.summary.scene_avg_share)}.`, '', `**Verdict:** ${F.F09_DENSITY.verdict}`, '', `Method and bucket tables: \`PROMPT_DENSITY_MEASUREMENT.json\`. ${F.F09_DENSITY.sunburst_prompt.note}`);

  h(10, 'Abstraction level / role collapse');
  out.push(`**Role collapse:** ${F.F09_ROLE_COLLAPSE.verdict}. ${F.F09_ROLE_COLLAPSE.effect}`, '');
  out.push(table(['Sprint', 'Roles asked of one agent'], Object.entries(F.F09_ROLE_COLLAPSE.roles_per_sprint).map(([k, v]) => [k, v.join(' · ')])));
  out.push('', table(['Decision level', 'Belongs here'], Object.entries(F.F09_ROLE_COLLAPSE.decision_levels).map(([k, v]) => [k, v.join(' · ')])));

  h(11, 'Territory distinctness logic');
  out.push(table(['Attribute', 'Shared across concepts', 'Note'], F.F09_DISTINCTNESS_AUDIT.attributes.map((a) => [a.attribute, a.shared ? 'SHARED' : 'DISTINCT', a.note])), '', `${F.F09_DISTINCTNESS_AUDIT.distinct_count}/10 distinct. ${F.F09_DISTINCTNESS_AUDIT.verdict}`);

  h(12, 'Product-truth pressure');
  out.push('**Must be exact:**', list(F.F09_PRODUCT_TRUTH_PRESSURE.must_be_exact), '', '**Wrongly locked as identical presentation:**', list(F.F09_PRODUCT_TRUTH_PRESSURE.wrongly_locked_as_identical), '', `**Rule:** ${F.F09_PRODUCT_TRUTH_PRESSURE.rule}`);

  h(13, 'Deterministic UI logic');
  out.push(table(['Element', 'Ownership', 'Note'], F.F09_UI_OWNERSHIP.map((u) => [u.element, u.ownership.join(' + '), u.note])), '', F.F09_UI_OWNERSHIP_VERDICT);

  h(14, 'Composite coherence');
  out.push(table(['Cause', 'Evidence', 'Confidence'], F.F09_COHERENCE_CAUSES.map((c) => [c.cause, c.evidence, c.confidence])));

  h(15, 'Order of operations');
  out.push(`**Current:** ${F.F09_ORDER_OF_OPERATIONS.current}`, '', `**Approved JURNL:** ${F.F09_ORDER_OF_OPERATIONS.approved_jurnl}`, '', `**Recommended:** ${F.F09_ORDER_OF_OPERATIONS.recommended}`, '', `**Should generation follow composition?** ${F.F09_ORDER_OF_OPERATIONS.answer}`);

  h(16, 'Reference usage');
  out.push(table(['Reference', 'Intended role', 'Attached', 'Actual effect'], F.F09_REFERENCE_AUDIT.map((r) => [r.reference, r.intended_role.join(' + '), r.attached ? 'YES' : 'NO', r.actual_effect])), '', `**Verdict:** ${F.F09_REFERENCE_VERDICT}`);

  h(17, 'The strongest JURNL references');
  const SR = F.F09_STRONGEST_REFERENCES;
  out.push(`Approved world: \`${SR.approved_world}\` · same-world parents: ${SR.same_world_family_parents.map((p) => `\`${p}\``).join(', ')} · design system: \`${SR.design_system}\`.`, '', `**Method:** ${SR.method}`, '', table(['Dimension', 'Approved JURNL', 'F09 outputs'], SR.comparison.map((c) => [c.dimension, c.approved, c.f09])));

  h(18, 'Explicit question — what do the approved JURNL authorities do that the F09 prompts do not?');
  out.push(F.F09_IMPLICIT_SUCCESS_FACTORS.map((f, i) => `${i + 1}. ${f}`).join('\n'));

  h(19, 'Prompt length / priority dilution');
  const PD = F.F09_PRIORITY_DILUTION;
  out.push(`Sunburst prompt: ${PD.sunburst_prompt_sections} sections, ≈ ${F.F09_DENSITY.sunburst_prompt.words} words.`, '', table(['Class', 'Content'], Object.entries(PD.classification).map(([k, v]) => [k, v.join('; ')])), '', `**Critical and missing:** ${PD.critical_missing.join('; ')}.`, '', `**Verdict:** ${PD.verdict}`);

  h(20, 'Negative-instruction saturation');
  const NS = F.F09_NEGATIVE_SATURATION;
  out.push(table(['Source', 'Creative-positive : negative'], Object.entries(NS.founder_briefs).map(([k, v]) => [k, v])), '', `Sunburst: ${NS.sunburst_prompt} · plate: ${NS.plate_prompt} · regen scene: ${NS.regen_scene_prompt} (T01 files; all files measured in \`PROMPT_DENSITY_MEASUREMENT.json\`).`, '', `**Verdict:** ${NS.verdict}`);

  h(21, 'Quality-bar communication');
  out.push(`**Current:** ${F.F09_QUALITY_BAR.current}`, '', `**Verdict:** ${F.F09_QUALITY_BAR.verdict}`, '', '**Recommended:**', list(F.F09_QUALITY_BAR.recommended));

  h(22, 'Device-chrome logic');
  const DC = F.F09_DEVICE_CHROME_AUDIT;
  out.push(table(['Term', 'Definition'], Object.entries(DC.definitions).map(([k, v]) => [k, v])), '', '**Where the confusion came from:**', list(DC.origin), '', `**Approved evidence:** ${DC.approved_evidence}`, '', `**Canonical rule:** ${DEVICE_CHROME_RULE.canvas} Excluded: ${DEVICE_CHROME_RULE.excluded.join(', ')}. Included: ${DEVICE_CHROME_RULE.included.join('; ')}. ${DEVICE_CHROME_RULE.geometry} ${DEVICE_CHROME_RULE.term}`);

  h(23, 'Logo / typography integration');
  const TI = F.F09_TYPE_INTEGRATION;
  out.push('**Why text glitched:**', list(TI.why_glitches), '', '**Why text feels pasted on:**', list(TI.why_pasted_on), '', table(['Concern', 'Definition and owner'], Object.entries(TI.separate).map(([k, v]) => [k, v])), '', '**How exact text can still participate in the composition:**', list(TI.recommendations));

  h(24, 'Three-concept delivery contract');
  out.push(`**One concept is:** ${CONCEPT_DELIVERY_CONTRACT.is}`, '', `**One concept is not:** ${CONCEPT_DELIVERY_CONTRACT.is_not.join(' · ')}.`);

  h(25, 'Root-cause map');
  out.push(table(['Observed failure', 'Root causes'], Object.entries(F.F09_FAILURE_MAP).map(([k, v]) => [k, v.join(', ')])), '', table(['Failure class', 'Definition', 'Root causes in this class'], Object.entries(PROMPT_FAILURE_CLASSES).map(([k, v]) => [k, v, F.F09_ROOT_CAUSES.filter((r) => r.classes.includes(k as never)).map((r) => r.id).join(', ') || '—'])));
  out.push('', `**Renderer blame rule:** ${RENDERER_BLAME_RULE}`);

  h(26, 'Causal confidence');
  out.push(table(['Root cause', 'Confidence', 'Evidence'], F.F09_ROOT_CAUSES.map((r) => [r.id, r.confidence, r.evidence.join('; ')])));

  h(27, 'New canonical prompt architecture');
  out.push(table(['Order', 'Layer', 'Rule'], [...PROMPT_ARCHITECTURE].sort((a, b) => a.order - b.order).map((l) => [l.order, `${l.layer} · ${l.id}`, l.rule])), '', `**Generator prompt budget:** ≤ ${GENERATOR_PROMPT_BUDGET.max_words} words · ≤ ${GENERATOR_PROMPT_BUDGET.max_negatives} negatives · ≤ ${GENERATOR_PROMPT_BUDGET.max_exact_strings_rendered_by_generator} exact strings rendered by the generator. Order: ${GENERATOR_PROMPT_BUDGET.order.join(' → ')}. Exclude: ${GENERATOR_PROMPT_BUDGET.exclude.join('; ')}.`);

  h(28, 'Prompt priority model');
  out.push(table(['Tier', 'ID', 'Holds'], PROMPT_PRIORITY_TIERS.map((t) => [t.tier, t.id, t.holds])), '', 'A lower tier never overrides a higher one. QA and methodology are never pasted into the generator prompt.');

  h(29, 'Creative freedom budget (F09)');
  out.push(table(['Variable', 'Level', 'Rule'], Object.entries(F.F09_FREEDOM_BUDGET).map(([k, v]) => [k, v.level, v.rule])));

  h(30, 'Mandatory visual evidence (F09)');
  out.push(table(['Category', 'Minimum'], F.F09_MANDATORY_EVIDENCE.map((e) => [e.category, e.minimum])));

  h(31, 'Anti-generic test');
  out.push(table(['ID', 'Question', 'Fails if'], ANTI_GENERIC_TEST.map((t) => [t.id, t.question, t.fail_if])));

  h(32, 'Anti-assembly test');
  out.push(table(['ID', 'Question', 'Fails if'], ANTI_ASSEMBLY_TEST.map((t) => [t.id, t.question, t.fail_if])));

  h(33, 'Reference-consumption test');
  out.push(REFERENCE_CONSUMPTION_TEST.rule, '', '**Extraction sheet:**', list(REFERENCE_CONSUMPTION_TEST.extract));

  h(34, 'Model responsibilities');
  out.push(table(['Role', 'Responsibility'], Object.entries(F.F09_MODEL_RESPONSIBILITIES).filter(([k]) => k !== 'correction').map(([k, v]) => [k, v])), '', F.F09_MODEL_RESPONSIBILITIES.correction);

  h(35, '“Fully authored”, precisely');
  out.push('**General definition:**', list(FULLY_AUTHORED_DEFINITION), '', '**F09 operational form:**', list(F.F09_FULLY_AUTHORED_REFINED));

  const S = F.F09_SURVIVAL;
  h(36, 'Should the three-territory model survive?');
  out.push(`**${S.three_territory_model.verdict}.** ${S.three_territory_model.why}`);
  h(37, 'Should plates survive?');
  out.push(`**${S.plates.verdict}.** ${S.plates.why}`);
  h(38, 'Should deterministic UI survive?');
  out.push(`**${S.deterministic_ui.verdict}.** ${S.deterministic_ui.why}`);
  h(39, 'Is Sunburst the bottleneck?');
  out.push(`**${S.sunburst.verdict}.** ${S.sunburst.why}`);

  h(40, 'Final synthesis');
  out.push(F.F09_SYNTHESIS.join('\n\n'));

  h(41, 'Deliverable — prompt forensics table');
  out.push(table(['Prompt / sprint', 'Intended job', 'Key instructions', 'Contradictions', 'Missing logic', 'Over-constraint', 'Under-specification', 'Likely failure caused', 'Severity'], F.F09_FORENSICS_TABLE.map((r) => [r.prompt, r.intended_job, r.key_instructions.join('; '), r.contradictions.join(', '), r.missing_logic.join('; '), r.over_constraint.join('; '), r.under_specification.join('; '), r.likely_failure, r.severity])));

  h(42, 'Deliverable — root-cause ranking');
  out.push(table(['Rank', 'ID', 'Cause', 'Classes', 'Evidence', 'Confidence', 'Impact'], F.F09_ROOT_CAUSES.map((r) => [String(r.rank).padStart(2, '0'), r.id, r.cause, r.classes.join(', '), r.evidence.join('; '), r.confidence, r.impact])));

  h(43, 'Deliverable — new prompt architecture');
  out.push('See §27 (layers), §28 (priority tiers), §29 (freedom budget), §30 (evidence), §31–33 (tests), §22 (device chrome), §24 (delivery contract). Generic method: `docs/studioos/visual-authority-development/PROMPT_FORENSICS_METHOD.md`. The next visual sprint is deliberately not written here.');

  h(44, 'Deliverable — remove / keep / rewrite');
  out.push(table(['Rule', 'Disposition', 'Note'], F.F09_RULE_DISPOSITIONS.map((r) => [r.rule, r.disposition, r.note])));

  h(45, 'Deliverable — missing logic we must add before next generation');
  out.push(F.F09_MISSING_LOGIC.map((x, i) => `${i + 1}. ${x}`).join('\n'), '', '**Founder decisions required first:**', list(F.F09_FOUNDER_DECISIONS_REQUIRED.map((d) => `${d.id} — ${d.question}`)));

  h(46, 'Deliverable — next-sprint spec');
  out.push('**The next sprint must contain:**', list(F.F09_NEXT_SPRINT_SPEC.must), '', '**The next sprint must not contain:**', list(F.F09_NEXT_SPRINT_SPEC.must_not));

  h(47, 'Success criteria');
  const crit: [string, string][] = [
    ['full F09 prompt lineage audited', '§1 · F09_PROMPT_LINEAGE.json'], ['instruction inventory complete', '§3 · F09_INSTRUCTION_INVENTORY.json'], ['contradictions identified', '§4'], ['over-constraint identified', '§5'], ['under-specification identified', '§6'], ['art-direction density audited', '§9 · PROMPT_DENSITY_MEASUREMENT.json'], ['Mediterranean specificity audited', '§7'], ['environmental richness audited', '§8'], ['role-collapse audited', '§10'], ['reference usage audited', '§16–18'], ['deterministic UI scope audited', '§13 · §38'], ['plate methodology audited', '§37 · RC02 · RC05'], ['three-territory model audited', '§11 · §36'], ['prompt-length dilution audited', '§19'], ['negative-instruction saturation audited', '§20'], ['root causes ranked', '§42'], ['causal confidence reported', '§26'], ['new prompt architecture proposed', '§27–35'], ['missing logic explicitly defined', '§45'], ['no images generated', 'F09_FORENSICS_VERDICT.generation_performed = false'], ['no implementation performed', 'F09_FORENSICS_VERDICT.implementation_performed = false'], ['no next concept round started', 'F09_GENERATION_PAUSED'],
  ];
  out.push(crit.map(([c, e]) => `- [x] ${c} — ${e}`).join('\n'));

  h(48, 'Final report');
  out.push('```', buildF09FinalReport(), '```', '');
  return out.join('\n');
}

/** Grouped by source and section (items are [id, kind, category, text]) to keep the file readable and small. */
function inventoryJson(inv: ReturnType<typeof buildF09InstructionInventory>): string {
  const files = [...new Set(inv.items.map((i) => i.file))];
  const sources = files.map((file) => {
    const own = inv.items.filter((i) => i.file === file);
    const sections: { section: string; items: [string, string, string, string][] }[] = [];
    for (const i of own) {
      const name = i.subsection ? `${i.section} › ${i.subsection}` : i.section;
      if (sections.at(-1)?.section !== name) sections.push({ section: name, items: [] });
      sections.at(-1)!.items.push([i.id, i.kind, i.category, i.text]);
    }
    return { lineage: own[0]!.lineage, file, ...inv.counts[file], sections };
  });
  const body = {
    ...head('F09_INSTRUCTION_INVENTORY'),
    classifier: 'classifyInstruction (shared/studioos-visual-authority/prompt-forensics.ts) — deterministic first pass; similar instructions are not merged; CONTEXT lines (conversation context, known failure, supersedes) are kept but not counted',
    item_fields: ['id', 'kind', 'category', 'text'],
    categories: INSTRUCTION_CATEGORIES,
    instruction_count: inv.items.filter((i) => i.kind === 'INSTRUCTION').length,
    context_count: inv.items.filter((i) => i.kind === 'CONTEXT').length,
    totals: inv.totals,
    sources,
  };
  // One item per line: diffable without the bulk of a fully indented array.
  return `${JSON.stringify(body, (_k, v) => (Array.isArray(v) && v.length === 4 && typeof v[0] === 'string' && /^L\d/.test(v[0]) ? `@@${JSON.stringify(v)}@@` : v), 1).replace(/"@@(.*?)@@"/g, (_m, x: string) => JSON.parse(`"${x}"`))}\n`;
}

/* ─────────────── exports ─────────────── */

export function buildF09PromptForensicsExports(): Record<string, string> {
  const inv = buildF09InstructionInventory();
  const m = buildF09DensityMeasurement();
  const wordsOf = (f: string) => words(read(f));
  return {
    'F09_PROMPT_LINEAGE.json': json({ ...head('F09_PROMPT_LINEAGE'), sources: { briefs: F09_FORENSICS_BRIEFS.map((b) => ({ ...b, words: wordsOf(b.file) })), generator_prompts: F09_FORENSICS_GENERATOR_PROMPTS.map((p) => ({ ...p, words: wordsOf(p.file) })), audit_brief: F09_FORENSICS_AUDIT_BRIEF }, lineage: F.F09_PROMPT_LINEAGE, pipeline: F.F09_PIPELINE }),
    'F09_INSTRUCTION_INVENTORY.json': inventoryJson(inv),
    'PROMPT_DENSITY_MEASUREMENT.json': json({ ...head('PROMPT_DENSITY_MEASUREMENT'), ...m, interpretation: F.F09_DENSITY, negative_saturation: F.F09_NEGATIVE_SATURATION, priority_dilution: F.F09_PRIORITY_DILUTION }),
    'F09_CONTRADICTIONS.json': json({ ...head('F09_CONTRADICTIONS'), count: F.F09_CONTRADICTIONS.length, severity: Object.fromEntries(sevCount()), contradictions: F.F09_CONTRADICTIONS, over_constraint: F.F09_OVER_CONSTRAINT, under_specified: F.F09_UNDER_SPECIFIED }),
    'F09_PROMPT_FORENSICS_TABLE.json': json({ ...head('F09_PROMPT_FORENSICS_TABLE'), rows: F.F09_FORENSICS_TABLE }),
    'F09_CREATIVE_LOGIC_AUDIT.json': json({ ...head('F09_CREATIVE_LOGIC_AUDIT'), mediterranean: F.F09_MEDITERRANEAN_AUDIT, richness: { audit: F.F09_RICHNESS_AUDIT, why: F.F09_RICHNESS_WHY }, role_collapse: F.F09_ROLE_COLLAPSE, distinctness: F.F09_DISTINCTNESS_AUDIT, product_truth_pressure: F.F09_PRODUCT_TRUTH_PRESSURE, ui_ownership: { elements: F.F09_UI_OWNERSHIP, verdict: F.F09_UI_OWNERSHIP_VERDICT }, coherence: F.F09_COHERENCE_CAUSES, order_of_operations: F.F09_ORDER_OF_OPERATIONS, device_chrome: F.F09_DEVICE_CHROME_AUDIT, type_integration: F.F09_TYPE_INTEGRATION, quality_bar: F.F09_QUALITY_BAR }),
    'F09_REFERENCE_AUDIT.json': json({ ...head('F09_REFERENCE_AUDIT'), references: F.F09_REFERENCE_AUDIT, verdict: F.F09_REFERENCE_VERDICT, strongest_references: F.F09_STRONGEST_REFERENCES, implicit_success_factors: F.F09_IMPLICIT_SUCCESS_FACTORS }),
    'F09_ROOT_CAUSES.json': json({ ...head('F09_ROOT_CAUSES'), failure_classes: PROMPT_FAILURE_CLASSES, renderer_blame_rule: RENDERER_BLAME_RULE, root_causes: F.F09_ROOT_CAUSES, failure_map: F.F09_FAILURE_MAP, synthesis: F.F09_SYNTHESIS }),
    'F09_PROMPT_ARCHITECTURE.json': json({ ...head('F09_PROMPT_ARCHITECTURE'), procedure: PROMPT_FORENSICS_PROCEDURE, architecture: PROMPT_ARCHITECTURE, priority_tiers: PROMPT_PRIORITY_TIERS, generator_prompt_budget: GENERATOR_PROMPT_BUDGET, freedom_budget: F.F09_FREEDOM_BUDGET, mandatory_evidence: F.F09_MANDATORY_EVIDENCE, anti_generic_test: ANTI_GENERIC_TEST, anti_assembly_test: ANTI_ASSEMBLY_TEST, reference_consumption_test: REFERENCE_CONSUMPTION_TEST, device_chrome_rule: DEVICE_CHROME_RULE, concept_delivery_contract: CONCEPT_DELIVERY_CONTRACT, fully_authored: { general: FULLY_AUTHORED_DEFINITION, f09: F.F09_FULLY_AUTHORED_REFINED }, model_responsibilities: F.F09_MODEL_RESPONSIBILITIES }),
    'F09_RULE_DISPOSITIONS_AND_MISSING_LOGIC.json': json({ ...head('F09_RULE_DISPOSITIONS_AND_MISSING_LOGIC'), survival: F.F09_SURVIVAL, rule_dispositions: F.F09_RULE_DISPOSITIONS, missing_logic: F.F09_MISSING_LOGIC, next_sprint_spec: F.F09_NEXT_SPRINT_SPEC, founder_decisions_required: F.F09_FOUNDER_DECISIONS_REQUIRED }),
    'F09_FORENSICS_VERDICT.json': json({ ...head('F09_FORENSICS_VERDICT'), ...F.F09_FORENSICS_VERDICT, generation_paused: F.F09_GENERATION_PAUSED }),
    'F09_PROMPT_FORENSICS_REPORT.md': buildF09ForensicsReport(inv, m),
  };
}

if (process.argv[1] && /jurnl-f09-prompt-forensics-export\.ts$/.test(process.argv[1])) {
  const files = buildF09PromptForensicsExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${DIR}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${DIR}`);
  if (process.argv.includes('--final-report')) console.log(`\n${buildF09FinalReport()}`);
}
