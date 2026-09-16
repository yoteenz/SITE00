/**
 * P0.VR.OPUS-NATIVE1 — `/projects/:projectSlug/design/opus-native`
 *
 * Internal surface for the native Opus design runtime. Isolated on its own
 * route: it shares no component, stylesheet or state with the canonical
 * DESIGN workspace, so the runtime can be exercised without any risk to
 * approved design work.
 */

import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { OpusNativeAgentPanel } from '../components/designBench/opusNative/OpusNativeAgentPanel';
import { OpusNativeProofSurface } from '../components/designBench/opusNative/OpusNativeProofSurface';
import type { OpusNativeRun } from '../../../shared/site00-opus-native/types';
import '../styles/site00-opus-native.css';

export function DesignOpusNativePage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<OpusNativeRun | null>(null);
  const handleRunChange = useCallback((next: OpusNativeRun | null) => setRun(next), []);

  const route = `/projects/${projectSlug.toLowerCase()}/design/opus-native`;

  return (
    <main className="s00-opus-native">
      <header className="s00-opus-native__head">
        <span className="s00-opus-native__title">Native Opus design runtime</span>
        <span className="s00-opus-native__sub">P0.VR.OPUS-NATIVE1 · internal</span>
      </header>

      <div className="s00-opus-native__grid">
        <OpusNativeAgentPanel
          projectSlug={projectSlug}
          route={route}
          pageId="opus-native-proof"
          onRunChange={handleRunChange}
        />
        <OpusNativeProofSurface projectSlug={projectSlug} runtimeStatus={run?.status ?? 'READY'} />
      </div>
    </main>
  );
}

export default DesignOpusNativePage;
