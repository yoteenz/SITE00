import { validateContinuity } from '../../shared/site00-fiction-production/continuity.js';
import { loadAssetRegistry, loadDialogueRegistry } from '../../shared/site00-fiction-production/registries.js';
import { estimateRuntime, loadScreenplays, validateScreenplay } from '../../shared/site00-fiction-production/screenplay.js';
import { buildSeasonMaster } from '../../shared/site00-fiction-production/seasonMaster.js';
import { loadPriceQuotes, planShots, summarizeCost } from '../../shared/site00-fiction-production/shotPlanner.js';
import { silentRelease } from '../../shared/site00-fiction-production/continuity.js';

/** Read-only report: parse, validate, estimate and plan every screenplay in SEASON_1/SCREENPLAYS. Writes nothing. */
const master = buildSeasonMaster();
const dialogue = loadDialogueRegistry();
const assets = loadAssetRegistry();
const quotes = loadPriceQuotes();
const docs = loadScreenplays();
const silentReleases = master.releases.filter((r) => silentRelease(master, r.id)).map((r) => r.id);
let hard = 0;
for (const d of docs) {
  const id = d.meta.identity.releaseId;
  const findings = validateScreenplay(d, { master, dialogue, assets, silentReleases });
  const rt = estimateRuntime(d);
  const plan = planShots(d, assets, quotes);
  const cost = summarizeCost(plan);
  hard += findings.filter((f) => f.severity === 'HARD_CONFLICT').length;
  console.log(`${id}: ${d.scenes.length} scenes, ${rt.estimatedSec}s / ${rt.targetSec}s (${rt.ratio}, ${rt.band}); shots ${plan.shots.length} = ${plan.totalSec}s; est $${cost.usd} / ${cost.credits} cr`);
  for (const f of findings) console.log(`  [${f.severity}] ${f.check}: ${f.detail}`);
  for (const w of plan.warnings) console.log(`  [PLAN] ${w}`);
}
const cont = validateContinuity({ master, dialogue, assets, screenplays: docs });
for (const f of cont.filter((x) => x.severity !== 'OPEN_QUESTION')) console.log(`[${f.severity}] ${f.check} ${f.releases.join(',')}: ${f.detail}`);
hard += cont.filter((f) => f.severity === 'HARD_CONFLICT').length;
console.log(`hard conflicts: ${hard}`);
process.exitCode = hard ? 1 : 0;
