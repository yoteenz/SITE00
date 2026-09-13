import type { ConceptDirectedTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { getActiveConceptCandidate } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { ConceptDirectedNdxOverviewTwinV2 } from './ConceptDirectedNdxOverviewTwinV2.js';
import { ConceptVisualCompilerTwinV2 } from './ConceptVisualCompilerTwinV2.js';

type Props = {
  projectSlug: string;
  session: ConceptDirectedTwinSession;
};

/**
 * Approved V2 pilot: VISUAL_TO_CODE_COMPILER only.
 * Legacy renderers are historical — not used for new builds.
 */
export function ResolveConceptDirectedTwinV2Renderer({ projectSlug, session }: Props) {
  const active = getActiveConceptCandidate(session);
  const buildMatchesActive =
    session.renderedTwin?.sourceConceptId != null &&
    active?.conceptId != null &&
    session.renderedTwin.sourceConceptId === active.conceptId;

  if (
    buildMatchesActive &&
    (session.renderedTwin?.buildMode === 'VISUAL_TO_CODE_COMPILER' ||
      session.renderedTwin?.componentRef === 'ConceptVisualCompilerTwinV2' ||
      session.twinV2VisualCompiler)
  ) {
    return <ConceptVisualCompilerTwinV2 projectSlug={projectSlug} session={session} />;
  }

  if (session.renderedTwin?.builtAt) {
    return (
      <p className="site00-twin-v2-v2c__error" role="alert">
        TWIN_V2_OLD_RENDERER_INVOKED: rebuild with BUILD THIS CONCEPT to use VISUAL_TO_CODE_COMPILER
      </p>
    );
  }

  return <ConceptDirectedNdxOverviewTwinV2 projectSlug={projectSlug} session={session} />;
}
