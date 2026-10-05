#!/usr/bin/env node
/**
 * P0.STUDIOOS.PRODUCTION.AUTHORITY-TREE.COMPOSER1
 * Generates NODE_MATRIX.md + MANIFEST_SUMMARY.json from nodes.manifest.json (audit-only).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ART = path.join(ROOT, 'artifacts/production-authority-tree');
const manifestPath = path.join(ART, 'nodes.manifest.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const nodes = manifest.nodes;

const statusCounts = {};
for (const n of nodes) {
  statusCounts[n.status] = (statusCounts[n.status] || 0) + 1;
}

const routeNodes = nodes.filter((n) => n.kind === 'route').length;
const interactionNodes = nodes.filter((n) => n.kind === 'interaction').length;
const tempNodes = nodes.filter((n) => n.kind === 'temporary').length;
const responsiveNodes = nodes.filter((n) => n.kind === 'responsive-variant').length;
const sectionNodes = nodes.filter((n) => n.kind === 'section').length;

const lines = [
  '# NODE CLASSIFICATION MATRIX',
  '',
  '**Sprint:** P0.STUDIOOS.PRODUCTION.AUTHORITY-TREE.COMPOSER1',
  `**Generated:** ${new Date().toISOString()}`,
  `**Base SHA:** ${manifest.baseSha}`,
  '',
  'Every node is evaluated against its **parent tab**, **parent route**, and **ProductionAuthorityFrame** shell (`.pxa` + chrome). Status taxonomy is fixed — no generic PASS.',
  '',
  '| ID | Parent | Route / trigger | Viewports | Status | Authority source | Inherited visual | Deviation allowed | Stale fallback risk | Founder review | Notes |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
];

for (const n of nodes) {
  const row = [
    n.id,
    n.parent,
    n.trigger.replace(/\|/g, '\\|'),
    n.viewports,
    n.status,
    n.authoritySource,
    n.inheritedVisual,
    n.deviationAllowed,
    n.staleFallbackRisk,
    n.founderReview,
    (n.notes || '').replace(/\|/g, '\\|').replace(/\n/g, ' '),
  ];
  lines.push(`| ${row.join(' | ')} |`);
}

lines.push('');
lines.push('## Status totals');
lines.push('');
for (const [k, v] of Object.entries(statusCounts).sort()) {
  lines.push(`- **${k}:** ${v}`);
}
lines.push('');
lines.push('## Kind totals');
lines.push('');
lines.push(`- route: ${routeNodes}`);
lines.push(`- section: ${sectionNodes}`);
lines.push(`- interaction: ${interactionNodes}`);
lines.push(`- temporary: ${tempNodes}`);
lines.push(`- responsive-variant: ${responsiveNodes}`);
lines.push(`- **all nodes:** ${nodes.length}`);

fs.writeFileSync(path.join(ART, 'NODE_MATRIX.md'), lines.join('\n'));

const summary = {
  sprint: 'P0.STUDIOOS.PRODUCTION.AUTHORITY-TREE.COMPOSER1',
  baseSha: manifest.baseSha,
  statusCounts,
  routeNodes,
  sectionNodes,
  interactionNodes,
  temporarySurfaces: tempNodes,
  responsiveVariants: responsiveNodes,
  totalNodes: nodes.length,
  genericizationRisks: manifest.genericizationRisks?.length ?? 0,
  staleFallbacks: manifest.staleFallbacks?.length ?? 0,
  authorityConflicts: manifest.authorityConflicts?.length ?? 0,
  responsiveAuthorityFailures: manifest.responsiveAuthorityFailures?.length ?? 0,
};

fs.writeFileSync(path.join(ART, 'MANIFEST_SUMMARY.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
