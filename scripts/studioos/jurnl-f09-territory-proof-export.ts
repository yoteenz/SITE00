/**
 * P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1 — export the F09 territory proof
 * (single source: shared/studioos-visual-authority/projects/jurnl/f09-safe-to-spend.ts).
 *
 *   npx tsx scripts/studioos/jurnl-f09-territory-proof-export.ts
 *
 * F09_TERRITORY_PROOF_REGISTRY.json is GENERATED — edit the TypeScript, never the JSON. The markdown contracts beside it
 * are hand-written. tests/jurnlF09VisualAuthorityTerritoryProof1.test.ts keeps the export in sync.
 */
import { writeFileSync } from 'node:fs';
import { jurnlF09, territoryRow, visualAuthorityRow } from '../../shared/studioos-visual-authority/index.js';

export const JURNL_F09_PROOF_FILE = `${jurnlF09.JURNL_F09_PACKAGE_DIR}/F09_TERRITORY_PROOF_REGISTRY.json`;

export function buildJurnlF09ProofExport(): string {
  const status = jurnlF09.jurnlF09ProofStatus();
  return `${JSON.stringify(
    {
      id: 'JURNL_F09_TERRITORY_PROOF_REGISTRY',
      sprint: jurnlF09.JURNL_F09_SPRINT,
      generated_by: 'scripts/studioos/jurnl-f09-territory-proof-export.ts',
      source: 'shared/studioos-visual-authority/projects/jurnl/f09-safe-to-spend.ts',
      end_state: { territories: jurnlF09.JURNL_F09_TERRITORIES.length, reference_candidates: jurnlF09.JURNL_F09_REFERENCES.length, founder_verdict: status.founder_verdict, page_family_authority: 'NOT_LOCKED', implementation: 'NO' },
      gate: { state: status.gate.state, guard: status.gate.guard, durable_rule: status.gate.durable_rule, conditions: status.gate.conditions, next_step: status.gate.next_step, reasons: status.gate.reasons },
      step_checks: { brand: status.brand, legacy: status.legacy, territories: status.territories, references: status.references },
      legacy_visual_leak_count: status.legacy_visual_leak_count,
      registry_row: visualAuthorityRow(jurnlF09.jurnlF09GateInput(), jurnlF09.JURNL_F09_AT),
      territory_rows: jurnlF09.JURNL_F09_TERRITORIES.map(territoryRow),
      territory_structure: Object.fromEntries(jurnlF09.JURNL_F09_TERRITORIES.map((t) => [t.territory_id, t.structure])),
      references: jurnlF09.JURNL_F09_REFERENCES,
      sample_values: jurnlF09.JURNL_F09_SAMPLE_VALUES,
      brand_context: jurnlF09.JURNL_BRAND_CONTEXT,
      legacy_surfaces: jurnlF09.JURNL_F09_LEGACY_SURFACES,
      legacy_uses: jurnlF09.JURNL_F09_LEGACY_USES,
      upstream_scorecard: jurnlF09.JURNL_F09_UPSTREAM_SCORECARD,
      upstream_verdict: jurnlF09.JURNL_F09_UPSTREAM_VERDICT,
    },
    null,
    2,
  )}\n`;
}

if (process.argv[1] && /jurnl-f09-territory-proof-export\.ts$/.test(process.argv[1])) {
  writeFileSync(JURNL_F09_PROOF_FILE, buildJurnlF09ProofExport());
  console.log(`exported ${JURNL_F09_PROOF_FILE}`);
}
