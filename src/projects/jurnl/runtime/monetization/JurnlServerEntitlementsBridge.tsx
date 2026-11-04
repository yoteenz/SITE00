/**
 * Loads SERVER_VERIFIED entitlements after auth; keeps presentation preview separate from authorization.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getSupabase } from '../../../../utils/supabase';
import { fetchServerEntitlements, offlineEntitlements } from '../../data/monetization/fetchServerEntitlements';
import { resolveJurnlProductionConfig } from '../../data/production/productionConfig';
import { useJurnl } from '../state/store';
import { JurnlEntitlementsProvider } from './JurnlEntitlements';
import { JurnlPlanPreviewIndicator } from './JurnlPlanPreviewIndicator';
import type { PlanPreviewState } from './presentationEntitlements';
import type { ResolvedEntitlements } from '../../../../../shared/site00-monetization/entitlements.js';

export type EntitlementLoadState = 'UNRESOLVED' | 'LOADING' | 'RESOLVED' | 'FAILED' | 'SIGNED_OUT';

const LoadCtx = createContext<EntitlementLoadState>('UNRESOLVED');

export const useJurnlEntitlementLoadState = () => useContext(LoadCtx);

export function JurnlServerEntitlementsBridge({ mode, children }: { mode: 'design-preview' | 'production'; children: ReactNode }) {
  const { session } = useJurnl();
  const config = useMemo(() => resolveJurnlProductionConfig(mode), [mode]);
  const [loadState, setLoadState] = useState<EntitlementLoadState>('UNRESOLVED');
  const [authorization, setAuthorization] = useState<ResolvedEntitlements | null>(null);
  const [preview, setPreview] = useState<PlanPreviewState | null>(null);
  const requestSeq = useRef(0);
  const signedInUserId = session.status === 'ACTIVE' ? session.authPrincipalId : null;

  useEffect(() => {
    if (mode === 'design-preview') {
      setLoadState('RESOLVED');
      setAuthorization(null);
      setPreview(null);
      return;
    }
    if (session.status !== 'ACTIVE' || !signedInUserId) {
      requestSeq.current += 1;
      setLoadState('SIGNED_OUT');
      setAuthorization(null);
      setPreview(null);
      return;
    }
    if (!config.serverPersistenceConfigured || !config.apiBase) {
      setLoadState('FAILED');
      setAuthorization(offlineEntitlements());
      setPreview(null);
      return;
    }

    const seq = ++requestSeq.current;
    setLoadState('LOADING');
    void (async () => {
      const sb = getSupabase();
      const sessionRes = await sb?.auth.getSession();
      const token = sessionRes?.data.session?.access_token;
      if (!token || seq !== requestSeq.current) return;
      const payload = await fetchServerEntitlements(config.apiBase, token);
      if (seq !== requestSeq.current) return;
      if (!payload) {
        setLoadState('FAILED');
        setAuthorization(offlineEntitlements());
        setPreview(null);
        return;
      }
      setAuthorization(payload.authorization);
      setPreview(payload.presentation);
      setLoadState('RESOLVED');
    })();
  }, [mode, session.status, signedInUserId, config.serverPersistenceConfigured, config.apiBase]);

  const providerAuthorization = mode === 'design-preview' ? undefined : authorization ?? undefined;

  return (
    <LoadCtx.Provider value={loadState}>
      <JurnlEntitlementsProvider mode={mode} authorization={providerAuthorization} planPreview={preview}>
        <JurnlPlanPreviewIndicator preview={preview} />
        {children}
      </JurnlEntitlementsProvider>
    </LoadCtx.Provider>
  );
}
