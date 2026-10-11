import { createHash } from 'node:crypto';
import type { DigitalFoundationIntake, DigitalFoundationQuote } from '../types.js';

export function computeScopeHash(input: {
  quote: DigitalFoundationQuote;
  intake: DigitalFoundationIntake;
  project_config: Record<string, unknown>;
}): string {
  const payload = JSON.stringify({
    base: input.quote.base_service_version,
    quote_version: input.quote.quote_version,
    addons: input.quote.selected_addons,
    needs: input.quote.artifact_id ? input.intake.needs : [],
    intake: {
      existing_domain: input.intake.existing_domain,
      team_size: input.intake.team_size,
    },
    config: input.project_config,
  });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}
