import { useCallback, useState } from 'react';
import { apiFetch } from '../../utils/api';
import type { ExistingLocationCaseRecord, ExistingLocationQuote } from '../../../shared/site00-existing-location/types';

type CasePayload = {
  case: ExistingLocationCaseRecord;
  quote: ExistingLocationQuote | null;
  events: unknown[];
};

export function useExistingLocationCase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async <T,>(body: Record<string, unknown>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/existing-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Request failed');
      return json as T;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const startCase = useCallback(
    (email?: string) => call<{ case: ExistingLocationCaseRecord }>({ action: 'start', email }),
    [call],
  );

  const updateIntake = useCallback(
    (id: string, patch: Record<string, unknown>) => call<{ case: ExistingLocationCaseRecord }>({ action: 'update-intake', id, ...patch }),
    [call],
  );

  const submitIntake = useCallback(
    (id: string) => call<{ case: ExistingLocationCaseRecord }>({ action: 'submit-intake', id }),
    [call],
  );

  const fetchCase = useCallback(async (id: string): Promise<CasePayload> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/site00/existing-location?action=get&id=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Not found');
      return json as CasePayload;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveQuote = useCallback((id: string) => call<{ case: ExistingLocationCaseRecord }>({ action: 'approve-quote', id }), [call]);

  const previewCourtesy = useCallback(
    (id: string, code: string, email?: string) =>
      call<{ ok: true; discount_cents: number; final_total_cents: number }>({
        action: 'preview-courtesy',
        id,
        code,
        email,
      }),
    [call],
  );

  const completeCheckout = useCallback(
    (id: string, code?: string, email?: string) =>
      call<{ case: ExistingLocationCaseRecord }>({ action: 'complete-checkout', id, code, email }),
    [call],
  );

  return {
    loading,
    error,
    startCase,
    updateIntake,
    submitIntake,
    fetchCase,
    approveQuote,
    previewCourtesy,
    completeCheckout,
  };
}
