import { useMemo } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { evaluateBlueprintLightStyleRetryFromPipeline } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateBlueprintLightStyleRetry.js';
import { ensureMobileTwinPipelineDefaults } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { DesignPageV3MobileTwinBlueprintRetryBlock } from './DesignPageV3MobileTwinBlueprintRetryBlock.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

/** Mobile-first strip — RETRY LIGHT BLUEPRINT visible after first twin pair (not buried in pipeline panel). */
export function DesignPageV3MobileTwinBlueprintRetryStrip({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline ? ensureMobileTwinPipelineDefaults(session.mobileTwinPipeline) : undefined;

  const view = useMemo(() => {
    if (!pipeline) return null;
    try {
      return evaluateBlueprintLightStyleRetryFromPipeline(
        pipeline,
        typeof window !== 'undefined' ? window.location.origin : undefined,
      );
    } catch (err) {
      console.error('site00: blueprint retry strip evaluation failed', err);
      return null;
    }
  }, [pipeline]);

  if (!view?.showRetryStrip) return null;

  return <DesignPageV3MobileTwinBlueprintRetryBlock session={session} view={view} onSessionUpdate={onSessionUpdate} />;
}
