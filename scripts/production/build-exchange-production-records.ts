/**
 * Writes THE EXCHANGE pilot production records (repository JSON, D-03) for the S1-01-SH01 first-take setup:
 * the planning budget, the shot setup and its three DRAFT jobs. No take, asset or approval is written; nothing is
 * generated, reserved or spent. Re-running is a no-op; if the packet or quotes changed, the store reports a
 * conflict instead of overwriting.
 *
 *   npx tsx scripts/production/build-exchange-production-records.ts
 */
import { jsonFileStore } from '../../shared/site00-production-spine/node/jsonStore.js';
import { buildSh01Records, EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR } from '../../shared/site00-production-spine/projects/theExchange.js';
import { verifyStoreIntegrity } from '../../shared/site00-production-spine/store.js';
import { repoPath } from '../../shared/site00-fiction-production/paths.js';

const root = process.cwd();
const store = jsonFileStore(repoPath(EXCHANGE_RECORDS_DIR, root), { projectId: EXCHANGE_PROJECT_ID, live: true });
const { budget, shot, jobs } = buildSh01Records(root);
for (const rec of [budget, shot, ...jobs]) {
  const { created } = await store.create(rec);
  console.log(`${created ? 'wrote' : 'unchanged'} ${rec.kind}/${rec.id}`);
}
const problems = await verifyStoreIntegrity(store);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`integrity: ${[budget, shot, ...jobs].length} records, 0 problems`);
