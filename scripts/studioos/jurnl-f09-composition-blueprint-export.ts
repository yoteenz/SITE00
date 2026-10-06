/**
 * P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1 — export the F09 blueprint package
 * (single source: shared/studioos-visual-authority/projects/jurnl/f09-composition-blueprint.ts).
 *
 *   npx tsx scripts/studioos/jurnl-f09-composition-blueprint-export.ts
 *   node scripts/jurnl/f09-blueprint-render.mjs            # zone maps + plate guides (reads the JSON)
 *   npx tsx scripts/studioos/jurnl-f09-composition-blueprint-export.ts   # again: the guard records the plate-guide hashes
 *
 * Every JSON and PLATE_PROMPTS/*.txt is GENERATED — edit the TypeScript. README.md is hand-written.
 * tests/jurnlF09CompositionBlueprintCorrection1.test.ts keeps the export in sync.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { jurnlF09BP } from '../../shared/studioos-visual-authority/index.js';

const D = jurnlF09BP.JURNL_F09_BP_DIR;
const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, sprint: jurnlF09BP.JURNL_F09_BP_SPRINT, generated_by: 'scripts/studioos/jurnl-f09-composition-blueprint-export.ts' });
export const sha256 = (text: string | Buffer) => createHash('sha256').update(text).digest('hex');
export const fileSha256 = (path: string) => (existsSync(path) ? sha256(readFileSync(path)) : null);

export function buildJurnlF09BlueprintExports(): Record<string, string> {
  const status = jurnlF09BP.jurnlF09HybridStatus();
  const files: Record<string, string> = {};
  jurnlF09BP.JURNL_F09_BLUEPRINTS.forEach((b, i) => {
    const n = `T0${i + 1}`;
    files[`F09_${n}_COMPOSITION_BLUEPRINT.json`] = json({ ...head(`F09_${n}_COMPOSITION_BLUEPRINT`), ...b, check: status.blueprints[i], density: status.density[i], zone_map: `ZONE_MAPS/F09_${n}_BLUEPRINT_ZONE_MAP.png` });
    files[`F09_${n}_RENDER_OWNERSHIP.json`] = json({ ...head(`F09_${n}_RENDER_OWNERSHIP`), ...jurnlF09BP.JURNL_F09_RENDER_OWNERSHIP[i], check: status.ownership[i] });
  });
  const raw = jurnlF09BP.JURNL_F09_RAW_GENERATION_CONTRACT;
  files['F09_RAW_GENERATION_CONTRACT.json'] = json({ ...head('F09_RAW_GENERATION_CONTRACT'), ...raw, plates: raw.plates.map((p) => ({ ...p, prompt_path: `PLATE_PROMPTS/${p.territory_id.slice(-3)}_SCENE_PLATE.txt`, prompt_sha256: sha256(p.prompt) })) });
  for (const p of raw.plates) files[`PLATE_PROMPTS/${p.territory_id.slice(-3)}_SCENE_PLATE.txt`] = p.prompt;
  files['F09_COMPOSITE_ASSEMBLY_CONTRACT.json'] = json({ ...head('F09_COMPOSITE_ASSEMBLY_CONTRACT'), ...jurnlF09BP.JURNL_F09_COMPOSITE_ASSEMBLY_CONTRACT, logo_sha256: fileSha256(jurnlF09BP.JURNL_F09_COMPOSITE_ASSEMBLY_CONTRACT.logo.path) });
  files['F09_RENDER_CONTAMINATION_GUARD.json'] = json({ ...head('F09_RENDER_CONTAMINATION_GUARD'), guards: jurnlF09BP.buildF09ContaminationGuards(sha256, fileSha256), probe_run_a_t03: status.run_a_t03_contamination });
  files['F09_INVALID_RENDER_LEDGER.json'] = json({ ...head('F09_INVALID_RENDER_LEDGER'), ...jurnlF09BP.JURNL_F09_INVALID_RENDER_LEDGER, t03_previous_render_status: jurnlF09BP.F09_T03_PREVIOUS_RENDER_STATUS });
  files['F09_HYBRID_GATE_STATUS.json'] = json({
    ...head('F09_HYBRID_GATE_STATUS'),
    hybrid_gate: status.gate,
    generation: { primary: 0, paid: 0 },
    page_implementation: false,
    verdict: { PIPELINE_CORRECTED: true, READY_FOR_HYBRID_RENDER_EXECUTION: status.gate.status === 'COMPOSITE_AUTHORITY_REQUIRED', READY_FOR_FOUNDER_COMPARISON: false },
  });
  return files;
}

if (process.argv[1] && /jurnl-f09-composition-blueprint-export\.ts$/.test(process.argv[1])) {
  mkdirSync(`${D}/PLATE_PROMPTS`, { recursive: true });
  const files = buildJurnlF09BlueprintExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${D}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${D}`);
}
