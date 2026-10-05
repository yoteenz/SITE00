import type { PageConceptCgptProviderTelemetry } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgpt429.js';

export class PageConceptCgptProviderError extends Error {
  readonly telemetry: PageConceptCgptProviderTelemetry;

  readonly founderCode: string;

  constructor(telemetry: PageConceptCgptProviderTelemetry, founderCode: string) {
    super(founderCode);
    this.name = 'PageConceptCgptProviderError';
    this.telemetry = telemetry;
    this.founderCode = founderCode;
  }
}

export function isPageConceptCgptProviderError(err: unknown): err is PageConceptCgptProviderError {
  return err instanceof PageConceptCgptProviderError;
}
