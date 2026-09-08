/**
 * B5.0R2 — Loads canonical Entry 002 blueprint + live pipeline state (read-only GET).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../../utils/api.js';
import { expressionEngineApi } from '../../../services/expressionEngineApi';
import { translateExpressionEngineError } from './expressionEngineErrorState';
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
  const [errorView, setErrorView] = useState<ReturnType<typeof translateExpressionEngineError>>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorView(null);
    try {
      const [p2, b48Res, b49Res] = await Promise.all([
        expressionEngineApi.phase2(),
        apiFetch('/api/site00/expression-engine?phase=B48'),
        apiFetch('/api/site00/expression-engine?phase=B49R4&skipGeneration=1'),
      ]);

      if (!b48Res.ok) {
        const text = await b48Res.text();
        throw new Error(text);
      }

      setPhase2(p2);
      setB48((await b48Res.json()) as B48PipelineResponse);
      if (b49Res.ok) {
        setB49r4((await b49Res.json()) as B49R4PipelineResponse);
      } else {
        setB49r4(null);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load Expression Engine';
      setError(msg);
      setErrorView(translateExpressionEngineError(msg));
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
      errorView,
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
    errorView,
    reload: load,
  };
}

export async function postGenerateFinalStoryboard(): Promise<B49R4PipelineResponse> {
  const res = await apiFetch('/api/site00/expression-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'GENERATE_FINAL_STORYBOARD' }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as B49R4PipelineResponse;
}

export async function postImportFounderStoryboard(variant: 'A' | 'B'): Promise<B49R4PipelineResponse> {
  const res = await apiFetch('/api/site00/expression-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'IMPORT_FOUNDER_STORYBOARD', variant }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as B49R4PipelineResponse;
}
