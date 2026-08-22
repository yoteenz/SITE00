import type { BldrHubStage } from '../../../config/bldr-hub-stages';
import { BldrStageArtwork } from './BldrStageArtwork';

type BldrStageProps = {
  stage: BldrHubStage;
  isLast?: boolean;
};

export function BldrStage({ stage, isLast = false }: BldrStageProps) {
  return (
    <article className="site00-bldr-mobile-stage">
      <div className="site00-bldr-mobile-stage__spine-node" aria-hidden="true" />
      <div className="site00-bldr-mobile-stage__inner">
        <div className="site00-bldr-mobile-stage__label-col">
          <span className="site00-bldr-mobile-stage__num">{stage.num}</span>
          <span className="site00-bldr-mobile-stage__micro">{stage.microLabel}</span>
        </div>
        <div className="site00-bldr-mobile-stage__content">
          <h2 className="site00-bldr-mobile-stage__title">{stage.title}</h2>
          <p className="site00-bldr-mobile-stage__body">{stage.body}</p>
        </div>
        <BldrStageArtwork variant={stage.artwork} />
      </div>
      {!isLast ? <div className="site00-bldr-mobile-stage__divider" aria-hidden="true" /> : null}
    </article>
  );
}
