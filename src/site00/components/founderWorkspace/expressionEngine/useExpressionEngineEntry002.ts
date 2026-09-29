/**
 * B5.0R2 — Loads canonical Entry 002 blueprint + live pipeline state (read-only GET).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../../utils/api.js';
import { expressionEngineApi } from '../../../services/expressionEngineApi';
import { translateExpressionEngineError } from './expressionEngineErrorState';
import { loadMeridianComparisonForWorkspace } from './loadC19R3MeridianComparisonViaJob.js';
import {
  EXPRESSION_ENGINE_CRITICAL_TIMEOUT_MS,
  EXPRESSION_ENGINE_SUPPLEMENTARY_TIMEOUT_MS,
  fetchExpressionEnginePhase,
} from './expressionEnginePhaseFetch.js';
import { promiseWithTimeout } from '../../../../utils/promiseWithTimeout.js';
import type {
  B48PipelineResponse,
  B49R4PipelineResponse,
  C1NarrativeSynthesisResponse,
  ExpressionEngineEntry002State,
  Nme1NarrativeMomentumResponse,
} from './types';

export function useExpressionEngineEntry002(): ExpressionEngineEntry002State {
  const [phase2, setPhase2] = useState<ExpressionEngineEntry002State['phase2'] | null>(null);
  const [b48, setB48] = useState<B48PipelineResponse | null>(null);
  const [b49r4, setB49r4] = useState<B49R4PipelineResponse | null>(null);
  const [c1, setC1] = useState<C1NarrativeSynthesisResponse | null>(null);
  const [nme, setNme] = useState<Nme1NarrativeMomentumResponse | null>(null);
  const [c11, setC11] = useState<import('./types.js').C11CreativeDirectorResponse | null>(null);
  const [c12, setC12] = useState<import('./types.js').C12Entry003Response | null>(null);
  const [c16, setC16] = useState<import('./types.js').ExpressionEngineEntry002State['c16']>(null);
  const [c19r1, setC19r1] = useState<import('./types.js').ExpressionEngineEntry002State['c19r1']>(null);
  const [loading, setLoading] = useState(true);
  const [c19r1Loading, setC19r1Loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorView, setErrorView] = useState<ReturnType<typeof translateExpressionEngineError>>(null);

  const loadMeridian = useCallback(async () => {
    setC19r1Loading(true);
    try {
      const view = await loadMeridianComparisonForWorkspace();
      setC19r1(view ? { view } : null);
    } catch {
      setC19r1(null);
    } finally {
      setC19r1Loading(false);
    }
  }, []);

  const loadSupplementaryPhases = useCallback(async () => {
    const timeout = EXPRESSION_ENGINE_SUPPLEMENTARY_TIMEOUT_MS;
    const [b49Res, nmeRes, c1Res, c11Res, c12Res, c16Res, c17Res] = await Promise.all([
      fetchExpressionEnginePhase('/api/site00/expression-engine?phase=B49R4&skipGeneration=1', timeout),
      fetchExpressionEnginePhase('/api/site00/expression-engine?phase=NME1', timeout),
      fetchExpressionEnginePhase('/api/site00/expression-engine?phase=C1', timeout),
      fetchExpressionEnginePhase('/api/site00/expression-engine?phase=C1.1', timeout),
      fetchExpressionEnginePhase('/api/site00/expression-engine?phase=C1.4', timeout),
      fetchExpressionEnginePhase('/api/site00/expression-engine?phase=C1.6', timeout),
      fetchExpressionEnginePhase('/api/site00/expression-engine?phase=C1.7', timeout),
    ]);

    if (b49Res?.ok) {
      setB49r4((await b49Res.json()) as B49R4PipelineResponse);
    }
    if (nmeRes?.ok) {
      setNme((await nmeRes.json()) as Nme1NarrativeMomentumResponse);
    }
    if (c1Res?.ok) {
      setC1((await c1Res.json()) as C1NarrativeSynthesisResponse);
    }
    if (c11Res?.ok) {
      setC11((await c11Res.json()) as import('./types.js').C11CreativeDirectorResponse);
    }
    if (c12Res?.ok) {
      setC12((await c12Res.json()) as import('./types.js').C12Entry003Response);
    }
    if (c16Res?.ok) {
      const body = (await c16Res.json()) as {
        multiUnitBlindCampaign: import('./MultiUnitCreativePackageReview.js').MultiUnitCampaignReviewData & {
          copyPackage?: import('./MultiUnitCreativePackageReview.js').MultiUnitCampaignReviewData['copyPackage'];
        };
      };
      setC16({ multiUnitBlindCampaign: body.multiUnitBlindCampaign });
    }
    if (c17Res?.ok) {
      const body = (await c17Res.json()) as {
        multiUnitBlindCampaign: import('./MultiUnitCreativePackageReview.js').MultiUnitCampaignReviewData;
      };
      setC16({ multiUnitBlindCampaign: body.multiUnitBlindCampaign });
    }
  }, []);

  const loadCore = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorView(null);
    try {
      const criticalTimeout = EXPRESSION_ENGINE_CRITICAL_TIMEOUT_MS;
      const [p2, b48Res] = await Promise.all([
        promiseWithTimeout(expressionEngineApi.phase2(), criticalTimeout, null),
        fetchExpressionEnginePhase('/api/site00/expression-engine?phase=B48', criticalTimeout),
      ]);

      if (!p2) {
        throw new Error('Expression Engine blueprint timed out — check connection and retry.');
      }
      if (!b48Res?.ok) {
        const text = b48Res ? await b48Res.text() : 'B48 pipeline timed out';
        throw new Error(text);
      }

      setPhase2(p2);
      setB48((await b48Res.json()) as B48PipelineResponse);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load Expression Engine';
      setError(msg);
      setErrorView(translateExpressionEngineError(msg));
    } finally {
      setLoading(false);
    }

    void loadSupplementaryPhases();
  }, [loadSupplementaryPhases]);

  const reload = useCallback(async () => {
    await loadCore();
    void loadMeridian();
  }, [loadCore, loadMeridian]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  useEffect(() => {
    void loadMeridian();
  }, [loadMeridian]);

  if (!phase2) {
    return {
      phase2: null!,
      blueprint: null!,
      b48,
      b49r4,
      nme,
      c1,
      c11,
      c12,
      c16,
      c19r1,
      loading,
      c19r1Loading,
      error,
      errorView,
      reload,
    };
  }

  return {
    phase2,
    blueprint: phase2.blueprint,
    b48,
    b49r4,
    nme,
    c1,
    c11,
    c12,
    c16,
    c19r1,
    loading,
    c19r1Loading,
    error,
    errorView,
    reload,
  };
}

export async function postMeridianComparisonJudgment(args: {
  founderJudgment: string;
  comparisonId?: string;
}): Promise<void> {
  const res = await apiFetch('/api/site00/expression-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'SET_MERIDIAN_COMPARISON_JUDGMENT', ...args }),
  });
  if (!res.ok) throw new Error(await res.text());
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
