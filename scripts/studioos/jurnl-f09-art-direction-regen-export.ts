/**
 * P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1 — export the regen record
 * (single source: shared/studioos-visual-authority/projects/jurnl/f09-art-direction-regen.ts).
 *
 *   npx tsx scripts/studioos/jurnl-f09-art-direction-regen-export.ts
 */
import { writeFileSync } from 'node:fs';
import { jurnlF09Regen as R } from '../../shared/studioos-visual-authority/index.js';

const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, sprint: R.JURNL_F09_REGEN_SPRINT, generated_by: 'scripts/studioos/jurnl-f09-art-direction-regen-export.ts' });

export function buildJurnlF09RegenExports(): Record<string, string> {
  return {
    'REGEN_CONCEPTS.json': json({ ...head('REGEN_CONCEPTS'), supersedes: R.JURNL_F09_REGEN_SUPERSEDES, decisions_settled: R.F09_DECISIONS_SETTLED, concepts: R.JURNL_F09_REGEN_CONCEPTS }),
    'REGEN_RENDER_LEDGER.json': json({ ...head('REGEN_RENDER_LEDGER'), ...R.JURNL_F09_REGEN_RENDER_LEDGER }),
    'REGEN_STATUS.json': json({ ...head('REGEN_STATUS'), ...R.JURNL_F09_REGEN_STATUS, standard: R.JURNL_F09_REGEN_STANDARD }),
  };
}

if (process.argv[1] && /jurnl-f09-art-direction-regen-export\.ts$/.test(process.argv[1])) {
  for (const [name, body] of Object.entries(buildJurnlF09RegenExports())) writeFileSync(`${R.JURNL_F09_REGEN_DIR}/${name}`, body);
  console.log(`exported regen record to ${R.JURNL_F09_REGEN_DIR}`);
}
