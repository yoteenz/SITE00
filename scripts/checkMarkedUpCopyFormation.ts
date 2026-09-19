/**
 * Quick check — THE MARKED-UP COPY production completeness in v1 formation.
 */
import { getFormationRecordById } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationStore/storeAdapter.js';
import {
  assessDirectionProductionCompleteness,
  normalizeFormedDirection,
} from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionFieldContract.js';
import { applyDirectionCompletionOverlays } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionCompletionService.js';
import { NDXBOOK_V1_FORMATION_ID } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/founderComparisonSet.js';

async function main() {
  const v1 = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);
  if (!v1) {
    console.log(JSON.stringify({ error: 'NO_V1' }));
    return;
  }
  const dir = v1.finalDirections.find((d) => d.directionName === 'THE MARKED-UP COPY');
  if (!dir) {
    console.log(JSON.stringify({ error: 'NO_DIRECTION' }));
    return;
  }
  const overlay = v1.directionCompletionOverlays?.find((o) => o.directionId === dir.directionId) ?? null;
  const merged = overlay
    ? applyDirectionCompletionOverlays([dir], [overlay])[0]!
    : normalizeFormedDirection(dir);
  const c = assessDirectionProductionCompleteness(merged);
  console.log(
    JSON.stringify(
      {
        directionId: dir.directionId,
        hasOverlay: Boolean(overlay),
        overlaysCount: v1.directionCompletionOverlays?.length ?? 0,
        complete: c.complete,
        missingFields: c.missingFields,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
