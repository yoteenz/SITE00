import { useState, type ReactNode } from 'react';
import type {
  ComparisonDirectionCandidate,
  ComparisonProofAsset,
  ComparisonProofType,
  FormedCoreDirection,
  VisualProofPlan,
} from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import type { CreativeDirectionBoard } from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeDirectionBoardTypes.js';
import { CreativeDirectionBoardView } from './CreativeDirectionBoardView';
import { MARKED_UP_COPY_DIRECTION_NAME } from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeDirectionBoardTypes.js';
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
  proofAssetsByDirection?: Record<string, Partial<Record<ComparisonProofType, ComparisonProofAsset>>>;
  creativeDirectionBoardsByDirection?: Record<string, CreativeDirectionBoard>;
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

function ProofSlot({
  label,
  asset,
  fallbackState,
}: {
  label: string;
  asset?: ComparisonProofAsset;
  fallbackState?: 'planned' | 'generating' | 'ready' | 'blocked' | 'failed' | 'needs_review';
}) {
  const state = asset?.productionState
    ? asset.productionState === 'READY'
      ? 'ready'
      : asset.productionState === 'GENERATING' || asset.productionState === 'INSPECTING' || asset.productionState === 'REGENERATING'
        ? 'generating'
        : asset.productionState === 'FAILED'
          ? 'failed'
          : asset.productionState === 'NEEDS_REVIEW'
            ? 'needs_review'
            : 'planned'
    : (fallbackState ?? 'planned');

  const statusLabel =
    state === 'ready'
      ? 'READY'
      : state === 'generating'
        ? 'GENERATING…'
        : state === 'failed'
          ? 'FAILED'
          : state === 'needs_review'
            ? 'NEEDS REVIEW'
            : 'STAGED FOR PRODUCTION';

  return (
    <figure className={`site00-cd__proof-slot site00-cd__proof-slot--${state}`}>
      <figcaption>{label}</figcaption>
      <div className="site00-cd__proof-slot-frame">
        {asset?.url && state === 'ready' ? (
          <img
            src={asset.url}
            alt={`${label} — ${asset.directionName}`}
            className="site00-cd__proof-slot-image"
            loading="lazy"
          />
        ) : (
          <span className="site00-cd__proof-slot-status">{statusLabel}</span>
        )}
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
  proofAssetsByDirection = {},
  creativeDirectionBoardsByDirection = {},
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
          const directionProofs = proofAssetsByDirection[direction.directionId] ?? {};
          const creativeBoard = creativeDirectionBoardsByDirection[direction.directionId];
          const isMarkedUpCopyBoard =
            direction.directionName === MARKED_UP_COPY_DIRECTION_NAME &&
            creativeBoard &&
            (creativeBoard.presentationMode === 'BOARD_PRODUCTION' ||
              creativeBoard.presentationMode === 'BOARD_READY' ||
              creativeBoard.boardPlanVersion.includes('pilot-v2'));
          const showBoardFirst =
            isMarkedUpCopyBoard &&
            creativeBoard?.founderVisible &&
            creativeBoard.productionState === 'READY';
          const showBoardRefining = Boolean(isMarkedUpCopyBoard && !showBoardFirst);

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

              {showBoardFirst && creativeBoard ? (
                <CreativeDirectionBoardView board={creativeBoard} defaultBreakpoint="mobile" />
              ) : null}

              {showBoardRefining && creativeBoard ? (
                <p className="site00-cd__formed-proof site00-cd__formed-proof--refining">
                  CREATIVE BOARD REFINING — {creativeBoard.productionState.replace(/_/g, ' ')}
                  {creativeBoard.qaScoreReport?.result
                    ? ` · QA ${creativeBoard.qaScoreReport.result}`
                    : ''}
                </p>
              ) : null}

              {!showBoardFirst && !showBoardRefining ? (
                <>
                  <ProofSlot
                    label="HERO WORLD"
                    asset={directionProofs.heroWorld}
                    fallbackState={directionProofs.heroWorld ? undefined : proofState}
                  />
                  <ProofSlot
                    label="PRIMARY ARTIFACT"
                    asset={directionProofs.primaryArtifact}
                    fallbackState={directionProofs.primaryArtifact ? undefined : proofState}
                  />
                </>
              ) : null}

              {showBoardFirst ? (
                <CollapsibleSection title="VIEW DETAILS" defaultOpen={false}>
                  <ProofSlot label="HERO WORLD" asset={directionProofs.heroWorld} fallbackState={proofState} />
                  <ProofSlot label="PRIMARY ARTIFACT" asset={directionProofs.primaryArtifact} fallbackState={proofState} />
                  <ProofSlot label="SOCIAL EXPRESSION PROOF" asset={directionProofs.socialExpression} fallbackState={proofState} />
                  <ProofSlot label="MOTION SEED PROOF" asset={directionProofs.motionSeed} fallbackState={proofState} />
                </CollapsibleSection>
              ) : (
                <>
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

                  <ProofSlot
                    label="SOCIAL EXPRESSION PROOF"
                    asset={directionProofs.socialExpression}
                    fallbackState={directionProofs.socialExpression ? undefined : proofState}
                  />
                  <ProofSlot
                    label="MOTION SEED PROOF"
                    asset={directionProofs.motionSeed}
                    fallbackState={directionProofs.motionSeed ? undefined : proofState}
                  />
                </>
              )}

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
