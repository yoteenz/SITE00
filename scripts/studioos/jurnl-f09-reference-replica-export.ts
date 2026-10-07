/**
 * P0.JURNL.F09.REFERENCE-REPLICA1 — export the replica manifest and the 4K regeneration job pack
 * (single source: shared/studioos-visual-authority/projects/jurnl/f09-reference-replica.ts).
 *
 *   npx tsx scripts/studioos/jurnl-f09-reference-replica-export.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { jurnlF09Replica as R } from '../../shared/studioos-visual-authority/index.js';

const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, sprint: R.REFERENCE_REPLICA_SPRINT, generated_by: 'scripts/studioos/jurnl-f09-reference-replica-export.ts' });

function jobsMarkdown(): string {
  const lines = [
    '# SAFE TO SPEND replicas — 4K regeneration jobs',
    '',
    `Generated from \`shared/studioos-visual-authority/projects/jurnl/f09-reference-replica.ts\`. ${R.REGEN_JOBS.length} jobs.`,
    '',
    `- **Isolate:** ${R.REGEN_ROUTE.isolate}`,
    `- **Regenerate:** ${R.REGEN_ROUTE.regenerate}`,
    `- **Status:** ${R.REGEN_ROUTE.status}`,
    `- **Replace:** ${R.REGEN_ROUTE.replace_rule}`,
    `- **Preflight:** ${R.REGEN_ROUTE.preflight}`,
    '',
  ];
  for (const j of R.REGEN_JOBS) {
    lines.push(`## ${j.id}`, '', `- **File:** \`${R.REPLICA_RUNTIME_ASSETS}/${j.file}\``, `- **Reference:** \`${R.REFERENCE_REPLICA_DIR}/REFERENCES/${j.reference}\``, `- **Target:** ${j.target_px.w} × ${j.target_px.h}`, '', '**Grok — isolate**', '', '```text', j.grok_isolate, '```', '', '**OpenArt Sunburst — regenerate**', '', '```text', j.openart_sunburst, '```', '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

export function buildJurnlF09ReplicaExports(): Record<string, string> {
  return {
    'REPLICA_MANIFEST.json': json({
      ...head('REPLICA_MANIFEST'),
      stage: R.REPLICA_STAGE,
      references: R.REPLICA_REFERENCES,
      layout: R.REPLICA_LAYOUT,
      runtime_assets: R.REPLICA_RUNTIME_ASSETS,
      tools: R.REPLICA_TOOLS,
      screens: R.REPLICA_SCREENS,
      assets: R.REPLICA_ASSETS.map((a) => ({ ...a, covers_pt: R.coversPt(a) })),
      asset_quality: R.REPLICA_ASSET_QUALITY,
      decisions: R.REPLICA_DECISIONS,
    }),
    'REGEN_4K_JOBS.json': json({ ...head('REGEN_4K_JOBS'), route: R.REGEN_ROUTE, jobs: R.REGEN_JOBS }),
    'REGEN_4K_JOBS.md': jobsMarkdown(),
  };
}

if (process.argv[1] && /jurnl-f09-reference-replica-export\.ts$/.test(process.argv[1])) {
  mkdirSync(R.REFERENCE_REPLICA_DIR, { recursive: true });
  for (const [name, body] of Object.entries(buildJurnlF09ReplicaExports())) writeFileSync(`${R.REFERENCE_REPLICA_DIR}/${name}`, body);
  console.log(`exported to ${R.REFERENCE_REPLICA_DIR}`);
}
