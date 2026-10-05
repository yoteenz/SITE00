import { apiFetch } from '../../../../utils/api.js';
import { promiseWithTimeout } from '../../../../utils/promiseWithTimeout.js';

/** Critical path — blueprint + B48 pipeline (workspace shell). */
export const EXPRESSION_ENGINE_CRITICAL_TIMEOUT_MS = 25_000;

/** Supplementary phases (C1.x, B49R4, NME) — must not block first paint. */
export const EXPRESSION_ENGINE_SUPPLEMENTARY_TIMEOUT_MS = 12_000;

export async function fetchExpressionEnginePhase(
  path: string,
  timeoutMs: number,
): Promise<Response | null> {
  const res = await promiseWithTimeout(apiFetch(path), timeoutMs, null);
  return res;
}
