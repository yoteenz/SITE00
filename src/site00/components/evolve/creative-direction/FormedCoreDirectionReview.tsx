import { useState, type ReactNode } from 'react';
import type { FormedCoreDirection, VisualProofPlan } from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import {
  buildFounderDirectionPresentationFields,
  type FounderDirectionFieldKey,
} from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionFieldContract.js';

export type FormedDirectionReviewProps = {
  directions: FormedCoreDirection[];
  visualProofPlans?: VisualProofPlan[];
  brandLoreProfileVersion?: number;
  formationVersion?: number;
  status?: string;
  visualProductionState?: string;
};

const PRIMARY_KEYS = new Set<FounderDirectionFieldKey>([
  'bigIdea',
  'thesis',
  'brandConnection',
  'centralMetaphor',
  'governingBehavior',
  'primaryArtifact',
]);

const VISUAL_LANGUAGE_KEYS = new Set<FounderDirectionFieldKey>([
  'materialLanguage',
  'imageryLanguage',
  'typographicAttitude',
  'colorLogic',
]);

function renderFieldValue(value: string | string[]): ReactNode {
  if (Array.isArray(value)) {
    return (
      <ul className="site00-cd__formed-list">
        {value.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    );
  }
  return value;
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="site00-cd__formed-collapsible">
      <button
        type="button"
        className="site00-cd__formed-collapsible-trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="site00-cd__formed-collapsible-body">{children}</div> : null}
    </div>
  );
}

function ProofSlot({ label, state }: { label: string; state?: 'planned' | 'generating' | 'ready' | 'blocked' }) {
  const status = state ?? 'planned';
  return (
    <figure className={`site00-cd__proof-slot site00-cd__proof-slot--${status}`}>
      <figcaption>{label}</figcaption>
      <div className="site00-cd__proof-slot-frame" aria-hidden={status === 'planned'}>
        {status === 'ready' ? 'PROOF READY' : status === 'generating' ? 'GENERATING…' : 'STAGED FOR PRODUCTION'}
      </div>
    </figure>
  );
}

export function FormedCoreDirectionReview({
  directions,
  visualProofPlans = [],
  brandLoreProfileVersion,
  formationVersion,
  status,
  visualProductionState,
}: FormedDirectionReviewProps) {
  if (!directions.length) return null;

  const planByDirection = new Map(visualProofPlans.map((p) => [p.directionId, p]));
  const productionLabel = visualProductionState ?? status?.replace(/_/g, ' ') ?? 'FORMING DIRECTIONS';

  return (
    <section className="site00-cd__formed-formation" aria-labelledby="cd-formed-formation">
      <header className="site00-cd__formed-head">
        <p className="site00-cd__formed-kicker">NEW FORMATION</p>
        <h2 id="cd-formed-formation" className="site00-cd__section-title">
          FORMED FROM YOUR BRAND INTELLIGENCE
        </h2>
        <p className="site00-cd__formed-meta">
          {brandLoreProfileVersion != null ? `BRAND LORE VERSION ${brandLoreProfileVersion}` : null}
          {formationVersion != null ? ` · FORMATION VERSION ${formationVersion}` : null}
          {status ? ` · ${status.replace(/_/g, ' ')}` : null}
        </p>
        <p className="site00-cd__formed-production-state" role="status">
          {productionLabel}
        </p>
      </header>

      <div className="site00-cd__formed-grid">
        {directions.map((direction, index) => {
          const plan = planByDirection.get(direction.directionId);
          const fields = buildFounderDirectionPresentationFields(direction);
          const primaryFields = fields.filter((f) => PRIMARY_KEYS.has(f.key));
          const visualLanguageFields = fields.filter((f) => VISUAL_LANGUAGE_KEYS.has(f.key));
          const secondaryFields = fields.filter(
            (f) => !PRIMARY_KEYS.has(f.key) && !VISUAL_LANGUAGE_KEYS.has(f.key),
          );
          const proofState = plan ? 'planned' : status === 'READY_FOR_VISUAL_PRODUCTION' ? 'planned' : 'blocked';

          return (
            <article key={direction.directionId} className="site00-cd__formed-card">
              <p className="site00-cd__formed-index">DIRECTION 0{index + 1}</p>
              <h3 className="site00-cd__formed-name">{direction.directionName}</h3>

              <div className="site00-cd__formed-primary">
                {primaryFields.map((field) => (
                  <div key={field.key} className="site00-cd__formed-field">
                    <p className="site00-cd__formed-field-label">{field.label}</p>
                    <div className={`site00-cd__formed-field-value${field.missing ? ' site00-cd__formed-field-value--missing' : ''}`}>
                      {renderFieldValue(field.value)}
                    </div>
                  </div>
                ))}
              </div>

              <ProofSlot label="HERO WORLD" state={proofState} />

              {visualLanguageFields.length ? (
                <CollapsibleSection title="VISUAL LANGUAGE" defaultOpen={false}>
                  <dl className="site00-cd__formed-fields site00-cd__formed-fields--compact">
                    {visualLanguageFields.map((field) => (
                      <div key={field.key}>
                        <dt>{field.label}</dt>
                        <dd>{renderFieldValue(field.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CollapsibleSection>
              ) : null}

              {secondaryFields.some((f) => f.key === 'socialExpressionHypothesis') ? (
                <ProofSlot label="SOCIAL EXPRESSION PROOF" state={proofState} />
              ) : null}

              {secondaryFields.some((f) => f.key === 'motionSeed') ? (
                <ProofSlot label="MOTION SEED PROOF" state={proofState} />
              ) : null}

              {secondaryFields.length ? (
                <CollapsibleSection title="LINEAGE · RISKS · DETAIL" defaultOpen={false}>
                  <dl className="site00-cd__formed-fields site00-cd__formed-fields--compact">
                    {secondaryFields.map((field) => (
                      <div key={field.key}>
                        <dt>{field.label}</dt>
                        <dd>{renderFieldValue(field.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CollapsibleSection>
              ) : null}

              {plan ? (
                <p className="site00-cd__formed-proof">VISUAL PROOF PLAN · STAGE A · {plan.heroWorld.mediumRecommendation.replace(/_/g, ' ')}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
