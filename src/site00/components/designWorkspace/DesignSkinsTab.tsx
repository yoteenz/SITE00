/**
 * Design → SKINS — pixel-fidelity mobile + desktop authority layouts (P0.VR.6R3).
 */

import { DEFAULT_FIDELITY_SETTINGS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import { SCREEN_SLOT_PREFILL } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/screenSlotConfig.js';
import { SkinAuthorityFlow } from './skins/SkinAuthorityFlow.js';
import { DesignDwSectionIcon } from './DesignDwSectionIcon.js';
import { SKINS_SCREEN_SLOTS, useDesignSkinsState, type SkinsViewport } from './useDesignSkinsState.js';
import '../../styles/site00-design-skins-tab.css';

type Props = {
  projectId: string;
  onOpenScreen?: (screenType: string) => void;
  onMatchReference?: () => void;
};

function statusLabel(raw: string | undefined): string {
  return (raw ?? 'NOT STARTED').replace(/_/g, ' ');
}

export function DesignSkinsTab({ projectId, onOpenScreen, onMatchReference }: Props) {
  const state = useDesignSkinsState(projectId);
  const {
    families,
    activeFamily,
    activeFamilyKey,
    activeScreenType,
    setActiveScreenType,
    activeViewport,
    setActiveViewport,
    activeAuthority,
    authorityForActive,
    screenIndex,
    packCounts,
    loading,
    ingestionSlot,
    setIngestionSlot,
    reloadAuthorities,
    selectFamily,
    viewportStatusByFamily,
  } = state;

  const slotMeta = SKINS_SCREEN_SLOTS.find((s) => s.packScreenType === activeScreenType)!;
  const screenLabel = SCREEN_SLOT_PREFILL[activeScreenType]?.screenLabel ?? slotMeta.shortLabel;
  const screenStatus =
    viewportStatusByFamily[activeFamilyKey]?.[activeScreenType]?.[activeViewport] ??
    activeFamily?.screenPackStatus[activeScreenType] ??
    'NOT_STARTED';

  const openIngestion = (mode: 'add' | 'replace' | 'registered' = 'add') =>
    setIngestionSlot({ brandKey: activeFamilyKey, packScreenType: activeScreenType, mode });

  const ingestionMode = ingestionSlot?.mode ?? 'add';

  return (
    <section className="site00-dw-skins" data-design-tab="skins" data-project={projectId}>
      {ingestionSlot ? (
        <SkinAuthorityFlow
          open
          brandFamilySkinId={ingestionSlot.brandKey}
          packScreenType={ingestionSlot.packScreenType}
          projectId={projectId}
          brandName={activeFamily?.name ?? ingestionSlot.brandKey}
          screenNum={slotMeta.num}
          screenLabel={screenLabel.toUpperCase()}
          accentColor={activeFamily?.primaryColor}
          initialStep={
            ingestionMode === 'replace' ? 'replace' : ingestionMode === 'registered' ? 'registered' : 'add'
          }
          existingAuthority={activeAuthority ?? null}
          onClose={() => setIngestionSlot(null)}
          onComplete={() => {
            setIngestionSlot(null);
            void reloadAuthorities(ingestionSlot.brandKey);
          }}
        />
      ) : null}

      {/* Mobile authority layout */}
      <div className="site00-dw-skins__mobile">
        <header className="site00-dw-skins__section-head">
          <DesignDwSectionIcon iconId="eye" />
          <div>
            <h2>EXPERIENCE SKINS</h2>
            <p>CHOOSE A BRAND FAMILY. EXPLORE SCREENS. REBUILD THE EXPERIENCE.</p>
          </div>
        </header>

        <div className="site00-dw-skins__family-carousel" role="listbox" aria-label="Brand families">
          {families.map((family) => (
            <button
              key={family.brandKey}
              type="button"
              role="option"
              aria-selected={family.brandKey === activeFamilyKey}
              className={`site00-dw-skins__family-card${family.brandKey === activeFamilyKey ? ' is-active' : ''}`}
              onClick={() => selectFamily(family.brandKey)}
            >
              <span
                className="site00-dw-skins__family-thumb"
                style={{ background: family.primaryColor ?? '#333' }}
                aria-hidden
              />
              <span className="site00-dw-skins__family-name">{family.name.toUpperCase()}</span>
            </button>
          ))}
        </div>

        <div className="site00-dw-skins__pack-head">
          <strong>SCREEN PACK — {activeFamily?.name.toUpperCase() ?? '—'}</strong>
          <span>{packCounts.total} SCREENS</span>
        </div>

        <div className="site00-dw-skins__screen-grid">
          {SKINS_SCREEN_SLOTS.map((slot) => {
            const vpStatus =
              viewportStatusByFamily[activeFamilyKey]?.[slot.packScreenType]?.[activeViewport] ??
              activeFamily?.screenPackStatus[slot.packScreenType];
            const hasAuthority = Boolean(authorityForActive(slot.packScreenType, activeViewport));
            const isActive = slot.packScreenType === activeScreenType;
            return (
              <button
                key={slot.packScreenType}
                type="button"
                className={`site00-dw-skins__screen-tile${isActive ? ' is-active' : ''}${hasAuthority ? ' has-authority' : ''}`}
                onClick={() => setActiveScreenType(slot.packScreenType)}
              >
                <span className="site00-dw-skins__screen-num">{slot.num}</span>
                <span className="site00-dw-skins__screen-label">{slot.shortLabel}</span>
                {hasAuthority ? <span className="site00-dw-skins__screen-check" aria-hidden>✓</span> : null}
                <span className="site00-dw-skins__screen-vp-status">{statusLabel(vpStatus)}</span>
              </button>
            );
          })}
        </div>

        <div className="site00-dw-skins__controls-row">
          <div className="site00-dw-skins__viewport-toggle" role="group" aria-label="Authority viewport">
            {(['MOBILE', 'DESKTOP'] as SkinsViewport[]).map((vp) => (
              <button
                key={vp}
                type="button"
                className={activeViewport === vp ? 'is-active' : ''}
                onClick={() => setActiveViewport(vp)}
              >
                {vp}
              </button>
            ))}
          </div>
          <div className="site00-dw-skins__status-group">
            <span>READY {packCounts.ready}/{packCounts.total}</span>
            <span>IN PROGRESS {packCounts.inProgress}/{packCounts.total}</span>
            <span>NOT STARTED {packCounts.notStarted}/{packCounts.total}</span>
          </div>
        </div>

        <article className="site00-dw-skins__preview-card">
          <div className="site00-dw-skins__preview-visual">
            <div
              className="site00-dw-skins__preview-thumb"
              style={{ background: activeFamily?.primaryColor ? `${activeFamily.primaryColor}33` : '#eee' }}
            >
              {activeAuthority?.referenceAssetId ? (
                <span className="site00-dw-skins__preview-has-ref">AUTHORITY</span>
              ) : (
                <span className="site00-dw-skins__preview-empty">NO AUTHORITY</span>
              )}
            </div>
          </div>
          <div className="site00-dw-skins__preview-meta">
            <span className="site00-dw-skins__preview-eyebrow">
              {slotMeta.num} | {activeFamily?.name.toUpperCase()}
            </span>
            <h3>{screenLabel}</h3>
            <p>{activeFamily?.tagline ?? ''}</p>
            <span className="site00-dw-skins__preview-status">{statusLabel(screenStatus)}</span>
            <div className="site00-dw-skins__preview-actions">
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                onClick={() => onOpenScreen?.(activeScreenType)}
              >
                OPEN SCREEN →
              </button>
              {activeAuthority ? (
                <>
                  <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => openIngestion('registered')}>
                    VIEW / REPLACE AUTHORITY
                  </button>
                </>
              ) : (
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => openIngestion('add')}>
                  + ADD AUTHORITY
                </button>
              )}
            </div>
            <div className="site00-dw-skins__pagination">
              {SKINS_SCREEN_SLOTS.map((s, i) => (
                <span key={s.packScreenType} className={i === screenIndex ? 'is-active' : ''} aria-hidden />
              ))}
              <span>
                {screenIndex + 1} / {packCounts.total}
              </span>
            </div>
          </div>
        </article>
      </div>

      {/* Desktop authority layout */}
      <div className="site00-dw-skins__desktop">
        <header className="site00-dw-skins__desktop-summary">
          <div className="site00-dw-skins__summary-family">
            <span
              className="site00-dw-skins__summary-thumb"
              style={{ background: activeFamily?.primaryColor ?? '#333' }}
            />
            <div>
              <strong>{activeFamily?.name.toUpperCase()}</strong>
              <em>{activeFamily?.tagline}</em>
            </div>
          </div>
          <dl className="site00-dw-skins__summary-metrics">
            <div>
              <dt>TOTAL SCREENS</dt>
              <dd>{packCounts.total}</dd>
            </div>
            <div>
              <dt>MOBILE</dt>
              <dd>{statusLabel(viewportStatusByFamily[activeFamilyKey]?.[activeScreenType]?.MOBILE)}</dd>
            </div>
            <div>
              <dt>DESKTOP</dt>
              <dd>{statusLabel(viewportStatusByFamily[activeFamilyKey]?.[activeScreenType]?.DESKTOP)}</dd>
            </div>
            <div>
              <dt>VERSION</dt>
              <dd>V{activeFamily?.version ?? '—'}</dd>
            </div>
          </dl>
        </header>

        <div className="site00-dw-skins__desktop-workspace">
          <aside className="site00-dw-skins__family-rail" aria-label="Brand families">
            {families.map((family) => (
              <button
                key={family.brandKey}
                type="button"
                className={`site00-dw-skins__rail-item${family.brandKey === activeFamilyKey ? ' is-active' : ''}`}
                onClick={() => selectFamily(family.brandKey)}
              >
                <span className="site00-dw-skins__rail-thumb" style={{ background: family.primaryColor ?? '#333' }} />
                <span className="site00-dw-skins__rail-text">
                  <strong>{family.name.toUpperCase()}</strong>
                  <em>{family.tagline}</em>
                </span>
                <span className="site00-dw-skins__rail-chev" aria-hidden>›</span>
              </button>
            ))}
          </aside>

          <div className="site00-dw-skins__pack-center">
            <div className="site00-dw-skins__pack-head">
              <strong>SCREEN PACK — {activeFamily?.name.toUpperCase()}</strong>
              <span>{packCounts.total} SCREENS</span>
            </div>
            <div className="site00-dw-skins__screen-grid site00-dw-skins__screen-grid--desktop">
              {SKINS_SCREEN_SLOTS.map((slot) => {
                const hasAuthority = Boolean(authorityForActive(slot.packScreenType, activeViewport));
                return (
                  <button
                    key={slot.packScreenType}
                    type="button"
                    className={`site00-dw-skins__screen-tile site00-dw-skins__screen-tile--desktop${slot.packScreenType === activeScreenType ? ' is-active' : ''}${hasAuthority ? ' has-authority' : ''}`}
                    onClick={() => setActiveScreenType(slot.packScreenType)}
                  >
                    <span className="site00-dw-skins__screen-num">{slot.num}</span>
                    <span className="site00-dw-skins__screen-label">{slot.shortLabel}</span>
                    <span
                      className="site00-dw-skins__tile-preview"
                      style={{ background: activeFamily?.primaryColor ? `${activeFamily.primaryColor}22` : '#f5f5f5' }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="site00-dw-skins__preview-panel">
            <div className="site00-dw-skins__preview-panel-head">
              <span>
                {slotMeta.num} / {packCounts.total}
              </span>
            </div>
            <div
              className="site00-dw-skins__preview-panel-visual"
              style={{ background: activeFamily?.primaryColor ? `${activeFamily.primaryColor}22` : '#f5f5f5' }}
            >
              {activeAuthority ? <span>AUTHORITY PREVIEW</span> : <span>STRUCTURED EMPTY STATE</span>}
            </div>
            <div className="site00-dw-skins__viewport-toggle site00-dw-skins__viewport-toggle--panel" role="group">
              {(['MOBILE', 'DESKTOP'] as SkinsViewport[]).map((vp) => (
                <button
                  key={vp}
                  type="button"
                  className={activeViewport === vp ? 'is-active' : ''}
                  onClick={() => setActiveViewport(vp)}
                >
                  {vp}
                </button>
              ))}
            </div>
            <p className="site00-dw-skins__preview-panel-status">STATUS · {statusLabel(screenStatus)}</p>
            <div className="site00-dw-skins__preview-panel-actions">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={() => onOpenScreen?.(activeScreenType)}>
                OPEN SCREEN →
              </button>
              {activeAuthority ? (
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => openIngestion('replace')}>
                  REPLACE AUTHORITY
                </button>
              ) : (
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => openIngestion('add')}>
                  ADD AUTHORITY
                </button>
              )}
            </div>
          </aside>
        </div>

        <footer className="site00-dw-skins__bottom-strip">
          <div className="site00-dw-skins__fidelity">
            <span>DEFAULT AUTHORITY · {DEFAULT_FIDELITY_SETTINGS.defaultAuthorityMode.replace(/_/g, ' ')}</span>
            <span>DEFAULT FIDELITY · {DEFAULT_FIDELITY_SETTINGS.defaultFidelityMode}</span>
            <span>MAX AUTO CORRECTION · {DEFAULT_FIDELITY_SETTINGS.maxAutoCorrectionPasses}</span>
            <span>REQUIRE OVERLAY QA · {DEFAULT_FIDELITY_SETTINGS.requireOverlayQa ? 'ON' : 'OFF'}</span>
            <span>REQUIRE FOUNDER APPROVAL · ON</span>
          </div>
          <div className="site00-dw-skins__quick-actions">
            {onMatchReference ? (
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onMatchReference}>
                MATCH REFERENCE
              </button>
            ) : null}
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
              TEST PIPELINE
            </button>
          </div>
        </footer>
      </div>

      {loading ? <p className="site00-dw-skins__loading">LOADING SKINS…</p> : null}
    </section>
  );
}
