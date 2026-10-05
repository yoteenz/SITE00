import { describe, expect, it } from 'vitest';
import { throwPageConceptApiFailure } from '../src/site00/services/pageConceptGenerationErrors.js';
import { PAGE_CONCEPT_SIGN_IN_REQUIRED } from '../src/site00/services/pageConceptApiSession.js';

describe('page concept API auth errors', () => {
  it('maps 401 UNAUTHORIZED to sign-in guidance', () => {
    expect(() =>
      throwPageConceptApiFailure(
        {
          ok: false,
          status: 401,
          data: { error: 'UNAUTHORIZED' },
          errorCode: null,
          receipt: {
            requestUrl: 'https://api.site00.com/api/site00/page-concept-generation',
            method: 'POST',
            origin: null,
            statusCode: 401,
            responseReceived: true,
            responseContentType: 'application/json',
            corsHeader: null,
            authHeaderPresent: false,
            requestDurationMs: 1,
            apiBuild: null,
            workerBuild: null,
            contractVersion: null,
            errorCode: null,
            errorMessage: 'UNAUTHORIZED',
          },
        },
        'GENERATION_FAILED',
      ),
    ).toThrow(PAGE_CONCEPT_SIGN_IN_REQUIRED);
  });
});
