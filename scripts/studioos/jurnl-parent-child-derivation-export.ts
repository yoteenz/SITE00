/**
 * P0.JURNL.PARENT-CHILD.VISUAL-DERIVATION.PROTOCOL1 — export the JURNL SAFE TO SPEND family and the PAY WITH drawer
 * spec + brief (single source: shared/studioos-visual-authority/projects/jurnl/safe-to-spend-family.ts).
 *
 *   npx tsx scripts/studioos/jurnl-parent-child-derivation-export.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { PARENT_CHILD_SPRINT, jurnlStsFamily as J } from '../../shared/studioos-visual-authority/index.js';

const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, sprint: PARENT_CHILD_SPRINT, generated_by: 'scripts/studioos/jurnl-parent-child-derivation-export.ts' });

export function buildJurnlParentChildExports(): Record<string, string> {
  const b = J.PAY_WITH_DERIVATION_BRIEF;
  const attach = J.PAY_WITH_DERIVATION_SPEC.references.map((r, i) => `  IMAGE ${i + 1}: ${r.file.replace(/_/g, ' ')}`).join('\n');
  return {
    'SAFE_TO_SPEND_FAMILY.json': json({ ...head('SAFE_TO_SPEND_FAMILY'), constants: J.JURNL_FAMILY_CONSTANTS, family: J.SAFE_TO_SPEND_FAMILY, sibling_sheets: J.SAFE_TO_SPEND_SIBLING_SHEETS }),
    'PAY_WITH_DRAWER_SPEC.json': json({ ...head('PAY_WITH_DRAWER_SPEC'), drawer: J.PAY_WITH_DRAWER, derivation_spec: J.PAY_WITH_DERIVATION_SPEC, brief: { words: b.words, within_budget: b.within_budget, negatives: b.negatives, exact_strings: b.exact_strings, check_after_generation: b.correction_needed_for } }),
    'PAY_WITH_DERIVATION_BRIEF.txt': `ATTACH, IN THIS ORDER:\n${attach}\n\n${b.text}\n`,
  };
}

if (process.argv[1] && /jurnl-parent-child-derivation-export\.ts$/.test(process.argv[1])) {
  mkdirSync(J.JURNL_FAMILY_DIR, { recursive: true });
  for (const [name, body] of Object.entries(buildJurnlParentChildExports())) writeFileSync(`${J.JURNL_FAMILY_DIR}/${name}`, body);
  console.log(`exported to ${J.JURNL_FAMILY_DIR}`);
}
