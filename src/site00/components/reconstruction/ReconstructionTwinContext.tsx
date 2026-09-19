/**
 * P0.VR.UPGRADE.2 — Twin preview context (isolated visual layer, no live mutation).
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { ReconstructionTwinStyleLayer } from './ReconstructionTwinStyleLayer.js';

type ReconstructionTwinContextValue = {
  session: ReconstructionTwinSession;
  isTwin: true;
};

const ReconstructionTwinContext = createContext<ReconstructionTwinContextValue | null>(null);

export function ReconstructionTwinProvider({
  session,
  children,
}: {
  session: ReconstructionTwinSession;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ session, isTwin: true as const }), [session]);
  return (
    <ReconstructionTwinContext.Provider value={value}>
      <div
        className="site00-reconstruction-twin-root"
        data-reconstruction-twin={session.sessionId}
        data-twin-viewport={session.viewport}
      >
        <ReconstructionTwinStyleLayer session={session} />
        {children}
      </div>
    </ReconstructionTwinContext.Provider>
  );
}

export function useReconstructionTwin(): ReconstructionTwinContextValue | null {
  return useContext(ReconstructionTwinContext);
}
