import fs from 'node:fs';
import * as X from '../../shared/site00-fiction-production/index.js';

/** Writes the living-world promotion ledger and the recurring-background registry, after the promotion validates. Run build-season1-production.ts first so the master carries the amendments. */
const root = process.cwd();
const P = X.Promotion;
const errors = P.promotionErrors(P.validatePromotion(root));
if (errors.length) throw new Error(`promotion: ${errors.join('; ')}`);
for (const [rel, v] of [
  [P.PROMOTION_LEDGER_PATH, P.buildPromotionLedger()],
  [P.BACKGROUND_REGISTRY_PATH, P.buildBackgroundRegistry()],
] as const) {
  fs.writeFileSync(X.repoPath(rel, root), `${JSON.stringify(v, null, 2)}\n`);
  console.log(`wrote ${rel}`);
}
