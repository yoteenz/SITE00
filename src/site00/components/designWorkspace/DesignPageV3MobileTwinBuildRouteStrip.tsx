import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { shouldShowBuildTwinDesignRoute } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/shouldShowBuildTwinDesignRoute.js';
import { DesignPageV3MobileTwinBuildRouteBlock } from './DesignPageV3MobileTwinBuildRouteBlock.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
};

/** Sticky strip — BUILD TWIN visible right after package approval (not buried in pipeline actions). */
export function DesignPageV3MobileTwinBuildRouteStrip({ session }: Props) {
  if (!shouldShowBuildTwinDesignRoute(session)) return null;
  return <DesignPageV3MobileTwinBuildRouteBlock session={session} />;
}
