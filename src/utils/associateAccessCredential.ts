import { site00AccessApi } from '../site00/services/accessCredentialApi';
import {
  getOrCreateAccessVisitSessionId,
  readActiveAccessCredential,
} from '../site00/utils/accessCredentialSession';
import { trackActivity } from './activity';

/** Associate active access credential with authenticated user after sign-in. */
export async function associateActiveAccessCredentialIfPresent(): Promise<void> {
  const active = readActiveAccessCredential();
  if (!active?.code) return;

  try {
    const sessionId = getOrCreateAccessVisitSessionId();
    const result = await site00AccessApi.associate(active.code, sessionId);
    if (result.ok) {
      trackActivity('access_credential_associated', { code: active.code });
    }
  } catch {
    /* non-blocking */
  }
}
