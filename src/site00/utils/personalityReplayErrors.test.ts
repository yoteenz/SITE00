import { describe, expect, it } from 'vitest';
import { Site00ProjectsApiError } from '../services/site00ProjectsApi';
import { isReplayNotFoundError } from './personalityReplayErrors';

describe('isReplayNotFoundError', () => {
  it('detects 404 projects API errors', () => {
    expect(
      isReplayNotFoundError(
        new Site00ProjectsApiError('Replay not found', {
          status: 404,
          contentType: 'application/json',
          responseCategory: 'json',
          endpoint: '/test',
        }),
      ),
    ).toBe(true);
  });

  it('detects internal error message text', () => {
    expect(isReplayNotFoundError(new Error('Replay not found'))).toBe(true);
  });
});
