/**
 * Founder session required for page-concept-generation on api.site00.com (unlike capture snapshots).
 */
import { refreshAccessTokenForApi, getAccessToken } from '../../utils/api.js';
import { isSite00PreviewTunnelHost } from '../components/loader/site00PreviewHost.js';

export const PAGE_CONCEPT_SIGN_IN_REQUIRED =
  'SIGN IN REQUIRED — GENERATE calls api.site00.com. Open Ctrl Room, sign in (or refresh session), then retry.';

export async function ensurePageConceptApiAccessToken(): Promise<string> {
  let token = await refreshAccessTokenForApi();
  if (!token) token = await getAccessToken();
  if (token) return token;

  if (isSite00PreviewTunnelHost()) {
    throw new Error(
      `${PAGE_CONCEPT_SIGN_IN_REQUIRED} Preview tunnel (fsbw-dev) does not share production cookies — sign in on this tab first.`,
    );
  }
  throw new Error(PAGE_CONCEPT_SIGN_IN_REQUIRED);
}
