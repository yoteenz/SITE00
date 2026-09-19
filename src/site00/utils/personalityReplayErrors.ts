import { Site00ProjectsApiError } from '../services/site00ProjectsApi';

export function isReplayNotFoundError(err: unknown): boolean {
  if (err instanceof Site00ProjectsApiError) {
    if (err.status === 404) return true;
    const msg = err.message.toLowerCase();
    return msg.includes('replay not found') || msg.includes('replay_not_found');
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes('replay not found') || msg.includes('replay_not_found');
  }
  return false;
}
