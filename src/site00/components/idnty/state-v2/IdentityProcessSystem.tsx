import { Link } from 'react-router-dom';
import type { IdntyProcessStrip } from '../../../config/idnty-assessment';
import { SITE00_ROUTES } from '../../../config/routes';

const PROCESS_EMPHASIS: Record<string, number[]> = {
  'starting-at-zero': [0, 1],
  'some-pieces-exist': [1, 2],
  'ready-for-evolution': [0, 2],
  'build-ready': [3],
};

type IdentityProcessSystemProps = {
  strip: IdntyProcessStrip;
  stateId: string;
};

export function IdentityProcessSystem({ strip, stateId }: IdentityProcessSystemProps) {
  const emphasize = PROCESS_EMPHASIS[stateId] ?? [];

  return (
    <section className="site00-idnty-state-v2__process" aria-label="YOUR IDENTITY. OUR PROCESS.">
      <header className="site00-idnty-state-v2__process-header">
        <h2 className="site00-idnty-state-v2__process-title">YOUR IDENTITY. OUR PROCESS.</h2>
        <Link to={strip.leadHref ?? SITE00_ROUTES.support} className="site00-idnty-state-v2__process-link">
          {strip.leadLinkLabel ?? 'HOW WE WORK →'}
        </Link>
      </header>
      <div className="site00-idnty-state-v2__process-rail" aria-hidden="true" />
      <ol className="site00-idnty-state-v2__process-steps">
        {strip.steps.slice(0, 4).map((step, index) => {
          const num = String(index + 1).padStart(2, '0');
          const active = emphasize.includes(index);
          return (
            <li
              key={step.id}
              className={`site00-idnty-state-v2__process-step ${active ? 'site00-idnty-state-v2__process-step--emphasis' : ''}`.trim()}
            >
              <span className="site00-idnty-state-v2__process-num">{num}</span>
              <div className="site00-idnty-state-v2__process-copy">
                <p className="site00-idnty-state-v2__process-label">{step.label}</p>
                <p className="site00-idnty-state-v2__process-desc">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
