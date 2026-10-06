/**
 * P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1 — export the F09 creative-direction package
 * (single source: shared/studioos-visual-authority/projects/jurnl/{creative-direction-profile,f09-creative-direction}.ts).
 *
 *   npx tsx scripts/studioos/jurnl-f09-creative-direction-export.ts
 *
 * Every JSON and SUNBURST_PROMPTS/*.txt in the package is GENERATED — edit the TypeScript. Markdown is hand-written.
 * tests/jurnlF09CreativeDirectionCorrection1.test.ts keeps the export in sync.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CREATIVE_DIRECTION_GATE_CONTRACT, JURNL_CREATIVE_DIRECTION_PROFILE, jurnlF09CD } from '../../shared/studioos-visual-authority/index.js';

const D = jurnlF09CD.JURNL_F09_CD_DIR;
const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, sprint: jurnlF09CD.JURNL_F09_CD_SPRINT, generated_by: 'scripts/studioos/jurnl-f09-creative-direction-export.ts' });
const PROMPT_FILES: Record<string, string> = { 'JURNL.F09.T01': 'T01_OPEN_FLOOR.txt', 'JURNL.F09.T02': 'T02_PLAIN_ANSWER.txt', 'JURNL.F09.T03': 'T03_OPEN_ENVELOPE.txt' };

export function buildJurnlF09CreativeExports(): Record<string, string> {
  const status = jurnlF09CD.jurnlF09CreativeStatus();
  const files: Record<string, string> = {};
  files['JURNL_CREATIVE_DIRECTION_PROFILE.json'] = json({ ...head('JURNL_CREATIVE_DIRECTION_PROFILE'), ...JURNL_CREATIVE_DIRECTION_PROFILE });
  jurnlF09CD.JURNL_F09_CREATIVE_DIRECTIONS.forEach((t, i) => {
    files[`F09_T0${i + 1}_CREATIVE_DIRECTION.json`] = json({
      ...head(`F09_T0${i + 1}_CREATIVE_DIRECTION`),
      ...t,
      creative_direction_check: status.creative_direction[i],
      brand_expression_check: status.brand_expression[i],
      brand_expression_evidence: jurnlF09CD.JURNL_F09_BRAND_EXPRESSION[i]!.items,
    });
    files[`SUNBURST_PROMPTS/${PROMPT_FILES[t.territory_id]}`] = jurnlF09CD.buildSunburstPrompt(t);
    files[`CHATGPT_PROMPTS/${PROMPT_FILES[t.territory_id]!.replace('.txt', '_CHATGPT.txt')}`] = jurnlF09CD.buildChatGptPrompt(t);
  });
  files['CREATIVE_DIRECTION_DISTINCTNESS_MATRIX.json'] = json({
    ...head('CREATIVE_DIRECTION_DISTINCTNESS_MATRIX'),
    rule: CREATIVE_DIRECTION_GATE_CONTRACT.distinctness,
    rows: jurnlF09CD.JURNL_F09_CREATIVE_DISTINCTNESS,
    result: status.distinctness,
  });
  files['ANTI_AI_VISUAL_AUDIT.json'] = json({
    ...head('ANTI_AI_VISUAL_AUDIT'),
    previous_round: { note: 'Territory proof 1 (local HTML/CSS renders) audited as the baseline.', audits: jurnlF09CD.PREVIOUS_ROUND_AUDIT, brand_expression_failures: jurnlF09CD.PREVIOUS_ROUND_BRAND_EXPRESSION_FAILURES },
    corrected_round: jurnlF09CD.JURNL_F09_CORRECTED_AUDITS.length ? jurnlF09CD.JURNL_F09_CORRECTED_AUDITS : 'PENDING_GENERATION',
  });
  files['PREVIOUS_VS_CORRECTED_COMPARISON.json'] = json({
    ...head('PREVIOUS_VS_CORRECTED_COMPARISON'),
    scale: '1–5 founder-review scale (5 = authority-grade).',
    corrected_round_status: jurnlF09CD.CORRECTED_ROUND_SCORES_STATUS,
    dimensions: jurnlF09CD.COMPARISON_DIMENSIONS,
    territories: jurnlF09CD.JURNL_F09_CREATIVE_DIRECTIONS.map((t) => ({
      territory_id: t.territory_id,
      previous_candidate: jurnlF09CD.PREVIOUS_ROUND_CANDIDATES.find((c) => c.territory_id === t.territory_id)?.image_path,
      previous_scores: jurnlF09CD.PREVIOUS_ROUND_SCORES[t.territory_id],
      corrected_candidate: jurnlF09CD.JURNL_F09_CORRECTED_CANDIDATES.find((c) => c.territory_id === t.territory_id)?.image_path ?? 'PENDING_GENERATION',
      corrected_scores: jurnlF09CD.JURNL_F09_CORRECTED_CANDIDATES.some((c) => c.territory_id === t.territory_id)
        ? jurnlF09CD.CORRECTED_ROUND_SCORES[t.territory_id]
        : 'PENDING_GENERATION',
    })),
  });
  files['GENERATION_LEDGER.json'] = json({ ...head('GENERATION_LEDGER'), ...jurnlF09CD.JURNL_F09_CD_GENERATION_LEDGER });
  files['F09_CREATIVE_GATE_STATUS.json'] = json({
    ...head('F09_CREATIVE_GATE_STATUS'),
    corrected_round: status.gate,
    previous_round: status.previous_round_gate,
  });
  return files;
}

if (process.argv[1] && /jurnl-f09-creative-direction-export\.ts$/.test(process.argv[1])) {
  mkdirSync(`${D}/SUNBURST_PROMPTS`, { recursive: true });
  mkdirSync(`${D}/CHATGPT_PROMPTS`, { recursive: true });
  const files = buildJurnlF09CreativeExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${D}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${D}`);
}
