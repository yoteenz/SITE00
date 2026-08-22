import { useState, type ReactNode } from 'react';
import type {
  ComparisonDirectionCandidate,
  FormedCoreDirection,
  VisualProofPlan,
} from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import {
  buildFounderDirectionPresentationFields,
  type FounderDirectionFieldKey,
} from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/directionFieldContract.js';

export type FormedDirectionReviewProps = {
  directions: FormedCoreDirection[] | ComparisonDirectionCandidate[];
  visualProofPlans?: VisualProofPlan[];
  brandLoreProfileVersion?: number;
  formationVersion?: number;
  status?: string;
  visualProductionState?: string;
  mode?: 'canonical' | 'comparison';
  directionCount?: number;
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

function isComparisonCandidate(
  direction: FormedCoreDirection | ComparisonDirectionCandidate,
): direction is ComparisonDirectionCandidate {
  return 'comparisonIndex' in direction && typeof direction.comparisonIndex === 'number';
}

export function FormedCoreDirectionReview({
  directions,
  visualProofPlans = [],
  brandLoreProfileVersion,
  formationVersion,
  status,
  visualProductionState,
  mode = 'canonical',
  directionCount,
}: FormedDirectionReviewProps) {
  if (!directions.length) return null;

  const isComparison = mode === 'comparison';
  const planByDirection = new Map(visualProofPlans.map((p) => [p.directionId, p]));
  const productionLabel = visualProductionState ?? status?.replace(/_/g, ' ') ?? 'FORMING DIRECTIONS';
  const gridClass = isComparison
    ? 'site00-cd__formed-grid site00-cd__formed-grid--comparison'
    : 'site00-cd__formed-grid';

  return (
    <section
      className={`site00-cd__formed-formation${isComparison ? ' site00-cd__formed-formation--comparison' : ''}`}
      aria-labelledby="cd-formed-formation"
    >
      <header className="site00-cd__formed-head">
        <p className="site00-cd__formed-kicker">
          {isComparison ? 'CORE DIRECTION COMPARISON' : 'NEW FORMATION'}
        </p>
        <h2 id="cd-formed-formation" className="site00-cd__section-title">
          {isComparison
            ? `${directionCount ?? directions.length} DIRECTIONS FOR FOUNDER REVIEW`
            : 'FORMED FROM YOUR BRAND INTELLIGENCE'}
        </h2>
        {!isComparison ? (
          <p className="site00-cd__formed-meta">
            {brandLoreProfileVersion != null ? `BRAND LORE VERSION ${brandLoreProfileVersion}` : null}
            {formationVersion != null ? ` · FORMATION VERSION ${formationVersion}` : null}
            {status ? ` · ${status.replace(/_/g, ' ')}` : null}
          </p>
        ) : (
          <p className="site00-cd__formed-meta">
            {brandLoreProfileVersion != null ? `BRAND LORE VERSION ${brandLoreProfileVersion}` : null}
            {brandLoreProfileVersion != null ? ` · FINGERPRINT ON FILE` : null}
          </p>
        )}
        <p className="site00-cd__formed-production-state" role="status">
          {productionLabel}
        </p>
      </header>

      <div className={gridClass}>
        {directions.map((direction, index) => {
          const comparisonIndex = isComparisonCandidate(direction)
            ? direction.comparisonIndex
            : index + 1;
          const displayIndex = String(comparisonIndex).padStart(2, '0');
          const plan = planByDirection.get(direction.directionId);
          const fields = buildFounderDirectionPresentationFields(direction);
          const primaryFields = fields.filter((f) => PRIMARY_KEYS.has(f.key));
          const visualLanguageFields = fields.filter((f) => VISUAL_LANGUAGE_KEYS.has(f.key));
          const secondaryFields = fields.filter(
            (f) => !PRIMARY_KEYS.has(f.key) && !VISUAL_LANGUAGE_KEYS.has(f.key),
          );
          const proofState = plan ? 'planned' : status === 'READY_FOR_VISUAL_PRODUCTION' ? 'planned' : 'blocked';

          return (
            <article key={`${direction.directionId}-${comparisonIndex}`} className="site00-cd__formed-card">
              <p className="site00-cd__formed-index">DIRECTION {displayIndex}</p>
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
              <ProofSlot label="PRIMARY ARTIFACT" state={proofState} />

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

              <ProofSlot label="SOCIAL EXPRESSION PROOF" state={proofState} />
              <ProofSlot label="MOTION SEED PROOF" state={proofState} />

              {secondaryFields.length || isComparisonCandidate(direction) ? (
                <CollapsibleSection title="LINEAGE · RISKS · DETAIL" defaultOpen={false}>
                  {isComparisonCandidate(direction) ? (
                    <dl className="site00-cd__formed-fields site00-cd__formed-fields--compact site00-cd__formed-lineage">
                      <div>
                        <dt>SOURCE FORMATION</dt>
                        <dd>
                          v{direction.sourceFormationVersion} · {direction.sourceFormationId.slice(0, 8)}
                        </dd>
                      </div>
                      <div>
                        <dt>SOURCE DIRECTION INDEX</dt>
                        <dd>0{direction.sourceDirectionIndex} within formation v{direction.sourceFormationVersion}</dd>
                      </div>
                    </dl>
                  ) : null}
                  {secondaryFields.length ? (
                    <dl className="site00-cd__formed-fields site00-cd__formed-fields--compact">
                      {secondaryFields.map((field) => (
                        <div key={field.key}>
                          <dt>{field.label}</dt>
                          <dd>{renderFieldValue(field.value)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </CollapsibleSection>
              ) : null}

              {plan ? (
                <p className="site00-cd__formed-proof">
                  VISUAL PROOF PLAN · STAGE A · {plan.heroWorld.mediumRecommendation.replace(/_/g, ' ')}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
