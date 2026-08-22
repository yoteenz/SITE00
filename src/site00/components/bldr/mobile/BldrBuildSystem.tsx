import { BLDR_HUB_STAGES } from '../../../config/bldr-hub-stages';
import { BldrStage } from './BldrStage';

export function BldrBuildSystem() {
  return (
    <section className="site00-bldr-mobile-system" aria-label="BUILD SYSTEM">
      <div className="site00-bldr-mobile-system__spine" aria-hidden="true" />
      <div className="site00-bldr-mobile-system__stages">
        {BLDR_HUB_STAGES.map((stage, index) => (
          <BldrStage key={stage.num} stage={stage} isLast={index === BLDR_HUB_STAGES.length - 1} />
        ))}
      </div>
    </section>
  );
}
