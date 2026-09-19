/**
 * P0.CBI.1 — Founder-facing Brand Context surface.
 */

import type { BrandCreativeContext } from '../../../../../shared/site00-brand-lore/brandCreativeContext/types.js';
import type { GenerationGateResult } from '../../../../../shared/site00-brand-lore/brandCreativeContext/readiness.js';

type Props = {
  context: BrandCreativeContext | null;
  gate: GenerationGateResult;
  loading?: boolean;
  onViewContext?: () => void;
  onBuildContext?: () => void;
  onRefresh?: () => void;
  viewOpen?: boolean;
  onCloseView?: () => void;
};

function StatusChip({ label, ok, partial }: { label: string; ok: boolean; partial?: boolean }) {
  const cls = ok ? 'ok' : partial ? 'partial' : 'missing';
  return (
    <span className={`site00-brand-context__chip site00-brand-context__chip--${cls}`}>
      {label} {ok ? '✓' : partial ? 'PARTIAL' : '—'}
    </span>
  );
}

function ContextSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="site00-brand-context__section">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function BrandCreativeContextPanel({
  context,
  gate,
  loading,
  onViewContext,
  onBuildContext,
  onRefresh,
  viewOpen,
  onCloseView,
}: Props) {
  if (loading) {
    return (
      <div className="site00-brand-context site00-brand-context--loading">
        <p>Loading brand context…</p>
      </div>
    );
  }

  const readiness = gate.readiness;
  const overall = readiness?.overall ?? 'MISSING_CRITICAL';
  const statusLabel =
    overall === 'READY'
      ? 'READY'
      : overall === 'PARTIAL'
        ? 'PARTIAL'
        : overall === 'CONFLICTED'
          ? 'CONFLICTED'
          : 'NEEDS CONTEXT';

  const dims = readiness?.dimensions;

  return (
    <>
      <div className={`site00-brand-context site00-brand-context--${overall.toLowerCase()}`}>
        <div className="site00-brand-context__header">
          <div>
            <p className="site00-brand-context__eyebrow">BRAND CONTEXT · P0.CBI.1</p>
            <h2 className="site00-brand-context__brand">{context?.brandName ?? 'UNKNOWN BRAND'}</h2>
            <p className="site00-brand-context__status">
              CONTEXT <strong>{statusLabel}</strong>
              {context?.version ? ` · v${context.version}` : ''}
            </p>
          </div>
          <div className="site00-brand-context__chips">
            <StatusChip label="IDENTITY" ok={dims?.identity.status === 'READY'} partial={dims?.identity.status === 'PARTIAL'} />
            <StatusChip label="PRODUCTS" ok={dims?.offer.status === 'READY'} partial={dims?.offer.status === 'PARTIAL'} />
            <StatusChip label="AUDIENCE" ok={dims?.audience.status === 'READY'} partial={dims?.audience.status === 'PARTIAL'} />
            <StatusChip label="VISUAL WORLD" ok={dims?.visual.status === 'READY'} partial={dims?.visual.status === 'PARTIAL'} />
            <StatusChip label="VOICE" ok={dims?.voice.status === 'READY'} partial={dims?.voice.status === 'PARTIAL'} />
            <StatusChip
              label="CREATIVE HISTORY"
              ok={dims?.creativeHistory.status === 'READY'}
              partial={dims?.creativeHistory.status === 'PARTIAL'}
            />
          </div>
        </div>

        {gate.message && !gate.allowed && (
          <div className="site00-brand-context__alert site00-brand-context__alert--block">
            <p>{gate.message}</p>
            {gate.showIntake && (
              <button type="button" className="site00-brand-context__btn site00-brand-context__btn--primary" onClick={onBuildContext}>
                BUILD CONTEXT
              </button>
            )}
          </div>
        )}

        {gate.showPartialWarning && (
          <div className="site00-brand-context__alert site00-brand-context__alert--warn">
            <p>{gate.message}</p>
            <p className="site00-brand-context__hint">Missing data will not cause false brand claims.</p>
          </div>
        )}

        {context?.contextUpdateAvailable && (
          <div className="site00-brand-context__alert site00-brand-context__alert--info">
            <p>BRAND CONTEXT UPDATE AVAILABLE</p>
            <button type="button" className="site00-brand-context__btn" onClick={onRefresh}>
              REFRESH BRAND CONTEXT
            </button>
          </div>
        )}

        <div className="site00-brand-context__actions">
          <button type="button" className="site00-brand-context__btn site00-brand-context__btn--secondary" onClick={onViewContext}>
            VIEW CONTEXT
          </button>
        </div>
      </div>

      {viewOpen && context && (
        <div className="site00-brand-context-drawer" role="dialog" aria-label="Brand context details">
          <header className="site00-brand-context-drawer__header">
            <h2>{context.brandName} — Brand Context</h2>
            <button type="button" onClick={onCloseView} aria-label="Close">
              ✕
            </button>
          </header>
          <div className="site00-brand-context-drawer__body">
            <ContextSection title="WHO WE ARE" items={[
              context.category.value,
              context.positioning.value,
              context.brandPromise.value,
              context.differentiation.value,
            ].filter(Boolean) as string[]} />
            <ContextSection title="WHO IT'S FOR" items={[
              context.audience.primary.isUnknown ? 'UNKNOWN' : context.audience.primary.value,
              context.audience.secondary.value,
            ].filter(Boolean) as string[]} />
            <ContextSection title="WHAT WE SELL" items={[
              ...(context.productsServices.value ?? []),
              ...context.offers.filter((o) => o.campaignEligible).map((o) => `${o.name} (${o.status})`),
            ]} />
            <ContextSection title="HOW IT LOOKS" items={[
              ...(context.visualIdentity.palette.value ?? []),
              ...(context.visualIdentity.recurringSignatures.value ?? []),
            ]} />
            <ContextSection title="HOW IT SOUNDS" items={context.toneVoice.preferredPatterns.value ?? []} />
            <ContextSection title="CREATIVE RANGE" items={context.experiencePrinciples.value ?? []} />
            <ContextSection title="NON-NEGOTIABLES" items={context.nonNegotiables.value ?? []} />
            {context.sourceRefs.length > 0 && (
              <section className="site00-brand-context__section">
                <h3>SOURCES</h3>
                <ul className="site00-brand-context__sources">
                  {context.sourceRefs.slice(0, 8).map((ref) => (
                    <li key={`${ref.sourceType}-${ref.sourceId}`}>
                      <span className="site00-brand-context__source-badge">{ref.sourceType.replace(/_/g, ' ')}</span>
                      {ref.sourceId.split('/').pop()}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
