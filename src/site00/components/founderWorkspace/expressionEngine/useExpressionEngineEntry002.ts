/**
 * B5.0 — Loads canonical Entry 002 blueprint + live pipeline state.
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../../utils/api.js';
import { expressionEngineApi } from '../../../services/expressionEngineApi';
import type {
  B48PipelineResponse,
  B49R4PipelineResponse,
  ExpressionEngineEntry002State,
} from './types';

export function useExpressionEngineEntry002(): ExpressionEngineEntry002State {
  const [phase2, setPhase2] = useState<ExpressionEngineEntry002State['phase2'] | null>(null);
  const [b48, setB48] = useState<B48PipelineResponse | null>(null);
  const [b49r4, setB49r4] = useState<B49R4PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p2, b48Res, b49Res] = await Promise.all([
        expressionEngineApi.phase2(),
        apiFetch('/api/site00/expression-engine?phase=B48'),
        apiFetch('/api/site00/expression-engine?phase=B49R4&skipGeneration=1'),
      ]);

      if (!b48Res.ok) throw new Error(await b48Res.text());
      // B49R4 may fail without FAL_KEY in dev — workspace degrades to B48 + blueprint

      setPhase2(p2);
      setB48((await b48Res.json()) as B48PipelineResponse);
      if (b49Res.ok) {
        setB49r4((await b49Res.json()) as B49R4PipelineResponse);
      } else {
        setB49r4(null);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load Expression Engine';
      setError(
        msg.includes('Unexpected token') || msg.includes('<!DOCTYPE')
          ? 'Expression Engine API unavailable — redeploy Railway API from main, or use local dev with npm run dev'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!phase2) {
    return {
      phase2: null!,
      blueprint: null!,
      b48,
      b49r4,
      loading,
      error,
      reload: load,
    };
  }

  return {
    phase2,
    blueprint: phase2.blueprint,
    b48,
    b49r4,
    loading,
    error,
    reload: load,
  };
}
